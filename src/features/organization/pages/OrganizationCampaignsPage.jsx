import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  HeartHandshake,
  MapPin,
  Megaphone,
  Plus,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  createOrganizationCampaign,
  getOrganizationCampaigns,
  organizationKeys,
  updateOrganizationCampaignStatus,
} from "../api/organizationApi";
import { OrganizationPageHeader } from "../components/OrganizationPageHeader";
import {
  campaignStatuses,
  campaignStatusMeta,
  formatOrgDate,
  toUtcDate,
} from "../utils/organizationFormatters";

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

export function OrganizationCampaignsPage() {
  const client = useQueryClient();
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState(null);
  const params = { status, take: 100 };
  const query = useQuery({
    queryKey: organizationKeys.campaigns(params),
    queryFn: () => getOrganizationCampaigns(params),
  });
  const refresh = async () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["organization", "campaigns"] }),
      client.invalidateQueries({ queryKey: organizationKeys.dashboard }),
    ]);
  const create = useMutation({
    mutationFn: createOrganizationCampaign,
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم إنشاء الحملة بنجاح." });
      setForm(initialForm);
      setShowForm(false);
      await refresh();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const updateStatus = useMutation({
    mutationFn: ({ campaignId, nextStatus }) =>
      updateOrganizationCampaignStatus(campaignId, nextStatus),
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم تحديث حالة الحملة." });
      await refresh();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    setNotice(null);
    if (form.startsAt && form.endsAt && form.endsAt <= form.startsAt)
      return setNotice({
        ok: false,
        text: "يجب أن يكون تاريخ نهاية الحملة بعد تاريخ بدايتها.",
      });
    create.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      requestedMedicinesSummary: form.requestedMedicinesSummary.trim() || null,
      city: form.city.trim() || null,
      area: form.area.trim() || null,
      isUrgent: form.isUrgent,
      acceptsPublicDonations: form.acceptsPublicDonations,
      startsAtUtc: toUtcDate(form.startsAt),
      endsAtUtc: toUtcDate(form.endsAt),
    });
  };
  return (
    <div className="space-y-6">
      <OrganizationPageHeader
        eyebrow="إدارة المبادرات"
        title="الحملات الدوائية"
        description="أنشئ الحملات وحدد احتياجاتها وموقعها وفترة استقبال التبرعات، ثم تابع حالتها من مكان واحد."
        icon={HeartHandshake}
        action={
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f5cb72] px-4 py-3 text-sm font-black text-[#302b4b]"
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? "إغلاق النموذج" : "حملة جديدة"}
          </button>
        }
      />
      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      {showForm && (
        <form
          onSubmit={submit}
          className="rounded-[1.5rem] border border-violet-100 bg-white p-6 shadow-[0_15px_40px_rgba(61,54,95,.06)]"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <Megaphone size={21} />
            </span>
            <div>
              <h3 className="text-lg font-black text-[#29464d]">
                إنشاء حملة جديدة
              </h3>
              <p className="mt-1 text-xs text-[#829499]">
                إذا كان تاريخ البدء في المستقبل ستُحفظ الحملة كمسودة حتى تفعيلها
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="form-label">عنوان الحملة</span>
              <input
                className="form-input"
                required
                maxLength={200}
                value={form.title}
                onChange={(event) => set("title", event.target.value)}
              />
            </label>
            <label className="md:col-span-2">
              <span className="form-label">وصف الحملة</span>
              <textarea
                className="form-textarea min-h-28"
                required
                maxLength={2000}
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
              />
            </label>
            <label className="md:col-span-2">
              <span className="form-label">
                الأدوية المطلوبة{" "}
                <small className="font-medium text-[#9aabad]">(اختياري)</small>
              </span>
              <textarea
                className="form-textarea min-h-20"
                maxLength={2000}
                value={form.requestedMedicinesSummary}
                onChange={(event) =>
                  set("requestedMedicinesSummary", event.target.value)
                }
                placeholder="ملخص بأسماء الأدوية أو الفئات ذات الأولوية"
              />
            </label>
            <label>
              <span className="form-label">
                المدينة{" "}
                <small className="font-medium text-[#9aabad]">
                  (تستخدم بيانات المنظمة إذا تُركت فارغة)
                </small>
              </span>
              <input
                className="form-input"
                maxLength={100}
                value={form.city}
                onChange={(event) => set("city", event.target.value)}
              />
            </label>
            <label>
              <span className="form-label">المنطقة أو الحي</span>
              <input
                className="form-input"
                maxLength={100}
                value={form.area}
                onChange={(event) => set("area", event.target.value)}
              />
            </label>
            <label>
              <span className="form-label">
                تاريخ البدء{" "}
                <small className="font-medium text-[#9aabad]">(اختياري)</small>
              </span>
              <input
                type="date"
                className="form-input"
                value={form.startsAt}
                onChange={(event) => set("startsAt", event.target.value)}
              />
            </label>
            <label>
              <span className="form-label">
                تاريخ الانتهاء{" "}
                <small className="font-medium text-[#9aabad]">(اختياري)</small>
              </span>
              <input
                type="date"
                className="form-input"
                min={form.startsAt || undefined}
                value={form.endsAt}
                onChange={(event) => set("endsAt", event.target.value)}
              />
            </label>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Toggle
              checked={form.isUrgent}
              onChange={(value) => set("isUrgent", value)}
              icon={CircleAlert}
              title="حملة عاجلة"
              text="إبراز أولوية الحملة للمستخدمين"
            />
            <Toggle
              checked={form.acceptsPublicDonations}
              onChange={(value) => set("acceptsPublicDonations", value)}
              icon={CheckCircle2}
              title="استقبال تبرعات عامة"
              text="السماح للمستخدمين بتقديم عروض لهذه الحملة"
            />
          </div>
          <button className="btn-primary mt-6" disabled={create.isPending}>
            <Save size={17} />
            {create.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
          </button>
        </form>
      )}
      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h3 className="text-xl font-black text-[#29464d]">حملات المنظمة</h3>
            <p className="mt-1 text-sm text-[#71858a]">
              إدارة الحالة ومراجعة تفاصيل كل حملة
            </p>
          </div>
          <select
            className="form-input max-w-52"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {campaignStatuses.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        {query.isLoading ? (
          <UserLoadingState label="جاري تحميل الحملات..." />
        ) : query.isError ? (
          <UserErrorState
            message={getApiErrorMessage(query.error)}
            onRetry={query.refetch}
          />
        ) : !query.data?.length ? (
          <UserEmptyState
            title="لا توجد حملات مطابقة"
            description="أنشئ حملة جديدة أو غيّر مرشح الحالة لعرض بقية الحملات."
          />
        ) : (
          <div
            className={`grid gap-4 lg:grid-cols-2 ${query.isFetching ? "opacity-60" : ""}`}
          >
            {query.data.map((campaign) => (
              <CampaignCard
                key={campaign.campaignId}
                campaign={campaign}
                pending={updateStatus.isPending}
                onStatus={(nextStatus) =>
                  updateStatus.mutate({
                    campaignId: campaign.campaignId,
                    nextStatus,
                  })
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Toggle({ checked, onChange, icon: Icon, title, text }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#174b57]/8 bg-[#fafbfb] p-4">
      <span className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-white text-violet-700">
          <Icon size={17} />
        </span>
        <span>
          <strong className="block text-sm text-[#29464d]">{title}</strong>
          <small className="text-[#829499]">{text}</small>
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-violet-700"
      />
    </label>
  );
}
function CampaignCard({ campaign, pending, onStatus }) {
  const meta = campaignStatusMeta[campaign.status] || {};
  return (
    <article className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${meta.tone}`}
        >
          {meta.label}
        </span>
        {campaign.isUrgent && (
          <span className="rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-black text-rose-700">
            عاجلة
          </span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-black text-[#29464d]">
        {campaign.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#71858a]">
        {campaign.description}
      </p>
      {campaign.requestedMedicinesSummary && (
        <div className="mt-4 rounded-xl bg-violet-50/60 p-3">
          <p className="text-[10px] font-black text-violet-700">
            الاحتياج الدوائي
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-6 text-[#665d7f]">
            {campaign.requestedMedicinesSummary}
          </p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <span className="flex items-center gap-2 text-[#71858a]">
          <MapPin size={14} />
          {[campaign.area, campaign.city].filter(Boolean).join("، ") ||
            "غير محدد"}
        </span>
        <span className="flex items-center gap-2 text-[#71858a]">
          <CalendarDays size={14} />
          حتى {formatOrgDate(campaign.endsAtUtc)}
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#174b57]/8 pt-4">
        <span
          className={`text-xs font-bold ${campaign.acceptsPublicDonations ? "text-emerald-700" : "text-[#829499]"}`}
        >
          {campaign.acceptsPublicDonations
            ? "تستقبل تبرعات عامة"
            : "لا تستقبل تبرعات عامة"}
        </span>
        <select
          aria-label={`تغيير حالة ${campaign.title}`}
          className="form-input max-w-36 py-2 text-xs"
          disabled={pending}
          value={campaign.status}
          onChange={(event) => onStatus(event.target.value)}
        >
          {campaignStatuses
            .filter((item) => item.value)
            .map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
        </select>
      </div>
    </article>
  );
}
