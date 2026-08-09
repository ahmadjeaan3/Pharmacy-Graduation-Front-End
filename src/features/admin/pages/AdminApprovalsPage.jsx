import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion as Motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  adminKeys,
  getPendingOrganizations,
  getPendingPharmacies,
  getPendingWarehouses,
  updateWarehouseApproval,
} from "../api/adminApi";
import { ApprovalConfirmDialog } from "../components/ApprovalConfirmDialog";
import {
  DashboardEmptyState as AdminEmptyState,
  DashboardErrorState as AdminErrorState,
  DashboardLoadingState as AdminLoadingState,
} from "../../../shared/components/AsyncStates";
import { formatDate, getVerificationStatus } from "../utils/adminFormatters";

export function AdminApprovalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = ["pharmacies", "organizations", "warehouses"].includes(
    requestedTab,
  )
    ? requestedTab
    : "pharmacies";
  const [search, setSearch] = useState("");
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [manualDecision, setManualDecision] = useState(null);
  const [manualReason, setManualReason] = useState("");
  const [notice, setNotice] = useState("");
  const queryClient = useQueryClient();
  const pharmacies = useQuery({
    queryKey: adminKeys.pendingPharmacies,
    queryFn: getPendingPharmacies,
  });
  const organizations = useQuery({
    queryKey: adminKeys.pendingOrganizations,
    queryFn: getPendingOrganizations,
  });
  const warehouses = useQuery({
    queryKey: adminKeys.pendingWarehouses,
    queryFn: getPendingWarehouses,
  });
  const approval = useMutation({
    mutationFn: () =>
      updateWarehouseApproval(
        approvalTarget.id,
        manualDecision === "approve",
        manualReason.trim(),
      ),
    onSuccess: async () => {
      const approvedName = approvalTarget.name;
      setApprovalTarget(null);
      setManualDecision(null);
      setManualReason("");
      setNotice(
        `تم ${manualDecision === "approve" ? "اعتماد" : "رفض"} ${approvedName} يدويًا بنجاح.`,
      );
      await queryClient.invalidateQueries({ queryKey: adminKeys.root });
    },
  });
  const activeQuery =
    activeTab === "pharmacies"
      ? pharmacies
      : activeTab === "warehouses"
        ? warehouses
        : organizations;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term || !activeQuery.data) return activeQuery.data ?? [];
    return activeQuery.data.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(term),
      ),
    );
  }, [activeQuery.data, search]);
  const switchTab = (tab) => {
    setSearchParams({ tab });
    setSearch("");
    setNotice("");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-[#174b57]/8 bg-white p-6 shadow-[0_12px_35px_rgba(23,75,87,.045)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-[#216474]">إدارة الحسابات</p>
            <h2 className="mt-2 text-3xl font-black text-[#17363e]">
              طلبات الاعتماد
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-[#71858a]">
              مراجعة بيانات الصيدليات والمنظمات والمستودعات قبل تفعيل خدماتها.
            </p>
          </div>
          <div className="field-control w-full lg:w-80">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="form-input has-field-icon"
              placeholder="بحث بالاسم أو البريد أو الرقم"
            />
            <span className="field-icon-shell">
              <Search size={18} />
            </span>
          </div>
        </div>
        <div className="mt-7 flex gap-2 border-b border-slate-100">
          <TabButton
            active={activeTab === "pharmacies"}
            onClick={() => switchTab("pharmacies")}
            icon={Building2}
            label="الصيدليات"
            count={pharmacies.data?.length}
          />
          <TabButton
            active={activeTab === "warehouses"}
            onClick={() => switchTab("warehouses")}
            icon={Warehouse}
            label="المستودعات"
            count={warehouses.data?.length}
          />
          <TabButton
            active={activeTab === "organizations"}
            onClick={() => switchTab("organizations")}
            icon={HeartHandshake}
            label="المنظمات"
            count={organizations.data?.length}
          />
        </div>
      </section>
      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
        >
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}
      {activeQuery.isPending ? (
        <AdminLoadingState cards={2} />
      ) : activeQuery.isError ? (
        <AdminErrorState
          message={getApiErrorMessage(activeQuery.error)}
          onRetry={activeQuery.refetch}
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title={
            search
              ? "لا توجد نتائج مطابقة"
              : activeTab === "pharmacies"
                ? "لا توجد صيدليات معلّقة"
                : activeTab === "warehouses"
                  ? "لا توجد مستودعات معلّقة"
                  : "لا توجد منظمات معلّقة"
          }
          description={
            search
              ? "جرّب عبارة بحث مختلفة."
              : "لا توجد طلبات اعتماد ضمن هذه القائمة حالياً."
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {activeTab === "pharmacies"
            ? filtered.map((item, index) => (
                <PharmacyApprovalCard
                  key={item.pharmacyId}
                  item={item}
                  index={index}
                />
              ))
            : activeTab === "warehouses"
              ? filtered.map((item, index) => (
                  <WarehouseApprovalCard
                    key={item.warehouseId}
                    item={item}
                    index={index}
                    onApprove={() => {
                      approval.reset();
                      setApprovalTarget({
                        type: "warehouse",
                        id: item.warehouseId,
                        name: item.warehouseName,
                        kindLabel: "المستودع",
                      });
                      setManualDecision(null);
                      setManualReason("");
                    }}
                  />
                ))
              : filtered.map((item, index) => (
                  <OrganizationApprovalCard
                    key={item.organizationId}
                    item={item}
                    index={index}
                  />
                ))}
        </div>
      )}
      <ApprovalConfirmDialog
        item={approvalTarget}
        pending={approval.isPending}
        error={approval.isError ? getApiErrorMessage(approval.error) : ""}
        onCancel={() => {
          if (!approval.isPending) {
            setApprovalTarget(null);
            setManualDecision(null);
            setManualReason("");
          }
        }}
        onConfirm={() => approval.mutate()}
        decision={manualDecision}
        reason={manualReason}
        onDecisionChange={setManualDecision}
        onReasonChange={setManualReason}
      />
    </div>
  );
}

function WarehouseApprovalCard({ item, index, onApprove }) {
  return (
    <ApprovalCardShell
      index={index}
      icon={Warehouse}
      title={item.warehouseName}
      code={`ترخيص المستودع: ${item.licenseNumber}`}
      badge={
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
          بانتظار المراجعة
        </span>
      }
    >
      <InfoLine icon={UserRound} value={item.ownerFullName} />
      <InfoLine icon={Mail} value={item.ownerEmail} ltr />
      <InfoLine
        icon={Phone}
        value={item.phoneNumber || "لا يوجد رقم هاتف"}
        ltr
      />
      <InfoLine
        icon={MapPin}
        value={`${item.city}، ${item.area} — ${item.address}`}
      />
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f7faf9] p-3 text-center text-xs text-[#65797e]">
        <span>
          <b className="block text-base text-[#17363e]">
            {Number(item.minimumOrderAmount).toLocaleString("ar-SY")}
          </b>
          الحد الأدنى
        </span>
        <span>
          <b className="block text-base text-[#17363e]">
            {Number(item.deliveryFee).toLocaleString("ar-SY")}
          </b>
          أجور التوصيل
        </span>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onApprove}
          className="btn-primary w-full justify-center"
        >
          <CheckCircle2 size={17} /> اعتماد المستودع وتفعيل خدماته
        </button>
      </div>
    </ApprovalCardShell>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 pb-4 text-sm font-bold transition ${active ? "text-[#174b57]" : "text-slate-400 hover:text-[#526a70]"}`}
    >
      <Icon size={18} />
      {label}
      {Number.isFinite(count) && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-[#eaf4f3] text-[#216474]" : "bg-slate-100"}`}
        >
          {count.toLocaleString("ar-SY")}
        </span>
      )}
      {active && (
        <Motion.span
          layoutId="approval-tab"
          className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#216474]"
        />
      )}
    </button>
  );
}

