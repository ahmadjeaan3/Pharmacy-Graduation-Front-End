import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LoaderCircle, MapPin } from "lucide-react";
import { useState } from "react";

import { updateUserLocation, userKeys } from "../api/userApi";
import { getApiErrorMessage } from "../../../shared/api/errors";

export function LocationAction({ compact = false, onUpdated }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: updateUserLocation,

    onSuccess: async (profile) => {
      setMessage("تم تحديث موقعك بنجاح");

      await queryClient.invalidateQueries({
        queryKey: userKeys.root,
      });

      onUpdated?.(profile);
    },

    onError: (error) => {
      setMessage(getApiErrorMessage(error));
    },
  });

  const requestLocation = () => {
    setMessage("");

    if (!navigator.geolocation) {
      setMessage("ميزة تحديد الموقع غير متاحة على هذا الجهاز");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mutation.mutate({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
          source: "BrowserGps",
        });
      },

      () => {
        setMessage(
          "تعذر تحديد الموقع. تأكد من السماح بالوصول إلى موقعك.",
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 60_000,
      },
    );
  };

  return (
    <div className={compact ? "relative shrink-0" : "relative space-y-2"}>
      <button
        type="button"
        onClick={requestLocation}
        disabled={mutation.isPending}
        className="
          inline-flex
          h-10 min-w-[145px] shrink-0
          items-center justify-center gap-2
          whitespace-nowrap
          rounded-full
          border-0
          bg-[#E6F3F6]
          px-4
          text-[13px] font-medium
          text-[#174B57]
          transition-colors duration-200
          hover:bg-[#D9EDF1]
          focus:outline-none
          disabled:cursor-not-allowed
          disabled:opacity-70
        "
      >
        {/* أيقونة الموقع */}
        {mutation.isPending ? (
          <LoaderCircle
            size={16}
            strokeWidth={1.8}
            className="shrink-0 animate-spin text-[#216474]"
          />
        ) : (
          <MapPin
            size={16}
            strokeWidth={1.8}
            className="shrink-0 text-[#216474]"
          />
        )}

        {/* النص */}
        <span className="shrink-0 whitespace-nowrap">
          {mutation.isPending
            ? "جاري التحديد..."
            : "موقعي الحالي"}
        </span>

        {/* السهم الصغير مثل الفيگما */}
        {!mutation.isPending && (
          <ChevronDown
            size={15}
            strokeWidth={1.8}
            className="shrink-0 text-[#216474]"
          />
        )}
      </button>

      {message && !compact && (
        <p
          className={`text-xs font-semibold ${
            mutation.isError
              ? "text-rose-600"
              : "text-emerald-600"
          }`}
        >
          {message}
        </p>
      )}

      {message && compact && mutation.isError && (
        <p
          className="
            absolute end-0 top-[calc(100%+8px)] z-50
            w-64 rounded-lg bg-white
            px-3 py-2
            text-right text-[11px] font-semibold
            text-rose-600
            shadow-lg
          "
        >
          {message}
        </p>
      )}
    </div>
  );
}