import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, HandHeart, Send } from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { createAssistanceRequest } from "../api/donationsApi";
import { inputDateAfter, toUtcDate } from "../utils/donationFormatters";
import { DonationTargetPicker } from "./DonationTargetPicker";
import { MedicinePicker } from "./MedicinePicker";

const initialForm = {
  medicine: null,
  organizationId: "",
  campaignId: "",
  packageCount: 1,
  neededBefore: "",
  notes: "",
};

export function AssistanceRequestForm() {
  const client = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState(null);
  const mutation = useMutation({
    mutationFn: createAssistanceRequest,
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: "تم إرسال طلب المساعدة إلى المنظمة ويمكنك متابعة حالته من سجلك.",
      });
      setForm(initialForm);
      await client.invalidateQueries({
        queryKey: ["donations", "assistance-requests"],
      });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    setNotice(null);
    if (!form.medicine)
      return setNotice({ ok: false, text: "اختر الدواء المطلوب." });
    mutation.mutate({
      medicineId: form.medicine.id,
      targetOrganizationId: form.organizationId,
      campaignId: form.campaignId || null,
      requestedPackageCount: Number(form.packageCount),
      neededBeforeUtc: toUtcDate(form.neededBefore),
      notes: form.notes.trim() || null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <HandHeart size={21} />
        </span>
        <div>
          <h3 className="text-lg font-black text-[#29464d]">
            طلب مساعدة دوائية
          </h3>
          <p className="mt-1 text-xs text-[#829499]">
            أرسل احتياجك إلى منظمة معتمدة وتابع الاستجابة من حسابك
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
        purpose="assistance"
        organizationId={form.organizationId}
        campaignId={form.campaignId}
        onOrganizationChange={(value) => set("organizationId", value)}
        onCampaignChange={(value) => set("campaignId", value)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="form-label">عدد العبوات المطلوبة</span>
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
            مطلوب قبل تاريخ{" "}
            <small className="font-medium text-[#9aabad]">(اختياري)</small>
          </span>
          <input
            className="form-input"
            type="date"
            min={inputDateAfter()}
            value={form.neededBefore}
            onChange={(event) => set("neededBefore", event.target.value)}
          />
        </label>
      </div>
      <label>
        <span className="form-label">
          تفاصيل الطلب{" "}
          <small className="font-medium text-[#9aabad]">(اختياري)</small>
        </span>
        <textarea
          className="form-textarea min-h-28"
          maxLength={1000}
          value={form.notes}
          onChange={(event) => set("notes", event.target.value)}
          placeholder="اكتب المعلومات التي تساعد المنظمة على مراجعة الاحتياج"
        />
      </label>
      <div className="flex flex-col gap-3 border-t border-[#174b57]/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-[#71858a]">
          <CalendarClock size={15} className="text-amber-600" />
          يمكنك متابعة حالة الطلب ورد المنظمة من السجل
        </p>
        <button
          className="btn-primary justify-center"
          disabled={
            mutation.isPending || !form.medicine || !form.organizationId
          }
        >
          <Send size={17} />
          {mutation.isPending ? "جاري الإرسال..." : "إرسال طلب المساعدة"}
        </button>
      </div>
    </form>
  );
}
