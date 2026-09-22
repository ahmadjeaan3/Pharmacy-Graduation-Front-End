import { useQuery } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarRange,
  HeartHandshake,
  Landmark,
  MapPinned,
  Megaphone,
  PackageSearch,
  PieChart,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserRoundCheck,
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
import { useTranslation } from "react-i18next";
import { AiServicesHealthPanel } from "../components/AiServicesHealthPanel";
import { ReportActions } from "../../../shared/components/DashboardInsights";

const ADMIN_HERO_IMAGE = "/assets/app/home/background_hero_admin.png";
const AUDIENCE_INSIGHTS_IMAGE =
  "/assets/app/admin/platform-audience-insights.png";

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation();

  const language = String(i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const locale =
    language === "ar"
      ? "ar-SY-u-nu-latn"
      : language === "tr"
        ? "tr-TR"
        : "en-US";

  const [periodDays, setPeriodDays] = useState(7);
  const [activeDashboardTab, setActiveDashboardTab] = useState("overview");

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
        ? formatActiveAccountsDetail(data.activeUsers, language, locale)
        : formatAccountsTotalDetail(data.totalUsers, language, locale),
      icon: UsersRound,
      tone: "bg-[#EAF4F3] text-[#216474]",
    },
    {
      label: isAllTime ? "الصيدليات" : "صيدليات جديدة",
      value: isAllTime ? data.totalPharmacies : data.newPharmaciesInPeriod,
      detail: isAllTime
        ? formatApprovedDetail(data.approvedPharmacies, language, locale)
        : formatPharmaciesTotalDetail(data.totalPharmacies, language, locale),
      icon: Building2,
      tone: "bg-[#FFF7DF] text-[#DFAE0D]",
    },
    {
      label: isAllTime ? "المنظمات" : "منظمات جديدة",
      value: isAllTime
        ? data.totalOrganizations
        : data.newOrganizationsInPeriod,
      detail: isAllTime
        ? formatApprovedDetail(data.approvedOrganizations, language, locale)
        : formatOrganizationsTotalDetail(
            data.totalOrganizations,
            language,
            locale,
          ),
      icon: HeartHandshake,
      tone: "bg-[#F0F6F7] text-[#52727A]",
    },
    {
      label: "طلبات الأدوية",
      value: data.totalMedicineRequests,
      detail: formatActiveRequestsDetail(
        data.activeMedicineRequests,
        language,
        locale,
      ),
      icon: PackageSearch,
      tone: "bg-[#EAF4F3] text-[#174B57]",
    },
  ];

  const queues = [
    {
      label: t("تراخيص صيدليات بانتظار القرار"),
      value: data.pendingPharmacies,
      to: "/app/approvals?tab=pharmacies",
      icon: Building2,
    },
    {
      label: t("منظمات صحية بانتظار الاعتماد"),
      value: data.pendingOrganizations,
      to: "/app/approvals?tab=organizations",
      icon: HeartHandshake,
    },
    {
      label: t("ملفات امتثال تحتاج مراجعة"),
      value: data.pendingOrganizationVerifications,
      to: "/app/approvals?tab=organizations",
      icon: ShieldCheck,
    },
  ];

  const requestSegments = [
    {
      label: "قيد الانتظار",
      value: data.pendingMedicineRequests,
      color: "#DFAE0D",
    },
    {
      label: "متوفر",
      value: data.availableMedicineRequests,
      color: "#216474",
    },
    {
      label: "غير متوفر",
      value: data.unavailableMedicineRequests,
      color: "#E11D48",
    },
    {
      label: "ملغي",
      value: data.cancelledMedicineRequests,
      color: "#829499",
    },
  ];

  const accountSegments = [
    {
      label: "المستخدمون",
      value: data.totalUsers,
      color: "bg-[#216474]",
    },
    {
      label: "الصيدليات",
      value: data.totalPharmacies,
      color: "bg-[#DFAE0D]",
    },
    {
      label: "المنظمات",
      value: data.totalOrganizations,
      color: "bg-[#6E969E]",
    },
  ];

  const totalAccounts =
    data.totalUsers + data.totalPharmacies + data.totalOrganizations;

  const pharmacyApprovalRate = percentage(
    data.approvedPharmacies,
    data.totalPharmacies,
  );

  const organizationApprovalRate = percentage(
    data.approvedOrganizations,
    data.totalOrganizations,
  );

  const activeUserRate = percentage(data.activeUsers, data.totalUsers);
  const pendingApprovalTotal =
    data.pendingPharmacies +
    data.pendingOrganizations +
    data.pendingOrganizationVerifications;
  const processedMedicineRequests =
    data.availableMedicineRequests + data.unavailableMedicineRequests;
  const medicineProcessingRate = percentage(
    processedMedicineRequests,
    data.totalMedicineRequests,
  );
  const demographicUsersTotal = Number(data.demographicUsersTotal || 0);
  const usersWithKnownAge = Number(data.usersWithKnownAge || 0);
  const usersWithKnownLocation = Number(data.usersWithKnownLocation || 0);
  const ageGroups = Array.isArray(data.ageGroups) ? data.ageGroups : [];
  const geographicDistribution = Array.isArray(data.geographicDistribution)
    ? data.geographicDistribution
    : [];
  const knownAgeRate = percentage(usersWithKnownAge, demographicUsersTotal);
  const knownLocationRate = percentage(
    usersWithKnownLocation,
    demographicUsersTotal,
  );
  const regionsCovered = geographicDistribution.filter(
    (item) => Number(item.count || 0) > 0,
  ).length;
  const audienceStrengths = [
    {
      label: "الحسابات النشطة",
      value: `${activeUserRate.toLocaleString(locale)}%`,
      detail: `${data.activeUsers.toLocaleString(locale)} حساب نشط من إجمالي حسابات المنصة`,
    },
    {
      label: "معالجة طلبات الدواء",
      value: `${medicineProcessingRate.toLocaleString(locale)}%`,
      detail: `${processedMedicineRequests.toLocaleString(locale)} طلباً وصل إلى نتيجة`,
    },
    {
      label: "الانتشار الجغرافي المرصود",
      value: regionsCovered.toLocaleString(locale),
      detail: "مناطق ظهرت فيها مواقع مستخدمين محفوظة بصورة مجمعة",
    },
  ];
  const audienceGaps = [
    {
      label: "ملفات عمرية غير مكتملة",
      value: Math.max(
        demographicUsersTotal - usersWithKnownAge,
        0,
      ).toLocaleString(locale),
      detail: "لا تدخل في توزيع الفئات العمرية حتى يستكمل المستخدم تاريخ الميلاد",
    },
    {
      label: "مواقع غير متاحة للتحليل",
      value: Math.max(
        demographicUsersTotal - usersWithKnownLocation,
        0,
      ).toLocaleString(locale),
      detail: "مستخدمون لم يحفظوا موقعاً؛ لا يتم تخمين منطقتهم حفاظاً على الدقة",
    },
    {
      label: "طلبات تحتاج تدخلاً",
      value: (
        data.pendingMedicineRequests + data.unavailableMedicineRequests
      ).toLocaleString(locale),
      detail: "طلبات معلقة أو تعذر تأمينها وتستحق المتابعة التشغيلية",
    },
  ];
  const executiveSummary = `يغطي هذا التقرير ${activePeriodLabel} ويقدم قراءة رقابية مجمعة لحركة المنصة. بلغ عدد الحسابات المسجلة ${totalAccounts.toLocaleString(locale)} حسابًا، منها ${data.activeUsers.toLocaleString(locale)} مستخدمًا نشطًا. وتوجد حاليًا ${pendingApprovalTotal.toLocaleString(locale)} ملفات اعتماد أو امتثال تحتاج إلى مراجعة، مقابل ${data.totalMedicineRequests.toLocaleString(locale)} طلب دواء بنسبة معالجة بلغت ${medicineProcessingRate.toLocaleString(locale)}%. كما سجلت المنصة ${data.totalDonationOffers.toLocaleString(locale)} عرض تبرع و${data.totalAssistanceRequests.toLocaleString(locale)} طلب مساعدة خلال النطاق المعروض.`;
  const reportNarrativeSections = [
    {
      title: "الحوكمة والاعتماد",
      text: `بلغت نسبة اعتماد الصيدليات ${pharmacyApprovalRate.toLocaleString(locale)}%، ونسبة اعتماد المنظمات ${organizationApprovalRate.toLocaleString(locale)}%. ويبلغ إجمالي الملفات التي تنتظر قرارًا أو استكمال مراجعة ${pendingApprovalTotal.toLocaleString(locale)} ملفًا، ما يستلزم ترتيب الأولويات وفق مدة الانتظار واكتمال الوثائق ومستوى المخاطر.`,
    },
    {
      title: "الاستجابة لطلبات الدواء",
      text: `استقبلت المنصة ${data.totalMedicineRequests.toLocaleString(locale)} طلب دواء؛ منها ${data.pendingMedicineRequests.toLocaleString(locale)} قيد الانتظار، و${data.availableMedicineRequests.toLocaleString(locale)} تم تأمينها، و${data.unavailableMedicineRequests.toLocaleString(locale)} تعذر تأمينها، و${data.cancelledMedicineRequests.toLocaleString(locale)} ألغيت. تعكس نسبة المعالجة الحالية البالغة ${medicineProcessingRate.toLocaleString(locale)}% مستوى الاستجابة التشغيلي خلال الفترة.`,
    },
    {
      title: "الطلب المجتمعي والنشاط",
      text: `سجل محرك البحث ${data.totalSearches.toLocaleString(locale)} عملية بحث، وانضم ${data.newUsersInPeriod.toLocaleString(locale)} مستخدم جديد خلال ${activePeriodLabel}. تساعد هذه المؤشرات في رصد تغير الطلب المجتمعي وتحديد الأدوية والمناطق التي تستدعي تنسيقًا مبكرًا.`,
    },
    {
      title: "التبرعات والمساعدة",
      text: `بلغ عدد عروض التبرع ${data.totalDonationOffers.toLocaleString(locale)} عرضًا، منها ${data.pendingDonationOffers.toLocaleString(locale)} بانتظار المراجعة. كما سُجل ${data.totalAssistanceRequests.toLocaleString(locale)} طلب مساعدة، وما يزال ${data.openAssistanceRequests.toLocaleString(locale)} منها مفتوحًا ويحتاج إلى متابعة الجهات المختصة.`,
    },
  ];
  const reportRecommendations = [
    pendingApprovalTotal > 0
      ? `إعطاء أولوية لمراجعة ملفات الاعتماد والامتثال البالغ عددها ${pendingApprovalTotal.toLocaleString(locale)} ملفًا، مع توثيق سبب التأخير والقرار النهائي لكل ملف.`
      : "الاستمرار في المراجعة الدورية لحالة تراخيص الصيدليات والمنظمات والمحافظة على زمن اعتماد منخفض.",
    data.pendingMedicineRequests > 0
      ? `متابعة طلبات الدواء المعلقة البالغ عددها ${data.pendingMedicineRequests.toLocaleString(locale)} طلبًا، وتصنيفها حسب مدة الانتظار والمنطقة وأهمية الدواء.`
      : "المحافظة على آلية الاستجابة الحالية مع مراقبة أي ارتفاع مفاجئ في الطلبات الجديدة.",
    data.unavailableMedicineRequests > 0
      ? `تحليل الأدوية التي تعذر تأمينها في ${data.unavailableMedicineRequests.toLocaleString(locale)} طلبًا وربطها بمؤشرات المخزون والتوريد لاكتشاف النقص المتكرر.`
      : "مواصلة الربط بين مؤشرات الطلب والمخزون للتنبؤ المبكر بأي نقص محتمل.",
    data.pendingDonationOffers > 0
      ? `استكمال مراجعة ${data.pendingDonationOffers.toLocaleString(locale)} عرض تبرع مع التحقق من الصلاحية وسلامة العبوات والجهة المستفيدة قبل الاعتماد.`
      : "الاستمرار في توثيق دورة التبرع من العرض حتى التسليم مع الالتزام بضوابط السلامة الدوائية.",
    "الحفاظ على عرض المؤشرات بصورة مجمعة، وعدم تضمين البيانات الصحية الشخصية أو أرقام التواصل أو التفاصيل المالية في التقارير الرقابية العامة.",
  ];

  const ministryScopes = [
    {
      title: t("الحوكمة والترخيص"),
      description: t("اعتماد المنشآت الصحية ومراجعة وثائقها وحالة امتثالها."),
      to: "/app/approvals",
      icon: ShieldCheck,
      badge: t("{{count}} قيد المراجعة", {
        count: (
          data.pendingPharmacies +
          data.pendingOrganizations +
          data.pendingOrganizationVerifications
        ).toLocaleString(locale),
      }),
      tone: "bg-[#EAF4F3] text-[#216474]",
    },
    {
      title: t("أمن الإمداد الدوائي"),
      description: t(
        "رصد الطلبات والشحنات والتأخير والاستدعاءات بمؤشرات مجمعة.",
      ),
      to: "/app/supply-chain",
      icon: Warehouse,
      badge: t("مراقبة وطنية"),
      tone: "bg-[#FFF7DF] text-[#A66F00]",
    },
    {
      title: t("الاستجابة الدوائية"),
      description: t(
        "متابعة البلاغات العاجلة وضغط طلبات الأدوية دون كشف صحي غير لازم.",
      ),
      to: "/app/sos",
      icon: ShieldAlert,
      badge: t("{{count}} طلب بانتظار المعالجة", {
        count: data.pendingMedicineRequests.toLocaleString(locale),
      }),
      tone: "bg-[#FFF1F2] text-[#C6424E]",
    },
    {
      title: t("التوعية والتعاميم"),
      description: t(
        "نشر التنبيهات والإرشادات الرسمية للمستخدمين والمنشآت المستهدفة.",
      ),
      to: "/app/home-ticker",
      icon: Megaphone,
      badge: t("قناة رسمية"),
      tone: "bg-[#F0F6F7] text-[#52727A]",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <Motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative isolate w-full overflow-hidden rounded-[16px] bg-[#10505A] px-5 py-7 text-white shadow-[0_22px_55px_rgba(23,75,87,.14)] sm:min-h-[250px] sm:px-7 sm:py-8 lg:min-h-[271px] lg:px-10"
      >
        {/* Desktop / Tablet background image */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 hidden bg-cover bg-[position:38%_center] bg-no-repeat sm:block"
          style={{ backgroundImage: `url("${ADMIN_HERO_IMAGE}")` }}
        />

        {/* Desktop / Tablet gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden bg-[linear-gradient(270deg,#10505A_0%,rgba(16,80,90,.88)_36%,rgba(33,100,116,.42)_70%,rgba(33,100,116,.08)_100%)] sm:block"
        />

        <div className="noise absolute inset-0 -z-[5] opacity-30" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[#A7DDD8]">
              <Landmark size={17} />
              {t("وزارة الصحة — مركز الرصد الدوائي الوطني")}
            </p>

            <h2 className="mt-2 max-w-3xl text-3xl font-black sm:text-4xl">
              {t("المشهد الصحي والدوائي على مستوى المنصة")}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-white/60">
              {t(
                "رقابة مجمعة على الاعتمادات وتوفر الدواء والاستجابة العامة؛ مع حماية التفاصيل الطبية والمالية الخاصة.",
              )}{" "}
              — {activePeriodLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <label className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-white/90 bg-white px-4 py-2.5 text-[#17363e] shadow-[0_10px_28px_rgba(4,45,53,.14)]">
              <CalendarRange size={17} className="text-[#DFAE0D]" />

              <span className="text-xs font-bold text-[#71858a]">عرض نشاط</span>

              <select
                value={periodDays}
                onChange={(event) => setPeriodDays(Number(event.target.value))}
                className="cursor-pointer bg-transparent py-1 text-sm font-black text-[#17363e] outline-none [&>option]:text-[#333333]"
              >
                <option value={1}>آخر 24 ساعة</option>
                <option value={7}>آخر 7 أيام</option>
                <option value={30}>آخر 30 يومًا</option>
                <option value={90}>آخر 3 أشهر</option>
                <option value={0}>كل الوقت</option>
              </select>
            </label>

            <div className="min-h-[46px] rounded-xl border border-white/90 bg-white px-4 py-3 text-xs text-[#17363e] shadow-[0_8px_24px_rgba(4,45,53,.12)]">
              {query.isFetching ? (
                <strong className="inline-flex items-center gap-2 text-[#f5cb72]">
                  <span className="size-2 animate-pulse rounded-full bg-[#f5cb72]" />
                  جاري تحديث الفترة...
                </strong>
              ) : (
                <>
                  <span className="text-[#71858a]">آخر تحديث: </span>
                  <strong>{formatDate(data.generatedAtUtc, true)}</strong>
                </>
              )}
            </div>
          </div>
        </div>
      </Motion.section>

      <nav
        className="grid overflow-hidden rounded-2xl border border-[#174B57]/10 bg-white p-1.5 shadow-[0_8px_26px_rgba(23,75,87,.05)] sm:grid-cols-2"
        aria-label="أقسام لوحة الوزارة"
      >
        <DashboardTabButton
          active={activeDashboardTab === "overview"}
          onClick={() => setActiveDashboardTab("overview")}
          icon={Landmark}
          title="النظرة الرقابية"
          description="الاعتمادات والطلبات ومؤشرات التشغيل"
        />
        <DashboardTabButton
          active={activeDashboardTab === "audience"}
          onClick={() => setActiveDashboardTab("audience")}
          icon={UsersRound}
          title="تحليل مستخدمي المنصة"
          description="الأعمار والانتشار الجغرافي وجودة البيانات"
        />
      </nav>

      {activeDashboardTab === "audience" ? (
        <AudienceInsightsSection
          demographicUsersTotal={demographicUsersTotal}
          usersWithKnownAge={usersWithKnownAge}
          usersWithKnownLocation={usersWithKnownLocation}
          knownAgeRate={knownAgeRate}
          knownLocationRate={knownLocationRate}
          regionsCovered={regionsCovered}
          ageGroups={ageGroups}
          geographicDistribution={geographicDistribution}
          audienceStrengths={audienceStrengths}
          audienceGaps={audienceGaps}
          locale={locale}
        />
      ) : (
        <>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ministryScopes.map(
          ({ title, description, to, icon: Icon, badge, tone }, index) => (
            <Motion.article
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group flex min-h-[205px] flex-col rounded-[1.45rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_12px_34px_rgba(23,75,87,.05)] transition hover:-translate-y-1 hover:border-[#216474]/20 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid size-12 place-items-center rounded-2xl ${tone}`}
                >
                  <Icon size={22} />
                </span>
                <span className="rounded-full bg-[#F5F9F9] px-3 py-1.5 text-[10px] font-black text-[#60777D]">
                  {badge}
                </span>
              </div>

              <h3 className="mt-5 font-black text-[#17363E]">{title}</h3>
              <p className="mt-2 flex-1 text-xs leading-6 text-[#71858A]">
                {description}
              </p>

              <Link
                to={to}
                className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#216474]"
              >
                {t("فتح نطاق الرقابة")}
                <ArrowLeft
                  size={15}
                  className="transition group-hover:-translate-x-1"
                />
              </Link>
            </Motion.article>
          ),
        )}
      </section>

      <AiServicesHealthPanel />

      <section
        className={`grid gap-4 transition sm:grid-cols-2 xl:grid-cols-4 ${
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

              <Activity size={17} className="text-[#C8DADD]" />
            </div>

            <p className="mt-5 text-sm font-semibold text-[#71858a]">{label}</p>

            <p className="mt-1 text-3xl font-black text-[#17363e]">
              {value.toLocaleString(locale)}
            </p>

            <p className="mt-2 text-xs text-[#A5A5A5]">{detail}</p>
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
          <div className="flex items-center justify-between border-b border-[#E6EEF0] px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
                <PieChart size={20} />
              </span>

              <div>
                <h3 className="font-black text-[#17363e]">
                  {t("مؤشر الاستجابة لطلبات الدواء")}
                </h3>

                <p className="mt-0.5 text-xs text-[#A5A5A5]">
                  توزيع طلبات الأدوية خلال {activePeriodLabel}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#F4F8F8] px-3 py-1.5 text-xs font-black text-[#216474]">
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
                  className="flex items-center gap-3 rounded-xl bg-[#F8FBFB] px-4 py-3"
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

                  <span className="w-10 text-end text-[11px] text-[#A5A5A5]">
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
              <h3 className="font-black text-[#17363e]">
                {t("سجل الجهات والأفراد على المنصة")}
              </h3>

              <p className="mt-1 text-xs text-[#A5A5A5]">
                لقطة حالية لإجمالي الحسابات ونسب جاهزيتها
              </p>
            </div>

            <span className="grid size-11 place-items-center rounded-xl bg-[#F0F6F7] text-[#52727A]">
              <UsersRound size={20} />
            </span>
          </div>

          <div className="mt-7 flex h-4 overflow-hidden rounded-full bg-[#F0F6F7]">
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

          <div className="mt-4 grid grid-cols-3 gap-2">
            {accountSegments.map((segment) => (
              <div key={segment.label} className="text-center">
                <strong className="block text-lg font-black text-[#17363e]">
                  {segment.value.toLocaleString(locale)}
                </strong>

                <span className="text-[11px] text-[#A5A5A5]">
                  {segment.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-4">
            <ProgressMetric
              label="نشاط المستخدمين"
              value={activeUserRate}
              color="bg-[#216474]"
              locale={locale}
            />

            <ProgressMetric
              label="اعتماد الصيدليات"
              value={pharmacyApprovalRate}
              color="bg-[#DFAE0D]"
              locale={locale}
            />

            <ProgressMetric
              label="اعتماد المنظمات"
              value={organizationApprovalRate}
              color="bg-[#52727A]"
              locale={locale}
            />
          </div>
        </article>
      </section>

      <ReportActions
        title={t("التقرير الرقابي لوزارة الصحة")}
        description={t(
          "تصدير المؤشرات الوطنية المجمعة والاعتمادات والطلبات للفترة المحددة؛ من دون بيانات صحية شخصية أو تفاصيل مالية خاصة.",
        )}
        filename="ministry-health-oversight-report"
        periodLabel={activePeriodLabel}
        executiveSummary={executiveSummary}
        narrativeSections={reportNarrativeSections}
        recommendations={reportRecommendations}
        rows={[
          ["الفترة بالأيام", activePeriodDays || "كل الوقت"],
          ["إجمالي الحسابات المسجلة", totalAccounts],
          ["إجمالي المستخدمين", data.totalUsers],
          ["المستخدمون النشطون", data.activeUsers],
          ["مستخدمون جدد خلال الفترة", data.newUsersInPeriod],
          ["المستخدمون الأفراد ضمن التحليل الديموغرافي", demographicUsersTotal],
          ["ملفات مكتملة العمر", usersWithKnownAge],
          ["نسبة اكتمال بيانات العمر", `${knownAgeRate}%`],
          ["مستخدمون ذوو موقع محفوظ", usersWithKnownLocation],
          ["نسبة اكتمال بيانات الموقع", `${knownLocationRate}%`],
          ["عدد المناطق الجغرافية المرصودة", regionsCovered],
          ...ageGroups.map((item) => [
            `الفئة العمرية: ${item.label}`,
            item.count,
          ]),
          ...geographicDistribution.map((item) => [
            `التوزيع الجغرافي: ${item.label}`,
            item.count,
          ]),
          ["إجمالي الصيدليات", data.totalPharmacies],
          ["الصيدليات المعتمدة", data.approvedPharmacies],
          ["نسبة اعتماد الصيدليات", `${pharmacyApprovalRate}%`],
          ["صيدليات بانتظار القرار", data.pendingPharmacies],
          ["إجمالي المنظمات", data.totalOrganizations],
          ["المنظمات المعتمدة", data.approvedOrganizations],
          ["نسبة اعتماد المنظمات", `${organizationApprovalRate}%`],
          ["منظمات بانتظار القرار", data.pendingOrganizations],
          ["ملفات امتثال تحتاج مراجعة", data.pendingOrganizationVerifications],
          ["طلبات الأدوية", data.totalMedicineRequests],
          ["الطلبات النشطة", data.activeMedicineRequests],
          ["طلبات بانتظار المعالجة", data.pendingMedicineRequests],
          ["طلبات تم تأمينها", data.availableMedicineRequests],
          ["طلبات تعذر تأمينها", data.unavailableMedicineRequests],
          ["طلبات ملغاة", data.cancelledMedicineRequests],
          ["نسبة معالجة طلبات الدواء", `${medicineProcessingRate}%`],
          ["عمليات البحث", data.totalSearches],
          ["عروض التبرع", data.totalDonationOffers],
          ["عروض التبرع المعلقة", data.pendingDonationOffers],
          ["طلبات المساعدة", data.totalAssistanceRequests],
          ["طلبات المساعدة المفتوحة", data.openAssistanceRequests],
        ]}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard
          icon={TrendingUp}
          label={`عمليات البحث — ${activePeriodLabel}`}
          value={data.totalSearches}
          detail={`${data.newUsersInPeriod.toLocaleString(
            locale,
          )} حساب مستخدم جديد`}
          tone="bg-[#EAF4F3] text-[#216474]"
          locale={locale}
        />

        <InsightCard
          icon={HeartHandshake}
          label={`عروض التبرع المعلّقة — ${activePeriodLabel}`}
          value={data.pendingDonationOffers}
          detail={`من أصل ${data.totalDonationOffers.toLocaleString(
            locale,
          )} عرض خلال الفترة`}
          tone="bg-[#F0F6F7] text-[#60777D]"
          locale={locale}
        />

        <InsightCard
          icon={ShieldCheck}
          label={`طلبات المساعدة المفتوحة — ${activePeriodLabel}`}
          value={data.openAssistanceRequests}
          detail={`من أصل ${data.totalAssistanceRequests.toLocaleString(
            locale,
          )} طلب خلال الفترة`}
          tone="bg-[#EAF4F3] text-[#216474]"
          locale={locale}
        />
      </section>

      <section className="grid gap-5">
        <div className="self-start overflow-hidden rounded-[1.5rem] border border-[#174b57]/8 bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6EEF0] bg-[#FAFCFC] px-6 py-5">
            <div>
              <h3 className="font-extrabold text-[#17363e]">
                {t("مؤشر التدخل الرقابي")} — {activePeriodLabel}
              </h3>

              <p className="mt-1 text-sm text-[#A5A5A5]">
                متابعة الحالات التي قد تستدعي تدخلاً أو تنسيقاً خلال{" "}
                {activePeriodLabel}
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
                  "bg-[#EAF4F3] text-[#174B57] border-[#CFE4E7]",
                  "bg-[#FFF7DF] text-[#DFAE0D] border-amber-100",
                  "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]",
                  "bg-[#F8FBFB] text-[#60777D] border-[#DCE8EA]",
                ];

                return (
                  <div
                    key={item.status}
                    className={`flex items-center gap-4 rounded-2xl border p-4 ${
                      styles[index % styles.length]
                    }`}
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
            <span className="grid size-10 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
              <Search size={19} />
            </span>

            <div>
              <h3 className="font-extrabold text-[#17363e]">
                {t("مؤشر الطلب المجتمعي على الأدوية")}
              </h3>

              <p className="text-xs text-[#A5A5A5]">
                إجمالي البحث خلال {activePeriodLabel}:{" "}
                {data.totalSearches.toLocaleString(locale)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {data.topSearchQueries.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {data.topSearchQueries.map((item, index) => (
                  <div
                    key={item.query}
                    className="flex items-center gap-3 rounded-xl bg-[#F8FBFB] p-3"
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
                title={t("لا توجد عمليات بحث")}
                description={t("لم تُسجل عبارات بحث حتى الآن.")}
              />
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-[#174b57]/8 bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
        <div className="flex flex-col gap-4 border-b border-[#174b57]/8 bg-gradient-to-l from-[#FAFCFC] to-[#F4F8F8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-7">
          <div>
            <h3 className="font-extrabold text-[#17363e]">
              {t("أحدث بلاغات توفر الأدوية")}
            </h3>

            <p className="mt-1 text-sm text-[#A5A5A5]">
              {t("عرض رقابي محدود لآخر الحالات ضمن")} {activePeriodLabel}
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
            <table className="w-full min-w-[780px] table-fixed border-separate border-spacing-0 text-start text-sm">
              <thead className="bg-[#EAF4F3]">
                <tr className="text-xs text-[#71858a]">
                  <th className="w-[24%] rounded-s-xl px-5 py-4 font-black">
                    رقم الحالة
                  </th>

                  <th className="w-[24%] px-5 py-4 font-black">
                    الدواء المطلوب
                  </th>

                  <th className="w-[22%] px-5 py-4 font-black">
                    نطاق الخصوصية
                  </th>

                  <th className="w-[15%] px-5 py-4 font-black">الحالة</th>

                  <th className="w-[15%] rounded-e-xl px-5 py-4 font-black">
                    التاريخ
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.recentMedicineRequests.map((request) => (
                  <tr
                    key={request.requestId}
                    className="group transition odd:bg-white even:bg-[#FAFCFC] hover:bg-[#EAF4F3]"
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
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#EAF4F3] text-[#216474]">
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
                      <div className="flex min-w-0 items-center gap-2">
                        <ShieldCheck
                          size={15}
                          className="shrink-0 text-[#216474]"
                        />
                        <span className="block truncate text-xs font-bold text-[#60777c]">
                          {t("بيانات الأطراف محمية")}
                        </span>
                      </div>
                    </td>

                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black ${requestStatusTone(
                          request.status,
                        )}`}
                      >
                        {formatRequestStatus(request.status)}
                      </span>
                    </td>

                    <td className="border-b border-[#174b57]/7 px-5 py-4">
                      <span
                        className="inline-flex whitespace-nowrap rounded-lg bg-[#F8FBFB] px-2.5 py-2 font-mono text-[11px] font-bold text-[#829499]"
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
        </>
      )}
    </div>
  );
}

function DashboardTabButton({ active, onClick, icon: Icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[70px] items-center gap-3 rounded-xl px-4 py-3 text-start transition ${
        active
          ? "bg-[#216474] text-white shadow-[0_10px_26px_rgba(33,100,116,.18)]"
          : "text-[#526C72] hover:bg-[#EEF6F6]"
      }`}
      aria-pressed={active}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          active ? "bg-white/12 text-[#C9F1E9]" : "bg-[#EAF4F3] text-[#216474]"
        }`}
      >
        <Icon size={19} />
      </span>
      <span className="min-w-0">
        <strong className="block text-sm font-black">{title}</strong>
        <small
          className={`mt-1 block text-[11px] ${
            active ? "text-white/65" : "text-[#8A9A9E]"
          }`}
        >
          {description}
        </small>
      </span>
    </button>
  );
}

function AudienceInsightsSection({
  demographicUsersTotal,
  usersWithKnownAge,
  usersWithKnownLocation,
  knownAgeRate,
  knownLocationRate,
  regionsCovered,
  ageGroups,
  geographicDistribution,
  audienceStrengths,
  audienceGaps,
  locale,
}) {
  return (
    <Motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[1.7rem] border border-[#174b57]/10 bg-white shadow-[0_18px_48px_rgba(23,75,87,.07)]"
    >
      <div className="grid bg-[#0B4E59] lg:grid-cols-[1.06fr_.94fr]">
        <div className="relative flex min-h-[390px] flex-col justify-center overflow-hidden px-6 py-9 text-white sm:px-9 lg:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(70,180,164,.22),transparent_38%),linear-gradient(145deg,#0B4E59_0%,#083E47_100%)]"
          />
          <div className="noise absolute inset-0 opacity-20" />

          <div className="relative max-w-2xl">
            <span className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-[#C7F0E9] backdrop-blur">
              قراءة مجمعة تحمي خصوصية الأفراد
            </span>
            <h3 className="mt-5 max-w-xl text-2xl font-black leading-[1.45] sm:text-3xl">
              من يستخدم منصة دوائي وأين يصل أثرها؟
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
              مؤشرات فعلية محسوبة من الحسابات الفردية التي استكملت بياناتها،
              وليست أرقاماً افتراضية. تُعرض المناطق والفئات العمرية بصورة
              إجمالية من دون أسماء أو مواقع دقيقة.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <AudienceHeroMetric
                icon={UsersRound}
                value={demographicUsersTotal}
                label="مستخدم فرد"
                locale={locale}
              />
              <AudienceHeroMetric
                icon={UserRoundCheck}
                value={`${knownAgeRate}%`}
                label="اكتمال بيانات العمر"
                locale={locale}
              />
              <AudienceHeroMetric
                icon={MapPinned}
                value={regionsCovered}
                label="منطقة مرصودة"
                locale={locale}
              />
            </div>
          </div>
        </div>

        <div className="relative min-h-[280px] overflow-hidden sm:min-h-[340px] lg:min-h-[390px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-[position:25%_center] bg-no-repeat transition duration-700 hover:scale-[1.02]"
            style={{ backgroundImage: `url("${AUDIENCE_INSIGHTS_IMAGE}")` }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(270deg,rgba(8,62,71,.72)_0%,rgba(8,62,71,.08)_35%,transparent_70%)]"
          />
          <div className="absolute bottom-5 left-5 rounded-xl border border-white/25 bg-[#073D46]/70 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md">
            وصول صحي رقمي لمختلف الأعمار والمناطق
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-[#F7FAFA] p-5 sm:p-6">
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <DistributionPanel
            title="الفئات العمرية"
            description={`يعتمد على ${usersWithKnownAge.toLocaleString(locale)} ملفاً مكتمل العمر`}
            items={ageGroups}
            total={usersWithKnownAge}
            locale={locale}
            emptyMessage="لا توجد تواريخ ميلاد مكتملة بعد."
          />
          <DistributionPanel
            title="الانتشار الجغرافي"
            description={`يعتمد على ${usersWithKnownLocation.toLocaleString(locale)} موقعاً محفوظاً`}
            items={geographicDistribution.slice(0, 7)}
            total={usersWithKnownLocation}
            locale={locale}
            emptyMessage="لا توجد مواقع مستخدمين صالحة للتحليل بعد."
          />
        </div>

        <article className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#EAF7F3] text-emerald-700">
              <TrendingUp size={20} />
            </span>
            <div>
              <h4 className="font-black text-[#17363E]">قراءة أداء المنصة</h4>
              <p className="mt-1 text-[11px] text-[#829499]">
                إيجابيات واضحة ونقاط تحتاج تحسيناً
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 lg:grid-cols-2">
            <PerformanceInsightList
              title="مؤشرات إيجابية"
              items={audienceStrengths}
              tone="positive"
            />
            <PerformanceInsightList
              title="فجوات ومخاطر"
              items={audienceGaps}
              tone="warning"
            />
          </div>
        </article>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E3ECEC] bg-white px-6 py-4 text-[11px] text-[#71858A]">
        <span>
          التوزيع الجغرافي يربط GPS المحفوظ بأقرب مركز محافظة باستخدام
          Haversine، ولا يعرض الإحداثيات الأصلية.
        </span>
        <span className="font-bold text-[#216474]">
          اكتمال الموقع: {knownLocationRate.toLocaleString(locale)}%
        </span>
      </div>
    </Motion.section>
  );
}

function AudienceHeroMetric({ icon: Icon, value, label, locale }) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString(locale) : value;

  return (
    <div className="rounded-xl border border-white/14 bg-[#083F48]/65 p-3.5 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-white/10 text-[#BCEDE4]">
          <Icon size={16} />
        </span>
        <strong className="text-xl font-black">{formattedValue}</strong>
      </div>
      <span className="mt-2 block text-[11px] text-white/65">{label}</span>
    </div>
  );
}

function DistributionPanel({
  title,
  description,
  items,
  total,
  locale,
  emptyMessage,
}) {
  const visibleItems = items.filter((item) => Number(item.count || 0) > 0);

  return (
    <article className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5">
      <h4 className="font-black text-[#17363E]">{title}</h4>
      <p className="mt-1 text-[11px] text-[#829499]">{description}</p>

      {visibleItems.length ? (
        <div className="mt-5 space-y-4">
          {visibleItems.map((item, index) => {
            const share = percentage(item.count, total);

            return (
              <div key={item.key || item.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-bold text-[#526C72]">
                    {item.label}
                  </span>
                  <span className="shrink-0 text-[#17363E]">
                    <strong>{Number(item.count).toLocaleString(locale)}</strong>
                    <small className="ms-1 text-[#93A3A6]">
                      ({share.toLocaleString(locale)}%)
                    </small>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#EDF4F4]">
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${share}%` }}
                    transition={{ duration: 0.7, delay: index * 0.06 }}
                    className="h-full rounded-full bg-gradient-to-l from-[#16816F] to-[#216474]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[#CFE0E1] bg-[#F8FBFB] px-4 py-8 text-center text-xs text-[#829499]">
          {emptyMessage}
        </div>
      )}
    </article>
  );
}

function PerformanceInsightList({ title, items, tone }) {
  const positive = tone === "positive";

  return (
    <div className="mt-5">
      <strong
        className={`text-xs ${positive ? "text-emerald-700" : "text-amber-700"}`}
      >
        {title}
      </strong>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border px-3 py-2.5 ${
              positive
                ? "border-emerald-100 bg-emerald-50/60"
                : "border-amber-100 bg-amber-50/70"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-[#526C72]">
                {item.label}
              </span>
              <strong
                className={`text-sm ${positive ? "text-emerald-700" : "text-amber-700"}`}
              >
                {item.value}
              </strong>
            </div>
            <p className="mt-1 text-[10px] leading-5 text-[#829499]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatActiveAccountsDetail(count, language, locale) {
  const formattedCount = Number(count || 0).toLocaleString(locale);

  if (language === "en") {
    return `${formattedCount} active accounts`;
  }

  if (language === "tr") {
    return `${formattedCount} etkin hesap`;
  }

  return `${formattedCount} حساب نشط`;
}

function formatAccountsTotalDetail(count, language, locale) {
  const formattedCount = Number(count || 0).toLocaleString(locale);

  if (language === "en") {
    return `Out of ${formattedCount} accounts`;
  }

  if (language === "tr") {
    return `Toplam ${formattedCount} hesaptan`;
  }

  return `من أصل ${formattedCount} حساب`;
}

function formatPharmaciesTotalDetail(count, language, locale) {
  const formattedCount = Number(count || 0).toLocaleString(locale);

  if (language === "en") {
    return `Out of ${formattedCount} pharmacies`;
  }

  if (language === "tr") {
    return `Toplam ${formattedCount} eczaneden`;
  }

  return `من أصل ${formattedCount} صيدلية`;
}

function formatOrganizationsTotalDetail(count, language, locale) {
  const formattedCount = Number(count || 0).toLocaleString(locale);

  if (language === "en") {
    return `Out of ${formattedCount} organizations`;
  }

  if (language === "tr") {
    return `Toplam ${formattedCount} kuruluştan`;
  }

  return `من أصل ${formattedCount} منظمة`;
}

function formatApprovedDetail(count, language, locale) {
  const formattedCount = Number(count || 0).toLocaleString(locale);

  if (language === "en") {
    return `${formattedCount} approved`;
  }

  if (language === "tr") {
    return `${formattedCount} onaylı`;
  }

  return `${formattedCount} معتمدة`;
}

function formatActiveRequestsDetail(count, language, locale) {
  const formattedCount = Number(count || 0).toLocaleString(locale);

  if (language === "en") {
    return `${formattedCount} active`;
  }

  if (language === "tr") {
    return `${formattedCount} aktif`;
  }

  return `${formattedCount} نشطة`;
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

  if (normalized.includes("available")) {
    return normalized.includes("unavailable")
      ? "bg-[#FFF1F2] text-[#E11D48]"
      : "bg-[#EAF4F3] text-[#174B57]";
  }

  if (normalized.includes("cancel")) {
    return "bg-[#F0F6F7] text-[#60777D]";
  }

  return "bg-[#FFF7DF] text-[#DFAE0D]";
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

  const segmentsWithOffset = segments.map((segment, index) => ({
    ...segment,
    offset: segments
      .slice(0, index)
      .reduce(
        (sum, item) => sum + (item.value / Math.max(total, 1)) * circumference,
        0,
      ),
  }));

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

        {segmentsWithOffset.map((segment) => {
          const length = (segment.value / Math.max(total, 1)) * circumference;

          const element = (
            <Motion.circle
              key={segment.label}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="17"
              strokeLinecap="round"
              initial={{
                strokeDasharray: `0 ${circumference}`,
              }}
              animate={{
                strokeDasharray: `${Math.max(length - 3, 0)} ${circumference}`,
              }}
              transition={{ duration: 0.8 }}
              style={{
                strokeDashoffset: -segment.offset,
              }}
            />
          );

          return element;
        })}
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <strong className="block text-3xl font-black text-[#17363e]">
            {Number(total || 0).toLocaleString(locale)}
          </strong>

          <span className="mt-1 block text-xs text-[#A5A5A5]">
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

      <div className="h-2 overflow-hidden rounded-full bg-[#F0F6F7]">
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

        <small className="mt-1 block truncate text-[#A5A5A5]">{detail}</small>
      </div>
    </article>
  );
}
