export const formatMedicineCurrency = (value) =>
  `${new Intl.NumberFormat("ar-SY-u-nu-latn", { maximumFractionDigits: 2 }).format(value ?? 0)} ل.س`;
export const formatMedicineNumber = (value) =>
  new Intl.NumberFormat("ar-SA-u-nu-latn").format(value ?? 0);
export const medicineSubtitle = (medicine) =>
  [medicine.scientificName, medicine.dosageForm, medicine.capacity]
    .filter(Boolean)
    .join(" • ") || "لا توجد تفاصيل إضافية";
