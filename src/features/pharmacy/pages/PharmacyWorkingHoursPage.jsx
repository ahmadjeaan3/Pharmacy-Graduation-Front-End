import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Moon,
  Save,
  SunMedium,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  getOpenStatus,
  getWorkingHours,
  pharmacyKeys,
  updateWorkingHours,
} from "../api/pharmacyApi";
import { PharmacyPageHeader } from "../components/PharmacyPageHeader";
import {
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import { dayNames, toTimeValue } from "../utils/pharmacyFormatters";

const defaults = () =>
  dayNames.map((_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: dayOfWeek === 5,
    openTime: "09:00",
    closeTime: "22:00",
  }));

const mapWorkingHours = (periods) => {
  const schedule = defaults();
  (periods || []).forEach((period) => {
    schedule[period.dayOfWeek] = {
      dayOfWeek: period.dayOfWeek,
      isClosed: period.isClosed,
      openTime: toTimeValue(period.openTime) || "09:00",
      closeTime: toTimeValue(period.closeTime) || "22:00",
    };
  });
  return schedule;
};

export function PharmacyWorkingHoursPage() {
  const client = useQueryClient();
  const [daysDraft, setDaysDraft] = useState(null);
  const [notice, setNotice] = useState(null);
  const hours = useQuery({
    queryKey: pharmacyKeys.workingHours,
    queryFn: getWorkingHours,
  });
  const status = useQuery({
    queryKey: pharmacyKeys.openStatus,
    queryFn: getOpenStatus,
    refetchInterval: 60000,
  });
  const days = daysDraft ?? mapWorkingHours(hours.data);
  const save = useMutation({
    mutationFn: updateWorkingHours,
    onSuccess: async (updatedHours) => {
      setDaysDraft(mapWorkingHours(updatedHours));
      setNotice({
        ok: true,
        text: "تم حفظ جدول ساعات العمل وتحديث حالة الصيدلية.",
      });
      await Promise.all([
        client.invalidateQueries({ queryKey: pharmacyKeys.workingHours }),
        client.invalidateQueries({ queryKey: pharmacyKeys.openStatus }),
        client.invalidateQueries({ queryKey: pharmacyKeys.dashboard }),
      ]);
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  if (hours.isLoading)
    return <PharmacyLoadingState label="جاري تحميل ساعات العمل..." />;
  if (hours.isError)
    return (
      <PharmacyErrorState
        message={getApiErrorMessage(hours.error)}
        onRetry={hours.refetch}
      />
    );
  const update = (index, key, value) =>
    setDaysDraft((current) =>
      (current ?? days).map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );
  const submit = (event) => {
    event.preventDefault();
    const periods = days.map((day) =>
      day.isClosed
        ? {
            dayOfWeek: day.dayOfWeek,
            isClosed: true,
            openTime: null,
            closeTime: null,
          }
        : {
            dayOfWeek: day.dayOfWeek,
            isClosed: false,
            openTime: `${day.openTime}:00`,
            closeTime: `${day.closeTime}:00`,
          },
    );
    save.mutate({ periods });
  };
  return (
    <div>
      <PharmacyPageHeader
        eyebrow="مواعيد الخدمة"
        title="ساعات العمل"
        description="اضبط جدول الأسبوع بدقة؛ تستخدم المنصة هذه الأوقات لإظهار حالة الصيدلية الحالية للمرضى."
        actions={
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${status.data?.isOpenNow ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
          >
            {status.data?.isOpenNow ? (
              <SunMedium size={17} />
            ) : (
              <Moon size={17} />
            )}
            {status.data?.isOpenNow ? "مفتوحة الآن" : "مغلقة الآن"}
          </div>
        }
      />
      {notice && (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <form onSubmit={submit} className="surface overflow-hidden">
        <div className="flex items-center gap-4 border-b border-[#174b57]/8 bg-[#f8fbfa] p-6">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#e6f2f1] text-[#216474]">
            <CalendarDays size={22} />
          </span>
          <div>
            <h3 className="font-black">الجدول الأسبوعي</h3>
            <p className="mt-1 text-xs text-[#829499]">
              يمكنك إغلاق أي يوم من زر الحالة المقابل، وتحديد وقت إغلاق في صباح
              اليوم التالي للدوام الليلي
            </p>
          </div>
        </div>
        <div className="divide-y divide-[#174b57]/7">
          {days.map((day, index) => (
            <div
              key={day.dayOfWeek}
              className="grid items-center gap-4 p-5 md:grid-cols-[140px_130px_1fr]"
            >
              <div>
                <p className="font-black">{dayNames[day.dayOfWeek]}</p>
                <p className="mt-1 text-xs text-[#829499]">
                  {day.isClosed
                    ? "يوم إغلاق"
                    : day.closeTime < day.openTime
                      ? "يمتد لليوم التالي"
                      : "يوم عمل"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => update(index, "isClosed", !day.isClosed)}
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-black transition ${day.isClosed ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}
              >
                {day.isClosed ? <Moon size={15} /> : <CheckCircle2 size={15} />}
                {day.isClosed ? "مغلقة" : "مفتوحة"}
              </button>
              <div
                className={`grid grid-cols-2 gap-3 transition ${day.isClosed ? "pointer-events-none opacity-35" : ""}`}
              >
                <label>
                  <span className="form-label">من</span>
                  <input
                    type="time"
                    className="form-input"
                    value={day.openTime}
                    onChange={(e) => update(index, "openTime", e.target.value)}
                    required={!day.isClosed}
                  />
                </label>
                <label>
                  <span className="form-label">إلى</span>
                  <input
                    type="time"
                    className="form-input"
                    value={day.closeTime}
                    onChange={(e) => update(index, "closeTime", e.target.value)}
                    required={!day.isClosed}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-3 border-t border-[#174b57]/8 bg-[#f8fbfa] p-5 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-xs text-[#71858a]">
            <Clock3 size={15} />
            إذا كان وقت الإغلاق أسبق من وقت الفتح، يُحتسب الإغلاق في اليوم
            التالي.
          </p>
          <button
            disabled={save.isPending}
            className="btn-primary justify-center"
          >
            <Save size={17} />
            {save.isPending ? "جاري الحفظ..." : "حفظ ساعات العمل"}
          </button>
        </div>
      </form>
    </div>
  );
}
