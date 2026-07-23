import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellDot,
  CheckCheck,
  CircleCheckBig,
  Inbox,
  Layers3,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getMyNotifications,
  getNotificationSummary,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationKeys,
} from "../api/notificationsApi";
import { NotificationItem } from "../components/NotificationItem";
import {
  notificationTarget,
  notificationTypes,
} from "../utils/notificationFormatters";

export function NotificationsPage() {
  const [filters, setFilters] = useState({
    unreadOnly: false,
    type: "",
    take: 100,
  });
  const client = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState("");
  const summary = useQuery({
    queryKey: notificationKeys.summary,
    queryFn: getNotificationSummary,
    refetchInterval: 60000,
  });
  const list = useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => getMyNotifications(filters),
    refetchInterval: 60000,
  });
  const refresh = async () =>
    client.invalidateQueries({ queryKey: notificationKeys.root });
  const readOne = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: refresh,
  });
  const readAll = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: async (result) => {
      setNotice(
        result.updatedCount
          ? `تم تحديد ${result.updatedCount.toLocaleString("ar-SA")} إشعارات كمقروءة.`
          : "لا توجد إشعارات جديدة لتحديثها.",
      );
      await refresh();
    },
  });
  const openNotification = async (notification) => {
    if (!notification.isRead) await readOne.mutateAsync(notification.id);
    const target = notificationTarget(notification, user.roles || []);
    if (target) navigate(target);
  };
  const total = summary.data?.totalCount || 0;
  const unread = summary.data?.unreadCount || 0;
  const read = summary.data?.readCount || 0;
  return (
    <div>
      <section className="relative overflow-hidden rounded-[2rem] bg-[#123f49] p-6 text-white shadow-[0_25px_70px_rgba(18,63,73,.18)] lg:p-8">
        <div className="absolute -left-14 -top-20 size-64 rounded-full bg-[#f5cb72]/12 blur-3xl" />
        <BellDot
          className="absolute left-8 top-7 text-white/[.06]"
          size={140}
        />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black tracking-[.14em] text-[#8bd0cb]">
              مركز التنبيهات
            </p>
            <h2 className="mt-2 text-3xl font-black lg:text-4xl">
              إشعاراتك في مكان واحد
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              تابع الطلبات والاعتمادات والمبادرات المهمة بحسب نوع حسابك، وانتقل
              مباشرة إلى التفاصيل عندما تكون متاحة.
            </p>
          </div>
          <button
            disabled={!unread || readAll.isPending}
            onClick={() => readAll.mutate()}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#174b57] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CheckCheck size={18} />
            {readAll.isPending ? "جاري التحديث..." : "تحديد الكل كمقروء"}
          </button>
        </div>
      </section>
      {notice && (
        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          {notice}
        </div>
      )}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Layers3}
          label="جميع الإشعارات"
          value={total}
          tone="bg-cyan-50 text-cyan-700"
        />
        <SummaryCard
          icon={BellDot}
          label="غير مقروءة"
          value={unread}
          tone="bg-amber-50 text-amber-700"
        />
        <SummaryCard
          icon={CircleCheckBig}
          label="تمت قراءتها"
          value={read}
          tone="bg-emerald-50 text-emerald-700"
        />
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="surface h-fit p-4 xl:sticky xl:top-28">
          <p className="px-2 text-xs font-black text-[#829499]">
            تصفية الإشعارات
          </p>
          <div className="mt-3 space-y-1">
            <FilterButton
              active={!filters.unreadOnly && !filters.type}
              icon={Inbox}
              label="جميع الإشعارات"
              onClick={() =>
                setFilters({ unreadOnly: false, type: "", take: 100 })
              }
            />
            <FilterButton
              active={filters.unreadOnly && !filters.type}
              icon={BellDot}
              label="غير المقروءة"
              count={unread}
              onClick={() =>
                setFilters({ unreadOnly: true, type: "", take: 100 })
              }
            />
          </div>
          <div className="my-4 border-t border-[#174b57]/8" />
          <p className="px-2 text-xs font-black text-[#829499]">حسب النوع</p>
          <div className="mt-3 space-y-1">
            {Object.entries(notificationTypes)
              .filter(
                ([type]) =>
                  (summary.data?.unreadByType || []).some(
                    (item) => item.type === type,
                  ) || list.data?.some((item) => item.type === type),
              )
              .map(([type, meta]) => (
                <FilterButton
                  key={type}
                  active={filters.type === type}
                  icon={meta.icon}
                  label={meta.label}
                  count={
                    (summary.data?.unreadByType || []).find(
                      (item) => item.type === type,
                    )?.count
                  }
                  onClick={() =>
                    setFilters({ unreadOnly: false, type, take: 100 })
                  }
                />
              ))}
          </div>
        </aside>
        <main>
          {list.isLoading ? (
            <div className="grid min-h-64 place-items-center rounded-[1.5rem] bg-white text-sm font-bold text-[#829499]">
              جاري تحميل الإشعارات...
            </div>
          ) : list.isError ? (
            <div className="rounded-[1.5rem] border border-rose-100 bg-white p-8 text-center">
              <p className="font-black text-rose-700">تعذر تحميل الإشعارات</p>
              <p className="mt-2 text-sm text-[#71858a]">
                {getApiErrorMessage(list.error)}
              </p>
              <button
                onClick={() => list.refetch()}
                className="btn-secondary mt-4"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : !list.data?.length ? (
            <div className="grid min-h-64 place-items-center rounded-[1.5rem] border border-dashed border-[#174b57]/15 bg-white/70 p-8 text-center">
              <div>
                <span className="mx-auto grid size-13 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                  <Bell size={24} />
                </span>
                <h3 className="mt-4 font-black">لا توجد إشعارات هنا</h3>
                <p className="mt-2 text-sm text-[#829499]">
                  ستظهر التحديثات المهمة فور حدوثها.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {list.data.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  pending={readOne.isPending}
                  onRead={(item) => readOne.mutate(item.id)}
                  onOpen={
                    notificationTarget(notification, user.roles || [])
                      ? openNotification
                      : null
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <article className="surface flex items-center gap-4 p-5">
      <span className={`grid size-11 place-items-center rounded-2xl ${tone}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xs font-bold text-[#829499]">{label}</p>
        <strong className="mt-1 block text-2xl font-black">
          {value.toLocaleString("ar-SA")}
        </strong>
      </div>
    </article>
  );
}
function FilterButton({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-bold transition ${active ? "bg-[#174b57] text-white shadow-lg" : "text-[#60777c] hover:bg-[#f1f7f6]"}`}
    >
      <Icon size={17} />
      <span className="flex-1">{label}</span>
      {count > 0 && (
        <span
          className={`grid min-w-6 place-items-center rounded-full px-1.5 text-[10px] leading-5 ${active ? "bg-white/15 text-white" : "bg-[#e7f1f0] text-[#216474]"}`}
        >
          {count.toLocaleString("ar-SA")}
        </span>
      )}
    </button>
  );
}
