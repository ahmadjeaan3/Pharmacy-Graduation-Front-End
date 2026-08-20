import {
  Bot,
  Activity,
  Building2,
  CalendarClock,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  Gift,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  LibraryBig,
  MapPin,
  Megaphone,
  PackageCheck,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  Route,
  ShieldCheck,
  ShieldAlert,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| تصميم صفحة التسجيل
|--------------------------------------------------------------------------
*/
const registrationDesign = {
  sidebar: "bg-[#123f47] text-white",

  accountTitle: "text-lg font-bold text-white",

  accountDescription: "mt-2 text-xs leading-6 text-white/65",

  iconContainer:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#335963] text-white shadow-sm",

  icon: "text-white",

  activeStep:
    "relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-xl border border-[#e6ad18] bg-[#335f68] px-3 py-3 text-white shadow-[0_8px_22px_rgba(0,0,0,0.12)] transition-all duration-300",

  activeStepEdge:
    "absolute inset-y-0 right-0 w-[3px] rounded-l-full bg-[#e6ad18]",

  activeStepNumber:
    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#e6ad18] bg-transparent text-sm font-bold text-[#f4c430] shadow-[0_0_0_3px_rgba(230,173,24,0.08)]",

  activeStepTitle: "text-sm font-bold text-white",

  activeStepDescription: "mt-1 text-[11px] leading-5 text-white/65",

  activeStepIcon:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#47717a] text-white",

  completedStep:
    "relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-xl border border-[#52757d] bg-[#28545d] px-3 py-3 text-white transition-all duration-300",

  completedStepNumber:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#e6ad18] bg-[#e6ad18] text-sm font-bold text-[#123f47]",

  completedStepTitle: "text-sm font-bold text-white",

  completedStepDescription: "mt-1 text-[11px] leading-5 text-white/55",

  completedStepIcon:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#416b74] text-white",

  inactiveStep:
    "relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-xl border border-transparent bg-transparent px-3 py-3 text-white/65 transition-all duration-300",

  inactiveStepNumber:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/25 bg-white/5 text-sm font-bold text-white/60",

  inactiveStepTitle: "text-sm font-semibold text-white/70",

  inactiveStepDescription: "mt-1 text-[11px] leading-5 text-white/40",

  inactiveStepIcon:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#294f57] text-white",
};

/*
|--------------------------------------------------------------------------
| توحيد رمز اللغة
|--------------------------------------------------------------------------
*/
const normalizeLanguage = (language = "ar") => {
  const value = String(language || "ar")
    .trim()
    .toLowerCase();

  if (value.startsWith("en")) {
    return "en";
  }

  if (value.startsWith("tr")) {
    return "tr";
  }

  return "ar";
};

/*
|--------------------------------------------------------------------------
| قراءة النص المناسب للغة
|--------------------------------------------------------------------------
*/
const getLocalizedValue = (value, language = "ar") => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const normalizedLanguage = normalizeLanguage(language);

    return value[normalizedLanguage] ?? value.ar ?? "";
  }

  return value;
};

