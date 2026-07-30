import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlarmClock,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  Clock3,
  Eye,
  Megaphone,
  Pencil,
  Plus,
  Radio,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  adminKeys,
  createHomeTickerItem,
  deleteHomeTickerItem,
  getHomeTickerItems,
  getHomeTickerPharmacies,
  updateHomeTickerItem,
} from "../api/adminApi";

const emptyForm = {
  type: "Announcement",
  title: "",
  message: "",
  pharmacyProfileId: "",
  isActive: true,
  sortOrder: 0,
  startsAtUtc: "",
  endsAtUtc: "",
};

const toPayload = (form) => ({
  ...form,
  pharmacyProfileId:
    form.type === "DutyPharmacy" ? form.pharmacyProfileId || null : null,
  sortOrder: Number(form.sortOrder) || 0,
  startsAtUtc: form.startsAtUtc
    ? new Date(form.startsAtUtc).toISOString()
    : null,
  endsAtUtc: form.endsAtUtc ? new Date(form.endsAtUtc).toISOString() : null,
});

const toLocalInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("ar-SY", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "دون تاريخ محدد";

const getRuntimeStatus = (item) => {
  if (!item.isActive)
    return {
      label: "متوقف",
      tone: "bg-slate-100 text-slate-600",
      icon: CircleOff,
    };
  const now = Date.now();
  if (item.startsAtUtc && new Date(item.startsAtUtc).getTime() > now)
    return {
      label: "مجدول",
      tone: "bg-violet-50 text-violet-700",
      icon: CalendarClock,
    };
  if (item.endsAtUtc && new Date(item.endsAtUtc).getTime() < now)
    return {
      label: "منتهي",
      tone: "bg-rose-50 text-rose-700",
      icon: Clock3,
    };
  return {
    label: "يظهر الآن",
    tone: "bg-emerald-50 text-emerald-700",
    icon: Radio,
  };
};

export function AdminHomeTickerPage() {
  const client = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const items = useQuery({
    queryKey: adminKeys.homeTicker,
    queryFn: getHomeTickerItems,
  });
  const pharmacies = useQuery({
    queryKey: adminKeys.homeTickerPharmacies,
    queryFn: getHomeTickerPharmacies,
  });

  const save = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? updateHomeTickerItem(id, payload) : createHomeTickerItem(payload),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: adminKeys.homeTicker });
      setForm(emptyForm);
      setEditingId(null);
      setNotice({
        ok: true,
        text: "تم حفظ العنصر وتحديث الشريط بنجاح.",
      });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });

  const remove = useMutation({
    mutationFn: deleteHomeTickerItem,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: adminKeys.homeTicker });
      setNotice({ ok: true, text: "تم حذف العنصر من الشريط." });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });

  const toggle = useMutation({
    mutationFn: (item) =>
      updateHomeTickerItem(item.id, {
        type: item.type,
        title: item.title,
        message: item.message,
        pharmacyProfileId: item.pharmacyProfileId || null,
        isActive: !item.isActive,
        sortOrder: item.sortOrder,
        startsAtUtc: item.startsAtUtc,
        endsAtUtc: item.endsAtUtc,
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: adminKeys.homeTicker }),
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });

  const allItems = useMemo(() => items.data || [], [items.data]);
  const stats = useMemo(() => {
    const live = allItems.filter(
      (item) => getRuntimeStatus(item).label === "يظهر الآن",
    ).length;
    return {
      total: allItems.length,
      live,
      scheduled: allItems.filter(
        (item) => getRuntimeStatus(item).label === "مجدول",
      ).length,
      duty: allItems.filter((item) => item.type === "DutyPharmacy").length,
    };
  }, [allItems]);

  const field = (name) => ({
    value: form[name],
    onChange: (event) =>
      setForm((current) => ({ ...current, [name]: event.target.value })),
  });

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setNotice(null);
  };

  const edit = (item) => {
    setEditingId(item.id);
    setNotice(null);
    setForm({
      type: item.type,
      title: item.title,
      message: item.message,
      pharmacyProfileId: item.pharmacyProfileId || "",
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      startsAtUtc: toLocalInput(item.startsAtUtc),
      endsAtUtc: toLocalInput(item.endsAtUtc),
    });
    document
      .getElementById("ticker-editor")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectedPharmacy = (pharmacies.data || []).find(
    (pharmacy) => pharmacy.id === form.pharmacyProfileId,
  );

  return (
    <div className="space-y-7">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#123f49] px-6 py-8 text-white shadow-[0_24px_70px_rgba(18,63,73,.18)] lg:px-9">
        <div className="absolute -start-20 -top-28 -z-10 size-72 rounded-full border-[48px] border-white/[.035]" />
        <div className="absolute -bottom-24 end-10 -z-10 size-56 rounded-full bg-[#8bd0cb]/10 blur-2xl" />
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-[#8bd0cb]">
              <Sparkles size={16} />
              إدارة محتوى الصفحة الرئيسية
            </p>
            <h2 className="mt-3 text-3xl font-black lg:text-4xl">
              شريط الإعلانات والمناوبات
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              أنشئ إعلانًا أو انشر صيدلية مناوبة، وحدد وقت ظهوره وترتيبه من لوحة
              واحدة واضحة.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#f5cb72] px-5 py-3.5 text-sm font-black text-[#173d46] shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
          >
            <Plus size={18} />
            إنشاء عنصر جديد
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Megaphone}
          label="إجمالي العناصر"
          value={stats.total}
          tone="bg-cyan-50 text-cyan-700"
        />
        <StatCard
          icon={Radio}
          label="تظهر الآن"
          value={stats.live}
          tone="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={CalendarClock}
          label="مجدولة للنشر"
          value={stats.scheduled}
          tone="bg-violet-50 text-violet-700"
        />
        <StatCard
          icon={Building2}
          label="صيدليات مناوبة"
          value={stats.duty}
          tone="bg-amber-50 text-amber-700"
        />
      </section>

      <section
        id="ticker-editor"
        className="scroll-mt-28 overflow-hidden rounded-[1.8rem] border border-[#174b57]/8 bg-white shadow-[0_18px_50px_rgba(23,75,87,.06)]"
      >
        <div className="grid xl:grid-cols-[1fr_0.72fr]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setNotice(null);
              save.mutate({ id: editingId, payload: toPayload(form) });
            }}
            className="p-5 lg:p-8"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                  {editingId ? <Pencil size={21} /> : <Plus size={22} />}
                </span>
                <div>
                  <h3 className="text-xl font-black text-[#29464d]">
                    {editingId ? "تعديل العنصر" : "إضافة عنصر إلى الشريط"}
                  </h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    الحقول المطلوبة تظهر مباشرة في المعاينة
                  </p>
                </div>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="grid size-10 place-items-center rounded-xl border border-[#174b57]/10 text-[#71858a] hover:bg-slate-50"
                  aria-label="إلغاء التعديل"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="form-label">نوع المحتوى</span>
                <select
                  {...field("type")}
                  className="form-input"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value,
                      pharmacyProfileId:
                        event.target.value === "Announcement"
                          ? ""
                          : current.pharmacyProfileId,
                    }))
                  }
                >
                  <option value="Announcement">إعلان عام</option>
                  <option value="DutyPharmacy">صيدلية مناوبة</option>
                </select>
              </label>
              {form.type === "DutyPharmacy" ? (
                <label>
                  <span className="form-label">الصيدلية المناوبة</span>
                  <select
                    {...field("pharmacyProfileId")}
                    required
                    className="form-input"
                  >
                    <option value="">
                      {pharmacies.isLoading
                        ? "جاري تحميل الصيدليات..."
                        : "اختر صيدلية معتمدة"}
                    </option>
                    {(pharmacies.data || []).map((pharmacy) => (
                      <option key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label>
                  <span className="form-label">ترتيب الظهور</span>
                  <input
                    {...field("sortOrder")}
                    type="number"
                    min="0"
                    className="form-input"
                  />
                </label>
              )}
              <label className="md:col-span-2">
                <span className="form-label">عنوان الإعلان</span>
                <input
                  {...field("title")}
                  required
                  maxLength={150}
                  className="form-input"
                  placeholder={
                    form.type === "DutyPharmacy"
                      ? "مثال: صيدلية مناوبة الليلة"
                      : "اكتب عنوانًا واضحًا وجذابًا"
                  }
                />
                <span className="mt-1.5 block text-end text-[10px] text-[#9aabad]">
                  {form.title.length}/150
                </span>
              </label>
              <label className="md:col-span-2">
                <span className="form-label">نص الإعلان</span>
                <textarea
                  {...field("message")}
                  required
                  maxLength={500}
                  rows={4}
                  className="form-textarea resize-y"
                  placeholder="اكتب التفاصيل التي سيشاهدها زوار المنصة"
                />
                <span className="mt-1.5 block text-end text-[10px] text-[#9aabad]">
                  {form.message.length}/500
                </span>
              </label>
              <label>
                <span className="form-label">بداية النشر</span>
                <input
                  {...field("startsAtUtc")}
                  type="datetime-local"
                  className="form-input"
                />
              </label>
              <label>
                <span className="form-label">نهاية النشر</span>
                <input
                  {...field("endsAtUtc")}
                  type="datetime-local"
                  min={form.startsAtUtc || undefined}
                  className="form-input"
                />
              </label>
              {form.type === "DutyPharmacy" && (
                <label>
                  <span className="form-label">ترتيب الظهور</span>
                  <input
                    {...field("sortOrder")}
                    type="number"
                    min="0"
                    className="form-input"
                  />
                </label>
              )}
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#174b57]/8 bg-[#f7faf9] p-4">
                <span>
                  <strong className="block text-sm text-[#29464d]">
                    حالة النشر
                  </strong>
                  <small className="mt-1 block text-xs text-[#829499]">
                    {form.isActive ? "فعال وجاهز للظهور" : "محفوظ دون نشر"}
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="size-5 accent-[#216474]"
                />
              </label>
            </div>

            {notice && (
              <div
                className={`mt-5 flex items-center gap-2 rounded-2xl border p-4 text-sm font-bold ${
                  notice.ok
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-rose-100 bg-rose-50 text-rose-700"
                }`}
              >
                {notice.ok ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <CircleOff size={18} />
                )}
                {notice.text}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#174b57]/8 pt-5">
              <button
                disabled={save.isPending}
                className="btn-primary justify-center"
                type="submit"
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {save.isPending
                  ? "جاري الحفظ..."
                  : editingId
                    ? "حفظ التعديلات"
                    : "إضافة إلى الشريط"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>

          <aside className="relative overflow-hidden bg-[#f2f7f6] p-5 lg:p-8">
            <div className="absolute -end-16 -top-20 size-56 rounded-full bg-[#8bd0cb]/15 blur-2xl" />
            <p className="relative flex items-center gap-2 text-xs font-black text-[#216474]">
              <Eye size={15} />
              معاينة مباشرة
            </p>
            <h3 className="relative mt-2 text-lg font-black text-[#29464d]">
              هكذا سيظهر المحتوى للزوار
            </h3>
            <div className="relative mt-7 overflow-hidden rounded-[1.5rem] bg-[#123f49] p-5 text-white shadow-[0_20px_45px_rgba(18,63,73,.18)]">
              <div className="absolute -end-8 -top-8 size-28 rounded-full border-[18px] border-white/5" />
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
                    form.type === "DutyPharmacy"
                      ? "bg-[#f5cb72] text-[#173d46]"
                      : "bg-[#8bd0cb]/15 text-[#8bd0cb]"
                  }`}
                >
                  {form.type === "DutyPharmacy" ? (
                    <Building2 size={20} />
                  ) : (
                    <BellRing size={20} />
                  )}
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-[#8bd0cb]">
                    {form.type === "DutyPharmacy"
                      ? "صيدلية مناوبة"
                      : "إعلان المنصة"}
                  </span>
                  <h4 className="mt-1 break-words font-black">
                    {form.title || "عنوان الإعلان يظهر هنا"}
                  </h4>
                </div>
              </div>
              <p className="relative mt-4 min-h-14 break-words text-sm leading-7 text-white/65">
                {form.message ||
                  "اكتب نص الإعلان لتشاهد معاينة حقيقية قبل نشره في الصفحة الرئيسية."}
              </p>
              {form.type === "DutyPharmacy" && (
                <div className="relative mt-4 flex items-center gap-2 rounded-xl bg-white/[.07] px-3 py-2.5 text-xs font-bold">
                  <AlarmClock size={15} className="text-[#f5cb72]" />
                  {selectedPharmacy?.name || "اسم الصيدلية المختارة"}
                </div>
              )}
              <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/40">
                <span>{form.isActive ? "جاهز للنشر" : "غير منشور"}</span>
                <span>ترتيب {Number(form.sortOrder) || 0}</span>
              </div>
            </div>
            <div className="relative mt-5 rounded-2xl border border-[#216474]/10 bg-white/70 p-4">
              <p className="flex items-center gap-2 text-xs font-black text-[#29464d]">
                <Clock3 size={15} className="text-[#216474]" />
                مدة الظهور
              </p>
              <p className="mt-2 text-xs leading-6 text-[#71858a]">
                {form.startsAtUtc
                  ? `يبدأ ${formatDate(form.startsAtUtc)}`
                  : "يبدأ مباشرة بعد النشر"}
                <br />
                {form.endsAtUtc
                  ? `وينتهي ${formatDate(form.endsAtUtc)}`
                  : "ويستمر دون تاريخ انتهاء"}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-[#216474]">إدارة المنشورات</p>
            <h3 className="mt-1 text-2xl font-black text-[#29464d]">
              محتوى الشريط
            </h3>
          </div>
          <p className="text-xs text-[#829499]">
            يتم ترتيب العناصر وفق رقم ترتيب الظهور
          </p>
        </div>

        {items.isLoading ? (
          <div className="grid min-h-44 place-items-center rounded-[1.5rem] bg-white text-sm font-bold text-[#71858a]">
            جاري تحميل محتوى الشريط...
          </div>
        ) : items.isError ? (
          <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50 p-6 text-sm font-bold text-rose-700">
            {getApiErrorMessage(items.error)}
          </div>
        ) : allItems.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {[...allItems]
              .sort((first, second) => first.sortOrder - second.sortOrder)
              .map((item) => (
                <TickerCard
                  key={item.id}
                  item={item}
                  onEdit={() => edit(item)}
                  onToggle={() => toggle.mutate(item)}
                  onDelete={() => {
                    if (
                      window.confirm(
                        `هل تريد حذف «${item.title}» من الشريط نهائيًا؟`,
                      )
                    )
                      remove.mutate(item.id);
                  }}
                  busy={
                    (remove.isPending && remove.variables === item.id) ||
                    (toggle.isPending && toggle.variables?.id === item.id)
                  }
                />
              ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center rounded-[1.6rem] border border-dashed border-[#174b57]/15 bg-white p-8 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                <Megaphone size={24} />
              </span>
              <h4 className="mt-4 font-black text-[#29464d]">
                الشريط فارغ حاليًا
              </h4>
              <p className="mt-2 text-sm text-[#829499]">
                أنشئ أول إعلان أو أضف صيدلية مناوبة ليظهر المحتوى هنا.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <article className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_12px_30px_rgba(23,75,87,.04)]">
      <div className="flex items-center justify-between gap-4">
        <span className={`grid size-11 place-items-center rounded-2xl ${tone}`}>
          <Icon size={20} />
        </span>
        <strong className="text-3xl font-black text-[#17363e]">
          {Number(value).toLocaleString("ar-SY")}
        </strong>
      </div>
      <p className="mt-4 text-sm font-bold text-[#71858a]">{label}</p>
    </article>
  );
}

function TickerCard({ item, onEdit, onToggle, onDelete, busy }) {
  const status = getRuntimeStatus(item);
  const StatusIcon = status.icon;
  const duty = item.type === "DutyPharmacy";

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.5rem] border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(23,75,87,.07)] ${
        status.label === "يظهر الآن"
          ? "border-emerald-200/70"
          : "border-[#174b57]/8"
      }`}
    >
      <div
        className={`absolute inset-y-0 start-0 w-1 ${
          duty ? "bg-[#f5cb72]" : "bg-[#8bd0cb]"
        }`}
      />
      <div className="flex items-start gap-4">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
            duty ? "bg-amber-50 text-amber-700" : "bg-[#eaf4f3] text-[#216474]"
          }`}
        >
          {duty ? <Building2 size={21} /> : <BellRing size={21} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
              {duty ? "صيدلية مناوبة" : "إعلان عام"}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${status.tone}`}
            >
              <StatusIcon size={11} />
              {status.label}
            </span>
            <span className="text-[10px] font-bold text-[#9aabad]">
              ترتيب {item.sortOrder}
            </span>
          </div>
          <h4 className="mt-3 break-words text-base font-black text-[#29464d]">
            {item.title}
          </h4>
          <p className="mt-2 line-clamp-2 break-words text-sm leading-7 text-[#71858a]">
            {item.message}
          </p>
          {item.pharmacyName && (
            <p className="mt-3 flex items-center gap-2 text-xs font-black text-[#216474]">
              <Building2 size={14} />
              {item.pharmacyName}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#174b57]/7 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#8a9a9e]">
          <span>البداية: {formatDate(item.startsAtUtc)}</span>
          <span>النهاية: {formatDate(item.endsAtUtc)}</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onToggle}
            className={`grid size-10 place-items-center rounded-xl border transition ${
              item.isActive
                ? "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
            title={item.isActive ? "إيقاف النشر" : "تفعيل النشر"}
          >
            {item.isActive ? <CircleOff size={17} /> : <Radio size={17} />}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onEdit}
            className="grid size-10 place-items-center rounded-xl border border-[#216474]/10 bg-[#eaf4f3] text-[#216474] transition hover:bg-[#dcefed]"
            title="تعديل"
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="grid size-10 place-items-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
            title="حذف"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
