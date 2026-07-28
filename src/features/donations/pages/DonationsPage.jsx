import { useQuery } from "@tanstack/react-query";
import {
  Gift,
  HandHeart,
  HeartHandshake,
  History,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { PageHeader as UserPageHeader } from "../../../shared/components/PageHeader";
import {
  donationKeys,
  getMyAssistanceRequests,
  getMyDonationOffers,
} from "../api/donationsApi";
import { AssistanceRequestForm } from "../components/AssistanceRequestForm";
import { DonationOfferForm } from "../components/DonationOfferForm";
import { DonationRecordCard } from "../components/DonationRecordCard";
import { assistanceStatuses, offerStatuses } from "../utils/donationFormatters";

export function DonationsPage() {
  const [formType, setFormType] = useState("offer");
  const [listType, setListType] = useState("offer");
  const [offerStatus, setOfferStatus] = useState("");
  const [assistanceStatus, setAssistanceStatus] = useState("");
  const offerParams = { status: offerStatus, take: 50 };
  const assistanceParams = { status: assistanceStatus, take: 50 };
  const offers = useQuery({
    queryKey: donationKeys.offers(offerParams),
    queryFn: () => getMyDonationOffers(offerParams),
  });
  const requests = useQuery({
    queryKey: donationKeys.assistanceRequests(assistanceParams),
    queryFn: () => getMyAssistanceRequests(assistanceParams),
  });
  const switchForm = (type) => {
    setFormType(type);
    document
      .getElementById("donation-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <UserPageHeader
        eyebrow="دواء يصل لمن يحتاجه"
        title="التبرعات والمساعدة الدوائية"
        description="قدّم دواءً صالحًا لمنظمة معتمدة، أو أرسل طلب مساعدة دوائية وتابع حالته من مكان واحد."
        icon={HeartHandshake}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => switchForm("offer")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f5cb72] px-4 py-3 text-sm font-black text-[#173d46]"
            >
              <Gift size={17} />
              تبرع بدواء
            </button>
            <button
              type="button"
              onClick={() => switchForm("assistance")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white"
            >
              <HandHeart size={17} />
              طلب مساعدة
            </button>
          </div>
        }
      />
      <section className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => switchForm("offer")}
          className="group relative overflow-hidden rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 p-6 text-start transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(5,150,105,.09)]"
        >
          <Sparkles
            className="absolute -left-3 -top-3 text-emerald-100"
            size={90}
          />
          <span className="relative grid size-12 place-items-center rounded-2xl bg-emerald-600 text-white">
            <Gift size={22} />
          </span>
          <h3 className="relative mt-5 text-xl font-black text-[#29464d]">
            لدي دواء للتبرع
          </h3>
          <p className="relative mt-2 max-w-lg text-sm leading-7 text-[#71858a]">
            سجّل الدواء وعدد العبوات واختر المنظمة التي ستراجع العرض وتتولى
            ترتيبات الاستلام.
          </p>
          <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
            <Plus size={16} />
            إنشاء عرض تبرع
          </span>
        </button>
        <button
          type="button"
          onClick={() => switchForm("assistance")}
          className="group relative overflow-hidden rounded-[1.5rem] border border-amber-100 bg-gradient-to-br from-white to-amber-50/70 p-6 text-start transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(217,119,6,.09)]"
        >
          <HeartHandshake
            className="absolute -left-3 -top-3 text-amber-100"
            size={90}
          />
          <span className="relative grid size-12 place-items-center rounded-2xl bg-amber-500 text-white">
            <HandHeart size={22} />
          </span>
          <h3 className="relative mt-5 text-xl font-black text-[#29464d]">
            أحتاج مساعدة دوائية
          </h3>
          <p className="relative mt-2 max-w-lg text-sm leading-7 text-[#71858a]">
            اختر الدواء والجهة المناسبة، وحدد الكمية والموعد المطلوب لتتمكن
            المنظمة من مراجعة الاحتياج.
          </p>
          <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-amber-700">
            <Plus size={16} />
            إنشاء طلب مساعدة
          </span>
        </button>
      </section>
      <section
        id="donation-form"
        className="scroll-mt-28 rounded-[1.6rem] border border-[#174b57]/8 bg-white shadow-[0_15px_40px_rgba(23,75,87,.05)]"
      >
        <div className="grid grid-cols-2 border-b border-[#174b57]/8 p-2">
          <FormTab
            active={formType === "offer"}
            icon={Gift}
            label="عرض تبرع"
            onClick={() => setFormType("offer")}
          />
          <FormTab
            active={formType === "assistance"}
            icon={HandHeart}
            label="طلب مساعدة"
            onClick={() => setFormType("assistance")}
          />
        </div>
        <div className="p-5 lg:p-7">
          {formType === "offer" ? (
            <DonationOfferForm />
          ) : (
            <AssistanceRequestForm />
          )}
        </div>
      </section>
      <section className="pt-2">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-black text-[#216474]">
              <History size={15} />
              سجل المتابعة
            </p>
            <h3 className="mt-1 text-xl font-black text-[#29464d]">
              عملياتي السابقة
            </h3>
          </div>
          <div className="flex rounded-xl border border-[#174b57]/8 bg-white p-1">
            <ListTab
              active={listType === "offer"}
              label="عروض التبرع"
              count={offers.data?.length}
              onClick={() => setListType("offer")}
            />
            <ListTab
              active={listType === "assistance"}
              label="طلبات المساعدة"
              count={requests.data?.length}
              onClick={() => setListType("assistance")}
            />
          </div>
        </div>
        {listType === "offer" ? (
          <RecordsPanel
            query={offers}
            records={offers.data}
            type="offer"
            status={offerStatus}
            setStatus={setOfferStatus}
            statuses={offerStatuses}
          />
        ) : (
          <RecordsPanel
            query={requests}
            records={requests.data}
            type="assistance"
            status={assistanceStatus}
            setStatus={setAssistanceStatus}
            statuses={assistanceStatuses}
          />
        )}
      </section>
    </div>
  );
}

function FormTab({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${active ? "bg-[#174b57] text-white shadow-md" : "text-[#71858a] hover:bg-[#f4f8f7]"}`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}
function ListTab({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-black transition ${active ? "bg-[#eaf4f3] text-[#216474]" : "text-[#829499]"}`}
    >
      {label}
      {Number.isFinite(count) && (
        <span className="ms-1.5 opacity-60">
          ({count.toLocaleString("ar-SY")})
        </span>
      )}
    </button>
  );
}
function RecordsPanel({
  query,
  records = [],
  type,
  status,
  setStatus,
  statuses,
}) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <select
          className="form-input max-w-52 appearance-none"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {statuses.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      {query.isLoading ? (
        <UserLoadingState label="جاري تحميل السجل..." />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !records.length ? (
        <UserEmptyState
          title={
            status
              ? "لا توجد سجلات بهذه الحالة"
              : type === "offer"
                ? "لم تقدم عروض تبرع بعد"
                : "لم ترسل طلبات مساعدة بعد"
          }
          description={
            status
              ? "اختر حالة أخرى لعرض بقية السجلات."
              : type === "offer"
                ? "عند إرسال أول عرض سيظهر هنا مع حالته ورد المنظمة."
                : "عند إرسال أول طلب سيظهر هنا ويمكنك متابعة استجابة المنظمة."
          }
        />
      ) : (
        <div
          className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${query.isFetching ? "opacity-60" : ""}`}
        >
          {records.map((record) => (
            <DonationRecordCard
              key={type === "offer" ? record.offerId : record.requestId}
              record={record}
              type={type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
