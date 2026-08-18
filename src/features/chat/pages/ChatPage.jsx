import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  CircleStop,
  Crosshair,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Mic,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { ErrorState as UserErrorState } from "../../../shared/components/AsyncStates";
import {
  chatKeys,
  endChatSession,
  getChatSession,
  getChatSessions,
  sendChatMessage,
  startChatSession,
} from "../api/chatApi";
import { ChatMessageBubble } from "../components/ChatMessageBubble";
import { ChatReplyResults } from "../components/ChatReplyResults";
import { quickPrompts } from "../utils/chatFormatters";

const CHAT_HERO_BACKGROUND = "/assets/app/home/hero_search.png";
const CHAT_HERO_IMAGE = "/assets/app/home/ai.png";

export function ChatPage() {
  const client = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState(null);
  const [lastReply, setLastReply] = useState(null);
  const [locating, setLocating] = useState(false);

  const bottomRef = useRef(null);

  const sessions = useQuery({
    queryKey: chatKeys.sessions,
    queryFn: () => getChatSessions(50),
  });

  const session = useQuery({
    queryKey: chatKeys.session(activeSessionId),
    queryFn: () => getChatSession(activeSessionId),
    enabled: Boolean(activeSessionId),
    retry: false,
  });

  const create = useMutation({
    mutationFn: () => startChatSession(null),

    onSuccess: async (data) => {
      client.setQueryData(chatKeys.session(data.sessionId), data);
      setActiveSessionId(data.sessionId);
      setLastReply(null);
      setNotice(null);

      await client.invalidateQueries({
        queryKey: chatKeys.sessions,
      });
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const send = useMutation({
    mutationFn: ({ text, location }) =>
      sendChatMessage(activeSessionId, {
        message: text,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        radiusInMeters: 5000,
        take: 5,
        source: location ? "BrowserGps" : null,
      }),

    onSuccess: async (reply) => {
      client.setQueryData(chatKeys.session(activeSessionId), (old) =>
        old
          ? {
              ...old,
              isEnded: reply.sessionEnded,
              endedAtUtc: reply.sessionEnded
                ? new Date().toISOString()
                : old.endedAtUtc,
              lastActivityAtUtc: new Date().toISOString(),
              messages: [...old.messages, ...reply.newMessages],
            }
          : old,
      );

      setLastReply(reply);
      setMessage("");
      setNotice(null);

      await client.invalidateQueries({
        queryKey: chatKeys.sessions,
      });
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const end = useMutation({
    mutationFn: () => endChatSession(activeSessionId),

    onSuccess: async (data) => {
      client.setQueryData(chatKeys.session(activeSessionId), data);
      setLastReply(null);

      setNotice({
        ok: true,
        text: "تم إنهاء المحادثة. يمكنك الرجوع إليها للقراءة أو بدء محادثة جديدة.",
      });

      await client.invalidateQueries({
        queryKey: chatKeys.sessions,
      });
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const messagesCount = session.data?.messages?.length || 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messagesCount, lastReply]);

  const submitText = (text) => {
    const normalized = text.trim();

    if (
      normalized.length < 2 ||
      !activeSessionId ||
      session.data?.isEnded ||
      send.isPending
    ) {
      return;
    }

    setLastReply(null);

    send.mutate({
      text: normalized,
    });
  };

  const submit = (event) => {
    event.preventDefault();
    submitText(message);
  };

  const sendLocation = () => {
    if (!navigator.geolocation) {
      setNotice({
        ok: false,
        text: "تحديد الموقع غير مدعوم في هذا المتصفح.",
      });
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setLastReply(null);

        send.mutate({
          text: "استخدم موقعي الحالي",
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        });
      },

      () => {
        setLocating(false);

        setNotice({
          ok: false,
          text: "لم نتمكن من قراءة موقعك. اسمح للمتصفح بالوصول إلى الموقع ثم أعد المحاولة.",
        });
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
      },
    );
  };

  const selectSession = (id) => {
    setActiveSessionId(id);
    setLastReply(null);
    setNotice(null);
  };

  return (
    <div
      dir="rtl"
      className="w-full bg-[#F7F9FA] text-[#333333]"
      style={{
        marginTop: "-24px",
        marginBottom: "-24px",
      }}
    >
      {/* =====================================================
          HERO — مطابق لفكرة Figma
      ====================================================== */}
      <section
        className="relative isolate overflow-hidden bg-[#0D7586] text-white"
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={CHAT_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 -z-20 h-full w-full select-none object-cover object-center"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,57,68,.18),rgba(0,104,120,.42),rgba(0,58,70,.28))]"
        />

        <div className="mx-auto flex min-h-[260px] w-full max-w-[1440px] flex-col items-center justify-center px-6 py-8 text-center">
          <h1 className="text-[30px] font-bold leading-tight sm:text-[34px]">
            المساعد الذكي
          </h1>

          <p className="mt-3 max-w-[650px] text-[13px] leading-7 text-white/75">
            تحدث مع مساعدك الذكي للحصول على إجابات فورية على استفساراتك الصحية.
          </p>

          <img
            src={CHAT_HERO_IMAGE}
            alt="المساعد الذكي"
            className="mt-4 h-[92px] w-[110px] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,.16)]"
          />
        </div>
      </section>

      {notice ? (
        <div className="mx-auto mt-5 w-full max-w-[1440px] px-5 sm:px-7 lg:px-10">
          <div
            className={`rounded-[10px] border px-4 py-3 text-[12px] font-semibold ${
              notice.ok
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
          >
            {notice.text}
          </div>
        </div>
      ) : null}

      {/* =====================================================
          BODY
      ====================================================== */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-9 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid items-stretch gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* RIGHT: previous conversations */}
          <aside
            className="
              order-1 flex min-h-[680px] flex-col
              rounded-[10px]
              border border-[#E1E7E9]
              bg-white
              px-4 py-5
            "
          >
            <div className="border-b border-[#EDF1F2] pb-4">
              <h2 className="text-[18px] font-bold text-[#216474]">
                محادثات سابقة
              </h2>
            </div>

            <div className="mt-2 flex-1 overflow-y-auto">
              {sessions.isLoading ? (
                <div className="grid min-h-[180px] place-items-center">
                  <LoaderCircle
                    size={24}
                    className="animate-spin text-[#216474]"
                  />
                </div>
              ) : sessions.isError ? (
                <p className="px-2 py-5 text-center text-[12px] text-rose-600">
                  تعذر تحميل المحادثات.
                </p>
              ) : sessions.data?.length ? (
                <div>
                  {sessions.data.slice(0, 5).map((item) => {
                    const id = item.sessionId ?? item.id ?? item.chatSessionId;

                    const title =
                      item.title || item.lastMessage || "محادثة سابقة";

                    const activityDate =
                      item.lastActivityAtUtc ||
                      item.updatedAtUtc ||
                      item.createdAtUtc;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => selectSession(id)}
                        className={`
                          flex w-full items-start gap-3
                          border-b border-[#EDF1F2]
                          px-2 py-4
                          text-right
                          transition
                          ${
                            activeSessionId === id
                              ? "bg-[#F3F9F9]"
                              : "hover:bg-[#FAFCFC]"
                          }
                        `}
                      >
                        <MessageCircle
                          size={18}
                          strokeWidth={1.6}
                          className="mt-0.5 shrink-0 text-[#216474]"
                        />

                        <span className="min-w-0 flex-1">
                          <strong className="line-clamp-2 block text-[13px] font-semibold leading-6 text-[#216474]">
                            {title}
                          </strong>

                          <small className="mt-1 block text-[10px] text-[#A0ACAF]">
                            {activityDate
                              ? new Date(activityDate).toLocaleString("ar-SY", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : "اليوم"}
                          </small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid min-h-[220px] place-items-center px-4 text-center">
                  <div>
                    <MessageCircle
                      size={25}
                      className="mx-auto text-[#AFC4C8]"
                    />

                    <p className="mt-3 text-[12px] text-[#8A9A9E]">
                      لا توجد محادثات سابقة بعد.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => create.mutate()}
              disabled={create.isPending}
              className="
                mt-4 flex min-h-[44px] w-full
                items-center justify-center gap-2
                rounded-[8px]
                border border-[#216474]
                bg-white
                px-4
                text-[13px] font-semibold
                text-[#216474]
                transition
                hover:bg-[#EEF6F6]
                disabled:opacity-50
              "
            >
              <MessageCircle size={16} />
              {create.isPending ? "جاري البدء..." : "بدء محادثة جديدة"}
            </button>
          </aside>

          {/* LEFT: chat */}
          <main
            className="
              order-2 flex min-h-[680px] flex-col
              overflow-hidden
              rounded-[10px]
              border border-[#E1E7E9]
              bg-white
            "
          >
            {!activeSessionId ? (
              <ChatWelcome
                onCreate={() => create.mutate()}
                creating={create.isPending}
              />
            ) : session.isLoading ? (
              <div className="grid flex-1 place-items-center">
                <LoaderCircle
                  className="animate-spin text-[#216474]"
                  size={30}
                />
              </div>
            ) : session.isError ? (
              <div className="m-5">
                <UserErrorState
                  message={getApiErrorMessage(session.error)}
                  onRetry={session.refetch}
                />
              </div>
            ) : (
              <>
                <header className="flex items-center justify-between gap-4 border-b border-[#EDF1F2] bg-white px-5 py-4">
                  <div className="min-w-0 text-right">
                    <h3 className="truncate text-[14px] font-bold text-[#29464D]">
                      {session.data.title || "المساعد الذكي"}
                    </h3>

                    <p className="mt-1 text-[10px] text-[#8A9A9E]">
                      {session.data.isEnded ? "محادثة منتهية" : "المحادثة نشطة"}
                    </p>
                  </div>

                  {!session.data.isEnded ? (
                    <button
                      type="button"
                      onClick={() => end.mutate()}
                      disabled={end.isPending}
                      className="inline-flex shrink-0 items-center gap-2 rounded-[8px] px-3 py-2 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <CircleStop size={15} />
                      {end.isPending ? "جاري الإنهاء..." : "إنهاء المحادثة"}
                    </button>
                  ) : null}
                </header>

                <div className="flex-1 space-y-5 overflow-y-auto bg-white p-5 sm:p-7">
                  {session.data.messages.map((item) => (
                    <div
                      key={item.messageId}
                      className="
                        [&_.bg-violet-50]:!bg-[#FFF7DF]
                        [&_.bg-violet-100]:!bg-[#FFF3D0]
                        [&_.bg-violet-600]:!bg-[#DFAE0D]
                        [&_.bg-violet-700]:!bg-[#DFAE0D]
                        [&_.text-violet-600]:!text-[#DFAE0D]
                        [&_.text-violet-700]:!text-[#DFAE0D]
                        [&_.border-violet-100]:!border-[#F1D58A]
                        [&_.border-violet-200]:!border-[#F1D58A]
                        [&_.ring-violet-100]:!ring-[#FFF3D0]
                      "
                    >
                      <ChatMessageBubble message={item} />
                    </div>
                  ))}

                  {send.isPending ? (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-[10px] bg-[#F3F8F8] px-4 py-3 text-[11px] font-semibold text-[#71858A]">
                        <LoaderCircle
                          size={14}
                          className="animate-spin text-[#DFAE0D]"
                        />
                        جاري تجهيز الرد...
                      </div>
                    </div>
                  ) : null}

                  <div
                    className="
                      [&_.bg-violet-50]:!bg-[#FFF7DF]
                      [&_.bg-violet-100]:!bg-[#FFF3D0]
                      [&_.bg-violet-600]:!bg-[#DFAE0D]
                      [&_.bg-violet-700]:!bg-[#DFAE0D]
                      [&_.text-violet-600]:!text-[#DFAE0D]
                      [&_.text-violet-700]:!text-[#DFAE0D]
                      [&_.border-violet-100]:!border-[#F1D58A]
                      [&_.border-violet-200]:!border-[#F1D58A]
                      [&_.ring-violet-100]:!ring-[#FFF3D0]
                    "
                  >
                    <ChatReplyResults reply={lastReply} onPrompt={submitText} />
                  </div>

                  <div ref={bottomRef} />
                </div>

                {session.data.isEnded ? (
                  <div className="border-t border-[#EDF1F2] bg-white p-4 text-center">
                    <p className="text-[12px] font-semibold text-[#71858A]">
                      انتهت هذه المحادثة ولا يمكن إضافة رسائل جديدة.
                    </p>

                    <button
                      type="button"
                      onClick={() => create.mutate()}
                      disabled={create.isPending}
                      className="mx-auto mt-3 inline-flex min-h-[42px] items-center gap-2 rounded-[8px] bg-[#216474] px-5 text-[12px] font-semibold text-white"
                    >
                      <MessageCircle size={15} />
                      بدء محادثة جديدة
                    </button>
                  </div>
                ) : (
                  <ChatComposer
                    message={message}
                    setMessage={setMessage}
                    onSubmit={submit}
                    onPrompt={submitText}
                    onLocation={sendLocation}
                    pending={send.isPending}
                    locating={locating}
                  />
                )}
              </>
            )}
          </main>
        </div>

        <div className="mt-4 flex items-start justify-center gap-2 text-center text-[10px] text-[#A0ACAF]">
          <ShieldAlert size={13} className="mt-0.5 shrink-0" />
          <p>تنبيه: المعلومات المقدمة لا تغني عن استشارة الطبيب أو الصيدلي.</p>
        </div>
      </section>
    </div>
  );
}

function ChatWelcome({ onCreate, creating }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
        <div className="w-full max-w-[720px]">
          <p className="text-[16px] font-semibold text-[#29464D]">مرحباً! 👋</p>

          <p className="mt-2 text-[11px] leading-6 text-[#A0ACAF]">
            أنا مساعدك الذكي في منصة دوائي.
            <br />
            اسألني عن أي دواء، جرعة، استخدام أو معلومات صحية وسأجيبك فوراً.
          </p>

          <div className="mt-5 flex flex-col items-center gap-2">
            {quickPrompts.slice(0, 4).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  if (!creating) onCreate();
                }}
                disabled={creating}
                className="
                  flex min-h-[46px] w-full max-w-[430px]
                  items-center justify-between
                  rounded-[8px]
                  bg-[#EFF8F8]
                  px-4
                  text-right
                  text-[11px] font-medium
                  text-[#60777C]
                  transition
                  hover:bg-[#E5F3F3]
                "
              >
                <span className="truncate">{prompt}</span>
                <span className="text-[#216474]">↵</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#EDF1F2] bg-white p-4">
        <button
          type="button"
          onClick={onCreate}
          disabled={creating}
          className="
            mx-auto flex min-h-[44px]
            items-center justify-center gap-2
            rounded-[8px]
            bg-[#216474]
            px-5
            text-[12px] font-semibold
            text-white
            transition hover:bg-[#174B57]
          "
        >
          <MessageCircle size={15} />
          {creating ? "جاري البدء..." : "ابدأ المحادثة"}
        </button>
      </div>
    </div>
  );
}

function ChatComposer({
  message,
  setMessage,
  onSubmit,
  onPrompt,
  onLocation,
  pending,
  locating,
}) {
  return (
    <div className="border-t border-[#EDF1F2] bg-white px-5 py-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {quickPrompts.slice(0, 4).map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            disabled={pending}
            className="shrink-0 rounded-full border border-[#DCE8EA] bg-[#EFF8F8] px-3 py-1.5 text-[10px] font-medium text-[#216474] transition hover:bg-[#E5F3F3]"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="
          flex items-center
          overflow-hidden
          rounded-[8px]
          border border-[#DCE5E7]
          bg-white
        "
      >
        <textarea
          className="
            min-h-[50px] flex-1 resize-none
            border-0 bg-white
            px-4 py-3
            text-[12px] text-[#29464D]
            outline-none
            placeholder:text-[#A0ACAF]
          "
          rows={1}
          maxLength={2000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit(event);
            }
          }}
          placeholder="اكتب سؤالك هنا..."
        />

        <button
          type="button"
          onClick={onLocation}
          disabled={pending || locating}
          className="grid size-10 shrink-0 place-items-center text-[#216474]"
          aria-label="إرسال موقعي الحالي"
          title="إرسال موقعي الحالي"
        >
          {locating ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Crosshair size={16} />
          )}
        </button>

        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center text-[#216474]"
          aria-label="إضافة صورة"
          title="إضافة صورة"
        >
          <ImagePlus size={16} />
        </button>

        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center text-[#216474]"
          aria-label="إدخال صوتي"
          title="إدخال صوتي"
        >
          <Mic size={16} />
        </button>

        <button
          type="submit"
          disabled={pending || message.trim().length < 2}
          className="
            grid h-[50px] w-[52px]
            shrink-0 place-items-center
            bg-[#216474] text-white
            transition
            hover:bg-[#174B57]
            disabled:opacity-50
          "
          aria-label="إرسال الرسالة"
        >
          <Send size={17} />
        </button>
      </form>

      <p className="mt-2 text-center text-[9.5px] text-[#A0ACAF]">
        تنبيه: المعلومات المقدمة لا تغني عن استشارة الطبيب أو الصيدلي
      </p>
    </div>
  );
}
