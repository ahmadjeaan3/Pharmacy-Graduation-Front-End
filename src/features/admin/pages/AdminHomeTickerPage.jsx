import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlarmClock,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
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

const statTones = {
  primary: "bg-[#EAF4F3] text-[#216474]",
  success: "bg-[#EAF4F3] text-[#174B57]",
  muted: "bg-[#F0F6F7] text-[#60777D]",
  warning: "bg-[#FFF7DF] text-[#DFAE0D]",
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
  if (!value) {
    return "";
  }

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
  if (!item.isActive) {
    return {
      label: "متوقف",
      tone: "bg-[#F0F6F7] text-[#60777D]",
      dot: "bg-[#829499]",
      icon: CircleOff,
    };
  }

  const now = Date.now();

  if (item.startsAtUtc && new Date(item.startsAtUtc).getTime() > now) {
    return {
      label: "مجدول",
      tone: "bg-[#FFF7DF] text-[#DFAE0D]",
      dot: "bg-[#DFAE0D]",
      icon: CalendarClock,
    };
  }

  if (item.endsAtUtc && new Date(item.endsAtUtc).getTime() < now) {
    return {
      label: "منتهي",
      tone: "bg-[#FFF1F2] text-[#E11D48]",
      dot: "bg-[#E11D48]",
      icon: Clock3,
    };
  }

  return {
    label: "يظهر الآن",
    tone: "bg-[#EAF4F3] text-[#174B57]",
    dot: "bg-[#216474]",
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
      await client.invalidateQueries({
        queryKey: adminKeys.homeTicker,
      });

      setForm(emptyForm);
      setEditingId(null);

      setNotice({
        ok: true,
        text: "تم حفظ العنصر وتحديث الشريط بنجاح.",
      });
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const remove = useMutation({
    mutationFn: deleteHomeTickerItem,

    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: adminKeys.homeTicker,
      });

      setNotice({
        ok: true,
        text: "تم حذف العنصر من الشريط.",
      });
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
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
      client.invalidateQueries({
        queryKey: adminKeys.homeTicker,
      }),

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
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
      setForm((current) => ({
        ...current,
        [name]: event.target.value,
      })),
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

    document.getElementById("ticker-editor")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const selectedPharmacy = (pharmacies.data || []).find(
    (pharmacy) => pharmacy.id === form.pharmacyProfileId,
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174B57] px-6 py-8 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] lg:px-9">
        <div className="noise absolute inset-0 -z-10" />

        <div className="absolute -start-20 -top-28 -z-10 size-72 rounded-full border-[48px] border-white/[.035]" />

        <div className="absolute -bottom-24 end-10 -z-10 size-56 rounded-full bg-[#6E969E]/10 blur-2xl" />

        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-black text-[#8BD0CB]">
              <Sparkles size={16} />
              إدارة محتوى الصفحة الرئيسية
            </p>

            <h1 className="mt-3 text-3xl font-black lg:text-4xl">
              شريط الإعلانات والمناوبات
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              أنشئ إعلانًا أو انشر صيدلية مناوبة، وحدد وقت ظهوره وترتيبه من لوحة
              واحدة واضحة.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#F5CB72] bg-[#F5CB72] px-5 py-3.5 text-sm font-black text-[#173D46] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#F8D784]"
          >
            <Plus size={18} />
            إنشاء عنصر جديد
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Megaphone}
          label="إجمالي العناصر"
          detail="كل عناصر الشريط"
          value={stats.total}
          tone="primary"
        />

        <StatCard
          icon={Radio}
          label="تظهر الآن"
          detail="معروضة للمستخدمين"
          value={stats.live}
          tone="success"
        />

        <StatCard
          icon={CalendarClock}
          label="مجدولة للنشر"
          detail="ستظهر لاحقًا"
          value={stats.scheduled}
          tone="muted"
        />

        <StatCard
          icon={Building2}
          label="صيدليات مناوبة"
          detail="مناوبات منشورة"
          value={stats.duty}
          tone="warning"
        />
      </section>

      {/* Editor */}
      <section
        id="ticker-editor"
        className="scroll-mt-28 overflow-hidden rounded-[1.6rem] border border-[#DCE8EA] bg-white shadow-[0_14px_40px_rgba(23,75,87,.055)]"
      >
        <div className="grid xl:grid-cols-[minmax(0,1fr)_420px]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setNotice(null);

              save.mutate({
                id: editingId,
                payload: toPayload(form),
              });
            }}
            className="p-5 lg:p-8"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                  {editingId ? <Pencil size={21} /> : <Plus size={22} />}
                </span>

                <div>
                  <h2 className="text-xl font-black text-[#29464D]">
                    {editingId ? "تعديل العنصر" : "إضافة عنصر إلى الشريط"}
                  </h2>

                  <p className="mt-1 text-xs text-[#829499]">
                    الحقول المطلوبة تظهر مباشرة في المعاينة
                  </p>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="grid size-10 place-items-center rounded-xl border border-[#DCE8EA] text-[#71858A] transition hover:bg-[#F8FBFB]"
                  aria-label="إلغاء التعديل"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="نوع المحتوى">
                <SelectShell>
                  <select
                    {...field("type")}
                    className="h-12 w-full appearance-none rounded-xl border border-[#DCE8EA] bg-white px-4 pe-10 text-sm text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
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
                </SelectShell>
              </FormField>

              {form.type === "DutyPharmacy" ? (
                <FormField label="الصيدلية المناوبة">
                  <SelectShell>
                    <select
                      {...field("pharmacyProfileId")}
                      required
                      className="h-12 w-full appearance-none rounded-xl border border-[#DCE8EA] bg-white px-4 pe-10 text-sm text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
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
                  </SelectShell>
                </FormField>
              ) : (
                <FormField label="ترتيب الظهور">
                  <input
                    {...field("sortOrder")}
                    type="number"
                    min="0"
                    className="h-12 w-full rounded-xl border border-[#DCE8EA] bg-white px-4 text-sm text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  />
                </FormField>
              )}

              <FormField label="عنوان الإعلان" className="md:col-span-2">
                <input
                  {...field("title")}
                  required
                  maxLength={150}
                  className="h-12 w-full rounded-xl border border-[#DCE8EA] bg-white px-4 text-sm text-[#29464D] outline-none transition placeholder:text-[#A5A5A5] hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  placeholder={
                    form.type === "DutyPharmacy"
                      ? "مثال: صيدلية مناوبة الليلة"
                      : "اكتب عنوانًا واضحًا وجذابًا"
                  }
                />

                <span className="mt-1.5 block text-end text-[10px] text-[#A5A5A5]">
                  {form.title.length}
                  /150
                </span>
              </FormField>

              <FormField label="نص الإعلان" className="md:col-span-2">
                <textarea
                  {...field("message")}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-[#DCE8EA] bg-white px-4 py-3 text-sm text-[#29464D] outline-none transition placeholder:text-[#A5A5A5] hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  placeholder="اكتب التفاصيل التي سيشاهدها زوار المنصة"
                />

                <span className="mt-1.5 block text-end text-[10px] text-[#A5A5A5]">
                  {form.message.length}
                  /500
                </span>
              </FormField>

              <FormField label="بداية النشر">
                <input
                  {...field("startsAtUtc")}
                  type="datetime-local"
                  className="h-12 w-full rounded-xl border border-[#DCE8EA] bg-white px-4 text-sm text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                />
              </FormField>

              <FormField label="نهاية النشر">
                <input
                  {...field("endsAtUtc")}
                  type="datetime-local"
                  min={form.startsAtUtc || undefined}
                  className="h-12 w-full rounded-xl border border-[#DCE8EA] bg-white px-4 text-sm text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                />
              </FormField>

              {form.type === "DutyPharmacy" && (
                <FormField label="ترتيب الظهور">
                  <input
                    {...field("sortOrder")}
                    type="number"
                    min="0"
                    className="h-12 w-full rounded-xl border border-[#DCE8EA] bg-white px-4 text-sm text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  />
                </FormField>
              )}

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#DCE8EA] bg-[#F8FBFB] p-4">
                <span>
                  <strong className="block text-sm text-[#29464D]">
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
                className={`mt-5 flex items-center gap-2 rounded-xl border p-4 text-sm font-bold ${
                  notice.ok
                    ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#174B57]"
                    : "border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]"
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

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#E6EEF0] pt-5">
              <button
                disabled={save.isPending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#174B57] px-5 text-sm font-black text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DCE8EA] bg-white px-5 text-sm font-bold text-[#60777D] transition hover:bg-[#F8FBFB]"
                  onClick={resetForm}
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>

          {/* Preview */}
          <aside className="relative overflow-hidden border-t border-[#DCE8EA] bg-[#F4F8F8] p-5 xl:border-s xl:border-t-0 lg:p-8">
            <div className="absolute -end-16 -top-20 size-56 rounded-full bg-[#6E969E]/10 blur-2xl" />

            <p className="relative flex items-center gap-2 text-xs font-black text-[#216474]">
              <Eye size={15} />
              معاينة مباشرة
            </p>

            <h3 className="relative mt-2 text-lg font-black text-[#29464D]">
              هكذا سيظهر المحتوى للزوار
            </h3>

            <div className="relative mt-7 overflow-hidden rounded-[1.4rem] bg-[#174B57] p-5 text-white shadow-[0_20px_45px_rgba(23,75,87,.18)]">
              <div className="absolute -end-8 -top-8 size-28 rounded-full border-[18px] border-white/5" />

              <div className="relative flex items-start gap-3">
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                    form.type === "DutyPharmacy"
                      ? "bg-[#F5CB72] text-[#173D46]"
                      : "bg-white/[.10] text-[#8BD0CB]"
                  }`}
                >
                  {form.type === "DutyPharmacy" ? (
                    <Building2 size={20} />
                  ) : (
                    <BellRing size={20} />
                  )}
                </span>

                <div className="min-w-0">
                  <span className="text-[10px] font-black text-[#8BD0CB]">
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
                  <AlarmClock size={15} className="text-[#F5CB72]" />

                  {selectedPharmacy?.name || "اسم الصيدلية المختارة"}
                </div>
              )}

              <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/40">
                <span>{form.isActive ? "جاهز للنشر" : "غير منشور"}</span>

                <span>ترتيب {Number(form.sortOrder) || 0}</span>
              </div>
            </div>

            <div className="relative mt-5 rounded-xl border border-[#DCE8EA] bg-white p-4">
              <p className="flex items-center gap-2 text-xs font-black text-[#29464D]">
                <Clock3 size={15} className="text-[#216474]" />
                مدة الظهور
              </p>

              <p className="mt-2 text-xs leading-6 text-[#71858A]">
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

      {/* Items */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-[#216474]">إدارة المنشورات</p>

            <h2 className="mt-1 text-2xl font-black text-[#29464D]">
              محتوى الشريط
            </h2>
          </div>

          <p className="text-xs text-[#829499]">
            يتم ترتيب العناصر وفق رقم ترتيب الظهور
          </p>
        </div>

        {items.isLoading ? (
          <div className="grid min-h-44 place-items-center rounded-[1.5rem] border border-[#DCE8EA] bg-white text-sm font-bold text-[#71858A]">
            جاري تحميل محتوى الشريط...
          </div>
        ) : items.isError ? (
          <div className="rounded-[1.5rem] border border-[#FECDD3] bg-[#FFF1F2] p-6 text-sm font-bold text-[#BE123C]">
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
                    ) {
                      remove.mutate(item.id);
                    }
                  }}
                  busy={
                    (remove.isPending && remove.variables === item.id) ||
                    (toggle.isPending && toggle.variables?.id === item.id)
                  }
                />
              ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center rounded-[1.6rem] border border-dashed border-[#CFE0E3] bg-white p-8 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                <Megaphone size={24} />
              </span>

              <h4 className="mt-4 font-black text-[#29464D]">
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

function FormField({ label, children, className = "" }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-[12px] font-bold text-[#216474]">
        {label}
      </span>

      {children}
    </label>
  );
}

function SelectShell({ children }) {
  return (
    <div className="relative">
      {children}

      <ChevronDown
        size={17}
        strokeWidth={1.8}
        className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-[#6E969E]"
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, detail, value, tone = "primary" }) {
  return (
    <article className="flex min-h-[112px] items-center gap-4 rounded-[1.35rem] border border-[#DCE8EA] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-xl ${
          statTones[tone] || statTones.primary
        }`}
      >
        <Icon size={21} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <strong className="block text-[28px] font-black leading-none text-[#17363E]">
          {Number(value || 0).toLocaleString("ar-SY")}
        </strong>

        <span className="mt-2 block text-[12px] font-bold text-[#71858A]">
          {label}
        </span>

        <span className="mt-1 block text-[10px] text-[#A5A5A5]">{detail}</span>
      </div>
    </article>
  );
}

function TickerCard({ item, onEdit, onToggle, onDelete, busy }) {
  const status = getRuntimeStatus(item);

  const StatusIcon = status.icon;

  const duty = item.type === "DutyPharmacy";

  return (
    <article className="group relative overflow-hidden rounded-[1.45rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)] transition hover:-translate-y-0.5 hover:border-[#AFC9CD] hover:shadow-[0_18px_42px_rgba(23,75,87,.08)]">
      <div
        className={`absolute inset-y-0 start-0 w-1 ${
          duty ? "bg-[#F5CB72]" : "bg-[#216474]"
        }`}
      />

      <div className="flex items-start gap-4">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-xl ${
            duty ? "bg-[#FFF7DF] text-[#DFAE0D]" : "bg-[#EAF4F3] text-[#216474]"
          }`}
        >
          {duty ? <Building2 size={21} /> : <BellRing size={21} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#F0F6F7] px-2.5 py-1 text-[10px] font-black text-[#60777D]">
              {duty ? "صيدلية مناوبة" : "إعلان عام"}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${status.tone}`}
            >
              <span className={`size-1.5 rounded-full ${status.dot}`} />

              <StatusIcon size={11} />

              {status.label}
            </span>

            <span className="text-[10px] font-bold text-[#A5A5A5]">
              ترتيب {item.sortOrder}
            </span>
          </div>

          <h3 className="mt-3 break-words text-base font-black text-[#29464D]">
            {item.title}
          </h3>

          <p className="mt-2 line-clamp-2 break-words text-sm leading-7 text-[#71858A]">
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] px-4 py-3">
          <span className="block text-[10px] text-[#829499]">البداية</span>

          <strong className="mt-1 block text-[12px] font-bold text-[#29464D]">
            {formatDate(item.startsAtUtc)}
          </strong>
        </div>

        <div className="rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] px-4 py-3">
          <span className="block text-[10px] text-[#829499]">النهاية</span>

          <strong className="mt-1 block text-[12px] font-bold text-[#29464D]">
            {formatDate(item.endsAtUtc)}
          </strong>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E6EEF0] pt-4">
        <span className="text-[11px] text-[#A5A5A5]">إدارة العنصر</span>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onToggle}
            className={`grid size-10 place-items-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-50 ${
              item.isActive
                ? "border-[#F5CB72]/40 bg-[#FFF7DF] text-[#DFAE0D] hover:bg-[#FCEFC5]"
                : "border-[#CFE4E7] bg-[#EAF4F3] text-[#174B57] hover:bg-[#DCEFED]"
            }`}
            title={item.isActive ? "إيقاف النشر" : "تفعيل النشر"}
          >
            {item.isActive ? <CircleOff size={17} /> : <Radio size={17} />}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onEdit}
            className="grid size-10 place-items-center rounded-xl border border-[#CFE4E7] bg-[#EAF4F3] text-[#216474] transition hover:bg-[#DCEFED] disabled:cursor-not-allowed disabled:opacity-50"
            title="تعديل"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="grid size-10 place-items-center rounded-xl border border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48] transition hover:bg-[#FFE4E6] disabled:cursor-not-allowed disabled:opacity-50"
            title="حذف"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
