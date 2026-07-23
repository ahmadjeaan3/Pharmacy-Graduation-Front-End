import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LocateFixed, LoaderCircle } from "lucide-react";
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
      await queryClient.invalidateQueries({ queryKey: userKeys.root });
      onUpdated?.(profile);
    },
    onError: (error) => setMessage(getApiErrorMessage(error)),
  });

  const requestLocation = () => {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("ميزة تحديد الموقع غير متاحة على هذا الجهاز");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        mutation.mutate({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
          source: "BrowserGps",
        }),
      () => setMessage("تعذر تحديد الموقع. تأكد من السماح بالوصول إلى موقعك."),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
      <button
        type="button"
        onClick={requestLocation}
        disabled={mutation.isPending}
        className={
          compact ? "btn-secondary shrink-0" : "btn-primary justify-center"
        }
      >
        {mutation.isPending ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <LocateFixed size={17} />
        )}
        {mutation.isPending ? "جاري التحديد..." : "تحديث موقعي"}
      </button>
      {message && !compact && (
        <p
          className={`text-xs font-semibold ${mutation.isError ? "text-rose-600" : "text-emerald-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
