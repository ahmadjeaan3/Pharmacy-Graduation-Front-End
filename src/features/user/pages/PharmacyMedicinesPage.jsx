import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  PackageSearch,
  Pill,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { getPharmacyDetails, userKeys } from "../api/userApi";
import { formatPrice } from "../utils/userFormatters";

const PHARMACY_HERO_IMAGE = "/assets/app/home/hero_search.png";

function getMedicineImageSource(imageUrl) {
  if (!imageUrl) return null;

  const normalized = String(imageUrl).trim();

  if (!normalized) return null;

  if (
    /^https?:\/\//i.test(normalized) ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  try {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "https://localhost:7048/api";

    const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;

    return `${apiOrigin}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
  } catch {
    return normalized;
  }
}

function medicineSearchText(medicine) {
  return [
    medicine.medicineDisplayName,
    medicine.medicineName,
    medicine.arabicMedicineName,
    medicine.scientificName,
    medicine.arabicScientificName,
    medicine.manufacturer,
    medicine.dosageForm,
    medicine.capacity,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

export function PharmacyMedicinesPage() {
  const { pharmacyId } = useParams();
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: userKeys.pharmacy(pharmacyId),
    queryFn: () => getPharmacyDetails(pharmacyId),
    enabled: Boolean(pharmacyId),
  });

  const medicines = useMemo(() => {
    const items = query.data?.availableMedicines || [];
    const normalized = search.trim().toLocaleLowerCase();

    if (!normalized) return items;

    return items.filter((medicine) =>
      medicineSearchText(medicine).includes(normalized),
    );
  }, [query.data?.availableMedicines, search]);

  if (query.isPending) {
    return <UserLoadingState label="جاري تحميل أدوية الصيدلية..." />;
  }

  if (query.isError) {
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  }

  const pharmacy = query.data?.pharmacy;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F9FA] text-[#333333]">
      <style>{`
        .dawaai-full-bleed {
          width: 100vw;
          margin-inline: calc(50% - 50vw);
        }

        @supports (width: 100dvw) {
          .dawaai-full-bleed {
            width: 100dvw;
            margin-inline: calc(50% - 50dvw);
          }
        }
      `}</style>

      <section
        className="
          dawaai-full-bleed
          relative isolate
          -mt-6 overflow-hidden
          bg-[#0D7586]
          text-white
          sm:-mt-7
          lg:-mt-8
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute inset-0 -z-20
            h-full w-full
            select-none
            object-cover object-center
            opacity-80
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[linear-gradient(90deg,rgba(0,60,73,.18),rgba(3,110,126,.58),rgba(0,63,76,.44))]
          "
        />

        <div
          className="
            mx-auto grid min-h-[200px]
            w-full max-w-[1200px]
            items-center gap-6
            px-5 py-7
            sm:px-7
            lg:grid-cols-[1fr_auto]
            lg:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-4 text-right">
            <span
              className="
                grid size-12 shrink-0
                place-items-center
                rounded-[10px]
                border border-white/15
                bg-white/10
                text-white
                backdrop-blur-sm
              "
            >
              <PackageSearch size={23} strokeWidth={1.8} />
            </span>

            <div className="min-w-0 text-right">
              <p className="text-[11px] text-white/70">
                {pharmacy?.pharmacyName || "الصيدلية"}
              </p>

              <h1 className="mt-1 text-[27px] font-bold leading-tight sm:text-[30px]">
                جميع الأدوية المتوفرة
              </h1>

              <p className="mt-2 max-w-[650px] text-[11.5px] leading-6 text-white/75">
                ابحث ضمن كل الأدوية المتاحة حاليًا في هذه الصيدلية.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-9 sm:px-6 lg:px-8 xl:px-0">
        <div className="mb-4 flex justify-start">
          <Link
            to={`/app/pharmacies/${pharmacyId}`}
            className="
              inline-flex h-11 items-center justify-center gap-2
              rounded-[10px]
              border border-[#DCE8EA]
              bg-white px-4
              text-[13px] font-bold text-[#216474]
              shadow-[0_6px_20px_rgba(23,75,87,.05)]
              transition
              hover:border-[#216474]/30
              hover:bg-[#F3F8F7]
            "
          >
            <ArrowRight size={17} />
            العودة إلى الصيدلية
          </Link>
        </div>

        <section className="mb-6 rounded-[12px] border border-[#DCE8EA] bg-white p-4 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#216474]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#DCE8EA] bg-[#F9FBFB] pr-12 pl-4 text-right text-sm outline-none transition focus:border-[#216474] focus:bg-white focus:ring-4 focus:ring-[#216474]/8"
              placeholder="ابحث باسم الدواء أو الاسم العلمي أو الشركة..."
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#829499]">
            <span>{medicines.length.toLocaleString("ar-SY")} دواء</span>
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="font-bold text-[#216474]"
              >
                مسح البحث
              </button>
            ) : null}
          </div>
        </section>

        {medicines.length ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.medicineId}
                medicine={medicine}
                pharmacyId={pharmacyId}
              />
            ))}
          </section>
        ) : (
          <UserEmptyState
            title="لا توجد أدوية مطابقة"
            description={
              search
                ? "جرّب تغيير عبارة البحث."
                : "لا توجد أدوية متاحة في هذه الصيدلية حاليًا."
            }
          />
        )}
      </main>
    </div>
  );
}

function MedicineCard({ medicine, pharmacyId }) {
  const imageUrl = getMedicineImageSource(
    medicine.imageUrl || medicine.medicineImageUrl,
  );

  const name =
    medicine.medicineDisplayName ||
    medicine.arabicMedicineName ||
    medicine.medicineName;

  const details = [
    medicine.arabicScientificName || medicine.scientificName,
    medicine.manufacturer,
    medicine.dosageForm,
    medicine.capacity,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <article className="group flex min-h-[330px] flex-col overflow-hidden rounded-[12px] border border-[#DCE8EA] bg-white p-4 shadow-[0_8px_26px_rgba(23,75,87,.04)] transition hover:-translate-y-1 hover:border-[#B9D2D6] hover:shadow-[0_18px_42px_rgba(23,75,87,.09)]">
      <div className="relative flex h-[150px] items-center justify-center overflow-hidden rounded-[9px] bg-[#F8FBFB]">
        <Pill
          size={46}
          strokeWidth={1.35}
          className="absolute text-[#216474]/35"
        />

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="relative z-10 h-full w-full bg-white object-contain p-3"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}

        <span className="absolute left-2 top-2 z-20 inline-flex min-h-[23px] items-center rounded-full bg-[#DBFFE6] px-2.5 text-[10px] font-medium text-[#22C55E]">
          متوفر
        </span>
      </div>

      <div className="mt-4 text-right">
        <h2 className="truncate text-[16px] font-bold text-[#333333]">
          {name}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-[40px] text-[11px] leading-5 text-[#A5A5A5]">
          {details || "معلومات الدواء"}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <strong className="text-[14px] font-medium text-[#60777D]">
            {formatPrice(medicine.sellingPrice)}
          </strong>

          {medicine.requiresPrescription ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7DF] px-2.5 py-1 text-[10px] font-bold text-[#DFAE0D]">
              <ShieldCheck size={13} />
              بوصفة
            </span>
          ) : null}
        </div>
      </div>

      <Link
        to={`/app/pharmacies/${pharmacyId}?medicine=${medicine.medicineId}`}
        className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#216474] text-[13px] font-medium text-white transition hover:bg-[#174B57]"
      >
        طلب الدواء
        <ArrowLeft size={17} />
      </Link>
    </article>
  );
}

export default PharmacyMedicinesPage;
