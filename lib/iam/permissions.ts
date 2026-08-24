export type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

export type Permission =
  // Assets
  | "assets:create"
  | "assets:edit"
  | "assets:delete"
  | "assets:view"

  // Tickets
  | "tickets:create"
  | "tickets:view"
  | "tickets:edit"
  | "tickets:delete"

  // Maintenance
  | "maintenance:create"
  | "maintenance:view"
  | "maintenance:edit"
  | "maintenance:complete"
  | "maintenance:delete"

  // Microsoft 365
  | "m365:view"
  | "m365:manage"

  // IAM / Windows Server
  | "iam:view"
  | "iam:manage"

  // Monitoring
  | "monitoring:view"
  | "monitoring:acknowledge"
  | "monitoring:resolve"
  | "monitoring:manage"

  // Backup & Recovery
  | "backup:view"
  | "backup:restore"
  | "backup:manage";

const rolePermissions: Record<UserRole, Permission[]> = {
  "IT Admin": [
    // Assets
    "assets:create",
    "assets:edit",
    "assets:delete",
    "assets:view",

    // Tickets
    "tickets:create",
    "tickets:view",
    "tickets:edit",
    "tickets:delete",

    // Maintenance
    "maintenance:create",
    "maintenance:view",
    "maintenance:edit",
    "maintenance:complete",
    "maintenance:delete",

    // Microsoft 365
    "m365:view",
    "m365:manage",

    // IAM / Windows Server
    "iam:view",
    "iam:manage",

    // Monitoring
    "monitoring:view",
    "monitoring:acknowledge",
    "monitoring:resolve",
    "monitoring:manage",

    // Backup & Recovery
    "backup:view",
    "backup:restore",
    "backup:manage",
  ],

  "IT Support": [
    // Assets
    "assets:view",
    "assets:edit",

    // Tickets
    "tickets:create",
    "tickets:view",
    "tickets:edit",

    // Maintenance
    "maintenance:create",
    "maintenance:view",
    "maintenance:edit",
    "maintenance:complete",

    // Microsoft 365
    "m365:view",

    // Monitoring
    "monitoring:view",
    "monitoring:acknowledge",
    "monitoring:resolve",

    // Backup & Recovery
    "backup:view",
  ],

  Employee: [
    // Assets
    "assets:view",

    // Tickets
    "tickets:create",
    "tickets:view",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission,
) {
  return rolePermissions[role]?.includes(permission) ?? false;
}
