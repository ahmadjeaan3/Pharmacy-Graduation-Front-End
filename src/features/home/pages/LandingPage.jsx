import { useQuery } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  Building2,
  Check,
  CircleCheckBig,
  Clock3,
  HeartHandshake,
  MapPin,
  PackageCheck,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../../../shared/api/client";
import { Brand } from "../../../shared/components/Brand";
import { PublicHeader } from "../../../shared/components/PublicHeader";

const services = [
  {
    icon: Search,
    number: "01",
    title: "ابحث عن دوائك",
    text: "اكتب اسم الدواء وشاهد توفره وأسعاره في الصيدليات القريبة منك.",
  },
  {
    icon: MapPin,
    number: "02",
    title: "اختر الصيدلية",
    text: "قارن المسافة وحالة العمل والتقييم، ثم اختر الأنسب خلال ثوانٍ.",
  },
  {
    icon: HeartHandshake,
    number: "03",
    title: "شارك في العطاء",
    text: "استعرض حملات المنظمات المعتمدة وقدّم عروض التبرع أو طلبات المساعدة.",
  },
];

const categories = [
  ["القلب والضغط", HeartHandshake, "bg-rose-50 text-rose-600"],
  ["العناية اليومية", Sparkles, "bg-amber-50 text-amber-600"],
  ["الأدوية العامة", PackageSearch, "bg-cyan-50 text-cyan-700"],
  ["الأم والطفل", UserRound, "bg-violet-50 text-violet-600"],
  ["السكري", CircleCheckBig, "bg-emerald-50 text-emerald-700"],
];

const roles = [
  {
    icon: UserRound,
    title: "المستخدم",
    text: "بحث وطلبات وتتبع وملف صحي في تجربة بسيطة.",
  },
  {
    icon: Building2,
    title: "الصيدلية",
    text: "إدارة المخزون والطلبات وساعات العمل من مكان واحد.",
  },
  {
    icon: HeartHandshake,
    title: "المنظمة",
    text: "إدارة حملات التبرع وعروض الأدوية وطلبات المساعدة.",
  },
  {
    icon: ShieldCheck,
    title: "الإدارة",
    text: "مراجعة واعتماد ورقابة دقيقة على عمليات المنصة.",
  },
];

