import { AlertTriangle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";

export function PharmacyLoadingState({ label = "جاري تجهيز مساحة العمل..." }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-[1.6rem] border border-[#174b57]/8 bg-white">
      <div className="text-center">
        <LoaderCircle
          className="mx-auto animate-spin text-[#216474]"
          size={32}
        />
        <p className="mt-3 text-sm font-bold text-[#71858a]">{label}</p>
      </div>
    </div>
  );
}
export function PharmacyErrorState({ message, onRetry }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-[1.6rem] border border-rose-100 bg-white p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle size={23} />
        </span>
        <h3 className="mt-4 font-black">تعذر إكمال العرض</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#71858a]">
          {message}
        </p>
        {onRetry && (
          <button className="btn-secondary mx-auto mt-5" onClick={onRetry}>
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}
export function PharmacyEmptyState({ title, description, action }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-[1.6rem] border border-dashed border-[#174b57]/15 bg-white/70 p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
          <Inbox size={23} />
        </span>
        <h3 className="mt-4 font-black">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#71858a]">
          {description}
        </p>
        {action}
      </div>
    </div>
  );
}
