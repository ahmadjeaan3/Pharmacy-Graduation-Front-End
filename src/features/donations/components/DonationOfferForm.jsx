import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Gift,
  PackageCheck,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  createDonationOffer,
  donationKeys,
  getVerificationPharmacies,
} from "../api/donationsApi";
import { inputDateAfter, toUtcDate } from "../utils/donationFormatters";
import { DonationTargetPicker } from "./DonationTargetPicker";
import { MedicinePicker } from "./MedicinePicker";

const initialForm = {
  medicine: null,
  organizationId: "",
  campaignId: "",
  reviewingPharmacyId: "",
  packageCount: 1,
  expiryDate: "",
  isSealed: true,
  notes: "",
};

export function DonationOfferForm() {
  const client = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState(null);
  const pharmacies = useQuery({
    queryKey: donationKeys.verificationPharmacies,
    queryFn: getVerificationPharmacies,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: createDonationOffer,
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: "تم إرسال العرض إلى الصيدلية المختارة للتحقق من العبوة والصلاحية. لن يظهر للجمعية قبل توثيقه.",
      });
      setForm(initialForm);
      await client.invalidateQueries({ queryKey: ["donations", "offers"] });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    setNotice(null);
    if (!form.medicine)
      return setNotice({ ok: false, text: "اختر الدواء المراد التبرع به." });
    mutation.mutate({
      medicineId: form.medicine.id,
      reviewingPharmacyId: form.reviewingPharmacyId,
      targetOrganizationId: form.organizationId,
      campaignId: form.campaignId || null,
      packageCount: Number(form.packageCount),
      expiryDateUtc: toUtcDate(form.expiryDate),
      isSealed: form.isSealed,
      notes: form.notes.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Gift size={21} />
        </span>
        <div>
          <h3 className="text-lg font-black text-[#29464d]">تقديم عرض تبرع</h3>
          <p className="mt-1 text-xs text-[#829499]">
            اختر الدواء والجهة المستفيدة وسجّل حالة العبوات بدقة
          </p>
        </div>
      </div>
      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <MedicinePicker
        value={form.medicine}
        onChange={(medicine) => set("medicine", medicine)}
      />
      <DonationTargetPicker
        purpose="offer"
        organizationId={form.organizationId}
        campaignId={form.campaignId}
        onOrganizationChange={(value) => set("organizationId", value)}
        onCampaignChange={(value) => set("campaignId", value)}
      />
      <div className="rounded-2xl border border-[#216474]/15 bg-[#f4f9f8] p-4">
        <div className="mb-3 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
            <ShieldCheck size={19} />
          </span>
          <div>
            <strong className="block text-sm text-[#29464d]">
              صيدلية التحقق والاستلام
            </strong>
            <p className="mt-1 text-xs leading-6 text-[#71858a]">
              تستلم الصيدلية الدواء منك، وتفحص سلامة العبوة والصلاحية، ثم تحوّل
              العرض الموثق إلى الجمعية. لا يوجد تسليم مباشر بين مستخدمين.
            </p>
          </div>
        </div>
        <label>
          <span className="form-label">اختر صيدلية قريبة ومعتمدة</span>
          <div className="field-control">
            <select
              className="form-input has-field-icon appearance-none"
              required
              value={form.reviewingPharmacyId}
              onChange={(event) =>
                set("reviewingPharmacyId", event.target.value)
              }
              disabled={pharmacies.isFetching}
            >
              <option value="">
                {pharmacies.isFetching
                  ? "جاري تحميل الصيدليات..."
                  : pharmacies.isError
                    ? "تعذر تحميل صيدليات التحقق"
                    : "اختر الصيدلية التي ستسلّمها الدواء"}
              </option>
              {(pharmacies.data || []).map((pharmacy) => (
                <option key={pharmacy.pharmacyId} value={pharmacy.pharmacyId}>
                  {pharmacy.pharmacyName} — {pharmacy.area || pharmacy.city}
                </option>
              ))}
            </select>
            <span className="field-icon-shell">
              <Building2 size={17} />
            </span>
          </div>
        </label>
        {pharmacies.isError && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-rose-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600">
                تعذر تحميل صيدليات التحقق المعتمدة.
              </p>
              <p className="mt-1 text-[11px] text-[#71858a]">
                أعد المحاولة، ولا يشترط تفعيل الموقع لاختيار الصيدلية.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary shrink-0 justify-center"
              onClick={() => pharmacies.refetch()}
            >
              إعادة المحاولة
            </button>
          </div>
        )}
        {!pharmacies.isFetching &&
          !pharmacies.isError &&
          pharmacies.data?.length === 0 && (
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-bold text-amber-700">
              لا توجد صيدليات معتمدة متاحة حاليًا. جرّب لاحقًا أو اطلب من
              الإدارة اعتماد صيدلية.
            </div>
          )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="form-label">عدد العبوات</span>
          <input
            className="form-input"
            type="number"
            min="1"
            max="1000"
            required
            value={form.packageCount}
            onChange={(event) => set("packageCount", event.target.value)}
          />
        </label>
        <label>
          <span className="form-label">
            تاريخ الصلاحية{" "}
            <small className="font-medium text-[#9aabad]">(اختياري)</small>
          </span>
          <input
            className="form-input"
            type="date"
            min={inputDateAfter(1)}
            value={form.expiryDate}
            onChange={(event) => set("expiryDate", event.target.value)}
          />
        </label>
      </div>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4">
        <span className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
            <PackageCheck size={19} />
          </span>
          <span>
            <strong className="block text-sm text-[#29464d]">
              العبوات مغلقة بحالتها الأصلية
            </strong>
            <small className="mt-1 block text-xs text-[#829499]">
              حدّث هذا الخيار بما يطابق حالة الدواء الفعلية
            </small>
          </span>
        </span>
        <input
          type="checkbox"
          className="size-5 accent-[#216474]"
          checked={form.isSealed}
          onChange={(event) => set("isSealed", event.target.checked)}
        />
      </label>
      <label>
        <span className="form-label">
          ملاحظات للمنظمة{" "}
          <small className="font-medium text-[#9aabad]">(اختياري)</small>
        </span>
        <textarea
          className="form-textarea min-h-24"
          maxLength={1000}
          value={form.notes}
          onChange={(event) => set("notes", event.target.value)}
          placeholder="أي معلومات مهمة عن حفظ الدواء أو تسليمه"
        />
      </label>
      <div className="flex flex-col gap-3 border-t border-[#174b57]/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-[#71858a]">
          <CheckCircle2 size={15} className="text-emerald-600" />
          المسار: المستخدم ← الصيدلية للتحقق ← الجمعية للمراجعة والتوزيع
        </p>
        <button
          className="btn-primary justify-center"
          disabled={
            mutation.isPending ||
            !form.medicine ||
            !form.organizationId ||
            !form.reviewingPharmacyId
          }
        >
          <Send size={17} />
          {mutation.isPending ? "جاري الإرسال..." : "إرسال عرض التبرع"}
        </button>
      </div>
    </form>
  );
}
