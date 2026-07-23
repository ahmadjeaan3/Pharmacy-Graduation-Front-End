import { Building2, CheckCircle2, X } from "lucide-react";

export function ApprovalConfirmDialog({
  item,
  pending,
  error,
  onCancel,
  onConfirm,
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
          تأكيد اعتماد {item.kindLabel}
        </h2>
        <p className="mt-2 leading-7 text-[#687c81]">
          سيتم اعتماد <strong className="text-[#29464d]">{item.name}</strong>{" "}
          وإرسال إشعار إلى صاحب الحساب.
        </p>
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
            disabled={pending}
            className="btn-primary justify-center disabled:opacity-60"
          >
            <CheckCircle2 size={17} />
            {pending ? "جاري الاعتماد..." : "تأكيد الاعتماد"}
          </button>
        </div>
      </div>
    </div>
  );
}
