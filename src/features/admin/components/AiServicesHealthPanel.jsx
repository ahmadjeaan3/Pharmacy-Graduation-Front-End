import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  BrainCircuit,
  FileCheck2,
  LoaderCircle,
  RefreshCw,
  SearchCheck,
} from "lucide-react";

import {
  getIntelligenceHealth,
  intelligenceKeys,
} from "../../intelligence/api/intelligenceApi";
import {
  adminKeys,
  getAdminAiServicesHealth,
} from "../api/adminApi";

export function AiServicesHealthPanel() {
  const servicesQuery = useQuery({
    queryKey: adminKeys.aiServicesHealth,
    queryFn: getAdminAiServicesHealth,
    retry: 1,
    refetchInterval: 60_000,
  });
  const intelligenceQuery = useQuery({
    queryKey: intelligenceKeys.health,
    queryFn: getIntelligenceHealth,
    retry: 1,
    refetchInterval: 60_000,
  });

  const data = servicesQuery.data || {};
  const intelligence = intelligenceQuery.data;
  const services = [
    {
      name: "التحقق من تراخيص الصيدليات",
      description: "تحليل مستند الترخيص ودعم قرار المراجعة",
      icon: FileCheck2,
      value: data.licenseVerification,
    },
    {
      name: "البحث الذكي عن بدائل الدواء",
      description: "اقتراح الأدوية الأقرب عند تعذر توفر الدواء",
      icon: SearchCheck,
      value: data.drugSearch,
      count: data.drugSearch?.drugsLoaded,
    },
    {
      name: "المساعد الدوائي الذكي",
      description: "الإجابة عن الأسئلة بالاعتماد على دليل الأدوية",
      icon: Bot,
      value: data.smartPharmacyBot,
      count:
        intelligence?.medicinesCount ?? data.smartPharmacyBot?.medicinesLoaded,
      model: intelligence?.model ?? data.smartPharmacyBot?.model,
      directError: intelligenceQuery.isError,
    },
  ];
  const pending = servicesQuery.isPending || intelligenceQuery.isPending;

  const refresh = () => {
    servicesQuery.refetch();
    intelligenceQuery.refetch();
  };

  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-[#174b57]/8 bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
      <div className="flex flex-col gap-3 border-b border-[#e6eef0] bg-[#fafcfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#174b57] text-[#f5cb72]">
            <BrainCircuit size={21} />
          </span>
          <div>
            <h2 className="font-black text-[#29464d]">جاهزية الخدمات الذكية</h2>
            <p className="mt-0.5 text-xs text-[#829499]">مراقبة الاتصال بالنماذج المساندة للمنصة</p>
          </div>
        </div>
        <button className="btn-secondary" onClick={refresh} disabled={pending || servicesQuery.isFetching || intelligenceQuery.isFetching}>
          {servicesQuery.isFetching || intelligenceQuery.isFetching ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          تحديث الحالة
        </button>
      </div>

      <div className="grid gap-3 p-5 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.name}
            service={service}
            loading={pending}
            aggregateError={servicesQuery.isError}
          />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ service, loading, aggregateError }) {
  const value = service.value;
  const available = Boolean(value?.available) && !service.directError;
  const status = loading
    ? "جارٍ التحقق"
    : aggregateError || service.directError
      ? "تعذر الاتصال"
      : available
        ? "جاهزة للعمل"
        : value?.status || "غير متاحة";
  const Icon = service.icon;

  return (
    <article className="rounded-2xl border border-[#e1ebed] bg-[#f8fbfb] p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-[#216474] shadow-sm"><Icon size={19} /></span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ${loading ? "bg-slate-100 text-slate-600" : available ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          <span className={`size-1.5 rounded-full ${loading ? "animate-pulse bg-slate-400" : available ? "bg-emerald-500" : "bg-rose-500"}`} />
          {status}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-black text-[#29464d]">{service.name}</h3>
      <p className="mt-1 min-h-10 text-xs leading-5 text-[#71858a]">{service.description}</p>
      {(service.count != null || service.model) && (
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold text-[#52727a]">
          {service.count != null && <span className="rounded-lg bg-white px-2 py-1">{Number(service.count).toLocaleString("ar-SY")} دواء</span>}
          {service.model && <span className="max-w-full truncate rounded-lg bg-white px-2 py-1" dir="ltr">{service.model}</span>}
        </div>
      )}
    </article>
  );
}
