import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  createSosAlert,
  getAdminSosAlerts,
  getMySosAlerts,
  getNearbySosAlerts,
  sosKeys,
  updateSosAlert,
} from "../api/sosApi";

const statusLabels = {
  New: "جديد",
  InProgress: "قيد المتابعة",
  Resolved: "تمت المعالجة",
  Cancelled: "ملغي",
};

export function SosPage() {
  const { user } = useAuth();
  const roles = (user?.roles || []).map((role) => String(role).toLowerCase());
  if (roles.includes("admin")) return <RequestsCenter admin />;
  if (roles.includes("pharmacy")) return <RequestsCenter />;
  return <UserRequest />;
}

function UserRequest() {
  const qc = useQueryClient();
  const [medicineName, setMedicineName] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const mine = useQuery({ queryKey: sosKeys.mine, queryFn: getMySosAlerts });
  const send = useMutation({
    mutationFn: async () =>
      createSosAlert({
        medicineName,
        message,
        shareContactAndLocation: consent,
        ...(await locate()),
      }),
    onSuccess: () => {
      setMedicineName("");
      setMessage("");
      setConsent(false);
      qc.invalidateQueries({ queryKey: sosKeys.mine });
    },
  });

  return (
    <div dir="rtl" className="space-y-5">
      <section className="rounded-[2rem] bg-gradient-to-l from-[#123f4a] via-[#176273] to-[#168da0] p-7 text-white shadow-xl sm:p-10">
        <Pill size={42} />
        <h1 className="mt-4 text-3xl font-black">طلب مساعدة دوائية عاجلة</h1>
        <p className="mt-3 max-w-3xl leading-7 text-white/85">
          حدد الدواء والحالة وسيصل الطلب إلى الصيدليات المعتمدة ضمن 30 كم لتتمكن
          إحداها من مساعدتك.
        </p>
        <p className="mt-4 rounded-2xl bg-amber-400/15 p-3 text-sm font-bold text-amber-100">
          <AlertTriangle className="ms-2 inline" size={18} />
          إذا كانت الحالة تهدد الحياة فاتصل فوراً بالإسعاف أو رقم الطوارئ
          المحلي؛ هذه الخدمة ليست بديلاً عنهما.
        </p>
      </section>
      <section className="surface grid gap-4 p-5 sm:p-7">
        <label>
          <span className="form-label">اسم الدواء الضروري *</span>
          <input
            className="form-input"
            maxLength={200}
            value={medicineName}
            onChange={(event) => setMedicineName(event.target.value)}
            placeholder="مثال: أنسولين سريع المفعول"
          />
        </label>
        <label>
          <span className="form-label">الحالة أو ملاحظات تساعد الصيدلية</span>
          <textarea
            className="form-textarea min-h-28"
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="الحالة، التركيز المطلوب، أو أي توضيح مهم..."
          />
        </label>
        <label className="flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-slate-700">
          <input
            type="checkbox"
            className="mt-1 size-5 accent-[#176273]"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            أوافق على مشاركة اسمي ورقم هاتفي وموقعي الدقيق وبيانات هذا الطلب مع
            الصيدليات المعتمدة الموجودة ضمن 30 كم، ومع إدارة النظام للمتابعة.
          </span>
        </label>
        <button
          type="button"
          disabled={
            send.isPending || !consent || medicineName.trim().length < 2
          }
          onClick={() => send.mutate()}
          className="btn-primary min-h-14 justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShieldAlert />
          {send.isPending
            ? "جاري تحديد الموقع والإرسال..."
            : "إرسال الطلب للصيدليات القريبة"}
        </button>
        {send.isError && (
          <p className="text-sm font-bold text-rose-700">
            {send.error?.response?.data?.error ||
              send.error?.message ||
              "تعذر إرسال الطلب."}
          </p>
        )}
      </section>
      <AlertList items={mine.data || []} mine />
    </div>
  );
}

