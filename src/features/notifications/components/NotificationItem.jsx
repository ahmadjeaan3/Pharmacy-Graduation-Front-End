import { ArrowLeft, Check, Clock3 } from "lucide-react";
import {
  getNotificationMeta,
  displayNotificationMessage,
  displayNotificationTitle,
  formatNotificationDate,
} from "../utils/notificationFormatters";

export function NotificationItem({
  notification,
  compact = false,
  onRead,
  onOpen,
  pending,
}) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  return (
    <div
      className={`group relative flex gap-4 transition ${compact ? "p-4" : "rounded-[1.4rem] border p-5 shadow-sm"} ${notification.isRead ? "border-[#174b57]/7 bg-white" : "border-[#216474]/18 bg-gradient-to-l from-[#f1f8f7] to-white"}`}
    >
      {!notification.isRead && (
        <span
          className={`absolute right-0 top-7 h-8 w-1 rounded-l-full ${meta.dot}`}
        />
      )}
      <span
        className={`grid shrink-0 place-items-center rounded-2xl ${compact ? "size-10" : "size-12"} ${meta.tone}`}
      >
        <Icon size={compact ? 18 : 21} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`${compact ? "text-sm" : "text-[15px]"} font-black text-[#29464d]`}
          >
            {displayNotificationTitle(notification)}
          </h3>
          {!notification.isRead && (
            <span className="rounded-full bg-[#216474] px-2 py-0.5 text-[9px] font-black text-white">
              جديد
            </span>
          )}
        </div>
        <p
          className={`mt-1.5 text-[#60777c] ${compact ? "line-clamp-2 text-xs leading-5" : "text-sm leading-7"}`}
        >
          {displayNotificationMessage(notification)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-[#91a1a5]">
            <Clock3 size={12} />
            {formatNotificationDate(notification.createdAtUtc)}
          </span>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${meta.tone}`}
          >
            {meta.label}
          </span>
        </div>
        {!compact && (
          <div className="mt-4 flex flex-wrap gap-2">
            {onOpen && (
              <button
                onClick={() => onOpen(notification)}
                className="btn-quiet min-h-9 px-3 py-1.5 text-xs"
              >
                عرض التفاصيل <ArrowLeft size={14} />
              </button>
            )}
            {!notification.isRead && (
              <button
                disabled={pending}
                onClick={() => onRead(notification)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[#216474] hover:bg-[#eaf4f3]"
              >
                <Check size={14} />
                تحديد كمقروء
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
