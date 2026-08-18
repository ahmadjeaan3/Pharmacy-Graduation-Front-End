import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useDeferredValue, useState } from "react";

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
  "home-statistics": "إحصائيات الصفحة الرئيسية",
  System: "النظام",
};
const roleLabels = {
  User: "مستخدم",
  Pharmacy: "صيدلية",
  Organization: "منظمة",
  Warehouse: "مستودع",
  Representative: "مندوب",
  Admin: "إدارة",
};

const AUDIT_HERO_IMAGE = "/assets/app/home/background_hero_admin.png";

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
  const deferredSearch = useDeferredValue(filters.search.trim());
  const requestFilters = { ...filters, search: deferredSearch };
  const logs = useQuery({
    queryKey: adminKeys.auditLogs(requestFilters),
    queryFn: () =>
      getAdminAuditLogs({
        ...requestFilters,
        success: filters.success === "" ? undefined : filters.success,
      }),
    placeholderData: (previousData) => previousData,
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
    <div dir="rtl" className="space-y-5 pb-6">
      <section className="relative isolate min-h-[270px] overflow-hidden rounded-[2rem] border border-[#d5e7e8] bg-[#8bcbd0] shadow-[0_24px_60px_rgba(23,75,87,.13)] sm:min-h-[300px]">
        <img
          src={AUDIT_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[42%_center] sm:object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,.02)_0%,rgba(20,91,103,.12)_38%,rgba(8,73,85,.76)_72%,rgba(7,61,72,.9)_100%)]" />
        <div className="flex min-h-[270px] flex-col justify-center gap-6 px-6 py-8 sm:min-h-[300px] sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-[720px] text-white">
            <p className="flex items-center gap-2 text-sm font-bold text-[#b9f0ec]">
              <ShieldCheck size={17} /> رقابة إدارية محمية
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight drop-shadow-sm sm:text-4xl lg:text-[44px]">
              سجل نشاطات النظام
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              متابعة عمليات الإضافة والتعديل والحذف في جميع أقسام المنصة دون
              تخزين كلمات المرور أو محتوى الطلبات الحساسة.
            </p>
          </div>
          <div className="flex w-fit min-w-[160px] items-center gap-3 rounded-2xl border border-white/35 bg-white/90 px-5 py-4 text-[#174b57] shadow-xl backdrop-blur-md">
            <span className="grid size-11 place-items-center rounded-xl bg-[#e5f3f2] text-[#216474]">
              <Database size={21} />
            </span>
            <div>
              <span className="text-xs font-bold text-[#71858a]">
                إجمالي النتائج
              </span>
              <strong className="mt-0.5 block text-2xl font-black">
                {data.totalCount}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
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

      <section className="rounded-[1.5rem] border border-[#dce8ea] bg-white p-4 shadow-[0_12px_36px_rgba(23,75,87,.055)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f3] pb-4">
          <div>
            <h2 className="flex items-center gap-2 font-black text-[#29464d]">
              <SlidersHorizontal size={18} className="text-[#216474]" /> البحث
              والتصفية
            </h2>
            <p className="mt-1 text-xs text-[#829499]">
              حدّد القسم أو العملية للوصول إلى النشاط المطلوب بسرعة
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFilters({
                search: "",
                area: "",
                action: "",
                role: "",
                success: "",
                page: 1,
                pageSize: 25,
              })
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce8ea] px-3 text-xs font-black text-[#60777d] transition hover:bg-[#f3f8f8] hover:text-[#216474]"
          >
            <RotateCcw size={15} /> مسح الفلاتر
          </button>
        </div>
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
              aria-label="البحث في سجل النشاطات"
            />
          </label>
          <Filter
            aria-label="تصفية حسب القسم"
            value={filters.area}
            onChange={update("area")}
          >
            <option value="">كل الأقسام</option>
            {(data.areas || []).map((area) => (
              <option key={area} value={area}>
                {areaLabels[area] || area}
              </option>
            ))}
          </Filter>
          <Filter
            aria-label="تصفية حسب العملية"
            value={filters.action}
            onChange={update("action")}
          >
            <option value="">كل العمليات</option>
            <option value="Create">إضافة</option>
            <option value="Update">تعديل</option>
            <option value="Delete">حذف</option>
          </Filter>
          <Filter
            aria-label="تصفية حسب الدور"
            value={filters.role}
            onChange={update("role")}
          >
            <option value="">كل الأدوار</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Filter>
          <Filter
            aria-label="تصفية حسب النتيجة"
            value={filters.success}
            onChange={update("success")}
          >
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
        <section className="overflow-hidden rounded-[1.5rem] border border-[#dce8ea] bg-white shadow-[0_14px_40px_rgba(23,75,87,.055)]">
          <div className="flex items-center justify-between border-b border-[#edf2f3] px-5 py-4">
            <div>
              <h2 className="font-black text-[#29464d]">تفاصيل النشاطات</h2>
              <p className="mt-1 text-xs text-[#829499]">
                أحدث العمليات تظهر أولًا
              </p>
            </div>
            <span className="rounded-full bg-[#eaf4f3] px-3 py-1.5 text-xs font-black text-[#216474]">
              {data.items.length} نتيجة في الصفحة
            </span>
          </div>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#f5f9f9] text-xs text-[#60777d]">
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
            type="button"
            aria-label="الصفحة السابقة"
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
            type="button"
            aria-label="الصفحة التالية"
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
    <select
      className="form-input cursor-pointer bg-[#fbfdfd] font-bold text-[#47666d]"
      {...props}
    >
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
    <article className="group flex min-h-[96px] items-center gap-3 rounded-2xl border border-[#dce8ea] bg-white p-4 shadow-[0_8px_24px_rgba(23,75,87,.035)] transition hover:-translate-y-0.5 hover:border-[#bad1d5] hover:shadow-[0_14px_30px_rgba(23,75,87,.08)] sm:p-5">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl transition group-hover:scale-105 ${tone}`}
      >
        <Icon size={20} />
      </span>
      <div>
        <strong className="block text-xl font-black text-[#29464d]">
          {value}
        </strong>
        <span className="mt-1 block text-xs font-bold text-[#71858a]">
          {label}
        </span>
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
    <tr className="align-top transition hover:bg-[#f8fbfb]">
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
    <article className="space-y-3 p-4 transition hover:bg-[#f8fbfb] sm:p-5">
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
