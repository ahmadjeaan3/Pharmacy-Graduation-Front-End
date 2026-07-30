import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Warehouse,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { adminKeys, getAdminAccounts } from "../api/adminApi";

const roleLabels = {
  User: "مستخدم",
  Pharmacy: "صيدلية",
  Organization: "منظمة",
  Admin: "إدارة",
  Warehouse: "مستودع",
  Representative: "مندوب",
};

const roleIcons = {
  User: UserRound,
  Pharmacy: Building2,
  Organization: Building2,
  Admin: ShieldCheck,
  Warehouse,
  Representative: Truck,
};

export function AdminAccountsPage() {
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const accounts = useQuery({
    queryKey: adminKeys.accounts(filters),
    queryFn: () => getAdminAccounts(filters),
  });
  const allAccounts = accounts.data || [];
  const stats = {
    total: allAccounts.length,
    active: allAccounts.filter((item) => item.isActive).length,
    users: allAccounts.filter((item) => item.role === "User").length,
    entities: allAccounts.filter((item) =>
      ["Pharmacy", "Organization", "Warehouse", "Representative"].includes(
        item.role,
      ),
    ).length,
  };
  const field = (name) => ({
    value: filters[name],
    onChange: (event) =>
      setFilters((current) => ({ ...current, [name]: event.target.value })),
  });

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(125deg,#123f49,#216474)] px-6 py-8 text-white shadow-[0_24px_70px_rgba(23,75,87,.2)] lg:px-9">
        <div className="absolute -left-16 -top-20 size-64 rounded-full border-[34px] border-white/[.045]" />
        <div className="absolute -bottom-24 right-[42%] size-52 rounded-full bg-[#8bd0cb]/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#8bd0cb]">
              <Sparkles size={16} /> مركز إدارة المنصة
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              دليل الحسابات الموحّد
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/60">
              رؤية شاملة لكل حسابات المنصة، بياناتها وحالتها ونشاطها من مساحة
              إدارية واحدة.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[.08] px-4 py-3 text-sm font-bold backdrop-blur">
            <ShieldCheck size={18} className="text-[#f5cb72]" />
            وصول إداري محمي
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label="إجمالي الحسابات"
          value={stats.total}
          tone="cyan"
        />
        <StatCard
          icon={CheckCircle2}
          label="الحسابات الفعالة"
          value={stats.active}
          tone="green"
        />
        <StatCard
          icon={UserRound}
          label="المستخدمون"
          value={stats.users}
          tone="violet"
        />
        <StatCard
          icon={Building2}
          label="حسابات الجهات"
          value={stats.entities}
          tone="amber"
        />
      </section>

      <section className="rounded-[1.6rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_14px_40px_rgba(23,75,87,.055)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-black text-[#29464d]">البحث والتصفية</h3>
            <p className="mt-1 text-xs text-[#8a9a9e]">
              اعثر على الحساب المطلوب بسرعة
            </p>
          </div>
          <span className="rounded-full bg-[#eaf4f3] px-3 py-1.5 text-xs font-bold text-[#216474]">
            {allAccounts.length.toLocaleString("ar-SY")} نتيجة
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
          <label className="field-control">
            <input
              {...field("search")}
              className="form-input has-field-icon"
              placeholder="ابحث بالاسم أو البريد أو اسم الجهة"
            />
            <span className="field-icon-shell">
              <Search size={18} />
            </span>
          </label>
          <select {...field("role")} className="form-input">
            <option value="">كل أنواع الحسابات</option>
            <option value="User">المستخدمون</option>
            <option value="Pharmacy">الصيدليات</option>
            <option value="Organization">المنظمات</option>
            <option value="Warehouse">المستودعات</option>
            <option value="Representative">المندوبون</option>
            <option value="Admin">الإدارة</option>
          </select>
          <select {...field("status")} className="form-input">
            <option value="">كل الحالات</option>
            <option value="Active">الحسابات الفعالة</option>
            <option value="Inactive">الحسابات الموقوفة</option>
          </select>
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        {(accounts.data || []).map((account) => {
          const Icon = roleIcons[account.role] || UserRound;
          return (
            <article
              key={account.userId}
              className="group relative overflow-hidden rounded-[1.55rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_12px_35px_rgba(23,75,87,.045)] transition duration-300 hover:-translate-y-1 hover:border-[#216474]/20 hover:shadow-[0_22px_50px_rgba(23,75,87,.09)]"
            >
              <div
                className={`absolute inset-y-0 start-0 w-1 ${account.isActive ? "bg-emerald-400" : "bg-rose-400"}`}
              />
              <div className="flex items-start gap-4">
                <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474] transition group-hover:bg-[#174b57] group-hover:text-white">
                  <Icon size={23} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="truncate text-base text-[#29464d]">
                      {account.profileName || account.fullName}
                    </strong>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      {roleLabels[account.role] || account.role}
                    </span>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-[#71858a]">
                    {account.fullName}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {account.email}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${account.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  {account.isActive ? "فعال" : "موقوف"}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="min-w-0 truncate text-xs text-slate-400">
                  {[account.city, account.phoneNumber]
                    .filter(Boolean)
                    .join(" • ") || "لا توجد بيانات موقع"}
                </p>
                <Link
                  to={`/app/accounts/${account.userId}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#f2f7f6] px-3.5 py-2 text-xs font-black text-[#216474] transition group-hover:bg-[#174b57] group-hover:text-white"
                >
                  الملف الكامل <ChevronLeft size={15} />
                </Link>
              </div>
            </article>
          );
        })}
        {accounts.isSuccess && !accounts.data?.length && (
          <div className="rounded-2xl bg-white p-10 text-center text-[#71858a]">
            لا توجد حسابات مطابقة.
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <article className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-4 shadow-[0_10px_30px_rgba(23,75,87,.04)] sm:p-5">
      <span
        className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}
      >
        <Icon size={19} />
      </span>
      <strong className="mt-4 block text-2xl font-black text-[#17363e]">
        {Number(value || 0).toLocaleString("ar-SY")}
      </strong>
      <span className="mt-1 block text-xs font-semibold text-[#71858a]">
        {label}
      </span>
    </article>
  );
}
