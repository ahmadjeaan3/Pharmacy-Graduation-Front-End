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
  Navigation,
  Megaphone,
  Minus,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  Power,
  ReceiptText,
  RotateCcw,
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
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
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
  createSupplyReturn,
  createMedicineRecall,
  getBatches,
  getMarketplace,
  getRepresentatives,
  getRestockSuggestions,
  getSupplyDashboard,
  getSupplyOrders,
  getSupplyInvoices,
  getSupplyReturns,
  getMedicineRecalls,
  getRepresentativeRoute,
  getWarehouseCatalog,
  supplyKeys,
  updateShipment,
  updateSupplyOrder,
  updateRepresentative,
  updateSupplyInvoice,
  recordSupplyPayment,
  reviewSupplyReturn,
  updateBatch,
} from "../api/supplyChainApi";

const RepresentativeRouteMap = lazy(() =>
  import("../components/RepresentativeRouteMap").then((module) => ({
    default: module.RepresentativeRouteMap,
  })),
);

const SUPPLY_HERO_IMAGE = "/assets/app/pharmacy.png";

const warehousePathTabs = {
  "/app/warehouse/inventory": "inventory",
  "/app/warehouse/batches": "inventory",
  "/app/warehouse/orders": "orders",
  "/app/warehouse/shipments": "orders",
  "/app/warehouse/representatives": "team",
  "/app/warehouse/invoices": "invoices",
  "/app/warehouse/returns": "returns",
  "/app/warehouse/recalls": "recalls",
  "/app/supply-chain": "orders",
};

const warehouseTabPaths = {
  orders: "/app/warehouse/orders",
  inventory: "/app/warehouse/inventory",
  team: "/app/warehouse/representatives",
  invoices: "/app/warehouse/invoices",
  returns: "/app/warehouse/returns",
  recalls: "/app/warehouse/recalls",
};

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
  Pending: "قيد المراجعة",
  Requested: "بانتظار مراجعة المستودع",
  Approved: "مقبول",
  Collected: "تم الاستلام",
  Completed: "مكتمل",
};
const localeMap = {
  ar: "ar-SY",
  en: "en-US",
  tr: "tr-TR",
};

const normalizeLanguage = (language = "ar") =>
  String(language).split("-")[0].toLowerCase();

const resolveLocale = (language = "ar") =>
  localeMap[normalizeLanguage(language)] || localeMap.ar;

const money = (value, language = "ar") => {
  const lang = normalizeLanguage(language);
  const locale = resolveLocale(lang);
  const formatted = Number(value || 0).toLocaleString(locale, {
    maximumFractionDigits: 2,
  });
  return `${formatted} ${lang === "ar" ? "ل.س" : "SYP"}`;
};

const formatDate = (value, language = "ar", withTime = false) => {
  if (!value) return "";
  return new Intl.DateTimeFormat(
    resolveLocale(language),
    withTime
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "medium" },
  ).format(new Date(value));
};

