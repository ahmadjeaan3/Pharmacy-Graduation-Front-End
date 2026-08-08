import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationKeys,
} from "../api/notificationsApi";

import { notificationTarget } from "../utils/notificationFormatters";
import { NotificationItem } from "./NotificationItem";

export function NotificationBell({ unreadCount = 0, roles = [] }) {
  const { t, i18n } = useTranslation();

  const language = i18n.resolvedLanguage || i18n.language || "ar";

  const locale =
    language === "ar" ? "ar-SY" : language === "tr" ? "tr-TR" : "en-US";

  const [open, setOpen] = useState(false);

  const shellRef = useRef(null);

  const client = useQueryClient();

  const navigate = useNavigate();

  const preview = useQuery({
    queryKey: notificationKeys.list({
      take: 5,
    }),

    queryFn: () =>
      getMyNotifications({
        take: 5,
      }),

    enabled: open,

    staleTime: 15000,
  });

  const refresh = async () => {
    await client.invalidateQueries({
      queryKey: notificationKeys.root,
    });
  };

  const markOne = useMutation({
    mutationFn: markNotificationAsRead,

    onSuccess: refresh,
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsAsRead,

    onSuccess: refresh,
  });

  useEffect(() => {
    const close = (event) => {
      if (shellRef.current && !shellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  const openItem = async (notification) => {
    if (!notification.isRead) {
      await markOne.mutateAsync(notification.id);
    }

    const target = notificationTarget(notification, roles);

    setOpen(false);

    if (target) {
      navigate(target);
    } else {
      navigate("/app/notifications");
    }
  };

  const formattedUnreadCount = unreadCount.toLocaleString(locale);

  const notificationAriaLabel =
    unreadCount > 0
      ? t("notifications.ariaLabelUnread", {
          count: formattedUnreadCount,
        })
      : t("notifications.ariaLabel");

  return (
    <div ref={shellRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="icon-button relative grid"
        aria-label={notificationAriaLabel}
        aria-expanded={open}
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -end-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-black leading-4 text-white">
            {unreadCount > 99 ? "+99" : formattedUnreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-[calc(100%+12px)] z-50 w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-[#174b57]/10 bg-white shadow-[0_24px_70px_rgba(9,42,49,.2)]">
          <div className="flex items-center justify-between border-b border-[#174b57]/8 p-4">
            <div>
              <h3 className="font-black">{t("notifications.title")}</h3>

              <p className="mt-0.5 text-[11px] text-[#829499]">
                {unreadCount > 0
                  ? t("notifications.unreadCount", {
                      count: formattedUnreadCount,
                    })
                  : t("notifications.noNew")}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#216474] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCheck size={15} />

                {markAll.isPending
                  ? t("notifications.markingAll")
                  : t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-[420px] divide-y divide-[#174b57]/7 overflow-y-auto">
            {preview.isLoading ? (
              <div className="p-8 text-center text-sm font-bold text-[#829499]">
                {t("notifications.loading")}
              </div>
            ) : preview.isError ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-rose-400" />

                <p className="mt-3 text-sm font-bold text-rose-600">
                  {t("notifications.loadError")}
                </p>
              </div>
            ) : preview.data?.length ? (
              preview.data.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => openItem(item)}
                  disabled={markOne.isPending}
                  className="block w-full text-start transition hover:bg-[#f7faf9] disabled:cursor-wait disabled:opacity-70"
                >
                  <NotificationItem notification={item} compact />
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-[#a8b7ba]" />

                <p className="mt-3 text-sm font-bold text-[#71858a]">
                  {t("notifications.empty")}
                </p>
              </div>
            )}
          </div>

          <Link
            to="/app/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[#174b57]/8 p-4 text-center text-sm font-black text-[#216474] transition hover:bg-[#f5f9f8]"
          >
            {t("notifications.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
