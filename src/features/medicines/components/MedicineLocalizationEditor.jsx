import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Languages, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { medicineKeys, updateMedicineLocalization } from "../api/medicinesApi";

const newAlias = () => ({ value: "", language: "ar", aliasType: "Common" });

export function MedicineLocalizationEditor({ medicine }) {
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState(() => fromMedicine(medicine));

  const save = useMutation({
    mutationFn: (payload) => updateMedicineLocalization(medicine.id, payload),
    onSuccess: async () => {
      setEditing(false);
      setNotice({ ok: true, text: "تم حفظ الاسم العربي وأسماء البحث بنجاح." });
      await Promise.all([
        client.invalidateQueries({
          queryKey: medicineKeys.detail(medicine.id),
        }),
        client.invalidateQueries({ queryKey: medicineKeys.root }),
      ]);
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });

  const aliases = medicine.aliases || [];

  if (!editing) {
    return (
      <section className="overflow-hidden rounded-[1.55rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
        <div className="flex flex-col gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
              <Languages size={20} />
            </span>
            <div>
              <h2 className="font-black text-[#29464D]">
                الاسم العربي وأسماء البحث
              </h2>
              <p className="mt-0.5 text-xs text-[#829499]">
                تحسين العثور على الدواء بالعربية والإنجليزية
              </p>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              setNotice(null);
              setForm(fromMedicine(medicine));
              setEditing(true);
            }}
          >
            <Languages size={17} /> تعديل بيانات التعريب
          </button>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <ReadOnlyValue
            label="الاسم التجاري بالعربية"
            value={medicine.arabicName}
          />
          <ReadOnlyValue
            label="الاسم العلمي بالعربية"
            value={medicine.arabicScientificName}
          />
          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-bold text-[#71858a]">
              أسماء البحث البديلة
            </p>
            {aliases.length ? (
              <div className="flex flex-wrap gap-2">
                {aliases.map((alias, index) => (
                  <span
                    key={`${alias.value}-${index}`}
                    className="rounded-full border border-[#cfe4e7] bg-[#eef7f6] px-3 py-1.5 text-xs font-bold text-[#216474]"
                  >
                    {alias.value} ·{" "}
                    {String(alias.language || "ar").toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-[#f7faf9] p-4 text-sm text-[#829499]">
                لا توجد أسماء بحث إضافية.
              </p>
            )}
          </div>
          {notice && <Notice notice={notice} />}
        </div>
      </section>
    );
  }

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const updateAlias = (index, key, value) =>
    setForm((current) => ({
      ...current,
      aliases: current.aliases.map((alias, aliasIndex) =>
        aliasIndex === index ? { ...alias, [key]: value } : alias,
      ),
    }));

  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-[#9fc5ca] bg-white shadow-[0_16px_40px_rgba(23,75,87,.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#E6EEF0] bg-[#f5faf9] px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#174b57] text-white">
            <Languages size={20} />
          </span>
          <div>
            <h2 className="font-black text-[#29464D]">تحرير بيانات التعريب</h2>
            <p className="mt-0.5 text-xs text-[#829499]">
              أضف المسميات التي يستخدمها الناس عند البحث
            </p>
          </div>
        </div>
        <button
          className="icon-button grid"
          onClick={() => setEditing(false)}
          aria-label="إلغاء"
        >
          <X size={18} />
        </button>
      </div>
      <form
        className="space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate({
            arabicName: form.arabicName.trim() || null,
            arabicScientificName: form.arabicScientificName.trim() || null,
            aliases: form.aliases
              .map((alias) => ({ ...alias, value: alias.value.trim() }))
              .filter((alias) => alias.value),
          });
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="form-label">الاسم التجاري بالعربية</span>
            <input
              className="form-input"
              dir="rtl"
              maxLength={500}
              value={form.arabicName}
              onChange={setField("arabicName")}
              placeholder="مثال: باراسيتامول"
            />
          </label>
          <label>
            <span className="form-label">الاسم العلمي بالعربية</span>
            <input
              className="form-input"
              dir="rtl"
              maxLength={2000}
              value={form.arabicScientificName}
              onChange={setField("arabicScientificName")}
              placeholder="الاسم العلمي المترجم"
            />
          </label>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#29464d]">
                أسماء البحث البديلة
              </p>
              <p className="mt-1 text-xs text-[#829499]">
                اختصارات أو كتابات شائعة للاسم نفسه
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              disabled={form.aliases.length >= 50}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  aliases: [...current.aliases, newAlias()],
                }))
              }
            >
              <Plus size={16} /> إضافة اسم
            </button>
          </div>
          <div className="space-y-2">
            {form.aliases.map((alias, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-xl border border-[#e1ebed] bg-[#fafcfc] p-3 sm:grid-cols-[1fr_110px_auto]"
              >
                <input
                  className="form-input"
                  maxLength={500}
                  value={alias.value}
                  onChange={(event) =>
                    updateAlias(index, "value", event.target.value)
                  }
                  placeholder="اسم بديل للبحث"
                />
                <select
                  className="form-input"
                  value={alias.language}
                  onChange={(event) =>
                    updateAlias(index, "language", event.target.value)
                  }
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
                <button
                  type="button"
                  className="icon-button grid text-rose-600"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      aliases: current.aliases.filter(
                        (_, aliasIndex) => aliasIndex !== index,
                      ),
                    }))
                  }
                  aria-label="حذف الاسم البديل"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {!form.aliases.length && (
              <p className="rounded-xl bg-[#f7faf9] p-4 text-center text-xs text-[#829499]">
                يمكن إضافة أكثر من اسم عربي أو إنجليزي لنفس الدواء.
              </p>
            )}
          </div>
        </div>

        {save.isError && (
          <Notice
            notice={{ ok: false, text: getApiErrorMessage(save.error) }}
          />
        )}
        <div className="flex justify-end gap-2 border-t border-[#174b57]/8 pt-5">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEditing(false)}
          >
            إلغاء
          </button>
          <button className="btn-primary" disabled={save.isPending}>
            <Save size={17} />{" "}
            {save.isPending ? "جاري الحفظ..." : "حفظ التعريب"}
          </button>
        </div>
      </form>
    </section>
  );
}

function fromMedicine(medicine) {
  return {
    arabicName: medicine.arabicName || "",
    arabicScientificName: medicine.arabicScientificName || "",
    aliases: (medicine.aliases || []).map((alias) => ({
      value: alias.value || "",
      language: alias.language === "en" ? "en" : "ar",
      aliasType: alias.aliasType || "Common",
    })),
  };
}

function ReadOnlyValue({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-4">
      <p className="text-[11px] text-[#829499]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#29464D]">
        {value || "غير محدد"}
      </p>
    </div>
  );
}

function Notice({ notice }) {
  return (
    <div
      className={`md:col-span-2 rounded-xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
    >
      {notice.text}
    </div>
  );
}
