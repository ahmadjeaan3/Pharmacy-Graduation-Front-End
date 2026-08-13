import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div
      className="
      w-full
      h-screen
      overflow-hidden
      bg-white
      "
    >
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

          {/* LOGO RIGHT */}

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

            <div
              className="
              w-[1px]
              h-[40px]
              bg-[#666666]
              "
            />

            <img
              src="/assets/images/Login/LOGO (2).png"
              alt=""
              className="
              w-[62px]
              h-[60px]
              object-contain
              "
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
        {/* ================= IMAGE LEFT ================= */}

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
            className="
            w-[1000px]
            h-full
           
            "
          />

          <div
            className="
            absolute
            inset-0
         
            "
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
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
              سجل دخولك للوصول إلى خدماتنا
              <br />
              بكل سهولة وأمان
            </p>
          </motion.div>
        </section>

        {/* ================= FORM RIGHT ================= */}

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
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="
            w-[429px]
            "
          >
            {/* TITLE */}

            <div
              className="
              text-center
              mb-[44px]
              "
            >
              <h1
                className="
                text-[48px]
                font-bold
                text-[#174B57]
                "
              >
                أهلاً بعودتك
              </h1>

              <p
                className="
                mt-5
                text-[16px]
                text-[#A5A5A5]
                "
              >
                تملك حساباً مسبقاً، تسجيل الدخول باستخدام ايميلك
              </p>
            </div>

            {/* FORM START */}

            <form
              className="
              flex
              flex-col
              gap-5
              "
            >
              {/* EMAIL */}

              <Input
                label="البريد الالكتروني"
                icon="/assets/images/Login/Envelope.png"
                placeholder="raghada@gmail.com"
              />

              {/* PASSWORD */}

              <Input
                label="كلمة المرور"
                icon="/assets/images/Login/LockKey.png"
                placeholder="********"
                type="password"
                password
              />
              {/* CHECKBOX */}

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
                <span>قبول سياسة الخصوصية والشروط</span>

                <input
                  type="checkbox"
                  defaultChecked
                  className="
    w-5
    h-5
    rounded-[10px]
    accent-[#216474]
    cursor-pointer
  "
                />
              </label>

              {/* BUTTON */}

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
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
                تسجيل الدخول
              </button>

              {/* REGISTER */}

              <p
                className="
                text-center
                text-[#2E2E2E]
                text-[16px]
                "
              >
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="
                  text-[#216474]
                  font-semibold
                  mr-2
                  "
                >
                  إنشاء حساب
                </button>
                لا تملك حساباً؟
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

      <div
        className="
        relative
        "
      >
        <input
          type={type}
          placeholder={placeholder}
          className="
          w-full
          h-[54px]
          border
          border-[#174B57]
          rounded-[9px]
          px-5
            text-right
          text-[#333]
          outline-none
          focus:border-[#216474]
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