/*
|--------------------------------------------------------------------------
| تعريف الأدوار
|--------------------------------------------------------------------------
*/
const roleDefinitions = {
  /*
  |--------------------------------------------------------------------------
  | المستخدم
  |--------------------------------------------------------------------------
  */
  User: {
    key: "User",

    label: "المستخدم",

    navigation: [
      {
        to: "/app/search",
        label: "البحث عن دواء",
        icon: PackageSearch,
      },
      {
        to: "/app/chat",
        label: "المساعد الدوائي",
        icon: Bot,
      },
      {
        to: "/app/prescriptions",
        label: "الوصفة الذكية",
        icon: FileText,
      },
      {
        to: "/app/requests",
        label: "طلباتي",
        icon: ClipboardList,
      },
      {
        to: "/app/donations",
        label: "التبرعات والمساعدة",
        icon: HandHeart,
      },
      {
        to: "/app/organizations",
        label: "المنظمات والحملات",
        icon: Building2,
      },
      {
        to: "/app/health",
        label: "ملفي الصحي",
        icon: HeartPulse,
      },
      {
        to: "/app/history",
        label: "سجل البحث",
        icon: CalendarClock,
      },
      {
        to: "/app/sos",
        label: "طلب دواء عاجل",
        icon: ShieldAlert,
      },
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

      title: {
        ar: "حساب مستخدم",
        en: "User Account",
        tr: "Kullanıcı Hesabı",
      },

      subtitle: {
        ar: "حساب شخصي",
        en: "Personal account",
        tr: "Kişisel hesap",
      },

      text: {
        ar: "للبحث عن الأدوية والصيدليات واستخدام الخدمات الدوائية.",
        en: "Search for medicines and pharmacies and use pharmaceutical services.",
        tr: "İlaç ve eczane aramak ve ilaç hizmetlerini kullanmak için.",
      },

      icon: UserRound,

      isImage: false,

      tone: "bg-[#335963] text-white border border-white/10 shadow-sm",

      design: registrationDesign,

      steps: [
        {
          id: 1,

          title: {
            ar: "بيانات الحساب",
            en: "Account Information",
            tr: "Hesap Bilgileri",
          },

          description: {
            ar: "أدخل بيانات الحساب الأساسية.",
            en: "Enter the basic account information.",
            tr: "Temel hesap bilgilerini girin.",
          },

          icon: UserRound,

          isImage: false,
        },
      ],
    },
  },

  /*
  |--------------------------------------------------------------------------
  | الصيدلية
  |--------------------------------------------------------------------------
  */
  Pharmacy: {
    key: "Pharmacy",

    label: "الصيدلية",

    navigation: [
      {
        to: "/app/sos",
        label: "طلبات دوائية عاجلة",
        icon: ShieldAlert,
      },
      {
        to: "/app/pharmacy/inventory",
        label: "المخزون",
        icon: PackageSearch,
      },
      {
        to: "/app/supply-chain",
        label: "توريد المستودعات",
        icon: Truck,
      },
      {
        to: "/app/pharmacy/requests",
        label: "طلبات الأدوية",
        icon: ClipboardList,
      },
      {
        to: "/app/pharmacy/prescriptions",
        label: "الوصفات المحجوزة",
        icon: FileText,
      },
      {
        to: "/app/pharmacy/donations",
        label: "تحقق التبرعات",
        icon: ShieldCheck,
      },
      {
        to: "/app/pharmacy/profile",
        label: "الملف والموقع",
        icon: MapPin,
      },
      {
        to: "/app/pharmacy/license",
        label: "الترخيص والتحقق",
        icon: FileCheck2,
      },
      {
        to: "/app/pharmacy/working-hours",
        label: "ساعات العمل",
        icon: Clock3,
      },
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
        {
          to: "/app/supply-chain",
          label: "توريد الأدوية",
          text: "إرسال طلبات التوريد إلى مستودعات الأدوية المعتمدة.",
          icon: Truck,
        },
      ],
    },

    registration: {
      type: "pharmacy",

      title: {
        ar: "حساب صيدلية",
        en: "Pharmacy Account",
        tr: "Eczane Hesabı",
      },

      subtitle: {
        ar: "حساب منشأة",
        en: "Business account",
        tr: "İşletme hesabı",
      },

      text: {
        ar: "لإدارة بيانات الصيدلية والمخزون وطلبات الأدوية.",
        en: "Manage pharmacy information, inventory, and medicine orders.",
        tr: "Eczane bilgilerini, stokları ve ilaç siparişlerini yönetmek için.",
      },

      icon: "/assets/app/home/icons/Asclepius.png",

      isImage: true,

      tone: "bg-[#335963] text-white border border-white/10 shadow-sm",

      design: registrationDesign,

      steps: [
        {
          id: 1,

          title: {
            ar: "بيانات الحساب",
            en: "Account Information",
            tr: "Hesap Bilgileri",
          },

          description: {
            ar: "أدخل بيانات الدخول الأساسية.",
            en: "Enter the basic login information.",
            tr: "Temel giriş bilgilerini girin.",
          },

          icon: UserRound,

          isImage: false,
        },
        {
          id: 2,

          title: {
            ar: "بيانات الصيدلية",
            en: "Pharmacy Information",
            tr: "Eczane Bilgileri",
          },

          description: {
            ar: "أدخل معلومات الصيدلية وموقعها.",
            en: "Enter the pharmacy information and location.",
            tr: "Eczane bilgilerini ve konumunu girin.",
          },

          icon: "/assets/app/home/icons/Asclepius.png",

          isImage: true,
        },
        {
          id: 3,

          title: {
            ar: "مستندات الاعتماد",
            en: "Verification Documents",
            tr: "Doğrulama Belgeleri",
          },

          description: {
            ar: "أرفق مستندات ترخيص الصيدلية.",
            en: "Attach the pharmacy license documents.",
            tr: "Eczane lisans belgelerini yükleyin.",
          },

          icon: FileCheck2,

          isImage: false,
        },
      ],
    },
  },

  /*
  |--------------------------------------------------------------------------
  | المستودع
  |--------------------------------------------------------------------------
  */
  Warehouse: {
    key: "Warehouse",

    label: "المستودع",

    navigation: [
      {
        to: "/app/warehouse/inventory",
        label: "المخزون والدفعات",
        icon: PackageSearch,
      },
      {
        to: "/app/warehouse/orders",
        label: "الطلبات والشحنات",
        icon: ClipboardList,
      },
      {
        to: "/app/warehouse/invoices",
        label: "الفواتير والمدفوعات",
        icon: ReceiptText,
      },
      {
        to: "/app/warehouse/accounts",
        label: "حسابات الصيدليات",
        icon: Building2,
      },
      {
        to: "/app/warehouse/returns",
        label: "المرتجعات",
        icon: RotateCcw,
      },
      {
        to: "/app/warehouse/recalls",
        label: "استدعاءات الدفعات",
        icon: Megaphone,
      },
      {
        to: "/app/warehouse/representatives",
        label: "إدارة المندوبين",
        icon: Route,
      },
    ],

    dashboard: {
      title: "لوحة المستودع",

      description:
        "إدارة مخزون المستودع وطلبات الصيدليات والدُفعات والشحنات والمندوبين من مساحة عمل موحّدة.",

      actions: [
        {
          to: "/app/warehouse/inventory",
          label: "المخزون والدفعات",
          text: "إدارة الأدوية والكميات وأرقام الدُفعات والصلاحية من مكان واحد.",
          icon: PackageSearch,
        },
        {
          to: "/app/warehouse/orders",
          label: "الطلبات والشحنات",
          text: "مراجعة طلبات الصيدليات وتجهيز الشحنات ومتابعتها حتى التسليم.",
          icon: ClipboardList,
        },
        {
          to: "/app/warehouse/invoices",
          label: "الفواتير والمدفوعات",
          text: "متابعة المستحقات وتسجيل الدفعات وحالة التحصيل.",
          icon: ReceiptText,
        },
        {
          to: "/app/warehouse/representatives",
          label: "إدارة المندوبين",
          text: "إسناد الطلبات للمندوبين ومتابعة مسارات التوصيل.",
          icon: Route,
        },
      ],
    },

    registration: {
      type: "warehouse",

      title: {
        ar: "حساب مستودع أدوية",
        en: "Medicine Warehouse Account",
        tr: "İlaç Deposu Hesabı",
      },

      subtitle: {
        ar: "حساب مورّد",
        en: "Supplier account",
        tr: "Tedarikçi hesabı",
      },

      text: {
        ar: "لإدارة مخزون الأدوية وتوريد الصيدليات وتشغيل شبكة التوصيل والمندوبين.",
        en: "Manage medicine inventory, supply pharmacies, and operate the delivery and representative network.",
        tr: "İlaç stoklarını yönetmek, eczanelere tedarik sağlamak ve teslimat ağı ile temsilcileri yönetmek için.",
      },

      icon: Warehouse,

      isImage: false,

      tone: "bg-[#335963] text-white border border-white/10 shadow-sm",

      design: registrationDesign,

      steps: [
        {
          id: 1,

          title: {
            ar: "بيانات الحساب",
            en: "Account Information",
            tr: "Hesap Bilgileri",
          },

          description: {
            ar: "أدخل بيانات الدخول الأساسية.",
            en: "Enter the basic login information.",
            tr: "Temel giriş bilgilerini girin.",
          },

          icon: UserRound,

          isImage: false,
        },
        {
          id: 2,

          title: {
            ar: "بيانات المستودع",
            en: "Warehouse Information",
            tr: "Depo Bilgileri",
          },

          description: {
            ar: "أدخل معلومات المستودع وموقعه وخدمات التوصيل.",
            en: "Enter the warehouse information, location, and delivery services.",
            tr: "Depo bilgilerini, konumunu ve teslimat hizmetlerini girin.",
          },

          icon: Warehouse,

          isImage: false,
        },
        {
          id: 3,

          title: {
            ar: "مستندات الاعتماد",
            en: "Verification Documents",
            tr: "Doğrulama Belgeleri",
          },

          description: {
            ar: "أرفق ترخيص المستودع والسجل التجاري.",
            en: "Attach the warehouse license and commercial registration.",
            tr: "Depo lisansını ve ticaret sicil belgesini yükleyin.",
          },

          icon: FileCheck2,

          isImage: false,
        },
      ],
    },
  },
  /*
  |--------------------------------------------------------------------------
  | المندوب
  |--------------------------------------------------------------------------
  | لا يحتوي على registration، لذلك لا يظهر في صفحة إنشاء الحساب.
  */
  Representative: {
    key: "Representative",

    label: "المندوب",

    navigation: [
      {
        to: "/app/representative/deliveries",
        label: "مهام التوصيل",
        icon: Truck,
      },
      {
        to: "/app/representative/route",
        label: "مسار التوصيل",
        icon: Route,
      },
      {
        to: "/app/representative/history",
        label: "سجل التوصيلات",
        icon: CalendarClock,
      },
      {
        to: "/app/representative/profile",
        label: "الملف الشخصي",
        icon: UserRound,
      },
      {
        to: "/app/supply-chain",
        label: "مركز سلسلة التوريد",
        icon: Warehouse,
      },
    ],

    dashboard: {
      title: "لوحة المندوب",

      description:
        "استلام مهام التوصيل ومتابعة مسار الشحنة وتحديث الحالة وتأكيد التسليم.",

      actions: [
        {
          to: "/app/representative/deliveries",
          label: "مهام التوصيل",
          text: "عرض الشحنات والطلبات المسندة إليك من المستودع.",
          icon: Truck,
        },
        {
          to: "/app/representative/route",
          label: "مسار التوصيل",
          text: "عرض ترتيب نقاط التوصيل ومواقع الصيدليات.",
          icon: Route,
        },
        {
          to: "/app/representative/history",
          label: "سجل التوصيلات",
          text: "مراجعة عمليات التوصيل المكتملة والملغاة.",
          icon: CalendarClock,
        },
      ],
    },
  },

  /*
  |--------------------------------------------------------------------------
  | المنظمة
  |--------------------------------------------------------------------------
  */
  Organization: {
    key: "Organization",

    label: "المنظمة",

    navigation: [
      {
        to: "/app/organization/campaigns",
        label: "الحملات",
        icon: HeartHandshake,
      },
      {
        to: "/app/organization/offers",
        label: "عروض التبرع",
        icon: Gift,
      },
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

      title: {
        ar: "حساب منظمة",
        en: "Organization Account",
        tr: "Kuruluş Hesabı",
      },

      subtitle: {
        ar: "حساب جهة",
        en: "Organization account",
        tr: "Kuruluş hesabı",
      },

      text: {
        ar: "لإدارة المبادرات الدوائية وعروض التبرع وطلبات المساعدة.",
        en: "Manage medicine initiatives, donation offers, and assistance requests.",
        tr: "İlaç girişimlerini, bağış tekliflerini ve yardım taleplerini yönetmek için.",
      },

      icon: HeartHandshake,

      isImage: false,

      tone: "bg-[#335963] text-white border border-white/10 shadow-sm",

      design: registrationDesign,

      steps: [
        {
          id: 1,

          title: {
            ar: "بيانات الحساب",
            en: "Account Information",
            tr: "Hesap Bilgileri",
          },

          description: {
            ar: "أدخل بيانات الدخول الأساسية.",
            en: "Enter the basic login information.",
            tr: "Temel giriş bilgilerini girin.",
          },

          icon: UserRound,

          isImage: false,
        },
        {
          id: 2,

          title: {
            ar: "بيانات المنظمة",
            en: "Organization Information",
            tr: "Kuruluş Bilgileri",
          },

          description: {
            ar: "أدخل معلومات المنظمة وعنوانها.",
            en: "Enter the organization information and address.",
            tr: "Kuruluş bilgilerini ve adresini girin.",
          },

          icon: Building2,

          isImage: false,
        },
        {
          id: 3,

          title: {
            ar: "مستندات الاعتماد",
            en: "Verification Documents",
            tr: "Doğrulama Belgeleri",
          },

          description: {
            ar: "أرفق مستندات اعتماد المنظمة.",
            en: "Attach the organization verification documents.",
            tr: "Kuruluş doğrulama belgelerini yükleyin.",
          },

          icon: FileCheck2,

          isImage: false,
        },
      ],
    },
  },

  /*
  |--------------------------------------------------------------------------
  | الإدارة
  |--------------------------------------------------------------------------
  */
  Admin: {
    key: "Admin",

    label: "الإدارة",

    navigation: [
      {
        to: "/app/approvals",
        label: "طلبات الاعتماد",
        icon: Building2,
      },
      {
        to: "/app/accounts",
        label: "إدارة الحسابات",
        icon: UserRound,
      },
      {
        to: "/app/medicines",
        label: "دليل الأدوية",
        icon: LibraryBig,
      },
      {
        to: "/app/supply-chain",
        label: "مراقبة التوريد",
        icon: Warehouse,
      },
      {
        to: "/app/home-ticker",
        label: "شريط الإعلانات",
        icon: Megaphone,
      },
      {
        to: "/app/audit-logs",
        label: "سجل النشاطات",
        icon: Activity,
      },
      {
        to: "/app/sos",
        label: "الطلبات الدوائية العاجلة",
        icon: ShieldAlert,
      },
    ],

    dashboard: {
      title: "لوحة الإدارة",

      description:
        "إدارة الاعتمادات وكتالوج الأدوية ومتابعة عمليات المنصة وسلسلة التوريد.",

      actions: [
        {
          to: "/app/approvals",
          label: "طلبات الاعتماد",
          text: "مراجعة الصيدليات والمنظمات والمستودعات وملفات التحقق.",
          icon: Building2,
        },
        {
          to: "/app/medicines",
          label: "دليل الأدوية",
          text: "عرض الأدوية وإضافة بياناتها المرجعية.",
          icon: LibraryBig,
        },
        {
          to: "/app/supply-chain",
          label: "مراقبة سلسلة التوريد",
          text: "متابعة طلبات التوريد والشحنات والمستودعات والمندوبين.",
          icon: Warehouse,
        },
      ],
    },
  },
};

