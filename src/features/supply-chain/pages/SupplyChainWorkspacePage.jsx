import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  MapPin,
  Minus,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  Power,
  ReceiptText,
  Route,
  ScanLine,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  UserRoundCheck,
  WalletCards,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { getPrimaryRole } from "../../../shared/config/roles";
import { MedicineAlternativesButton } from "../../intelligence/components/MedicineAlternativesButton";
import { useAuth } from "../../auth/hooks/useAuth";
import { getMedicines } from "../../medicines/api/medicinesApi";
import {
  addBatch,
  assignShipment,
  confirmShipment,
  createRepresentative,
  createSupplyOrder,
  getBatches,
  getMarketplace,
  getRepresentatives,
  getRestockSuggestions,
  getSupplyDashboard,
  getSupplyOrders,
  getSupplyInvoices,
  getWarehouseCatalog,
  supplyKeys,
  updateShipment,
  updateSupplyOrder,
  updateRepresentative,
  updateSupplyInvoice,
  recordSupplyPayment,
} from "../api/supplyChainApi";

const labels = {
  Submitted: "طلب جديد",
  Accepted: "مقبول",
  Preparing: "قيد التجهيز",
  ReadyForDispatch: "جاهز للإرسال",
  OutForDelivery: "في الطريق",
  Delivered: "تم التسليم",
  Rejected: "مرفوض",
  Cancelled: "ملغي",
  Assigned: "مسند للمندوب",
  Loading: "جاري التحميل",
  Arrived: "وصل للصيدلية",
  Failed: "تعذر التسليم",
  Returned: "أعيدت للمستودع",
};
const money = (v) => `${Number(v || 0).toLocaleString("ar-SY")} ل.س`;
const tone = (s) =>
  s === "Delivered"
    ? "bg-emerald-50 text-emerald-700"
    : ["Rejected", "Cancelled"].includes(s)
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

