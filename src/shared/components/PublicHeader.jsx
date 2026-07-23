import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";

const links = [
  ["الخدمات", "#services"],
  ["كيف تعمل المنصة", "#journey"],
  ["لمن المنصة؟", "#roles"],
  ["الأمان", "#security"],
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#174b57]/8 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav
          className="hidden items-center gap-8 text-sm font-semibold text-[#53666b] lg:flex"
          aria-label="التنقل الرئيسي"
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="transition hover:text-[#174b57]"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link to="/login" className="btn-quiet">
            تسجيل الدخول
          </Link>
          <Link to="/register" className="btn-primary">
            إنشاء حساب
          </Link>
        </div>
        <button
          type="button"
          className="icon-button grid sm:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl sm:hidden">
          <nav className="grid gap-1">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 font-semibold text-slate-600 hover:bg-[#eef6f5]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/login" className="btn-secondary justify-center">
              الدخول
            </Link>
            <Link to="/register" className="btn-primary justify-center">
              حساب جديد
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
