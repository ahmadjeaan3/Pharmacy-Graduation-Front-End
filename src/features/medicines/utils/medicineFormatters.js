export const formatMedicineCurrency = (value) =>
  `${new Intl.NumberFormat("ar-SY", { maximumFractionDigits: 2 }).format(value ?? 0)} ل.س`;
export const formatMedicineNumber = (value) =>
  new Intl.NumberFormat("ar-SA").format(value ?? 0);
export const medicineSubtitle = (medicine) =>
  [medicine.scientificName, medicine.dosageForm, medicine.capacity]
    .filter(Boolean)
    .join(" • ") || "لا توجد تفاصيل إضافية";
