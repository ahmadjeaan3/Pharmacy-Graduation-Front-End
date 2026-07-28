import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarClock,
  Check,
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
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  addInventoryMedicine,
  getInventory,
  pharmacyKeys,
  removeInventoryMedicine,
  searchMedicineCatalog,
  updateInventoryMedicine,
} from "../api/pharmacyApi";
import { PharmacyPageHeader } from "../components/PharmacyPageHeader";
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
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[1.75rem] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#174b57]/8 bg-white/95 p-5 backdrop-blur">
          <div>
            <h3 className="text-xl font-black">
              {item ? "تعديل بيانات الدواء" : "إضافة دواء إلى المخزون"}
            </h3>
            <p className="mt-1 text-xs text-[#829499]">
              {item ? item.medicineName : "اختر الدواء أولًا من الدليل المعتمد"}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
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
                <span className="form-label">البحث في دليل الأدوية</span>
                <div className="field-control">
                  <span className="field-icon-shell">
                    <Search size={17} />
                  </span>
                  <input
                    className="form-input has-field-icon"
                    value={catalogSearch}
                    onChange={(e) => {
                      setCatalogSearch(e.target.value);
                      setCatalogPage(1);
                    }}
                    placeholder="اسم الدواء أو الاسم العلمي أو الشركة"
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
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-start transition ${form.medicineId === medicine.id ? "border-[#216474] bg-[#eef7f6]" : "border-[#174b57]/9 hover:border-[#216474]/35"}`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl ${form.medicineId === medicine.id ? "bg-[#216474] text-white" : "bg-[#edf5f4] text-[#216474]"}`}
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
                          "دواء مسجل"}
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
                    onClick={() => setCatalogPage((p) => p - 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                  <span className="text-xs font-bold text-[#71858a]">
                    {catalogPage} من {catalog.data.totalPages}
                  </span>
                  <button
                    type="button"
                    className="icon-button grid"
                    disabled={catalogPage >= catalog.data.totalPages}
                    onClick={() => setCatalogPage((p) => p + 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                </div>
              )}
            </div>
          )}
          <div
            className={`${item ? "" : "mt-7 border-t border-[#174b57]/8 pt-6"} grid gap-5 md:grid-cols-2`}
          >
            <label>
              <span className="form-label">الكمية</span>
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
              <span className="form-label">سعر البيع</span>
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
              <span className="form-label">حد تنبيه انخفاض المخزون</span>
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
              <span className="form-label">تاريخ الانتهاء</span>
              <input
                type="date"
                className="form-input"
                value={form.expiryDateUtc}
                onChange={change("expiryDateUtc")}
              />
            </label>
          </div>
          <label className="mt-5 flex items-center justify-between rounded-2xl bg-[#f7faf9] p-4">
            <div>
              <p className="text-sm font-extrabold">متاح للطلبات</p>
              <p className="mt-1 text-xs text-[#829499]">
                يتوقف تلقائيًا عندما تصبح الكمية صفرًا
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
            <div>
              <p className="text-sm font-extrabold">إظهار السعر للمستخدمين</p>
              <p className="mt-1 text-xs text-[#829499]">
                عند إخفائه سيظهر للمستخدم أن السعر متاح عند التواصل مع الصيدلية.
              </p>
            </div>
            <input
              className="size-5 accent-[#216474]"
              type="checkbox"
              checked={form.isPriceVisibleToUsers}
              onChange={change("isPriceVisibleToUsers")}
            />
          </label>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button
              disabled={pending || !form.medicineId}
              className="btn-primary"
            >
              <PackagePlus size={17} />
              {pending
                ? "جاري الحفظ..."
                : item
                  ? "حفظ التعديل"
                  : "إضافة للمخزون"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PharmacyInventoryPage() {
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
      client.invalidateQueries({ queryKey: ["pharmacy", "inventory"] }),
      client.invalidateQueries({ queryKey: pharmacyKeys.dashboard }),
    ]);
  };
  const save = useMutation({
    mutationFn: (payload) =>
      editor?.inventoryItemId
        ? updateInventoryMedicine(editor.inventoryItemId, payload)
        : addInventoryMedicine(payload),
    onSuccess: async () => {
      setEditor(null);
      setNotice({ ok: true, text: "تم تحديث المخزون بنجاح." });
      await invalidate();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const remove = useMutation({
    mutationFn: removeInventoryMedicine,
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم حذف الدواء من مخزون الصيدلية." });
      await invalidate();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  return (
    <div>
      <PharmacyPageHeader
        eyebrow="تشغيل الصيدلية"
        title="إدارة المخزون"
        description="أضف الأدوية من الدليل المعتمد وحدث الكميات والأسعار وتواريخ الانتهاء من مكان واحد."
        actions={
          <button className="btn-primary" onClick={() => setEditor({})}>
            <Plus size={17} />
            إضافة دواء
          </button>
        }
      />
      {notice && (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <section className="surface mb-5 grid gap-3 p-4 lg:grid-cols-[1fr_190px_190px_auto]">
        <div className="field-control">
          <span className="field-icon-shell">
            <Search size={17} />
          </span>
          <input
            className="form-input has-field-icon"
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((f) => ({ ...f, searchTerm: e.target.value }))
            }
            placeholder="ابحث في مخزون الصيدلية"
          />
        </div>
        <select
          className="form-input"
          value={filters.stockStatus}
          onChange={(e) =>
            setFilters((f) => ({ ...f, stockStatus: e.target.value }))
          }
        >
          <option value="">كل حالات المخزون</option>
          <option value="InStock">متوفر</option>
          <option value="LowStock">مخزون منخفض</option>
          <option value="OutOfStock">غير متوفر</option>
        </select>
        <select
          className="form-input"
          value={filters.expiringWithinDays}
          onChange={(e) =>
            setFilters((f) => ({ ...f, expiringWithinDays: e.target.value }))
          }
        >
          <option value="">كل تواريخ الانتهاء</option>
          <option value="30">ينتهي خلال 30 يومًا</option>
          <option value="90">ينتهي خلال 3 أشهر</option>
          <option value="180">ينتهي خلال 6 أشهر</option>
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap rounded-xl px-2 text-sm font-bold">
          <input
            type="checkbox"
            className="size-4 accent-[#216474]"
            checked={filters.availableOnly}
            onChange={(e) =>
              setFilters((f) => ({ ...f, availableOnly: e.target.checked }))
            }
          />
          المتاح فقط
        </label>
      </section>
      {inventory.isLoading ? (
        <PharmacyLoadingState label="جاري قراءة المخزون..." />
      ) : inventory.isError ? (
        <PharmacyErrorState
          message={getApiErrorMessage(inventory.error)}
          onRetry={inventory.refetch}
        />
      ) : !inventory.data?.length ? (
        <PharmacyEmptyState
          title="لا توجد أدوية مطابقة"
          description="أضف أول دواء من الدليل أو غيّر خيارات البحث الحالية."
          action={
            <button
              onClick={() => setEditor({})}
              className="btn-primary mx-auto mt-5"
            >
              <Plus size={16} />
              إضافة دواء
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {inventory.data.map((item) => {
            const meta = stockMeta(item.stockStatus);
            return (
              <article key={item.inventoryItemId} className="surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                    <Pill size={21} />
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${meta.className}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <h3 className="mt-4 truncate text-lg font-black">
                  {item.medicineName}
                </h3>
                <p className="mt-1 truncate text-xs text-[#829499]">
                  {item.scientificName ||
                    item.manufacturer ||
                    "لا توجد تفاصيل إضافية"}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#f7faf9] p-3">
                    <p className="text-[11px] text-[#829499]">الكمية</p>
                    <strong className="mt-1 block text-lg">
                      {formatNumber(item.quantity)}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-[#f7faf9] p-3">
                    <p className="text-[11px] text-[#829499]">سعر البيع</p>
                    <strong className="mt-1 block text-sm">
                      {formatCurrency(item.sellingPrice)}
                    </strong>
                    <span
                      className={`mt-1 block text-[10px] font-bold ${item.isPriceVisibleToUsers ? "text-emerald-600" : "text-amber-700"}`}
                    >
                      {item.isPriceVisibleToUsers
                        ? "ظاهر للمستخدمين"
                        : "مخفي عن المستخدمين"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-[#71858a]">
                  <CalendarClock size={15} />
                  <span>الانتهاء: {formatDate(item.expiryDateUtc)}</span>
                  {item.daysUntilExpiry !== null &&
                    item.daysUntilExpiry <= 30 && (
                      <AlertTriangle
                        size={15}
                        className="ms-auto text-rose-500"
                      />
                    )}
                </div>
                {item.requiresPrescription && (
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    يصرف بوصفة طبية
                  </p>
                )}
                <div className="mt-5 flex gap-2 border-t border-[#174b57]/8 pt-4">
                  <button
                    className="btn-secondary flex-1 justify-center"
                    onClick={() => setEditor(item)}
                  >
                    <Edit3 size={15} />
                    تعديل
                  </button>
                  <button
                    className="icon-button grid text-rose-600"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          `هل تريد حذف ${item.medicineName} من المخزون؟`,
                        )
                      )
                        remove.mutate(item.inventoryItemId);
                    }}
                    aria-label="حذف"
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
