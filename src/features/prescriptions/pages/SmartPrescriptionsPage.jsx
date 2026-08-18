import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock3,
  FileImage,
  MapPin,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { MedicineAlternativesButton } from "../../intelligence/components/MedicineAlternativesButton";
import {
  activatePrescriptionReminders,
  analyzePrescription,
  cancelPrescription,
  getMyPrescriptions,
  getPrescription,
  prescriptionKeys,
  reservePrescription,
} from "../api/prescriptionsApi";

const labels = {
  Analyzed: "تم تحليلها",
  Reserved: "محجوزة",
  ReadyForPickup: "جاهزة للاستلام",
  Collected: "تم الاستلام",
  Expired: "انتهت المهلة",
  Cancelled: "ملغاة",
};

const SMART_PRESCRIPTION_IMAGE = "/assets/app/home/smart-prescription.png";

export function SmartPrescriptionsPage() {
  const client = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const list = useQuery({
    queryKey: prescriptionKeys.mine,
    queryFn: getMyPrescriptions,
    refetchInterval: 5000,
  });
  const detail = useQuery({
    queryKey: prescriptionKeys.detail(selectedId),
    queryFn: () => getPrescription(selectedId),
    enabled: !!selectedId,
    refetchInterval: 3000,
  });
  const refresh = (data) => {
    client.invalidateQueries({ queryKey: prescriptionKeys.mine });
    if (data?.id) {
      setSelectedId(data.id);
      client.setQueryData(prescriptionKeys.detail(data.id), data);
    }
  };
  const analyze = useMutation({
    mutationFn: () => analyzePrescription(file),
    onSuccess: (data) => {
      refresh(data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });
  const selectFile = (selected) => {
    setFileError("");
    if (!selected) return;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(selected.type)) {
      setFile(null);
      setFileError("اختر صورة JPG أو PNG أو ملف PDF فقط.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setFileError("حجم الملف أكبر من 10 MB.");
      return;
    }
    setFile(selected);
  };
  const reserve = useMutation({
    mutationFn: ({ id, pharmacyId }) => reservePrescription(id, pharmacyId),
    onSuccess: refresh,
  });
  const cancel = useMutation({
    mutationFn: cancelPrescription,
    onSuccess: refresh,
  });
  const reminders = useMutation({
    mutationFn: (id) =>
      activatePrescriptionReminders(id, {
        doseRemindersEnabled: true,
        refillReminderEnabled: true,
        reminderTime: "09:00:00",
        durationDays: 30,
        refillAfterDays: 25,
      }),
    onSuccess: refresh,
  });
  const error =
    analyze.error || reserve.error || cancel.error || reminders.error;
  return (
    <div className="space-y-6 pb-4">
      <section
        className="relative isolate overflow-hidden bg-[#0d7586] text-white"
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
          marginTop: "-24px",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_25%,rgba(62,204,219,.46),transparent_31%),linear-gradient(115deg,#064c5c_0%,#0d7586_52%,#093f4d_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="mx-auto grid min-h-[330px] w-full max-w-[1440px] items-center gap-4 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-12 lg:py-10">
          <div className="order-1 text-center lg:text-right">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur-sm">
              <Sparkles size={15} /> الوصفة الذكية
            </span>
            <h1 className="mx-auto mt-4 max-w-[700px] text-3xl font-black leading-[1.35] sm:text-4xl lg:mx-0 lg:text-[42px]">
              ارفع وصفتك المطبوعة، ودعنا نقرأها لك
            </h1>
            <p className="mx-auto mt-3 max-w-[680px] text-sm leading-7 text-white/75 lg:mx-0">
              حمّل صورة واضحة أو ملف PDF، وسنستخرج الأدوية ونساعدك في إيجادها
              وحجزها من الصيدليات القريبة.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-bold text-white/85 lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <ShieldCheck size={15} /> قراءة آمنة وواضحة
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <FileImage size={15} /> JPG، PNG، PDF
              </span>
            </div>
          </div>

          <div className="order-2 flex items-center justify-center lg:justify-end">
            <div className="relative h-[190px] w-full max-w-[320px] sm:h-[220px] lg:h-[270px] lg:max-w-[390px]">
              <div className="absolute inset-x-8 bottom-2 h-16 rounded-full bg-cyan-200/30 blur-2xl" />
              <img
                src={SMART_PRESCRIPTION_IMAGE}
                alt="تحليل الوصفة الطبية بذكاء"
                className="relative h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,.22)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="surface mx-auto max-w-[1440px] p-4 sm:p-6">
        <div className="mb-4 text-center sm:text-right">
          <h2 className="text-xl font-black text-[#29464d]">حمّل وصفتك</h2>
          <p className="mt-1 text-xs leading-6 text-[#71858a]">
            استخدم وصفة مطبوعة وواضحة؛ لن نخمن الأسماء إذا كانت الصورة غير
            مقروءة.
          </p>
        </div>
        <button
          type="button"
          className="group flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#216474]/20 bg-[#f7faf9] p-6 text-center transition hover:border-[#216474]/45 hover:bg-[#f1f8f7] sm:min-h-[200px]"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-[#e4f2f3] text-[#216474] transition group-hover:scale-105">
            <Upload size={27} />
          </span>
          <strong className="mt-3 text-[#29464d]">
            {file ? file.name : "اختر صورة أو ملف PDF"}
          </strong>
          <small className="mt-2 text-[#829499]">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB — اضغط لتغيير الملف`
              : "JPG، PNG، PDF — حتى 10 MB"}
          </small>
        </button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />
        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {file ? (
            <button
              type="button"
              className="min-h-11 rounded-xl px-5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              إزالة الملف
            </button>
          ) : null}
          <button
            className="btn-primary min-h-12 flex-1 justify-center"
            disabled={!file || analyze.isPending}
            onClick={() => analyze.mutate()}
          >
            <FileImage size={18} />{" "}
            {analyze.isPending ? "جاري قراءة الوصفة..." : "تحليل الوصفة"}
          </button>
        </div>
        {analyze.isPending && (
          <p className="mt-3 text-center text-xs font-bold text-[#71858a]">
            تم رفع الصورة، جارٍ استخراج أسماء الأدوية. قد يستغرق أول تحليل نحو
            دقيقة.
          </p>
        )}
        {fileError && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
            {fileError}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
            {getApiErrorMessage(error)}
          </p>
        )}
      </section>
      <div className="grid items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="surface space-y-2 p-4 xl:sticky xl:top-24">
          <h2 className="border-b border-[#174b57]/8 px-1 pb-3 text-base font-black text-[#29464d]">
            الوصفات السابقة
          </h2>
          {(list.data || []).map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedId(order.id)}
              className={`w-full rounded-2xl border p-4 text-start ${selectedId === order.id ? "border-[#216474] bg-[#eef7f6]" : "border-[#174b57]/8 bg-white"}`}
            >
              <strong className="block truncate text-sm text-[#29464d]">
                {order.originalFileName}
              </strong>
              <small className="mt-1 block text-[#71858a]">
                {labels[order.status] || order.status}
              </small>
            </button>
          ))}
          {!list.isLoading && !(list.data || []).length ? (
            <div className="grid min-h-32 place-items-center px-4 text-center text-xs leading-6 text-[#829499]">
              لا توجد وصفات سابقة بعد
            </div>
          ) : null}
        </aside>
        <main className="min-w-0">
          {detail.data ? (
            <Details
              order={detail.data}
              reserve={reserve}
              cancel={cancel}
              reminders={reminders}
            />
          ) : (
            <div className="surface grid min-h-64 place-items-center p-8 text-center text-sm text-[#829499]">
              <div>
                <FileImage className="mx-auto mb-3 text-[#aac3c7]" size={30} />
                اختر وصفة لعرض نتائجها
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Details({ order, reserve, cancel, reminders }) {
  const [minutes, setMinutes] = useState(null);
  useEffect(() => {
    if (!order.reservedUntilUtc || order.status !== "Reserved")
      return undefined;
    const update = () =>
      setMinutes(
        Math.max(
          0,
          Math.ceil(
            (new Date(order.reservedUntilUtc).getTime() - Date.now()) / 60000,
          ),
        ),
      );
    const initialTimer = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 30_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [order.reservedUntilUtc, order.status]);
  return (
    <div className="space-y-4">
      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#29464d]">أدوية الوصفة</h2>
            <p className="mt-1 text-xs text-[#829499]">
              ابحث عن كل دواء في الصيدليات القريبة ثم أرسل طلبك مباشرة.
            </p>
          </div>
          {minutes !== null && order.status === "Reserved" && (
            <span className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
              <Clock3 size={15} /> متبقٍ {minutes} دقيقة
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-3">
          {order.items.map((item) => {
            const medicineName = item.matchedMedicineName || item.extractedName;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#174b57]/8 bg-[#fbfdfc] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <strong className="flex items-center gap-2 text-base text-[#29464d]">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                        <Pill size={18} />
                      </span>
                      {medicineName}
                    </strong>
                    {item.matchedMedicineName &&
                      item.extractedName !== item.matchedMedicineName && (
                        <small className="mt-2 block text-[#829499]">
                          الاسم المقروء: {item.extractedName}
                        </small>
                      )}
                    <p className="mt-2 text-xs leading-6 text-[#71858a]">
                      {[
                        item.scientificName,
                        compactStrength(item.strength),
                        item.dosageInstructions,
                      ]
                        .filter(Boolean)
                        .join(" • ") || "لا توجد تفاصيل إضافية"}
                    </p>
                    <small className="mt-1 block font-bold text-[#60777c]">
                      الكمية المطلوبة: {item.requestedQuantity}
                      {item.reservedQuantity
                        ? ` — المحجوز: ${item.reservedQuantity}`
                        : ""}
                    </small>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <MedicineAlternativesButton
                      medicineName={medicineName}
                      className="btn-secondary justify-center"
                    />
                    <Link
                      to={`/app/search?q=${encodeURIComponent(medicineName)}`}
                      className="btn-secondary justify-center"
                    >
                      <Search size={17} /> بحث وطلب من صيدلية
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {!!order.warnings?.length && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 font-black text-amber-900">
            <AlertTriangle size={18} /> تنبيهات الملف الصحي
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-amber-900">
            {order.warnings.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </section>
      )}
      {order.status === "Analyzed" && (
        <section className="surface p-5">
          <h3 className="font-black text-[#29464d]">أفضل الصيدليات المطابقة</h3>
          <div className="mt-4 space-y-3">
            {order.pharmacyMatches.map((m) => (
              <article
                key={m.pharmacyId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#174b57]/8 p-4"
              >
                <div>
                  <strong className="text-sm text-[#29464d]">
                    {m.pharmacyName}
                  </strong>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#829499]">
                    <MapPin size={13} />
                    {m.address}
                  </p>
                  <small className="font-bold text-emerald-700">
                    متوفر {m.availableItems}/{m.totalItems} —{" "}
                    {m.matchPercentage}%
                  </small>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    reserve.mutate({ id: order.id, pharmacyId: m.pharmacyId })
                  }
                >
                  حجز 20 دقيقة
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {order.qrPayload &&
        ["Reserved", "ReadyForPickup"].includes(order.status) && (
          <section className="surface flex flex-col items-center p-6 text-center">
            <QRCodeSVG value={order.qrPayload} size={180} />
            <strong className="mt-4 text-[#29464d]">QR الاستلام</strong>
            <small className="text-[#829499]">
              اعرضه للصيدلي لتأكيد الاستلام
            </small>
            <button
              className="btn-quiet mt-4"
              onClick={() => cancel.mutate(order.id)}
            >
              إلغاء الحجز
            </button>
          </section>
        )}
      {order.status === "Collected" && !order.doseRemindersEnabled && (
        <button
          className="btn-primary w-full"
          onClick={() => reminders.mutate(order.id)}
        >
          تفعيل تذكير الجرعات وإعادة التعبئة
        </button>
      )}
    </div>
  );
}

function compactStrength(value) {
  if (!value) return "";
  const values = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return [...new Set(values)].slice(0, 2).join("، ");
}
