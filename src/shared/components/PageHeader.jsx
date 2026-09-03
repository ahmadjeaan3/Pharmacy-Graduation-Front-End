
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
      className={`relative isolate w-full min-w-0 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(135deg,#174b57_0%,#10505a_48%,#0c3b45_100%)] px-4 py-5 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] sm:rounded-[1.8rem] sm:px-7 sm:py-8 lg:px-9 ${className}`}
    >
      {/* تأثير الخلفية */}
      <div className="noise absolute inset-0 -z-10" />

      {/* الخط الزخرفي العلوي */}
      <div className="absolute end-4 top-0 h-px w-24 bg-gradient-to-l from-[#f5cb72]/80 to-transparent sm:end-7 sm:w-32" />

      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* المحتوى */}
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {Icon && (
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[.09] text-[#f5cb72] shadow-[inset_0_1px_0_rgba(255,255,255,.12)] backdrop-blur sm:size-14 sm:rounded-2xl">
              <Icon
                size={21}
                strokeWidth={1.8}
                className="sm:size-6"
              />
            </span>
          )}

          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="text-[11px] font-extrabold tracking-[.08em] text-[#a8dcd8] sm:text-sm">
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-1 break-words text-[1.4rem] font-black leading-tight tracking-[-.025em] sm:text-[2rem]">
              {title}
            </h1>

            {description ? (
              <p className="mt-2 max-w-2xl break-words text-xs leading-6 text-white/65 sm:text-[15px] sm:leading-7">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {/* الأزرار */}
        {resolvedAction ? (
          <div className="page-header-actions flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {resolvedAction}
          </div>
        ) : null}
      </div>
    </section>
  );
}

