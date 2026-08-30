export const ROLE_PRIORITY = [
  "Admin",
  "Warehouse",
  "Representative",
  "Pharmacy",
  "Organization",
  "User",
];

export function normalizeRoleNames(roles = []) {
  const values = Array.isArray(roles) ? roles : [roles];

  return [
    ...new Set(
      values
        .map((value) =>
          ROLE_PRIORITY.find(
            (role) =>
              role.toLowerCase() ===
              String(value || "")
                .trim()
                .toLowerCase(),
          ),
        )
        .filter(Boolean),
    ),
  ];
}
