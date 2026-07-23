import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-center">
      <div>
        <p className="text-7xl font-black text-teal-800">404</p>
        <h1 className="mt-5 text-3xl font-black">الصفحة غير موجودة</h1>
        <p className="mt-3 text-slate-500">
          قد يكون الرابط قديمًا أو كُتب بصورة غير صحيحة.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-3 font-bold text-white"
        >
          <ArrowRight size={18} />
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
