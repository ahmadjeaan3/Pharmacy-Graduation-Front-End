import { Clock3, MessageCircle, Plus, Sparkles } from "lucide-react";
import { formatChatDate } from "../utils/chatFormatters";

export function ChatSessionList({
  sessions = [],
  activeSessionId,
  loading,
  creating,
  onSelect,
  onCreate,
}) {
  return (
    <aside className="flex min-h-0 flex-col rounded-[1.45rem] border border-[#174b57]/8 bg-white lg:h-[calc(100vh-154px)]">
      <div className="border-b border-[#174b57]/8 p-4">
        <button
          type="button"
          onClick={onCreate}
          disabled={creating}
          className="btn-primary w-full justify-center"
        >
          <Plus size={17} />
          {creating ? "جاري البدء..." : "محادثة جديدة"}
        </button>
      </div>
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h3 className="text-sm font-black text-[#29464d]">المحادثات السابقة</h3>
        <Sparkles size={15} className="text-violet-600" />
      </div>
      <div className="max-h-72 flex-1 space-y-1 overflow-y-auto p-2 lg:max-h-none">
        {loading ? (
          <p className="p-5 text-center text-xs font-bold text-[#829499]">
            جاري تحميل المحادثات...
          </p>
        ) : sessions.length ? (
          sessions.map((session) => (
            <button
              key={session.sessionId}
              type="button"
              onClick={() => onSelect(session.sessionId)}
              className={`block w-full rounded-xl p-3 text-start transition ${activeSessionId === session.sessionId ? "bg-[#f2effa] text-violet-800" : "hover:bg-[#f7faf9]"}`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={15} className="shrink-0" />
                <strong className="min-w-0 flex-1 truncate text-sm">
                  {session.title}
                </strong>
                {!session.isEnded && (
                  <span className="size-2 rounded-full bg-emerald-500" />
                )}
              </div>
              <p className="mt-2 line-clamp-1 text-[11px] text-[#829499]">
                {session.lastMessagePreview || "محادثة دون رسائل"}
              </p>
              <span className="mt-2 flex items-center gap-1 text-[10px] text-[#a0adb0]">
                <Clock3 size={11} />
                {formatChatDate(session.lastActivityAtUtc, true)} •{" "}
                {session.messagesCount.toLocaleString("ar-SY")} رسائل
              </span>
            </button>
          ))
        ) : (
          <div className="px-4 py-10 text-center">
            <MessageCircle className="mx-auto text-[#b2bec0]" />
            <p className="mt-3 text-xs font-bold text-[#829499]">
              لا توجد محادثات سابقة
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
