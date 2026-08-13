import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen overflow-hidden bg-white">
      {/* ================= NAVBAR ================= */}

      <nav
        className="
        w-full
        h-[72px]
        border-b
        border-[#E8E8E8]
        bg-white
      "
      >
        <div
          className="
          w-full
          h-full
          px-[120px]
          flex
          items-center
          justify-between
        "
        >
          {/* LINKS */}

          <div
            className="
            flex
            items-center
            gap-10
            text-[#666666]
            text-[16px]
          "
          >
            <button>سياسة الخصوصية</button>
            <button>الدعم والمساعدة</button>
          </div>

          {/* LOGO */}

          <div
            className="
            flex
            items-center
            gap-8
          "
          >
            <button
              className="
              text-[#666666]
              text-[18px]
              font-medium
            "
            >
              الرئيسية
            </button>

            <div className="w-[1px] h-[40px] bg-[#666666]" />

            <img
              src="/assets/images/Login/LOGO (2).png"
              alt=""
              className="w-[62px] h-[60px] object-contain"
            />
          </div>
        </div>
      </nav>

      {/* ================= BODY ================= */}

      <main
        className="
        flex
        w-full
        h-[calc(100vh-72px)]
      "
      >
        {/* ================= IMAGE ================= */}

        <section
          className="
          relative
          w-[50%]
          h-full
          overflow-hidden
        "
        >
          <img
            src="/images/login-bg.png"
            alt=""
            className="w-[1000px] h-full"
          />

          <div className="absolute inset-0" />

          <button
            onClick={() => navigate(-1)}
            className="
            absolute
            top-[40px]
            left-[40px]
            w-[54px]
            h-[54px]
            rounded-full
            bg-white
            border
            border-[#E8E8E8]
            flex
            items-center
            justify-center
          "
          >
            <img
              src="/assets/images/Register/arrow_left.png"
              alt=""
              className="w-5 h-5"
            />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="
            absolute
            top-[120px]
            left-1/2
            -translate-x-1/2
            w-[400px]
            text-center
            text-white
          "
          >
            <h2
              className="
              text-[30px]
              font-bold
              leading-[48px]
            "
            >
              أهلاً وسهلاً بك في Medical Life
            </h2>

            <p
              className="
              mt-5
              text-[20px]
              font-medium
              leading-[36px]
            "
            >
              نحن هنا لنرافقك في رحلتك الصحية
              <br />
              أنشئ حسابك للاستفادة من جميع خدماتنا
              <br />
              بكل سهولة وأمان
            </p>
          </motion.div>
        </section>

        {/* ================= FORM ================= */}

        <section
          className="
          w-[50%]
          h-full
          flex
          items-center
          justify-center
        "
        >
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="w-[520px]"
          >
            <div
              className="
              text-center
              mb-[40px]
            "
            >
              <h1
                className="
                text-[48px]
                font-bold
                text-[#174B57]
              "
              >
                إنشاء حساب
              </h1>

              <p
                className="
                mt-5
                text-[16px]
                text-[#A5A5A5]
              "
              >
                أنشئ حساباً جديداً للوصول إلى خدمات Medical Life.
              </p>
            </div>

            <form className="flex flex-col gap-5">
              {/* ================= ROW 1 ================= */}

              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="البريد الإلكتروني"
                  icon="/assets/images/Register/Envelope .png"
                  placeholder="example@gmail.com"
                />

                <Input
                  label="الاسم الكامل"
                  icon="/assets/images/Register/User.png"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              {/* ================= ROW 2 ================= */}

              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="تأكيد كلمة المرور"
                  icon="/assets/images/Register/LockKey.png"
                  placeholder="********"
                  type="password"
                  password
                />
                <Input
                  label="كلمة المرور"
                  icon="/assets/images/Register/LockKey.png"
                  placeholder="********"
                  type="password"
                  password
                />
              </div>

              {/* ================= ROW 3 ================= */}

              <div className="grid grid-cols-2 gap-5">
                <SelectInput
                  label="المدينة"
                  icon="/assets/images/Register/MapPin.png"
                  options={["اختر من القائمة", "إدلب", "حلب", "دمشق", "حمص"]}
                />
                <SelectInput
                  label="نوع الحساب"
                  icon="/assets/images/Register/ShieldCheck.png"
                  options={["اختر من القائمة", "مستخدم", "صيدلية", "جمعية"]}
                />
              </div>

              {/* ================= PHONE ================= */}

              <PhoneInput />

              {/* ================= TERMS ================= */}

              <label
                className="
                flex
                justify-end
                items-center
                gap-3
                text-[#666666]
                text-[14px]
                "
              >
                <span>أوافق على سياسة الخصوصية والشروط</span>

                <input
                  type="checkbox"
                  defaultChecked
                  className="
                  w-5
                  h-5
                  accent-[#216474]
                  cursor-pointer
                  "
                />
              </label>

              {/* ================= BUTTON ================= */}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="
                w-full
                h-[58px]
                rounded-[12px]
                bg-[#174B57]
                text-white
                text-[20px]
                font-medium
                hover:bg-[#216474]
                transition
                "
              >
                إنشاء حساب
              </button>

              {/* ================= LOGIN ================= */}

              <p
                className="
                text-center
                text-[#2E2E2E]
                text-[16px]
                "
              >
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="
                  text-[#216474]
                  font-semibold
                  mr-2
                  "
                >
                  تسجيل الدخول
                </button>
                لديك حساب بالفعل؟
              </p>
            </form>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
/* ================= INPUT COMPONENT ================= */

function Input({ label, icon, placeholder, type = "text", password = false }) {
  return (
    <div>
      <label
        className="
        flex
        justify-end
        items-center
        gap-2
        mb-3
        text-[#174B57]
        text-[14px]
        font-medium
        "
      >
        <span>{label}</span>

        <img src={icon} alt="" className="w-5 h-5 object-contain" />
      </label>

      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          dir="rtl"
          className="
          w-full
          h-[54px]
          border
          border-[#174B57]
          rounded-[9px]
          pr-5
          pl-12
          text-right
          text-[#333]
          outline-none
          focus:border-[#216474]
          transition
          "
        />

        {password && (
          <img
            src="/assets/images/Login/eye-slash.png"
            alt=""
            className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            w-5
            h-5
            cursor-pointer
            "
          />
        )}
      </div>
    </div>
  );
}

/* ================= SELECT COMPONENT ================= */

function SelectInput({ label, icon, options }) {
  return (
    <div>
      <label
        className="
        flex
        justify-end
        items-center
        gap-2
        mb-3
        text-[#174B57]
        text-[14px]
        font-medium
        "
      >
        <span>{label}</span>

        <img src={icon} alt="" className="w-5 h-5 object-contain" />
      </label>

      <div className="relative">
        <select
          dir="rtl"
          className="
          w-full
          h-[54px]
          border
          border-[#174B57]
          rounded-[9px]
          pr-5
          pl-12
          text-right
          appearance-none
          outline-none
          text-[#666666]
          "
        >
          {options.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <img
          src="/assets/images/Register/Keyboard Arrow Down.png"
          alt=""
          className="
          absolute
          left-5
          top-1/2
          -translate-y-1/2
          w-5
          h-5
          pointer-events-none
          "
        />
      </div>
    </div>
  );
}

/* ================= PHONE COMPONENT ================= */

function PhoneInput() {
  return (
    <div>
      <label
        className="
        flex
        justify-end
        items-center
        gap-2
        mb-3
        text-[#174B57]
        text-[14px]
        font-medium
        "
      >
        <span>رقم الهاتف</span>

        <img
          src="/assets/images/Register/PhoneCall.png"
          alt=""
          className="w-5 h-5 object-contain"
        />
      </label>

      <div
        className="
        h-[54px]
        border
        border-[#174B57]
        rounded-[9px]
        flex
        items-center
        px-5
        "
      >
        <input
          type="text"
          placeholder="أدخل رقم الهاتف"
          dir="rtl"
          className="
          flex-1
          bg-transparent
          outline-none
          text-right
          text-[#333]
          pr-2
          "
        />

        <div className="flex items-center gap-3 ml-4">
          <div className="w-px h-6 bg-[#D9D9D9]" />

          <span className="text-[#333] text-[15px]">+963</span>
        </div>
      </div>
    </div>
  );
}
