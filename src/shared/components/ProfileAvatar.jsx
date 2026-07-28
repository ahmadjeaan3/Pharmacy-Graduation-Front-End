import { UserRound } from "lucide-react";
import { env } from "../config/env";

export function getProfileAvatarUrl(user) {
  if (!user?.userId || !user?.hasProfileImage) return null;
  const version = user.profileImageUpdatedAtUtc
    ? new Date(user.profileImageUpdatedAtUtc).getTime()
    : 0;
  return `${env.apiBaseUrl}/account/avatar/${user.userId}?v=${version}`;
}

export function ProfileAvatar({
  user,
  sizeClass = "size-11",
  className = "",
  fallbackIcon = false,
}) {
  const imageUrl = getProfileAvatarUrl(user);
  const initial = user?.fullName?.trim()?.[0] || "ح";

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f5cb72] font-black text-[#173d46] ${sizeClass} ${className}`}
    >
      {imageUrl ? (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={`الصورة الشخصية لـ ${user.fullName || "الحساب"}`}
          className="size-full object-cover"
        />
      ) : fallbackIcon ? (
        <UserRound className="size-[45%]" />
      ) : (
        initial
      )}
    </span>
  );
}
