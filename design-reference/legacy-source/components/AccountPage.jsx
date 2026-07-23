import profileImg from "../../public/Icons/Settings/profile.png";
import userIcon from "../../public/Icons/Settings/user.png";
import emailIcon from "../../public/Icons/Settings/email.png";
import phoneIcon from "../../public/Icons/Settings/phone.png";
import backupIcon from "../../public/Icons/Settings/backup.png";

export default function AccountPage() {
  return (
    <div dir="rtl" className="h-screen bg-white p-4 overflow-hidden">
      {/* عنوان الصفحة */}
      <div className="flex justify-start mt-5 mb-4">
        <div className="w-[350px] h-[50px] border border-[#216474] rounded-[10px] flex items-center justify-center dir=ltr">
          <h1 className="text-[#216474] text-[18px] font-bold">الحساب</h1>
        </div>
      </div>

      {/* القسم العلوي */}
      <div className="grid grid-cols-12 gap-4">
        {/* معلومات الحساب */}
        <div className="col-span-3 border border-[#E0E0E0] rounded-[10px] p-4 ">
          <h2 className="text-center text-[18px] font-bold mb-4 mt-5" dir="ltr">
            معلومات الحساب
          </h2>

          <div className="space-y-4 text-center">
            <div>
              <h3 className="font-semibold text-[16px] mb-1">آخر تسجيل دخول</h3>
              <p className="text-[#B2B2B2]">2026-05-20 10:30 AM</p>
            </div>

            <div>
              <h3 className="font-semibold text-[20px] mb-1">
                تاريخ إنشاء الحساب
              </h3>
              <p className="text-[#B2B2B2]">2026-01-15</p>
            </div>

            <div>
              <h3 className="font-semibold text-[20px] mb-1">
                المنطقة الزمنية
              </h3>
              <p className="text-[#B2B2B2]">دمشق (GMT+03:00)</p>
            </div>

            <div>
              <h3 className="font-semibold text-[20px] mb-1">اللغة</h3>
              <p className="text-[#B2B2B2]">العربية</p>
            </div>
          </div>
        </div>

        {/* تغيير كلمة المرور */}
        {/* تغيير كلمة المرور */}
        <div className="col-span-4 border border-[#E0E0E0] rounded-[10px] p-4">
          <h2 className="text-center text-[18px] font-medium mb-10 mt-5">
            تغيير كلمة المرور
          </h2>

          <div className="space-y-3 ">
            <input
              type="password"
              placeholder="كلمة المرور الحالية"
              className="w-100 h-[44px] border border-[#E0E0E0] rounded-[10px] px-4 text-right text-sm mr-13"
            />

            <input
              type="password"
              placeholder="كلمة المرور الجديدة"
              className="w-100 h-[44px] border border-[#E0E0E0] rounded-[10px] px-4 text-right text-sm mr-13"
            />

            <input
              type="password"
              placeholder="تأكيد كلمة المرور الجديدة"
              className="w-100 h-[44px] border border-[#E0E0E0] rounded-[10px] px-4 text-right text-sm mr-13"
            />

            <div className="flex justify-center pt-2">
              <button
                className="
        mt-5
          w-[220px]
          h-[44px]
          bg-[#216474]
          rounded-[10px]
          text-white
          text-[15px]
          font-medium
        "
              >
                تحديث كلمة المرور
              </button>
            </div>
          </div>
        </div>

        {/* إعدادات الحساب */}
        <div className="col-span-5 border border-[#E0E0E0] rounded-[10px] p-4">
          <h2 className="text-center text-[18px] font-bold mb-5 mt-5">
            إعدادات الحساب
          </h2>

          <div className="flex gap-5">
            {/* الحقول */}
            <div className="flex-1 mr-5">
              <label className="block mb-2 text-sm font-medium">
                الاسم الكامل
              </label>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    defaultValue="أدمن النظام"
                    className="
              w-100
              h-[42px]
              border
              border-[#E0E0E0]
              rounded-[10px]
              pr-10
              text-[#717171]
              text-sm
            "
                  />

                  <img
                    src={userIcon}
                    alt=""
                    className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
            "
                  />
                </div>

                <div className="relative">
                  <input
                    defaultValue="admin@gmail.com"
                    className="
              w-100
              h-[42px]
              border
              border-[#E0E0E0]
              rounded-[10px]
              pr-10
              text-[#717171]
              text-sm
            "
                  />

                  <img
                    src={emailIcon}
                    alt=""
                    className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
            "
                  />
                </div>

                <div className="relative">
                  <input
                    defaultValue="+966 770 123 4567"
                    className="
      w-100
      h-[42px]
      border
      border-[#E0E0E0]
      rounded-lg
      pr-10
      text-[#717171]
      text-sm
    "
                  />

                  <img
                    src={phoneIcon}
                    alt=""
                    className="
      absolute
      right-3
      top-1/2
      -translate-y-1/2
      w-4
      h-4
    "
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  className="
    mt-5
      w-[240px]
      h-[42px]
      bg-[#216474]
      rounded-lg
      text-white
      text-sm
      font-medium
      hover:bg-[#1b5563]
      transition
    "
                >
                  حفظ التغيرات
                </button>
              </div>
            </div>
            {/* الصورة */}
            <div className="flex flex-col items-center ml-20">
              <img
                src={profileImg}
                alt=""
                className="
          w-[80px]
          h-[80px]
          rounded-full
          object-cover
        "
              />

              <button
                className="
          mt-4
          w-[130px]
          h-[36px]
          bg-[#FF9C0B]
          rounded-[10px]
          text-white
          text-[13px]
        "
              >
                تغيير الصورة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* النسخ الاحتياطي */}
      <div className="mt-8">
        <div className="flex justify-start mb-4">
          <div className="w-[320px] h-[50px] border border-[#216474] rounded-lg flex items-center justify-center">
            <h2 className="text-[#216474] text-lg font-bold">
              النسخ الاحتياطي
            </h2>
          </div>
        </div>

        <div className="inline-block w-150 h-60 border border-[#E0E0E0] rounded-lg p-5">
          <div className="flex justify-between items-center m-5">
            <div>
              <h3 className="font-bold text-base mb-2">النسخ الاحتياطي</h3>

              <p className="text-sm mb-1">آخر نسخ احتياطي</p>

              <p className="text-[#B2B2B2] text-sm">تاريخ النسخ الاحتياطي</p>
            </div>

            <div className="text-left">
              <p className="text-[#B2B2B2] text-sm mb-1">آخر نسخ احتياطي</p>

              <p className="text-[#B2B2B2] text-sm">2026-05-19 02:00 AM</p>
            </div>
          </div>

          <div className="mt-5 flex justify-start">
            <button
              className="
        w-66
        h-13
          flex
          items-center
          gap-2
          border
          border-[#216474]
          rounded-lg
          px-5
          py-2
          text-sm
          hover:bg-[#F3F8F9]
          transition
        "
            >
              <img src={backupIcon} alt="" className="w-6 h-5" />

              <span>إنشاء نسخة احتياطية الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
