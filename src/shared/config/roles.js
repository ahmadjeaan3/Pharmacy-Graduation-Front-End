import {
  Bot,
  Building2,
  CalendarClock,
  ClipboardList,
  Clock3,
  FileCheck2,
  Gift,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  LibraryBig,
  MapPin,
  PackageSearch,
  UserRound,
} from "lucide-react";

const roleDefinitions = {
  User: {
    key: "User",
    label: "المستخدم",
    navigation: [
      { to: "/app/search", label: "البحث عن دواء", icon: PackageSearch },
      { to: "/app/chat", label: "المساعد الدوائي", icon: Bot },
      { to: "/app/requests", label: "طلباتي", icon: ClipboardList },
      { to: "/app/donations", label: "التبرعات والمساعدة", icon: HandHeart },
      { to: "/app/organizations", label: "المنظمات والحملات", icon: Building2 },
      { to: "/app/health", label: "ملفي الصحي", icon: HeartPulse },
      { to: "/app/history", label: "سجل البحث", icon: CalendarClock },
    ],
    dashboard: {
      title: "لوحة المستخدم",
      description:
        "ابحث عن الأدوية والصيدليات، تابع طلباتك واحتفظ بمعلوماتك الصحية المهمة.",
      actions: [
        {
          to: "/app/search",
          label: "البحث عن دواء",
          text: "البحث ضمن الأدوية والصيدليات المتاحة.",
          icon: PackageSearch,
        },
        {
          to: "/app/requests",
          label: "طلبات الأدوية",
          text: "متابعة ردود الصيدليات وحالة كل طلب.",
          icon: ClipboardList,
        },
        {
          to: "/app/donations",
          label: "التبرعات والمساعدة",
          text: "تقديم دواء أو طلب مساعدة من منظمة معتمدة.",
          icon: HandHeart,
        },
        {
          to: "/app/health",
          label: "الملف الصحي",
          text: "عرض وإدارة معلوماتك الصحية المهمة.",
          icon: HeartPulse,
        },
      ],
    },
    registration: {
      type: "user",
      title: "مستخدم",
      subtitle: "حساب شخصي",
      text: "للبحث عن الأدوية والصيدليات واستخدام الخدمات الدوائية.",
      icon: UserRound,
      tone: "bg-[#eaf4f3] text-[#216474]",
    },
  },
  Pharmacy: {
    key: "Pharmacy",
    label: "الصيدلية",
    navigation: [
      { to: "/app/pharmacy/inventory", label: "المخزون", icon: PackageSearch },
      {
        to: "/app/pharmacy/requests",
        label: "طلبات الأدوية",
        icon: ClipboardList,
      },
      { to: "/app/pharmacy/profile", label: "الملف والموقع", icon: MapPin },
      { to: "/app/pharmacy/working-hours", label: "ساعات العمل", icon: Clock3 },
    ],
    dashboard: {
      title: "لوحة الصيدلية",
      description:
        "إدارة بيانات الصيدلية والمخزون وطلبات الأدوية من مساحة عمل موحّدة.",
      actions: [
        {
          to: "/app/pharmacy/inventory",
          label: "إدارة المخزون",
          text: "عرض الأدوية والكميات المسجلة في الصيدلية.",
          icon: PackageSearch,
        },
        {
          to: "/app/pharmacy/requests",
          label: "طلبات الأدوية",
          text: "مراجعة طلبات الأدوية المرتبطة بالصيدلية.",
          icon: Building2,
        },
      ],
    },
    registration: {
      type: "pharmacy",
      title: "صيدلية",
      subtitle: "حساب منشأة",
      text: "لإدارة بيانات الصيدلية والمخزون وطلبات الأدوية.",
      icon: Building2,
      tone: "bg-amber-50 text-amber-600",
    },
  },
  Organization: {
    key: "Organization",
    label: "المنظمة",
    navigation: [
      {
        to: "/app/organization/campaigns",
        label: "الحملات",
        icon: HeartHandshake,
      },
      { to: "/app/organization/offers", label: "عروض التبرع", icon: Gift },
      {
        to: "/app/organization/assistance",
        label: "طلبات المساعدة",
        icon: HandHeart,
      },
      {
        to: "/app/organization/profile",
        label: "الملف والتحقق",
        icon: FileCheck2,
      },
    ],
    dashboard: {
      title: "لوحة المنظمة",
      description:
        "إدارة ملف المنظمة وحملات التبرع وعروض الأدوية وطلبات المساعدة.",
      actions: [
        {
          to: "/app/organization/campaigns",
          label: "الحملات الدوائية",
          text: "إنشاء الحملات وإدارة حالاتها واحتياجاتها.",
          icon: HeartHandshake,
        },
        {
          to: "/app/organization/offers",
          label: "عروض التبرع",
          text: "مراجعة عروض الأدوية الواردة وتأكيد الاستلام.",
          icon: Gift,
        },
        {
          to: "/app/organization/assistance",
          label: "طلبات المساعدة",
          text: "متابعة احتياجات المستفيدين وتحديث استجاباتها.",
          icon: HandHeart,
        },
        {
          to: "/app/organization/profile",
          label: "الملف والتحقق",
          text: "تحديث بيانات المنظمة ومستندات الاعتماد.",
          icon: Building2,
        },
      ],
    },
    registration: {
      type: "organization",
      title: "منظمة",
      subtitle: "حساب جهة",
      text: "لإدارة المبادرات الدوائية وعروض التبرع وطلبات المساعدة.",
      icon: HeartHandshake,
      tone: "bg-violet-50 text-violet-600",
    },
  },
  Admin: {
    key: "Admin",
    label: "الإدارة",
    navigation: [
      { to: "/app/approvals", label: "طلبات الاعتماد", icon: Building2 },
      { to: "/app/medicines", label: "دليل الأدوية", icon: LibraryBig },
    ],
    dashboard: {
      title: "لوحة الإدارة",
      description: "إدارة الاعتمادات وكتالوج الأدوية ومتابعة عمليات المنصة.",
      actions: [
        {
          to: "/app/approvals",
          label: "طلبات الاعتماد",
          text: "مراجعة الصيدليات والمنظمات وملفات التحقق.",
          icon: Building2,
        },
        {
          to: "/app/medicines",
          label: "دليل الأدوية",
          text: "عرض الأدوية وإضافة بياناتها المرجعية.",
          icon: LibraryBig,
        },
      ],
    },
  },
};

const rolePriority = ["Admin", "Pharmacy", "Organization", "User"];

export function normalizeRoles(roles = []) {
  const values = Array.isArray(roles) ? roles : [roles];
  return [
    ...new Set(
      values
        .map((value) =>
          rolePriority.find(
            (role) =>
              role.toLowerCase() ===
              String(value || "")
                .trim()
                .toLowerCase(),
          ),
        )
        .filter(Boolean),
    ),
  ];
}

export const hasRole = (roles, expectedRole) =>
  normalizeRoles(roles).includes(expectedRole);
export const getPrimaryRole = (roles) =>
  rolePriority.find((role) => normalizeRoles(roles).includes(role)) || "User";
export const getRoleDefinition = (role) =>
  roleDefinitions[normalizeRoles(role)[0]] ?? roleDefinitions.User;
export const registrationDefinitions = Object.fromEntries(
  Object.values(roleDefinitions)
    .filter((role) => role.registration)
    .map((role) => [
      role.registration.type,
      { ...role.registration, role: role.key },
    ]),
);
