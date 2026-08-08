import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Edit3,
  Grid2X2,
  Heart,
  List,
  MapPin,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";
import {
  createOrganizationCampaign,
  deleteOrganizationCampaign,
  getOrganizationCampaigns,
  organizationKeys,
  updateOrganizationCampaign,
  updateOrganizationCampaignStatus,
} from "../api/organizationApi";
import {
  campaignStatuses,
  campaignStatusMeta,
  formatOrgDate,
  toUtcDate,
} from "../utils/organizationFormatters";

const CAMPAIGNS_HERO_IMAGE =
  "/assets/app/organization/organization-dashboard-hero.png";

const initialForm = {
  title: "",
  description: "",
  requestedMedicinesSummary: "",
  city: "",
  area: "",
  isUrgent: false,
  acceptsPublicDonations: true,
  startsAt: "",
  endsAt: "",
};

function toDateInputValue(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}


function useCampaignsLocale() {
  const { t, i18n } = useTranslation();

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

  const isArabic = currentLanguage === "ar";
  const direction = getLanguageDirection(currentLanguage);

  return {
    t,
    currentLanguage,
    isArabic,
    direction,
  };
}

export function OrganizationCampaignsPage() {
  const { t, isArabic, direction } = useCampaignsLocale();
  const client = useQueryClient();

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState(null);
  const [editingCampaignId, setEditingCampaignId] = useState(null);

  const params = {
    status,
    take: 100,
  };

  const query = useQuery({
    queryKey: organizationKeys.campaigns(params),
    queryFn: () => getOrganizationCampaigns(params),
  });

  const refresh = async () =>
    Promise.all([
      client.invalidateQueries({
        queryKey: ["organization", "campaigns"],
      }),
      client.invalidateQueries({
        queryKey: organizationKeys.dashboard,
      }),
    ]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingCampaignId(null);
    setShowForm(false);
  };

  const create = useMutation({
    mutationFn: createOrganizationCampaign,
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم إنشاء الحملة بنجاح."),
      });

      resetForm();
      await refresh();
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const update = useMutation({
    mutationFn: ({ campaignId, payload }) => {
      if (typeof updateOrganizationCampaign !== "function") {
        throw new Error(
          t("واجهة تعديل الحملات غير مضافة بعد داخل organizationApi.js."),
        );
      }

      return updateOrganizationCampaign(campaignId, payload);
    },
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم تعديل الحملة بنجاح."),
      });

      resetForm();
      await refresh();
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text:
          error?.message ||
          getApiErrorMessage(error),
      }),
  });

  const remove = useMutation({
    mutationFn: (campaignId) => {
      if (typeof deleteOrganizationCampaign !== "function") {
        throw new Error(
          t("واجهة حذف الحملات غير مضافة بعد داخل organizationApi.js."),
        );
      }

      return deleteOrganizationCampaign(campaignId);
    },
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم حذف الحملة بنجاح."),
      });

      await refresh();
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text:
          error?.message ||
          getApiErrorMessage(error),
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ campaignId, nextStatus }) =>
      updateOrganizationCampaignStatus(
        campaignId,
        nextStatus,
      ),
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم تحديث حالة الحملة."),
      });

      await refresh();
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const filteredCampaigns = useMemo(() => {
    const normalized = search
      .trim()
      .toLowerCase();

    if (!normalized) {
      return query.data || [];
    }

    return (query.data || []).filter(
      (campaign) =>
        [
          campaign.title,
          campaign.description,
          campaign.requestedMedicinesSummary,
          campaign.city,
          campaign.area,
        ].some((value) =>
          value
            ?.toLowerCase()
            .includes(normalized),
        ),
    );
  }, [query.data, search]);

  const set = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    requestedMedicinesSummary:
      form.requestedMedicinesSummary.trim() || null,
    city: form.city.trim() || null,
    area: form.area.trim() || null,
    isUrgent: form.isUrgent,
    acceptsPublicDonations:
      form.acceptsPublicDonations,
    startsAtUtc: toUtcDate(form.startsAt),
    endsAtUtc: toUtcDate(form.endsAt),
  });

  const submit = (event) => {
    event.preventDefault();
    setNotice(null);

    if (
      form.startsAt &&
      form.endsAt &&
      form.endsAt <= form.startsAt
    ) {
      setNotice({
        ok: false,
        text:
          t("يجب أن يكون تاريخ نهاية الحملة بعد تاريخ بدايتها."),
      });
      return;
    }

    const payload = buildPayload();

    if (editingCampaignId) {
      update.mutate({
        campaignId: editingCampaignId,
        payload,
      });
      return;
    }

    create.mutate(payload);
  };

  const openCreateForm = () => {
    setEditingCampaignId(null);
    setForm(initialForm);
    setNotice(null);
    setShowForm(true);
  };

  const openEditForm = (campaign) => {
    setNotice(null);
    setEditingCampaignId(campaign.campaignId);

    setForm({
      title: campaign.title || "",
      description: campaign.description || "",
      requestedMedicinesSummary:
        campaign.requestedMedicinesSummary || "",
      city: campaign.city || "",
      area: campaign.area || "",
      isUrgent: Boolean(campaign.isUrgent),
      acceptsPublicDonations:
        Boolean(campaign.acceptsPublicDonations),
      startsAt: toDateInputValue(campaign.startsAtUtc),
      endsAt: toDateInputValue(campaign.endsAtUtc),
    });

    setShowForm(true);

    window.requestAnimationFrame(() => {
      document
        .getElementById("organization-campaign-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  const handleDelete = (campaign) => {

    const confirmed = window.confirm(
      t('هل أنت متأكد من حذف الحملة "{{title}}"؟', { title: campaign.title }),
    );

    if (!confirmed) return;

    remove.mutate(campaign.campaignId);
  };

  const formPending =
    create.isPending || update.isPending;

  return (
    <div
      dir={direction}
      lang={isArabic ? "ar" : "en"}
      className="min-h-[calc(100vh-164px)] space-y-5 rounded-2xl bg-[#F4F8F8] p-0"
    >
      {!showForm && (
        <>
      {/* Hero */}
      <section className="relative h-[208px] overflow-hidden rounded-xl bg-[#0d5360] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${CAMPAIGNS_HERO_IMAGE}")`,
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
          isArabic
            ? "bg-[linear-gradient(270deg,rgba(8,78,89,.95)_0%,rgba(8,78,89,.72)_45%,rgba(8,78,89,.18)_100%)]"
            : "bg-[linear-gradient(90deg,rgba(8,78,89,.95)_0%,rgba(8,78,89,.72)_45%,rgba(8,78,89,.18)_100%)]"
        }`}
        />

        <div
          dir="ltr"
          className={`relative z-10 flex h-full w-full items-center justify-between px-8 ${
            isArabic ? "flex-row" : "flex-row-reverse"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              if (showForm && !editingCampaignId) {
                resetForm();
              } else {
                openCreateForm();
              }
            }}
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#216474] transition hover:bg-[#f7fbfb]"
          >
            {showForm && !editingCampaignId ? (
              <X size={18} />
            ) : (
              <Plus size={18} />
            )}

            <span dir={direction}>
              {showForm && !editingCampaignId
                ? t("إغلاق النموذج")
                : t("حملة جديدة")}
            </span>
          </button>

          <div
            dir={direction}
            className={`flex min-w-0 flex-col items-start ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <div
              dir="ltr"
              className={`flex items-center gap-3 ${
                isArabic ? "flex-row justify-end" : "flex-row-reverse justify-end"
              }`}
            >
              <h1
                dir={direction}
                className="text-[28px] font-bold leading-none text-white"
              >
                {t("الحملات الدوائية")}
              </h1>

              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <Heart
                  size={22}
                  strokeWidth={1.8}
                />
              </span>
            </div>

            <p className="mt-4 max-w-[650px] text-sm leading-7 text-white/75">
              {t(
                "أنشئ الحملات وحدد احتياجاتها وموقعها وفترة استقبال التبرعات، ثم تابع حالتها من مكان واحد.",
              )}
            </p>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Notice */}
      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-bold ${
            notice.ok
              ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Create / edit form */}
      {showForm && (
        <section className="w-full bg-[#F4F8F8]">
          <div className="w-full">
            {/* مسار الصفحة */}
            <div
              dir={direction}
              className="mb-4 flex w-full items-center justify-start"
            >
              <div
                dir={direction}
                className="flex items-center justify-start gap-2 text-xs"
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className="font-medium text-[#9AABAE] transition hover:text-[#216474]"
                >
                  الحملات
                </button>

                <ChevronLeft
                  size={14}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#B1BEC1]"
                />

                <span className="rounded-md bg-[#EAF4F3] px-3 py-1.5 font-bold text-[#216474]">
                  {editingCampaignId
                    ? t("تعديل الحملة")
                    : t("إضافة حملة جديدة")}
                </span>
              </div>
            </div>

            <form
              id="organization-campaign-form"
              onSubmit={submit}
              dir={direction}
              className="w-full rounded-xl border border-[#E1EAEC] bg-white px-6 py-6 shadow-[0_4px_18px_rgba(23,75,87,.035)] md:px-7 md:py-7"
            >
              <div className="border-b border-[#E7EFF0] pb-5">
                <h2 className="text-[21px] font-bold text-[#29464D]">
                  {editingCampaignId
                    ? t("تعديل بيانات الحملة")
                    : t("إنشاء حملة جديدة")}
                </h2>

                <p className="mt-1.5 max-w-[620px] text-xs leading-6 text-[#93A4A8]">
                  {editingCampaignId
                    ? t("عدّل البيانات المطلوبة ثم احفظ التغييرات.")
                    : t("أدخل المعلومات الأساسية للحملة لتظهر للمستخدمين بشكل واضح ومنظم.")}
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                    {t("عنوان الحملة")}
                  </span>

                  <input
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(event) =>
                      set("title", event.target.value)
                    }
                    placeholder={t("مثال: حملة دعم مرضى الأمراض المزمنة")}
                    className="h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#334E54] outline-none transition placeholder:text-[#B7C3C5] hover:border-[#B9CFD3] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                    {t("وصف الحملة")}
                  </span>

                  <textarea
                    required
                    maxLength={2000}
                    value={form.description}
                    onChange={(event) =>
                      set("description", event.target.value)
                    }
                    placeholder={t("اكتب وصفًا واضحًا ومختصرًا للحملة وأهدافها...")}
                    className="min-h-[110px] w-full resize-y rounded-lg border border-[#D8E5E7] bg-white px-4 py-3 text-sm leading-7 text-[#334E54] outline-none transition placeholder:text-[#B7C3C5] hover:border-[#B9CFD3] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-bold text-[#3F646C]">
                    <span>{t("الأدوية المطلوبة")}</span>
                    <small className="font-medium text-[#A6B5B8]">
                      {t("اختياري")}
                    </small>
                  </span>

                  <textarea
                    maxLength={2000}
                    value={form.requestedMedicinesSummary}
                    onChange={(event) =>
                      set(
                        "requestedMedicinesSummary",
                        event.target.value,
                      )
                    }
                    placeholder={t("أسماء الأدوية أو الفئات ذات الأولوية")}
                    className="min-h-[76px] w-full resize-y rounded-lg border border-[#D8E5E7] bg-white px-4 py-3 text-sm leading-6 text-[#334E54] outline-none transition placeholder:text-[#B7C3C5] hover:border-[#B9CFD3] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                      {t("المدينة")}
                    </span>

                    <input
                      maxLength={100}
                      value={form.city}
                      onChange={(event) =>
                        set("city", event.target.value)
                      }
                      placeholder={t("أدخل المدينة")}
                      className="h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#334E54] outline-none transition placeholder:text-[#B7C3C5] hover:border-[#B9CFD3] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                      {t("المنطقة أو الحي")}
                    </span>

                    <input
                      maxLength={100}
                      value={form.area}
                      onChange={(event) =>
                        set("area", event.target.value)
                      }
                      placeholder={t("أدخل المنطقة أو الحي")}
                      className="h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#334E54] outline-none transition placeholder:text-[#B7C3C5] hover:border-[#B9CFD3] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                      {t("تاريخ البدء")}
                    </span>

                    <input
                      type="date"
                      value={form.startsAt}
                      onChange={(event) =>
                        set("startsAt", event.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#667D82] outline-none transition hover:border-[#B9CFD3] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                      {t("تاريخ الانتهاء")}
                    </span>

                    <input
                      type="date"
                      min={form.startsAt || undefined}
                      value={form.endsAt}
                      onChange={(event) =>
                        set("endsAt", event.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#667D82] outline-none transition hover:border-[#B9CFD3] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <CompactToggle
                    checked={form.isUrgent}
                    onChange={(value) =>
                      set("isUrgent", value)
                    }
                    label={t("حملة عاجلة")}
                    description={t("إظهار الحملة كأولوية")}
                  />

                  <CompactToggle
                    checked={form.acceptsPublicDonations}
                    onChange={(value) =>
                      set(
                        "acceptsPublicDonations",
                        value,
                      )
                    }
                    label={t("استقبال تبرعات عامة")}
                    description={t("السماح للمستخدمين بالتبرع")}
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#E7EFF0] pt-5">
                <button
                  type="submit"
                  disabled={formPending}
                  className="inline-flex h-11 min-w-[158px] items-center justify-center gap-2 rounded-lg bg-[#174B57] px-5 text-sm font-bold text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />

                  {formPending
                    ? t("جاري الحفظ...")
                    : editingCampaignId
                      ? t("حفظ التعديلات")
                      : t("إنشاء الحملة")}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#D5E3E5] bg-white px-5 text-sm font-bold text-[#60777D] transition hover:bg-[#F4F8F8] hover:text-[#216474]"
                >
                  <X size={16} />
                  {t("إلغاء")}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
      {!showForm && (
        <>
      {/* Tools */}
      <section className="rounded-xl bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className={isArabic ? "text-right" : "text-left"}>
            <h2 className="text-xl font-bold text-[#333333]">
              {t("حملات المنظمة")}
            </h2>

            <p className="mt-1 text-xs text-[#a5a5a5]">
              {t("إدارة الحالة ومراجعة تفاصيل كل حملة")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex h-10 min-w-[280px] flex-1 items-center gap-2 rounded-lg border border-[#174b57]/10 px-3">
              <Search
                size={17}
                className="text-[#a5a5a5]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={t("ابحث عن حملة...")}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#b5b5b5]"
              />
            </label>

            <div className="relative min-w-[165px]">
              <select
                className="h-10 w-full appearance-none rounded-xl border border-[#D8E6E8] bg-[#F8FBFB] pe-10 ps-3 text-sm font-medium text-[#47666D] outline-none transition hover:border-[#8FB8BE] focus:border-[#216474] focus:bg-white"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                {campaignStatuses.map((item) => (
                  <option
                    key={item.value || "all"}
                    value={item.value}
                  >
                    {t(item.label)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={2}
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#648188]"
              />
            </div>

            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg border border-[#174b57]/10 bg-white text-[#71858a]"
              aria-label={t("خيارات التصفية")}
            >
              <SlidersHorizontal size={17} />
            </button>

            <div className="flex overflow-hidden rounded-lg border border-[#174b57]/10">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`grid size-10 place-items-center ${
                  viewMode === "grid"
                    ? "bg-[#216474] text-white"
                    : "bg-white text-[#71858a]"
                }`}
              >
                <Grid2X2 size={16} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`grid size-10 place-items-center ${
                  viewMode === "list"
                    ? "bg-[#216474] text-white"
                    : "bg-white text-[#71858a]"
                }`}
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Data */}
      {query.isLoading ? (
        <UserLoadingState label={t("جاري تحميل الحملات...")} />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !filteredCampaigns.length ? (
        <UserEmptyState
          title={t("لا توجد حملات مطابقة")}
          description={t("أنشئ حملة جديدة أو غيّر مرشح الحالة أو البحث.")}
        />
      ) : viewMode === "grid" ? (
        <div
          className={`grid gap-4 lg:grid-cols-2 ${
            query.isFetching ? "opacity-60" : ""
          }`}
        >
          {filteredCampaigns.map((campaign) => (
            <CampaignGridCard
              key={campaign.campaignId}
              campaign={campaign}
              pending={
                updateStatus.isPending ||
                remove.isPending
              }
              onStatus={(nextStatus) =>
                updateStatus.mutate({
                  campaignId: campaign.campaignId,
                  nextStatus,
                })
              }
              onEdit={() => openEditForm(campaign)}
              onDelete={() => handleDelete(campaign)}
              t={t}
              direction={direction}
              isArabic={isArabic}
            />
          ))}
        </div>
      ) : (
        <CampaignsTable
          campaigns={filteredCampaigns}
          pending={
            updateStatus.isPending ||
            remove.isPending
          }
          onStatus={(campaignId, nextStatus) =>
            updateStatus.mutate({
              campaignId,
              nextStatus,
            })
          }
          onEdit={openEditForm}
          onDelete={handleDelete}
          fetching={query.isFetching}
          t={t}
          direction={direction}
          isArabic={isArabic}
        />
      )}
        </>
      )}
    </div>
  );
}

function CampaignsTable({
  campaigns,
  pending,
  onStatus,
  onEdit,
  onDelete,
  fetching,
  t,
  direction,
  isArabic,
}) {
  return (
    <section
      dir={direction}
      className={`overflow-hidden rounded-2xl border border-[#DCE8EA] bg-white shadow-[0_8px_30px_rgba(23,75,87,0.045)] ${
        fetching ? "opacity-60" : ""
      }`}
    >
      <div className="overflow-x-auto">
        <table className={`w-full min-w-[1080px] border-collapse ${isArabic ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="bg-[#EAF4F3] text-[11px] font-bold text-[#5E7A80]">
              <th className="px-5 py-4">{t("اسم الحملة")}</th>
              <th className="px-4 py-4">{t("نوع الحملة")}</th>
              <th className="px-4 py-4">{t("استقبال التبرع")}</th>
              <th className="px-4 py-4">{t("موعد الانتهاء")}</th>
              <th className="px-4 py-4">{t("الموقع")}</th>
              <th className="px-4 py-4">{t("الحالة")}</th>
              <th className="w-[118px] px-4 py-4 text-center">
                {t("الإجراءات")}
              </th>
            </tr>
          </thead>

          <tbody>
            {campaigns.map((campaign) => (
              <tr
                key={campaign.campaignId}
                className="border-t border-[#E7EFF0] text-sm text-[#334E54] transition hover:bg-[#FAFCFC]"
              >
                <td className="px-5 py-4">
                  <div className="max-w-[230px]">
                    <strong className="block truncate font-bold text-[#29464D]">
                      {campaign.title}
                    </strong>
                    <span className="mt-1 block truncate text-[11px] text-[#93A4A8]">
                      {campaign.description}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ${
                      campaign.isUrgent
                        ? "bg-rose-50 text-rose-600"
                        : "bg-[#E6F3F6] text-[#216474]"
                    }`}
                  >
                    {campaign.isUrgent
                      ? t("حملة عاجلة")
                      : t("حملة دوائية")}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      campaign.acceptsPublicDonations
                        ? "text-[#216474]"
                        : "text-[#8B9DA1]"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        campaign.acceptsPublicDonations
                          ? "bg-[#216474]"
                          : "bg-[#AAB8BB]"
                      }`}
                    />
                    {campaign.acceptsPublicDonations
                      ? t("بالأدوية")
                      : t("مغلق")}
                  </span>
                </td>

                <td className="px-4 py-4 text-[#71858A]">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <CalendarDays size={14} />
                    {formatOrgDate(campaign.endsAtUtc)}
                  </span>
                </td>

                <td className="px-4 py-4 text-[#71858A]">
                  <span className="inline-flex max-w-[180px] items-center gap-2">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">
                      {[campaign.area, campaign.city]
                        .filter(Boolean)
                        .join(isArabic ? "، " : ", ") || t("غير محدد")}
                    </span>
                  </span>
                </td>

                <td className="px-4 py-4">
                  <StatusSelect
                    campaign={campaign}
                    pending={pending}
                    onChange={(nextStatus) =>
                      onStatus(
                        campaign.campaignId,
                        nextStatus,
                      )
                    }
                    t={t}
                    direction={direction}
                  />
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(campaign)}
                      disabled={pending}
                      aria-label={t('تعديل {{title}}', { title: campaign.title })}
                      title={t("تعديل")}
                      className="grid size-9 place-items-center rounded-xl border border-[#CFE2E5] bg-[#F8FBFB] text-[#216474] transition hover:border-[#216474]/35 hover:bg-[#EAF4F3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Edit3 size={15} strokeWidth={1.9} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(campaign)}
                      disabled={pending}
                      aria-label={t('حذف {{title}}', { title: campaign.title })}
                      title={t("حذف")}
                      className="grid size-9 place-items-center rounded-xl border border-rose-100 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={15} strokeWidth={1.9} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


function StatusSelect({
  campaign,
  pending,
  onChange,
  t,
  direction,
}) {
  const statusStyles = {
    Active:
      "border-[#C9E0E5] bg-[#E6F3F6] text-[#216474]",
    Draft:
      "border-[#D4E3E6] bg-[#F0F6F7] text-[#52727A]",
    Closed:
      "border-[#CADADD] bg-[#E7F0F2] text-[#46666D]",
    Cancelled:
      "border-[#D7E1E3] bg-[#F2F6F7] text-[#6B7F84]",
  };

  const style =
    statusStyles[campaign.status] ||
    "border-[#CFE0E3] bg-[#EAF3F5] text-[#47666D]";

  return (
    <div dir={direction} className="relative w-[145px]">
      <select
        aria-label={t('تغيير حالة {{title}}', { title: campaign.title })}
        className={`h-10 w-full appearance-none rounded-xl border pe-9 ps-3 text-xs font-bold outline-none transition hover:brightness-[0.98] focus:ring-2 focus:ring-[#216474]/10 ${style}`}
        disabled={pending}
        value={campaign.status}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {campaignStatuses
          .filter((item) => item.value)
          .map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {t(item.label)}
            </option>
          ))}
      </select>

      <ChevronDown
        size={14}
        strokeWidth={2.2}
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-current opacity-70"
      />
    </div>
  );
}

function CompactToggle({
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <label
      className={`flex min-h-[58px] cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
        checked
          ? "border-[#BFD9DE] bg-[#EAF4F3]"
          : "border-[#DCE7E9] bg-[#FAFCFC]"
      }`}
    >
      <span className="min-w-0">
        <strong className="block text-xs font-bold text-[#3F646C]">
          {label}
        </strong>

        <small className="mt-1 block text-[10px] text-[#93A4A8]">
          {description}
        </small>
      </span>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#216474]" : "bg-[#D4E0E2]"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${
            checked ? "right-1" : "right-6"
          }`}
        />
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="sr-only"
      />
    </label>
  );
}

function CampaignGridCard({
  campaign,
  pending,
  onStatus,
  onEdit,
  onDelete,
  t,
  direction,
  isArabic,
}) {
  const meta =
    campaignStatusMeta[campaign.status] || {};

  return (
    <article dir={direction} className="rounded-xl border border-[#174b57]/8 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-[#C9E0E5] bg-[#E6F3F6] px-3 py-1.5 text-[11px] font-bold text-[#216474]">
          {t(meta.label)}
        </span>

        <div className="flex items-center gap-2">
          {campaign.isUrgent && (
            <span className="rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700">
              {t("عاجلة")}
            </span>
          )}

          <button
            type="button"
            onClick={onEdit}
            disabled={pending}
            className="grid size-9 place-items-center rounded-lg border border-[#174b57]/10 text-[#216474]"
            aria-label={t('تعديل {{title}}', { title: campaign.title })}
          >
            <Edit3 size={16} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="grid size-9 place-items-center rounded-lg border border-rose-100 text-rose-600"
            aria-label={t('حذف {{title}}', { title: campaign.title })}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#29464d]">
        {campaign.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#71858a]">
        {campaign.description}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <span className="flex items-center gap-2 text-[#71858a]">
          <MapPin size={14} />
          {[
            campaign.area,
            campaign.city,
          ]
            .filter(Boolean)
            .join(isArabic ? "، " : ", ") || t("غير محدد")}
        </span>

        <span className="flex items-center gap-2 text-[#71858a]">
          <CalendarDays size={14} />
          {t("حتى")} {formatOrgDate(campaign.endsAtUtc)}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#174b57]/8 pt-4">
        <span
          className={`text-xs font-bold ${
            campaign.acceptsPublicDonations
              ? "text-[#216474]"
              : "text-[#829499]"
          }`}
        >
          {campaign.acceptsPublicDonations
            ? t("تستقبل تبرعات عامة")
            : t("لا تستقبل تبرعات عامة")}
        </span>

        <StatusSelect
          campaign={campaign}
          pending={pending}
          onChange={onStatus}
          t={t}
          direction={direction}
        />
      </div>
    </article>
  );
}