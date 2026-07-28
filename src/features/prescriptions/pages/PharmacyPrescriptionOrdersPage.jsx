import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, QrCode } from "lucide-react";
import { getPharmacyPrescriptionOrders, prescriptionKeys, updatePrescriptionStatus } from "../api/prescriptionsApi";

export function PharmacyPrescriptionOrdersPage() {
  const client = useQueryClient();
  const [codes, setCodes] = useState({});
  const orders = useQuery({ queryKey: prescriptionKeys.pharmacy, queryFn: getPharmacyPrescriptionOrders, refetchInterval: 3000 });
  const update = useMutation({ mutationFn: ({ id, ...payload }) => updatePrescriptionStatus(id, payload), onSuccess: () => client.invalidateQueries({ queryKey: prescriptionKeys.pharmacy }) });
  return <div className="space-y-6">
    <header><span className="eyebrow">الوصفات المحجوزة</span><h1 className="mt-2 text-3xl font-black text-[#173f49]">تجهيز واستلام الوصفات</h1><p className="mt-2 text-sm text-[#71858a]">تتحدث القائمة تلقائيًا كل 3 ثوانٍ.</p></header>
    <div className="space-y-4">{(orders.data || []).map((order) => <article key={order.id} className="surface p-5">
      <div className="flex flex-wrap justify-between gap-3"><div><strong className="text-[#29464d]">{order.originalFileName}</strong><p className="text-xs text-[#829499]">{order.items.length} أدوية — مطابقة {order.matchPercentage}%</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">{order.status}</span></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{order.items.map((item) => <div key={item.id} className="rounded-xl bg-[#f7faf9] p-3 text-sm">{item.matchedMedicineName || item.extractedName} — {item.reservedQuantity}/{item.requestedQuantity}</div>)}</div>
      {order.status === "Reserved" && <button className="btn-primary mt-4" onClick={() => update.mutate({ id: order.id, status: "ReadyForPickup" })}><Clock3 size={17} /> تم تجهيز الوصفة</button>}
      {order.status === "ReadyForPickup" && <div className="mt-4 flex flex-wrap gap-2"><label className="flex items-center gap-2 rounded-xl border px-3"><QrCode size={17} /><input className="input-field border-0" placeholder="رمز QR (8 أرقام)" value={codes[order.id] || ""} onChange={(e) => setCodes((old) => ({ ...old, [order.id]: e.target.value }))} /></label><button className="btn-primary" onClick={() => update.mutate({ id: order.id, status: "Collected", pickupCode: codes[order.id] })}><CheckCircle2 size={17} /> تأكيد الاستلام</button></div>}
    </article>)}</div>
  </div>;
}
