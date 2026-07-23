export function PharmacyPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div>
        <p className="text-xs font-black tracking-[.12em] text-[#2b7886]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-[#102d34]">
          {title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#71858a]">
          {description}
        </p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
