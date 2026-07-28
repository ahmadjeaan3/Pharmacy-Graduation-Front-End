import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Check,
  HandHeart,
  Package,
  Phone,
  Pill,
  Save,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  assistanceStatuses,
  getStatusMeta,
} from "../../donations/utils/donationFormatters";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  getOrganizationAssistanceRequests,
  getOrganizationCampaigns,
  organizationKeys,
  updateOrganizationAssistanceStatus,
} from "../api/organizationApi";
import { OrganizationPageHeader } from "../components/OrganizationPageHeader";
import { formatOrgDate } from "../utils/organizationFormatters";

export function OrganizationAssistanceRequestsPage() {
  const client = useQueryClient();
  const [status, setStatus] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [notice, setNotice] = useState(null);
  const params = { status, campaignId, take: 100 };
  const query = useQuery({
    queryKey: organizationKeys.assistance(params),
    queryFn: () => getOrganizationAssistanceRequests(params),
  });
  const campaigns = useQuery({
    queryKey: organizationKeys.campaigns({ take: 100 }),
    queryFn: () => getOrganizationCampaigns({ take: 100 }),
  });
  const update = useMutation({
    mutationFn: ({ requestId, payload }) =>
      updateOrganizationAssistanceStatus(requestId, payload),
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم تحديث طلب المساعدة وإشعار صاحبه." });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["organization", "assistance"] }),
        client.invalidateQueries({ queryKey: organizationKeys.dashboard }),
      ]);
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  return (
    <div className="space-y-6">
      <OrganizationPageHeader
        eyebrow="احتياجات المستفيدين"
        title="طلبات المساعدة الدوائية"
        description="راجع الدواء والكمية ووقت الاحتياج، ثم حدّث حالة الطلب وأرسل ردًا واضحًا لصاحبه."
        icon={HandHeart}
      />
      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <section className="flex flex-col gap-3 rounded-[1.35rem] border border-[#174b57]/8 bg-white p-4 sm:flex-row">
        <label className="flex-1">
          <span className="form-label">حالة الطلب</span>
          <select
            className="form-input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {assistanceStatuses.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="form-label">الحملة</span>
          <select
            className="form-input"
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
          >
            <option value="">جميع الحملات</option>
            {(campaigns.data || []).map((campaign) => (
              <option key={campaign.campaignId} value={campaign.campaignId}>
                {campaign.title}
              </option>
            ))}
          </select>
        </label>
      </section>
      {query.isLoading ? (
        <UserLoadingState label="جاري تحميل طلبات المساعدة..." />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !query.data?.length ? (
        <UserEmptyState
          title="لا توجد طلبات مطابقة"
          description="ستظهر هنا طلبات المساعدة الموجهة إلى المنظمة أو حملاتها."
        />
      ) : (
        <section
          className={`grid gap-4 xl:grid-cols-2 ${query.isFetching ? "opacity-60" : ""}`}
        >
          {query.data.map((request) => (
            <RequestCard
              key={request.requestId}
              request={request}
              pending={update.isPending}
              onUpdate={(payload) => {
                setNotice(null);
                update.mutate({ requestId: request.requestId, payload });
              }}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function RequestCard({ request, pending, onUpdate }) {
  const [nextStatus, setNextStatus] = useState(
    request.status === "UnderReview" ? "Fulfilled" : "UnderReview",
  );
  const [note, setNote] = useState(request.responseNote || "");
  const status = getStatusMeta(request.status, "assistance");
  const actionable = !["Cancelled", "Fulfilled", "Rejected"].includes(
    request.status,
  );
  return (
    <article className="rounded-[1.45rem] border border-[#174b57]/8 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <HandHeart size={20} />
        </span>
        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${status.tone}`}
        >
          {status.label}
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#29464d]">
            {request.medicineName}
          </h3>
          <p className="mt-1 text-xs text-[#829499]">
            {request.scientificName || "الاسم العلمي غير محدد"}
          </p>
        </div>
        <div className="rounded-xl bg-[#f8fbfa] px-4 py-2 text-center">
          <strong className="block text-lg text-[#29464d]">
            {request.requestedPackageCount.toLocaleString("ar-SY")}
          </strong>
          <small className="text-[#829499]">عبوة</small>
        </div>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-[#fafbfb] p-4 text-xs sm:grid-cols-2">
        <Info
          icon={UserRound}
          label="صاحب الطلب"
          value={request.requesterFullName}
        />
        <Info
          icon={Phone}
          label="الهاتف"
          value={request.requesterPhoneNumber || "غير مسجل"}
        />
        <Info
          icon={CalendarClock}
          label="مطلوب قبل"
          value={formatOrgDate(request.neededBeforeUtc)}
        />
        <Info
          icon={Package}
          label="الكمية"
          value={`${request.requestedPackageCount.toLocaleString("ar-SY")} عبوة`}
        />
        {request.campaignTitle && (
          <Info icon={Pill} label="الحملة" value={request.campaignTitle} />
        )}
      </div>
      {request.notes && (
        <p className="mt-4 rounded-xl border border-[#174b57]/7 p-3 text-xs leading-6 text-[#71858a]">
          {request.notes}
        </p>
      )}
      {actionable ? (
        <div className="mt-5 border-t border-[#174b57]/8 pt-4">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <select
              className="form-input"
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value)}
            >
              <option value="UnderReview">بدء المراجعة</option>
              <option value="Fulfilled">تمت تلبية الطلب</option>
              <option value="Rejected">تعذر تلبية الطلب</option>
            </select>
            <input
              className="form-input"
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="رد للمتقدم بالطلب (اختياري)"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdate({
                status: nextStatus,
                responseNote: note.trim() || null,
              })
            }
            disabled={pending}
            className="btn-primary mt-3"
          >
            <Save size={16} />
            {pending ? "جاري الحفظ..." : "حفظ التحديث"}
          </button>
        </div>
      ) : (
        request.responseNote && (
          <div className="mt-4 rounded-xl bg-[#f2effa] p-3">
            <p className="text-[10px] font-black text-violet-700">
              الرد المرسل
            </p>
            <p className="mt-1 text-xs leading-6 text-[#665d7f]">
              {request.responseNote}
            </p>
          </div>
        )
      )}
      <p className="mt-4 flex items-center gap-1 border-t border-[#174b57]/7 pt-3 text-[11px] text-[#9aabad]">
        <Check size={13} />
        وصل في {formatOrgDate(request.createdAtUtc)}
      </p>
    </article>
  );
}
function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon size={14} className="shrink-0 text-[#829499]" />
      <span className="text-[#829499]">{label}</span>
      <strong className="ms-auto max-w-[55%] truncate text-[#29464d]">
        {value}
      </strong>
    </div>
  );
}