/*
|--------------------------------------------------------------------------
| ترتيب أولوية الأدوار
|--------------------------------------------------------------------------
*/
const rolePriority = [
  "Admin",
  "Warehouse",
  "Representative",
  "Pharmacy",
  "Organization",
  "User",
];

/*
|--------------------------------------------------------------------------
| توحيد أسماء الأدوار
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| التحقق من امتلاك دور
|--------------------------------------------------------------------------
*/
export const hasRole = (roles, expectedRole) =>
  normalizeRoles(roles).includes(expectedRole);

/*
|--------------------------------------------------------------------------
| الحصول على الدور الأساسي
|--------------------------------------------------------------------------
*/
export const getPrimaryRole = (roles) =>
  rolePriority.find((role) => normalizeRoles(roles).includes(role)) || "User";

/*
|--------------------------------------------------------------------------
| الحصول على إعدادات الدور
|--------------------------------------------------------------------------
*/
export const getRoleDefinition = (role) =>
  roleDefinitions[normalizeRoles(role)[0]] ?? roleDefinitions.User;

/*
|--------------------------------------------------------------------------
| الحصول على تعريفات التسجيل حسب اللغة
|--------------------------------------------------------------------------
| اللغة المقبولة:
| ar
| en
| tr
|
| كما تدعم القيم:
| ar-SA
| en-US
| tr-TR
|--------------------------------------------------------------------------
*/
export function getRegistrationDefinitions(language = "ar") {
  const normalizedLanguage = normalizeLanguage(language);

  return Object.fromEntries(
    Object.values(roleDefinitions)
      .filter((role) => Boolean(role.registration))
      .map((role) => {
        const registration = role.registration;

        const localizedSteps = Array.isArray(registration.steps)
          ? registration.steps.map((step) => ({
              ...step,

              title: getLocalizedValue(step.title, normalizedLanguage),

              description: getLocalizedValue(
                step.description,
                normalizedLanguage,
              ),
            }))
          : [];

        return [
          registration.type,

          {
            ...registration,

            role: role.key,

            title: getLocalizedValue(registration.title, normalizedLanguage),

            subtitle: getLocalizedValue(
              registration.subtitle,
              normalizedLanguage,
            ),

            text: getLocalizedValue(registration.text, normalizedLanguage),

            steps: localizedSteps,
          },
        ];
      }),
  );
}

export const registrationDefinitions = getRegistrationDefinitions("ar");

/*
|--------------------------------------------------------------------------
| تصدير جميع تعريفات الأدوار
|--------------------------------------------------------------------------
*/
export { roleDefinitions };
