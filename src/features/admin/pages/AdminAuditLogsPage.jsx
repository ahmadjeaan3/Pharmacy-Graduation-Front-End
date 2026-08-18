import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { adminKeys, getAdminAuditLogs } from "../api/adminApi";

const actionLabels = { Create: "إضافة", Update: "تعديل", Delete: "حذف" };
const areaLabels = {
  Authentication: "الدخول والحسابات",
  Pharmacies: "الصيدليات",
  Users: "المستخدمون",
  Organizations: "المنظمات",
  Donations: "التبرعات",
  Medicines: "الأدوية",
  Prescriptions: "الوصفات",
  SupplyChain: "سلسلة التوريد",
  Administration: "الإدارة",
  Accounts: "الحسابات",
  Chat: "المساعد الذكي",
};
const roleLabels = {
  User: "مستخدم",
  Pharmacy: "صيدلية",
  Organization: "منظمة",
  Warehouse: "مستودع",
  Representative: "مندوب",
  Admin: "إدارة",
};

export function AdminAuditLogsPage() {
  const [filters, setFilters] = useState({
    search: "",
    area: "",
    action: "",
    role: "",
    success: "",
    page: 1,
    pageSize: 25,
  });
  const logs = useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: () =>
      getAdminAuditLogs({
        ...filters,
        success: filters.success === "" ? undefined : filters.success,
      }),
    refetchInterval: 30_000,
  });
  const data = logs.data || { items: [], totalCount: 0, totalPages: 0 };
  const update = (key) => (event) =>
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
      page: 1,
    }));

  return (
    <div dir="rtl" className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174b57] px-6 py-8 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] lg:px-9">
        <div className="noise absolute inset-0 -z-10" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#8bd0cb]">
              <ShieldCheck size={17} /> رقابة إدارية محمية
            </p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              سجل نشاطات النظام
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              متابعة عمليات الإضافة والتعديل والحذف في جميع أقسام المنصة دون
              تخزين كلمات المرور أو محتوى الطلبات الحساسة.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
            <span className="text-xs text-white/60">إجمالي النتائج</span>
            <strong className="mt-1 block text-2xl">{data.totalCount}</strong>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Activity} label="الظاهر حاليًا" value={data.items.length} />
        <Stat
          icon={CheckCircle2}
          label="عمليات ناجحة"
          value={data.items.filter((item) => item.isSuccess).length}
          success
        />
        <Stat
          icon={XCircle}
          label="عمليات فاشلة"
          value={data.items.filter((item) => !item.isSuccess).length}
          danger
        />
        <Stat icon={Clock3} label="تحديث تلقائي" value="30 ث" />
      </section>

      <section className="rounded-[1.5rem] border border-[#dce8ea] bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(4,170px)]">
          <label className="relative">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6e969e]"
              size={18}
            />
            <input
              className="form-input pr-11"
              value={filters.search}
              onChange={update("search")}
              placeholder="ابحث بالمستخدم أو المسار أو القسم"
            />
          </label>
          <Filter value={filters.area} onChange={update("area")}>
            <option value="">كل الأقسام</option>
            {(data.areas || []).map((area) => (
              <option key={area} value={area}>
                {areaLabels[area] || area}
              </option>
            ))}
          </Filter>
          <Filter value={filters.action} onChange={update("action")}>
            <option value="">كل العمليات</option>
            <option value="Create">إضافة</option>
            <option value="Update">تعديل</option>
            <option value="Delete">حذف</option>
          </Filter>
          <Filter value={filters.role} onChange={update("role")}>
            <option value="">كل الأدوار</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Filter>
          <Filter value={filters.success} onChange={update("success")}>
            <option value="">كل النتائج</option>
            <option value="true">ناجحة</option>
            <option value="false">فاشلة</option>
          </Filter>
        </div>
      </section>

      {logs.isLoading ? (
        <div className="surface grid min-h-64 place-items-center text-sm text-[#71858a]">
          جاري تحميل السجل...
        </div>
      ) : logs.isError ? (
        <div className="surface p-6 text-center text-sm font-bold text-rose-700">
          {getApiErrorMessage(logs.error)}
          <button
            className="btn-secondary mx-auto mt-4"
            onClick={() => logs.refetch()}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : !data.items.length ? (
        <div className="surface grid min-h-64 place-items-center text-sm text-[#829499]">
          لا توجد نشاطات مطابقة للفلاتر.
        </div>
      ) : (
        <section className="overflow-hidden rounded-[1.5rem] border border-[#dce8ea] bg-white shadow-sm">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#f3f8f8] text-xs text-[#60777d]">
                <tr>
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">العملية</th>
                  <th className="p-4">القسم والمسار</th>
                  <th className="p-4">النتيجة</th>
                  <th className="p-4">الوقت</th>
                  <th className="p-4">المدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f3]">
                {data.items.map((item) => (
                  <LogRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-[#edf2f3] lg:hidden">
            {data.items.map((item) => (
              <LogCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            className="icon-button grid"
            disabled={filters.page <= 1}
            onClick={() => setFilters((x) => ({ ...x, page: x.page - 1 }))}
          >
            <ChevronRight size={18} />
          </button>
          <span className="text-sm font-bold text-[#60777d]">
            {filters.page} من {data.totalPages}
          </span>
          <button
            className="icon-button grid"
            disabled={filters.page >= data.totalPages}
            onClick={() => setFilters((x) => ({ ...x, page: x.page + 1 }))}
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function Filter({ children, ...props }) {
  return (
    <select className="form-input" {...props}>
      {children}
    </select>
  );
}

function Stat({ icon: Icon, label, value, success, danger }) {
  const tone = danger
    ? "bg-rose-50 text-rose-700"
    : success
      ? "bg-emerald-50 text-emerald-700"
      : "bg-[#eaf4f3] text-[#216474]";
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-[#dce8ea] bg-white p-4">
      <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
        <Icon size={20} />
      </span>
      <div>
        <strong className="block text-xl text-[#29464d]">{value}</strong>
        <span className="text-xs text-[#71858a]">{label}</span>
      </div>
    </article>
  );
}

function ActionBadge({ item }) {
  const tone =
    item.action === "Delete"
      ? "bg-rose-50 text-rose-700"
      : item.action === "Update"
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}>
      {actionLabels[item.action] || item.action}
    </span>
  );
}

function LogRow({ item }) {
  return (
    <tr className="align-top hover:bg-[#fbfdfd]">
      <td className="p-4">
        <strong className="block text-[#29464d]">
          {item.userName || "زائر/النظام"}
        </strong>
        <small className="text-[#829499]">
          {roleLabels[item.userRole] || item.userRole || "غير مسجل"}
        </small>
      </td>
      <td className="p-4">
        <ActionBadge item={item} />
      </td>
      <td className="max-w-[360px] p-4">
        <strong className="block text-[#29464d]">
          {areaLabels[item.area] || item.area}
        </strong>
        <code
          dir="ltr"
          className="mt-1 block truncate text-[11px] text-[#71858a]"
        >
          {item.httpMethod} {item.path}
        </code>
      </td>
      <td className="p-4">
        <span
          className={`font-bold ${item.isSuccess ? "text-emerald-700" : "text-rose-700"}`}
        >
          {item.isSuccess ? "ناجحة" : `فاشلة (${item.statusCode})`}
        </span>
      </td>
      <td className="whitespace-nowrap p-4 text-xs text-[#60777d]">
        {formatDate(item.createdAtUtc)}
      </td>
      <td className="p-4 text-xs text-[#60777d]">{item.durationMs} ms</td>
    </tr>
  );
}

function LogCard({ item }) {
  return (
    <article className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong className="text-sm text-[#29464d]">
            {item.userName || "زائر/النظام"}
          </strong>
          <small className="block text-[#829499]">
            {roleLabels[item.userRole] || item.userRole || "غير مسجل"}
          </small>
        </div>
        <ActionBadge item={item} />
      </div>
      <div>
        <strong className="text-sm text-[#29464d]">
          {areaLabels[item.area] || item.area}
        </strong>
        <code
          dir="ltr"
          className="mt-1 block break-all text-[11px] text-[#71858a]"
        >
          {item.httpMethod} {item.path}
        </code>
      </div>
      <div className="flex justify-between text-xs">
        <span className={item.isSuccess ? "text-emerald-700" : "text-rose-700"}>
          {item.isSuccess ? "ناجحة" : `فاشلة (${item.statusCode})`}
        </span>
        <span className="text-[#829499]">
          {formatDate(item.createdAtUtc)} · {item.durationMs} ms
        </span>
      </div>
    </article>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
