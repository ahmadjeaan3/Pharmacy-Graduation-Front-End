import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import readXlsxFile from "read-excel-file";
import {
  AlertTriangle,
  BrainCircuit,
  CalendarClock,
  CalendarX2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  FilePlus2,
  PackagePlus,
  PackageCheck,
  PackageX,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ScanBarcode,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  addInventoryMedicine,
  addInventoryBatch,
  addManualInventoryMedicine,
  getInventory,
  pharmacyKeys,
  predictInventoryStockout,
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
import { ManualInventoryDialog } from "../components/ManualInventoryDialog";

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

function getUniqueCatalogMedicines(items = []) {
  const seen = new Set();

  return items.filter((medicine) => {
    const identity = [
      medicine.name,
      medicine.scientificName,
      medicine.manufacturer,
      medicine.dosageForm,
      medicine.capacity,
      medicine.barcode,
    ]
      .map((value) =>
        String(value || "")
          .trim()
          .toLocaleLowerCase(),
      )
      .join("|");

    if (seen.has(identity)) {
      return false;
    }

    seen.add(identity);
    return true;
  });
}

function StockPredictionDialog({ item, onClose }) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();
  const [form, setForm] = useState({
    quantitySold: 0,
    avgDailyConsumption: 1,
    last7DaysSales: 0,
    last30DaysSales: 0,
  });
  const prediction = useMutation({
    mutationFn: () =>
      predictInventoryStockout({
        stockQuantity: item.quantity,
        quantitySold: Number(form.quantitySold),
        avgDailyConsumption: Number(form.avgDailyConsumption),
        last7DaysSales: Number(form.last7DaysSales),
        last30DaysSales: Number(form.last30DaysSales),
        month: new Date().getMonth() + 1,
      }),
  });
  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const risk = {
    Critical: [t("حرج"), "bg-rose-50 text-rose-700 border-rose-100"],
    High: [t("مرتفع"), "bg-orange-50 text-orange-700 border-orange-100"],
    Medium: [t("متوسط"), "bg-amber-50 text-amber-700 border-amber-100"],
    Low: [t("منخفض"), "bg-emerald-50 text-emerald-700 border-emerald-100"],
  }[prediction.data?.riskLevel];

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm">
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        lang={language}
        className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-[1.75rem] bg-white p-4 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#216474]">
              {t("تحليل المخزون الذكي")}
            </p>
            <h3 className="mt-1 text-xl font-black">{item.medicineName}</h3>
            <p className="mt-1 text-xs text-[#829499]">
              {t("الكمية الحالية")}: {formatNumber(item.quantity, language)}
            </p>
          </div>
          <button
            className="icon-button grid"
            onClick={onClose}
            aria-label={t("إغلاق")}
          >
            <X size={18} />
          </button>
        </div>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            prediction.mutate();
          }}
        >
          <PredictionField
            label={t("المباع إجمالًا")}
            value={form.quantitySold}
            onChange={change("quantitySold")}
          />
          <PredictionField
            label={t("متوسط الاستهلاك اليومي")}
            value={form.avgDailyConsumption}
            onChange={change("avgDailyConsumption")}
            step="0.1"
          />
          <PredictionField
            label={t("مبيعات آخر 7 أيام")}
            value={form.last7DaysSales}
            onChange={change("last7DaysSales")}
          />
          <PredictionField
            label={t("مبيعات آخر 30 يومًا")}
            value={form.last30DaysSales}
            onChange={change("last30DaysSales")}
          />
          <button
            disabled={prediction.isPending}
            className="btn-primary justify-center sm:col-span-2"
          >
            <Sparkles size={17} />
            {prediction.isPending
              ? t("جاري التحليل...")
              : t("توقع موعد نفاد الدواء")}
          </button>
        </form>
        {prediction.isError && (
          <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
            {getApiErrorMessage(prediction.error)}
          </p>
        )}
        {prediction.data && (
          <div
            className={`mt-5 rounded-2xl border p-5 ${risk?.[1] || "bg-slate-50"}`}
          >
            <div className="flex items-center justify-between">
              <strong>
                {t("درجة الخطورة")}: {risk?.[0] || prediction.data.riskLevel}
              </strong>
              <Sparkles size={20} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white/70 p-3">
                <span className="block text-xs">{t("المدة المتوقعة")}</span>
                <strong className="mt-1 block text-xl">
                  {formatNumber(prediction.data.daysUntilStockout, language)}{" "}
                  {t("يوم")}
                </strong>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <span className="block text-xs">{t("كمية إعادة الطلب")}</span>
                <strong className="mt-1 block text-xl">
                  {formatNumber(
                    prediction.data.recommendedReorderQuantity,
                    language,
                  )}
                </strong>
              </div>
            </div>
          </div>
        )}
        <p className="mt-4 text-[11px] leading-5 text-[#829499]">
          {t(
            "النتيجة تقديرية وتعتمد على دقة أرقام المبيعات المدخلة، ويجب مراجعتها قبل اعتماد طلب التوريد.",
          )}
        </p>
      </div>
    </div>
  );
}

