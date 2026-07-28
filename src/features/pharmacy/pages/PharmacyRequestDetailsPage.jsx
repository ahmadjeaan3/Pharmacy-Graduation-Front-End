import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquareText,
  Phone,
  Pill,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  getPharmacyRequest,
  pharmacyKeys,
  respondToPharmacyRequest,
} from "../api/pharmacyApi";
import {
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import {
  formatDate,
  formatNumber,
  requestMeta,
} from "../utils/pharmacyFormatters";

export function PharmacyRequestDetailsPage() {
  const { requestId } = useParams();
  const client = useQueryClient();
  const [form, setForm] = useState({
    status: "Available",
    pharmacyResponseNote: "",
    suggestedAlternativeMedicineId: "",
  });
  const [notice, setNotice] = useState(null);
  const query = useQuery({
    queryKey: pharmacyKeys.request(requestId),
    queryFn: () => getPharmacyRequest(requestId),
  });
  const response = useMutation({
    mutationFn: (payload) => respondToPharmacyRequest(requestId, payload),
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم إرسال الرد إلى المريض بنجاح." });
      await Promise.all([
        client.invalidateQueries({ queryKey: pharmacyKeys.request(requestId) }),
        client.invalidateQueries({ queryKey: ["pharmacy", "requests"] }),
        client.invalidateQueries({ queryKey: pharmacyKeys.dashboard }),
      ]);
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  if (query.isLoading)
    return <PharmacyLoadingState label="جاري فتح الطلب..." />;
  if (query.isError)
    return (
      <PharmacyErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const data = query.data;
  const selectedStatus = data.isRequestedMedicineCurrentlyAvailable
    ? form.status
    : "Unavailable";
  const meta = requestMeta(data.status);
  const submit = (event) => {
    event.preventDefault();
    response.mutate({
      status: selectedStatus,
      pharmacyResponseNote: form.pharmacyResponseNote.trim() || null,
      suggestedAlternativeMedicineId:
        selectedStatus === "Unavailable" && form.suggestedAlternativeMedicineId
          ? form.suggestedAlternativeMedicineId
          : null,
    });
  };
  return (
    <div>
      <Link to="/app/pharmacy/requests" className="btn-quiet mb-5">
        <ArrowRight size={17} />
        العودة إلى الطلبات
      </Link>
      {notice && (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
        <div className="space-y-6">
          <section className="surface overflow-hidden">
            <div className="bg-[#123f49] p-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${meta.className}`}
                >
                  {meta.label}
                </span>
                <span className="text-sm font-bold text-white/55" dir="ltr">
                  #{data.requestCode}
                </span>
              </div>
              <div className="mt-6 flex items-start gap-4">
                <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-white/10">
                  <Pill size={25} />
                </span>
                <div>
                  <h2 className="text-2xl font-black">{data.medicineName}</h2>
                  <p className="mt-2 text-sm text-white/55">
                    الكمية المطلوبة: {formatNumber(data.requestedQuantity)}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <Info
                label="الاسم العلمي"
                value={data.requestedMedicineScientificName}
              />
              <Info
                label="الشكل الدوائي"
                value={data.requestedMedicineDosageForm}
              />
              <Info label="السعة" value={data.requestedMedicineCapacity} />
              <Info label="التركيب" value={data.requestedMedicineComposition} />
              <Info
                label="تاريخ الطلب"
                value={formatDate(data.createdAtUtc, true)}
              />
              <Info
                label="حالة مخزونك"
                value={
                  data.isRequestedMedicineCurrentlyAvailable
                    ? "متوفر حاليًا"
                    : "غير متوفر حاليًا"
                }
              />
            </div>
            {data.note && (
              <div className="mx-6 mb-6 rounded-2xl bg-[#f7faf9] p-4">
                <p className="flex items-center gap-2 text-xs font-black text-[#216474]">
                  <MessageSquareText size={15} />
                  ملاحظة المريض
                </p>
                <p className="mt-2 text-sm leading-7 text-[#526a70]">
                  {data.note}
                </p>
              </div>
            )}
          </section>
          <section className="surface p-6">
            <h3 className="font-black">بيانات المريض</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Contact
                icon={UserRound}
                label="الاسم"
                value={data.userFullName}
              />
              <Contact
                icon={Phone}
                label="الهاتف"
                value={data.userPhoneNumber}
                dir="ltr"
              />
              <Contact
                icon={Mail}
                label="البريد الإلكتروني"
                value={data.userEmail}
                dir="ltr"
              />
            </div>
          </section>
        </div>
        <aside className="surface h-fit p-6 xl:sticky xl:top-28">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
              <Send size={20} />
            </span>
            <div>
              <h3 className="font-black">الرد على الطلب</h3>
              <p className="mt-1 text-xs text-[#829499]">
                يرسل الرد للمريض فور الحفظ
              </p>
            </div>
          </div>
          {data.canRespond ? (
            <form onSubmit={submit} className="mt-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!data.isRequestedMedicineCurrentlyAvailable}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      status: "Available",
                      suggestedAlternativeMedicineId: "",
                    }))
                  }
                  className={`rounded-2xl border p-4 text-center transition disabled:cursor-not-allowed disabled:opacity-35 ${selectedStatus === "Available" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-[#174b57]/10"}`}
                >
                  <CheckCircle2 className="mx-auto" />
                  <strong className="mt-2 block text-sm">متوفر</strong>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, status: "Unavailable" }))
                  }
                  className={`rounded-2xl border p-4 text-center transition ${selectedStatus === "Unavailable" ? "border-rose-300 bg-rose-50 text-rose-700" : "border-[#174b57]/10"}`}
                >
                  <XCircle className="mx-auto" />
                  <strong className="mt-2 block text-sm">غير متوفر</strong>
                </button>
              </div>
              {selectedStatus === "Unavailable" && (
                <label className="mt-5 block">
                  <span className="form-label">بديل متاح (اختياري)</span>
                  <select
                    className="form-input"
                    value={form.suggestedAlternativeMedicineId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        suggestedAlternativeMedicineId: e.target.value,
                      }))
                    }
                  >
                    <option value="">دون اقتراح بديل</option>
                    {(data.alternativeCandidates || []).map((item) => (
                      <option key={item.medicineId} value={item.medicineId}>
                        {item.medicineName}
                        {item.capacity ? ` — ${item.capacity}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="mt-5 block">
                <span className="form-label">ملاحظة للمريض (اختيارية)</span>
                <textarea
                  className="form-textarea min-h-28"
                  maxLength={1000}
                  value={form.pharmacyResponseNote}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pharmacyResponseNote: e.target.value,
                    }))
                  }
                  placeholder="مثال: الدواء متوفر ويمكن استلامه حتى العاشرة مساءً"
                />
              </label>
              <button
                disabled={response.isPending}
                className="btn-primary mt-5 w-full justify-center"
              >
                <Send size={17} />
                {response.isPending ? "جاري إرسال الرد..." : "إرسال الرد"}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl bg-[#f7faf9] p-5 text-center">
              <Clock3 className="mx-auto text-[#216474]" />
              <p className="mt-3 text-sm font-black">تمت معالجة هذا الطلب</p>
              <p className="mt-2 text-xs leading-6 text-[#829499]">
                {data.pharmacyResponseNote || "لا توجد ملاحظة إضافية في الرد."}
              </p>
              {data.suggestedAlternative && (
                <div className="mt-4 rounded-xl bg-white p-3 text-start text-xs">
                  <span className="text-[#829499]">البديل المقترح</span>
                  <strong className="mt-1 block">
                    {data.suggestedAlternative.medicineName}
                  </strong>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[#829499]">{label}</p>
      <p className="mt-1 text-sm font-bold">{value || "غير محدد"}</p>
    </div>
  );
}
function Contact({ icon: Icon, label, value, dir }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7faf9] p-4">
      <span className="grid size-9 place-items-center rounded-xl bg-white text-[#216474]">
        <Icon size={17} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#829499]">{label}</p>
        <p className="mt-1 truncate text-sm font-bold" dir={dir}>
          {value || "غير مسجل"}
        </p>
      </div>
    </div>
  );
}
