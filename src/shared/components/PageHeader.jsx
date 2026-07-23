export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[1.7rem] bg-[#174b57] px-6 py-7 text-white shadow-[0_20px_50px_rgba(23,75,87,.14)] lg:px-8">
      <div className="noise absolute inset-0 -z-10" />
      <div className="absolute -left-10 -top-24 -z-10 size-64 rounded-full border-[38px] border-white/[.035]" />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#f5cb72]">
              <Icon size={23} />
            </span>
          )}
          <div>
            <p className="text-sm font-bold text-[#8bd0cb]">{eyebrow}</p>
            <h2 className="mt-1 text-3xl font-black">{title}</h2>
            <p className="mt-2 max-w-2xl leading-7 text-white/60">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
    </section>
  );
}
