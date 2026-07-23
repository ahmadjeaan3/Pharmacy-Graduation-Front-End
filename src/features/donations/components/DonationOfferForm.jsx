import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Gift, PackageCheck, Send } from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { createDonationOffer } from "../api/donationsApi";
import { inputDateAfter, toUtcDate } from "../utils/donationFormatters";
import { DonationTargetPicker } from "./DonationTargetPicker";
import { MedicinePicker } from "./MedicinePicker";

const initialForm = {
  medicine: null,
  organizationId: "",
  campaignId: "",
  packageCount: 1,
  expiryDate: "",
  isSealed: true,
  notes: "",
};

export function DonationOfferForm() {
  const client = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState(null);
  const mutation = useMutation({
    mutationFn: createDonationOffer,
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: "تم إرسال عرض التبرع إلى المنظمة وسيظهر تحديثه في سجل عروضك.",
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
          ستراجع المنظمة العرض قبل ترتيب الاستلام
        </p>
        <button
          className="btn-primary justify-center"
          disabled={
            mutation.isPending || !form.medicine || !form.organizationId
          }
        >
          <Send size={17} />
          {mutation.isPending ? "جاري الإرسال..." : "إرسال عرض التبرع"}
        </button>
      </div>
    </form>
  );
}