function PharmacyApprovalCard({ item, index }) {
  return (
    <ApprovalCardShell
      index={index}
      icon={Building2}
      title={item.pharmacyName}
      code={`ترخيص: ${item.licenseNumber}`}
    >
      <InfoLine icon={UserRound} value={item.ownerFullName} />
      <InfoLine icon={Mail} value={item.ownerEmail} ltr />
      <InfoLine
        icon={Phone}
        value={item.phoneNumber || "لا يوجد رقم هاتف"}
        ltr
      />
      <InfoLine
        icon={MapPin}
        value={`${item.city}، ${item.area} — ${item.address}`}
      />
      <InfoLine
        icon={CalendarDays}
        value={`تاريخ التسجيل: ${formatDate(item.createdAtUtc)}`}
      />
      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          to={`/app/pharmacies/${item.pharmacyId}/review`}
          className="btn-primary w-full justify-center"
        >
          <CheckCircle2 size={17} /> مراجعة الترخيص واتخاذ القرار
        </Link>
      </div>
    </ApprovalCardShell>
  );
}

function OrganizationApprovalCard({ item, index }) {
  const status = getVerificationStatus(item.verificationStatus);
  return (
    <ApprovalCardShell
      index={index}
      icon={HeartHandshake}
      title={item.organizationName}
      code={`رقم التسجيل: ${item.registrationNumber}`}
      badge={
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
        >
          {status.label}
        </span>
      }
    >
      <InfoLine icon={UserRound} value={item.ownerFullName} />
      <InfoLine icon={Mail} value={item.ownerEmail} ltr />
      <InfoLine
        icon={MapPin}
        value={`${item.city}، ${item.area} — ${item.address}`}
      />
      <InfoLine
        icon={FileCheck2}
        value={`${item.verificationDocumentsCount.toLocaleString("ar-SY")} مستندات تحقق`}
      />
      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          to={`/app/organizations/${item.organizationId}/review`}
          className="btn-primary w-full justify-center"
        >
          <FileCheck2 size={17} /> مراجعة الملف واتخاذ قرار يدوي
        </Link>
      </div>
    </ApprovalCardShell>
  );
}

function ApprovalCardShell({
  index,
  icon: Icon,
  title,
  code,
  badge,
  children,
}) {
  return (
    <Motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_12px_35px_rgba(23,75,87,.045)]"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
          <Icon size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="truncate text-lg font-black text-[#17363e]">
              {title}
            </h3>
            {badge}
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-400">{code}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm">{children}</div>
    </Motion.article>
  );
}

function InfoLine({ icon: Icon, value, ltr = false }) {
  return (
    <div className="flex items-start gap-3 text-[#65797e]">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#8aa0a5]" />
      <span className="min-w-0 break-words" dir={ltr ? "ltr" : undefined}>
        {value}
      </span>
    </div>
  );
}
