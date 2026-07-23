import { LibraryBig } from "lucide-react";

export function MedicinePageHeader({ title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e8f3f2] text-[#216474]">
          <LibraryBig size={23} />
        </span>
        <div>
          <p className="text-xs font-black tracking-[.12em] text-[#2b7886]">
            الدليل الدوائي المركزي
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-[#102d34]">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#71858a]">
            {description}
          </p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
