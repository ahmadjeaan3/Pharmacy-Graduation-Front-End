import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, LoaderCircle, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { deleteDonationImage, getDonationImage } from "../api/donationsApi";

export function ProtectedDonationImage({
  url,
  offerId,
  canDelete = false,
  onDeleted,
  alt = "صورة الدواء المتبرع به",
}) {
  const client = useQueryClient();
  const [deleted, setDeleted] = useState(false);
  const imageKey = ["donations", "image", url];
  const image = useQuery({
    queryKey: imageKey,
    queryFn: () => getDonationImage(url),
    enabled: Boolean(url) && !deleted,
    staleTime: 5 * 60 * 1000,
  });
  const remove = useMutation({
    mutationFn: () => deleteDonationImage(offerId),
    onSuccess: async () => {
      setDeleted(true);
      client.removeQueries({ queryKey: imageKey, exact: true });
      await onDeleted?.();
    },
  });
  const source = useMemo(
    () => (!deleted && image.data ? URL.createObjectURL(image.data) : ""),
    [deleted, image.data],
  );

  useEffect(() => () => source && URL.revokeObjectURL(source), [source]);

  const imageNotFound = image.error?.response?.status === 404;

  if (!url || deleted || imageNotFound) {
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
    <figure className="relative overflow-hidden rounded-2xl border border-[#174B57]/10 bg-[#F5F9F9]">
      {canDelete && offerId ? (
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => {
            if (
              window.confirm(
                "هل تريد حذف صورة العرض؟ سيبقى عرض التبرع محفوظًا دون الصورة.",
              )
            ) {
              remove.mutate();
            }
          }}
          className="absolute start-3 top-3 z-10 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white/95 px-3 py-2 text-xs font-black text-rose-700 shadow-md backdrop-blur transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
        >
          {remove.isPending ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
          {remove.isPending ? "جارٍ الحذف..." : "حذف الصورة"}
        </button>
      ) : null}
      <img src={source} alt={alt} className="max-h-80 w-full object-contain" />
      <figcaption className="border-t border-[#174B57]/8 px-4 py-2 text-xs text-[#60777C]">
        صورة أولية للعبوة — يبقى الفحص الفعلي لدى الصيدلية إلزاميًا
      </figcaption>
      {remove.isError ? (
        <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">
          {getApiErrorMessage(remove.error)}
        </p>
      ) : null}
    </figure>
  );
}
