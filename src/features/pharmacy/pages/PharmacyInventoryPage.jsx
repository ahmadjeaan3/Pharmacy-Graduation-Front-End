import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  PackagePlus,
  Pill,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  addInventoryMedicine,
  getInventory,
  pharmacyKeys,
  removeInventoryMedicine,
  searchMedicineCatalog,
  updateInventoryMedicine,
} from "../api/pharmacyApi";
import {
  PharmacyEmptyState,
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  stockMeta,
} from "../utils/pharmacyFormatters";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

const blank = {
  medicineId: "",
  medicineName: "",
  quantity: 1,
  unitPrice: 0,
  isAvailable: true,
  isPriceVisibleToUsers: true,
  expiryDateUtc: "",
  lowStockThreshold: 5,
};

function InventoryDialog({ item, onClose, onSave, pending }) {
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

  const [form, setForm] = useState(
    item
      ? {
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          isAvailable: item.isAvailable,
          isPriceVisibleToUsers: item.isPriceVisibleToUsers,
          expiryDateUtc: item.expiryDateUtc
            ? item.expiryDateUtc.slice(0, 10)
            : "",
          lowStockThreshold: item.lowStockThreshold,
        }
      : blank,
  );

  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogPage, setCatalogPage] = useState(1);

  const catalog = useQuery({
    queryKey: pharmacyKeys.catalog({ catalogSearch, catalogPage }),
    queryFn: () =>
      searchMedicineCatalog({
        searchTerm: catalogSearch,
        pageNumber: catalogPage,
        pageSize: 8,
      }),
    enabled: !item,
  });

  const change = (key) => (event) =>
    setForm((old) => ({
      ...old,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        dir={direction}
        lang={currentLanguage}
        className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[1.75rem] bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#174b57]/8 bg-white/95 p-5 backdrop-blur">
          <div className={isArabic ? "text-right" : "text-left"}>
            <h3 className="text-xl font-black">
              {item
                ? t("تعديل بيانات الدواء")
                : t("إضافة دواء إلى المخزون")}
            </h3>

            <p className="mt-1 text-xs text-[#829499]">
              {item
                ? item.medicineName
                : t("اختر الدواء أولًا من الدليل المعتمد")}
            </p>
          </div>

          <button
            type="button"
            className="icon-button grid"
            onClick={onClose}
            aria-label={t("إغلاق")}
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            onSave({
              ...form,
              quantity: Number(form.quantity),
              unitPrice: Number(form.unitPrice),
              lowStockThreshold: Number(form.lowStockThreshold),
              expiryDateUtc: form.expiryDateUtc
                ? new Date(`${form.expiryDateUtc}T00:00:00Z`).toISOString()
                : null,
            });
          }}
          className="p-5 lg:p-6"
        >
          {!item && (
            <div>
              <label>
                <span className="form-label">
                  {t("البحث في دليل الأدوية")}
                </span>

                <div className="field-control">
                  <span
                    className={`field-icon-shell ${
                      isArabic ? "" : "left-auto right-auto"
                    }`}
                  >
                    <Search size={17} />
                  </span>

                  <input
                    dir={direction}
                    className="form-input has-field-icon"
                    value={catalogSearch}
                    onChange={(event) => {
                      setCatalogSearch(event.target.value);
                      setCatalogPage(1);
                    }}
                    placeholder={t(
                      "اسم الدواء أو الاسم العلمي أو الشركة",
                    )}
                  />
                </div>
              </label>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(catalog.data?.items || []).map((medicine) => (
                  <button
                    type="button"
                    key={medicine.id}
                    onClick={() =>
                      setForm((old) => ({
                        ...old,
                        medicineId: medicine.id,
                        medicineName: medicine.name,
                        unitPrice: medicine.sellingPrice || 0,
                      }))
                    }
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                      isArabic ? "text-right" : "text-left"
                    } ${
                      form.medicineId === medicine.id
                        ? "border-[#216474] bg-[#eef7f6]"
                        : "border-[#174b57]/9 hover:border-[#216474]/35"
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${
                        form.medicineId === medicine.id
                          ? "bg-[#216474] text-white"
                          : "bg-[#edf5f4] text-[#216474]"
                      }`}
                    >
                      {form.medicineId === medicine.id ? (
                        <Check size={17} />
                      ) : (
                        <Pill size={17} />
                      )}
                    </span>

                    <span className="min-w-0">
                      <strong className="block truncate text-sm">
                        {medicine.name}
                      </strong>

                      <span className="block truncate text-xs text-[#829499]">
                        {medicine.scientificName ||
                          medicine.manufacturer ||
                          t("دواء مسجل")}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {catalog.data?.totalPages > 1 && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="icon-button grid"
                    disabled={catalogPage <= 1}
                    onClick={() => setCatalogPage((page) => page - 1)}
                    aria-label={t("السابق")}
                  >
                    {isArabic ? (
                      <ChevronRight size={17} />
                    ) : (
                      <ChevronLeft size={17} />
                    )}
                  </button>

                  <span className="text-xs font-bold text-[#71858a]">
                    {catalogPage} {t("من")} {catalog.data.totalPages}
                  </span>

                  <button
                    type="button"
                    className="icon-button grid"
                    disabled={catalogPage >= catalog.data.totalPages}
                    onClick={() => setCatalogPage((page) => page + 1)}
                    aria-label={t("التالي")}
                  >
                    {isArabic ? (
                      <ChevronLeft size={17} />
                    ) : (
                      <ChevronRight size={17} />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className={`${
              item ? "" : "mt-7 border-t border-[#174b57]/8 pt-6"
            } grid gap-5 md:grid-cols-2`}
          >
            <label>
              <span className="form-label">{t("الكمية")}</span>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.quantity}
                onChange={change("quantity")}
                required
              />
            </label>

            <label>
              <span className="form-label">{t("سعر البيع")}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={form.unitPrice}
                onChange={change("unitPrice")}
                required
              />
            </label>

            <label>
              <span className="form-label">
                {t("حد تنبيه انخفاض المخزون")}
              </span>
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.lowStockThreshold}
                onChange={change("lowStockThreshold")}
                required
              />
            </label>

            <label>
              <span className="form-label">{t("تاريخ الانتهاء")}</span>
              <input
                type="date"
                className="form-input"
                value={form.expiryDateUtc}
                onChange={change("expiryDateUtc")}
              />
            </label>
          </div>

          <label className="mt-5 flex items-center justify-between rounded-2xl bg-[#f7faf9] p-4">
            <div className={isArabic ? "text-right" : "text-left"}>
              <p className="text-sm font-extrabold">
                {t("متاح للطلبات")}
              </p>
              <p className="mt-1 text-xs text-[#829499]">
                {t("يتوقف تلقائيًا عندما تصبح الكمية صفرًا")}
              </p>
            </div>

            <input
              className="size-5 accent-[#216474]"
              type="checkbox"
              checked={form.isAvailable}
              onChange={change("isAvailable")}
            />
          </label>

          <label className="mt-3 flex items-center justify-between rounded-2xl border border-[#174b57]/8 bg-white p-4">
            <div className={isArabic ? "text-right" : "text-left"}>
              <p className="text-sm font-extrabold">
                {t("إظهار السعر للمستخدمين")}
              </p>
              <p className="mt-1 text-xs text-[#829499]">
                {t(
                  "عند إخفائه سيظهر للمستخدم أن السعر متاح عند التواصل مع الصيدلية.",
                )}
              </p>
            </div>

            <input
              className="size-5 accent-[#216474]"
              type="checkbox"
              checked={form.isPriceVisibleToUsers}
              onChange={change("isPriceVisibleToUsers")}
            />
          </label>

          <div
            className={`mt-6 flex gap-2 ${
              isArabic ? "justify-end" : "justify-end"
            }`}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              {t("إلغاء")}
            </button>

            <button
              disabled={pending || !form.medicineId}
              className="btn-primary"
            >
              <PackagePlus size={17} />
              {pending
                ? t("جاري الحفظ...")
                : item
                  ? t("حفظ التعديل")
                  : t("إضافة للمخزون")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PharmacyInventoryPage() {
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

  const client = useQueryClient();

  const [filters, setFilters] = useState({
    searchTerm: "",
    availableOnly: false,
    stockStatus: "",
    expiringWithinDays: "",
  });

  const [debounced, setDebounced] = useState(filters);
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);

  const inventory = useQuery({
    queryKey: pharmacyKeys.inventory(debounced),
    queryFn: () => getInventory(debounced),
  });

  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({
        queryKey: ["pharmacy", "inventory"],
      }),
      client.invalidateQueries({
        queryKey: pharmacyKeys.dashboard,
      }),
    ]);
  };

  const save = useMutation({
    mutationFn: (payload) =>
      editor?.inventoryItemId
        ? updateInventoryMedicine(editor.inventoryItemId, payload)
        : addInventoryMedicine(payload),
    onSuccess: async () => {
      setEditor(null);
      setNotice({
        ok: true,
        text: t("تم تحديث المخزون بنجاح."),
      });
      await invalidate();
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const remove = useMutation({
    mutationFn: removeInventoryMedicine,
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم حذف الدواء من مخزون الصيدلية."),
      });
      await invalidate();
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="space-y-0"
    >
      {/* Hero */}
      <section className="relative isolate mb-5 min-h-[190px] overflow-hidden rounded-[14px] text-white shadow-[0_18px_45px_rgba(23,75,87,.12)] sm:min-h-[205px] lg:min-h-[220px]">
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

        <div className="relative z-10 mt-7 flex min-h-[190px] flex-col justify-between gap-5 px-6 py-6 sm:min-h-[205px] md:flex-row md:items-center lg:min-h-[220px] lg:px-8">
          <div
            className={`min-w-0 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[.10] text-[#E6F3F6] backdrop-blur-sm">
                <PackagePlus size={20} strokeWidth={1.8} />
              </span>

              <div>
                <h1 className="text-[24px] font-black text-white sm:text-[28px]">
                  {t("إدارة المخزون")}
                </h1>

                <p className="mt-1 max-w-2xl text-xs leading-6 text-[#D6D6D6] sm:text-sm">
                  {t(
                    "أضف الأدوية من الدليل المعتمد وحدث الكميات والأسعار وتواريخ الانتهاء من مكان واحد.",
                  )}
                </p>
              </div>
            </div>
          </div>

          <button
            className="inline-flex h-[58px] min-w-[185px] shrink-0 items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white px-8 text-[15px] font-black text-[#216474] shadow-[0_12px_30px_rgba(7,31,37,.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FBFB]"
            onClick={() => setEditor({})}
          >
            <Plus size={21} strokeWidth={2.3} />
            {t("إضافة دواء")}
          </button>
        </div>
      </section>

      {notice && (
        <div
          className={`mb-5 rounded-xl border p-4 text-sm font-bold ${
            notice.ok
              ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#174B57]"
              : "border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Filters */}
      <section className="mb-5 grid gap-3 rounded-[1.25rem] border border-[#DCE8EA] bg-white p-4 shadow-[0_8px_24px_rgba(23,75,87,.035)] lg:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">
        <div className="relative">
          <Search
            size={18}
            className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[#829499] ${
              isArabic ? "right-5" : "left-5"
            }`}
          />

          <input
            dir={direction}
            type="text"
            className={`h-11 w-full rounded-xl border border-[#DCE8EA] bg-white text-sm text-[#29464D] placeholder:text-[#A5A5A5] outline-none transition focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
              isArabic
                ? "pr-14 pl-4 text-right"
                : "pl-14 pr-4 text-left"
            }`}
            value={filters.searchTerm}
            onChange={(event) =>
              setFilters((old) => ({
                ...old,
                searchTerm: event.target.value,
              }))
            }
            placeholder={t("ابحث هنا باسم الدواء...")}
          />
        </div>

        <div className="relative">
          <select
            dir={direction}
            className={`h-11 w-full appearance-none rounded-xl border border-[#DCE8EA] bg-white text-sm text-[#60777D] outline-none transition focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
              isArabic
                ? "pr-4 pl-10 text-right"
                : "pl-4 pr-10 text-left"
            }`}
            value={filters.stockStatus}
            onChange={(event) =>
              setFilters((old) => ({
                ...old,
                stockStatus: event.target.value,
              }))
            }
          >
            <option value="">{t("كل حالات المخزون")}</option>
            <option value="InStock">{t("متوفر")}</option>
            <option value="LowStock">{t("مخزون منخفض")}</option>
            <option value="OutOfStock">{t("غير متوفر")}</option>
          </select>

          <ChevronDown
            size={16}
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#829499] ${
              isArabic ? "left-3" : "right-3"
            }`}
          />
        </div>

        <div className="relative">
          <select
            dir={direction}
            className={`h-11 w-full appearance-none rounded-xl border border-[#DCE8EA] bg-white text-sm text-[#60777D] outline-none transition focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
              isArabic
                ? "pr-4 pl-10 text-right"
                : "pl-4 pr-10 text-left"
            }`}
            value={filters.expiringWithinDays}
            onChange={(event) =>
              setFilters((old) => ({
                ...old,
                expiringWithinDays: event.target.value,
              }))
            }
          >
            <option value="">{t("كل تواريخ الانتهاء")}</option>
            <option value="30">{t("ينتهي خلال 30 يومًا")}</option>
            <option value="90">{t("ينتهي خلال 3 أشهر")}</option>
            <option value="180">{t("ينتهي خلال 6 أشهر")}</option>
          </select>

          <ChevronDown
            size={16}
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#829499] ${
              isArabic ? "left-3" : "right-3"
            }`}
          />
        </div>

        <label className="flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#DCE8EA] px-4 text-sm font-bold text-[#60777D]">
          <input
            type="checkbox"
            className="size-4 accent-[#216474]"
            checked={filters.availableOnly}
            onChange={(event) =>
              setFilters((old) => ({
                ...old,
                availableOnly: event.target.checked,
              }))
            }
          />
          {t("المتاح فقط")}
        </label>
      </section>

      {inventory.isLoading ? (
        <PharmacyLoadingState
          label={t("جاري قراءة المخزون...")}
        />
      ) : inventory.isError ? (
        <PharmacyErrorState
          message={getApiErrorMessage(inventory.error)}
          onRetry={inventory.refetch}
        />
      ) : !inventory.data?.length ? (
        <PharmacyEmptyState
          title={t("لا توجد أدوية مطابقة")}
          description={t(
            "أضف أول دواء من الدليل أو غيّر خيارات البحث الحالية.",
          )}
          action={
            <button
              onClick={() => setEditor({})}
              className="btn-primary mx-auto mt-5"
            >
              <Plus size={16} />
              {t("إضافة دواء")}
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {inventory.data.map((item) => {
            const meta = stockMeta(item.stockStatus);

            return (
              <article
                key={item.inventoryItemId}
                className="relative overflow-hidden rounded-[1.35rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_28px_rgba(23,75,87,.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(23,75,87,.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-lg bg-[#EAF4F3] text-[#216474]">
                    <Pill size={21} />
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${meta.className}`}
                  >
                    {t(meta.label)}
                  </span>
                </div>

                <h3
                  className={`mt-4 truncate text-lg font-black ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {item.medicineName}
                </h3>

                <p
                  className={`mt-1 truncate text-xs text-[#829499] ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  {item.scientificName ||
                    item.manufacturer ||
                    t("لا توجد تفاصيل إضافية")}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-3 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    <p className="text-[11px] text-[#829499]">
                      {t("الكمية")}
                    </p>
                    <strong className="mt-1 block text-lg">
                      {formatNumber(item.quantity, currentLanguage)}
                    </strong>
                  </div>

                  <div
                    className={`rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-3 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    <p className="text-[11px] text-[#829499]">
                      {t("سعر البيع")}
                    </p>

                    <strong className="mt-1 block text-sm">
                      {formatCurrency(item.sellingPrice, currentLanguage)}
                    </strong>

                    <span
                      className={`mt-1 block text-[10px] font-bold ${
                        item.isPriceVisibleToUsers
                          ? "text-[#216474]"
                          : "text-[#DFAE0D]"
                      }`}
                    >
                      {item.isPriceVisibleToUsers
                        ? t("ظاهر للمستخدمين")
                        : t("مخفي عن المستخدمين")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-[#71858a]">
                  <CalendarClock size={15} />
                  <span>
                    {t("الانتهاء")}:{" "}
                    {item.expiryDateUtc
                      ? formatDate(
                          item.expiryDateUtc,
                          false,
                          currentLanguage,
                        )
                      : t("غير محدد")}
                  </span>

                  {item.daysUntilExpiry !== null &&
                    item.daysUntilExpiry <= 30 && (
                      <AlertTriangle
                        size={15}
                        className="ms-auto text-[#E11D48]"
                      />
                    )}
                </div>

                {item.requiresPrescription && (
                  <p
                    className={`mt-3 rounded-xl bg-[#FFF7DF] px-3 py-2 text-xs font-bold text-[#DFAE0D] ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("يصرف بوصفة طبية")}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#174b57]/8 pt-4">
                  <button
                    className="btn-secondary flex-1 justify-center"
                    onClick={() => setEditor(item)}
                  >
                    <Edit3 size={15} />
                    {t("تعديل")}
                  </button>

                  <button
                    className="icon-button grid text-rose-600"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          t("هل تريد حذف {{name}} من المخزون؟", {
                            name: item.medicineName,
                          }),
                        )
                      ) {
                        remove.mutate(item.inventoryItemId);
                      }
                    }}
                    aria-label={t("حذف")}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editor && (
        <InventoryDialog
          item={editor.inventoryItemId ? editor : null}
          pending={save.isPending}
          onClose={() => setEditor(null)}
          onSave={(payload) => save.mutate(payload)}
        />
      )}
    </div>
  );
}