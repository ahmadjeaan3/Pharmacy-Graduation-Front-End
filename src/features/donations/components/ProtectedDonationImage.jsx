import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { getDonationImage } from "../api/donationsApi";

export function ProtectedDonationImage({
  url,
  alt = "صورة الدواء المتبرع به",
}) {
  const image = useQuery({
    queryKey: ["donations", "image", url],
    queryFn: () => getDonationImage(url),
    enabled: Boolean(url),
    staleTime: 5 * 60 * 1000,
  });
  const source = useMemo(
    () => (image.data ? URL.createObjectURL(image.data) : ""),
    [image.data],
  );

  useEffect(() => () => source && URL.revokeObjectURL(source), [source]);

  if (!url) {
    return (
      <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-[#174B57]/15 bg-[#F8FBFB] px-4 text-center text-[#789096]">
        <ImageIcon size={27} />
        <span className="text-xs leading-6">
          لا توجد صورة لهذا العرض؛ غالباً أُنشئ قبل تفعيل ميزة صور التبرعات.
        </span>
      </div>
    );
  }

  if (image.isError) {
    return (
      <div className="grid min-h-32 place-items-center rounded-2xl border border-rose-100 bg-rose-50/60 px-4 text-center text-rose-700">
        <ImageIcon size={27} />
        <span className="text-xs leading-6">تعذر تحميل صورة الدواء.</span>
        <button
          type="button"
          onClick={() => image.refetch()}
          className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold transition hover:bg-rose-50"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }
  if (!source) {
    return (
      <div className="grid min-h-48 place-items-center rounded-2xl bg-[#F3F8F8] text-[#789096]">
        <ImageIcon size={28} />
        <span className="text-xs">جاري تحميل صورة الدواء...</span>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-[#174B57]/10 bg-[#F5F9F9]">
      <img src={source} alt={alt} className="max-h-80 w-full object-contain" />
      <figcaption className="border-t border-[#174B57]/8 px-4 py-2 text-xs text-[#60777C]">
        صورة أولية للعبوة — يبقى الفحص الفعلي لدى الصيدلية إلزاميًا
      </figcaption>
    </figure>
  );
}