export function LandingPage() {
  const health = useQuery({
    queryKey: ["api-health"],
    queryFn: async () => (await apiClient.get("/pharmacies/health")).data,
    retry: false,
  });

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7faf9] text-[#142e35]">
      <PublicHeader />
      <main>
        <section className="relative isolate overflow-hidden bg-[#f4f9f8]">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_15%,rgba(99,183,184,.22),transparent_28%),radial-gradient(circle_at_12%_72%,rgba(245,203,114,.18),transparent_25%)]" />
          <img
            src="/assets/app/home/hero-bg.png"
            alt=""
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[.11]"
          />
          <div className="mx-auto grid min-h-[680px] max-w-[1360px] items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_.92fr] lg:px-8 lg:py-20">
            <Motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#216474]/15 bg-white/80 px-4 py-2 text-xs font-bold text-[#216474] shadow-sm backdrop-blur">
                <Sparkles size={15} /> رعايتك الصحية، أقرب مما تتخيل
              </div>
              <h1 className="max-w-3xl text-[2.7rem] font-black leading-[1.2] tracking-[-.04em] text-[#102d34] sm:text-6xl lg:text-[4.4rem]">
                دواؤك يصلك
                <br />
                <span className="relative text-[#216474]">
                  بسهولة وأمان
                  <span className="absolute -bottom-2 right-0 h-2 w-4/5 rounded-full bg-[#f5cb72]/70 -z-10" />
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-[#5d7277] sm:text-lg">
                منصة تجمع المستخدم والصيدلية والمنظمة والإدارة في بيئة صحية
                واحدة للبحث عن الدواء وإدارة الخدمات والمبادرات الدوائية.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/register" className="btn-primary px-6 py-3.5">
                  ابدأ تجربتك <ArrowLeft size={18} />
                </Link>
                <a href="#journey" className="btn-secondary px-6 py-3.5">
                  اكتشف المنصة <ArrowUpLeft size={18} />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#60757a]">
                {["صيدليات موثوقة", "تجربة عربية", "بيانات محمية"].map(
                  (item) => (
                    <span key={item} className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-[#dcefed] text-[#216474]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {item}
                    </span>
                  ),
                )}
              </div>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="relative mx-auto w-full max-w-[610px]"
            >
              <div className="absolute inset-[12%] -z-10 rounded-full bg-[#87c7c3]/35 blur-3xl" />
              <div className="relative rounded-[2.6rem] border border-white/80 bg-white/45 p-4 shadow-[0_35px_90px_rgba(23,75,87,.16)] backdrop-blur-sm sm:p-7">
                <img
                  src="/assets/app/home/hero.png"
                  alt="خدمات الصيدليات والأدوية"
                  className="mx-auto w-full max-w-[540px] drop-shadow-[0_30px_30px_rgba(23,75,87,.16)]"
                />
                <div className="absolute -right-2 top-[13%] flex items-center gap-3 rounded-2xl border border-white bg-white/95 p-3 shadow-xl sm:-right-8">
                  <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <BadgeCheck size={21} />
                  </span>
                  <span>
                    <strong className="block text-sm">صيدليات مسجّلة</strong>
                    <small className="text-slate-400">
                      بيانات الصيدلية والدواء
                    </small>
                  </span>
                </div>
                <div className="absolute -bottom-5 left-2 flex items-center gap-3 rounded-2xl border border-white bg-[#174b57] p-3.5 text-white shadow-xl sm:left-8">
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10">
                    <Clock3 size={20} />
                  </span>
                  <span>
                    <strong className="block text-sm">بحث موحّد</strong>
                    <small className="text-white/60">
                      وصول إلى بيانات الدواء
                    </small>
                  </span>
                </div>
              </div>
            </Motion.div>
          </div>
          <div className="mx-auto max-w-[1360px] px-5 pb-10 lg:px-8">
            <div className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <span
                  className={`relative flex size-3 ${health.isPending ? "bg-amber-400" : health.isSuccess ? "bg-emerald-500" : "bg-rose-500"} rounded-full`}
                >
                  <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-30" />
                </span>
                <div>
                  <strong className="block text-sm">
                    {health.isSuccess
                      ? "المنصة جاهزة لخدمتك"
                      : health.isPending
                        ? "جاري التحقق من جاهزية الخدمات"
                        : "الخدمات غير متاحة مؤقتاً"}
                  </strong>
                  <span className="text-xs text-slate-400">
                    حالة خدمات حياة دوائية
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
                <span>خصوصية محفوظة</span>
                <span>دخول آمن</span>
                <span className="hidden sm:inline">خدمات موثوقة</span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="mx-auto max-w-[1360px] px-5 py-24 lg:px-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">
                <span className="h-px w-8 bg-[#f2b84b]" /> خدماتك اليومية
              </p>
              <h2 className="section-title mt-3">
                كل ما تحتاجه لدوائك
                <br />
                في مكان واحد
              </h2>
            </div>
            <p className="max-w-md leading-7 text-[#63777c]">
              صممنا التجربة لتكون واضحة وسريعة، بلا خطوات زائدة أو مصطلحات
              معقدة.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {services.map(({ icon: Icon, number, title, text }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#174b57]/10 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-[#216474]/25 hover:shadow-[0_24px_60px_rgba(23,75,87,.1)]"
              >
                <span className="absolute left-6 top-4 text-5xl font-black text-[#174b57]/[.045]">
                  {number}
                </span>
                <span className="grid size-13 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474] transition group-hover:bg-[#174b57] group-hover:text-white">
                  <Icon size={24} />
                </span>
                <h3 className="mt-7 text-xl font-extrabold text-[#102d34]">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-[#65797e]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="journey" className="bg-[#102f37] py-24 text-white">
          <div className="noise mx-auto grid max-w-[1360px] items-center gap-14 px-5 lg:grid-cols-[.9fr_1.1fr] lg:px-8">
            <div className="relative">
              <div className="absolute -inset-7 rounded-[2.5rem] bg-[#2f7180]/20 blur-2xl" />
              <img
                src="/assets/app/auth/login-bg.png"
                alt="صيدلية رقمية"
                className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl"
              />
              <div className="absolute -bottom-5 right-5 rounded-2xl bg-[#f5cb72] px-5 py-4 text-[#173d46] shadow-xl">
                <strong className="block text-2xl font-black">
                  منصة واحدة
                </strong>
                <span className="text-sm font-semibold">
                  للبحث والإدارة والعطاء
                </span>
              </div>
            </div>
            <div>
              <p className="eyebrow !text-[#8bd0cb]">
                <span className="h-px w-8 bg-[#f5cb72]" /> خدمات المنصة
              </p>
              <h2 className="section-title mt-4 !text-white">
                وظائف واضحة تخدم
                <br />
                منظومة الدواء
              </h2>
              <div className="mt-9 space-y-4">
                {services.map(({ icon: Icon, number, title, text }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.055] p-4.5 transition hover:bg-white/[.09]"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#8bd0cb]">
                      <Icon size={22} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#f5cb72]">
                          {number}
                        </span>
                        <h3 className="font-extrabold">{title}</h3>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-white/60">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-5 py-24 lg:px-8">
          <div className="text-center">
            <p className="eyebrow justify-center">استكشف بسهولة</p>
            <h2 className="section-title mt-3">تصنيفات صحية</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-[#65797e]">
              تنظيم واضح يساعد على تصفح المنتجات الدوائية حسب الفئة.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5">
            {categories.map(([label, Icon, tone]) => (
              <article
                key={label}
                className="group rounded-[1.5rem] border border-[#174b57]/10 bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span
                  className={`mx-auto grid size-14 place-items-center rounded-2xl ${tone} transition group-hover:scale-110`}
                >
                  <Icon size={25} />
                </span>
                <span className="mt-4 block font-bold text-[#263f45]">
                  {label}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section
          id="roles"
          className="border-y border-[#174b57]/8 bg-white py-24"
        >
          <div className="mx-auto max-w-[1360px] px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="eyebrow">منصة متكاملة</p>
              <h2 className="section-title mt-3">تجربة مصممة لكل دور</h2>
              <p className="mt-4 leading-7 text-[#65797e]">
                كل مستخدم يرى الأدوات والبيانات التي يحتاجها فقط، ضمن صلاحيات
                واضحة وآمنة.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {roles.map(({ icon: Icon, title, text }, index) => (
                <article
                  key={title}
                  className={`rounded-[1.5rem] p-6 ${index === 0 ? "bg-[#174b57] text-white" : "border border-[#174b57]/10 bg-[#f7faf9]"}`}
                >
                  <span
                    className={`grid size-11 place-items-center rounded-xl ${index === 0 ? "bg-white/10 text-[#f5cb72]" : "bg-white text-[#216474] shadow-sm"}`}
                  >
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-6 text-lg font-extrabold">{title}</h3>
                  <p
                    className={`mt-2 text-sm leading-6 ${index === 0 ? "text-white/65" : "text-[#65797e]"}`}
                  >
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="security"
          className="mx-auto max-w-[1360px] px-5 py-24 lg:px-8"
        >
          <div className="relative overflow-hidden rounded-[2.25rem] bg-[#eaf4f3] px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between">
            <div className="absolute -left-20 -top-24 size-72 rounded-full border-[42px] border-white/40" />
            <div className="relative max-w-2xl">
              <p className="eyebrow">
                <ShieldCheck size={17} /> خصوصيتك أولويتنا
              </p>
              <h2 className="section-title mt-3">
                بياناتك في عناية تليق بثقتك
              </h2>
              <p className="mt-4 leading-8 text-[#5e7378]">
                نحرص على حماية بياناتك واحترام خصوصيتك، لتستخدم خدمات حياة
                دوائية بثقة ووضوح في كل خطوة.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["خصوصية محفوظة", "دخول آمن", "استخدام مسؤول للبيانات"].map(
                  (item) => (
                    <span
                      key={item}
                      className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#36555c]"
                    >
                      <PackageCheck size={16} className="text-[#216474]" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="relative mt-9 grid size-32 shrink-0 place-items-center rounded-[2rem] bg-[#174b57] text-[#f5cb72] shadow-[0_22px_50px_rgba(23,75,87,.22)] lg:ml-8 lg:mt-0">
              <ShieldCheck size={58} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 lg:px-8">
          <div className="mx-auto max-w-[1360px] overflow-hidden rounded-[2.25rem] bg-[#174b57] px-6 py-12 text-center text-white shadow-[0_30px_70px_rgba(23,75,87,.18)] sm:px-12">
            <Star
              className="mx-auto text-[#f5cb72]"
              fill="currentColor"
              size={22}
            />
            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              ابدأ باستخدام حياة دوائية
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-white/65">
              أنشئ حسابك واختر نوعه للوصول إلى الخدمات والصلاحيات المناسبة.
            </p>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#f5cb72] px-6 py-3.5 font-extrabold text-[#173d46] transition hover:-translate-y-1 hover:bg-[#ffd989]"
            >
              إنشاء حساب <ArrowLeft size={18} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#174b57]/10 bg-white">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-5 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Brand />
          <p className="text-sm text-[#718287]">
            مشروع حياة دوائية © 2026 — رعاية أقرب، تجربة أذكى.
          </p>
        </div>
      </footer>
    </div>
  );
}
