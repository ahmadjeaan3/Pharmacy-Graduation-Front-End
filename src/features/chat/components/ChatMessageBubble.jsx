import { Bot, Clock3, UserRound } from "lucide-react";
import { formatChatDate } from "../utils/chatFormatters";

export function ChatMessageBubble({ message }) {
  const fromUser = message.senderType === "User";
  return (
    <div
      className={`flex items-end gap-3 ${fromUser ? "justify-start" : "justify-end"}`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl ${fromUser ? "order-2 bg-[#eaf4f3] text-[#216474]" : "bg-[#3d365f] text-white"}`}
      >
        {fromUser ? <UserRound size={17} /> : <Bot size={17} />}
      </span>
      <div
        className={`max-w-[min(82%,720px)] rounded-2xl px-4 py-3 ${fromUser ? "rounded-bl-md bg-[#216474] text-white" : "rounded-br-md border border-[#174b57]/8 bg-white text-[#29464d] shadow-sm"}`}
      >
        <p className="whitespace-pre-wrap text-sm leading-7">
          {message.content}
        </p>
        <span
          className={`mt-2 flex items-center gap-1 text-[10px] ${fromUser ? "text-white/45" : "text-[#a0adb0]"}`}
        >
          <Clock3 size={10} />
          {formatChatDate(message.sentAtUtc, true)}
        </span>
      </div>
    </div>
  );
}
