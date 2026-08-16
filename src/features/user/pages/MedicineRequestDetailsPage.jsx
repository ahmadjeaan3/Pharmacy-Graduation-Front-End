import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Headphones,
  Info,
  LockKeyhole,
  MapPin,
  Navigation,
  PackageSearch,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  cancelMedicineRequest,
  getMedicineRequest,
  userKeys,
} from "../api/userApi";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  formatDate,
  getRequestStatus,
} from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { Brand } from "../../../shared/components/Brand";

const REQUEST_DETAILS_NOTICE_IMAGE =
  "/assets/app/home/pharmacy.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

function getMedicineImageSource(imageUrl) {
  if (!imageUrl) return null;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  try {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "https://localhost:7048/api";

    const apiOrigin = new URL(
      apiBaseUrl,
      window.location.origin,
    ).origin;

    return `${apiOrigin}${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

export function MedicineRequestDetailsPage() {
  const { t, i18n } = useTranslation();
  const { requestId } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: userKeys.medicineRequest(requestId),
    queryFn: () => getMedicineRequest(requestId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelMedicineRequest(requestId),

    onSuccess: (data) => {
      queryClient.setQueryData(
        userKeys.medicineRequest(requestId),
        data,
      );

      queryClient.invalidateQueries({
        queryKey: ["user", "medicine-requests"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user", "dashboard"],
      });
    },
  });

  if (query.isPending) {
    return (
      <UserLoadingState
        label={t("جاري تحميل تفاصيل الطلب...")}
      />
    );
  }

  if (query.isError) {
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  }

  const request = query.data;

  const status = getRequestStatus(
    request.status,
    request.statusDisplayText,
    t,
  );

  const normalizedStatus =
    request.status === "Available"
      ? "ReadyForPickup"
      : request.status;

  const isReadyForPickup =
    normalizedStatus === "ReadyForPickup";

  const displayName =
    request.medicineDisplayName ||
    request.arabicMedicineName ||
    request.medicineName ||
    t("دواء");

  const medicineImageUrl =
    getMedicineImageSource(request.imageUrl);

  const address =
    [
      request.pharmacyAddress,
      request.pharmacyArea,
      request.pharmacyCity,
    ]
      .filter(Boolean)
      .join("، ") || t("العنوان غير متوفر");

  const updatedAt =
    request.statusUpdatedAtUtc ||
    request.respondedAtUtc ||
    request.createdAtUtc;

  const statusClassName = isReadyForPickup
    ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
    : status.tone;

  return (
    <div
      dir="rtl"
      className="
        m-0 min-h-screen w-full
        overflow-x-hidden
        bg-[#F7F9FA]
        p-0 text-[#333333]
      "
    >
      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main
        className="
          mx-auto w-full max-w-[1660px]
          px-5 pb-14 pt-8
          sm:px-6
          lg:px-10
          xl:px-12
          2xl:px-0
        "
      >
        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-[13px]">
          <Link
            to="/app/requests"
            className="
              font-medium text-[#A5A5A5]
              transition hover:text-[#216474]
            "
          >
            {t("طلباتي")}
          </Link>

          <span className="text-[#C5CDD0]">/</span>

          <span className="font-medium text-[#216474]">
            {t("تفاصيل الطلب")}
          </span>
        </div>

        {/* ===================================================
            TOP CARDS
        ==================================================== */}
      <section className="grid gap-6 xl:grid-cols-[.9fr_1.6fr]">
  {/* بيانات الصيدلية - على اليمين */}
  <aside
    className="
      rounded-[14px]
      border border-[rgba(102,102,102,0.16)]
      bg-white
      shadow-[0_8px_24px_rgba(23,75,87,.035)]
      px-7 py-7
    "
  >
    <div className="mb-4 flex items-center gap-2 text-[#216474]">
      <MapPin size={20} strokeWidth={1.8} />

      <h2 className="text-[19px] font-semibold">
        {t("بيانات الصيدلية")}
      </h2>
    </div>

    <h3 className="text-[20px] font-semibold text-[#333333]">
      {request.pharmacyName || t("صيدلية")}
    </h3>

    <p className="mt-2 text-[13px] leading-7 text-[#777777]">
      {address}
    </p>

    <div className="mt-3">
      {request.pharmacyIsOpenNow ? (
        <span
          className="
            inline-flex items-center gap-1.5
            text-[13px] font-medium
            text-[#2A8B57]
          "
        >
          <span className="size-2 rounded-full bg-[#2A8B57]" />

          {request.pharmacyStatusText || t("مفتوحة الآن")}
        </span>
      ) : request.pharmacyStatusText ? (
        <span className="text-[12.5px] text-[#777777]">
          {request.pharmacyStatusText}
        </span>
      ) : null}
    </div>

    <div className="mt-5 grid gap-2">
      {request.pharmacyGoogleMapsUrl ? (
        <a
          href={request.pharmacyGoogleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex h-11
            items-center justify-center gap-2
            rounded-[9px]
            bg-[#216474]
            px-4
            text-[13px] font-medium
            text-white
            transition hover:bg-[#174B57]
          "
        >
          <Navigation size={15} />
          {t("الاتجاه إلى الصيدلية")}
        </a>
      ) : null}

      {request.pharmacyPhoneNumber ? (
        <a
          href={`tel:${request.pharmacyPhoneNumber}`}
          className="
            inline-flex h-11
            items-center justify-center gap-2
            rounded-[6px]
            border border-[#BFD3D7]
            bg-white
            px-4
            text-[13px] font-medium
            text-[#216474]
            transition hover:bg-[#F2F8F8]
          "
        >
          <Phone size={15} />
          {t("الاتصال بالصيدلية")}
        </a>
      ) : null}

      <Link
        to={`/app/pharmacies/${request.pharmacyId}`}
        className="
          inline-flex h-11
          items-center justify-center
          rounded-[6px]
          border border-[#BFD3D7]
          bg-white
          px-4
          text-[13px] font-medium
          text-[#216474]
          transition hover:bg-[#F2F8F8]
        "
      >
        {t("عرض الصيدلية")}
      </Link>
    </div>
  </aside>

  {/* معلومات الطلب - على اليسار */}
  <section
    className="
      rounded-[12px]
      border border-[rgba(102,102,102,0.16)]
      bg-white
      shadow-[0_8px_24px_rgba(23,75,87,.035)]
      px-7 py-7
    "
  >
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-[#216474]">
        <ClipboardList size={20} strokeWidth={1.8} />

        <h2 className="text-[19px] font-semibold">
          {t("معلومات الطلب")}
        </h2>
      </div>

      <span
        className={`
          inline-flex min-h-[28px]
          items-center justify-center
          rounded-full border
          px-3 text-[11px] font-semibold
          ${statusClassName}
        `}
      >
        {status.label}
      </span>
    </div>

    <div className="divide-y divide-[rgba(102,102,102,0.10)]">
      <InfoRow
        icon={ClipboardList}
        label={t("رقم الطلب")}
        value={request.requestCode || "—"}
      />

      <InfoRow
        icon={CalendarDays}
        label={t("تاريخ الطلب")}
        value={formatDate(request.createdAtUtc, true)}
      />

      <InfoRow
        icon={Clock3}
        label={t("آخر تحديث")}
        value={formatDate(updatedAt, true)}
      />

      <InfoRow
        icon={PackageSearch}
        label={t("الكمية المطلوبة")}
        value={Number(
          request.requestedQuantity || 0,
        ).toLocaleString(i18n.language)}
      />

      <InfoRow
        icon={CheckCircle2}
        label={t("حالة الطلب")}
        value={status.label}
      />

      {request.note ? (
        <InfoRow
          icon={Info}
          label={t("ملاحظات")}
          value={request.note}
        />
      ) : null}
    </div>
  </section>
</section>

        {/* ===================================================
            محتويات الطلب
        ==================================================== */}
        <section
          className="
            mt-7
            rounded-[12px]
            border border-[rgba(102,102,102,0.16)]
            bg-white
            px-7 py-7
          "
        >
          <div className="mb-4 flex items-center gap-2 text-[#216474]">
            <PackageSearch size={20} strokeWidth={1.8} />

            <h2 className="text-[19px] font-semibold">
              {t("محتويات الطلب")}
            </h2>
          </div>

          <div
            className="
              overflow-hidden
              rounded-[6px]
              border border-[rgba(102,102,102,0.10)]
            "
          >
            <div
              className="
                grid
                grid-cols-[minmax(320px,1fr)_190px]
                items-center
              bg-[#F5F5F5]
                px-5 py-3.5
                text-[13.5px] font-medium
                text-[#8A9A9E]
              "
            >
              <span>{t("الدواء")}</span>
              <span className="text-center">{t("الكمية")}</span>
            </div>

            <div
              className="
                grid min-h-[88px]
                grid-cols-[minmax(320px,1fr)_190px]
                items-center
                bg-white
                px-5 py-3.5
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex size-14 shrink-0
                    items-center justify-center
                    overflow-hidden
                    rounded-[6px]
                    bg-[#F7FAFA]
                  "
                >
                  {medicineImageUrl ? (
                    <img
                      src={medicineImageUrl}
                      alt={displayName}
                      className="max-h-12 max-w-12 object-contain"
                    />
                  ) : (
                    <PackageSearch
                      size={18}
                      strokeWidth={1.7}
                      className="text-[#216474]"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <h3
                    className="
                      truncate
                      text-[15px] font-semibold
                      text-[#333333]
                    "
                  >
                    {displayName}
                  </h3>

                  {request.medicineName &&
                  request.medicineName !== displayName ? (
                    <p className="mt-1 truncate text-[13px] text-[#A5A5A5]">
                      {request.medicineName}
                    </p>
                  ) : null}
                </div>
              </div>

              <span
                className="
                  text-center
                  text-[13px] font-medium
                  text-[#555555]
                "
              >
                {Number(
                  request.requestedQuantity || 0,
                ).toLocaleString(i18n.language)}
              </span>
            </div>
          </div>

          <div
            className="
              mt-5
              flex items-center gap-3
              rounded-[6px]
              bg-[#EEF7F8]
              px-4 py-3
              text-[11px]
              text-[#71858A]
            "
          >
            <Info
              size={16}
              className="shrink-0 text-[#216474]"
            />

            {t(
              "يتم تأكيد توفر الدواء والكمية من الصيدلية بعد مراجعة الطلب.",
            )}
          </div>
        </section>

        {/* ===================================================
            STATUS + PICKUP
        ==================================================== */}
        <section className="mt-7 grid gap-6 xl:grid-cols-[.85fr_1.25fr]">
          {/* حالة الطلب */}
          <section
            className="
              rounded-[12px]
              border border-[rgba(102,102,102,0.16)]
              bg-white
              px-7 py-7
            "
          >
            <div className="mb-4 flex items-center gap-2 text-[#216474]">
              <CheckCircle2 size={18} />

              <h2 className="text-[19px] font-semibold">
                {t("حالة الطلب")}
              </h2>
            </div>

            <div className="divide-y divide-[rgba(102,102,102,0.10)]">
              <CompactRow
                label={t("الكمية المطلوبة")}
                value={Number(
                  request.requestedQuantity || 0,
                ).toLocaleString(i18n.language)}
              />

              <CompactRow
                label={t("حالة الطلب")}
                value={status.label}
                valueClass={
                  isReadyForPickup
                    ? "text-[#2A8B57]"
                    : ""
                }
              />

              <CompactRow
                label={t("وقت التحديث")}
                value={formatDate(updatedAt, true)}
              />

              <CompactRow
                label={t("رد الصيدلية")}
                value={
                  request.hasPharmacyResponse
                    ? t("تم الرد")
                    : t("بانتظار الرد")
                }
              />
            </div>

            {request.pharmacyResponseNote ? (
              <div
                className="
                  mt-4
                  rounded-[7px]
                  bg-[#F5F9FA]
                  px-4 py-3
                "
              >
                <span className="text-[10.5px] text-[#8A9A9E]">
                  {t("رد الصيدلية")}
                </span>

                <p className="mt-1.5 text-[12px] leading-6 text-[#555555]">
                  {request.pharmacyResponseNote}
                </p>
              </div>
            ) : null}
          </section>

          {/* معلومات الاستلام */}
          <section
            className="
              rounded-[12px]
              border border-[rgba(102,102,102,0.16)]
              bg-white
              px-7 py-7
            "
          >
            <div className="mb-4 flex items-center gap-2 text-[#216474]">
              <Navigation size={18} />

              <h2 className="text-[19px] font-semibold">
                {t("معلومات الاستلام")}
              </h2>
            </div>

            <div className="space-y-4">
              <PickupRow
                icon={MapPin}
                title={t("عنوان الاستلام")}
                text={address}
              />

              <PickupRow
                icon={Clock3}
                title={t("حالة الاستلام")}
                text={
                  isReadyForPickup
                    ? t(
                        "الدواء جاهز للاستلام من الصيدلية.",
                      )
                    : t(
                        "سيظهر الاستلام بعد تأكيد توفر الدواء من الصيدلية.",
                      )
                }
              />

              <PickupRow
                icon={ShieldCheck}
                title={t("ملاحظة مهمة")}
                text={t(
                  "يرجى الاحتفاظ برقم الطلب عند التوجه إلى الصيدلية.",
                )}
              />
            </div>
          </section>
        </section>

        {/* ===================================================
            HELP + CANCEL
        ==================================================== */}
        <section
          className="
            mt-7
            flex flex-col gap-5
            rounded-[12px]
            border border-[rgba(102,102,102,0.16)]
            bg-white
            px-7 py-7
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-2 text-[#216474]">
              <Headphones size={18} />

              <h2 className="text-[19px] font-semibold">
                {t("هل تحتاج إلى مساعدة؟")}
              </h2>
            </div>

            <p className="mt-2 text-[13px] leading-6 text-[#8A9A9E]">
              {t(
                "إذا كان لديك استفسار حول الطلب يمكنك التواصل مع الصيدلية مباشرة.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {request.pharmacyPhoneNumber ? (
              <a
                href={`tel:${request.pharmacyPhoneNumber}`}
                className="
                  inline-flex h-11
                  items-center justify-center gap-2
                  rounded-[6px]
                  border border-[#BFD3D7]
                  bg-white
                  px-5
                  text-[13px] font-medium
                  text-[#216474]
                  transition hover:bg-[#F2F8F8]
                "
              >
                <Phone size={15} />
                {t("تواصل مع الصيدلية")}
              </a>
            ) : null}

            {request.canCancel ? (
              <button
                type="button"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="
                  inline-flex h-11
                  items-center justify-center gap-2
                  rounded-[6px]
                  border border-[#F0C7C7]
                  bg-white
                  px-5
                  text-[12px] font-medium
                  text-[#D64C4C]
                  transition
                  hover:bg-[#FFF6F6]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <XCircle size={15} />

                {cancelMutation.isPending
                  ? t("جاري الإلغاء...")
                  : t("إلغاء الطلب")}
              </button>
            ) : null}
          </div>
        </section>

        {cancelMutation.isError ? (
          <p className="mt-3 text-[12px] font-medium text-[#D64C4C]">
            {getApiErrorMessage(cancelMutation.error)}
          </p>
        ) : null}

        {/* ===================================================
            NOTICE
        ==================================================== */}
        <section
          className="
            mt-7
            flex min-h-[120px]
            items-center justify-between gap-6
            rounded-[12px]
            border border-[rgba(102,102,102,0.16)]
            bg-[rgba(230,243,246,0.6)]
            px-7 py-5
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <Info
              size={34}
              strokeWidth={1.7}
              className="shrink-0 text-[#216474]"
            />

            <div className="min-w-0 text-right">
              <h3 className="text-[22px] font-medium leading-none text-[#333333]">
                {t("تنويه هام")}
              </h3>

              <p className="mt-3 text-[17px] leading-[1.7] text-[#A5A5A5]">
                {t(
                  "هذه الخدمة مخصصة فقط لتأكيد توفر الدواء داخل الصيدلية، ولا توفر المنصة خدمة توصيل الأدوية.",
                )}
              </p>
            </div>
          </div>

          <img
            src={REQUEST_DETAILS_NOTICE_IMAGE}
            alt=""
            aria-hidden="true"
            className="
              h-[78px] w-[118px]
              shrink-0
              object-contain
              opacity-30
            "
          />
        </section>
      </main>

  
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-h-[58px] items-center justify-between gap-5 py-3.5">
      <div className="flex items-center gap-2 text-[#8A9A9E]">
        <Icon
          size={16}
          strokeWidth={1.7}
          className="shrink-0 text-[#216474]"
        />

        <span className="text-[13px]">
          {label}
        </span>
      </div>

      <strong
        className="
          max-w-[65%]
          text-left
          text-[11.5px]
          font-medium
          leading-5
          text-[#555555]
        "
      >
        {value || "—"}
      </strong>
    </div>
  );
}

function CompactRow({
  label,
  value,
  valueClass = "",
}) {
  return (
    <div className="flex min-h-[54px] items-center justify-between gap-5 py-3.5">
      <span className="text-[12.5px] text-[#8A9A9E]">
        {label}
      </span>

      <strong
        className={`
          text-[11.5px]
          font-medium
          text-[#555555]
          ${valueClass}
        `}
      >
        {value || "—"}
      </strong>
    </div>
  );
}

function PickupRow({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={19}
        className="
          mt-1 shrink-0
          text-[#216474]
        "
      />

      <div className="min-w-0">
        <h3 className="text-[12px] font-medium text-[#555555]">
          {title}
        </h3>

        <p className="mt-1 text-[13px] leading-7 text-[#8A9A9E]">
          {text}
        </p>
      </div>
    </div>
  );
}

function FooterFeature({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center justify-start gap-3">
      <span
        className="
          grid size-9 shrink-0
          place-items-center
          rounded-[7px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="flex flex-col items-start gap-1.5">
        <strong className="text-[13px] font-medium text-[#666666]">
          {title}
        </strong>

        <p className="text-[10.5px] text-[#A5A5A5]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default MedicineRequestDetailsPage;