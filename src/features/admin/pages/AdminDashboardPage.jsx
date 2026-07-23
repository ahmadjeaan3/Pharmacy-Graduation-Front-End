import { useQuery } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Building2,
  HeartHandshake,
  PackageSearch,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { adminKeys, getAdminDashboard } from "../api/adminApi";
import {
  DashboardEmptyState as AdminEmptyState,
  DashboardErrorState as AdminErrorState,
  DashboardLoadingState as AdminLoadingState,
} from "../../../shared/components/AsyncStates";
import { formatDate, formatRequestStatus } from "../utils/adminFormatters";

export function AdminDashboardPage() {
  const query = useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: getAdminDashboard,
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
  const stats = [
    {
      label: "المستخدمون",
      value: data.totalUsers,
      detail: `${data.activeUsers} حساب نشط`,
      icon: UsersRound,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "الصيدليات",
      value: data.totalPharmacies,
      detail: `${data.approvedPharmacies} معتمدة`,
      icon: Building2,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "المنظمات",
      value: data.totalOrganizations,
      detail: `${data.approvedOrganizations} معتمدة`,
      icon: HeartHandshake,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "طلبات الأدوية",
      value: data.totalMedicineRequests,
      detail: `${data.activeMedicineRequests} نشطة`,
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
  ];
  const maxStatus = Math.max(
    ...data.requestStatusCounts.map((item) => item.count),
    1,
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
              إحصاءات الحسابات والطلبات وعمليات الاعتماد بحسب أحدث بيانات
              المنصة.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.07] px-4 py-3 text-sm">
            <span className="block text-white/45">آخر تحديث</span>
            <strong className="mt-1 block">
              {formatDate(data.generatedAtUtc, true)}
            </strong>
          </div>
        </div>
      </Motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              {value.toLocaleString("ar-SY")}
            </p>
            <p className="mt-2 text-xs text-slate-400">{detail}</p>
          </Motion.article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
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
                {value.toLocaleString("ar-SY")}
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

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6">
          <div>
            <h3 className="font-extrabold text-[#17363e]">
              توزيع حالات طلبات الأدوية
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              الأعداد الحالية بحسب حالة الطلب
            </p>
          </div>
          {data.requestStatusCounts.length ? (
            <div className="mt-7 space-y-5">
              {data.requestStatusCounts.map((item) => (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#526a70]">
                      {formatRequestStatus(item.status)}
                    </span>
                    <strong className="text-[#17363e]">
                      {item.count.toLocaleString("ar-SY")}
                    </strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf3f2]">
                    <Motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / maxStatus) * 100}%` }}
                      transition={{ duration: 0.65 }}
                      className="h-full rounded-full bg-gradient-to-l from-[#216474] to-[#73bcb7]"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState
              title="لا توجد طلبات أدوية"
              description="لا تتوفر حالات طلبات لعرضها حالياً."
            />
          )}
        </div>
        <div className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
              <Search size={19} />
            </span>
            <div>
              <h3 className="font-extrabold text-[#17363e]">
                عبارات البحث الأكثر استخداماً
              </h3>
              <p className="text-xs text-slate-400">
                إجمالي البحث: {data.totalSearches.toLocaleString("ar-SY")}
              </p>
            </div>
          </div>
          {data.topSearchQueries.length ? (
            <div className="mt-6 space-y-3">
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
                    {item.count.toLocaleString("ar-SY")}
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

      <section className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6">
        <div>
          <h3 className="font-extrabold text-[#17363e]">أحدث طلبات الأدوية</h3>
          <p className="mt-1 text-sm text-slate-400">
            آخر عشرة طلبات مسجلة في المنصة
          </p>
        </div>
        {data.recentMedicineRequests.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="pb-3 font-semibold">رقم الطلب</th>
                  <th className="pb-3 font-semibold">الدواء</th>
                  <th className="pb-3 font-semibold">المستخدم</th>
                  <th className="pb-3 font-semibold">الصيدلية</th>
                  <th className="pb-3 font-semibold">الحالة</th>
                  <th className="pb-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMedicineRequests.map((request) => (
                  <tr
                    key={request.requestId}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-4 font-bold text-[#216474]" dir="ltr">
                      {request.requestCode}
                    </td>
                    <td className="py-4 font-semibold text-[#29464d]">
                      {request.medicineName}
                    </td>
                    <td className="py-4 text-[#60777c]">
                      {request.userFullName}
                    </td>
                    <td className="py-4 text-[#60777c]">
                      {request.pharmacyName}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-[#eaf4f3] px-3 py-1.5 text-xs font-bold text-[#216474]">
                        {formatRequestStatus(request.status)}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">
                      {formatDate(request.createdAtUtc)}
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
