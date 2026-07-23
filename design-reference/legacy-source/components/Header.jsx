import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../public/assets/images/images_header/LOGO.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "الرئيسية", path: "/" },
    { label: "الخدمات", path: "/features" },
    { label: "كيف يعمل", path: "/how-it-works" },
    { label: "المستخدمون", path: "/users" },
    { label: "تواصل معنا", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-[#66666629] z-50 flex justify-center">
      <div className="w-[1800px] h-[100px] flex items-center justify-between">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <img
            src={Logo}
            alt="Logo"
            className="w-[65px] h-[63px] object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative text-[24px] transition-colors ${
                  isActive
                    ? "text-[#216474] font-medium"
                    : "text-[#666666] font-normal hover:text-[#216474]"
                }`}
              >
                {item.label}

                {isActive && (
                  <span className="absolute -bottom-[8px] left-0 w-full border-b-3 border-[#DFAE0D]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/register")}
            className="w-[130px] h-[45px] rounded-[8px] bg-[#216474] text-white text-[18px] font-medium transition-all duration-300 hover:opacity-90"
          >
            إنشاء حساب
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-[130px] h-[45px] border border-[#216474] rounded-[8px] text-[#216474] text-[18px] font-medium transition-all duration-300 hover:bg-[#216474] hover:text-white"
          >
            تسجيل دخول
          </button>
        </div>
      </div>
    </header>
  );
}
