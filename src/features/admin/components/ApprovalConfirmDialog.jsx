import { Building2, CheckCircle2, X, XCircle } from "lucide-react";

export function ApprovalConfirmDialog({
  item,
  pending,
  error,
  onCancel,
  onConfirm,
  decision,
  reason,
  onDecisionChange,
  onReasonChange,
}) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-[#071f25]/55 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-title"
    >
      <div className="w-full max-w-md rounded-[1.7rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Building2 size={23} />
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="icon-button grid !size-9"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
        <h2
          id="approval-title"
          className="mt-5 text-xl font-black text-[#17363e]"
        >
          التحقق اليدوي من {item.kindLabel}
        </h2>
        <p className="mt-2 leading-7 text-[#687c81]">
          راجع بيانات <strong className="text-[#29464d]">{item.name}</strong> ثم
          اختر الاعتماد أو الرفض وسجّل سبب القرار الإداري.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDecisionChange("approve")}
            className={`rounded-xl border p-3 font-black ${decision === "approve" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200"}`}
          >
            <CheckCircle2 className="mx-auto mb-1" size={19} /> اعتماد يدوي
          </button>
          <button
            type="button"
            onClick={() => onDecisionChange("reject")}
            className={`rounded-xl border p-3 font-black ${decision === "reject" ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200"}`}
          >
            <XCircle className="mx-auto mb-1" size={19} /> رفض يدوي
          </button>
        </div>
        <label className="mt-4 block">
          <span className="form-label">ملاحظة التحقق اليدوي</span>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            maxLength={2000}
            className="form-textarea min-h-28"
            placeholder="دوّن ما راجعته وسبب القرار بوضوح (10 أحرف على الأقل)"
          />
        </label>
        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="btn-secondary justify-center"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending || !decision || reason.trim().length < 10}
            className="btn-primary justify-center disabled:opacity-60"
          >
            <CheckCircle2 size={17} />
            {pending ? "جاري حفظ القرار..." : "حفظ القرار اليدوي"}
          </button>
        </div>
      </div>
    </div>
  );
}
