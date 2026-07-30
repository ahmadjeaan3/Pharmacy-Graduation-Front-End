import { useQuery } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarRange,
  HeartHandshake,
  PackageSearch,
  PieChart,
  Search,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { adminKeys, getAdminDashboard } from "../api/adminApi";
import {
  DashboardEmptyState as AdminEmptyState,
  DashboardErrorState as AdminErrorState,
  DashboardLoadingState as AdminLoadingState,
} from "../../../shared/components/AsyncStates";
import { formatDate, formatRequestStatus } from "../utils/adminFormatters";
import { useLanguage } from "../../../shared/i18n/useLanguage";

export function AdminDashboardPage() {
  const { locale, t } = useLanguage();
  const [periodDays, setPeriodDays] = useState(7);
  const query = useQuery({
    queryKey: adminKeys.dashboard(periodDays),
    queryFn: () => getAdminDashboard(periodDays),
  });
  if (query.isPending) return <AdminLoadingState />;
  if (query.isError)
    return (
      <AdminErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const data = query.data;
  const activePeriodDays = data.periodDays ?? periodDays;
  const activePeriodLabel = periodLabel(activePeriodDays);
  const isAllTime = activePeriodDays === 0;
  const stats = [
    {
      label: isAllTime ? "المستخدمون" : "مستخدمون جدد",
      value: isAllTime ? data.totalUsers : data.newUsersInPeriod,
      detail: isAllTime
        ? t("{{count}} حساب نشط", {
            count: data.activeUsers.toLocaleString(locale),
          })
        : t("من أصل {{count}} حساب", {
            count: data.totalUsers.toLocaleString(locale),
          }),
      icon: UsersRound,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: isAllTime ? "الصيدليات" : "صيدليات جديدة",
      value: isAllTime ? data.totalPharmacies : data.newPharmaciesInPeriod,
      detail: isAllTime
        ? t("{{count}} معتمدة", {
            count: data.approvedPharmacies.toLocaleString(locale),
          })
        : t("من أصل {{count}} صيدلية", {
            count: data.totalPharmacies.toLocaleString(locale),
          }),
      icon: Building2,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: isAllTime ? "المنظمات" : "منظمات جديدة",
      value: isAllTime
        ? data.totalOrganizations
        : data.newOrganizationsInPeriod,
      detail: isAllTime
        ? t("{{count}} معتمدة", {
            count: data.approvedOrganizations.toLocaleString(locale),
          })
        : t("من أصل {{count}} منظمة", {
            count: data.totalOrganizations.toLocaleString(locale),
          }),
      icon: HeartHandshake,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: isAllTime ? "المستودعات" : "مستودعات جديدة",
      value: isAllTime ? data.totalWarehouses : data.newWarehousesInPeriod,
      detail: isAllTime
        ? t("{{count}} معتمدة", {
            count: data.approvedWarehouses.toLocaleString(locale),
          })
        : t("من أصل {{count}} مستودع", {
            count: data.totalWarehouses.toLocaleString(locale),
          }),
      icon: Warehouse,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "طلبات الأدوية",
      value: data.totalMedicineRequests,
      detail: t("{{count}} نشطة", {
        count: data.activeMedicineRequests.toLocaleString(locale),
      }),
      icon: PackageSearch,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];
  const queues = [
    {
      label: "صيدليات بانتظار الاعتماد",
      value: data.pendingPharmacies,
      to: "/app/approvals?tab=pharmacies",
      icon: Building2,
    },
    {
      label: "منظمات بانتظار الاعتماد",
      value: data.pendingOrganizations,
      to: "/app/approvals?tab=organizations",
      icon: HeartHandshake,
    },
    {
      label: "ملفات تحقق معلّقة",
      value: data.pendingOrganizationVerifications,
      to: "/app/approvals?tab=organizations",
      icon: ShieldCheck,
    },
    {
      label: "مستودعات بانتظار الاعتماد",
      value: data.pendingWarehouses,
      to: "/app/approvals?tab=warehouses",
      icon: Warehouse,
    },
  ];
  const requestSegments = [
    {
      label: "قيد الانتظار",
      value: data.pendingMedicineRequests,
      color: "#f2b84b",
    },
    { label: "متوفر", value: data.availableMedicineRequests, color: "#10b981" },
    {
      label: "غير متوفر",
      value: data.unavailableMedicineRequests,
      color: "#f43f5e",
    },
    { label: "ملغي", value: data.cancelledMedicineRequests, color: "#94a3b8" },
  ];
  const accountSegments = [
    { label: "المستخدمون", value: data.totalUsers, color: "bg-cyan-500" },
    { label: "الصيدليات", value: data.totalPharmacies, color: "bg-amber-400" },
    {
      label: "المنظمات",
      value: data.totalOrganizations,
      color: "bg-violet-500",
    },
    {
      label: "المستودعات",
      value: data.totalWarehouses,
      color: "bg-sky-500",
    },
  ];
  const totalAccounts =
    data.totalUsers +
    data.totalPharmacies +
    data.totalOrganizations +
    data.totalWarehouses;
  const pharmacyApprovalRate = percentage(
    data.approvedPharmacies,
    data.totalPharmacies,
  );
  const organizationApprovalRate = percentage(
    data.approvedOrganizations,
    data.totalOrganizations,
  );
  const activeUserRate = percentage(data.activeUsers, data.totalUsers);
  const warehouseApprovalRate = percentage(
    data.approvedWarehouses,
    data.totalWarehouses,
  );

  return (
    <div className="space-y-6">
      <Motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174b57] px-6 py-8 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] lg:px-9"
      >
        <div className="noise absolute inset-0 -z-10" />
        <div className="absolute -left-12 -top-24 -z-10 size-72 rounded-full border-[44px] border-white/[.035]" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#8bd0cb]">
              مركز إدارة المنصة
            </p>
            <h2 className="mt-2 text-3xl font-black">
              نظرة عامة على حياة دوائية
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/60">
              إحصاءات النشاط والطلبات خلال {activePeriodLabel}، مع عرض حالة
              الاعتمادات الحالية للمنصة.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.09] px-3 py-2 backdrop-blur">
              <CalendarRange size={17} className="text-[#f5cb72]" />
              <span className="text-xs font-bold text-white/55">عرض نشاط</span>
              <select
                value={periodDays}
                onChange={(event) => setPeriodDays(Number(event.target.value))}
                className="cursor-pointer bg-transparent py-1 text-sm font-black text-white outline-none [&>option]:text-slate-900"
              >
                <option value={1}>آخر 24 ساعة</option>
                <option value={7}>آخر 7 أيام</option>
                <option value={30}>آخر 30 يومًا</option>
                <option value={90}>آخر 3 أشهر</option>
                <option value={0}>كل الوقت</option>
              </select>
            </label>
            <div className="rounded-xl border border-white/10 bg-white/[.06] px-4 py-2 text-xs">
              {query.isFetching ? (
                <strong className="inline-flex items-center gap-2 text-[#f5cb72]">
                  <span className="size-2 animate-pulse rounded-full bg-[#f5cb72]" />
                  جاري تحديث الفترة...
                </strong>
              ) : (
                <>
                  <span className="text-white/45">آخر تحديث: </span>
                  <strong>{formatDate(data.generatedAtUtc, true)}</strong>
                </>
              )}
            </div>
          </div>
        </div>
      </Motion.section>

      <section
        className={`grid gap-4 transition sm:grid-cols-2 xl:grid-cols-5 ${
          query.isFetching ? "pointer-events-none opacity-55" : ""
        }`}
      >
        {stats.map(({ label, value, detail, icon: Icon, tone }, index) => (
          <Motion.article
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_12px_35px_rgba(23,75,87,.045)]"
          >
            <div className="flex items-start justify-between">
              <span
                className={`grid size-11 place-items-center rounded-xl ${tone}`}
              >
                <Icon size={21} />
              </span>
              <Activity size={17} className="text-slate-300" />
            </div>
            <p className="mt-5 text-sm font-semibold text-[#71858a]">{label}</p>
            <p className="mt-1 text-3xl font-black text-[#17363e]">
              {value.toLocaleString(locale)}
            </p>
            <p className="mt-2 text-xs text-slate-400">{detail}</p>
          </Motion.article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {queues.map(({ label, value, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-4 rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5 transition hover:-translate-y-1 hover:border-[#216474]/25 hover:shadow-lg"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
              <Icon size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-2xl font-black text-[#17363e]">
                {value.toLocaleString(locale)}
              </strong>
              <small className="text-[#71858a]">{label}</small>
            </span>
            <ArrowLeft
              size={18}
              className="text-[#216474] transition group-hover:-translate-x-1"
            />
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <article className="overflow-hidden rounded-[1.65rem] border border-[#174b57]/8 bg-white shadow-[0_14px_40px_rgba(23,75,87,.05)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
                <PieChart size={20} />
              </span>
              <div>
                <h3 className="font-black text-[#17363e]">صحة دورة الطلبات</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  توزيع طلبات الأدوية خلال {activePeriodLabel}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#f4f8f7] px-3 py-1.5 text-xs font-black text-[#216474]">
              {data.totalMedicineRequests.toLocaleString(locale)} طلب
            </span>
          </div>
          <div className="grid items-center gap-7 p-6 sm:grid-cols-[220px_1fr]">
            <DonutChart
              segments={requestSegments}
              total={data.totalMedicineRequests}
              locale={locale}
            />
            <div className="grid gap-3">
              {requestSegments.map((segment) => (
                <div
                  key={segment.label}
                  className="flex items-center gap-3 rounded-xl bg-[#f9fbfb] px-4 py-3"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="flex-1 text-sm font-semibold text-[#60777c]">
                    {segment.label}
                  </span>
                  <strong className="text-sm text-[#17363e]">
                    {segment.value.toLocaleString(locale)}
                  </strong>
                  <span className="w-10 text-end text-[11px] text-slate-400">
                    {percentage(
                      segment.value,
                      data.totalMedicineRequests,
                    ).toLocaleString(locale)}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[1.65rem] border border-[#174b57]/8 bg-white p-6 shadow-[0_14px_40px_rgba(23,75,87,.05)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-[#17363e]">تكوين مجتمع المنصة</h3>
              <p className="mt-1 text-xs text-slate-400">
                لقطة حالية لإجمالي الحسابات ونسب جاهزيتها
              </p>
            </div>
            <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <UsersRound size={20} />
            </span>
          </div>
          <div className="mt-7 flex h-4 overflow-hidden rounded-full bg-slate-100">
            {accountSegments.map((segment) => (
              <Motion.span
                key={segment.label}
                initial={{ width: 0 }}
                animate={{
                  width: `${percentage(segment.value, totalAccounts)}%`,
                }}
                transition={{ duration: 0.75 }}
                className={`${segment.color} first:rounded-s-full last:rounded-e-full`}
                title={`${segment.label}: ${segment.value}`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {accountSegments.map((segment) => (
              <div key={segment.label} className="text-center">
                <strong className="block text-lg font-black text-[#17363e]">
                  {segment.value.toLocaleString(locale)}
                </strong>
                <span className="text-[11px] text-slate-400">
                  {segment.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-7 grid gap-4">
            <ProgressMetric
              label="نشاط المستخدمين"
              value={activeUserRate}
              color="bg-cyan-500"
              locale={locale}
            />
            <ProgressMetric
              label="اعتماد الصيدليات"
              value={pharmacyApprovalRate}
              color="bg-amber-400"
              locale={locale}
            />
            <ProgressMetric
              label="اعتماد المنظمات"
              value={organizationApprovalRate}
              color="bg-violet-500"
              locale={locale}
            />
            <ProgressMetric
              label="اعتماد المستودعات"
              value={warehouseApprovalRate}
              color="bg-sky-500"
              locale={locale}
            />
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard
          icon={TrendingUp}
          label={`عمليات البحث — ${activePeriodLabel}`}
          value={data.totalSearches}
          detail={`${data.newUsersInPeriod.toLocaleString(locale)} حساب مستخدم جديد`}
          tone="bg-cyan-50 text-cyan-700"
          locale={locale}
        />
        <InsightCard
          icon={HeartHandshake}
          label={`عروض التبرع المعلّقة — ${activePeriodLabel}`}
          value={data.pendingDonationOffers}
          detail={`من أصل ${data.totalDonationOffers.toLocaleString(locale)} عرض خلال الفترة`}
          tone="bg-violet-50 text-violet-700"
          locale={locale}
        />
        <InsightCard
          icon={ShieldCheck}
          label={`طلبات المساعدة المفتوحة — ${activePeriodLabel}`}
          value={data.openAssistanceRequests}
          detail={`من أصل ${data.totalAssistanceRequests.toLocaleString(locale)} طلب خلال الفترة`}
          tone="bg-emerald-50 text-emerald-700"
          locale={locale}
        />
      </section>

      <section className="grid gap-5">
        <div className="self-start overflow-hidden rounded-[1.5rem] border border-[#174b57]/8 bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-[#fbfdfc] px-6 py-5">
            <div>
              <h3 className="font-extrabold text-[#17363e]">
                مؤشر جاهزية الطلبات — {activePeriodLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                متابعة سريعة للطلبات التي تحتاج تدخلاً خلال {activePeriodLabel}
              </p>
            </div>
            <div className="rounded-2xl bg-[#eaf4f3] px-4 py-2 text-center">
              <strong className="block text-xl font-black text-[#216474]">
                {percentage(
                  data.availableMedicineRequests +
                    data.unavailableMedicineRequests,
                  data.totalMedicineRequests,
                ).toLocaleString(locale)}
                %
              </strong>
              <span className="text-[10px] font-bold text-[#71858a]">
                تمت معالجتها
              </span>
            </div>
          </div>
          {data.requestStatusCounts.length ? (
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {data.requestStatusCounts.map((item, index) => {
                const styles = [
                  "bg-emerald-50 text-emerald-700 border-emerald-100",
                  "bg-amber-50 text-amber-700 border-amber-100",
                  "bg-rose-50 text-rose-700 border-rose-100",
                  "bg-slate-50 text-slate-700 border-slate-100",
                ];
                return (
                  <div
                    key={item.status}
                    className={`flex items-center gap-4 rounded-2xl border p-4 ${styles[index % styles.length]}`}
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/75 shadow-sm">
                      <Activity size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold opacity-75">
                        {formatRequestStatus(item.status)}
                      </span>
                      <strong className="mt-1 block text-2xl font-black">
                        {item.count.toLocaleString(locale)}
                      </strong>
                    </div>
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-black">
                      {percentage(
                        item.count,
                        data.totalMedicineRequests,
                      ).toLocaleString(locale)}
                      %
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <AdminEmptyState
              title="لا توجد طلبات أدوية"
              description="لا تتوفر حالات طلبات لعرضها حالياً."
            />
          )}
        </div>
        <div className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6 shadow-[0_12px_35px_rgba(23,75,87,.045)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <Search size={19} />
            </span>
            <div>
              <h3 className="font-extrabold text-[#17363e]">
                عبارات البحث الأكثر استخداماً
              </h3>
              <p className="text-xs text-slate-400">
                إجمالي البحث خلال {activePeriodLabel}:{" "}
                {data.totalSearches.toLocaleString(locale)}
              </p>
            </div>
          </div>
          {data.topSearchQueries.length ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {data.topSearchQueries.map((item, index) => (
                <div
                  key={item.query}
                  className="flex items-center gap-3 rounded-xl bg-[#f8fbfa] p-3"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-white text-xs font-black text-[#216474] shadow-sm">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-[#526a70]">
                    {item.query}
                  </span>
                  <strong className="text-sm text-[#17363e]">
                    {item.count.toLocaleString(locale)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="لا توجد عمليات بحث"
              description="لم تُسجل عبارات بحث حتى الآن."
            />
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[#174b57]/8 bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
        <div className="flex flex-col gap-4 border-b border-[#174b57]/8 bg-gradient-to-l from-[#fbfdfc] to-[#f5f9f8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">
          <div>
            <h3 className="font-extrabold text-[#17363e]">
              أحدث طلبات الأدوية
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              آخر عشرة طلبات ضمن {activePeriodLabel}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#216474]/8 bg-white px-3.5 py-2.5 text-xs font-black text-[#216474] shadow-sm">
            <PackageSearch size={14} />
            {data.recentMedicineRequests.length.toLocaleString(locale)} طلبات
            حديثة
          </span>
        </div>
        {data.recentMedicineRequests.length ? (
          <div className="overflow-x-auto p-4 lg:p-6">
            <table className="w-full min-w-[940px] table-fixed border-separate border-spacing-0 text-start text-sm">
              <thead className="bg-[#eff6f5]">
                <tr className="text-xs text-[#71858a]">
                  <th className="w-[21%] rounded-s-xl px-5 py-4 font-black">
                    رقم الطلب
                  </th>
                  <th className="w-[18%] px-5 py-4 font-black">الدواء</th>
                  <th className="w-[18%] px-5 py-4 font-black">المستخدم</th>
                  <th className="w-[17%] px-5 py-4 font-black">الصيدلية</th>
                  <th className="w-[14%] px-5 py-4 font-black">الحالة</th>
                  <th className="w-[12%] rounded-e-xl px-5 py-4 font-black">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentMedicineRequests.map((request) => (
                  <tr
                    key={request.requestId}
                    className="group transition odd:bg-white even:bg-[#fbfdfc] hover:bg-[#f3f8f7]"
                  >
                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <span
                        className="inline-flex max-w-full rounded-lg border border-[#216474]/8 bg-[#eaf4f3] px-3 py-2 font-mono text-[11px] font-black tracking-tight text-[#175565]"
                        dir="ltr"
                        title={request.requestCode}
                      >
                        {request.requestCode}
                      </span>
                    </td>
                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cyan-50 text-cyan-700">
                          <PackageSearch size={15} />
                        </span>
                        <strong
                          className="block truncate font-black text-[#29464d]"
                          title={request.medicineName}
                        >
                          {request.medicineName}
                        </strong>
                      </div>
                    </td>
                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-black text-violet-700">
                          {request.userFullName?.trim()?.[0] || "م"}
                        </span>
                        <span
                          className="block truncate font-semibold text-[#60777c]"
                          title={request.userFullName}
                        >
                          {request.userFullName}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <Building2
                          size={15}
                          className="shrink-0 text-amber-600"
                        />
                        <span
                          className="block truncate text-[#60777c]"
                          title={request.pharmacyName}
                        >
                          {request.pharmacyName}
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black ${requestStatusTone(request.status)}`}
                      >
                        {formatRequestStatus(request.status)}
                      </span>
                    </td>
                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <span
                        className="inline-flex whitespace-nowrap rounded-lg bg-slate-50 px-2.5 py-2 font-mono text-[11px] font-bold text-slate-500"
                        dir="ltr"
                      >
                        {formatRequestDate(request.createdAtUtc)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState
            title="لا توجد طلبات حديثة"
            description="لا توجد طلبات أدوية مسجلة حالياً."
          />
        )}
      </section>
    </div>
  );
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((Number(value || 0) / Number(total)) * 100);
}

function periodLabel(days) {
  if (days === 1) return "آخر 24 ساعة";
  if (days === 7) return "آخر 7 أيام";
  if (days === 30) return "آخر 30 يومًا";
  if (days === 90) return "آخر 3 أشهر";
  return "كل الوقت";
}

function requestStatusTone(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("available"))
    return normalized.includes("unavailable")
      ? "bg-rose-50 text-rose-700"
      : "bg-emerald-50 text-emerald-700";
  if (normalized.includes("cancel")) return "bg-slate-100 text-slate-600";
  return "bg-amber-50 text-amber-700";
}

function formatRequestDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function DonutChart({ segments, total, locale }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const chartSegments = segments.map((segment, index) => {
    const offset = segments
      .slice(0, index)
      .reduce(
        (sum, previous) =>
          sum + (previous.value / Math.max(total, 1)) * circumference,
        0,
      );
    return {
      ...segment,
      offset,
      length: (segment.value / Math.max(total, 1)) * circumference,
    };
  });
  return (
    <div className="relative mx-auto size-[210px]">
      <svg viewBox="0 0 180 180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#edf3f2"
          strokeWidth="17"
        />
        {chartSegments.map((segment) => (
          <Motion.circle
            key={segment.label}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth="17"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{
              strokeDasharray: `${Math.max(segment.length - 3, 0)} ${circumference}`,
            }}
            transition={{ duration: 0.8 }}
            style={{ strokeDashoffset: -segment.offset }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <strong className="block text-3xl font-black text-[#17363e]">
            {Number(total || 0).toLocaleString(locale)}
          </strong>
          <span className="mt-1 block text-xs text-slate-400">
            إجمالي الطلبات
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressMetric({ label, value, color, locale }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold text-[#60777c]">{label}</span>
        <strong className="text-[#17363e]">
          {value.toLocaleString(locale)}%
        </strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.75 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, detail, tone, locale }) {
  return (
    <article className="group flex items-center gap-4 rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)] transition hover:-translate-y-1 hover:shadow-lg">
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}
      >
        <Icon size={21} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-[#71858a]">
          {label}
        </span>
        <strong className="mt-1 block text-2xl font-black text-[#17363e]">
          {Number(value || 0).toLocaleString(locale)}
        </strong>
        <small className="mt-1 block truncate text-slate-400">{detail}</small>
      </div>
    </article>
  );
}
