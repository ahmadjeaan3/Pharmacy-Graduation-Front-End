import { useNavigate } from "react-router-dom";
export default function Sidebar({ collapsed, setCollapsed, menuItems }) {
  const navigate = useNavigate();
  return (
    <div
      className={`bg-[#216474] h-screen transition-all duration-300 relative flex flex-col ${
        collapsed ? "w-[90px]" : "w-[300px]"
      }`}
    >
      {/* TOGGLE */}

      {/* LOGO */}
      <div className="flex justify-center pt-8">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-[-18px] top-10 w-9 h-9 rounded-full bg-[#216474] text-white flex items-center justify-center shadow-lg border border-white z-50"
        >
          <img
            src="/Icons/Untitled/ion_chevron-down-outline.png"
            alt="toggle"
            className="w-4 h-4 object-contain"
          />
        </button>
        <img
          src="/assets/app/brand/dawaai-mark.png"
          alt=""
          className={`transition-all duration-300 ${
            collapsed ? "w-[0px]" : "w-[180px]"
          }`}
        />
      </div>

      {/* MENU */}
      <div className="mt-10 px-4 flex flex-col gap-1" dir="ltr">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className={`h-[56px] rounded-[10px] flex items-center cursor-pointer transition-all duration-200 ${
              collapsed ? "justify-center" : "justify-between px-5"
            } ${
              item.active
                ? "bg-[rgba(232,237,240,0.41)]"
                : "hover:bg-[rgba(255,255,255,0.07)]"
            }`}
          >
            {!collapsed && (
              <span className="text-white text-right text-[20px] font-medium w-full mr-8">
                {item.title}
              </span>
            )}

            <img
              src={item.icon}
              alt=""
              className="w-[28px] h-[28px] object-contain"
            />
          </div>
        ))}
      </div>

      {/* LOGOUT */}
      <div className="mt-auto px-4 pb-8" dir="ltr">
        <div
          className={`h-[56px] rounded-[10px] flex items-center cursor-pointer ${
            collapsed ? "justify-center" : "justify-between px-5"
          } hover:bg-[rgba(255,255,255,0.07)]`}
        >
          {!collapsed && (
            <span className="text-white text-right text-[20px] font-medium w-full mr-8">
              تسجيل الخروج
            </span>
          )}

          <img
            src="/Icons/Untitled/Vector (5).png"
            alt=""
            className="w-[28px] h-[28px]"
          />
        </div>
      </div>
    </div>
  );
}