function Stat({ icon: Icon, label, value, hint, className }) {
  return (
    <article className="surface p-5">
      <span
        className={`grid size-12 place-items-center rounded-2xl ${className}`}
      >
        <Icon size={22} />
      </span>
      <strong className="mt-5 block text-3xl font-black">
        {Number(value || 0).toLocaleString("ar-SY")}
      </strong>
      <p className="mt-1 font-extrabold">{label}</p>
      <p className="mt-1 text-xs text-[#829499]">{hint}</p>
    </article>
  );
}
function OrderCard({
  order,
  role,
  act,
  busy,
  representatives = [],
  onDetails,
}) {
  const next =
    role === "Warehouse"
      ? {
          Submitted: "Accepted",
          Accepted: "Preparing",
          Preparing: "ReadyForDispatch",
        }[order.status]
      : role === "Representative"
        ? {
            Assigned: "Loading",
            Loading: "OutForDelivery",
            OutForDelivery: "Arrived",
          }[order.shipment?.status]
        : null;
  const visibleStatus =
    order.shipment?.status === "Arrived" ? "Arrived" : order.status;
  return (
    <article className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_12px_35px_rgba(18,63,73,.07)]">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-black text-[#287184]">
            {order.orderCode}
          </p>
          <h3 className="mt-2 text-lg font-black">
            {role === "Pharmacy" ? order.warehouseName : order.pharmacyName}
          </h3>
          <p className="mt-1 text-xs text-[#829499]">
            {new Date(order.createdAtUtc).toLocaleString("ar-SY")}
          </p>
        </div>
        <span
          className={`h-fit rounded-full px-3 py-1.5 text-xs font-black ${tone(visibleStatus)}`}
        >
          {labels[visibleStatus] || visibleStatus}
        </span>
      </div>
      <div className="my-4 grid gap-2 sm:grid-cols-2">
        {order.items.map((i) => (
          <div
            key={i.id}
            className="rounded-xl bg-[#f5f9f8] px-3 py-2.5 text-sm"
          >
            <b>{i.medicineName}</b>
            <span className="float-left">× {i.approvedQuantity}</span>
            <p className="mt-1 text-[11px] text-[#8a9ba0]">
              {i.batchNumber && `دفعة ${i.batchNumber}`}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#174b57]/8 pt-4">
        <strong>{money(order.totalAmount)}</strong>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onDetails(order)} className="btn-secondary">
            <Eye size={17} />
            عرض التفاصيل
          </button>
          {next && (
            <button
              disabled={busy}
              onClick={() =>
                act(
                  role === "Warehouse" ? "order" : "shipment",
                  role === "Warehouse" ? order.id : order.shipment.id,
                  next,
                )
              }
              className="btn-primary"
            >
              <PackageCheck size={17} />
              {labels[next] || next}
            </button>
          )}
          {role === "Warehouse" &&
            order.status === "ReadyForDispatch" &&
            (!order.shipment ||
              ["Failed", "Returned"].includes(order.shipment.status)) && (
              <button
                disabled={busy || !representatives.some((r) => r.isAvailable)}
                onClick={() =>
                  act(
                    "assign",
                    order.id,
                    representatives.find((r) => r.isAvailable)?.id,
                  )
                }
                className="btn-primary"
              >
                <Truck size={17} />
                {representatives.some((r) => r.isAvailable)
                  ? "إسناد لمندوب متاح"
                  : "لا يوجد مندوب متاح"}
              </button>
            )}
        </div>
      </div>
      {role === "Pharmacy" &&
        order.shipment?.pickupQrToken &&
        order.status !== "Delivered" && (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-[#287184]/30 bg-[#f7fbfa] p-4">
            {order.shipment.status === "Arrived" ? (
              <>
                <QRCodeSVG
                  value={order.shipment.pickupQrToken}
                  size={112}
                  fgColor="#123f49"
                />
                <p className="mt-3 text-xs font-bold">
                  رمز استلام آمن — تحقق من الأدوية ثم أكد الاستلام
                </p>
                <button
                  onClick={() =>
                    act(
                      "confirm",
                      order.shipment.id,
                      order.shipment.pickupQrToken,
                    )
                  }
                  className="btn-primary mt-3"
                >
                  <ScanLine size={17} />
                  تأكيد الاستلام وإضافة الكمية للمخزون
                </button>
              </>
            ) : (
              <>
                <Truck className="text-[#287184]" />
                <p className="mt-3 text-sm font-black">
                  الشحنة قيد التجهيز أو التوصيل
                </p>
                <p className="mt-1 text-xs text-[#829499]">
                  سيظهر رمز التأكيد عند وصول المندوب إلى الصيدلية.
                </p>
              </>
            )}
          </div>
        )}
    </article>
  );
}
export function SupplyChainWorkspacePage() {
  const { user } = useAuth();
  const role = getPrimaryRole(user.roles);
  const qc = useQueryClient();
  const [tab, setTab] = useState("orders");
  const [dialog, setDialog] = useState(null);
  const [representativeToEdit, setRepresentativeToEdit] = useState(null);
  const [invoiceToManage, setInvoiceToManage] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [cart, setCart] = useState({});
  const dashboard = useQuery({
    queryKey: supplyKeys.dashboard,
    queryFn: getSupplyDashboard,
    enabled: role === "Warehouse",
  });
  const orders = useQuery({
    queryKey: [...supplyKeys.orders, user?.id || user?.email || role],
    queryFn: getSupplyOrders,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const batches = useQuery({
    queryKey: supplyKeys.batches,
    queryFn: getBatches,
    enabled: role === "Warehouse",
  });
  const reps = useQuery({
    queryKey: supplyKeys.representatives,
    queryFn: getRepresentatives,
    enabled: role === "Warehouse",
  });
  const invoices = useQuery({
    queryKey: [...supplyKeys.invoices, role],
    queryFn: () => getSupplyInvoices(),
    enabled: ["Warehouse", "Pharmacy", "Admin"].includes(role),
  });
  const marketplace = useQuery({
    queryKey: supplyKeys.marketplace,
    queryFn: getMarketplace,
    enabled: role === "Pharmacy",
  });
  const suggestions = useQuery({
    queryKey: supplyKeys.suggestions,
    queryFn: getRestockSuggestions,
    enabled: role === "Pharmacy",
  });
  const catalog = useQuery({
    queryKey: ["supply-chain", "catalog", selectedWarehouse?.id, catalogSearch],
    queryFn: () => getWarehouseCatalog(selectedWarehouse.id, catalogSearch),
    enabled: role === "Pharmacy" && !!selectedWarehouse,
  });
  const mutation = useMutation({
    mutationFn: ({ type, id, value }) =>
      type === "order"
        ? updateSupplyOrder(id, { status: value, note: "" })
        : type === "shipment"
          ? updateShipment(id, {
              status: value,
              note: "",
              latitude: null,
              longitude: null,
            })
          : type === "assign"
            ? assignShipment(id, {
                representativeProfileId: value,
                packageCount: 1,
              })
            : confirmShipment(id, {
                qrToken: value,
                proofNote: "تم التحقق والاستلام",
              }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: supplyKeys.orders });
      qc.invalidateQueries({ queryKey: supplyKeys.dashboard });
      qc.invalidateQueries({ queryKey: supplyKeys.representatives });
      qc.invalidateQueries({ queryKey: supplyKeys.invoices });
    },
  });
  const {
    isError: mutationIsError,
    error: mutationError,
    reset: resetMutation,
  } = mutation;
  useEffect(() => {
    if (!mutationIsError) return undefined;
    qc.invalidateQueries({ queryKey: supplyKeys.orders });
    qc.invalidateQueries({ queryKey: supplyKeys.representatives });
    const timer = window.setTimeout(() => resetMutation(), 8000);
    return () => window.clearTimeout(timer);
  }, [mutationIsError, mutationError, qc, resetMutation]);
  const orderMutation = useMutation({
    mutationFn: () =>
      createSupplyOrder({
        warehouseProfileId: selectedWarehouse.id,
        items: Object.entries(cart).map(([medicineId, line]) => ({
          medicineId,
          quantity: line.quantity,
        })),
        note: "طلب توريد من سوق حياة دوائية",
      }),
    onSuccess: () => {
      setCart({});
      setSelectedWarehouse(null);
      setTab("orders");
      qc.invalidateQueries({ queryKey: supplyKeys.orders });
    },
  });
  const representativeMutation = useMutation({
    mutationFn: ({ id, payload }) => updateRepresentative(id, payload),
    onSuccess: () => {
      setRepresentativeToEdit(null);
      qc.invalidateQueries({ queryKey: supplyKeys.representatives });
    },
  });
  const invoiceMutation = useMutation({
    mutationFn: ({ kind, id, payload }) =>
      kind === "payment"
        ? recordSupplyPayment(id, payload)
        : updateSupplyInvoice(id, payload),
    onSuccess: (data) => {
      setInvoiceToManage(data);
      qc.invalidateQueries({ queryKey: supplyKeys.invoices });
      qc.invalidateQueries({ queryKey: supplyKeys.orders });
    },
  });
  const act = (type, id, value) => {
    mutation.reset();
    mutation.mutate({ type, id, value });
  };
  const d = dashboard.data;
  const title =
    role === "Warehouse"
      ? "مركز قيادة سلسلة التوريد"
      : role === "Representative"
        ? "مسار المندوب الذكي"
        : role === "Admin"
          ? "مراقبة سلسلة التوريد"
          : "سوق توريد الصيدلية";
  const sub =
    role === "Warehouse"
      ? "راقب الدُفعات والطلبات والتوصيل والاستدعاءات من لوحة موحّدة."
      : role === "Representative"
        ? "مهام واضحة، تتبّع لحظي وتسليم موثّق بالرمز."
        : role === "Admin"
          ? "تابع طلبات التوريد والشحنات بين المستودعات والصيدليات."
          : "قارن المستودعات، أعد تعبئة النواقص وتابع الشحنة حتى الاستلام.";
  const tabs = [
    "orders",
    "invoices",
    ...(role === "Warehouse"
      ? ["inventory", "team"]
      : role === "Pharmacy"
        ? ["marketplace", "suggestions"]
        : []),
  ];
  return (
    <div>
      <section className="relative overflow-hidden rounded-[2.2rem] bg-[linear-gradient(125deg,#0d3943,#176173)] p-7 text-white shadow-[0_28px_80px_rgba(18,63,73,.22)] lg:p-10">
        <div className="absolute -start-20 -top-24 size-72 rounded-full border-[45px] border-white/[.04]" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#8edbd5]">
              <Sparkles size={14} />
              شبكة حياة دوائية B2B
            </span>
            <h1 className="mt-5 text-3xl font-black lg:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
              {sub}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4">
              <Truck className="text-[#f5cb72]" />
              <b className="mt-3 block">
                {orders.data?.filter((x) => x.status === "OutForDelivery")
                  .length || 0}
              </b>
              <small className="text-white/50">شحنات جارية</small>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4">
              <CheckCircle2 className="text-[#8edbd5]" />
              <b className="mt-3 block">
                {orders.data?.filter((x) => x.status === "Delivered").length ||
                  0}
              </b>
              <small className="text-white/50">تم تسليمها</small>
            </div>
          </div>
        </div>
      </section>
      {role === "Warehouse" && dashboard.isError && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
          <AlertTriangle className="me-2 inline" size={18} />
          تعذر تحميل مؤشرات المستودع. تأكد من اعتماد الحساب وتطبيق تحديث قاعدة
          البيانات، ثم أعد المحاولة.
        </div>
      )}
      {role === "Warehouse" && d && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={Boxes}
            label="دفعات فعالة"
            value={d.activeBatches}
            hint={`${d.lowStockBatches} تحتاج تعبئة`}
            className="bg-cyan-50 text-cyan-700"
          />
          <Stat
            icon={Clock3}
            label="قريبة الانتهاء"
            value={d.expiringBatches}
            hint="خلال 90 يومًا"
            className="bg-amber-50 text-amber-700"
          />
          <Stat
            icon={ShoppingCart}
            label="طلبات معلقة"
            value={d.pendingOrders}
            hint="بانتظار الإجراء"
            className="bg-violet-50 text-violet-700"
          />
          <Stat
            icon={Route}
            label="توصيلات فعالة"
            value={d.activeDeliveries}
            hint={money(d.inventoryValue)}
            className="bg-emerald-50 text-emerald-700"
          />
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`rounded-xl px-5 py-3 text-sm font-black ${tab === x ? "bg-[#123f49] text-white shadow-lg" : "bg-white text-[#60777c]"}`}
          >
            {
              {
                orders: "الطلبات والشحنات",
                invoices: "الفواتير والمدفوعات",
                inventory: "مخزون الدُفعات",
                team: "فريق المندوبين",
                marketplace: "المستودعات",
                suggestions: "اقتراحات ذكية",
              }[x]
            }
          </button>
        ))}
      </div>
      {mutation.isError && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1">
            <p>
              {mutation.error?.response?.data?.error ||
                mutation.error?.response?.data?.detail ||
                mutation.error?.message ||
                "تعذر تنفيذ الإجراء. تحقق من حالة المندوب والطلب ثم حاول مجددًا."}
            </p>
            {mutation.error?.response?.data?.traceId && (
              <p className="mt-2 font-mono text-[10px] font-normal opacity-70">
                رقم التتبع: {mutation.error.response.data.traceId}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => mutation.reset()}
            aria-label="إخفاء رسالة الخطأ"
            className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-rose-100"
          >
            <X size={17} />
          </button>
        </div>
      )}
      <section className="mt-4">
        {tab === "orders" && (
          <div className="grid gap-4 xl:grid-cols-2">
            {orders.isLoading ? (
              <div className="surface col-span-full p-12 text-center">
                <Clock3 className="mx-auto animate-pulse" />
                <h3 className="mt-3 font-black">جاري تحميل المهام...</h3>
              </div>
            ) : orders.isError ? (
              <div className="surface col-span-full border border-rose-200 p-12 text-center">
                <AlertTriangle className="mx-auto text-rose-600" />
                <h3 className="mt-3 font-black text-rose-700">
                  تعذر تحميل الطلبات والشحنات
                </h3>
                <p className="mt-2 text-sm text-[#829499]">
                  {orders.error?.response?.data?.error ||
                    orders.error?.response?.data?.detail ||
                    "تحقق من اتصال الباك وصلاحية الحساب."}
                </p>
                <button
                  type="button"
                  onClick={() => orders.refetch()}
                  className="btn-primary mx-auto mt-5"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : orders.data?.length ? (
              orders.data.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  role={role}
                  act={act}
                  busy={mutation.isPending}
                  representatives={reps.data || []}
                  onDetails={setDetailsOrder}
                />
              ))
            ) : (
              <div className="surface col-span-full p-12 text-center">
                <ShoppingCart className="mx-auto" />
                <h3 className="mt-3 font-black">لا توجد طلبات بعد</h3>
                <p className="mt-2 text-sm text-[#829499]">
                  {role === "Warehouse"
                    ? "ستظهر هنا طلبات التوريد الواردة من الصيدليات."
                    : "لا توجد مهام مسندة حاليًا."}
                </p>
                <button
                  type="button"
                  onClick={() => orders.refetch()}
                  className="btn-secondary mx-auto mt-5"
                >
                  تحديث المهام
                </button>
              </div>
            )}
          </div>
        )}
        {tab === "inventory" && (
          <div className="surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">دفعات الأدوية</h2>
                <p className="mt-1 text-xs text-[#829499]">
                  الكميات المحجوزة والصلاحية والتسعير بالجملة
                </p>
              </div>
              <button
                onClick={() => setDialog("batch")}
                className="btn-primary"
              >
                <Plus size={17} />
                إضافة دفعة
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {batches.data?.map((b) => (
                <article
                  key={b.id}
                  className="rounded-2xl border border-[#174b57]/8 p-4"
                >
                  <div className="flex justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${b.health === "Healthy" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {b.health}
                    </span>
                    <Boxes size={19} />
                  </div>
                  <h3 className="mt-4 font-black">{b.medicineName}</h3>
                  <p className="mt-1 font-mono text-xs text-[#829499]">
                    {b.batchNumber}
                  </p>
                  <div className="mt-4 flex justify-between text-sm">
                    <span>
                      المتاح <b>{b.sellableQuantity}</b> / المحجوز{" "}
                      {b.quantityReserved}
                    </span>
                    <span>{money(b.wholesalePrice)}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#829499]">
                    الصلاحية:{" "}
                    {new Date(b.expiryDateUtc).toLocaleDateString("ar-SY")}
                  </p>
                  <MedicineAlternativesButton
                    medicineName={b.medicineName}
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-100"
                  />
                </article>
              ))}
              {!batches.data?.length && (
                <div className="col-span-full rounded-2xl bg-[#f7faf9] p-10 text-center text-sm text-[#71858a]">
                  لا توجد دفعات. أضف أول دفعة لتصبح الأدوية متاحة للصيدليات.
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "team" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">فريق التوزيع</h2>
                <p className="mt-1 text-xs text-[#829499]">
                  حساب مستقل وآمن لكل مندوب
                </p>
              </div>
              <button
                onClick={() => setDialog("representative")}
                className="btn-primary"
              >
                <Plus size={17} />
                إضافة مندوب
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {reps.data?.map((r) => (
                <article key={r.id} className="surface p-5">
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf5f3]">
                      <UserRoundCheck />
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black ${
                        !r.isEnabled
                          ? "bg-rose-50 text-rose-700"
                          : r.isAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {!r.isEnabled
                        ? "موقوف"
                        : r.isAvailable
                          ? "متاح للتكليف"
                          : r.isOnShift
                            ? "مشغول"
                            : "خارج الوردية"}
                    </span>
                  </div>
                  <h3 className="mt-4 font-black">{r.fullName}</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    {r.employeeCode} · {r.vehiclePlateNumber || "دون مركبة"}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-[#f6f9f8] p-3">
                      <b className="block text-base">{r.activeDeliveries}</b>
                      شحنات فعالة
                    </div>
                    <div className="rounded-xl bg-[#f6f9f8] p-3">
                      <b className="block text-base">{r.completedDeliveries}</b>
                      مكتملة
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#71858a]">
                    الوردية:{" "}
                    {r.shiftStart && r.shiftEnd
                      ? `${String(r.shiftStart).slice(0, 5)} — ${String(r.shiftEnd).slice(0, 5)}`
                      : "دوام مفتوح"}
                  </p>
                  <button
                    onClick={() => setRepresentativeToEdit(r)}
                    className="btn-secondary mt-4 w-full justify-center"
                  >
                    <Pencil size={16} />
                    إدارة الحساب والدوام
                  </button>
                </article>
              ))}
              {!reps.data?.length && (
                <div className="surface col-span-full p-10 text-center text-sm text-[#71858a]">
                  لم تتم إضافة مندوبين بعد.
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "invoices" && (
          <InvoicesPanel
            invoices={invoices.data || []}
            loading={invoices.isLoading}
            role={role}
            onManage={setInvoiceToManage}
          />
        )}
        {tab === "marketplace" && (
          <MarketplacePanel
            warehouses={marketplace.data || []}
            selected={selectedWarehouse}
            onSelect={(w) => {
              setSelectedWarehouse(w);
              setCart({});
              setCatalogSearch("");
            }}
            onBack={() => {
              setSelectedWarehouse(null);
              setCart({});
            }}
            catalog={catalog}
            search={catalogSearch}
            setSearch={setCatalogSearch}
            cart={cart}
            setCart={setCart}
            submit={() => orderMutation.mutate()}
            submitting={orderMutation.isPending}
            error={orderMutation.error}
          />
        )}
        {tab === "suggestions" && (
          <div className="grid gap-4 md:grid-cols-2">
            {suggestions.data?.map((i) => (
              <article
                key={i.medicineId}
                className="surface flex items-center gap-4 p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                  <AlertTriangle />
                </span>
                <div>
                  <h3 className="font-black">{i.medicineName}</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    المتوفر {i.currentQuantity} · المقترح {i.suggestedQuantity}
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#287184]">
                    {i.recommendedWarehouseName || "لا يوجد مستودع متاح"}{" "}
                    {i.bestPrice ? `· ${money(i.bestPrice)}` : ""}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {dialog && (
        <WarehouseDialog
          mode={dialog}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            qc.invalidateQueries({
              queryKey:
                dialog === "batch"
                  ? supplyKeys.batches
                  : supplyKeys.representatives,
            });
            qc.invalidateQueries({ queryKey: supplyKeys.dashboard });
          }}
        />
      )}
      {representativeToEdit && (
        <RepresentativeManagementDialog
          representative={representativeToEdit}
          busy={representativeMutation.isPending}
          error={representativeMutation.error}
          onClose={() => setRepresentativeToEdit(null)}
          onSave={(payload) =>
            representativeMutation.mutate({
              id: representativeToEdit.id,
              payload,
            })
          }
        />
      )}
      {invoiceToManage && (
        <InvoiceDialog
          invoice={invoiceToManage}
          role={role}
          busy={invoiceMutation.isPending}
          error={invoiceMutation.error}
          onClose={() => setInvoiceToManage(null)}
          onSubmit={(kind, payload) =>
            invoiceMutation.mutate({
              kind,
              id: invoiceToManage.id,
              payload,
            })
          }
        />
      )}
      {detailsOrder && (
        <OrderDetailsDialog
          order={detailsOrder}
          role={role}
          representatives={reps.data || []}
          busy={mutation.isPending}
          onAction={(type, id, value) => {
            act(type, id, value);
            setDetailsOrder(null);
          }}
          onClose={() => setDetailsOrder(null)}
        />
      )}
    </div>
  );
}

function OrderDetailsDialog({
  order,
  role,
  representatives,
  busy,
  onAction,
  onClose,
}) {
  const [representativeId, setRepresentativeId] = useState(
    representatives.find((x) => x.isAvailable)?.id || "",
  );
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  const steps = [
    "Submitted",
    "Accepted",
    "Preparing",
    "ReadyForDispatch",
    "OutForDelivery",
    "Delivered",
  ];
  const current = Math.max(0, steps.indexOf(order.status));
  const next = {
    Submitted: "Accepted",
    Accepted: "Preparing",
    Preparing: "ReadyForDispatch",
  }[order.status];
  const mapUrl =
    order.pharmacyLatitude != null && order.pharmacyLongitude != null
      ? `https://www.google.com/maps?q=${order.pharmacyLatitude},${order.pharmacyLongitude}`
      : null;
  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[100] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="max-h-[94vh] w-full max-w-4xl overflow-auto rounded-[1.8rem] bg-[#f7faf9] shadow-2xl"
      >
        <header className="relative overflow-hidden bg-[linear-gradient(125deg,#123f49,#216474)] p-6 text-white">
          <div className="pointer-events-none absolute -end-14 -top-20 size-52 rounded-full border-[28px] border-white/[.04]" />
          <button
            type="button"
            aria-label="إغلاق نافذة التفاصيل"
            onClick={onClose}
            className="absolute start-5 top-5 z-20 grid size-11 place-items-center rounded-xl border border-white/15 bg-white/15 transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X />
          </button>
          <div className="relative z-10 pe-14">
            <p className="font-mono text-xs font-black text-[#8edbd5]">
              {order.orderCode}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black">
                {role === "Pharmacy" ? order.warehouseName : order.pharmacyName}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${tone(order.status)}`}
              >
                {labels[order.status] || order.status}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
              <CalendarDays size={15} />
              {new Date(order.createdAtUtc).toLocaleString("ar-SY")}
            </p>
          </div>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_310px]">
          <main className="space-y-5">
            <section className="surface p-5">
              <h3 className="font-black">مراحل معالجة الطلب</h3>
              <div className="mt-5 flex items-start">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="relative flex flex-1 flex-col items-center text-center"
                  >
                    <span
                      className={`relative z-10 grid size-8 place-items-center rounded-full border-4 border-white text-[11px] font-black ${index <= current ? "bg-[#216474] text-white" : "bg-slate-200 text-slate-500"}`}
                    >
                      {index < current ? <CheckCircle2 size={16} /> : index + 1}
                    </span>
                    {index < steps.length - 1 && (
                      <span
                        className={`absolute start-1/2 top-3.5 h-1 w-full ${index < current ? "bg-[#5eb3ad]" : "bg-slate-200"}`}
                      />
                    )}
                    <span className="relative z-10 mt-2 hidden text-[10px] font-bold text-[#60777c] sm:block">
                      {labels[step]}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black">تفاصيل الأدوية</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    {order.items.length} بنود ضمن الطلب
                  </p>
                </div>
                <Boxes className="text-[#216474]" />
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#174b57]/8">
                {order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid gap-3 p-4 text-sm sm:grid-cols-[1fr_110px_120px] sm:items-center ${index ? "border-t border-slate-100" : ""}`}
                  >
                    <div>
                      <b>{item.medicineName}</b>
                      <p className="mt-1 text-xs text-[#829499]">
                        {item.batchNumber
                          ? `رقم الدفعة: ${item.batchNumber}`
                          : "لم تحدد الدفعة"}
                      </p>
                    </div>
                    <span>
                      الكمية: <b>{item.approvedQuantity}</b>
                    </span>
                    <b>{money(item.unitPrice * item.approvedQuantity)}</b>
                  </div>
                ))}
              </div>
            </section>
            {order.shipment && (
              <section className="surface p-5">
                <h3 className="font-black">بيانات الشحنة والتتبع</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    label="رقم الشحنة"
                    value={order.shipment.shipmentCode}
                  />
                  <InfoBox
                    label="المندوب"
                    value={order.shipment.representativeName || "لم يحدد"}
                  />
                  <InfoBox
                    label="حالة الشحنة"
                    value={
                      labels[order.shipment.status] || order.shipment.status
                    }
                  />
                  <InfoBox
                    label="وقت الانطلاق"
                    value={
                      order.shipment.dispatchedAtUtc
                        ? new Date(
                            order.shipment.dispatchedAtUtc,
                          ).toLocaleString("ar-SY")
                        : "لم تنطلق"
                    }
                  />
                </div>
                {order.shipment.tracking?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {order.shipment.tracking.map((event, index) => (
                      <div
                        key={`${event.occurredAtUtc}-${index}`}
                        className="flex gap-3 rounded-xl bg-[#f7faf9] p-3 text-sm"
                      >
                        <span className="mt-1 size-2 rounded-full bg-[#2b8a91]" />
                        <div>
                          <b>{labels[event.status] || event.status}</b>
                          <p className="mt-1 text-xs text-[#829499]">
                            {new Date(event.occurredAtUtc).toLocaleString(
                              "ar-SY",
                            )}{" "}
                            {event.note && `— ${event.note}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>
          <aside className="space-y-5">
            <section className="surface p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#eaf5f3] text-[#216474]">
                  <Building2 size={20} />
                </span>
                <div>
                  <p className="text-xs text-[#829499]">بيانات الصيدلية</p>
                  <h3 className="font-black">{order.pharmacyName}</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <DetailLine
                  icon={Phone}
                  value={order.pharmacyPhoneNumber || "رقم الهاتف غير مضاف"}
                  ltr
                />
                <DetailLine
                  icon={MapPin}
                  value={[order.pharmacyArea, order.pharmacyCity]
                    .filter(Boolean)
                    .join("، ")}
                />
                <DetailLine
                  icon={Building2}
                  value={order.pharmacyAddress || "العنوان غير مضاف"}
                />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {order.pharmacyPhoneNumber && (
                  <a
                    href={`tel:${order.pharmacyPhoneNumber}`}
                    className="btn-secondary justify-center"
                  >
                    <Phone size={17} />
                    اتصال بالصيدلية
                  </a>
                )}
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary justify-center"
                  >
                    <MapPin size={17} />
                    بدء الملاحة
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {!mapUrl && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
                  الصيدلية لم تثبت إحداثيات موقعها بعد.
                </div>
              )}
            </section>
            <section className="surface p-5">
              <h3 className="font-black">ملخص التكلفة</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>قيمة الأدوية</span>
                  <b>{money(order.subtotal)}</b>
                </div>
                <div className="flex justify-between">
                  <span>التوصيل</span>
                  <b>{money(order.deliveryFee)}</b>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                  <strong>الإجمالي</strong>
                  <strong>{money(order.totalAmount)}</strong>
                </div>
              </div>
            </section>
            {role === "Warehouse" && (
              <section className="surface p-5">
                <h3 className="font-black">إجراءات المستودع</h3>
                {next && (
                  <button
                    disabled={busy}
                    onClick={() => onAction("order", order.id, next)}
                    className="btn-primary mt-4 w-full justify-center"
                  >
                    <PackageCheck size={17} />
                    {labels[next]}
                  </button>
                )}
                {order.status === "ReadyForDispatch" &&
                  (!order.shipment ||
                    ["Failed", "Returned"].includes(order.shipment.status)) && (
                    <>
                      <label className="mt-4 block">
                        <span className="form-label">اختر المندوب</span>
                        <select
                          value={representativeId}
                          onChange={(e) => setRepresentativeId(e.target.value)}
                          className="form-input"
                        >
                          <option value="">اختر مندوبًا</option>
                          {representatives
                            .filter((rep) => rep.isAvailable)
                            .map((rep) => (
                              <option key={rep.id} value={rep.id}>
                                {rep.fullName} — متاح
                              </option>
                            ))}
                        </select>
                      </label>
                      <button
                        disabled={busy || !representativeId}
                        onClick={() =>
                          onAction("assign", order.id, representativeId)
                        }
                        className="btn-primary mt-3 w-full justify-center"
                      >
                        <Truck size={17} />
                        {order.shipment
                          ? "إعادة إسناد الشحنة"
                          : "إسناد وتجهيز الشحنة"}
                      </button>
                    </>
                  )}
                {!next &&
                  order.shipment &&
                  !["Failed", "Returned"].includes(order.shipment.status) && (
                    <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700">
                      {order.status === "Delivered"
                        ? "اكتمل تسليم الطلب"
                        : "الطلب مسند وجاهز للمتابعة"}
                    </div>
                  )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
function DetailLine({ icon: Icon, value, ltr }) {
  return (
    <div className="flex items-start gap-3 text-[#60777c]">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#2b7c86]" />
      <span dir={ltr ? "ltr" : undefined}>{value}</span>
    </div>
  );
}
function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f7faf9] p-3">
      <p className="text-[10px] text-[#829499]">{label}</p>
      <b className="mt-1 block text-sm">{value}</b>
    </div>
  );
}

function MarketplacePanel({
  warehouses,
  selected,
  onSelect,
  onBack,
  catalog,
  search,
  setSearch,
  cart,
  setCart,
  submit,
  submitting,
  error,
}) {
  if (!selected)
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-black">اختر مستودع التوريد</h2>
          <p className="mt-1 text-sm text-[#829499]">
            تظهر فقط المستودعات المعتمدة والفعالة. افتح الكتالوج لتحديد الأدوية
            والكميات.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((w) => (
            <article
              key={w.id}
              className="surface p-5 transition hover:-translate-y-1 hover:border-[#216474]/25"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Building2 />
                </span>
                {w.distanceKm != null && (
                  <span className="rounded-full bg-[#edf6f5] px-3 py-1 text-xs font-bold text-[#216474]">
                    {w.distanceKm} كم
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-black">{w.name}</h3>
              <p className="mt-1 text-xs text-[#829499]">
                {w.area}، {w.city}
              </p>
              <p className="mt-1 truncate text-xs text-[#9aa8ab]">
                {w.address}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-xl bg-[#f5f9f8] p-3">
                  <b className="block text-base">{w.availableMedicines}</b>دواء
                </div>
                <div className="rounded-xl bg-[#f5f9f8] p-3">
                  <b className="block text-sm">{money(w.minimumOrderAmount)}</b>
                  الحد الأدنى
                </div>
                <div className="rounded-xl bg-[#f5f9f8] p-3">
                  <b className="block text-sm">{money(w.deliveryFee)}</b>التوصيل
                </div>
              </div>
              <button
                disabled={!w.availableMedicines}
                onClick={() => onSelect(w)}
                className="btn-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ShoppingCart size={17} />
                {w.availableMedicines
                  ? "فتح الكتالوج والطلب"
                  : "لا يوجد مخزون متاح"}
              </button>
            </article>
          ))}
          {!warehouses.length && (
            <div className="surface col-span-full p-12 text-center">
              <Building2 className="mx-auto text-[#8aa0a4]" />
              <h3 className="mt-3 font-black">
                لا توجد مستودعات جاهزة للتوريد
              </h3>
              <p className="mt-2 text-sm text-[#829499]">
                يجب اعتماد المستودع وإضافة دفعات متاحة أولًا.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  const lines = Object.values(cart);
  const subtotal = lines.reduce(
    (sum, x) => sum + x.quantity * x.item.bestPrice,
    0,
  );
  const total = subtotal + Number(selected.deliveryFee || 0);
  const minimumReached = total >= Number(selected.minimumOrderAmount || 0);
  const count = lines.reduce((sum, x) => sum + x.quantity, 0);
  const change = (item, delta) =>
    setCart((current) => {
      const old = current[item.medicineId]?.quantity || 0;
      const next = Math.max(0, Math.min(item.availableQuantity, old + delta));
      const copy = { ...current };
      if (!next) delete copy[item.medicineId];
      else copy[item.medicineId] = { item, quantity: next };
      return copy;
    });
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="surface p-5">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="grid size-10 place-items-center rounded-xl bg-[#edf5f4] text-[#216474]"
            >
              <ArrowRight size={18} />
            </button>
            <div>
              <h2 className="text-xl font-black">{selected.name}</h2>
              <p className="mt-1 text-xs text-[#829499]">
                {selected.area}، {selected.city} ·{" "}
                {selected.distanceKm != null
                  ? `${selected.distanceKm} كم`
                  : "المسافة غير محددة"}
              </p>
            </div>
          </div>
          <label className="field-control sm:w-72">
            <Search className="field-icon-shell" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input has-field-icon"
              placeholder="ابحث ضمن أدوية المستودع"
            />
          </label>
        </div>
        <div className="mt-5 space-y-3">
          {catalog.isLoading ? (
            <div className="p-10 text-center text-sm">
              جاري تحميل كتالوج المستودع...
            </div>
          ) : (
            catalog.data?.map((item) => {
              const quantity = cart[item.medicineId]?.quantity || 0;
              return (
                <article
                  key={item.medicineId}
                  className="flex flex-col gap-4 rounded-2xl border border-[#174b57]/8 p-4 sm:flex-row sm:items-center"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf5f3] text-[#216474]">
                    <Boxes size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-black">{item.medicineName}</h3>
                    <p className="mt-1 truncate text-xs text-[#829499]">
                      {item.scientificName || "لا يوجد اسم علمي"} · أقرب صلاحية{" "}
                      {new Date(item.nearestExpiry).toLocaleDateString("ar-SY")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <b>{money(item.bestPrice)}</b>
                    <p className="mt-1 text-xs text-[#829499]">
                      {item.availableQuantity} متوفر
                    </p>
                  </div>
                  <div className="flex items-center rounded-xl border border-[#174b57]/10 bg-[#f8fbfa] p-1">
                    <button
                      type="button"
                      disabled={!quantity}
                      onClick={() => change(item, -1)}
                      className="grid size-9 place-items-center rounded-lg hover:bg-white"
                    >
                      <Minus size={16} />
                    </button>
                    <b className="w-9 text-center">{quantity}</b>
                    <button
                      type="button"
                      disabled={quantity >= item.availableQuantity}
                      onClick={() => change(item, 1)}
                      className="grid size-9 place-items-center rounded-lg bg-[#174b57] text-white disabled:opacity-40"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </article>
              );
            })
          )}
          {catalog.isSuccess && !catalog.data?.length && (
            <div className="p-10 text-center text-sm text-[#829499]">
              لا توجد أدوية مطابقة في هذا المستودع.
            </div>
          )}
        </div>
      </section>
      <aside className="surface h-fit p-5 xl:sticky xl:top-28">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#216474]">ملخص طلب التوريد</p>
            <h3 className="mt-1 text-xl font-black">السلة</h3>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf5f3] text-[#216474]">
            <ShoppingCart />
          </span>
        </div>
        <div className="mt-5 space-y-2">
          {lines.map((line) => (
            <div
              key={line.item.medicineId}
              className="flex items-center gap-2 rounded-xl bg-[#f7faf9] p-3"
            >
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm">
                  {line.item.medicineName}
                </b>
                <small className="text-[#829499]">
                  {line.quantity} × {money(line.item.bestPrice)}
                </small>
              </div>
              <button
                onClick={() =>
                  setCart((c) => {
                    const n = { ...c };
                    delete n[line.item.medicineId];
                    return n;
                  })
                }
                className="text-rose-500"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          {!lines.length && (
            <div className="rounded-xl border border-dashed border-[#174b57]/15 p-7 text-center text-sm text-[#829499]">
              اختر الأدوية وحدد الكميات.
            </div>
          )}
        </div>
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between">
            <span>الأدوية ({count})</span>
            <b>{money(subtotal)}</b>
          </div>
          <div className="flex justify-between">
            <span>التوصيل</span>
            <b>{money(selected.deliveryFee)}</b>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
            <strong>الإجمالي</strong>
            <strong>{money(total)}</strong>
          </div>
        </div>
        {!minimumReached && lines.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800">
            الحد الأدنى لهذا المستودع {money(selected.minimumOrderAmount)}. أضف
            أدوية بقيمة {money(selected.minimumOrderAmount - total)}.
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">
            {error.response?.data?.error ||
              "تعذر إرسال الطلب. راجع المخزون والكميات."}
          </div>
        )}
        <button
          onClick={submit}
          disabled={!lines.length || !minimumReached || submitting}
          className="btn-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? (
            "جاري إرسال الطلب..."
          ) : (
            <>
              <CheckCircle2 size={17} />
              تأكيد وإرسال الطلب
            </>
          )}
        </button>
        <p className="mt-3 text-center text-[11px] leading-5 text-[#829499]">
          تُحجز الكميات فورًا ويصل الطلب للمستودع لمراجعته وتجهيزه.
        </p>
      </aside>
    </div>
  );
}

function WarehouseDialog({ mode, onClose, onSaved }) {
  const isBatch = mode === "batch";
  const [form, setForm] = useState(
    isBatch
      ? {
          medicineId: "",
          batchNumber: "",
          quantityAvailable: 1,
          purchasePrice: 0,
          wholesalePrice: 0,
          productionDateUtc: "",
          expiryDateUtc: "",
          storageLocation: "",
        }
      : {
          fullName: "",
          email: "",
          password: "",
          employeeCode: "",
          vehiclePlateNumber: "",
        },
  );
  const medicines = useQuery({
    queryKey: ["medicines", "supply-picker"],
    queryFn: () => getMedicines({ pageNumber: 1, pageSize: 100 }),
    enabled: isBatch,
  });
  const save = useMutation({
    mutationFn: () =>
      isBatch
        ? addBatch({
            ...form,
            quantityAvailable: Number(form.quantityAvailable),
            purchasePrice: Number(form.purchasePrice),
            wholesalePrice: Number(form.wholesalePrice),
            productionDateUtc: form.productionDateUtc || null,
            expiryDateUtc: new Date(form.expiryDateUtc).toISOString(),
          })
        : createRepresentative(form),
    onSuccess: onSaved,
  });
  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm((x) => ({ ...x, [name]: e.target.value })),
  });
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[1.8rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#123f49] p-6 text-white">
          <div>
            <p className="text-xs font-bold text-[#8edbd5]">إدارة المستودع</p>
            <h2 className="mt-1 text-2xl font-black">
              {isBatch ? "إضافة دفعة دوائية" : "إنشاء حساب مندوب"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl bg-white/10"
          >
            <X />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="grid gap-4 p-6 sm:grid-cols-2"
        >
          {isBatch ? (
            <>
              <label className="sm:col-span-2">
                <span className="form-label">الدواء</span>
                <select
                  required
                  className="form-input"
                  {...field("medicineId")}
                >
                  <option value="">اختر من دليل الأدوية</option>
                  {medicines.data?.items?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.scientificName ? `— ${m.scientificName}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="رقم الدفعة">
                <input
                  required
                  className="form-input"
                  {...field("batchNumber")}
                />
              </Field>
              <Field label="موقع التخزين">
                <input className="form-input" {...field("storageLocation")} />
              </Field>
              <Field label="الكمية">
                <input
                  required
                  min="1"
                  type="number"
                  className="form-input"
                  {...field("quantityAvailable")}
                />
              </Field>
              <Field label="سعر الشراء">
                <input
                  required
                  min="0"
                  type="number"
                  className="form-input"
                  {...field("purchasePrice")}
                />
              </Field>
              <Field label="سعر الجملة">
                <input
                  required
                  min="0"
                  type="number"
                  className="form-input"
                  {...field("wholesalePrice")}
                />
              </Field>
              <Field label="تاريخ الإنتاج">
                <input
                  type="date"
                  className="form-input"
                  {...field("productionDateUtc")}
                />
              </Field>
              <Field label="تاريخ الصلاحية">
                <input
                  required
                  type="date"
                  className="form-input"
                  {...field("expiryDateUtc")}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="اسم المندوب">
                <input required className="form-input" {...field("fullName")} />
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  required
                  type="email"
                  dir="ltr"
                  className="form-input"
                  {...field("email")}
                />
              </Field>
              <Field label="كلمة المرور">
                <input
                  required
                  minLength="8"
                  type="password"
                  dir="ltr"
                  className="form-input"
                  {...field("password")}
                />
              </Field>
              <Field label="الرمز الوظيفي">
                <input
                  required
                  className="form-input"
                  {...field("employeeCode")}
                />
              </Field>
              <Field label="رقم المركبة">
                <input
                  className="form-input"
                  {...field("vehiclePlateNumber")}
                />
              </Field>
            </>
          )}
          {save.isError && (
            <div className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {save.error?.response?.data?.error ||
                "تعذر الحفظ. راجع البيانات وحاول مجددًا."}
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button disabled={save.isPending} className="btn-primary">
              {save.isPending ? "جاري الحفظ..." : "حفظ وتفعيل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label>
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

const dayNames = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const paymentLabels = {
  Unpaid: "غير مدفوعة",
  PartiallyPaid: "مدفوعة جزئيًا",
  Paid: "مدفوعة",
  Refunded: "مستردة",
};
const paymentMethodLabels = {
  CashOnDelivery: "نقدًا عند الاستلام",
  BankTransfer: "تحويل بنكي",
  Credit: "حساب آجل",
};

function InvoicesPanel({ invoices, loading, role, onManage }) {
  const paid = invoices.filter((x) => x.paymentStatus === "Paid").length;
  const outstanding = invoices.reduce(
    (sum, x) => sum + Number(x.remainingAmount || 0),
    0,
  );
  if (loading)
    return (
      <div className="surface p-12 text-center">جاري تحميل الفواتير...</div>
    );
  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat
          icon={ReceiptText}
          label="إجمالي الفواتير"
          value={invoices.length}
          hint="مرتبطة بطلبات التوريد"
          className="bg-cyan-50 text-cyan-700"
        />
        <Stat
          icon={CheckCircle2}
          label="فواتير مسددة"
          value={paid}
          hint="مغلقة ماليًا"
          className="bg-emerald-50 text-emerald-700"
        />
        <article className="surface p-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <WalletCards />
          </span>
          <strong className="mt-5 block text-2xl font-black">
            {money(outstanding)}
          </strong>
          <p className="mt-1 font-extrabold">الرصيد المستحق</p>
          <p className="mt-1 text-xs text-[#829499]">
            بانتظار التحصيل أو التحويل
          </p>
        </article>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {invoices.map((invoice) => (
          <article key={invoice.id} className="surface overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <p className="font-mono text-xs font-black text-[#287184]">
                  {invoice.invoiceNumber}
                </p>
                <h3 className="mt-2 font-black">
                  {role === "Pharmacy"
                    ? invoice.warehouseName
                    : invoice.pharmacyName}
                </h3>
                <p className="mt-1 text-xs text-[#829499]">
                  طلب {invoice.orderCode}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-black ${
                  invoice.paymentStatus === "Paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : invoice.paymentStatus === "PartiallyPaid"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                {paymentLabels[invoice.paymentStatus] || invoice.paymentStatus}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-5 text-center text-xs">
              <div className="rounded-xl bg-[#f6f9f8] p-3">
                <b className="block text-sm">{money(invoice.totalAmount)}</b>
                الإجمالي
              </div>
              <div className="rounded-xl bg-[#f6f9f8] p-3">
                <b className="block text-sm text-emerald-700">
                  {money(invoice.paidAmount)}
                </b>
                المدفوع
              </div>
              <div className="rounded-xl bg-[#f6f9f8] p-3">
                <b className="block text-sm text-rose-700">
                  {money(invoice.remainingAmount)}
                </b>
                المتبقي
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 pb-5">
              <p className="text-xs text-[#829499]">
                الاستحقاق{" "}
                {new Date(invoice.dueAtUtc).toLocaleDateString("ar-SY")}
              </p>
              <button
                onClick={() => onManage(invoice)}
                className="btn-secondary"
              >
                <Eye size={16} /> عرض وإدارة
              </button>
            </div>
          </article>
        ))}
        {!invoices.length && (
          <div className="surface col-span-full p-12 text-center">
            <ReceiptText className="mx-auto text-[#8aa0a4]" />
            <h3 className="mt-3 font-black">لا توجد فواتير بعد</h3>
            <p className="mt-2 text-sm text-[#829499]">
              تُنشأ الفاتورة تلقائيًا عند قبول طلب التوريد.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RepresentativeManagementDialog({
  representative,
  busy,
  error,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    fullName: representative.fullName,
    employeeCode: representative.employeeCode,
    vehiclePlateNumber: representative.vehiclePlateNumber || "",
    isEnabled: representative.isEnabled,
    isAvailable: representative.isAvailable,
    workingDays: representative.workingDays || [],
    shiftStart: representative.shiftStart
      ? String(representative.shiftStart).slice(0, 5)
      : "",
    shiftEnd: representative.shiftEnd
      ? String(representative.shiftEnd).slice(0, 5)
      : "",
    availabilityNote: representative.availabilityNote || "",
  });
  const toggleDay = (day) =>
    setForm((x) => ({
      ...x,
      workingDays: x.workingDays.includes(day)
        ? x.workingDays.filter((d) => d !== day)
        : [...x.workingDays, day].sort(),
    }));
  const missingWorkingDay = form.isEnabled && !form.workingDays.length;
  const incompleteShift =
    form.isEnabled && Boolean(form.shiftStart) !== Boolean(form.shiftEnd);
  const cannotSave = busy || missingWorkingDay || incompleteShift;
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...form,
            vehiclePlateNumber: form.vehiclePlateNumber || null,
            shiftStart: form.shiftStart ? `${form.shiftStart}:00` : null,
            shiftEnd: form.shiftEnd ? `${form.shiftEnd}:00` : null,
            availabilityNote: form.availabilityNote || null,
          });
        }}
        className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[1.8rem] bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between bg-[#123f49] p-6 text-white">
          <div>
            <p className="text-xs text-[#8edbd5]">إدارة فريق التوزيع</p>
            <h2 className="mt-1 text-2xl font-black">
              {representative.fullName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl bg-white/10"
          >
            <X />
          </button>
        </header>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Field label="اسم المندوب">
            <input
              required
              className="form-input"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>
          <Field label="الرمز الوظيفي">
            <input
              required
              className="form-input"
              value={form.employeeCode}
              onChange={(e) =>
                setForm({ ...form, employeeCode: e.target.value })
              }
            />
          </Field>
          <Field label="رقم المركبة">
            <input
              className="form-input"
              value={form.vehiclePlateNumber}
              onChange={(e) =>
                setForm({ ...form, vehiclePlateNumber: e.target.value })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  isEnabled: !form.isEnabled,
                  isAvailable: form.isEnabled ? false : form.isAvailable,
                })
              }
              className={`rounded-xl border p-3 text-sm font-black ${form.isEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
            >
              <Power className="mx-auto mb-1" size={18} />
              {form.isEnabled ? "الحساب مفعّل" : "الحساب موقوف"}
            </button>
            <button
              type="button"
              disabled={!form.isEnabled}
              onClick={() =>
                setForm({ ...form, isAvailable: !form.isAvailable })
              }
              className={`rounded-xl border p-3 text-sm font-black ${form.isAvailable ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}
            >
              <UserRoundCheck className="mx-auto mb-1" size={18} />
              {form.isAvailable ? "متاح للتكليف" : "غير متاح"}
            </button>
          </div>
          <div className="sm:col-span-2">
            <span className="form-label">أيام العمل</span>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {dayNames.map((name, day) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-xl px-2 py-3 text-xs font-black ${form.workingDays.includes(day) ? "bg-[#174b57] text-white" : "bg-[#f3f7f6] text-[#60777c]"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <Field label="بداية الوردية">
            <input
              type="time"
              className="form-input"
              value={form.shiftStart}
              onChange={(e) => setForm({ ...form, shiftStart: e.target.value })}
            />
          </Field>
          <Field label="نهاية الوردية">
            <input
              type="time"
              className="form-input"
              value={form.shiftEnd}
              onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })}
            />
          </Field>
          <label className="sm:col-span-2">
            <span className="form-label">ملاحظة الحالة</span>
            <textarea
              rows="3"
              className="form-input"
              value={form.availabilityNote}
              onChange={(e) =>
                setForm({ ...form, availabilityNote: e.target.value })
              }
            />
          </label>
          {missingWorkingDay && (
            <div className="sm:col-span-2 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
              اختر يوم عمل واحدًا على الأقل عند تفعيل حساب المندوب. يمكن حفظ
              الحساب الموقوف دون تحديد أيام.
            </div>
          )}
          {incompleteShift && (
            <div className="sm:col-span-2 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
              أدخل بداية الوردية ونهايتها معًا، أو اترك الحقلين فارغين لدوام
              مفتوح.
            </div>
          )}
          {error && (
            <div className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {error.response?.data?.error || "تعذر تحديث المندوب."}
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button
              disabled={cannotSave}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "جاري الحفظ..." : "حفظ إعدادات المندوب"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function InvoiceDialog({ invoice, role, busy, error, onClose, onSubmit }) {
  const [mode, setMode] = useState("details");
  const [form, setForm] = useState({
    paymentMethod: invoice.paymentMethod,
    dueAtUtc: new Date(invoice.dueAtUtc).toISOString().slice(0, 10),
    discountAmount: invoice.discountAmount || 0,
    taxAmount: invoice.taxAmount || 0,
    warehouseNote: invoice.warehouseNote || "",
    amount: invoice.remainingAmount || 0,
    method: invoice.paymentMethod || "CashOnDelivery",
    referenceNumber: "",
    note: "",
  });
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm">
      <div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-[1.8rem] bg-[#f7faf9] shadow-2xl">
        <header className="flex items-center justify-between bg-[#123f49] p-6 text-white">
          <div>
            <p className="font-mono text-xs text-[#8edbd5]">
              {invoice.invoiceNumber}
            </p>
            <h2 className="mt-1 text-2xl font-black">
              فاتورة طلب {invoice.orderCode}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl bg-white/10"
          >
            <X />
          </button>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
          <main className="space-y-4">
            <section className="surface p-5">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <InfoBox label="الإجمالي" value={money(invoice.totalAmount)} />
                <InfoBox label="المدفوع" value={money(invoice.paidAmount)} />
                <InfoBox
                  label="المتبقي"
                  value={money(invoice.remainingAmount)}
                />
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>قيمة الأدوية</span>
                  <b>{money(invoice.subtotal)}</b>
                </div>
                <div className="flex justify-between">
                  <span>التوصيل</span>
                  <b>{money(invoice.deliveryFee)}</b>
                </div>
                <div className="flex justify-between">
                  <span>الخصم</span>
                  <b>{money(invoice.discountAmount)}</b>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة</span>
                  <b>{money(invoice.taxAmount)}</b>
                </div>
              </div>
            </section>
            {mode === "payment" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit("payment", {
                    amount: Number(form.amount),
                    method: form.method,
                    referenceNumber: form.referenceNumber || null,
                    note: form.note || null,
                  });
                }}
                className="surface grid gap-4 p-5 sm:grid-cols-2"
              >
                <Field label="مبلغ الدفعة">
                  <input
                    required
                    min="1"
                    max={invoice.remainingAmount}
                    type="number"
                    className="form-input"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </Field>
                <Field label="طريقة الدفع">
                  <select
                    className="form-input"
                    value={form.method}
                    onChange={(e) =>
                      setForm({ ...form, method: e.target.value })
                    }
                  >
                    {Object.entries(paymentMethodLabels).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="رقم الحوالة / المرجع">
                  <input
                    className="form-input"
                    value={form.referenceNumber}
                    onChange={(e) =>
                      setForm({ ...form, referenceNumber: e.target.value })
                    }
                  />
                </Field>
                <Field label="ملاحظة">
                  <input
                    className="form-input"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </Field>
                <button
                  disabled={busy}
                  className="btn-primary justify-center sm:col-span-2"
                >
                  <WalletCards size={17} />
                  تسجيل الدفعة
                </button>
              </form>
            )}
            {mode === "edit" && role === "Warehouse" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit("edit", {
                    paymentMethod: form.paymentMethod,
                    dueAtUtc: new Date(
                      `${form.dueAtUtc}T12:00:00Z`,
                    ).toISOString(),
                    discountAmount: Number(form.discountAmount),
                    taxAmount: Number(form.taxAmount),
                    warehouseNote: form.warehouseNote || null,
                  });
                }}
                className="surface grid gap-4 p-5 sm:grid-cols-2"
              >
                <Field label="طريقة الدفع">
                  <select
                    className="form-input"
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                  >
                    {Object.entries(paymentMethodLabels).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="تاريخ الاستحقاق">
                  <input
                    required
                    type="date"
                    className="form-input"
                    value={form.dueAtUtc}
                    onChange={(e) =>
                      setForm({ ...form, dueAtUtc: e.target.value })
                    }
                  />
                </Field>
                <Field label="الخصم">
                  <input
                    min="0"
                    type="number"
                    className="form-input"
                    value={form.discountAmount}
                    onChange={(e) =>
                      setForm({ ...form, discountAmount: e.target.value })
                    }
                  />
                </Field>
                <Field label="الضريبة">
                  <input
                    min="0"
                    type="number"
                    className="form-input"
                    value={form.taxAmount}
                    onChange={(e) =>
                      setForm({ ...form, taxAmount: e.target.value })
                    }
                  />
                </Field>
                <label className="sm:col-span-2">
                  <span className="form-label">ملاحظة المستودع</span>
                  <textarea
                    className="form-input"
                    value={form.warehouseNote}
                    onChange={(e) =>
                      setForm({ ...form, warehouseNote: e.target.value })
                    }
                  />
                </label>
                <button
                  disabled={busy}
                  className="btn-primary justify-center sm:col-span-2"
                >
                  حفظ بيانات الفاتورة
                </button>
              </form>
            )}
            {error && (
              <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
                {error.response?.data?.error || "تعذر تنفيذ الإجراء المالي."}
              </div>
            )}
          </main>
          <aside className="surface h-fit p-5">
            <h3 className="font-black">حالة الفاتورة</h3>
            <span className="mt-3 inline-flex rounded-full bg-[#eaf5f3] px-3 py-1.5 text-xs font-black text-[#216474]">
              {paymentLabels[invoice.paymentStatus]}
            </span>
            <p className="mt-4 text-xs leading-6 text-[#71858a]">
              طريقة الدفع: {paymentMethodLabels[invoice.paymentMethod]}
            </p>
            <p className="text-xs leading-6 text-[#71858a]">
              الاستحقاق:{" "}
              {new Date(invoice.dueAtUtc).toLocaleDateString("ar-SY")}
            </p>
            {invoice.paymentStatus !== "Paid" && role !== "Admin" && (
              <button
                onClick={() => setMode("payment")}
                className="btn-primary mt-4 w-full justify-center"
              >
                <WalletCards size={16} />
                تسجيل دفعة
              </button>
            )}
            {role === "Warehouse" && invoice.paymentStatus !== "Paid" && (
              <button
                onClick={() => setMode("edit")}
                className="btn-secondary mt-2 w-full justify-center"
              >
                <Pencil size={16} />
                تعديل الفاتورة
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="btn-secondary mt-2 w-full justify-center"
            >
              <ReceiptText size={16} />
              طباعة الفاتورة
            </button>
            {invoice.payments?.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-black">سجل الدفعات</p>
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="mt-2 rounded-xl bg-[#f6f9f8] p-3 text-xs"
                  >
                    <b>{money(p.amount)}</b>
                    <p className="mt-1 text-[#829499]">
                      {paymentMethodLabels[p.method]} ·{" "}
                      {new Date(p.paidAtUtc).toLocaleDateString("ar-SY")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
