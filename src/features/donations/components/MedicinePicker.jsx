import { useQuery } from "@tanstack/react-query";
import { Check, LoaderCircle, Pill, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { getMedicines, medicineKeys } from "../../medicines/api/medicinesApi";

export function MedicinePicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setQueryTerm(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const params = { searchTerm: queryTerm, pageNumber: 1, pageSize: 8 };
  const query = useQuery({
    queryKey: medicineKeys.list(params),
    queryFn: () => getMedicines(params),
    placeholderData: (previous) => previous,
  });

  return (
    <div>
      <span className="form-label">الدواء</span>
      <div className="field-control">
        <input
          className="form-input has-field-icon"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث باسم الدواء أو الاسم العلمي"
          maxLength={200}
        />
        <span className="field-icon-shell">
          {query.isFetching ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Search size={17} />
          )}
        </span>
      </div>
      {query.isError && (
        <p className="mt-2 text-xs font-bold text-rose-600">
          {getApiErrorMessage(query.error)}
        </p>
      )}
      {!query.isError && (
        <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
          {(query.data?.items || []).map((medicine) => {
            const selected = value?.id === medicine.id;
            return (
              <button
                key={medicine.id}
                type="button"
                onClick={() => onChange(medicine)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-start transition ${selected ? "border-[#216474]/35 bg-[#eaf4f3]" : "border-[#174b57]/8 bg-white hover:border-[#216474]/25"}`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${selected ? "bg-[#216474] text-white" : "bg-[#f2f7f6] text-[#216474]"}`}
                >
                  {selected ? <Check size={17} /> : <Pill size={17} />}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm text-[#29464d]">
                    {medicine.name}
                  </strong>
                  <small className="mt-0.5 block truncate text-[11px] text-[#829499]">
                    {medicine.scientificName ||
                      medicine.manufacturer ||
                      "دواء مسجل في الدليل"}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      )}
      {!query.isLoading && !query.isError && !query.data?.items?.length && (
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
          لا يوجد دواء مطابق في الدليل.
        </p>
      )}
    </div>
  );
}
