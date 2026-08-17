import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock3,
  ClipboardCheck,
  FileImage,
  MapPin,
  Pill,
  Search,
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
    mutationFn: ({ id, pharmacyId }) =>
      reservePrescription(id, pharmacyId),
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
    analyze.error ||
    reserve.error ||
    cancel.error ||
    reminders.error;

  const prescriptions = list.data || [];

  return (
    <div
      dir="rtl"
      className="m-0 min-h-screen w-full bg-[#F7F9FA] p-0 text-[#333333]"
    >
      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        className="
          relative isolate -mt-6 overflow-hidden
          bg-[#0D7586] text-white
          sm:-mt-7 lg:-mt-8
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-20
            bg-[radial-gradient(circle_at_15%_10%,rgba(139,208,203,.22),transparent_25rem),radial-gradient(circle_at_92%_15%,rgba(255,255,255,.10),transparent_22rem)]
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[linear-gradient(105deg,rgba(0,56,67,.22),rgba(13,117,134,.55),rgba(0,63,76,.36))]
          "
        />

        <div
          className="
            mx-auto grid min-h-[245px] w-full max-w-[1200px]
            items-center gap-7 px-5 py-8
            sm:px-7 lg:grid-cols-[1fr_auto] lg:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-4 text-right">
            <span
              className="
                grid size-14 shrink-0 place-items-center
                rounded-[14px]
                border border-white/15
                bg-white/10
                backdrop-blur-sm
              "
            >
              <FileImage size={27} strokeWidth={1.7} />
            </span>

            <div className="min-w-0">
              <span className="text-[11px] font-medium text-white/70">
                تحليل ذكي للوصفات
              </span>

              <h1 className="mt-1.5 text-[29px] font-bold leading-tight sm:text-[33px]">
                الوصفة الذكية
              </h1>

              <p className="mt-3 max-w-[690px] text-[12px] leading-6 text-white/75">
                ارفع صورة واضحة أو ملف PDF لوصفتك المطبوعة، وسنستخرج الأدوية
                ونساعدك في الوصول إلى الصيدليات المطابقة بشكل منظم وسريع.
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 lg:w-[360px]">
            <HeroMiniCard
              icon={Upload}
              title="رفع الوصفة"
              subtitle="JPG / PNG / PDF"
            />
            <HeroMiniCard
              icon={Search}
              title="مطابقة الأدوية"
              subtitle="مع الصيدليات"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main
        className="
          mx-auto w-full max-w-[1200px]
          px-4 pb-12 pt-10
          sm:px-6 lg:px-8 xl:px-0
        "
      >
        {/* Upload block */}
        <section
          className="
            overflow-hidden rounded-[14px]
            border border-[rgba(102,102,102,.14)]
            bg-white
            shadow-[0_12px_30px_rgba(33,100,116,.05)]
          "
        >
          <div className="border-b border-[#EDF1F2] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-right">
                <span className="text-[11px] font-medium text-[#216474]">
                  ابدأ من هنا
                </span>
                <h2 className="mt-1 text-[20px] font-semibold text-[#333333]">
                  ارفع وصفتك لتحليلها
                </h2>
                <p className="mt-1 text-[11.5px] leading-6 text-[#A5A5A5]">
                  نقبل وصفة مطبوعة واضحة بصيغة صورة أو PDF حتى 10 MB.
                </p>
              </div>

              <span
                className="
                  inline-flex items-center gap-2 self-start
                  rounded-full bg-[#E6F3F6]
                  px-3 py-1.5
                  text-[10.5px] font-medium text-[#216474]
                "
              >
                <Pill size={13} />
                استخراج أسماء الأدوية
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                group relative flex min-h-[210px] w-full cursor-pointer
                flex-col items-center justify-center
                overflow-hidden rounded-[12px]
                border-2 border-dashed border-[#B9D4D8]
                bg-[#F8FBFB]
                px-6 py-8 text-center
                transition
                hover:border-[#216474]/45
                hover:bg-[#F3F9F9]
              "
            >
              <span
                className="
                  grid size-16 place-items-center
                  rounded-[14px]
                  bg-[#E6F3F6]
                  text-[#216474]
                  transition group-hover:scale-105
                "
              >
                <Upload size={27} strokeWidth={1.8} />
              </span>

              <strong className="mt-4 text-[15px] font-semibold text-[#333333]">
                {file ? file.name : "اختر صورة أو ملف PDF"}
              </strong>

              <span className="mt-2 text-[11px] text-[#8A9A9E]">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB — اضغط لتغيير الملف`
                  : "JPG، PNG، PDF — الحد الأقصى 10 MB"}
              </span>

              <span
                className="
                  mt-4 inline-flex items-center justify-center
                  rounded-[7px]
                  border border-[#D3E3E6]
                  bg-white px-4 py-2
                  text-[11px] font-medium text-[#216474]
                "
              >
                تصفح الملفات
              </span>
            </button>

            <input
              ref={fileInputRef}
              className="sr-only"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={(event) =>
                selectFile(event.target.files?.[0])
              }
            />

            {file ? (
              <div className="mt-3 flex justify-start">
                <button
                  type="button"
                  className="
                    inline-flex items-center gap-2
                    rounded-[7px]
                    border border-[#F1D7D7]
                    bg-[#FFF8F8]
                    px-3 py-2
                    text-[11px] font-medium text-[#D95454]
                  "
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  إزالة الملف
                </button>
              </div>
            ) : null}

            <button
              type="button"
              disabled={!file || analyze.isPending}
              onClick={() => analyze.mutate()}
              className="
                mt-4 inline-flex h-12 w-full
                items-center justify-center gap-2
                rounded-[8px]
                bg-[#216474]
                px-5
                text-[13px] font-medium text-white
                shadow-[0_8px_18px_rgba(33,100,116,.12)]
                transition hover:bg-[#174B57]
                disabled:cursor-not-allowed disabled:opacity-45
              "
            >
              <FileImage size={18} />
              {analyze.isPending
                ? "جاري قراءة الوصفة..."
                : "تحليل الوصفة"}
            </button>

            {analyze.isPending ? (
              <div
                className="
                  mt-3 rounded-[8px]
                  border border-[#D9E7E9]
                  bg-[#F4FAFA]
                  px-4 py-3
                  text-center text-[11px] leading-5
                  text-[#60777C]
                "
              >
                تم رفع الملف، جارٍ استخراج أسماء الأدوية وتحليل الوصفة.
              </div>
            ) : null}

            {fileError ? (
              <div
                className="
                  mt-3 flex items-start gap-2
                  rounded-[8px]
                  border border-[#F4E4C7]
                  bg-[#FFF9EF]
                  px-4 py-3
                  text-[11.5px] font-medium
                  text-[#A66A0A]
                "
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                {fileError}
              </div>
            ) : null}

            {error ? (
              <div
                className="
                  mt-3 flex items-start gap-2
                  rounded-[8px]
                  border border-[#F2DADA]
                  bg-[#FFF7F7]
                  px-4 py-3
                  text-[11.5px] font-medium
                  text-[#C84C4C]
                "
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                {getApiErrorMessage(error)}
              </div>
            ) : null}
          </div>
        </section>

        {/* Prescriptions area */}
        <section className="mt-8 grid items-start gap-5 xl:grid-cols-[285px_minmax(0,1fr)]">
          <aside
            className="
              overflow-hidden rounded-[12px]
              border border-[rgba(102,102,102,.14)]
              bg-white
              xl:sticky xl:top-24
            "
          >
            <div className="border-b border-[#EDF1F2] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-right">
                  <h2 className="text-[14px] font-semibold text-[#333333]">
                    الوصفات السابقة
                  </h2>
                  <p className="mt-1 text-[10.5px] text-[#A5A5A5]">
                    اختر وصفة لعرض تفاصيلها
                  </p>
                </div>

                <span
                  className="
                    rounded-full bg-[#E6F3F6]
                    px-2.5 py-1
                    text-[10px] font-medium text-[#216474]
                  "
                >
                  {prescriptions.length}
                </span>
              </div>
            </div>

            <div className="max-h-[560px] space-y-2 overflow-y-auto p-3">
              {prescriptions.length ? (
                prescriptions.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedId(order.id)}
                    className={`
                      w-full rounded-[9px]
                      border p-3.5
                      text-right transition
                      ${
                        selectedId === order.id
                          ? "border-[#216474]/35 bg-[#EEF7F7]"
                          : "border-[#E6ECEE] bg-white hover:bg-[#FAFCFC]"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`
                          grid size-9 shrink-0 place-items-center rounded-[7px]
                          ${
                            selectedId === order.id
                              ? "bg-[#216474] text-white"
                              : "bg-[#E6F3F6] text-[#216474]"
                          }
                        `}
                      >
                        <FileImage size={15} />
                      </span>

                      <div className="min-w-0 flex-1 text-right">
                        <strong className="block truncate text-[11.5px] font-semibold text-[#333333]">
                          {order.originalFileName}
                        </strong>
                        <span className="mt-1 block text-[10px] text-[#8A9A9E]">
                          {labels[order.status] || order.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="grid min-h-[180px] place-items-center px-4 text-center">
                  <div>
                    <FileImage
                      size={25}
                      className="mx-auto text-[#B8C4C7]"
                    />
                    <p className="mt-3 text-[11px] leading-5 text-[#A5A5A5]">
                      لا توجد وصفات سابقة حتى الآن.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0">
            {detail.data ? (
              <Details
                order={detail.data}
                reserve={reserve}
                cancel={cancel}
                reminders={reminders}
              />
            ) : (
              <div
                className="
                  grid min-h-[320px] place-items-center
                  rounded-[12px]
                  border border-[rgba(102,102,102,.14)]
                  bg-white p-8 text-center
                "
              >
                <div>
                  <span
                    className="
                      mx-auto grid size-16 place-items-center
                      rounded-[14px]
                      bg-[#E6F3F6]
                      text-[#216474]
                    "
                  >
                    <ClipboardCheck size={27} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-[#333333]">
                    اختر وصفة لعرض نتائجها
                  </h3>
                  <p className="mt-2 text-[11.5px] leading-6 text-[#A5A5A5]">
                    ستظهر هنا الأدوية المستخرجة والصيدليات المطابقة وحالة الحجز.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function HeroMiniCard({ icon: Icon, title, subtitle }) {
  return (
    <div
      className="
        flex min-h-[72px] items-center gap-3
        rounded-[9px]
        border border-white/12
        bg-white/10
        px-4 py-3
        backdrop-blur-sm
      "
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-white/10">
        <Icon size={17} />
      </span>

      <div className="text-right">
        <strong className="block text-[11.5px] font-medium text-white">
          {title}
        </strong>
        <span className="mt-1 block text-[9.5px] text-white/65">
          {subtitle}
        </span>
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
    <div className="space-y-5">
      <section className="rounded-[12px] border border-[rgba(102,102,102,.14)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-[#333333]">أدوية الوصفة</h2>
            <p className="mt-1 text-[11px] text-[#A5A5A5]">
              ابحث عن كل دواء في الصيدليات القريبة ثم أرسل طلبك مباشرة.
            </p>
          </div>
          {minutes !== null && order.status === "Reserved" && (
            <span className="flex items-center gap-2 rounded-full bg-[#FFF7E8] px-3 py-2 text-[10.5px] font-medium text-[#B97A12]">
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
                className="rounded-[10px] border border-[#E3EAEC] bg-[#FBFCFC] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <strong className="flex items-center gap-2 text-[14px] font-semibold text-[#333333]">
                      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#E6F3F6] text-[#216474]">
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
                    <p className="mt-2 text-[11px] leading-6 text-[#71858A]">
                      {[
                        item.scientificName,
                        compactStrength(item.strength),
                        item.dosageInstructions,
                      ]
                        .filter(Boolean)
                        .join(" • ") || "لا توجد تفاصيل إضافية"}
                    </p>
                    <small className="mt-1 block font-medium text-[#60777C]">
                      الكمية المطلوبة: {item.requestedQuantity}
                      {item.reservedQuantity
                        ? ` — المحجوز: ${item.reservedQuantity}`
                        : ""}
                    </small>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <MedicineAlternativesButton
                      medicineName={medicineName}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[7px] border border-[#D5E4E6] bg-white px-3 text-[11px] font-medium text-[#216474] transition hover:bg-[#F4FAFA]"
                    />
                    <Link
                      to={`/app/search?q=${encodeURIComponent(medicineName)}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[7px] border border-[#D5E4E6] bg-white px-3 text-[11px] font-medium text-[#216474] transition hover:bg-[#F4FAFA]"
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
        <section className="rounded-[12px] border border-[#F3E0BB] bg-[#FFF9EF] p-5">
          <h3 className="flex items-center gap-2 font-semibold text-[#9A670F]">
            <AlertTriangle size={18} /> تنبيهات الملف الصحي
          </h3>
          <ul className="mt-3 space-y-2 text-[11.5px] leading-7 text-[#8A631D]">
            {order.warnings.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </section>
      )}
      {order.status === "Analyzed" && (
        <section className="rounded-[12px] border border-[rgba(102,102,102,.14)] bg-white p-5 sm:p-6">
          <h3 className="font-black text-[#29464d]">أفضل الصيدليات المطابقة</h3>
          <div className="mt-4 space-y-3">
            {order.pharmacyMatches.map((m) => (
              <article
                key={m.pharmacyId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#E3EAEC] bg-[#FBFCFC] p-4"
              >
                <div>
                  <strong className="text-[13px] font-semibold text-[#333333]">
                    {m.pharmacyName}
                  </strong>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[#A5A5A5]">
                    <MapPin size={13} />
                    {m.address}
                  </p>
                  <small className="font-medium text-[#2A8B57]">
                    متوفر {m.availableItems}/{m.totalItems} —{" "}
                    {m.matchPercentage}%
                  </small>
                </div>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-[7px] bg-[#216474] px-4 text-[11px] font-medium text-white transition hover:bg-[#174B57]"
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
          <section className="flex flex-col items-center rounded-[12px] border border-[rgba(102,102,102,.14)] bg-white p-6 text-center">
            <QRCodeSVG value={order.qrPayload} size={180} />
            <strong className="mt-4 text-[#29464d]">QR الاستلام</strong>
            <small className="text-[#829499]">
              اعرضه للصيدلي لتأكيد الاستلام
            </small>
            <button
              className="mt-4 inline-flex min-h-9 items-center justify-center rounded-[7px] border border-[#E6ECEE] bg-white px-4 text-[11px] font-medium text-[#60777C] hover:bg-[#F8FAFA]"
              onClick={() => cancel.mutate(order.id)}
            >
              إلغاء الحجز
            </button>
          </section>
        )}
      {order.status === "Collected" && !order.doseRemindersEnabled && (
        <button
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[8px] bg-[#216474] px-5 text-[12px] font-medium text-white transition hover:bg-[#174B57]"
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