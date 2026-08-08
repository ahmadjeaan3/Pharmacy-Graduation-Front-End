import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";

import {
  Building2,
  UserRound,
  Warehouse,
} from "lucide-react";

const ASSETS = {
  logo: "/assets/app/brand/logo.png",
  hero: "/assets/app/home/hero.png",
  servicesPhoto: "/assets/app/auth/servicesPhoto.png",
  security: "/assets/app/home/security.png",
  cta: "/assets/app/home/cta.png",

  sparkle: "/assets/app/home/icons/Sparkle.png",
  arrowWhite: "/assets/app/home/icons/Diagonal Right Up Arrow.png",
  arrowTeal: "/assets/app/home/icons/chevron-down.svg",
  verified: "/assets/app/home/icons/verified.png",
  quickSearch: "/assets/app/home/icons/Clock-orange.png",
  fastAccess: "/assets/app/home/icons/Clock.png",
  accuracy: "/assets/app/home/icons/MagnifyingGlassPlus.png",
  smartChoice: "/assets/app/home/icons/MagicWand.png",
  updatedInfo: "/assets/app/home/icons/ArrowsClockwise.png",
  Diagonal: "/assets/app/home/icons/Diagonal.png",

  user: "/assets/app/home/icons/user.png",
  pharmacy: "/assets/app/home/icons/pharmacy.png",
  organization: "/assets/app/home/icons/organization.png",
  admin: "/assets/app/home/icons/admin.png",

  medicineSearch: "/assets/app/home/icons/medicine-search.png",
  choosePharmacy: "/assets/app/home/icons/choose-pharmacy.png",
  donation: "/assets/app/home/icons/donation.png",

  lock: "/assets/app/home/icons/lock.png",
  shield: "/assets/app/home/icons/shield.png",
  transparency: "/assets/app/home/icons/transparency.png",

  star: "/assets/app/home/icons/star.png",
  quote: "/assets/app/home/icons/quote.png",

  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

const features = [
  {
    image: ASSETS.fastAccess,
    title: "وصول سريع",
    text: "ابحث عن دوائك بسرعة",
  },
  {
    image: ASSETS.accuracy,
    title: "دقة عالية",
    text: "نحدد أقرب الصيدليات إليك بدقة",
  },
  {
    image: ASSETS.smartChoice,
    title: "اختيار ذكي",
    text: "نرشح أفضل الصيدليات حسب احتياجك",
  },
  {
    image: ASSETS.updatedInfo,
    title: "معلومات محدثة",
    text: "بيانات الصيدليات تحدث باستمرار",
  },
];

const roles = [
  {
    number: "01",
    type: "user",
    icon: UserRound,
    title: "مستخدم",
    text: "يبحث عن الأدوية بسهولة ويحدد أقرب الصيدليات المتوفرة حسب موقعه",
    active: true,
    iconBackground:
      "bg-[linear-gradient(180deg,rgba(33,100,116,0.12)_0%,rgba(33,100,116,0.03)_100%)]",
  },
  {
    number: "02",
    type: "pharmacy",
    image: ASSETS.pharmacy,
    title: "صيدلية",
    text: "تعرض معلومات الصيدلية والأدوية والمتوفر لتظهر للمستخدمين بطريقة دقيقة",
    active: false,
    iconBackground:
      "bg-[linear-gradient(180deg,rgba(249,209,45,0.1452)_0%,rgba(251,244,177,0)_100%)]",
  },
  {
    number: "03",
    type: "organization",
    image: ASSETS.organization,
    title: "المنظمات",
    text: "تدير الطلبات بشكل واضح وتتابع احتياجات المستخدمين لضمان أفضل تجربة",
    active: false,
    iconBackground:
      "bg-[linear-gradient(180deg,rgba(255,234,204,0.66)_0%,rgba(255,243,226,0)_100%)]",
  },
  {
    number: "04",
    type: "warehouse",
    icon: Warehouse,
    title: "مستودع أدوية",
    text: "يدير مخزون الأدوية ويستقبل طلبات الصيدليات ويتابع عمليات التوريد والتوصيل بين المستودعات والصيدليات.",
    active: false,
    iconBackground:
      "bg-[linear-gradient(180deg,rgba(91,141,239,0.16)_0%,rgba(219,231,255,0)_100%)]",
  },
];

const services = [
  {
    number: "01",
    icon: "search",
    title: "ابحث عن دوائك",
    text: "اكتب اسم الدواء وشاهد توفره وأسعاره في الصيدليات القريبة منك.",
  },
  {
    number: "02",
    icon: "pharmacy",
    title: "اختر الصيدلية",
    text: "قارن المسافة وحالة العمل والتقييم، ثم اختر الأنسب خلال ثوانٍ.",
  },
  {
    number: "03",
    icon: "heart",
    title: "شارك في العطاء",
    text: "استعرض حملات المنظمات المعتمدة وقدّم عروض التبرع أو طلبات المساعدة.",
  },
];

const testimonials = [
  {
    name: "لارا مراد",
    role: "مستخدمة",
    image: "/assets/app/home/user-1.png",
    rating: 5,
    text: "تطبيق رائع وسهل الاستخدام، قدرت ألاقي دوائي وأقرب صيدلية خلال ثوانٍ، ووفر علي وقت وجهد كبير.",
  },
  {
    name: "عمر شيرو",
    role: "مستخدم",
    image: "/assets/app/home/user-2.png",
    rating: 4,
    text: "البحث سريع والنتائج واضحة، وأكثر شيء أعجبني معرفة الصيدليات الأقرب بحسب موقعي مباشرة.",
  },
  {
    name: "نور موفق",
    role: "مستخدمة",
    image: "/assets/app/home/user-3.png",
    rating: 5,
    text: "واجهة مرتبة وسهلة، ووصلت إلى الدواء المطلوب بدون اتصالات كثيرة أو بحث طويل بين الصيدليات.",
  },
  {
    name: "سارة محمود",
    role: "مستخدمة",
    image: "/assets/app/home/user-1.png",
    rating: 5,
    text: "وفرت المنصة علي وقتًا كبيرًا، وعرفت الصيدلية التي يتوفر فيها الدواء قبل أن أخرج من المنزل.",
  },
  {
    name: "أحمد خالد",
    role: "مستخدم",
    image: "/assets/app/home/user-2.png",
    rating: 4,
    text: "تجربة ممتازة، خصوصًا عرض المسافة والمعلومات المهمة بطريقة بسيطة ومفهومة.",
  },
  {
    name: "ريم حسن",
    role: "مستخدمة",
    image: "/assets/app/home/user-3.png",
    rating: 5,
    text: "استخدمت المنصة أكثر من مرة وكانت النتائج دقيقة، والتصميم مريح جدًا أثناء الاستخدام.",
  },
  {
    name: "محمد علي",
    role: "مستخدم",
    image: "/assets/app/home/user-1.png",
    rating: 5,
    text: "خدمة مفيدة فعلًا، ساعدتني في الوصول إلى أقرب صيدلية متوفر فيها الدواء بسرعة.",
  },
  {
    name: "جنى يوسف",
    role: "مستخدمة",
    image: "/assets/app/home/user-2.png",
    rating: 4,
    text: "أعجبتني سهولة التنقل بين النتائج ووضوح بيانات الصيدلية والدواء.",
  },
  {
    name: "سامر إبراهيم",
    role: "مستخدم",
    image: "/assets/app/home/user-3.png",
    rating: 5,
    text: "منصة منظمة وسريعة، وأصبحت أول خيار أستخدمه عندما أبحث عن دواء قريب مني.",
  },
];

const securityFeatures = [
  {
    image: ASSETS.lock,
    title: "خصوصية كاملة",
    text: "بياناتك بأمان",
  },
  {
    image: ASSETS.shield,
    title: "حماية متقدمة",
    text: "نستخدم أحدث التقنيات",
  },
  {
    image: ASSETS.transparency,
    title: "شفافية مطلقة",
    text: "وضوح كامل باستخدام بياناتك",
  },
];

const socialLinks = [
  {
    label: "واتساب",
    href: "#",
    image: ASSETS.whatsapp,
  },
  {
    label: "فيسبوك",
    href: "#",
    image: ASSETS.facebook,
  },
  {
    label: "البريد الإلكتروني",
    href: "mailto:info@medicallife.com",
    image: ASSETS.email,
  },
  {
    label: "إنستغرام",
    href: "#",
    image: ASSETS.instagram,
  },
];

function ImageIcon({
  src,
  alt = "",
  className = "h-6 w-6",
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-contain`}
    />
  );
}

function Logo() {
  return (
    <Link
      to="/"
      className="flex h-[59.79px] w-[62px] shrink-0 items-center justify-center"
    >
      <img
        src={ASSETS.logo}
        alt="Medical Life"
        className="h-[55px] w-[55px] object-contain"
      />
    </Link>
  );
}

function SectionHeading({
  label,
  title,
  text,
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-[650px] text-center">
      {label ? (
        <span className="inline-flex items-center gap-2 rounded-[30px] bg-[#EAF6F8] px-4 py-2 text-[13px] font-medium text-[#216474]">
          <ImageIcon
            src={ASSETS.sparkle}
            className="h-4 w-4"
          />

          {t(label)}
        </span>
      ) : null}

      <div className="mt-4 flex items-center justify-center gap-[58px]">
        <span className="h-[3px] w-[69px] rounded-lg bg-gradient-to-l from-[#EEB73A] to-white" />

        <h2 className="text-[32px] font-medium leading-8 text-[#333333]">
          {t(title)}
        </h2>

        <span className="h-[3px] w-[69px] rounded-lg bg-gradient-to-r from-[#EEB73A] to-white" />
      </div>

      {text ? (
        <p className="mt-5 text-[18px] font-normal leading-[29px] text-[#A5A5A5]">
          {t(text)}
        </p>
      ) : null}
    </div>
  );
}

function ServiceIcon({ type }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (type === "search") {
    return (
      <svg {...commonProps}>
        <circle
          cx="10.8"
          cy="10.8"
          r="6.3"
          stroke="#E6F3F6"
          strokeWidth="1.8"
        />

        <path
          d="M15.5 15.5L20 20"
          stroke="#E6F3F6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "pharmacy") {
    return (
      <svg {...commonProps}>
        <path
          d="M12 3V21"
          stroke="#E6F3F6"
          strokeWidth="1.7"
          strokeLinecap="round"
        />

        <path
          d="M8.2 6.2C8.2 4.9 9.3 4 10.7 4H14.2C15.4 4 16.4 4.8 16.4 5.9C16.4 7.1 15.5 7.8 14.3 8.2L10.1 9.5C8.9 9.9 8.1 10.7 8.1 11.8C8.1 13 9.1 13.8 10.4 13.8H14.1C15.4 13.8 16.4 14.7 16.4 15.9C16.4 17 15.5 17.9 14.2 17.9H10.1"
          stroke="#E6F3F6"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M7 7.2L17 16.8"
          stroke="#E6F3F6"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path
        d="M20.2 5.9C18.4 4.1 15.4 4.1 13.6 5.9L12 7.5L10.4 5.9C8.6 4.1 5.6 4.1 3.8 5.9C2 7.7 2 10.7 3.8 12.5L12 20L20.2 12.5C22 10.7 22 7.7 20.2 5.9Z"
        stroke="#E6F3F6"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage =
    normalizeLanguage(
      i18n.resolvedLanguage ||
        i18n.language ||
        "ar",
    );

  const isArabic =
    currentLanguage === "ar";

  const isTurkish =
    currentLanguage === "tr";

  const textDirection =
    getLanguageDirection(
      currentLanguage,
    );

  const textAlignClass =
    isArabic
      ? "text-right"
      : "text-left";

  const itemsAlignClass =
    isArabic
      ? "items-end"
      : "items-start";
  const [scrollProgress, setScrollProgress] =
    useState(0);

  useEffect(() => {
  const updateScrollProgress = () => {
    const page =
      document.documentElement;

    const scrollableHeight =
      page.scrollHeight -
      page.clientHeight;

    const progress =
      scrollableHeight > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (page.scrollTop /
                scrollableHeight) *
                100,
            ),
          )
        : 0;

    setScrollProgress(progress);
  };

  updateScrollProgress();

  window.addEventListener(
    "scroll",
    updateScrollProgress,
    {
      passive: true,
    },
  );

  window.addEventListener(
    "resize",
    updateScrollProgress,
  );

  return () => {
    window.removeEventListener(
      "scroll",
      updateScrollProgress,
    );

    window.removeEventListener(
      "resize",
      updateScrollProgress,
    );
  };
}, []);

const cardsPerPage = 3;

const totalTestimonialPages =
  Math.ceil(
    testimonials.length /
      cardsPerPage,
  );

const [
  testimonialPage,
  setTestimonialPage,
] = useState(0);

  const visibleTestimonials =
    useMemo(() => {
      const startIndex =
        testimonialPage *
        cardsPerPage;

      return Array.from(
        {
          length: cardsPerPage,
        },
        (_, offset) => {
          return testimonials[
            (startIndex + offset) %
              testimonials.length
          ];
        },
      );
    }, [testimonialPage]);

  const showPreviousTestimonials =
    () => {
      setTestimonialPage(
        (currentPage) =>
          currentPage === 0
            ? totalTestimonialPages - 1
            : currentPage - 1,
      );
    };

  const showNextTestimonials =
    () => {
      setTestimonialPage(
        (currentPage) =>
          currentPage ===
          totalTestimonialPages - 1
            ? 0
            : currentPage + 1,
      );
    };

  const goToTestimonialPage =
    (pageIndex) => {
      setTestimonialPage(pageIndex);
    };
      return (
    <div
      dir={textDirection}
      lang={currentLanguage}
      className="min-h-screen overflow-x-hidden bg-[#F8FAFC] font-['IBM_Plex_Sans_Arabic'] text-[#333333]"
    >
      <style>{`
        @keyframes ml-fade-up {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ml-fade-right {
          from {
            opacity: 0;
            transform: translateX(26px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes ml-fade-left {
          from {
            opacity: 0;
            transform: translateX(-26px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes ml-float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes ml-float-soft {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-5px) rotate(0.25deg);
          }
        }

        @keyframes ml-float-soft-reverse {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(5px) rotate(-0.25deg);
          }
        }

        @keyframes ml-glow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.72;
          }

          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        .ml-navbar-enter {
          animation: ml-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .ml-hero-image-enter {
          animation:
            ml-fade-left 0.7s cubic-bezier(0.22, 1, 0.36, 1) both,
            ml-float 5.5s ease-in-out 0.8s infinite;
        }

        .ml-hero-copy-enter {
          animation: ml-fade-right 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .ml-floating-card-one {
          animation: ml-float-soft 4.4s ease-in-out 0.4s infinite;
        }

        .ml-floating-card-two {
          animation: ml-float-soft-reverse 4.8s ease-in-out 0.9s infinite;
        }

        .ml-glow-blue {
          animation: ml-glow 8s ease-in-out infinite;
        }

        .ml-glow-yellow {
          animation: ml-glow 9s ease-in-out 0.8s infinite;
        }

        .ml-card {
          transition:
            transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .ml-card:hover {
          transform: translateY(-7px);
          border-color: rgba(33, 100, 116, 0.25);
          box-shadow: 0 18px 40px rgba(33, 100, 116, 0.1);
        }

        .ml-card-icon {
          transition:
            transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.3s ease,
            filter 0.3s ease;
        }

        .ml-card:hover .ml-card-icon {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 18px rgba(33, 100, 116, 0.1);
          filter: brightness(1.02);
        }

        .ml-button {
          transition:
            transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.25s ease,
            background-color 0.25s ease;
        }

        .ml-button:hover {
          transform: translateY(-3px);
        }

        .ml-button:active {
          transform: translateY(0) scale(0.98);
        }

        .ml-nav-link {
          position: relative;
          transition: color 0.25s ease;
        }

        .ml-nav-link::after {
          content: "";
          position: absolute;
          right: 0;
          bottom: -6px;
          width: 0;
          height: 2px;
          border-radius: 999px;
          background: #dfae0d;
          transition: width 0.25s ease;
        }

        .ml-nav-link:hover::after {
          width: 100%;
        }

        html {
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #2a7380 #edf4f4;
        }

        body::-webkit-scrollbar {
          width: 11px;
        }

        body::-webkit-scrollbar-track {
          background: linear-gradient(
            180deg,
            #f5f9f9 0%,
            #eaf2f2 100%
          );
        }

        body::-webkit-scrollbar-thumb {
          min-height: 70px;
          border: 3px solid #edf4f4;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            #216474 0%,
            #2f7f8d 58%,
            #dfae0d 100%
          );
          background-clip: padding-box;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
        }

        body::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            #174b57 0%,
            #216474 58%,
            #c99a08 100%
          );
          background-clip: padding-box;
        }

        .ml-scroll-progress {
          position: absolute;
          right: 0;
          bottom: -1px;
          height: 3px;
          border-radius: 999px 0 0 999px;
          background: linear-gradient(
            90deg,
            #dfae0d 0%,
            #f1c94f 32%,
            #216474 100%
          );
          box-shadow: 0 1px 8px rgba(33, 100, 116, 0.28);
          transition: width 0.08s linear;
        }

        .ml-safe-text {
          overflow-wrap: anywhere;
          word-break: normal;
          hyphens: auto;
        }

        @media (max-width: 1100px) {
          .ml-desktop-nav {
            gap: 1rem;
            font-size: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ml-navbar-enter,
          .ml-hero-image-enter,
          .ml-hero-copy-enter,
          .ml-floating-card-one,
          .ml-floating-card-two,
          .ml-glow-blue,
          .ml-glow-yellow {
            animation: none !important;
          }

          .ml-card,
          .ml-card-icon,
          .ml-button,
          .ml-nav-link::after {
            transition: none !important;
          }
        }
      `}</style>

      {/* Navbar */}
      <header className="ml-navbar-enter sticky top-0 z-50 h-[72px] border-b border-[rgba(102,102,102,0.16)] bg-white/95 shadow-[0_5px_24px_rgba(23,75,87,.04)] backdrop-blur-xl">
        <div
          dir="ltr"
          className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-5 xl:px-0"
        >
          <div
            dir={textDirection}
            className="flex h-10 shrink-0 items-center gap-3"
          >
            <LanguageSwitcher />

            <Link
              to="/login"
              className="ml-button flex h-10 w-[124px] items-center justify-center rounded-lg border border-[#216474] bg-white text-[16px] font-medium leading-6 text-[#216474] hover:shadow-sm"
            >
              {t("تسجيل دخول")}
            </Link>

            <Link
              to="/register"
              className="ml-button flex h-10 w-[124px] items-center justify-center rounded-lg bg-[#174B57] text-[16px] font-medium leading-6 text-white hover:bg-[#123F49] hover:shadow-md"
            >
              {t("إنشاء حساب")}
            </Link>
          </div>

          <nav
            dir={textDirection}
            className="ml-desktop-nav hidden h-[32px] min-w-0 items-center gap-7 whitespace-nowrap text-[16px] leading-6 text-[#666666] lg:flex xl:gap-8"
          >
            <a
              href="#home"
              className="flex h-[32px] shrink-0 flex-col items-center font-medium text-[#216474]"
            >
              <span className="h-[27px] whitespace-nowrap text-[17px] leading-[27px]">
                {t("الرئيسية")}
              </span>

              <span className="w-full border-t-2 border-[#DFAE0D]" />
            </a>

            <a
              href="#features"
              className="transition-colors duration-300 hover:text-[#216474]"
            >
              {t("الخدمات")}
            </a>

            <a
              href="#roles"
              className="transition-colors duration-300 hover:text-[#216474]"
            >
              {t("كيف يعمل")}
            </a>

            <a
              href="#testimonials"
              className="transition-colors duration-300 hover:text-[#216474]"
            >
              {t("المستخدمون")}
            </a>

            <a
              href="#footer"
              className="transition-colors duration-300 hover:text-[#216474]"
            >
              {t("تواصل معنا")}
            </a>
          </nav>

          <Logo />
        </div>

        <span
          aria-hidden="true"
          className="ml-scroll-progress"
          style={{
            width: `${scrollProgress}%`,
          }}
        />
      </header>

      <main>
        {/* Hero */}
        <section
          id="home"
          className="relative overflow-hidden bg-[#F8FAFC] pb-[44px] pt-[44px]"
        >
          <div className="ml-glow-blue pointer-events-none absolute -right-[205px] -top-[145px] h-[496px] w-[448px] rounded-full bg-[rgba(21,142,171,0.18)] blur-[150px]" />

          <div className="ml-glow-yellow pointer-events-none absolute -left-[125px] top-[255px] h-[418px] w-[375px] rounded-full bg-[rgba(254,226,82,0.20)] blur-[150px]" />

          <div className="relative mx-auto flex min-h-[622px] w-full max-w-[1200px] flex-col gap-[44px] px-5 xl:px-0">
            <div
              dir="ltr"
              className={`relative flex min-h-[411px] w-full items-center justify-between ${
                isArabic
                  ? "flex-row gap-[36px]"
                  : "flex-row-reverse gap-[90px]"
              }`}
            >
              {/* Hero image */}
              <div className="relative z-0 h-[411px] w-[445px] shrink-0">
                <img
                  src={ASSETS.hero}
                  alt={t("البحث عن الأدوية والصيدليات")}
                  className="ml-hero-image-enter h-[411px] w-[445px] object-contain"
                />

                {/* Registered pharmacies card */}
                <div
                  dir="ltr"
                  className={`ml-floating-card-one ml-40 absolute top-[88px] z-20 hidden min-h-[74px] w-[238px] items-center justify-between gap-3 rounded-xl border border-[#216474]/10 bg-white px-5 py-3 shadow-[0_8px_24px_rgba(33,100,116,0.14)] lg:flex ${
                    isArabic
                      ? "left-[175px] flex-row-reverse"
                      : "right-[175px] flex-row"
                  }`}
                >
                  {/* Icon */}
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#DDEEEE] text-[#174B57] shadow-[0_4px_12px_rgba(33,100,116,0.12)]">
                    <Building2
                      size={22}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>

                  {/* Text */}
                  <div
                    dir={textDirection}
                    className={`flex min-h-[44px] min-w-0 flex-1 flex-col justify-center  gap-1 ${
                      isArabic
                        ? "items-end text-right"
                        : "items-start text-left"
                    }`}
                  >
                    <strong className="w-full overflow-hidden text-[15px] font-semibold leading-5 text-[#333333]">
                      {t("صيدليات مسجلة")}
                    </strong>

                    <small className="w-full overflow-hidden text-[11px] font-normal leading-4 tracking-[0.01em] text-[#7E8E92]">
                      {t("بيانات الصيدلية والدواء")}
                    </small>
                  </div>
                </div>

                {/* Quick search card */}
                <div
                  dir="ltr"
                  className={`ml-floating-card-two absolute top-[345px] z-30 hidden min-h-[72px] w-[230px] items-center justify-between gap-3 rounded-xl border border-[#DFAE0D]/10 bg-white px-5 py-3 shadow-[0_8px_24px_rgba(136,136,136,0.18)] lg:flex ${
                    isArabic
                      ? "left-[-20px] flex-row-reverse"
                      : "right-[-20px] flex-row"
                  }`}
                >
                  {/* Icon */}
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[rgba(251,244,177,0.32)]">
                    <ImageIcon
                      src={ASSETS.quickSearch}
                      alt=""
                      className="h-5 w-5"
                    />
                  </span>

                  {/* Text */}
                  <div
                    dir={textDirection}
                    className={`flex min-h-[42px] min-w-0 flex-1 flex-col justify-center gap-1 ${
                      isArabic
                        ? "items-end text-right"
                        : "items-start text-left"
                    }`}
                  >
                    <strong className="w-full text-[15px] font-medium leading-5 text-[#333333]">
                      {t("بحث سريع")}
                    </strong>

                    <small className="w-full text-[11px] font-normal leading-4 tracking-[0.01em] text-[#A5A5A5]">
                      {t("وصول إلى أقرب صيدلية")}
                    </small>
                  </div>
                </div>
              </div>

              {/* Hero content */}
              <div
                className={`ml-hero-copy-enter z-10 flex min-h-[268px] w-[646px] shrink-0 flex-col gap-8 ${itemsAlignClass} ${textAlignClass}`}
              >
                <div
                  className={`flex w-[646px] flex-col gap-7 ${itemsAlignClass}`}
                >
                  <div
                    className={`flex w-[646px] flex-col gap-4 ${itemsAlignClass}`}
                  >
                    <div
                      dir={textDirection}
                      className={`inline-flex min-h-10 min-w-[228px] max-w-[340px] items-center justify-center gap-2 rounded-[34px] bg-white px-5 py-2 ${
                        isArabic
                          ? "flex-row"
                          : "flex-row"
                      }`}
                    >
                      {isArabic ? (
                        <>
                          <span
                            className={`min-w-0 text-[15px] font-normal leading-6 text-[#444444] ${textAlignClass}`}
                          >
                            {t("حل ذكي للعثور على الأدوية")}
                          </span>

                          <ImageIcon
                            src={ASSETS.sparkle}
                            className="h-5 w-5"
                          />
                        </>
                      ) : (
                        <>
                          <ImageIcon
                            src={ASSETS.sparkle}
                            className="h-5 w-5"
                          />

                          <span
                            className={`min-w-0 text-[15px] font-normal leading-6 text-[#444444] ${textAlignClass}`}
                          >
                            {t("حل ذكي للعثور على الأدوية")}
                          </span>
                        </>
                      )}
                    </div>

                    <h1
                      dir={textDirection}
                      className={`w-full break-words text-[44px] font-medium leading-[1.25] text-[#333333] xl:text-[48px] ${textAlignClass}`}
                    >
                      {isTurkish ? (
                        <>
                          <span>{t("دواؤك...")}</span>{" "}
                          <span>{t("مما تتوقع")}</span>{" "}
                          <span className="text-[#DFAE0D]">
                            {t("أقرب")}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>{t("دواؤك...")}</span>{" "}
                          <span className="text-[#DFAE0D]">
                            {t("أقرب")}
                          </span>{" "}
                          <span>{t("مما تتوقع")}</span>
                        </>
                      )}
                    </h1>
                  </div>

                  <p
                    dir={textDirection}
                    className={`w-full break-words text-[16px] font-normal leading-7 text-[#666666] ${textAlignClass}`}
                  >
                    {t(
                      "نساعدك في العثور على الأدوية المتوفرة في الصيدليات القريبة منك بسرعة ودقة عالية",
                    )}
                  </p>
                </div>

                {/* Hero buttons */}
                <div
                  dir={textDirection}
                  className="flex min-h-[58px] w-auto flex-wrap items-center gap-3"
                >
                <a
  href="#roles"
  dir="ltr"
  className={`ml-button inline-flex h-[58px] w-[180px] items-center justify-center gap-2 rounded-lg border border-[#216474] bg-transparent text-[20px] font-medium leading-[30px] text-[#216474] hover:bg-white hover:shadow-[0_12px_28px_rgba(33,100,116,0.12)] ${
    isArabic ? "flex-row-reverse" : "flex-row"
  }`}
>
  <span dir={textDirection}>
    {t("كيف يعمل")}
  </span>

  <ImageIcon
    src={ASSETS.arrowTeal}
    className={`h-6 w-6 transition-transform duration-300 ${
      isArabic ? "" : "rotate-180"
    }`}
  />
</a>

<Link
  to="/register"
  dir="ltr"
  className={`ml-button inline-flex h-[58px] w-[180px] items-center justify-center gap-2 rounded-lg bg-[#174B57] text-[20px] font-medium leading-[30px] text-white hover:bg-[#123F49] hover:shadow-[0_14px_30px_rgba(23,75,87,0.25)] ${
    isArabic ? "flex-row-reverse" : "flex-row"
  }`}
>
  <span dir={textDirection}>
    {t("ابدأ تجربتك")}
  </span>

  <ImageIcon
    src={ASSETS.Diagonal}
    className={`h-6 w-6 transition-transform duration-300 ${
      isArabic ? "" : "rotate-100"
    }`}
  />
</Link>
                </div>
              </div>
            </div>

            {/* Features */}
            <section
              id="features"
              className="relative bg-[#F8FAFC] pb-[56px]"
            >
              <div className="mx-auto w-full max-w-[1200px] px-5 xl:px-0">
                <div
                  dir="ltr"
                  className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {features.map(
                    ({
                      image,
                      title,
                      text,
                    }) => (
                      <article
                        key={title}
                        dir={textDirection}
                        className="ml-card flex min-h-[190px] w-full flex-col items-center justify-center gap-6 rounded-xl border border-[rgba(102,102,102,0.16)] bg-white px-4 py-6"
                      >
                        <span className="ml-card-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#E6F3F6]">
                          <ImageIcon
                            src={image}
                            alt={t(title)}
                            className="h-6 w-6"
                          />
                        </span>

                        <div className="flex min-h-[76px] w-full flex-col items-center justify-center gap-3">
                          <h3 className="text-center text-[20px] font-medium leading-5 text-[#333333]">
                            {t(title)}
                          </h3>

                          <p className="line-clamp-3 min-h-[52px] text-center text-[16px] font-normal leading-[26px] tracking-[0.01em] text-[#A5A5A5]">
                            {t(text)}
                          </p>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
                {/* Roles */}
       {/* Roles */}
<section
  id="roles"
  className="bg-[#F8FAFC] pb-[100px] pt-[56px]"
>
  <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-[44px] px-5 xl:px-0">
    {/* Section heading */}
    <div className="flex min-h-[68px] w-full flex-col items-center gap-5">
      <div
        dir="ltr"
        className="flex h-[30px] w-full max-w-[526px] items-center justify-center gap-[58px]"
      >
        <span className="h-[3px] min-w-0 flex-1 rounded-lg bg-gradient-to-r from-white to-[#EEB73A]" />

        <h2
          dir={textDirection}
          className="shrink-0 whitespace-nowrap text-center text-[32px] font-medium leading-none text-[#333333]"
        >
          {t("تجربة مصممة لكل دور")}
        </h2>

        <span className="h-[3px] min-w-0 flex-1 rounded-lg bg-gradient-to-l from-white to-[#EEB73A]" />
      </div>

      <p className="max-w-[650px] text-center text-[18px] font-normal leading-[29px] text-[#A5A5A5]">
        {t(
          "نظامنا مصمم لأربع فئات رئيسية تعمل معاً لتوفير تجربة سهلة وفعالة.",
        )}
      </p>
    </div>

    {/* Roles cards */}
    <div
      dir={textDirection}
      className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {roles.map(
        ({
          number,
          type,
          image,
          icon: Icon,
          title,
          text,
          iconBackground,
        }) => (
          <article
            key={number}
            dir={textDirection}
            className="ml-card flex min-h-[270px] w-full flex-col rounded-2xl border border-[rgba(102,102,102,0.16)] bg-white px-6 pb-8 pt-7"
          >
            <div className="flex h-full w-full flex-1 flex-col">
              {/* Icon and number */}
              <div
                dir="ltr"
                className="flex h-10 w-full shrink-0 items-start justify-between"
              >
                {/* Number - always left */}
                <span
                  dir="ltr"
                  className="block min-w-[46px] text-left text-[38px] font-bold leading-[38px] text-transparent"
                  style={{
                    background:
                      "linear-gradient(180deg, #E6F3F6 0%, rgba(230,243,246,0.12) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {number}
                </span>

                {/* Icon - always right */}
                <span
                  className={`ml-card-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg ${iconBackground}`}
                >
                  {Icon ? (
                    <Icon
                      size={24}
                      strokeWidth={2}
                      className="text-[#216474]"
                    />
                  ) : (
                    <ImageIcon
                      src={image}
                      alt={t(title)}
                      className="h-6 w-6"
                    />
                  )}
                </span>
              </div>

              {/* Content */}
              <div
                className={`mt-[14px] flex w-full flex-1 flex-col gap-4 ${
                  isArabic ? "items-end" : "items-start"
                }`}
              >
                <h3
                  dir={textDirection}
                  className={`w-full text-[20px] font-medium leading-6 tracking-[0.04em] text-[#333333] ${textAlignClass}`}
                >
                  {t(title)}
                </h3>

                <p
                  dir={textDirection}
                  className={`w-full flex-1 text-[14px] font-normal leading-[23px] tracking-[0.01em] text-[#666666] ${textAlignClass}`}
                >
                  {t(text)}
                </p>
              </div>

              {/* Register button */}
              <Link
                to={`/register?type=${type}`}
                dir="ltr"
                className="mt-[18px] flex h-11 w-full shrink-0 items-center justify-center gap-3 rounded-lg border border-[rgba(102,102,102,0.16)] bg-white text-[16px] font-medium leading-[30px] text-[#A5A5A5] transition-all duration-300 hover:border-[#174B57] hover:bg-[#174B57] hover:text-white hover:shadow-md"
              >
                {isArabic ? (
                  <>
                    {/* Arabic: icon left, text right */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0"
                    >
                      <path
                        d="M14.5 6.5L9 12l5.5 5.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span dir="rtl">
                      {t("ابدأ الآن")}
                    </span>
                  </>
                ) : (
                  <>
                    {/* English/Turkish: text left, icon right */}
                    <span dir="ltr">
                      {t("ابدأ الآن")}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0"
                    >
                      <path
                        d="M9.5 6.5L15 12l-5.5 5.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </Link>
            </div>
          </article>
        ),
      )}
    </div>
  </div>
</section>

        {/* Services */}
      {/* Services */}
<section
  id="services"
  className="relative isolate w-full overflow-hidden bg-[#163A42]"
>
  {/* Desktop */}
  <div className="relative hidden h-[477px] w-full overflow-hidden lg:block">
    {/* Background glow */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[1123px] top-[-201.66px] z-0 h-[496px] w-[448px] -rotate-90 bg-[rgba(118,229,255,0.18)] blur-[150px]"
    />

    {/* Section image */}
    <img
      src={ASSETS.servicesPhoto}
      alt={t("خدمات المنصة")}
      className="absolute left-0 top-0 z-10 h-[477px] w-auto max-w-none object-contain object-left"
    />

    {/* Services content */}
    <div
      dir={textDirection}
      className="absolute right-[120px] top-1/2 z-20 mr-40 flex h-[340px] w-[489px] -translate-y-1/2 flex-col items-start gap-5"
    >
      {/* Heading */}
      <div
        className={`flex h-7 w-[180px] flex-col justify-center gap-[5px] ${
          isArabic ? "items-end" : "items-start"
        }`}
      >
        <h2
          dir={textDirection}
          className={`flex h-5 w-full items-center whitespace-nowrap text-[20px] font-medium leading-5 text-white ${
            isArabic
              ? "justify-start text-right"
              : "justify-start text-left"
          }`}
        >
          {t("خدمات المنصة")}
        </h2>

        <span
          className={`h-[3px] w-full rounded-lg ${
            isArabic
              ? "bg-[linear-gradient(90deg,rgba(22,58,66,0)_0%,#FEE252_100%)]"
              : "bg-[linear-gradient(270deg,rgba(22,58,66,0)_0%,#FEE252_100%)]"
          }`}
        />
      </div>

      {/* Service cards */}
      <div className="flex h-[283px] w-[489px] flex-col gap-5">
        {services.map(({ number, icon, title, text }) => (
          <article
            key={number}
            dir="ltr"
            className={`flex h-[90px] w-[489px] shrink-0 items-center gap-3 rounded-xl border border-[#174B57] bg-[rgba(255,255,255,0.06)] px-[18px] py-5 ${
              isArabic ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Icon */}
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgba(230,243,246,0.10)]">
              <ServiceIcon type={icon} />
            </span>

            {/* Number */}
            <span
              dir="ltr"
              className="w-7 shrink-0 text-center text-[16px] font-bold leading-5 text-[#DFAE0D]"
            >
              {number}
            </span>

            {/* Text */}
            <div
              dir={textDirection}
              className={`flex min-w-0 flex-1 flex-col justify-center gap-2 ${
                isArabic ? "items-end" : "items-start"
              }`}
            >
              <h3
                className={`line-clamp-1 w-full text-[20px] font-medium leading-6 text-[#E6F3F6] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {t(title)}
              </h3>

              <p
                className={`line-clamp-2 w-full overflow-hidden break-words text-[12px] font-normal leading-[18px] tracking-[0.01em] text-[#D6D6D6] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {t(text)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>

  {/* Mobile and tablet */}
  <div className="relative flex w-full flex-col overflow-hidden bg-[#163A42] lg:hidden">
    {/* Background glow */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-180px] top-[-170px] z-0 h-[420px] w-[380px] bg-[rgba(118,229,255,0.16)] blur-[130px]"
    />

    {/* Section image */}
    <img
      src={ASSETS.servicesPhoto}
      alt={t("خدمات المنصة")}
      className="relative z-10 h-auto w-full object-contain"
    />

    {/* Mobile content */}
    <div
      dir={textDirection}
      className="relative z-20 px-5 py-10 sm:px-8"
    >
      {/* Heading */}
     {/* Heading */}
<div
  dir={textDirection}
  className={`flex w-full flex-col gap-[5px] ${
    isArabic ? "items-end" : "items-start"
  }`}
>
  <h2
    className={`w-full text-[20px] font-medium leading-6 text-white ${
      isArabic ? "text-right" : "text-left"
    }`}
  >
    {t("خدمات المنصة")}
  </h2>

  <span
    className={`h-[3px] w-[156px] rounded-lg ${
      isArabic
        ? "self-end bg-[linear-gradient(90deg,rgba(22,58,66,0)_0%,#FEE252_100%)]"
        : "self-start bg-[linear-gradient(270deg,rgba(22,58,66,0)_0%,#FEE252_100%)]"
    }`}
  />
</div>
      {/* Mobile cards */}
      <div className="mt-7 flex flex-col gap-5">
        {services.map(({ number, icon, title, text }) => (
          <article
            key={number}
            dir="ltr"
            className={`flex min-h-[88px] w-full items-center gap-3 rounded-xl border border-[#174B57] bg-white/[0.06] px-[18px] py-5 ${
              isArabic ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Icon */}
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgba(230,243,246,0.10)]">
              <ServiceIcon type={icon} />
            </span>

            {/* Number */}
            <span
              dir="ltr"
              className="w-7 shrink-0 text-center text-[15px] font-bold leading-5 text-[#DFAE0D]"
            >
              {number}
            </span>

            {/* Text */}
            <div
              dir={textDirection}
              className={`flex min-w-0 flex-1 flex-col justify-center gap-2 ${
                isArabic ? "items-end" : "items-start"
              }`}
            >
              <h3
                className={`w-full text-[18px] font-medium leading-6 text-[#E6F3F6] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {t(title)}
              </h3>

              <p
                className={`w-full text-[12px] leading-5 text-[#D6D6D6] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {t(text)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
</section>
        {/* Testimonials */}
        <section
          id="testimonials"
          className="bg-[#F8FAFC] py-[84px]"
        >
          <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-[44px] px-5 xl:px-0">
            {/* Heading */}
            <div
              dir="ltr"
              className="flex min-h-[68px] w-full items-end justify-center gap-4"
            >
              <button
                type="button"
                onClick={
                  showPreviousTestimonials
                }
                aria-label={t(
                  "عرض الآراء السابقة",
                )}
                className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border border-[rgba(102,102,102,0.16)] bg-white text-[#444444] transition duration-200 hover:border-[#216474] hover:bg-[#F1F8F8] hover:text-[#216474] active:scale-95"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="M10 3L5 8L10 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                dir={textDirection}
                className="flex min-h-[68px] min-w-0 flex-1 flex-col items-center gap-5"
              >
                <div
                  dir="ltr"
                  className="flex h-[30px] w-full max-w-[526px] items-center justify-center gap-[58px]"
                >
                  <span className="h-[3px] min-w-0 flex-1 rounded-lg bg-gradient-to-r from-white to-[#EEB73A]" />

                  <h2
                    dir={textDirection}
                    className="shrink-0 whitespace-nowrap text-center text-[32px] font-medium leading-none text-[#333333]"
                  >
                    {t("آراء المستخدمين")}
                  </h2>

                  <span className="h-[3px] min-w-0 flex-1 rounded-lg bg-gradient-to-l from-white to-[#EEB73A]" />
                </div>

                <p className="max-w-[527px] text-center text-[18px] font-normal leading-[29px] text-[#A5A5A5]">
                  {t(
                    "نفتخر بثقة عملائنا، وهذه بعض آرائهم عن تجربتهم معنا.",
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  showNextTestimonials
                }
                aria-label={t(
                  "عرض الآراء التالية",
                )}
                className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border border-[rgba(102,102,102,0.16)] bg-white text-[#444444] transition duration-200 hover:border-[#216474] hover:bg-[#F1F8F8] hover:text-[#216474] active:scale-95"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Carousel */}
            <div className="flex w-full flex-col items-center gap-8 overflow-hidden">
              <div
                key={testimonialPage}
                dir={textDirection}
                className="grid w-full animate-[ml-fade-up_.38s_ease_both] grid-cols-1 gap-5 md:grid-cols-3"
              >
                {visibleTestimonials.map(
                  (
                    item,
                    cardIndex,
                  ) => (
                    <article
                      key={`${testimonialPage}-${cardIndex}-${item.name}`}
                      dir={textDirection}
                      className={`flex min-h-[300px] w-full flex-col gap-4 rounded-lg border border-[rgba(102,102,102,0.16)] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(33,100,116,0.08)] ${itemsAlignClass}`}
                    >
                      {/* Quote and rating */}
                      <div
                        dir="ltr"
                        className="flex h-8 w-full items-center justify-between gap-[10px]"
                      >
                        <ImageIcon
                          src={
                            ASSETS.quote
                          }
                          alt=""
                          className="h-8 w-8"
                        />

                        <div
                          dir="ltr"
                          className="flex flex-1 items-center justify-end gap-[2px]"
                          aria-label={t(
                            "تقييم {{rating}} من 5",
                            {
                              rating:
                                item.rating,
                            },
                          )}
                        >
                          {Array.from({
                            length: 5,
                          }).map(
                            (
                              _,
                              starIndex,
                            ) => (
                              <svg
                                key={
                                  starIndex
                                }
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                className={[
                                  "h-[13px] w-[13px]",
                                  starIndex <
                                  item.rating
                                    ? "text-[#F59E0B]"
                                    : "text-[rgba(102,102,102,0.16)]",
                                ].join(
                                  " ",
                                )}
                              >
                                <path
                                  fill="currentColor"
                                  d="M12 2.8l2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 16.83l-5.5 2.89 1.05-6.12L3.1 9.27l6.15-.9L12 2.8z"
                                />
                              </svg>
                            ),
                          )}
                        </div>
                      </div>

                      <p
                        dir={
                          textDirection
                        }
                        className={`w-full flex-1 break-words text-[16px] font-normal leading-7 text-[#333333] ${textAlignClass}`}
                      >
                        “{t(item.text)}”
                      </p>

                      {/* User */}
                      <div
                        dir="ltr"
                        className={`mt-auto flex h-12 w-full items-center gap-2 ${
                          isArabic
                            ? "flex-row-reverse justify-end"
                            : "flex-row justify-start"
                        }`}
                      >
                        <img
                          src={
                            item.image
                          }
                          alt={t(
                            item.name,
                          )}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />

                        <div
                          dir={
                            textDirection
                          }
                          className={`flex min-w-0 flex-1 flex-col ${
                            isArabic
                              ? "items-end"
                              : "items-start"
                          }`}
                        >
                          <strong
                            className={`w-full break-words text-[18px] font-medium leading-[25px] text-[#444444] ${textAlignClass}`}
                          >
                            {t(
                              item.name,
                            )}
                          </strong>

                          <small
                            className={`w-full break-words text-[14px] font-normal leading-[21px] text-[#A5A5A5] ${textAlignClass}`}
                          >
                            {t(
                              item.role,
                            )}
                          </small>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>

              {/* Pagination */}
              <div
                dir="ltr"
                className="flex h-[10px] items-center gap-[5px]"
                role="tablist"
                aria-label={t(
                  "صفحات آراء المستخدمين",
                )}
              >
                {Array.from({
                  length:
                    totalTestimonialPages,
                }).map(
                  (
                    _,
                    pageIndex,
                  ) => {
                    const isActive =
                      pageIndex ===
                      testimonialPage;

                    return (
                      <button
                        key={
                          pageIndex
                        }
                        type="button"
                        onClick={() =>
                          goToTestimonialPage(
                            pageIndex,
                          )
                        }
                        aria-label={t(
                          "الانتقال إلى صفحة الآراء {{page}}",
                          {
                            page:
                              pageIndex +
                              1,
                          },
                        )}
                        aria-selected={
                          isActive
                        }
                        role="tab"
                        className={[
                          "h-[10px] rounded-full transition-all duration-300",
                          isActive
                            ? "w-[53.33px] bg-[#216474]"
                            : "w-[10px] bg-[#D6D6D6] hover:bg-[#9DB8BE]",
                        ].join(
                          " ",
                        )}
                      />
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </section>
                {/* Security */}
        <section className="bg-[#F8FAFC] py-[84px]">
          <div className="mx-auto w-full max-w-[1200px] px-5 xl:px-0">
            <div
              dir="ltr"
              className={`flex min-h-[360px] w-full items-center justify-between gap-14 rounded-xl border border-[rgba(102,102,102,0.16)] bg-white px-10 py-10 ${
                isArabic
                  ? "flex-row"
                  : "flex-row-reverse"
              }`}
            >
              {/* Security illustration */}
              <div className="relative mx-auto h-[256px] w-[268px] shrink-0">
                <div className="absolute left-0 top-0 h-[252px] w-[251px] rounded-full border-[1.6px] border-[#E6F3F6]" />

                <div className="absolute left-[18px] top-[17px] h-[217px] w-[216px] rounded-full border-[1.6px] border-[rgba(230,243,246,0.47)]" />

                <span className="absolute left-[40px] top-[17px] h-5 w-5 rounded-full bg-[#E6F3F6]" />

                <span className="absolute left-[-3px] top-[152px] h-3 w-3 rounded-full bg-[#E6F3F6]" />

                <span className="absolute bottom-[-1px] left-[60px] h-5 w-5 rounded-full bg-[#E6F3F6]" />

                <span className="absolute right-[12px] top-[179px] h-4 w-4 rounded-full bg-[#E6F3F6]" />

                <span className="absolute right-[26px] top-[22px] h-3 w-3 rounded-full bg-[#E6F3F6]" />

                <span className="absolute right-[48px] top-0 h-2 w-2 rounded-full bg-[rgba(33,100,116,0.60)]" />

                <span className="absolute bottom-[-4px] left-[36px] h-2 w-2 rounded-full bg-[rgba(33,100,116,0.60)]" />

                <span className="absolute right-[-14px] top-[178px] h-[14px] w-[14px] rounded-full bg-[rgba(33,100,116,0.44)]" />

                <img
                  src={ASSETS.security}
                  alt={t("حماية البيانات")}
                  className="absolute left-0 top-[48px] z-10 h-[168px] w-[252px] object-contain"
                />
              </div>

              {/* Security content */}
              <div
                dir={textDirection}
                className={`mx-auto flex w-full max-w-[700px] shrink-0 flex-col justify-center ${itemsAlignClass}`}
              >
                {/* Badge */}
                <div
                  className={`flex w-full ${
                    isArabic
                      ? "justify-start"
                      : "justify-start"
                  }`}
                >
                  <span
                    dir="ltr"
                    className={`inline-flex min-h-[34px] min-w-[139px] max-w-[200px] items-center justify-center gap-2 rounded-[34px] bg-[#E6F3F6] py-2 pl-4 pr-5 text-[12px] font-normal leading-[18px] text-[#216474] ${
                      isArabic
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <ImageIcon
                      src={ASSETS.sparkle}
                      alt=""
                      className="h-4 w-4"
                    />

                    <span dir={textDirection}>
                      {t("خصوصيتك بأمان")}
                    </span>
                  </span>
                </div>

                <h2
                  dir={textDirection}
                  className={`mt-[18px] w-full break-words text-[34px] font-bold leading-[1.35] text-[#174B57] xl:text-[36px] ${textAlignClass}`}
                >
                  {t(
                    "بياناتك محمية بأعلى معايير الأمان",
                  )}
                </h2>

                <p
                  dir={textDirection}
                  className={`mt-2 w-full break-words text-[14px] font-normal leading-6 tracking-[0.01em] text-[#A5A5A5] ${textAlignClass}`}
                >
                  {t(
                    "نحافظ على خصوصيتك ونضمن لك تجربة آمنة وموثوقة في كل خطوة.",
                  )}
                </p>

                {/* Security features */}
                <div
                  dir={textDirection}
                  className="mt-8 grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-3"
                >
                  {securityFeatures.map(
                    ({
                      image,
                      title,
                      text,
                    }) => (
                      <div
                        key={title}
                        dir="ltr"
                        className={`flex min-w-0 items-start gap-3 ${
                          isArabic
                            ? "flex-row-reverse justify-end"
                            : "flex-row justify-start"
                        }`}
                      >
                        {/* Icon */}
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#E6F3F6]">
                          <ImageIcon
                            src={image}
                            alt={t(title)}
                            className="h-5 w-6"
                          />
                        </span>

                        {/* Text */}
                        <div
                          dir={textDirection}
                          className={`flex min-w-0 flex-1 flex-col gap-2 ${
                            isArabic
                              ? "items-end"
                              : "items-start"
                          }`}
                        >
                          <strong
                            className={`w-full break-words text-[16px] font-medium leading-6 text-[#666666] ${textAlignClass}`}
                          >
                            {t(title)}
                          </strong>

                          <small
                            className={`w-full break-words text-[12px] font-normal leading-5 tracking-[0.01em] text-[#A5A5A5] ${textAlignClass}`}
                          >
                            {t(text)}
                          </small>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#F8FAFC] py-[84px]">
          <div className="mx-auto w-full max-w-[1200px] px-5 xl:px-0">
            <div
              dir="ltr"
              className="relative flex min-h-[190px] w-full items-center rounded-lg bg-[#174B57] px-10 py-6"
            >
              {/* Buttons */}
              <div
                dir="ltr"
                className={`flex h-10 w-[304px] shrink-0 items-center gap-5 ${
                  isArabic
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <Link
                  to="/login"
                  className="ml-button flex h-10 w-[142px] items-center justify-center rounded-lg border border-white bg-transparent text-[16px] font-medium leading-6 text-white hover:bg-white/10"
                >
                  {t("تسجيل دخول")}
                </Link>

                <Link
                  to="/register"
                  className="ml-button flex h-10 w-[142px] items-center justify-center rounded-lg bg-white text-[16px] font-medium leading-6 text-[#216474] hover:bg-[#F3F8F9]"
                >
                  {t("إنشاء حساب")}
                </Link>
              </div>

              {/* CTA text */}
              <div
                dir={textDirection}
                className="ml-[70px] flex min-h-[100px] w-[390px] shrink-0 flex-col items-center justify-center gap-3 text-center"
              >
                <h2 className="flex w-full items-center justify-center break-words text-[30px] font-bold leading-[1.2] text-white xl:text-[32px]">
                  {t(
                    "ابدأ باستخدام المنصة الآن",
                  )}
                </h2>

                <p className="w-full break-words text-center text-[12px] font-normal leading-5 tracking-[0.01em] text-[#D6D6D6]">
                  {t(
                    "سجل حسابك لتتمكن من البحث عن الصيدليات بسهولة وفر الوقت.",
                  )}
                </p>
              </div>

              <img
                src={ASSETS.cta}
                alt={t("استخدام المنصة")}
                className="absolute right-[100px] top-[-15px] z-10 h-[205px] w-[200px] object-contain"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="footer"
        className="border-t border-[#DFE7E9] bg-white"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-10 lg:flex-row lg:items-center lg:justify-between xl:px-0">
          <div
            className={`max-w-sm ${
              isArabic
                ? "text-right"
                : "text-left"
            }`}
          >
            <div
              className="justify-start"
            >
              <Logo />
            </div>

            <p
              dir={textDirection}
              className={`mt-4 text-[14px] leading-7 text-[#8C989C] ${textAlignClass}`}
            >
              {t(
                "منصة تساعدك في العثور على أقرب صيدلية وتوفر الأدوية بشكل أسرع وبصورة أكثر موثوقية.",
              )}
            </p>
          </div>

          <div
            dir="ltr"
            className={`flex items-center gap-3 ${
              isArabic
                ? "flex-row-reverse"
                : "flex-row"
            }`}
          >
            {socialLinks.map(
              ({
                label,
                href,
                image,
              }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={t(label)}
                  className="grid h-15 w-15 place-items-center rounded-full border border-[#D9E5E7] bg-white transition hover:bg-[#EDF7F8]"
                >
                  <ImageIcon
                    src={image}
                    alt={t(label)}
                    className="h-[22px] w-[22px]"
                  />
                </a>
              ),
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}