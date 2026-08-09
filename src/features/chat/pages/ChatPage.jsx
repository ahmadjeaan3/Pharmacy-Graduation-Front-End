import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  CircleStop,
  Crosshair,
  LoaderCircle,
  MessageCircle,
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
import { ChatSessionList } from "../components/ChatSessionList";
import { quickPrompts } from "../utils/chatFormatters";

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
      await client.invalidateQueries({ queryKey: chatKeys.sessions });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
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
      await client.invalidateQueries({ queryKey: chatKeys.sessions });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
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
      await client.invalidateQueries({ queryKey: chatKeys.sessions });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const messagesCount = session.data?.messages?.length || 0;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messagesCount, lastReply]);
  const submitText = (text) => {
    const normalized = text.trim();
    if (
      normalized.length < 2 ||
      !activeSessionId ||
      session.data?.isEnded ||
      send.isPending
    )
      return;
    setLastReply(null);
    send.mutate({ text: normalized });
  };
  const submit = (event) => {
    event.preventDefault();
    submitText(message);
  };
  const sendLocation = () => {
    if (!navigator.geolocation)
      return setNotice({
        ok: false,
        text: "تحديد الموقع غير مدعوم في هذا المتصفح.",
      });
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setLastReply(null);
        send.mutate({
          text: "استخدم موقعي الحالي",
          location: { latitude: coords.latitude, longitude: coords.longitude },
        });
      },
      () => {
        setLocating(false);
        setNotice({
          ok: false,
          text: "لم نتمكن من قراءة موقعك. اسمح للمتصفح بالوصول إلى الموقع ثم أعد المحاولة.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };
  return (
    <div className="space-y-5">
      <section className="relative isolate overflow-hidden rounded-[1.7rem] bg-[#174b57] px-6 py-6 text-white shadow-[0_20px_50px_rgba(23,75,87,.14)] lg:px-8">
        <div className="noise absolute inset-0 -z-10" />
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#f5cb72]">
            <Bot size={24} />
          </span>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#8bd0cb]">
              <Sparkles size={15} />
              مساعدك داخل المنصة
            </p>
            <h2 className="mt-1 text-3xl font-black">المساعد الدوائي</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
              يساعدك في البحث عن الأدوية والصيدليات القريبة والوصول إلى معلوماتك
              الصحية المسجلة.
            </p>
          </div>
        </div>
      </section>
      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <div className="grid min-h-0 gap-5 lg:grid-cols-[290px_1fr]">
        <ChatSessionList
          sessions={sessions.data}
          activeSessionId={activeSessionId}
          loading={sessions.isLoading}
          creating={create.isPending}
          onSelect={(id) => {
            setActiveSessionId(id);
            setLastReply(null);
            setNotice(null);
          }}
          onCreate={() => create.mutate()}
        />
        <main className="flex min-h-[620px] flex-col overflow-hidden rounded-[1.45rem] border border-[#174b57]/8 bg-[#f7faf9] lg:h-[calc(100vh-154px)]">
          {!activeSessionId ? (
            <ChatWelcome
              onCreate={() => create.mutate()}
              creating={create.isPending}
            />
          ) : session.isLoading ? (
            <div className="grid flex-1 place-items-center">
              <LoaderCircle
                className="animate-spin text-violet-700"
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
              <header className="flex items-center justify-between gap-4 border-b border-[#174b57]/8 bg-white px-5 py-4">
                <div className="min-w-0">
                  <h3 className="truncate font-black text-[#29464d]">
                    {session.data.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#829499]">
                    {session.data.isEnded ? "محادثة منتهية" : "المحادثة نشطة"}
                  </p>
                </div>
                {!session.data.isEnded && (
                  <button
                    type="button"
                    onClick={() => end.mutate()}
                    disabled={end.isPending}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50"
                  >
                    <CircleStop size={16} />
                    {end.isPending ? "جاري الإنهاء..." : "إنهاء المحادثة"}
                  </button>
                )}
              </header>
              <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                {session.data.messages.map((item) => (
                  <ChatMessageBubble key={item.messageId} message={item} />
                ))}
                {send.isPending && (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-2 rounded-2xl rounded-br-md border border-[#174b57]/8 bg-white px-4 py-3 text-xs font-bold text-[#71858a]">
                      <LoaderCircle
                        size={15}
                        className="animate-spin text-violet-700"
                      />
                      جاري تجهيز الرد...
                    </div>
                  </div>
                )}
                <ChatReplyResults reply={lastReply} onPrompt={submitText} />
                <div ref={bottomRef} />
              </div>
              {session.data.isEnded ? (
                <div className="border-t border-[#174b57]/8 bg-white p-4 text-center">
                  <p className="text-sm font-bold text-[#71858a]">
                    انتهت هذه المحادثة ولا يمكن إضافة رسائل جديدة.
                  </p>
                  <button
                    type="button"
                    onClick={() => create.mutate()}
                    disabled={create.isPending}
                    className="btn-primary mx-auto mt-3"
                  >
                    <MessageCircle size={16} />
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
      <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-amber-900">
        <ShieldAlert size={18} className="mt-0.5 shrink-0" />
        <p className="text-xs leading-6">
          المساعد يسهّل الوصول إلى خدمات المنصة ومعلوماتك المسجلة، ولا يقدّم
          تشخيصًا طبيًا ولا يغني عن استشارة الطبيب أو الصيدلي.
        </p>
      </div>
    </div>
  );
}

function ChatWelcome({ onCreate, creating }) {
  return (
    <div className="grid flex-1 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-[1.4rem] bg-[#3d365f] text-white shadow-lg">
          <Bot size={29} />
        </span>
        <h3 className="mt-5 text-xl font-black text-[#29464d]">
          كيف يمكنني مساعدتك؟
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#71858a]">
          ابدأ محادثة للبحث عن دواء، معرفة الصيدليات الأقرب أو مراجعة بطاقتك
          الصحية.
        </p>
        <button
          type="button"
          onClick={onCreate}
          disabled={creating}
          className="btn-primary mx-auto mt-5"
        >
          <MessageCircle size={17} />
          {creating ? "جاري البدء..." : "ابدأ محادثة"}
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
    <div className="border-t border-[#174b57]/8 bg-white p-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            disabled={pending}
            className="shrink-0 rounded-full border border-violet-100 bg-violet-50/60 px-3 py-1.5 text-[11px] font-bold text-violet-700"
          >
            {prompt}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <button
          type="button"
          onClick={onLocation}
          disabled={pending || locating}
          className="icon-button grid size-11 shrink-0"
          aria-label="إرسال موقعي الحالي"
        >
          {locating ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Crosshair size={18} />
          )}
        </button>
        <textarea
          className="form-textarea min-h-11 flex-1 resize-none py-3"
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
          disabled={pending || message.trim().length < 2}
          className="btn-primary min-h-11 shrink-0 px-4"
          aria-label="إرسال الرسالة"
        >
          <Send size={18} />
          <span className="hidden sm:inline">إرسال</span>
        </button>
      </form>
      <p className="mt-2 text-[10px] text-[#9aabad]">
        Enter للإرسال • Shift + Enter لسطر جديد
      </p>
    </div>
  );
}
