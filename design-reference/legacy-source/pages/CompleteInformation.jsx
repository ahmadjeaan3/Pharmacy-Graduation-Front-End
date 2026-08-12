import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CompleteInformation() {
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
              onClick={() => navigate("/")}
              className="text-[#666666] text-[18px] font-medium"
            >
              الرئيسية
            </button>

            <div className="w-px h-10 bg-[#666666]" />

            <img
              src="/assets/app/brand/dawaai-mark.png"
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
        {/* ================= LEFT IMAGE ================= */}

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

          <div className="absolute inset-0 " />

          {/* BACK BUTTON */}

          <button
            onClick={() => navigate(-1)}
            className="
              absolute
              top-10
              left-10
              w-[54px]
              h-[54px]
              rounded-full
              bg-white
              border
              border-[#E8E8E8]
              flex
              items-center
              justify-center
              shadow-sm
              z-20
            "
          >
            <img
              src="/assets/images/Register/arrow_left.png"
              alt=""
              className="w-5 h-5"
            />
          </button>

          {/* TEXT */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="
              absolute
              top-[120px]
              left-1/2
              -translate-x-1/2
              w-[420px]
              text-center
              text-white
              z-20
            "
          >
            <h2
              className="
                text-[30px]
                font-bold
                leading-[48px]
              "
            >
              أهلاً وسهلاً بك في دوائي
            </h2>

            <p
              className="
                mt-5
                text-[20px]
                leading-[36px]
                font-medium
              "
            >
              نحن هنا لنرافقك في رحلتك الصحية
              <br />
              سجّل دخولك للوصول إلى خدماتنا
              <br />
              بكل سهولة وأمان
            </p>
          </motion.div>
        </section>

        {/* ================= RIGHT SIDE ================= */}

        <section
          className="
            w-1/2
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
            className="w-[563px]"
          >
            {/* TITLE */}

            <div className="text-center mb-10">
              <h1
                className="
                  text-[48px]
                  font-bold
                  text-[#174B57]
                "
              >
                استكمال المعلومات
              </h1>

              <p
                className="
                  mt-5
                  text-[16px]
                  text-[#A5A5A5]
                "
              >
                يرجى إدخال المعلومات التالية لتفعيل حساب الصيدلية في دوائي.
                في
              </p>
            </div>

            <form className="flex flex-col gap-6">
              {/* ================= ROW 1 ================= */}

              <div className="grid grid-cols-2 gap-5">
                <PhoneInput />

                <Input
                  label="اسم المالك"
                  icon="/assets/images/Register/User.png"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              {/* ================= ROW 2 ================= */}

              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="العنوان"
                  icon="/assets/images/Register/MapPin.png"
                  placeholder="أدخل العنوان"
                />

                <SelectInput
                  label="المدينة"
                  icon="/assets/images/Register/MapPin.png"
                  options={["اختر من القائمة", "إدلب", "حلب", "دمشق", "حمص"]}
                />
              </div>

              {/* ================= ROW 3 ================= */}

              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="رقم الترخيص"
                  icon="/assets/images/Register/ShieldCheck.png"
                  placeholder="أدخل رقم الترخيص"
                />

                <Input
                  label="اسم الصيدلية"
                  icon="/assets/images/CompleteInformation/Asclepius.png"
                  placeholder="أدخل اسم الصيدلية"
                />
              </div>

              {/* ================= UPLOAD ================= */}

              <UploadBox />

              {/* ================= BUTTON ================= */}

              <button
                type="button"
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
      <label className="flex justify-end items-center gap-2 mb-3 text-[#174B57] text-[14px] font-medium">
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
            border-[#E8E8E8]
            rounded-[9px]
            pr-5
            pl-12
            text-right
            text-[14px]
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

/* ================= SELECT ================= */

function SelectInput({ label, icon, options }) {
  return (
    <div>
      <label className="flex justify-end items-center gap-2 mb-3 text-[#174B57] text-[14px] font-medium">
        <span>{label}</span>

        <img src={icon} alt="" className="w-5 h-5" />
      </label>

      <div className="relative">
        <select
          dir="rtl"
          className="
            w-full
            h-[54px]
            border
            border-[#E8E8E8]
            rounded-[9px]
            pr-5
            pl-12
            appearance-none
            outline-none
            text-right
            text-[#666]
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

/* ================= PHONE ================= */

function PhoneInput() {
  return (
    <div>
      <label className="flex justify-end items-center gap-2 mb-3 text-[#174B57] text-[14px] font-medium">
        <span>رقم الهاتف</span>

        <img
          src="/assets/images/Register/PhoneCall.png"
          alt=""
          className="w-5 h-5"
        />
      </label>

      <div
        className="
          h-[54px]
          border
          border-[#E8E8E8]
          rounded-[9px]
          flex
          items-center
          justify-between
          px-5
        "
      >
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#333]">+963</span>

          <div className="w-px h-6 bg-[#D9D9D9]" />
        </div>

        <input
          type="text"
          dir="rtl"
          placeholder="أدخل رقم الهاتف"
          className="
           w-full
           min-w-0
            flex-1
            bg-transparent
            outline-none
            text-right
            text-[14px]
           
            pr-4
          "
        />
      </div>
    </div>
  );
}

/* ================= UPLOAD ================= */

function UploadBox() {
  return (
    <div>
      <label className="block text-right text-[#174B57] text-[14px] font-medium mb-3">
        رفع صورة الترخيص
      </label>

      <div
        className="
          border
          border-dashed
          border-[#A5A5A5]
          rounded-[8px]
          h-[191px]
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <img
          src="/assets/images/CompleteInformation/ant-design_cloud-upload-outlined.png"
          alt=""
          className="w-8 h-8 mb-4"
        />

        <p className="text-[#A5A5A5] text-[14px]">
          اختر الملف وارفعه عبر السحب والإفلات
        </p>

        <p className="text-[#A5A5A5] text-[12px] mt-2">أو عبر التصفح</p>

        <button
          type="button"
          className="
            mt-5
            bg-[#174B57]
            text-white
            px-6
            py-2
            rounded-md
            text-[12px]
            hover:bg-[#216474]
            transition
          "
        >
          تصفح
        </button>
      </div>
    </div>
  );
}
