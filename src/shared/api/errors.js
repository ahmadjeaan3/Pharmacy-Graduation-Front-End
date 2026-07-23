export function getApiErrorMessage(error) {
  if (!error.response)
    return "تعذر الوصول إلى خدمات المنصة حالياً. تحقق من اتصالك ثم حاول مجدداً.";
  const { status, data } = error.response;
  if (status === 401) return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  if (status === 403) return "لا تملك صلاحية تنفيذ هذه العملية.";
  if (status === 429)
    return "تم إرسال عدد كبير من الطلبات. انتظر قليلاً ثم حاول مجدداً.";

  if (data?.errors) {
    const firstError = Object.values(data.errors).flat().find(Boolean);
    if (firstError) return translateServerMessage(firstError);
  }
  if (typeof data === "string" && data.trim())
    return translateServerMessage(data);
  if (data?.detail) return translateServerMessage(data.detail);
  if (data?.error) return translateServerMessage(data.error);
  if (status === 400)
    return "تعذر قبول البيانات المدخلة. راجع الحقول وحاول مجدداً.";
  if (data?.title) return translateServerMessage(data.title);
  return "حدث خطأ غير متوقع. حاول مرة أخرى.";
}

function translateServerMessage(message) {
  const text = String(message);
  const normalized = text.toLowerCase();
  if (
    normalized.includes("already taken") ||
    normalized.includes("duplicateemail") ||
    normalized.includes("duplicateusername")
  )
    return "البريد الإلكتروني مسجل مسبقاً. استخدم بريداً آخر أو سجّل الدخول.";
  if (normalized.includes("confirm") && normalized.includes("password"))
    return "كلمة المرور وتأكيدها غير متطابقين.";
  if (
    normalized.includes("password") &&
    (normalized.includes("uppercase") ||
      normalized.includes("lowercase") ||
      normalized.includes("digit") ||
      normalized.includes("special") ||
      normalized.includes("non alphanumeric") ||
      normalized.includes("characters long"))
  )
    return "كلمة المرور لا تحقق متطلبات الأمان المطلوبة.";
  if (normalized.includes("latitude and longitude"))
    return "يجب إرسال خط العرض وخط الطول معاً.";
  if (normalized.includes("organization has no verification documents"))
    return "لا تحتوي المنظمة على مستندات تحقق قابلة للمراجعة.";
  if (
    normalized.includes("verification document") &&
    normalized.includes("not found")
  )
    return "تعذر العثور على مستند التحقق المطلوب.";
  if (normalized.includes("organization was not found"))
    return "تعذر العثور على المنظمة المطلوبة.";
  if (normalized.includes("pharmacy was not found"))
    return "تعذر العثور على الصيدلية المطلوبة.";
  if (normalized.includes("inventory item was not found"))
    return "تعذر العثور على عنصر المخزون المطلوب.";
  if (normalized.includes("medicine was not found in the master catalog"))
    return "تعذر العثور على الدواء في الدليل المعتمد.";
  if (normalized.includes("medicine name is required"))
    return "اسم الدواء مطلوب ولا يمكن أن يكون فارغًا.";
  if (normalized.includes("cannot be marked as available"))
    return "لا يمكن تأكيد توفر الدواء لأن كميته غير متاحة حاليًا في المخزون.";
  if (normalized.includes("medicine request was not found"))
    return "تعذر العثور على طلب الدواء المطلوب.";
  if (normalized.includes("external pharmacy location was not found"))
    return "تعذر مطابقة موقع الصيدلية المحدد.";
  if (
    normalized.includes("working periods") ||
    normalized.includes("open time")
  )
    return "راجع ساعات الفتح والإغلاق وتأكد من عدم تداخلها.";
  if (
    normalized.includes("donation campaign") &&
    normalized.includes("not active")
  )
    return "الحملة المختارة ليست نشطة حاليًا.";
  if (normalized.includes("does not accept public donations"))
    return "الحملة المختارة لا تستقبل تبرعات عامة حاليًا.";
  if (
    normalized.includes("target organization") &&
    normalized.includes("not found")
  )
    return "تعذر العثور على المنظمة المختارة.";
  if (normalized.includes("selected organization is not available"))
    return "المنظمة المختارة غير متاحة حاليًا.";
  if (normalized.includes("campaign does not belong"))
    return "الحملة المختارة لا تتبع المنظمة المحددة.";
  if (normalized.includes("target organization or campaign"))
    return "اختر منظمة مستفيدة أو حملة نشطة.";
  if (normalized.includes("expiry date must be in the future"))
    return "يجب أن يكون تاريخ صلاحية الدواء في المستقبل.";
  if (normalized.includes("needed before date cannot be in the past"))
    return "لا يمكن أن يكون تاريخ الاحتياج في الماضي.";
  if (normalized.includes("organization account is waiting for admin approval"))
    return "يجب اعتماد حساب المنظمة قبل تنفيذ هذه العملية.";
  if (normalized.includes("organization profile was not found"))
    return "تعذر العثور على ملف المنظمة المرتبط بالحساب.";
  if (normalized.includes("donation campaign was not found"))
    return "تعذر العثور على الحملة المطلوبة.";
  if (normalized.includes("donation offer was not found"))
    return "تعذر العثور على عرض التبرع المطلوب.";
  if (normalized.includes("donation offer can no longer be reviewed"))
    return "لا يمكن تعديل عرض التبرع بعد وصوله إلى حالته النهائية.";
  if (normalized.includes("assistance request was not found"))
    return "تعذر العثور على طلب المساعدة المطلوب.";
  if (normalized.includes("assistance request can no longer be updated"))
    return "لا يمكن تعديل طلب المساعدة بعد وصوله إلى حالته النهائية.";
  if (normalized.includes("campaign end date must be later"))
    return "يجب أن يكون تاريخ نهاية الحملة بعد تاريخ بدايتها.";
  if (normalized.includes("verification document type is not supported"))
    return "نوع مستند التحقق المحدد غير مدعوم.";
  if (normalized.includes("only pdf, png, jpg"))
    return "الصيغ المقبولة للمستند هي PDF وPNG وJPG فقط.";
  if (normalized.includes("verification document size"))
    return "يجب ألا يتجاوز حجم مستند التحقق 10 ميغابايت.";
  if (normalized.includes("chat session") && normalized.includes("not found"))
    return "تعذر العثور على المحادثة المطلوبة.";
  if (normalized.includes("chat session has already ended"))
    return "انتهت هذه المحادثة. ابدأ محادثة جديدة للمتابعة.";
  if (normalized.includes("invalid request"))
    return "تعذر قبول البيانات المدخلة. راجع الحقول وحاول مجدداً.";
  return text;
}
