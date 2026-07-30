import {
  BadgeCheck,
  Building2,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Gift,
  HeartHandshake,
  Pill,
  RotateCcw,
  ShieldCheck,
  TriangleAlert,
  Truck,
  Warehouse,
} from "lucide-react";

export const notificationTypes = {
  PrescriptionReserved: {
    label: "الوصفات الذكية",
    title: "تم حجز الوصفة",
    icon: FileText,
    tone: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  PrescriptionStatusUpdated: {
    label: "الوصفات الذكية",
    title: "تحديث حالة الوصفة",
    icon: FileText,
    tone: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  PrescriptionExpired: {
    label: "الوصفات الذكية",
    title: "انتهت مهلة الحجز",
    icon: FileText,
    tone: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  MedicineRequestCreated: {
    label: "طلبات الأدوية",
    title: "طلب دواء جديد",
    icon: Pill,
    tone: "bg-cyan-50 text-cyan-700",
    dot: "bg-cyan-500",
  },
  MedicineRequestStatusUpdated: {
    label: "طلبات الأدوية",
    title: "تحديث طلب الدواء",
    icon: ClipboardCheck,
    tone: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  MedicineRequestCancelled: {
    label: "طلبات الأدوية",
    title: "إلغاء طلب دواء",
    icon: Pill,
    tone: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  PharmacyApprovalUpdated: {
    label: "الاعتماد",
    title: "تحديث اعتماد الصيدلية",
    icon: BadgeCheck,
    tone: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  OrganizationApprovalUpdated: {
    label: "الاعتماد",
    title: "تحديث اعتماد المنظمة",
    icon: Building2,
    tone: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  OrganizationVerificationReviewed: {
    label: "التحقق",
    title: "مراجعة ملف المنظمة",
    icon: ShieldCheck,
    tone: "bg-indigo-50 text-indigo-700",
    dot: "bg-indigo-500",
  },
  DonationOfferCreated: {
    label: "التبرعات",
    title: "عرض تبرع جديد",
    icon: Gift,
    tone: "bg-fuchsia-50 text-fuchsia-700",
    dot: "bg-fuchsia-500",
  },
  DonationOfferReviewed: {
    label: "التبرعات",
    title: "تحديث عرض التبرع",
    icon: Gift,
    tone: "bg-fuchsia-50 text-fuchsia-700",
    dot: "bg-fuchsia-500",
  },
  AssistanceRequestCreated: {
    label: "المساعدات",
    title: "طلب مساعدة جديد",
    icon: HeartHandshake,
    tone: "bg-teal-50 text-teal-700",
    dot: "bg-teal-500",
  },
  AssistanceRequestUpdated: {
    label: "المساعدات",
    title: "تحديث طلب المساعدة",
    icon: HeartHandshake,
    tone: "bg-teal-50 text-teal-700",
    dot: "bg-teal-500",
  },
  AccountStatusUpdated: {
    label: "حالة الحساب",
    title: "تحديث حالة الحساب",
    icon: ShieldCheck,
    tone: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  WarehouseApprovalUpdated: {
    label: "اعتماد المستودع",
    title: "تحديث اعتماد المستودع",
    icon: Warehouse,
    tone: "bg-cyan-50 text-cyan-700",
    dot: "bg-cyan-500",
  },
  SupplyOrder: {
    label: "سلسلة التوريد",
    title: "تحديث طلب التوريد",
    icon: Warehouse,
    tone: "bg-cyan-50 text-cyan-700",
    dot: "bg-cyan-500",
  },
  Delivery: {
    label: "التوصيل",
    title: "تحديث الشحنة",
    icon: Truck,
    tone: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  DeliveryTracking: {
    label: "تتبع الشحنة",
    title: "تحديث مسار التوصيل",
    icon: Truck,
    tone: "bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  SupplyReturn: {
    label: "المرتجعات",
    title: "تحديث طلب المرتجع",
    icon: RotateCcw,
    tone: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  MedicineRecall: {
    label: "تنبيه دوائي",
    title: "استدعاء دفعة دوائية",
    icon: TriangleAlert,
    tone: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

export const getNotificationMeta = (type) =>
  notificationTypes[type] || {
    label: "إشعار عام",
    title: "إشعار جديد",
    icon: CircleHelp,
    tone: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };

export function formatNotificationDate(value) {
  if (!value) return "";
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "الآن";
  if (seconds < 3600)
    return `منذ ${Math.floor(seconds / 60).toLocaleString("ar-SA")} دقيقة`;
  if (seconds < 86400)
    return `منذ ${Math.floor(seconds / 3600).toLocaleString("ar-SA")} ساعة`;
  if (seconds < 604800)
    return `منذ ${Math.floor(seconds / 86400).toLocaleString("ar-SA")} يوم`;
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function notificationTarget(notification, roles = []) {
  if (!notification.relatedEntityId) return null;
  if (notification.relatedEntityType === "PrescriptionOrder") {
    if (roles.includes("Pharmacy")) return "/app/pharmacy/prescriptions";
    if (roles.includes("User")) return "/app/prescriptions";
  }
  if (notification.relatedEntityType === "MedicineRequest") {
    if (roles.includes("Pharmacy"))
      return `/app/pharmacy/requests/${notification.relatedEntityId}`;
    if (roles.includes("User"))
      return `/app/requests/${notification.relatedEntityId}`;
  }
  if (
    notification.relatedEntityType === "PharmacyProfile" &&
    roles.includes("Pharmacy")
  )
    return "/app/pharmacy/profile";
  if (
    notification.relatedEntityType === "OrganizationProfile" &&
    roles.includes("Organization")
  )
    return "/app/organization/profile";
  if (notification.relatedEntityType === "MedicineDonationOffer") {
    if (roles.includes("Organization")) return "/app/organization/offers";
    if (roles.includes("User")) return "/app/donations";
  }
  if (notification.relatedEntityType === "MedicineAssistanceRequest") {
    if (roles.includes("Organization")) return "/app/organization/assistance";
    if (roles.includes("User")) return "/app/donations";
  }
  if (
    ["PharmacySupplyOrder", "DeliveryShipment", "SupplyReturn"].includes(
      notification.relatedEntityType,
    )
  ) {
    if (
      roles.some((role) =>
        ["Pharmacy", "Warehouse", "Representative", "Admin"].includes(role),
      )
    )
      return "/app/supply-chain";
  }
  if (
    notification.relatedEntityType === "WarehouseProfile" &&
    roles.includes("Warehouse")
  )
    return "/app/supply-chain";
  if (
    notification.relatedEntityType === "MedicineBatch" &&
    roles.some((role) => ["Pharmacy", "Warehouse"].includes(role))
  )
    return "/app/supply-chain";
  return null;
}

export function displayNotificationTitle(notification) {
  const hasArabic = /[\u0600-\u06FF]/.test(notification.title || "");
  return hasArabic
    ? notification.title
    : getNotificationMeta(notification.type).title;
}

export function displayNotificationMessage(notification) {
  if (/[\u0600-\u06FF]/.test(notification.message || ""))
    return notification.message;
  return (
    {
      MedicineRequestCreated:
        "وصل طلب دواء جديد إلى الصيدلية ويمكن مراجعته من تفاصيل الطلب.",
      MedicineRequestStatusUpdated:
        "حدّثت الصيدلية حالة طلب الدواء. افتح التفاصيل للاطلاع على الرد.",
      MedicineRequestCancelled:
        "ألغى المستخدم طلب الدواء المرتبط بهذا الإشعار.",
      PharmacyApprovalUpdated: "تم تحديث حالة اعتماد الصيدلية من إدارة المنصة.",
      OrganizationApprovalUpdated:
        "تم تحديث حالة اعتماد المنظمة من إدارة المنصة.",
      OrganizationVerificationReviewed:
        "اكتملت مراجعة ملف التحقق الخاص بالمنظمة.",
      DonationOfferCreated: "وصل عرض تبرع دوائي جديد إلى المنظمة.",
      DonationOfferReviewed: "تم تحديث حالة عرض التبرع الدوائي.",
      AssistanceRequestCreated: "وصل طلب مساعدة دوائية جديد إلى المنظمة.",
      AssistanceRequestUpdated: "تم تحديث حالة طلب المساعدة الدوائية.",
    }[notification.type] || notification.message
  );
}
