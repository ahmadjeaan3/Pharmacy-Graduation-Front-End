import {
  AlertCircle,
  AlertTriangle,
  Inbox,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

export function LoadingState({ label = "جاري تحميل البيانات..." }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-[1.5rem] border border-[#174b57]/8 bg-white p-8 text-center">
      <div>
        <LoaderCircle
          className="mx-auto animate-spin text-[#216474]"
          size={30}
        />
        <p className="mt-3 text-sm font-semibold text-[#71858a]">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-[1.5rem] border border-rose-100 bg-white p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle size={23} />
        </span>
        <h3 className="mt-4 font-extrabold text-[#29464d]">
          تعذر عرض البيانات
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#71858a]">
          {message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-secondary mx-auto mt-5"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-[1.5rem] border border-dashed border-[#174b57]/15 bg-white/65 p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
          <Inbox size={23} />
        </span>
        <h3 className="mt-4 font-extrabold text-[#29464d]">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#71858a]">
          {description}
        </p>
        {action}
      </div>
    </div>
  );
}

export function DashboardLoadingState({ cards = 4 }) {
  return (
    <div className="space-y-5" aria-label="جاري تحميل البيانات">
      <div className="h-32 animate-pulse rounded-[1.6rem] bg-slate-200/65" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[1.4rem] bg-white shadow-sm"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-[1.6rem] bg-white shadow-sm" />
    </div>
  );
}

export function DashboardErrorState({ message, onRetry }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-[1.6rem] border border-rose-100 bg-white p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle size={26} />
        </span>
        <h2 className="mt-4 text-xl font-black text-[#17363e]">
          تعذر تحميل البيانات
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-secondary mt-5"
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}

export function DashboardEmptyState({ title, description }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-[#174b57]/15 bg-[#f8fbfa] p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-[#789096] shadow-sm">
          <Inbox size={23} />
        </span>
        <h3 className="mt-4 font-extrabold text-[#29464d]">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}
