import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { getPharmacyRequests, pharmacyKeys } from "../api/pharmacyApi";
import {
  PharmacyEmptyState,
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import {
  formatDate,
  formatNumber,
  requestMeta,
} from "../utils/pharmacyFormatters";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

export function PharmacyRequestsPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "ar"
  )
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    take: 50,
  });

  const [queryFilters, setQueryFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => setQueryFilters(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);

  const query = useQuery({
    queryKey: pharmacyKeys.requests(queryFilters),
    queryFn: () => getPharmacyRequests(queryFilters),
  });

  const RequestArrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="space-y-5"
    >
      {/* Hero */}
      <section
        className="
          relative isolate min-h-[220px] overflow-hidden
          rounded-[14px] text-white
          shadow-[0_22px_55px_rgba(23,75,87,.16)]
          sm:min-h-[230px]
          lg:min-h-[250px]
        "
      >
        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-[center_38%] ${
            isArabic ? "scale-x-[-1]" : ""
          }`}
        />

        <div
          className="absolute inset-0"
          style={{
            background: isArabic
              ? "linear-gradient(270deg, #10505A 0%, rgba(16,80,90,.90) 38%, rgba(33,100,116,.48) 70%, rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg, #10505A 0%, rgba(16,80,90,.90) 38%, rgba(33,100,116,.48) 70%, rgba(33,100,116,.08) 100%)",
          }}
        />

        {/* نحافظ على العربي كما هو، ونقلب المحاذاة فقط للغات LTR */}
        <div
          className="
            relative z-10 flex min-h-[220px] items-center px-8 py-7
            sm:min-h-[230px]
            lg:min-h-[250px]
            lg:px-10
          "
        >
          <div
            className={`flex w-full max-w-[690px] items-center gap-5 ${
              isArabic
                ? "ml-auto justify-start"
                : "mr-auto justify-start"
            }`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[rgba(230,243,246,.10)] text-[#E6F3F6] backdrop-blur-sm">
              <ClipboardList size={28} strokeWidth={1.7} />
            </span>

            <div
              className={`min-w-0 flex-1 ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              <h1 className="text-[28px] font-medium leading-[1.2] text-white">
                {t("طلبات الأدوية")}
              </h1>

              <p className="mt-3 max-w-[560px] text-[14px] leading-7 text-[#D6D6D6]">
                {t(
                  "راجع الطلبات الواردة وتحقق من المخزون ثم أرسل للمريض إجابة دقيقة أو اقترح بديلًا متاحًا.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search / Sort */}
      <section className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-center">
        <div className="relative w-full">
          <Search
            size={18}
            className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[#A5A5A5] ${
              isArabic ? "right-4" : "left-4"
            }`}
          />

          <input
            dir={direction}
            className={`h-10 w-full rounded-lg border border-[rgba(102,102,102,.16)] bg-white text-[12px] text-[#333333] outline-none transition placeholder:text-[#A5A5A5] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
              isArabic
                ? "pr-14 pl-4 text-right"
                : "pl-14 pr-4 text-left"
            }`}
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                searchTerm: e.target.value,
              }))
            }
            placeholder={t("ابحث هنا في طلبات الأدوية ...")}
          />
        </div>

        <div className="relative w-full">
          <select
            dir={direction}
            className={`h-10 w-full appearance-none rounded border border-[rgba(102,102,102,.16)] bg-white text-[14px] font-medium text-[#A5A5A5] outline-none transition focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
              isArabic
                ? "pr-4 pl-10 text-right"
                : "pl-4 pr-10 text-left"
            }`}
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                status: e.target.value,
              }))
            }
          >
            <option value="">{t("ترتيب حسب")}</option>
            <option value="Pending">{t("بانتظار الرد")}</option>
            <option value="Available">{t("متوفر")}</option>
            <option value="Unavailable">{t("غير متوفر")}</option>
            <option value="Cancelled">{t("ملغي")}</option>
          </select>

          <ChevronDown
            size={18}
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#A5A5A5] ${
              isArabic ? "left-3" : "right-3"
            }`}
          />
        </div>
      </section>

      {/* Content */}
      {query.isLoading ? (
        <PharmacyLoadingState label={t("جاري تحميل الطلبات...")} />
      ) : query.isError ? (
        <PharmacyErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !query.data?.length ? (
        <PharmacyEmptyState
          title={t("لا توجد طلبات مطابقة")}
          description={t(
            "ستظهر طلبات المرضى الجديدة هنا فور وصولها إلى الصيدلية.",
          )}
        />
      ) : (
        <div className="space-y-3">
          {query.data.map((request) => {
            const meta = requestMeta(request.status);

            return (
              <Link
                dir={direction}
                to={`/app/pharmacy/requests/${request.requestId}`}
                key={request.requestId}
                className="group flex min-h-[88px] flex-col gap-4 rounded-[12px] border border-[rgba(102,102,102,.16)] bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#216474]/25 hover:shadow-[0_10px_28px_rgba(23,75,87,.05)] md:flex-row md:items-center"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[rgba(33,100,116,.12)] text-[#216474]">
                  <ClipboardList size={28} strokeWidth={1.7} />
                </span>

                <div
                  className={`min-w-0 flex-1 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-start gap-3">
                    <h3 className="truncate text-[16px] font-bold text-[#333333]">
                      {request.medicineName}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                        request.status === "Pending"
                          ? "bg-[#FFF7DF] text-[#DFAE0D]"
                          : request.status === "Available"
                            ? "bg-[#EAF4F3] text-[#216474]"
                            : request.status === "Unavailable"
                              ? "bg-[#F0F6F7] text-[#60777D]"
                              : request.status === "Cancelled"
                                ? "bg-[#FFF1F2] text-[#E11D48]"
                                : "bg-[#F0F6F7] text-[#60777D]"
                      }`}
                    >
                      {t(meta.label)}
                    </span>

                    <span
                      dir="ltr"
                      className="text-[11px] font-normal text-[#A5A5A5]"
                    >
                      #{request.requestCode}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-start gap-x-4 gap-y-2 text-[12px] text-[#A5A5A5]">
                    <span className="flex items-center gap-2">
                      <UserRound size={16} />
                      {request.userFullName}
                    </span>

                    <span className="flex items-center gap-2">
                      <CalendarClock size={16} />
                      {request.createdAtUtc
                        ? formatDate(
                            request.createdAtUtc,
                            true,
                            currentLanguage,
                          )
                        : t("غير محدد")}
                    </span>

                    <span className="flex items-center gap-2">
                      {t("الكمية")}:{" "}
                      {formatNumber(
                        request.requestedQuantity,
                        currentLanguage,
                      )}
                    </span>

                    {request.userPhoneNumber && (
                      <span className="flex items-center gap-2">
                        <Phone size={16} />
                        <bdi dir="ltr">{request.userPhoneNumber}</bdi>
                      </span>
                    )}
                  </div>

                  {request.note && (
                    <p className="mt-2 line-clamp-1 text-[11px] text-[#A5A5A5]">
                      {t("ملاحظة")}: {request.note}
                    </p>
                  )}
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[14px] font-medium text-[#216474] md:ms-4">
                  {t("عرض الطلب")}
                  <RequestArrow
                    size={24}
                    className={`transition ${
                      isArabic
                        ? "group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}