function RequestsCenter({ admin = false }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const queryKey = admin ? sosKeys.admin : sosKeys.nearby;
  const requests = useQuery({
    queryKey: [...queryKey, status],
    queryFn: () =>
      admin ? getAdminSosAlerts(status) : getNearbySosAlerts(status),
    refetchInterval: 15000,
  });
  const update = useMutation({
    mutationFn: ({ id, next }) =>
      updateSosAlert(id, { status: next, note: null }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  return (
    <div dir="rtl" className="space-y-5">
      <section className="rounded-[2rem] bg-gradient-to-l from-[#123f4a] to-[#168da0] p-7 text-white sm:p-9">
        <Pill size={38} />
        <h1 className="mt-3 text-3xl font-black">
          {admin ? "مراقبة طلبات الدواء العاجلة" : "طلبات دوائية عاجلة قريبة"}
        </h1>
        <p className="mt-2 text-white/80">
          {admin
            ? "متابعة الطلبات والجهة التي استلمت كل طلب."
            : "طلبات ضمن 30 كم من صيدليتك. ابدأ المتابعة قبل التواصل مع المستخدم."}
        </p>
      </section>
      <section className="surface flex flex-wrap gap-2 p-4">
        {[
          ["", "الكل"],
          ["New", "جديدة"],
          ["InProgress", "قيد المتابعة"],
          ["Resolved", "معالجة"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => setStatus(value)}
            className={status === value ? "btn-primary" : "btn-secondary"}
          >
            {label}
          </button>
        ))}
      </section>
      {requests.isError && (
        <p className="surface p-5 font-bold text-rose-700">
          تعذر تحميل الطلبات.
        </p>
      )}
      <AlertList
        items={requests.data || []}
        admin={admin}
        provider={!admin}
        busy={update.isPending}
        onUpdate={(id, next) => update.mutate({ id, next })}
      />
    </div>
  );
}

function AlertList({ items, admin, provider, mine, onUpdate, busy }) {
  const canManage = admin || provider;
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="surface border-s-4 border-s-[#168da0] p-5"
        >
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="text-lg font-black">
                {item.medicineName || "طلب قديم"}
              </h3>
              {canManage && (
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {item.userName}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {new Date(item.createdAtUtc).toLocaleString("ar-SY")}
              </p>
            </div>
            <span className="h-fit rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800">
              {statusLabels[item.status] || item.status}
            </span>
          </div>
          {item.message && (
            <p className="mt-4 text-sm leading-7">{item.message}</p>
          )}
          {canManage && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.phoneNumber && (
                <a href={`tel:${item.phoneNumber}`} className="btn-secondary">
                  <Phone size={16} />
                  اتصال بالمستخدم
                </a>
              )}
              {item.latitude != null && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                  className="btn-secondary"
                >
                  <MapPin size={16} />
                  فتح الموقع
                </a>
              )}
            </div>
          )}
          {canManage && item.status === "New" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onUpdate(item.id, "InProgress")}
              className="btn-primary mt-4"
            >
              <Clock3 size={16} />
              بدء المتابعة
            </button>
          )}
          {canManage && item.status === "InProgress" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onUpdate(item.id, "Resolved")}
              className="btn-primary mt-4"
            >
              <CheckCircle2 size={16} />
              تمت المساعدة
            </button>
          )}
          {item.handledByName && (
            <p className="mt-3 text-xs text-slate-500">
              جهة المتابعة: {item.handledByName}
            </p>
          )}
          {mine && item.resolutionNote && (
            <p className="mt-2 text-xs text-slate-500">
              الملاحظة: {item.resolutionNote}
            </p>
          )}
        </article>
      ))}
      {!items.length && (
        <div className="surface col-span-full p-12 text-center text-slate-500">
          لا توجد طلبات مطابقة.
        </div>
      )}
    </section>
  );
}

function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(new Error("المتصفح لا يدعم تحديد الموقع."));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
        }),
      () =>
        reject(new Error("تعذر تحديد موقعك. فعّل إذن الموقع ثم أعد المحاولة.")),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 },
    );
  });
}
