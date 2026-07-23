import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Boxes,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  ClipboardList,
  Clock3,
  MapPin,
  PackageCheck,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { getPharmacyDashboard, pharmacyKeys } from "../api/pharmacyApi";
import {
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import { formatNumber } from "../utils/pharmacyFormatters";

const Stat = ({ icon: Icon, label, value, hint, tone }) => (
  <article className="surface relative overflow-hidden p-5">
    <span className={`grid size-11 place-items-center rounded-2xl ${tone}`}>
      <Icon size={21} />
    </span>
    <p className="mt-5 text-3xl font-black text-[#123b45]">
      {formatNumber(value)}
    </p>
    <p className="mt-1 text-sm font-extrabold text-[#29464d]">{label}</p>
    <p className="mt-1 text-xs text-[#829499]">{hint}</p>
  </article>
);

export function PharmacyDashboardPage() {
  const query = useQuery({
    queryKey: pharmacyKeys.dashboard,
    queryFn: getPharmacyDashboard,
  });
  if (query.isLoading) return <PharmacyLoadingState />;
  if (query.isError)
    return (
      <PharmacyErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const data = query.data;
  const setup = [
    { done: data.isApproved, label: "اعتماد حساب الصيدلية" },
    { done: data.hasLocation, label: "تحديد موقع الصيدلية" },
    { done: data.hasWorkingHoursConfigured, label: "إضافة ساعات العمل" },
    { done: data.inventoryItemsCount > 0, label: "إضافة الأدوية إلى المخزون" },
  ];
  const alerts = [
    ...(data.lowStockItems || []),
    ...(data.expiringSoonItems || []),
  ].slice(0, 6);
  return (
    <div>
      <section className="relative overflow-hidden rounded-[2rem] bg-[#123f49] p-6 text-white shadow-[0_25px_70px_rgba(18,63,73,.18)] lg:p-8">
        <div className="absolute -left-16 -top-20 size-64 rounded-full bg-[#f5cb72]/12 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">
                مركز تشغيل الصيدلية
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.isOpenNow ? "bg-emerald-300/15 text-emerald-200" : "bg-white/10 text-white/65"}`}
              >
                {data.isOpenNow ? "مفتوحة الآن" : "مغلقة الآن"}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-black lg:text-4xl">
              {data.pharmacyName}
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
              <MapPin size={16} />
              {[data.area, data.city].filter(Boolean).join("، ") ||
                "لم يحدد الموقع بعد"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4">
              <p className="text-xs text-white/50">اكتمال الملف</p>
              <strong className="mt-1 block text-2xl">
                {formatNumber(data.profileCompletionPercentage)}٪
              </strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4">
              <p className="text-xs text-white/50">التقييم</p>
              <strong className="mt-1 flex items-center gap-1 text-2xl">
                {Number(data.averageRating || 0).toFixed(1)}{" "}
                <Star size={17} className="fill-[#f5cb72] text-[#f5cb72]" />
              </strong>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Boxes}
          value={data.inventoryItemsCount}
          label="أصناف المخزون"
          hint={`${formatNumber(data.availableMedicinesCount)} صنف متاح للمرضى`}
          tone="bg-[#e9f5f3] text-[#216474]"
        />
        <Stat
          icon={PackageCheck}
          value={data.inStockCount}
          label="متوفر بالمخزون"
          hint={`${formatNumber(data.lowStockCount)} أصناف منخفضة`}
          tone="bg-emerald-50 text-emerald-700"
        />
        <Stat
          icon={ClipboardList}
          value={data.pendingRequestsCount}
          label="طلبات تنتظر الرد"
          hint={`${formatNumber(data.activeRequestsCount)} طلبات نشطة`}
          tone="bg-amber-50 text-amber-700"
        />
        <Stat
          icon={CalendarClock}
          value={data.expiringSoonCount}
          label="قريبة الانتهاء"
          hint={`${formatNumber(data.outOfStockCount)} أصناف غير متوفرة`}
          tone="bg-rose-50 text-rose-700"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black">تنبيهات تستحق المتابعة</h3>
              <p className="mt-1 text-xs text-[#829499]">
                أهم حالات المخزون مرتبة لتسهيل القرار
              </p>
            </div>
            <Link className="btn-quiet" to="/app/pharmacy/inventory">
              عرض المخزون <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {alerts.length ? (
              alerts.map((item) => (
                <div
                  key={`${item.alertType}-${item.inventoryItemId}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#174b57]/8 bg-[#f8fbfa] p-4"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.alertType === "ExpiringSoon" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}
                  >
                    <AlertTriangle size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">
                      {item.medicineName}
                    </p>
                    <p className="mt-1 text-xs text-[#829499]">
                      {item.alertType === "ExpiringSoon"
                        ? `متبقي ${formatNumber(item.daysUntilExpiry)} يومًا على الانتهاء`
                        : `الكمية الحالية ${formatNumber(item.quantity)} والحد الأدنى ${formatNumber(item.lowStockThreshold)}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-emerald-50 p-5 text-center text-sm font-bold text-emerald-700">
                <CheckCircle2 className="mx-auto mb-2" />
                لا توجد تنبيهات عاجلة في المخزون
              </div>
            )}
          </div>
        </section>
        <section className="surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black">جاهزية الصيدلية</h3>
              <p className="mt-1 text-xs text-[#829499]">
                خطوات ظهور بياناتك بدقة
              </p>
            </div>
            <span className="grid size-11 place-items-center rounded-2xl bg-[#edf6f5] text-[#216474]">
              <BadgeCheck size={21} />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {setup.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl py-1"
              >
                <span
                  className={`grid size-8 place-items-center rounded-full ${item.done ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                >
                  {item.done ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <CircleOff size={17} />
                  )}
                </span>
                <span
                  className={`text-sm font-bold ${item.done ? "text-[#29464d]" : "text-[#829499]"}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Link
              className="btn-secondary justify-center"
              to="/app/pharmacy/profile"
            >
              <MapPin size={16} />
              الملف والموقع
            </Link>
            <Link
              className="btn-secondary justify-center"
              to="/app/pharmacy/working-hours"
            >
              <Clock3 size={16} />
              ساعات العمل
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
