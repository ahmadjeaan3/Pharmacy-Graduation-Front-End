export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  actions,
  className = "",
}) {
  const resolvedAction = action || actions;

  return (
    <section
      className={`relative isolate overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(135deg,#174b57_0%,#10505a_48%,#0c3b45_100%)] px-5 py-6 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] sm:rounded-[1.8rem] sm:px-7 sm:py-8 lg:px-9 ${className}`}
    >
      <div className="noise absolute inset-0 -z-10" />
      <div className="absolute -end-16 -top-28 -z-10 size-72 rounded-full border-[44px] border-white/[.04]" />
      <div className="absolute -bottom-24 -start-16 -z-10 size-56 rounded-full bg-[#8bd0cb]/10 blur-3xl" />
      <div className="absolute end-7 top-0 h-px w-32 bg-gradient-to-l from-[#f5cb72]/80 to-transparent" />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
          {Icon && (
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.09] text-[#f5cb72] shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur sm:size-14">
              <Icon size={24} strokeWidth={1.8} />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs font-extrabold tracking-[.08em] text-[#a8dcd8] sm:text-sm">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-1 text-[1.7rem] font-black leading-tight tracking-[-.025em] sm:text-[2rem]">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65 sm:text-[15px]">
              {description}
            </p>
          </div>
        </div>
        {resolvedAction ? (
          <div className="page-header-actions flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {resolvedAction}
          </div>
        ) : null}
      </div>
    </section>
  );
}
