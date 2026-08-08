import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import readXlsxFile from "read-excel-file";
import {
  AlertTriangle,
  BrainCircuit,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileSpreadsheet,
  PackagePlus,
  Pill,
  Plus,
  Search,
  ScanBarcode,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { MedicineAlternativesButton } from "../../intelligence/components/MedicineAlternativesButton";
import {
  addInventoryMedicine,
  addInventoryBatch,
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

function StockPredictionDialog({ item, onClose }) {
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
    Critical: ["حرج", "bg-rose-50 text-rose-700 border-rose-100"],
    High: ["مرتفع", "bg-orange-50 text-orange-700 border-orange-100"],
    Medium: ["متوسط", "bg-amber-50 text-amber-700 border-amber-100"],
    Low: ["منخفض", "bg-emerald-50 text-emerald-700 border-emerald-100"],
  }[prediction.data?.riskLevel];

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[1.75rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#216474]">
              تحليل المخزون الذكي
            </p>
            <h3 className="mt-1 text-xl font-black">{item.medicineName}</h3>
            <p className="mt-1 text-xs text-[#829499]">
              الكمية الحالية: {formatNumber(item.quantity)}
            </p>
          </div>
          <button
            className="icon-button grid"
            onClick={onClose}
            aria-label="إغلاق"
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
            label="المباع إجمالًا"
            value={form.quantitySold}
            onChange={change("quantitySold")}
          />
          <PredictionField
            label="متوسط الاستهلاك اليومي"
            value={form.avgDailyConsumption}
            onChange={change("avgDailyConsumption")}
            step="0.1"
          />
          <PredictionField
            label="مبيعات آخر 7 أيام"
            value={form.last7DaysSales}
            onChange={change("last7DaysSales")}
          />
          <PredictionField
            label="مبيعات آخر 30 يومًا"
            value={form.last30DaysSales}
            onChange={change("last30DaysSales")}
          />
          <button
            disabled={prediction.isPending}
            className="btn-primary justify-center sm:col-span-2"
          >
            <Sparkles size={17} />
            {prediction.isPending ? "جاري التحليل..." : "توقع موعد نفاد الدواء"}
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
                درجة الخطورة: {risk?.[0] || prediction.data.riskLevel}
              </strong>
              <Sparkles size={20} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white/70 p-3">
                <span className="block text-xs">المدة المتوقعة</span>
                <strong className="mt-1 block text-xl">
                  {prediction.data.daysUntilStockout} يوم
                </strong>
              </div>
              <div className="rounded-xl bg-white/70 p-3">
                <span className="block text-xs">كمية إعادة الطلب</span>
                <strong className="mt-1 block text-xl">
                  {prediction.data.recommendedReorderQuantity}
                </strong>
              </div>
            </div>
          </div>
        )}
        <p className="mt-4 text-[11px] leading-5 text-[#829499]">
          النتيجة تقديرية وتعتمد على دقة أرقام المبيعات المدخلة، ويجب مراجعتها
          قبل اعتماد طلب التوريد.
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
              <label>
                <span className="form-label">{t("البحث في دليل الأدوية")}</span>

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
  const { t } = useTranslation();
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
          String(item.barcode || "").toLowerCase() === normalized.toLowerCase(),
      );
      if (!medicine) {
        throw new Error("لم يتم العثور على دواء مسجل بهذا الباركود.");
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
        dir="rtl"
        className="w-full max-w-lg rounded-[1.75rem] bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-[#EAF4F3] text-[#216474]">
              <ScanBarcode size={25} />
            </span>
            <h3 className="mt-4 text-xl font-black text-[#174B57]">
              إضافة دواء بالباركود
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#71858A]">
              امسح الباركود بالقارئ أو أدخله يدويًا، ثم اضغط بحث.
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
            <span className="form-label">رقم الباركود</span>
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
                placeholder="مثال: 8691234567890"
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
              إلغاء
            </button>
            <button
              className="btn-primary"
              disabled={lookup.isPending || !barcode.trim()}
            >
              <Search size={17} />{" "}
              {lookup.isPending ? "جاري البحث..." : "البحث وإضافة الدواء"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExcelImportDialog({ onClose, onImport, pending }) {
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
            `الصف ${index + 2}: الباركود أو الكمية أو السعر غير صالح.`,
          );
          continue;
        }
        const catalog = await searchMedicineCatalog({
          searchTerm: barcode,
          pageNumber: 1,
          pageSize: 5,
        });
        const medicine = catalog.items?.find(
          (item) => item.barcode === barcode,
        );
        if (!medicine) {
          rejected.push(
            `الصف ${index + 2}: لا يوجد دواء مسجل بالباركود ${barcode}.`,
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
          "تم تجاهل الباركودات المكررة والإبقاء على آخر صف لكل دواء.",
        );
      setRows(unique);
      setErrors(rejected);
    } catch {
      setErrors([
        "تعذر قراءة الملف. استخدم ملف Excel بصيغة .xlsx أو .xls وبعناوين الأعمدة المطلوبة.",
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
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[1.75rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black">استيراد مخزون من Excel</h3>
            <p className="mt-1 text-xs text-[#829499]">
              حتى 100 دواء في كل ملف
            </p>
          </div>
          <button
            className="icon-button grid"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={19} />
          </button>
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-[#216474]/30 bg-[#f5faf9] p-5">
          <p className="text-sm font-black">الأعمدة المطلوبة</p>
          <code className="mt-2 block text-xs text-[#216474]">
            Barcode | Quantity | UnitPrice | ExpiryDate | LowStockThreshold
          </code>
          <label className="btn-primary mt-4 cursor-pointer justify-center">
            <FileSpreadsheet size={18} />{" "}
            {reading ? "جاري قراءة الملف..." : "اختيار ملف Excel"}
            <input
              type="file"
              accept=".xlsx,.xls"
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
              جاهز للاستيراد: {rows.length} دواء
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
            إلغاء
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
            {pending ? "جاري الاستيراد..." : `استيراد ${rows.length} دواء`}
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

  return (
    <div dir={direction} lang={currentLanguage} className="space-y-0">
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
          <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
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

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex h-[58px] shrink-0 items-center justify-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-6 text-[15px] font-black text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={() => setShowBarcodeLookup(true)}
            >
              <ScanBarcode size={21} />
              {t("إضافة بالباركود")}
            </button>
            <button
              className="inline-flex h-[58px] shrink-0 items-center justify-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-6 text-[15px] font-black text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={() => setShowExcelImport(true)}
            >
              <FileSpreadsheet size={20} />
              {t("استيراد Excel")}
            </button>
            <button
              className="inline-flex h-[58px] min-w-[185px] shrink-0 items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white px-8 text-[15px] font-black text-[#216474] shadow-[0_12px_30px_rgba(7,31,37,.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FBFB]"
              onClick={() => setEditor({})}
            >
              <Plus size={21} strokeWidth={2.3} />
              {t("إضافة دواء")}
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
              isArabic ? "pr-14 pl-4 text-right" : "pl-14 pr-4 text-left"
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
              isArabic ? "pr-4 pl-10 text-right" : "pl-4 pr-10 text-left"
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
                    <p className="text-[11px] text-[#829499]">{t("الكمية")}</p>
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
                  <MedicineAlternativesButton
                    medicineName={item.medicineName}
                    label={t("عرض البدائل")}
                    className="inline-flex min-h-10 basis-[calc(50%-0.25rem)] items-center justify-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-100"
                  />
                  <button
                    className="inline-flex min-h-10 basis-[calc(50%-0.25rem)] items-center justify-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 text-xs font-black text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                    onClick={() => setPredictionItem(item)}
                    aria-label={t("تحليل مخزون {{name}}", {
                      name: item.medicineName,
                    })}
                  >
                    <BrainCircuit size={16} />
                    {t("توقع النفاد")}
                  </button>
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
      {predictionItem && (
        <StockPredictionDialog
          item={predictionItem}
          onClose={() => setPredictionItem(null)}
        />
      )}
    </div>
  );
}