function PredictionField({ label, value, onChange, step = "1" }) {
  return (
    <label>
      <span className="form-label">{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        required
        className="form-input"
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

function InventoryDialog({ item, initialMedicine, onClose, onSave, pending }) {
  const { t, i18n } = useTranslation();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
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
      : {
          ...blank,
          medicineId: initialMedicine?.id || "",
          medicineName:
            initialMedicine?.displayName || initialMedicine?.name || "",
          unitPrice: initialMedicine?.sellingPrice || 0,
        },
  );

  const [catalogSearch, setCatalogSearch] = useState(
    initialMedicine?.barcode || "",
  );
  const [catalogPage, setCatalogPage] = useState(1);
  const [showArabicCatalog, setShowArabicCatalog] = useState(false);

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

  const catalogItems = getUniqueCatalogMedicines(catalog.data?.items);

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
              {item ? t("تعديل بيانات الدواء") : t("إضافة دواء إلى المخزون")}
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
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="form-label">
                    {t("البحث في دليل الأدوية")}
                  </span>
                  <p className="mt-1 text-xs text-[#829499]">
                    {t("الاسم الإنجليزي أساسي، ويمكنك إظهار المقابل العربي.")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArabicCatalog((value) => !value)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black transition ${
                    showArabicCatalog
                      ? "border-[#216474] bg-[#174b57] text-white"
                      : "border-[#cfe0e3] bg-white text-[#216474] hover:bg-[#eef7f6]"
                  }`}
                >
                  <Languages size={16} />
                  {showArabicCatalog
                    ? t("إخفاء الاسم العربي")
                    : t("إظهار الاسم العربي")}
                </button>
              </div>

              <label>
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
                    placeholder={t("اسم الدواء أو الاسم العلمي أو الشركة")}
                  />
                </div>
              </label>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {catalogItems.map((medicine) => (
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
                        {[
                          showArabicCatalog ? medicine.arabicName : null,
                          medicine.scientificName,
                          medicine.manufacturer,
                        ]
                          .filter(Boolean)
                          .join(" · ") || t("دواء مسجل")}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              {catalog.isLoading && (
                <p className="mt-4 rounded-xl bg-[#f7faf9] p-4 text-center text-sm font-bold text-[#71858a]">
                  {t("جاري البحث في دليل الأدوية...")}
                </p>
              )}

              {catalog.isError && (
                <div className="mt-4 rounded-xl bg-rose-50 p-4 text-center text-sm font-bold text-rose-700">
                  <p>{getApiErrorMessage(catalog.error)}</p>
                  <button
                    type="button"
                    className="btn-secondary mt-3"
                    onClick={() => catalog.refetch()}
                  >
                    {t("إعادة المحاولة")}
                  </button>
                </div>
              )}

              {!catalog.isLoading &&
                !catalog.isError &&
                !catalogItems.length && (
                  <p className="mt-4 rounded-xl bg-[#f7faf9] p-4 text-center text-sm text-[#71858a]">
                    {t("لم يتم العثور على دواء مطابق في الدليل المعتمد.")}
                  </p>
                )}

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
              <span className="form-label">{t("حد تنبيه انخفاض المخزون")}</span>
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
              <p className="text-sm font-extrabold">{t("متاح للطلبات")}</p>
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
            <button type="button" className="btn-secondary" onClick={onClose}>
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

function BarcodeLookupDialog({ onClose, onFound }) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();
  const [barcode, setBarcode] = useState("");
  const lookup = useMutation({
    mutationFn: async () => {
      const normalized = barcode.trim();
      const result = await searchMedicineCatalog({
        searchTerm: normalized,
        pageNumber: 1,
        pageSize: 10,
      });
      const medicine = result.items?.find(
        (item) =>
          String(item.barcode || "")
            .trim()
            .toLowerCase() === normalized.toLowerCase(),
      );
      if (!medicine) {
        throw new Error(t("لم يتم العثور على دواء مسجل بهذا الباركود."));
      }
      return medicine;
    },
    onSuccess: onFound,
  });

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        lang={language}
        className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-[1.75rem] bg-white p-4 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-[#EAF4F3] text-[#216474]">
              <ScanBarcode size={25} />
            </span>
            <h3 className="mt-4 text-xl font-black text-[#174B57]">
              {t("إضافة دواء بالباركود")}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#71858A]">
              {t("امسح الباركود بالقارئ أو أدخله يدويًا، ثم اضغط بحث.")}
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
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            lookup.mutate();
          }}
        >
          <label>
            <span className="form-label">{t("رقم الباركود")}</span>
            <div className="field-control">
              <span className="field-icon-shell">
                <ScanBarcode size={18} />
              </span>
              <input
                autoFocus
                required
                maxLength={64}
                inputMode="numeric"
                autoComplete="off"
                className="form-input has-field-icon font-mono"
                value={barcode}
                onChange={(event) => {
                  setBarcode(event.target.value.replace(/\s/g, ""));
                  lookup.reset();
                }}
                placeholder={t("مثال: 8691234567890")}
              />
            </div>
          </label>
          {lookup.isError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-bold text-rose-700"
            >
              {lookup.error?.message || getApiErrorMessage(lookup.error)}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t("إلغاء")}
            </button>
            <button
              className="btn-primary"
              disabled={lookup.isPending || !barcode.trim()}
            >
              <Search size={17} />{" "}
              {lookup.isPending ? t("جاري البحث...") : t("البحث وإضافة الدواء")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExcelImportDialog({ onClose, onImport, pending }) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [reading, setReading] = useState(false);

  const readFile = async (file) => {
    setReading(true);
    setErrors([]);
    setRows([]);
    try {
      const sheetRows = await readXlsxFile(file);
      const headers = (sheetRows[0] || []).map((value) =>
        String(value ?? "").trim(),
      );
      const rawRows = sheetRows
        .slice(1, 101)
        .map((row) =>
          Object.fromEntries(
            headers.map((header, index) => [header, row[index] ?? ""]),
          ),
        );
      const resolved = [];
      const rejected = [];
      for (let index = 0; index < rawRows.length; index += 1) {
        const row = rawRows[index];
        const barcode = String(
          row.Barcode || row.barcode || row["الباركود"] || "",
        ).trim();
        const quantity = Number(row.Quantity ?? row.quantity ?? row["الكمية"]);
        const unitPrice = Number(
          row.UnitPrice ?? row.unitPrice ?? row["السعر"],
        );
        if (
          !barcode ||
          !Number.isFinite(quantity) ||
          quantity < 0 ||
          !Number.isFinite(unitPrice) ||
          unitPrice < 0
        ) {
          rejected.push(
            t("الصف {{row}}: الباركود أو الكمية أو السعر غير صالح.", {
              row: index + 2,
            }),
          );
          continue;
        }
        const catalog = await searchMedicineCatalog({
          searchTerm: barcode,
          pageNumber: 1,
          pageSize: 5,
        });
        const medicine = catalog.items?.find(
          (item) => String(item.barcode || "").trim() === barcode,
        );
        if (!medicine) {
          rejected.push(
            t("الصف {{row}}: لا يوجد دواء مسجل بالباركود {{barcode}}.", {
              row: index + 2,
              barcode,
            }),
          );
          continue;
        }
        const expiry =
          row.ExpiryDate || row.expiryDate || row["تاريخ الانتهاء"];
        const expiryDateUtc = expiry ? new Date(expiry) : null;
        resolved.push({
          medicineId: medicine.id,
          medicineName: medicine.displayName || medicine.name,
          barcode,
          quantity,
          unitPrice,
          lowStockThreshold: Number(
            row.LowStockThreshold ??
              row.lowStockThreshold ??
              row["حد التنبيه"] ??
              5,
          ),
          isAvailable: quantity > 0,
          isPriceVisibleToUsers: true,
          expiryDateUtc:
            expiryDateUtc && !Number.isNaN(expiryDateUtc.valueOf())
              ? expiryDateUtc.toISOString()
              : null,
        });
      }
      const unique = [
        ...new Map(resolved.map((row) => [row.medicineId, row])).values(),
      ];
      if (unique.length !== resolved.length)
        rejected.push(
          t("تم تجاهل الباركودات المكررة والإبقاء على آخر صف لكل دواء."),
        );
      setRows(unique);
      setErrors(rejected);
    } catch {
      setErrors([
        t(
          "تعذر قراءة الملف. استخدم ملف Excel بصيغة .xlsx وبعناوين الأعمدة المطلوبة.",
        ),
      ]);
    } finally {
      setReading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        lang={language}
        className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[1.75rem] bg-white p-4 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black">
              {t("استيراد مخزون من Excel")}
            </h3>
            <p className="mt-1 text-xs text-[#829499]">
              {t("حتى 100 دواء في كل ملف")}
            </p>
          </div>
          <button
            className="icon-button grid"
            onClick={onClose}
            aria-label={t("إغلاق")}
          >
            <X size={19} />
          </button>
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-[#216474]/30 bg-[#f5faf9] p-5">
          <p className="text-sm font-black">{t("الأعمدة المطلوبة")}</p>
          <code className="mt-2 block text-xs text-[#216474]">
            Barcode | Quantity | UnitPrice | ExpiryDate | LowStockThreshold
          </code>
          <label className="btn-primary mt-4 cursor-pointer justify-center">
            <FileSpreadsheet size={18} />{" "}
            {reading ? t("جاري قراءة الملف...") : t("اختيار ملف Excel")}
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              disabled={reading || pending}
              onChange={(event) =>
                event.target.files?.[0] && readFile(event.target.files[0])
              }
            />
          </label>
        </div>
        {rows.length > 0 && (
          <div className="mt-5">
            <p className="font-black text-emerald-700">
              {t("جاهز للاستيراد")}: {formatNumber(rows.length, language)}{" "}
              {t("دواء")}
            </p>
            <div className="mt-3 max-h-48 overflow-auto rounded-xl border">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.medicineId} className="border-b last:border-0">
                      <td className="p-3 font-bold">{row.medicineName}</td>
                      <td className="p-3">{row.barcode}</td>
                      <td className="p-3">{row.quantity}</td>
                      <td className="p-3">{row.unitPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {errors.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs font-bold text-amber-800">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>
            {t("إلغاء")}
          </button>
          <button
            className="btn-primary"
            disabled={!rows.length || pending || reading}
            onClick={() =>
              onImport(
                rows.map((row) => ({
                  medicineId: row.medicineId,
                  quantity: row.quantity,
                  unitPrice: row.unitPrice,
                  lowStockThreshold: row.lowStockThreshold,
                  isAvailable: row.isAvailable,
                  isPriceVisibleToUsers: row.isPriceVisibleToUsers,
                  expiryDateUtc: row.expiryDateUtc,
                })),
              )
            }
          >
            <FileSpreadsheet size={17} />
            {pending
              ? t("جاري الاستيراد...")
              : t("استيراد {{count}} دواء", { count: rows.length })}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PharmacyInventoryPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
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
  const [showBarcodeLookup, setShowBarcodeLookup] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const showArabicNames = isArabic;
  const [predictionItem, setPredictionItem] = useState(null);
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

  const importBatch = useMutation({
    mutationFn: addInventoryBatch,
    onSuccess: async (items) => {
      setShowExcelImport(false);
      setNotice({
        ok: true,
        text: t("تم استيراد {{count}} دواء إلى المخزون بنجاح.", {
          count: items.length,
        }),
      });
      await invalidate();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });

  const manualAdd = useMutation({
    mutationFn: addManualInventoryMedicine,
    onSuccess: async () => {
      setShowManualAdd(false);
      setNotice({
        ok: true,
        text: t("تم إنشاء الدواء وإضافته إلى المخزون بنجاح."),
      });
      await invalidate();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });

  const inventoryItems = inventory.data || [];
  const overview = {
    total: inventoryItems.length,
    inStock: inventoryItems.filter((item) => item.stockStatus === "InStock")
      .length,
    lowStock: inventoryItems.filter((item) => item.stockStatus === "LowStock")
      .length,
    outOfStock: inventoryItems.filter(
      (item) => item.stockStatus === "OutOfStock",
    ).length,
    expired: inventoryItems.filter((item) => item.stockStatus === "Expired")
      .length,
  };

  return (
    <div dir={direction} lang={currentLanguage} className="space-y-0">
      {/* Header */}
      <section className="relative isolate mb-5 overflow-hidden rounded-[1.75rem] bg-[#174b57] text-white shadow-[0_22px_55px_rgba(23,75,87,.16)]">
        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-[center_42%] ${
            isArabic ? "scale-x-[-1]" : ""
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isArabic
              ? "linear-gradient(270deg, #10505A 0%, rgba(16,80,90,.88) 34%, rgba(33,100,116,.42) 68%, rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg, #10505A 0%, rgba(16,80,90,.88) 34%, rgba(33,100,116,.42) 68%, rgba(33,100,116,.08) 100%)",
          }}
        />
        <div className="noise absolute inset-0 opacity-25" />

        <div className="relative z-10 p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div
              className={`flex min-w-0 items-start gap-3 ${isArabic ? "text-right" : "text-left"}`}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white backdrop-blur-sm">
                <PackagePlus size={23} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-xs font-black text-[#8bd0cb]">
                  {t("مساحة الصيدلية")}
                </p>
                <h1 className="mt-1 text-2xl font-black text-white sm:text-[30px]">
                  {t("مخزون الأدوية")}
                </h1>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-white/65 sm:text-sm">
                  {t(
                    "راجع التوفر والأسعار والانتهاء، وأضف الأصناف بالطريقة الأنسب لعمل الصيدلية.",
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => inventory.refetch()}
                disabled={inventory.isFetching}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={inventory.isFetching ? "animate-spin" : ""}
                />
                {t("تحديث")}
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <button
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-[#174b57] shadow-[0_12px_30px_rgba(7,31,37,.16)] transition hover:-translate-y-0.5 hover:bg-[#f8fbfb]"
              onClick={() => setEditor({})}
            >
              <Plus size={20} strokeWidth={2.3} />
              {t("إضافة من دليل الأدوية")}
            </button>
            <button
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[.08] px-4 text-sm font-black text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
              onClick={() => setShowBarcodeLookup(true)}
            >
              <ScanBarcode size={19} />
              {t("إضافة بالباركود")}
            </button>
            <button
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[.08] px-4 text-sm font-black text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
              onClick={() => setShowManualAdd(true)}
            >
              <FilePlus2 size={19} />
              {t("إضافة دواء يدويًا")}
            </button>
            <button
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[.08] px-4 text-sm font-black text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
              onClick={() => setShowExcelImport(true)}
            >
              <FileSpreadsheet size={19} />
              {t("استيراد ملف Excel")}
            </button>
          </div>
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

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <InventoryOverviewCard
          icon={PackagePlus}
          label={t("إجمالي الأصناف")}
          value={overview.total}
          tone="teal"
          language={currentLanguage}
        />
        <InventoryOverviewCard
          icon={PackageCheck}
          label={t("متوفر")}
          value={overview.inStock}
          tone="green"
          language={currentLanguage}
        />
        <InventoryOverviewCard
          icon={AlertTriangle}
          label={t("مخزون منخفض")}
          value={overview.lowStock}
          tone="gold"
          language={currentLanguage}
        />
        <InventoryOverviewCard
          icon={PackageX}
          label={t("نافد")}
          value={overview.outOfStock}
          tone="rose"
          language={currentLanguage}
        />
        <InventoryOverviewCard
          icon={CalendarX2}
          label={t("منتهي الصلاحية")}
          value={overview.expired}
          tone="slate"
          language={currentLanguage}
        />
      </section>

      {/* Filters */}
      <section className="mb-5 rounded-[1.35rem] border border-[#dce8ea] bg-white p-4 shadow-[0_10px_30px_rgba(23,75,87,.04)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_210px_auto]">
          <div className="relative">
            <Search
              size={18}
              className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[#216474] ${
                isArabic ? "right-4" : "left-4"
              }`}
            />
            <input
              dir={direction}
              type="text"
              className={`h-12 w-full rounded-xl border border-[#dce8ea] bg-[#f9fbfb] text-sm font-medium text-[#29464d] placeholder:text-[#9aabad] outline-none transition focus:border-[#216474] focus:bg-white focus:ring-4 focus:ring-[#216474]/8 ${
                isArabic ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
              }`}
              value={filters.searchTerm}
              onChange={(event) =>
                setFilters((old) => ({
                  ...old,
                  searchTerm: event.target.value,
                }))
              }
              placeholder={t(
                "ابحث بالاسم الإنجليزي أو العربي أو العلمي أو الباركود",
              )}
            />
          </div>

          <div className="relative">
            <select
              dir={direction}
              className={`h-12 w-full appearance-none rounded-xl border border-[#dce8ea] bg-[#f9fbfb] text-sm font-bold text-[#60777d] outline-none transition focus:border-[#216474] focus:bg-white ${
                isArabic ? "pr-4 pl-10 text-right" : "pl-4 pr-10 text-left"
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
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#829499] ${isArabic ? "left-3" : "right-3"}`}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setFilters({
                searchTerm: "",
                availableOnly: false,
                stockStatus: "",
                expiringWithinDays: "",
              })
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce8ea] bg-white px-4 text-xs font-black text-[#60777d] transition hover:border-[#afc9cd] hover:bg-[#f8fbfb] hover:text-[#216474]"
          >
            <X size={16} />
            {t("مسح الفلاتر")}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#174b57]/8 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              ["", t("الكل")],
              ["InStock", t("متوفر")],
              ["LowStock", t("مخزون منخفض")],
              ["OutOfStock", t("نافد")],
              ["Expired", t("منتهي الصلاحية")],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value || "all"}
                onClick={() =>
                  setFilters((old) => ({ ...old, stockStatus: value }))
                }
                className={`min-h-10 shrink-0 rounded-xl border px-4 text-xs font-black transition ${
                  filters.stockStatus === value
                    ? "border-[#174b57] bg-[#174b57] text-white shadow-sm"
                    : "border-[#dce8ea] bg-white text-[#60777d] hover:bg-[#eef7f6] hover:text-[#216474]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl bg-[#f5f9f8] px-4 text-xs font-black text-[#47666d] lg:justify-center">
            <span>{t("إظهار الأصناف المتاحة للطلبات فقط")}</span>
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
          </label>
        </div>
      </section>

      {inventory.isLoading ? (
        <PharmacyLoadingState label={t("جاري قراءة المخزون...")} />
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
                className="group relative overflow-hidden rounded-[1.5rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_8px_26px_rgba(23,75,87,.04)] transition duration-300 hover:-translate-y-1 hover:border-[#B9D2D6] hover:shadow-[0_18px_42px_rgba(23,75,87,.09)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid size-12 place-items-center rounded-2xl border border-[#DCE8EA] bg-[#F2F8F8] text-[#216474]"
                  >
                    <Pill size={22} />
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${meta.className}`}
                  >
                    {t(meta.label)}
                  </span>
                </div>

                <h3
                  className="mt-4 truncate text-lg font-black text-[#29464d]"
                  dir="ltr"
                >
                  {item.medicineName}
                </h3>

                {showArabicNames && item.arabicMedicineName && (
                  <p
                    className="mt-1 truncate text-sm font-bold text-[#216474]"
                    dir="rtl"
                  >
                    {item.arabicMedicineName}
                  </p>
                )}

                <p
                  className={`mt-1 truncate text-xs text-[#829499] ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                  dir={
                    showArabicNames && item.arabicScientificName ? "rtl" : "ltr"
                  }
                >
                  {(showArabicNames && item.arabicScientificName) ||
                    item.scientificName ||
                    item.manufacturer ||
                    t("لا توجد تفاصيل إضافية")}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.manufacturer && (
                    <MedicineIdentityChip label={item.manufacturer} />
                  )}
                  {item.dosageForm && (
                    <MedicineIdentityChip label={item.dosageForm} />
                  )}
                  {item.capacity && (
                    <MedicineIdentityChip label={item.capacity} />
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-3.5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    <p className="text-[11px] text-[#829499]">{t("الكمية")}</p>
                    <strong className="mt-1 block text-lg">
                      {formatNumber(item.quantity, currentLanguage)}
                    </strong>
                  </div>

                  <div
                    className={`rounded-2xl border border-[#E6EEF0] bg-[#FAFCFC] p-3.5 ${
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
                      ? formatDate(item.expiryDateUtc, false, currentLanguage)
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

                {item.stockStatus === "Expired" && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
                    <CalendarX2 size={15} />
                    {t(
                      "هذا الصنف منتهي الصلاحية وغير متاح للطلبات حتى تحديث بياناته.",
                    )}
                  </p>
                )}

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
                  {item.stockStatus !== "Expired" && (
                    <button
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#cfe4e7] bg-[#eef7f6] px-4 text-xs font-black text-[#216474] transition hover:-translate-y-0.5 hover:border-[#a9cdd1] hover:bg-[#e4f1f0]"
                      onClick={() => setPredictionItem(item)}
                      aria-label={t("تحليل مخزون {{name}}", {
                        name: item.medicineName,
                      })}
                    >
                      <BrainCircuit size={16} />
                      {t("توقع النفاد")}
                    </button>
                  )}
                  <button
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#CFE4E7] bg-[#EAF4F3] text-[#216474] transition hover:-translate-y-0.5 hover:bg-[#DCEFED]"
                    onClick={() => setEditor(item)}
                    aria-label={t("تعديل الصنف")}
                    title={t("تعديل الصنف")}
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
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
          initialMedicine={editor.initialMedicine}
          pending={save.isPending}
          onClose={() => setEditor(null)}
          onSave={(payload) => save.mutate(payload)}
        />
      )}
      {showBarcodeLookup && (
        <BarcodeLookupDialog
          onClose={() => setShowBarcodeLookup(false)}
          onFound={(medicine) => {
            setShowBarcodeLookup(false);
            setEditor({ initialMedicine: medicine });
          }}
        />
      )}
      {showExcelImport && (
        <ExcelImportDialog
          pending={importBatch.isPending}
          onClose={() => setShowExcelImport(false)}
          onImport={(items) => importBatch.mutate(items)}
        />
      )}

      {showManualAdd && (
        <ManualInventoryDialog
          pending={manualAdd.isPending}
          onClose={() => setShowManualAdd(false)}
          onSave={(payload) => manualAdd.mutate(payload)}
        />
      )}
      {predictionItem && (
        <StockPredictionDialog
          item={predictionItem}
          onClose={() => setPredictionItem(null)}
        />
      )}
    </div>
  );
}

function InventoryOverviewCard({ icon: Icon, label, value, tone, language }) {
  const tones = {
    teal: "bg-[#eaf4f3] text-[#216474]",
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-[#fff7df] text-[#b58112]",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <article className="flex min-h-[104px] items-center gap-3 rounded-[1.25rem] border border-[#dce8ea] bg-white p-4 shadow-[0_8px_24px_rgba(23,75,87,.035)] sm:p-5">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <strong className="block text-xl font-black text-[#29464d] sm:text-2xl">
          {formatNumber(value, language)}
        </strong>
        <span className="mt-1 block truncate text-[11px] font-bold text-[#71858a] sm:text-xs">
          {label}
        </span>
      </div>
    </article>
  );
}

function MedicineIdentityChip({ label }) {
  return (
    <span className="max-w-full truncate rounded-lg border border-[#e1ebed] bg-[#f8fbfb] px-2.5 py-1 text-[10px] font-bold text-[#60777d]">
      {label}
    </span>
  );
}