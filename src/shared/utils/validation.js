const PERSON_NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’\-]*$/u;
const SYRIAN_PHONE_PATTERN = /^(?:09\d{8}|0[1-8]\d{7,8}|\+9639\d{8}|\+963[1-8]\d{7,8}|009639\d{8}|00963[1-8]\d{7,8})$/;

export function normalizePhoneNumber(value = "") {
  return String(value).trim().replace(/[\s()\-]/g, "");
}

export function isValidSyrianPhoneNumber(value) {
  return SYRIAN_PHONE_PATTERN.test(normalizePhoneNumber(value));
}

export function isValidPersonName(value) {
  return PERSON_NAME_PATTERN.test(String(value || "").trim());
}