const tone = (s) =>
  s === "Delivered"
    ? "bg-[#EAF4F3] text-[#174B57]"
    : ["Rejected", "Cancelled"].includes(s)
      ? "bg-[#FFF1F2] text-[#E11D48]"
      : "bg-[#FFF7DF] text-[#DFAE0D]";

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  className,
  isArabic = true,
  currentLanguage = "ar",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative min-h-[145px] w-full overflow-hidden rounded-[1.35rem] border border-[#DCE8EA] bg-white p-5 text-start shadow-[0_10px_30px_rgba(23,75,87,.04)] transition hover:-translate-y-0.5 hover:border-[#8BD0CB] hover:shadow-[0_14px_34px_rgba(23,75,87,.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#216474]"
    >
      <span
        className={`absolute top-5 grid size-11 place-items-center rounded-xl ${
          isArabic ? "right-5" : "left-5"
        } ${className}`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <div className={isArabic ? "pr-16 text-right" : "pl-16 text-left"}>
        <p className="text-[12px] font-semibold text-[#71858A]">{label}</p>

        <strong className="mt-3 block text-[28px] font-black leading-none text-[#17363E]">
          {Number(value || 0).toLocaleString(resolveLocale(currentLanguage))}
        </strong>

        <p className="mt-4 text-[11px] leading-5 text-[#A5A5A5]">{hint}</p>
      </div>
    </button>
  );
}
function OrderCard({
  order,
  role,
  act,
  busy,
  representatives = [],
  onDetails,
  t,
  currentLanguage,
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
    <article className="rounded-[1.35rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_28px_rgba(23,75,87,.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(23,75,87,.07)]">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-black text-[#216474]">
            {order.orderCode}
          </p>
          <h3 className="mt-2 text-lg font-black">
            {role === "Pharmacy" ? order.warehouseName : order.pharmacyName}
          </h3>
          <p className="mt-1 text-xs text-[#829499]">
            {formatDate(order.createdAtUtc, currentLanguage, true)}
          </p>
        </div>
        <span
          className={`h-fit rounded-full px-3 py-1.5 text-xs font-black ${tone(visibleStatus)}`}
        >
          {t(labels[visibleStatus] || visibleStatus)}
        </span>
      </div>
      <div className="my-4 grid gap-2 sm:grid-cols-2">
        {order.items.map((i) => (
          <div
            key={i.id}
            className="rounded-xl bg-[#F8FBFB] px-3 py-2.5 text-sm"
          >
            <b>{i.medicineName}</b>
            <span className="float-left">× {i.approvedQuantity}</span>
            <p className="mt-1 text-[11px] text-[#829499]">
              {i.batchNumber && `${t("دفعة")} ${i.batchNumber}`}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#174B57]/8 pt-4">
        <strong>{money(order.totalAmount, currentLanguage)}</strong>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onDetails(order)} className="btn-secondary">
            <Eye size={17} />
            {t("عرض التفاصيل")}
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
              {t(labels[next] || next)}
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
                  ? t("إسناد لمندوب متاح")
                  : t("لا يوجد مندوب متاح")}
              </button>
            )}
        </div>
      </div>
      {role === "Pharmacy" &&
        order.shipment?.pickupQrToken &&
        order.status !== "Delivered" && (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-[#216474]/30 bg-[#F8FBFB] p-4">
            {order.shipment.status === "Arrived" ? (
              <>
                <QRCodeSVG
                  value={order.shipment.pickupQrToken}
                  size={112}
                  fgColor="#174B57"
                />
                <p className="mt-3 text-xs font-bold">
                  {t("رمز استلام آمن — تحقق من الأدوية ثم أكد الاستلام")}
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
                  {t("تأكيد الاستلام وإضافة الكمية للمخزون")}
                </button>
              </>
            ) : (
              <>
                <Truck className="text-[#216474]" />
                <p className="mt-3 text-sm font-black">
                  {t("الشحنة قيد التجهيز أو التوصيل")}
                </p>
                <p className="mt-1 text-xs text-[#829499]">
                  {t("سيظهر رمز التأكيد عند وصول المندوب إلى الصيدلية.")}
                </p>
              </>
            )}
          </div>
        )}
    </article>
  );
}
export function SupplyChainWorkspacePage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const role = getPrimaryRole(user.roles);
  const representativeView = location.pathname.endsWith("/route")
    ? "route"
    : location.pathname.endsWith("/history")
      ? "history"
      : "deliveries";
  const qc = useQueryClient();
  const requestedTab = new URLSearchParams(location.search).get("tab");
  const [tab, setTab] = useState(
    requestedTab || warehousePathTabs[location.pathname] || "orders",
  );
  const activeTab =
    role === "Warehouse"
      ? requestedTab || warehousePathTabs[location.pathname] || tab
      : tab;
  const [dialog, setDialog] = useState(null);
  const [representativeToEdit, setRepresentativeToEdit] = useState(null);
  const [invoiceToManage, setInvoiceToManage] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [batchToRecall, setBatchToRecall] = useState(null);
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReview, setReturnReview] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [cart, setCart] = useState({});
  const [representativeLocation, setRepresentativeLocation] = useState(null);
  const [representativeLocationError, setRepresentativeLocationError] =
    useState("");
  const dashboard = useQuery({
    queryKey: supplyKeys.dashboard,
    queryFn: getSupplyDashboard,
    enabled: role === "Warehouse",
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const orders = useQuery({
    queryKey: [...supplyKeys.orders, user?.id || user?.email || role],
    queryFn: getSupplyOrders,
    enabled: role === "Representative" || activeTab === "orders",
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
  const batches = useQuery({
    queryKey: supplyKeys.batches,
    queryFn: getBatches,
    enabled: role === "Warehouse" && activeTab === "inventory",
    staleTime: 30_000,
  });
  const reps = useQuery({
    queryKey: supplyKeys.representatives,
    queryFn: getRepresentatives,
    enabled: role === "Warehouse" && ["orders", "team"].includes(activeTab),
    staleTime: 30_000,
  });
  const invoices = useQuery({
    queryKey: [...supplyKeys.invoices, role],
    queryFn: () => getSupplyInvoices(),
    enabled:
      ["Warehouse", "Pharmacy", "Admin"].includes(role) &&
      activeTab === "invoices",
    staleTime: 30_000,
  });
  const returns = useQuery({
    queryKey: [...supplyKeys.returns, role],
    queryFn: getSupplyReturns,
    enabled:
      ["Warehouse", "Pharmacy", "Admin"].includes(role) &&
      activeTab === "returns",
    staleTime: 30_000,
  });
  const recalls = useQuery({
    queryKey: [...supplyKeys.recalls, role],
    queryFn: getMedicineRecalls,
    enabled:
      ["Warehouse", "Pharmacy", "Admin"].includes(role) &&
      activeTab === "recalls",
    staleTime: 30_000,
  });
  const marketplace = useQuery({
    queryKey: supplyKeys.marketplace,
    queryFn: getMarketplace,
    enabled: role === "Pharmacy" && activeTab === "marketplace",
    staleTime: 60_000,
  });
  const suggestions = useQuery({
    queryKey: supplyKeys.suggestions,
    queryFn: getRestockSuggestions,
    enabled: role === "Pharmacy" && activeTab === "suggestions",
    staleTime: 30_000,
  });
  const catalog = useQuery({
    queryKey: ["supply-chain", "catalog", selectedWarehouse?.id, catalogSearch],
    queryFn: () => getWarehouseCatalog(selectedWarehouse.id, catalogSearch),
    enabled: role === "Pharmacy" && !!selectedWarehouse,
  });
  const mutation = useMutation({
    mutationFn: ({ type, id, value, coordinates, note }) =>
      type === "order"
        ? updateSupplyOrder(id, { status: value, note: "" })
        : type === "shipment"
          ? updateShipment(id, {
              status: value,
              note: note || "",
              latitude: coordinates?.latitude ?? null,
              longitude: coordinates?.longitude ?? null,
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
        note: "طلب توريد من سوق دوائي",
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
  const returnMutation = useMutation({
    mutationFn: ({ orderId, payload }) => createSupplyReturn(orderId, payload),
    onSuccess: () => {
      setReturnOrder(null);
      qc.invalidateQueries({ queryKey: supplyKeys.returns });
    },
  });
  const reviewReturnMutation = useMutation({
    mutationFn: ({ id, payload }) => reviewSupplyReturn(id, payload),
    onSuccess: () => {
      setReturnReview(null);
      qc.invalidateQueries({ queryKey: supplyKeys.returns });
      qc.invalidateQueries({ queryKey: supplyKeys.batches });
      qc.invalidateQueries({ queryKey: supplyKeys.dashboard });
    },
  });
  const recallMutation = useMutation({
    mutationFn: createMedicineRecall,
    onSuccess: () => {
      setBatchToRecall(null);
      qc.invalidateQueries({ queryKey: supplyKeys.recalls });
      qc.invalidateQueries({ queryKey: supplyKeys.batches });
      qc.invalidateQueries({ queryKey: supplyKeys.dashboard });
    },
  });
  const act = (type, id, value, note = "") => {
    mutation.reset();
    if (type === "shipment" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const coordinates = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          setRepresentativeLocation(coordinates);
          setRepresentativeLocationError("");
          mutation.mutate({ type, id, value, coordinates, note });
        },
        () => {
          setRepresentativeLocationError(
            "تعذر قراءة موقعك. فعّل إذن الموقع لتوثيق حركة الشحنة بدقة.",
          );
          mutation.mutate({ type, id, value, note });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 },
      );
      return;
    }
    mutation.mutate({ type, id, value, note });
  };
  const activeRepresentativeOrders = useMemo(
    () =>
      (orders.data || []).filter(
        (order) =>
          order.shipment &&
          !["Delivered", "Failed", "Returned"].includes(order.shipment.status),
      ),
    [orders.data],
  );
  const completedRepresentativeOrders = useMemo(
    () =>
      (orders.data || []).filter((order) =>
        ["Delivered", "Failed", "Returned"].includes(order.shipment?.status),
      ),
    [orders.data],
  );
  const activeRouteOrder = activeRepresentativeOrders[0] || null;
  const representativeRoute = useQuery({
    queryKey: [
      "supply-chain",
      "representative-route",
      activeRouteOrder?.shipment?.id,
      representativeLocation,
    ],
    queryFn: () =>
      getRepresentativeRoute(
        activeRouteOrder.shipment.id,
        representativeLocation.latitude,
        representativeLocation.longitude,
      ),
    enabled:
      role === "Representative" &&
      representativeView === "route" &&
      Boolean(activeRouteOrder?.shipment?.id && representativeLocation),
  });

  const locateRepresentative = () => {
    if (!navigator.geolocation) {
      setRepresentativeLocationError("هذا الجهاز لا يدعم تحديد الموقع.");
      return;
    }
    setRepresentativeLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setRepresentativeLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () =>
        setRepresentativeLocationError(
          "تعذر تحديد موقعك. اسمح للموقع باستخدام GPS ثم أعد المحاولة.",
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };
  const d = dashboard.data;
  const title = t(
    role === "Warehouse"
      ? "مركز قيادة سلسلة التوريد"
      : role === "Representative"
        ? "مسار المندوب الذكي"
        : role === "Admin"
          ? "مراقبة سلسلة التوريد"
          : "سوق توريد الصيدلية",
  );
  const sub = t(
    role === "Warehouse"
      ? "راقب الدُفعات والطلبات والتوصيل والاستدعاءات من لوحة موحّدة."
      : role === "Representative"
        ? "مهام واضحة، تتبّع لحظي وتسليم موثّق بالرمز."
        : role === "Admin"
          ? "تابع طلبات التوريد والشحنات بين المستودعات والصيدليات."
          : "قارن المستودعات، أعد تعبئة النواقص وتابع الشحنة حتى الاستلام.",
  );
  const tabs =
    role === "Representative"
      ? []
      : [
          "orders",
          "invoices",
          ...(["Warehouse", "Pharmacy", "Admin"].includes(role)
            ? ["returns", "recalls"]
            : []),
          ...(role === "Warehouse"
            ? ["inventory", "team"]
            : role === "Pharmacy"
              ? ["marketplace", "suggestions"]
              : []),
        ];
  const representativeOrders =
    representativeView === "history"
      ? completedRepresentativeOrders
      : activeRepresentativeOrders;
  return (
    <div dir={direction} lang={currentLanguage}>
      <section
        className="relative isolate min-h-[220px] overflow-hidden rounded-[14px] text-white shadow-[0_22px_55px_rgba(23,75,87,.16)]
sm:min-h-[230px]
lg:min-h-[250px]"
      >
        <img
          src={SUPPLY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-[center_38%] ${isArabic ? "scale-x-[-1]" : ""}`}
        />

        <div
          className="absolute inset-0"
          style={{
            background: isArabic
              ? "linear-gradient(270deg, #10505A 0%, rgba(16,80,90,.90) 38%, rgba(33,100,116,.48) 70%, rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg, #10505A 0%, rgba(16,80,90,.90) 38%, rgba(33,100,116,.48) 70%, rgba(33,100,116,.08) 100%)",
          }}
        />

        <div className="relative z-10 flex min-h-[190px] flex-col justify-between gap-6 px-6 py-6 sm:min-h-[205px] lg:min-h-[220px] lg:flex-row lg:items-center lg:px-8">
          <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[.10] text-[#E6F3F6] backdrop-blur-sm">
                <Truck size={25} strokeWidth={1.8} />
              </span>

              <div>
                <p className="text-xs font-bold text-[#E6F3F6]/80">
                  {t("شبكة دوائي للأعمال")}
                </p>

                <h1 className="mt-1 text-[24px] font-black text-white sm:text-[28px]">
                  {title}
                </h1>

                <p className="mt-1 max-w-2xl text-xs leading-6 text-[#D6D6D6] sm:text-sm">
                  {sub}
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[280px]">
            <div
              className={`relative min-h-[88px] rounded-[12px] border border-[rgba(102,102,102,.16)] bg-[rgba(2,77,82,.56)] p-4 backdrop-blur-[10px] ${isArabic ? "pl-14 text-right" : "pr-14 text-left"}`}
            >
              <span
                className={`absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center mt-2 rounded-lg text-[#F5CB72] ${isArabic ? "left-4 ml-2" : "right-4 mr-2"}`}
              >
                <Truck size={22} strokeWidth={1.8} />
              </span>

              <p className="text-xs text-[#D6D6D6]">{t("شحنات جارية")}</p>

              <strong className="mt-2 block text-2xl font-black text-[#E6F3F6]">
                {orders.data?.filter((x) => x.status === "OutForDelivery")
                  .length || 0}
              </strong>
            </div>

            <div
              className={`relative min-h-[88px] rounded-[12px] border border-[rgba(102,102,102,.16)] bg-[rgba(2,77,82,.56)] p-4 backdrop-blur-[10px] ${isArabic ? "pl-14 text-right" : "pr-14 text-left"}`}
            >
              <span
                className={`absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg mt-2 text-[#E6F3F6] ${isArabic ? "left-4 ml-2" : "right-4 mr-2"}`}
              >
                <CheckCircle2 size={22} strokeWidth={1.8} />
              </span>

              <p className="text-xs text-[#D6D6D6]">{t("تم تسليمها")}</p>

              <strong className="mt-2 block text-2xl font-black text-[#E6F3F6]">
                {orders.data?.filter((x) => x.status === "Delivered").length ||
                  0}
              </strong>
            </div>
          </div>
        </div>
      </section>
      {role === "Warehouse" && dashboard.isError && (
        <div className="mt-5 rounded-2xl border border-[#F5CB72]/45 bg-amber-50 p-5 text-sm font-bold text-amber-800">
          <AlertTriangle className="me-2 inline" size={18} />
          {t(
            "تعذر تحميل مؤشرات المستودع. تأكد من اعتماد الحساب وتطبيق تحديث قاعدة البيانات، ثم أعد المحاولة.",
          )}
        </div>
      )}
      {role === "Warehouse" && d && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={Boxes}
            label={t("دفعات فعالة")}
            value={d.activeBatches}
            hint={t("{{count}} تحتاج تعبئة", { count: d.lowStockBatches ?? 0 })}
            className="bg-[#EAF4F3] text-[#216474]"
            isArabic={isArabic}
            currentLanguage={currentLanguage}
            onClick={() => navigate("/app/warehouse/inventory")}
          />
          <Stat
            icon={Clock3}
            label={t("قريبة الانتهاء")}
            value={d.expiringBatches}
            hint={t("خلال 90 يومًا")}
            className="bg-[#FFF7DF] text-[#DFAE0D]"
            isArabic={isArabic}
            currentLanguage={currentLanguage}
            onClick={() => navigate("/app/warehouse/inventory")}
          />
          <Stat
            icon={ShoppingCart}
            label={t("طلبات معلقة")}
            value={d.pendingOrders}
            hint={t("بانتظار الإجراء")}
            className="bg-[#F0F6F7] text-[#216474]"
            isArabic={isArabic}
            currentLanguage={currentLanguage}
            onClick={() => navigate("/app/warehouse/orders")}
          />
          <Stat
            icon={Route}
            label={t("توصيلات فعالة")}
            value={d.activeDeliveries}
            hint={money(d.inventoryValue, currentLanguage)}
            className="bg-[#EAF4F3] text-[#174B57]"
            isArabic={isArabic}
            currentLanguage={currentLanguage}
            onClick={() => navigate("/app/warehouse/orders")}
          />
        </div>
      )}
      {role === "Representative" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={Truck}
            label={t("مهام فعالة")}
            value={activeRepresentativeOrders.length}
            hint={t("شحنات تحتاج متابعة اليوم")}
            className="bg-[#EAF4F3] text-[#216474]"
            isArabic={isArabic}
            currentLanguage={currentLanguage}
            onClick={() => navigate("/app/representative/deliveries")}
          />
          <Stat
            icon={CheckCircle2}
            label={t("توصيلات مكتملة")}
            value={
              completedRepresentativeOrders.filter(
                (order) => order.shipment?.status === "Delivered",
              ).length
            }
            hint={t("ضمن سجل مهامك")}
            className="bg-emerald-50 text-emerald-700"
            isArabic={isArabic}
            currentLanguage={currentLanguage}
            onClick={() => navigate("/app/representative/history")}
          />
          <Stat
            icon={Route}
            label={t("المحطة التالية")}
            value={activeRouteOrder ? 1 : 0}
            hint={activeRouteOrder?.pharmacyName || t("لا توجد مهمة حالية")}
            className="bg-[#FFF7DF] text-[#B7791F]"
            isArabic={isArabic}
            currentLanguage={currentLanguage}
            onClick={() => navigate("/app/representative/route")}
          />
        </div>
      )}
      <div
        className={`mt-6 flex flex-wrap gap-2 ${role === "Warehouse" ? "hidden" : ""}`}
      >
        {tabs.map((x) => (
          <button
            key={x}
            onClick={() => {
              setTab(x);
              if (role === "Warehouse") {
                navigate(warehouseTabPaths[x] || "/app/supply-chain");
              }
            }}
            className={`rounded-xl px-5 py-3 text-sm font-black ${activeTab === x ? "bg-[#174B57] text-white shadow-lg" : "bg-white text-[#60777D]"}`}
          >
            {t(
              {
                orders: "الطلبات والشحنات",
                invoices: "الفواتير والمدفوعات",
                inventory: "مخزون الدُفعات",
                team: "فريق المندوبين",
                marketplace: "المستودعات",
                suggestions: "اقتراحات ذكية",
                returns: "المرتجعات",
                recalls: "استدعاءات الدفعات",
              }[x],
            )}
          </button>
        ))}
      </div>
      {mutation.isError && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#FECDD3] bg-rose-50 p-4 text-sm font-bold text-[#E11D48]">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div className="flex-1">
            <p>
              {mutation.error?.response?.data?.error ||
                mutation.error?.response?.data?.detail ||
                mutation.error?.message ||
                t(
                  "تعذر تنفيذ الإجراء. تحقق من حالة المندوب والطلب ثم حاول مجددًا.",
                )}
            </p>
            {mutation.error?.response?.data?.traceId && (
              <p className="mt-2 font-mono text-[10px] font-normal opacity-70">
                {t("رقم التتبع")}: {mutation.error.response.data.traceId}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => mutation.reset()}
            aria-label="إخفاء رسالة الخطأ"
            className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-[#FFE4E6]"
          >
            <X size={17} />
          </button>
        </div>
      )}
      <section className="mt-4">
        {role === "Representative" && representativeLocationError && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            <AlertTriangle className="me-2 inline" size={18} />
            {representativeLocationError}
          </div>
        )}
        {role === "Representative" && representativeView === "route" && (
          <RepresentativeRoutePanel
            order={activeRouteOrder}
            location={representativeLocation}
            routeQuery={representativeRoute}
            onLocate={locateRepresentative}
            onDetails={setDetailsOrder}
          />
        )}
        {activeTab === "orders" && representativeView !== "route" && (
          <div className="grid gap-4 xl:grid-cols-2">
            {orders.isLoading ? (
              <div className="surface col-span-full p-12 text-center">
                <Clock3 className="mx-auto animate-pulse" />
                <h3 className="mt-3 font-black">{t("جاري تحميل المهام...")}</h3>
              </div>
            ) : orders.isError ? (
              <div className="surface col-span-full border border-[#FECDD3] p-12 text-center">
                <AlertTriangle className="mx-auto text-[#E11D48]" />
                <h3 className="mt-3 font-black text-[#E11D48]">
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
            ) : (role === "Representative" ? representativeOrders : orders.data)
                ?.length ? (
              (role === "Representative"
                ? representativeOrders
                : orders.data
              ).map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  role={role}
                  act={act}
                  busy={mutation.isPending}
                  representatives={reps.data || []}
                  onDetails={setDetailsOrder}
                  t={t}
                  currentLanguage={currentLanguage}
                  isArabic={isArabic}
                />
              ))
            ) : (
              <div className="surface col-span-full p-12 text-center">
                <ShoppingCart className="mx-auto" />
                <h3 className="mt-3 font-black">{t("لا توجد طلبات بعد")}</h3>
                <p className="mt-2 text-sm text-[#829499]">
                  {role === "Warehouse"
                    ? "ستظهر هنا طلبات التوريد الواردة من الصيدليات."
                    : representativeView === "history"
                      ? "لا توجد توصيلات مكتملة أو مغلقة بعد."
                      : "لا توجد مهام توصيل فعالة مسندة إليك حاليًا."}
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
        {activeTab === "inventory" && (
          <div className="surface p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">{t("دفعات الأدوية")}</h2>
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
                  className="rounded-2xl border border-[#174B57]/8 p-4"
                >
                  <div className="flex justify-between">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black ${b.health === "Healthy" ? "bg-[#EAF4F3] text-[#174B57]" : "bg-[#FFF7DF] text-[#DFAE0D]"}`}
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
                    <span>{money(b.wholesalePrice, currentLanguage)}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#829499]">
                    الصلاحية:{" "}
                    {new Date(b.expiryDateUtc).toLocaleDateString(
                      resolveLocale(currentLanguage),
                    )}
                  </p>
                  <MedicineAlternativesButton
                    medicineName={b.medicineName}
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#DCE8EA] bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:-translate-y-0.5 hover:bg-[#EAF4F3]"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="btn-secondary justify-center"
                      onClick={() => setBatchToEdit(b)}
                    >
                      <Pencil size={15} /> تعديل
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-xs font-black text-rose-700"
                      onClick={() => setBatchToRecall(b)}
                      disabled={!b.isActive}
                    >
                      <Megaphone size={15} /> استدعاء
                    </button>
                  </div>
                </article>
              ))}
              {!batches.data?.length && (
                <div className="col-span-full rounded-2xl bg-[#F8FBFB] p-10 text-center text-sm text-[#71858A]">
                  لا توجد دفعات. أضف أول دفعة لتصبح الأدوية متاحة للصيدليات.
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "team" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">{t("فريق التوزيع")}</h2>
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
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#EAF4F3]">
                      <UserRoundCheck />
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-black ${
                        !r.isEnabled
                          ? "bg-[#FFF1F2] text-[#E11D48]"
                          : r.isAvailable
                            ? "bg-[#EAF4F3] text-[#174B57]"
                            : "bg-[#FFF7DF] text-[#DFAE0D]"
                      }`}
                    >
                      {!r.isEnabled
                        ? t("موقوف")
                        : r.isAvailable
                          ? t("متاح للتكليف")
                          : r.isOnShift
                            ? t("مشغول")
                            : t("خارج الوردية")}
                    </span>
                  </div>
                  <h3 className="mt-4 font-black">{r.fullName}</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    {r.employeeCode} · {r.vehiclePlateNumber || "دون مركبة"}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-[#F8FBFB] p-3">
                      <b className="block text-base">{r.activeDeliveries}</b>
                      شحنات فعالة
                    </div>
                    <div className="rounded-xl bg-[#F8FBFB] p-3">
                      <b className="block text-base">{r.completedDeliveries}</b>
                      مكتملة
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#71858A]">
                    الوردية:{" "}
                    {r.shiftStart && r.shiftEnd
                      ? `${String(r.shiftStart).slice(0, 5)} — ${String(r.shiftEnd).slice(0, 5)}`
                      : t("دوام مفتوح")}
                  </p>
                  <button
                    onClick={() => setRepresentativeToEdit(r)}
                    className="btn-secondary mt-4 w-full justify-center"
                  >
                    <Pencil size={16} />
                    {t("إدارة الحساب والدوام")}
                  </button>
                </article>
              ))}
              {!reps.data?.length && (
                <div className="surface col-span-full p-10 text-center text-sm text-[#71858A]">
                  لم تتم إضافة مندوبين بعد.
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "invoices" && (
          <InvoicesPanel
            invoices={invoices.data || []}
            loading={invoices.isLoading}
            role={role}
            onManage={setInvoiceToManage}
          />
        )}
        {activeTab === "returns" && (
          <ReturnsPanel
            items={returns.data || []}
            loading={returns.isLoading}
            error={returns.error}
            onRetry={returns.refetch}
            role={role}
            busy={reviewReturnMutation.isPending}
            onReview={(item, status) => setReturnReview({ item, status })}
          />
        )}
        {activeTab === "recalls" && (
          <RecallsPanel
            items={recalls.data || []}
            loading={recalls.isLoading}
          />
        )}
        {activeTab === "marketplace" && (
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
        {activeTab === "suggestions" && (
          <div className="grid gap-4 md:grid-cols-2">
            {suggestions.data?.map((i) => (
              <article
                key={i.medicineId}
                className="surface flex items-center gap-4 p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF7DF] text-[#DFAE0D]">
                  <AlertTriangle />
                </span>
                <div>
                  <h3 className="font-black">{i.medicineName}</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    {t("المتوفر")} {i.currentQuantity} · {t("المقترح")}{" "}
                    {i.suggestedQuantity}
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#216474]">
                    {i.recommendedWarehouseName || t("لا يوجد مستودع متاح")}{" "}
                    {i.bestPrice
                      ? `· ${money(i.bestPrice, currentLanguage)}`
                      : ""}
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
      {batchToEdit && (
        <WarehouseDialog
          mode="batch"
          batch={batchToEdit}
          onClose={() => setBatchToEdit(null)}
          onSaved={() => {
            setBatchToEdit(null);
            qc.invalidateQueries({ queryKey: supplyKeys.batches });
            qc.invalidateQueries({ queryKey: supplyKeys.dashboard });
          }}
        />
      )}
      {batchToRecall && (
        <RecallDialog
          batch={batchToRecall}
          busy={recallMutation.isPending}
          error={recallMutation.error}
          onClose={() => setBatchToRecall(null)}
          onSubmit={(payload) => recallMutation.mutate(payload)}
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
          onAction={(type, id, value, note) => {
            act(type, id, value, note);
            setDetailsOrder(null);
          }}
          onReturn={() => {
            setReturnOrder(detailsOrder);
            setDetailsOrder(null);
          }}
          onClose={() => setDetailsOrder(null)}
        />
      )}
      {returnOrder && (
        <ReturnDialog
          order={returnOrder}
          returns={returns.data || []}
          busy={returnMutation.isPending}
          error={returnMutation.error}
          onClose={() => setReturnOrder(null)}
          onSubmit={(payload) =>
            returnMutation.mutate({ orderId: returnOrder.id, payload })
          }
        />
      )}
      {returnReview && (
        <ReturnReviewDialog
          review={returnReview}
          busy={reviewReturnMutation.isPending}
          error={reviewReturnMutation.error}
          onClose={() => setReturnReview(null)}
          onSubmit={(note) =>
            reviewReturnMutation.mutate({
              id: returnReview.item.id,
              payload: { status: returnReview.status, note },
            })
          }
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
  onReturn,
  onClose,
}) {
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );
  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const [representativeId, setRepresentativeId] = useState(
    representatives.find((x) => x.isAvailable)?.id || "",
  );
  const [shipmentIssueNote, setShipmentIssueNote] = useState("");
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
  const representativeNext = {
    Assigned: "Loading",
    Loading: "OutForDelivery",
    OutForDelivery: "Arrived",
  }[order.shipment?.status];
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
        className="max-h-[94vh] w-full max-w-4xl overflow-auto rounded-[1.8rem] bg-[#F8FBFB] shadow-2xl"
        dir={direction}
        lang={currentLanguage}
      >
        <header className="relative overflow-hidden bg-[linear-gradient(270deg,#10505A_0%,#216474_100%)] p-6 text-white">
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
            <p className="font-mono text-xs font-black text-[#E6F3F6]">
              {order.orderCode}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black">
                {role === "Pharmacy" ? order.warehouseName : order.pharmacyName}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${tone(order.status)}`}
              >
                {t(labels[order.status] || order.status)}
              </span>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
              <CalendarDays size={15} />
              {formatDate(order.createdAtUtc, currentLanguage, true)}
            </p>
          </div>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_310px]">
          <main className="space-y-5">
            <section className="surface p-5">
              <h3 className="font-black">{t("مراحل معالجة الطلب")}</h3>
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
                    <span className="relative z-10 mt-2 hidden text-[10px] font-bold text-[#60777D] sm:block">
                      {t(labels[step])}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section className="surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black">{t("تفاصيل الأدوية")}</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    {order.items.length} بنود ضمن الطلب
                  </p>
                </div>
                <Boxes className="text-[#216474]" />
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#174B57]/8">
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
                          : t("لم تحدد الدفعة")}
                      </p>
                    </div>
                    <span>
                      الكمية: <b>{item.approvedQuantity}</b>
                    </span>
                    <b>
                      {money(
                        item.unitPrice * item.approvedQuantity,
                        currentLanguage,
                      )}
                    </b>
                  </div>
                ))}
              </div>
            </section>
            {order.shipment && (
              <section className="surface p-5">
                <h3 className="font-black">{t("بيانات الشحنة والتتبع")}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoBox
                    label="رقم الشحنة"
                    value={order.shipment.shipmentCode}
                  />
                  <InfoBox
                    label="المندوب"
                    value={order.shipment.representativeName || t("لم يحدد")}
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
                          ).toLocaleString(resolveLocale(currentLanguage))
                        : t("لم تنطلق")
                    }
                  />
                </div>
                {order.shipment.tracking?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {order.shipment.tracking.map((event, index) => (
                      <div
                        key={`${event.occurredAtUtc}-${index}`}
                        className="flex gap-3 rounded-xl bg-[#F8FBFB] p-3 text-sm"
                      >
                        <span className="mt-1 size-2 rounded-full bg-[#216474]" />
                        <div>
                          <b>{t(labels[event.status] || event.status)}</b>
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
                <span className="grid size-11 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                  <Building2 size={20} />
                </span>
                <div>
                  <p className="text-xs text-[#829499]">
                    {t("بيانات الصيدلية")}
                  </p>
                  <h3 className="font-black">{order.pharmacyName}</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <DetailLine
                  icon={Phone}
                  value={order.pharmacyPhoneNumber || t("رقم الهاتف غير مضاف")}
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
                  value={order.pharmacyAddress || t("العنوان غير مضاف")}
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
              <h3 className="font-black">{t("ملخص التكلفة")}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>{t("قيمة الأدوية")}</span>
                  <b>{money(order.subtotal, currentLanguage)}</b>
                </div>
                <div className="flex justify-between">
                  <span>{t("التوصيل")}</span>
                  <b>{money(order.deliveryFee, currentLanguage)}</b>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                  <strong>{t("الإجمالي")}</strong>
                  <strong>{money(order.totalAmount, currentLanguage)}</strong>
                </div>
              </div>
            </section>
            {role === "Warehouse" && (
              <section className="surface p-5">
                <h3 className="font-black">{t("إجراءات المستودع")}</h3>
                {next && (
                  <button
                    disabled={busy}
                    onClick={() => onAction("order", order.id, next)}
                    className="btn-primary mt-4 w-full justify-center"
                  >
                    <PackageCheck size={17} />
                    {t(labels[next])}
                  </button>
                )}
                {order.status === "ReadyForDispatch" &&
                  (!order.shipment ||
                    ["Failed", "Returned"].includes(order.shipment.status)) && (
                    <>
                      <label className="mt-4 block">
                        <span className="form-label">{t("اختر المندوب")}</span>
                        <select
                          value={representativeId}
                          onChange={(e) => setRepresentativeId(e.target.value)}
                          className="form-input"
                        >
                          <option value="">{t("اختر مندوبًا")}</option>
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
                    <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-sm font-bold text-[#174B57]">
                      {order.status === "Delivered"
                        ? "اكتمل تسليم الطلب"
                        : "الطلب مسند وجاهز للمتابعة"}
                    </div>
                  )}
              </section>
            )}
            {role === "Representative" && order.shipment && (
              <section className="surface p-5">
                <h3 className="font-black">إجراءات مهمة التوصيل</h3>
                <p className="mt-2 text-xs leading-6 text-[#829499]">
                  حدّث حالة الشحنة بالترتيب. يتم إرفاق موقعك الحالي مع كل تحديث
                  عند السماح باستخدام GPS.
                </p>
                {representativeNext && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      onAction(
                        "shipment",
                        order.shipment.id,
                        representativeNext,
                      )
                    }
                    className="btn-primary mt-4 w-full justify-center"
                  >
                    <PackageCheck size={17} />
                    {labels[representativeNext] || representativeNext}
                  </button>
                )}
                {!["Delivered", "Failed", "Returned"].includes(
                  order.shipment.status,
                ) && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <label className="block">
                      <span className="form-label">ملاحظة عند تعذر المهمة</span>
                      <textarea
                        rows="3"
                        maxLength="1000"
                        className="form-input h-auto py-3"
                        value={shipmentIssueNote}
                        onChange={(event) =>
                          setShipmentIssueNote(event.target.value)
                        }
                        placeholder="مثال: الصيدلية مغلقة أو تعذر التواصل"
                      />
                    </label>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={busy || shipmentIssueNote.trim().length < 5}
                        onClick={() =>
                          onAction(
                            "shipment",
                            order.shipment.id,
                            "Failed",
                            shipmentIssueNote.trim(),
                          )
                        }
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs font-black text-rose-700 disabled:opacity-40"
                      >
                        تعذر التسليم
                      </button>
                      <button
                        type="button"
                        disabled={busy || shipmentIssueNote.trim().length < 5}
                        onClick={() =>
                          onAction(
                            "shipment",
                            order.shipment.id,
                            "Returned",
                            shipmentIssueNote.trim(),
                          )
                        }
                        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-black text-amber-800 disabled:opacity-40"
                      >
                        إعادتها للمستودع
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
            {role === "Pharmacy" && order.status === "Delivered" && (
              <section className="surface p-5">
                <h3 className="font-black">خدمة ما بعد الاستلام</h3>
                <p className="mt-2 text-xs leading-6 text-[#829499]">
                  يمكنك إنشاء طلب إرجاع لبند تم استلامه من هذا الطلب.
                </p>
                <button
                  onClick={onReturn}
                  className="btn-secondary mt-4 w-full justify-center"
                >
                  <RotateCcw size={17} /> إنشاء طلب مرتجع
                </button>
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
    <div className="flex items-start gap-3 text-[#60777D]">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#216474]" />
      <span dir={ltr ? "ltr" : undefined}>{value}</span>
    </div>
  );
}
function InfoBox({ label, value }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl bg-[#F8FBFB] p-3">
      <p className="text-[10px] text-[#829499]">{t(label)}</p>
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
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

  if (!selected)
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-black">{t("اختر مستودع التوريد")}</h2>
          <p className="mt-1 text-sm text-[#829499]">
            تظهر فقط المستودعات المعتمدة والفعالة. افتح الكتالوج لتحديد الأدوية
            والكميات.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {warehouses.map((w) => (
            <article
              key={w.id}
              className="rounded-[1.35rem] border border-[#DCE8EA] bg-white p-5 shadow-[0_10px_28px_rgba(23,75,87,.04)] transition hover:-translate-y-0.5 hover:border-[#AFC9CD] hover:shadow-[0_16px_34px_rgba(23,75,87,.07)]"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#EAF4F3] text-[#216474]">
                  <Building2 />
                </span>
                {w.distanceKm != null && (
                  <span className="rounded-full bg-[#EAF4F3] px-3 py-1 text-xs font-bold text-[#216474]">
                    {w.distanceKm} كم
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-black">{w.name}</h3>
              <p className="mt-1 text-xs text-[#829499]">
                {w.area}، {w.city}
              </p>
              <p className="mt-1 truncate text-xs text-[#A5A5A5]">
                {w.address}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-xl bg-[#F8FBFB] p-3">
                  <b className="block text-base">{w.availableMedicines}</b>دواء
                </div>
                <div className="rounded-xl bg-[#F8FBFB] p-3">
                  <b className="block text-sm">
                    {money(w.minimumOrderAmount, currentLanguage)}
                  </b>
                  الحد الأدنى
                </div>
                <div className="rounded-xl bg-[#F8FBFB] p-3">
                  <b className="block text-sm">
                    {money(w.deliveryFee, currentLanguage)}
                  </b>
                  التوصيل
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
              <Building2 className="mx-auto text-[#829499]" />
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
              className="grid size-10 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]"
            >
              <ArrowRight size={18} />
            </button>
            <div>
              <h2 className="text-xl font-black">{selected.name}</h2>
              <p className="mt-1 text-xs text-[#829499]">
                {selected.area}، {selected.city} ·{" "}
                {selected.distanceKm != null
                  ? `${selected.distanceKm} كم`
                  : t("المسافة غير محددة")}
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
                  className="flex flex-col gap-4 rounded-2xl border border-[#174B57]/8 p-4 sm:flex-row sm:items-center"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                    <Boxes size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-black">{item.medicineName}</h3>
                    <p className="mt-1 truncate text-xs text-[#829499]">
                      {item.scientificName || t("لا يوجد اسم علمي")} · أقرب
                      صلاحية{" "}
                      {new Date(item.nearestExpiry).toLocaleDateString(
                        resolveLocale(currentLanguage),
                      )}
                    </p>
                  </div>
                  <div className="text-sm">
                    <b>{money(item.bestPrice, currentLanguage)}</b>
                    <p className="mt-1 text-xs text-[#829499]">
                      {item.availableQuantity} متوفر
                    </p>
                  </div>
                  <div className="flex items-center rounded-xl border border-[#174B57]/10 bg-[#F8FBFB] p-1">
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
                      className="grid size-9 place-items-center rounded-lg bg-[#174B57] text-white disabled:opacity-40"
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
            <p className="text-xs font-bold text-[#216474]">
              {t("ملخص طلب التوريد")}
            </p>
            <h3 className="mt-1 text-xl font-black">{t("السلة")}</h3>
          </div>
          <span className="grid size-12 place-items-center rounded-2xl bg-[#EAF4F3] text-[#216474]">
            <ShoppingCart />
          </span>
        </div>
        <div className="mt-5 space-y-2">
          {lines.map((line) => (
            <div
              key={line.item.medicineId}
              className="flex items-center gap-2 rounded-xl bg-[#F8FBFB] p-3"
            >
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm">
                  {line.item.medicineName}
                </b>
                <small className="text-[#829499]">
                  {line.quantity} ×{" "}
                  {money(line.item.bestPrice, currentLanguage)}
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
                className="text-[#E11D48]"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
          {!lines.length && (
            <div className="rounded-xl border border-dashed border-[#174B57]/15 p-7 text-center text-sm text-[#829499]">
              اختر الأدوية وحدد الكميات.
            </div>
          )}
        </div>
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between">
            <span>الأدوية ({count})</span>
            <b>{money(subtotal, currentLanguage)}</b>
          </div>
          <div className="flex justify-between">
            <span>{t("التوصيل")}</span>
            <b>{money(selected.deliveryFee, currentLanguage)}</b>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
            <strong>{t("الإجمالي")}</strong>
            <strong>{money(total, currentLanguage)}</strong>
          </div>
        </div>
        {!minimumReached && lines.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800">
            الحد الأدنى لهذا المستودع{" "}
            {money(selected.minimumOrderAmount, currentLanguage)}. أضف أدوية
            بقيمة {money(selected.minimumOrderAmount - total, currentLanguage)}.
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl bg-[#FFF1F2] p-3 text-xs font-bold text-[#E11D48]">
            {error.response?.data?.error ||
              t("تعذر إرسال الطلب. راجع المخزون والكميات.")}
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

function ReturnsPanel({
  items,
  loading,
  error,
  onRetry,
  role,
  busy,
  onReview,
}) {
  if (loading)
    return (
      <div className="surface p-10 text-center">جاري تحميل المرتجعات...</div>
    );
  if (error)
    return (
      <div className="surface border border-rose-100 p-10 text-center">
        <AlertTriangle className="mx-auto text-rose-600" />
        <h3 className="mt-3 font-black text-rose-700">تعذر تحميل المرتجعات</h3>
        <p className="mt-2 text-sm text-[#71858A]">
          {error.response?.data?.error ||
            error.response?.data?.detail ||
            "تحقق من اعتماد الحساب وصلاحيته ثم حاول مجددًا."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary mx-auto mt-4"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="surface p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <RotateCcw size={20} />
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${tone(item.status)}`}
            >
              {labels[item.status] || item.status}
            </span>
          </div>
          <h3 className="mt-4 font-black">{item.medicineName}</h3>
          <p className="mt-1 font-mono text-xs text-[#829499]">
            {item.orderCode}
          </p>
          <p className="mt-2 text-xs font-bold text-[#60777D]">
            {role === "Warehouse" ? item.pharmacyName : item.warehouseName}
          </p>
          <div className="mt-4 rounded-xl bg-[#F8FBFB] p-3 text-sm">
            <p>
              الكمية: <b>{item.quantity}</b>
            </p>
            <p className="mt-2 text-[#60777D]">السبب: {item.reason}</p>
            <p className="mt-2 text-[#60777D]">
              قيمة المرتجع: <b>{money(item.refundAmount)}</b>
            </p>
            {item.reviewNote && (
              <p className="mt-2 text-[#60777D]">
                ملاحظة المستودع: {item.reviewNote}
              </p>
            )}
          </div>
          {role === "Warehouse" &&
            item.status !== "Completed" &&
            item.status !== "Rejected" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.status === "Requested" && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() => onReview(item, "Approved")}
                      className="btn-primary flex-1 justify-center"
                    >
                      قبول
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => onReview(item, "Rejected")}
                      className="btn-secondary flex-1 justify-center"
                    >
                      رفض
                    </button>
                  </>
                )}
                {item.status === "Approved" && (
                  <button
                    disabled={busy}
                    onClick={() => onReview(item, "Collected")}
                    className="btn-primary w-full justify-center"
                  >
                    تم استلام المرتجع
                  </button>
                )}
                {item.status === "Collected" && (
                  <button
                    disabled={busy}
                    onClick={() => onReview(item, "Completed")}
                    className="btn-primary w-full justify-center"
                  >
                    إكمال المعالجة
                  </button>
                )}
              </div>
            )}
        </article>
      ))}
      {!items.length && (
        <div className="surface col-span-full p-12 text-center text-sm text-[#71858A]">
          لا توجد طلبات مرتجعات حاليًا.
        </div>
      )}
    </div>
  );
}

function RepresentativeRoutePanel({
  order,
  location,
  routeQuery,
  onLocate,
  onDetails,
}) {
  if (!order)
    return (
      <div className="surface p-10 text-center sm:p-14">
        <Route className="mx-auto text-[#216474]" size={34} />
        <h3 className="mt-4 text-lg font-black">لا توجد محطة توصيل حالية</h3>
        <p className="mt-2 text-sm text-[#71858A]">
          عندما يسند المستودع شحنة إليك سيظهر مسارها هنا تلقائيًا.
        </p>
      </div>
    );

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="surface overflow-hidden p-3 sm:p-5">
        {!location ? (
          <div className="grid min-h-[360px] place-items-center rounded-2xl bg-[#F8FBFB] p-8 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EAF4F3] text-[#216474]">
                <Navigation size={26} />
              </span>
              <h3 className="mt-4 text-lg font-black">ابدأ من موقعك الحالي</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#71858A]">
                فعّل GPS ليتم رسم طريق القيادة الحقيقي من مكانك إلى الصيدلية
                وتوثيق حركة الشحنة بدقة.
              </p>
              <button
                type="button"
                onClick={onLocate}
                className="btn-primary mx-auto mt-5"
              >
                <Navigation size={17} />
                تحديد موقعي ورسم المسار
              </button>
            </div>
          </div>
        ) : routeQuery.isPending ? (
          <div className="grid min-h-[360px] place-items-center rounded-2xl bg-[#F8FBFB] text-center">
            <div>
              <Route className="mx-auto animate-pulse text-[#216474]" />
              <p className="mt-3 font-black">جاري حساب أفضل طريق...</p>
            </div>
          </div>
        ) : routeQuery.isError ? (
          <div className="grid min-h-[360px] place-items-center rounded-2xl bg-rose-50 p-8 text-center">
            <div>
              <AlertTriangle className="mx-auto text-rose-600" />
              <p className="mt-3 font-black text-rose-700">
                {routeQuery.error?.response?.data?.error ||
                  "تعذر رسم المسار حاليًا."}
              </p>
              <button
                type="button"
                onClick={onLocate}
                className="btn-secondary mx-auto mt-4"
              >
                إعادة تحديد الموقع
              </button>
            </div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="grid min-h-[360px] place-items-center">
                جاري تحميل الخريطة...
              </div>
            }
          >
            <RepresentativeRouteMap route={routeQuery.data} />
          </Suspense>
        )}
      </div>
      <aside className="surface flex flex-col p-5">
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-black ${tone(order.shipment.status)}`}
        >
          {labels[order.shipment.status] || order.shipment.status}
        </span>
        <p className="mt-4 font-mono text-xs font-black text-[#216474]">
          {order.shipment.shipmentCode}
        </p>
        <h3 className="mt-2 text-xl font-black">{order.pharmacyName}</h3>
        <p className="mt-3 flex items-start gap-2 text-sm leading-7 text-[#71858A]">
          <MapPin className="mt-1 shrink-0 text-[#216474]" size={17} />
          {order.pharmacyAddress}، {order.pharmacyArea}، {order.pharmacyCity}
        </p>
        {routeQuery.data?.routeAvailable && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#EAF4F3] p-3 text-center">
              <small className="text-[#71858A]">المسافة</small>
              <b className="mt-1 block text-[#174B57]">
                {(routeQuery.data.distanceMeters / 1000).toLocaleString(
                  "ar-SY",
                  {
                    maximumFractionDigits: 1,
                  },
                )}{" "}
                كم
              </b>
            </div>
            <div className="rounded-xl bg-[#FFF7DF] p-3 text-center">
              <small className="text-[#8A6A20]">الوقت المتوقع</small>
              <b className="mt-1 block text-[#8A6A20]">
                {Math.max(
                  1,
                  Math.round(routeQuery.data.durationSeconds / 60),
                ).toLocaleString("ar-SY")}{" "}
                دقيقة
              </b>
            </div>
          </div>
        )}
        <div className="mt-auto space-y-2 pt-5">
          {order.pharmacyPhoneNumber && (
            <a
              href={`tel:${order.pharmacyPhoneNumber}`}
              className="btn-secondary w-full justify-center"
            >
              <Phone size={16} />
              اتصال بالصيدلية
            </a>
          )}
          <button
            type="button"
            onClick={() => onDetails(order)}
            className="btn-primary w-full justify-center"
          >
            <Eye size={16} />
            تفاصيل المهمة وتحديث الحالة
          </button>
        </div>
      </aside>
    </div>
  );
}

function RecallsPanel({ items, loading }) {
  if (loading)
    return (
      <div className="surface p-10 text-center">جاري تحميل الاستدعاءات...</div>
    );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="surface border-s-4 border-s-rose-500 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-700">
              <Megaphone size={20} />
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
              {item.severity}
            </span>
          </div>
          <h3 className="mt-4 font-black">{item.medicineName}</h3>
          <p className="mt-1 font-mono text-xs text-[#829499]">
            الدفعة: {item.batchNumber}
          </p>
          <p className="mt-4 rounded-xl bg-[#FFF1F2] p-3 text-sm leading-7 text-rose-800">
            {item.reason}
          </p>
          <p className="mt-3 text-xs text-[#829499]">
            {formatDate(item.initiatedAtUtc, "ar", true)}
          </p>
        </article>
      ))}
      {!items.length && (
        <div className="surface col-span-full p-12 text-center text-sm text-[#71858A]">
          لا توجد استدعاءات دفعات دوائية.
        </div>
      )}
    </div>
  );
}

function ReturnReviewDialog({ review, busy, error, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const { item, status } = review;
  const decisionLabels = {
    Approved: "قبول طلب المرتجع",
    Rejected: "رفض طلب المرتجع",
    Collected: "تأكيد استلام المرتجع",
    Completed: "إكمال وتسوية المرتجع",
  };
  const requiresNote = status === "Rejected";

  return (
    <SimpleDialog
      title={decisionLabels[status] || "مراجعة المرتجع"}
      icon={RotateCcw}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(note.trim() || null);
        }}
      >
        <div className="rounded-2xl bg-[#F8FBFB] p-4 text-sm leading-7">
          <b>{item.medicineName}</b>
          <p>{item.pharmacyName}</p>
          <p>الكمية: {item.quantity}</p>
          <p>قيمة المرتجع: {money(item.refundAmount)}</p>
        </div>
        {status === "Completed" && (
          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">
            سيتم خصم الكمية من مخزون الصيدلية وإعادتها إلى دفعة المستودع. لا
            يمكن التراجع عن هذه الخطوة.
          </p>
        )}
        <Field label={requiresNote ? "سبب الرفض" : "ملاحظة المعالجة (اختياري)"}>
          <textarea
            required={requiresNote}
            rows="4"
            maxLength="1000"
            className="form-input h-auto py-3"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              requiresNote
                ? "وضّح للصيدلية سبب رفض المرتجع"
                : "أضف أي تفاصيل تفيد الصيدلية"
            }
          />
        </Field>
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
            {error.response?.data?.error ||
              error.response?.data?.detail ||
              "تعذر تحديث حالة المرتجع."}
          </p>
        )}
        <button
          disabled={busy || (requiresNote && note.trim().length < 3)}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {busy ? "جاري الحفظ..." : "تأكيد الإجراء"}
        </button>
      </form>
    </SimpleDialog>
  );
}

function ReturnDialog({ order, returns, busy, error, onClose, onSubmit }) {
  const returnedQuantity = (orderItemId) =>
    returns
      .filter(
        (item) =>
          item.orderItemId === orderItemId && item.status !== "Rejected",
      )
      .reduce((total, item) => total + Number(item.quantity || 0), 0);
  const eligibleItems = order.items.filter(
    (item) => item.deliveredQuantity - returnedQuantity(item.id) > 0,
  );
  const [form, setForm] = useState({
    orderItemId: eligibleItems[0]?.id || "",
    quantity: 1,
    reason: "",
  });
  const selected = eligibleItems.find((item) => item.id === form.orderItemId);
  const selectedRemaining = selected
    ? selected.deliveredQuantity - returnedQuantity(selected.id)
    : 0;
  return (
    <SimpleDialog title="إنشاء طلب مرتجع" icon={RotateCcw} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ ...form, quantity: Number(form.quantity) });
        }}
      >
        <Field label="الدواء">
          <select
            required
            className="form-input"
            value={form.orderItemId}
            onChange={(event) =>
              setForm((x) => ({
                ...x,
                orderItemId: event.target.value,
                quantity: 1,
              }))
            }
          >
            {eligibleItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.medicineName} — المتاح للإرجاع{" "}
                {item.deliveredQuantity - returnedQuantity(item.id)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="الكمية المراد إرجاعها">
          <input
            required
            min="1"
            max={selectedRemaining || 1}
            type="number"
            className="form-input"
            value={form.quantity}
            onChange={(event) =>
              setForm((x) => ({ ...x, quantity: event.target.value }))
            }
          />
        </Field>
        <Field label="سبب الإرجاع">
          <textarea
            required
            rows="4"
            className="form-input h-auto py-3"
            value={form.reason}
            onChange={(event) =>
              setForm((x) => ({ ...x, reason: event.target.value }))
            }
          />
        </Field>
        <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">
          بعد موافقة المستودع وتسلمه للمرتجع، تُخصم الكمية من مخزون الصيدلية
          وتُعاد إلى دفعة المستودع عند إكمال المعالجة.
        </p>
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
            {error.response?.data?.error || "تعذر إرسال طلب المرتجع."}
          </p>
        )}
        <button
          disabled={busy || !eligibleItems.length}
          className="btn-primary w-full justify-center"
        >
          {busy ? "جاري الإرسال..." : "إرسال طلب المرتجع"}
        </button>
      </form>
    </SimpleDialog>
  );
}

function RecallDialog({ batch, busy, error, onClose, onSubmit }) {
  const [form, setForm] = useState({
    medicineBatchId: batch.id,
    reason: "",
    severity: "High",
  });
  return (
    <SimpleDialog
      title={`استدعاء دفعة ${batch.batchNumber}`}
      icon={Megaphone}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <p className="rounded-xl bg-amber-50 p-3 text-sm leading-7 text-amber-900">
          سيتم إيقاف الدفعة فورًا وإشعار الصيدليات التي استلمت منها.
        </p>
        <Field label="درجة الخطورة">
          <select
            className="form-input"
            value={form.severity}
            onChange={(event) =>
              setForm((x) => ({ ...x, severity: event.target.value }))
            }
          >
            <option value="Low">منخفضة</option>
            <option value="Medium">متوسطة</option>
            <option value="High">مرتفعة</option>
            <option value="Critical">حرجة</option>
          </select>
        </Field>
        <Field label="سبب الاستدعاء">
          <textarea
            required
            rows="4"
            className="form-input h-auto py-3"
            value={form.reason}
            onChange={(event) =>
              setForm((x) => ({ ...x, reason: event.target.value }))
            }
          />
        </Field>
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
            {error.response?.data?.error || "تعذر إنشاء الاستدعاء."}
          </p>
        )}
        <button
          disabled={busy}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-5 font-black text-white disabled:opacity-50"
        >
          {busy ? "جاري التنفيذ..." : "تأكيد استدعاء الدفعة"}
        </button>
      </form>
    </SimpleDialog>
  );
}

function SimpleDialog({ title, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm">
      <div
        dir="rtl"
        className="max-h-[92vh] w-full max-w-xl overflow-auto rounded-[1.75rem] bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between bg-[#174B57] p-5 text-white">
          <div className="flex items-center gap-3">
            <Icon size={23} />
            <h2 className="text-xl font-black">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl bg-white/10"
          >
            <X size={19} />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function WarehouseDialog({ mode, batch, onClose, onSaved }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );
  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const isBatch = mode === "batch";
  const [form, setForm] = useState(
    isBatch
      ? {
          medicineId: batch?.medicineId || "",
          batchNumber: batch?.batchNumber || "",
          quantityAvailable: batch?.quantityAvailable ?? 1,
          purchasePrice: batch?.purchasePrice ?? 0,
          wholesalePrice: batch?.wholesalePrice ?? 0,
          productionDateUtc: batch?.productionDateUtc?.slice(0, 10) || "",
          expiryDateUtc: batch?.expiryDateUtc?.slice(0, 10) || "",
          storageLocation: batch?.storageLocation || "",
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
        ? (batch ? updateBatch : addBatch)(...(batch ? [batch.id] : []), {
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
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[1.8rem] bg-white shadow-2xl"
        dir={direction}
        lang={currentLanguage}
      >
        <div className="flex items-center justify-between bg-[#174B57] p-6 text-white">
          <div>
            <p className="text-xs font-bold text-[#E6F3F6]">
              {t("إدارة المستودع")}
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {isBatch
                ? batch
                  ? "تعديل الدفعة الدوائية"
                  : "إضافة دفعة دوائية"
                : "إنشاء حساب مندوب"}
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
                  disabled={Boolean(batch)}
                  className="form-input"
                  {...field("medicineId")}
                >
                  <option value="">{t("اختر من دليل الأدوية")}</option>
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
            <div className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-[#E11D48]">
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
  const { t } = useTranslation();
  return (
    <label>
      <span className="form-label">{t(label)}</span>
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
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

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
          className="bg-[#EAF4F3] text-[#216474]"
        />
        <Stat
          icon={CheckCircle2}
          label="فواتير مسددة"
          value={paid}
          hint="مغلقة ماليًا"
          className="bg-[#EAF4F3] text-[#174B57]"
        />
        <article className="surface p-5">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#FFF7DF] text-[#DFAE0D]">
            <WalletCards />
          </span>
          <strong className="mt-5 block text-2xl font-black">
            {money(outstanding, currentLanguage)}
          </strong>
          <p className="mt-1 font-extrabold">{t("الرصيد المستحق")}</p>
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
                <p className="font-mono text-xs font-black text-[#216474]">
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
                    ? "bg-[#EAF4F3] text-[#174B57]"
                    : invoice.paymentStatus === "PartiallyPaid"
                      ? "bg-[#FFF7DF] text-[#DFAE0D]"
                      : "bg-[#FFF1F2] text-[#E11D48]"
                }`}
              >
                {t(
                  paymentLabels[invoice.paymentStatus] || invoice.paymentStatus,
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 p-5 text-center text-xs">
              <div className="rounded-xl bg-[#F8FBFB] p-3">
                <b className="block text-sm">
                  {money(invoice.totalAmount, currentLanguage)}
                </b>
                الإجمالي
              </div>
              <div className="rounded-xl bg-[#F8FBFB] p-3">
                <b className="block text-sm text-[#174B57]">
                  {money(invoice.paidAmount, currentLanguage)}
                </b>
                المدفوع
              </div>
              <div className="rounded-xl bg-[#F8FBFB] p-3">
                <b className="block text-sm text-[#E11D48]">
                  {money(invoice.remainingAmount, currentLanguage)}
                </b>
                المتبقي
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 pb-5">
              <p className="text-xs text-[#829499]">
                الاستحقاق{" "}
                {new Date(invoice.dueAtUtc).toLocaleDateString(
                  resolveLocale(currentLanguage),
                )}
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
            <ReceiptText className="mx-auto text-[#829499]" />
            <h3 className="mt-3 font-black">{t("لا توجد فواتير بعد")}</h3>
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
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );
  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

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
        dir={direction}
        lang={currentLanguage}
      >
        <header className="flex items-center justify-between bg-[#174B57] p-6 text-white">
          <div>
            <p className="text-xs text-[#E6F3F6]">{t("إدارة فريق التوزيع")}</p>
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
              className={`rounded-xl border p-3 text-sm font-black ${form.isEnabled ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#174B57]" : "border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48]"}`}
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
              className={`rounded-xl border p-3 text-sm font-black ${form.isAvailable ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]" : "border-slate-200 bg-slate-50 text-slate-600"}`}
            >
              <UserRoundCheck className="mx-auto mb-1" size={18} />
              {form.isAvailable ? t("متاح للتكليف") : "غير متاح"}
            </button>
          </div>
          <div className="sm:col-span-2">
            <span className="form-label">{t("أيام العمل")}</span>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {dayNames.map((name, day) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-xl px-2 py-3 text-xs font-black ${form.workingDays.includes(day) ? "bg-[#174B57] text-white" : "bg-[#F0F6F7] text-[#60777D]"}`}
                >
                  {t(name)}
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
            <div className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-[#E11D48]">
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
  const { t, i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );
  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

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
      <div
        className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-[1.8rem] bg-[#F8FBFB] shadow-2xl"
        dir={direction}
        lang={currentLanguage}
      >
        <header className="flex items-center justify-between bg-[#174B57] p-6 text-white">
          <div>
            <p className="font-mono text-xs text-[#E6F3F6]">
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
                <InfoBox
                  label="الإجمالي"
                  value={money(invoice.totalAmount, currentLanguage)}
                />
                <InfoBox
                  label="المدفوع"
                  value={money(invoice.paidAmount, currentLanguage)}
                />
                <InfoBox
                  label="المتبقي"
                  value={money(invoice.remainingAmount, currentLanguage)}
                />
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>{t("قيمة الأدوية")}</span>
                  <b>{money(invoice.subtotal, currentLanguage)}</b>
                </div>
                <div className="flex justify-between">
                  <span>{t("التوصيل")}</span>
                  <b>{money(invoice.deliveryFee, currentLanguage)}</b>
                </div>
                <div className="flex justify-between">
                  <span>{t("الخصم")}</span>
                  <b>{money(invoice.discountAmount, currentLanguage)}</b>
                </div>
                <div className="flex justify-between">
                  <span>{t("الضريبة")}</span>
                  <b>{money(invoice.taxAmount, currentLanguage)}</b>
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
                        {t(l)}
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
                        {t(l)}
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
              <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-[#E11D48]">
                {error.response?.data?.error || "تعذر تنفيذ الإجراء المالي."}
              </div>
            )}
          </main>
          <aside className="surface h-fit p-5">
            <h3 className="font-black">{t("حالة الفاتورة")}</h3>
            <span className="mt-3 inline-flex rounded-full bg-[#EAF4F3] px-3 py-1.5 text-xs font-black text-[#216474]">
              {t(paymentLabels[invoice.paymentStatus])}
            </span>
            <p className="mt-4 text-xs leading-6 text-[#71858A]">
              طريقة الدفع: {t(paymentMethodLabels[invoice.paymentMethod])}
            </p>
            <p className="text-xs leading-6 text-[#71858A]">
              الاستحقاق:{" "}
              {new Date(invoice.dueAtUtc).toLocaleDateString(
                resolveLocale(currentLanguage),
              )}
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
                <p className="text-xs font-black">{t("سجل الدفعات")}</p>
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="mt-2 rounded-xl bg-[#F8FBFB] p-3 text-xs"
                  >
                    <b>{money(p.amount, currentLanguage)}</b>
                    <p className="mt-1 text-[#829499]">
                      {t(paymentMethodLabels[p.method])} ·{" "}
                      {new Date(p.paidAtUtc).toLocaleDateString(
                        resolveLocale(currentLanguage),
                      )}
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
