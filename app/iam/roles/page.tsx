"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "@/app/components/system/Sidebar";

import {
  defaultIamUsers,
  type IamUser,
} from "@/lib/data/iamUsers";

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  privileged: boolean;
};

const ROLES_STORAGE_KEY = "iamRoles";
const USERS_STORAGE_KEY = "iamUsers";

const defaultRoles: Role[] = [
  {
    id: "ROLE-001",
    name: "IT Admin",
    description:
      "Full infrastructure and identity administration access.",
    privileged: true,
    permissions: [
      "Manage Users",
      "Manage Groups",
      "Reset Passwords",
      "Assign Roles",
      "Manage MFA",
      "View Audit Logs",
    ],
  },
  {
    id: "ROLE-002",
    name: "IT Support",
    description:
      "Operational support access with limited administrative scope.",
    privileged: false,
    permissions: [
      "View Users",
      "Reset Passwords",
      "Unlock Accounts",
      "View Groups",
      "View Tickets",
      "View Departments",
    ],
  },
  {
    id: "ROLE-003",
    name: "HR User",
    description:
      "HR identity lifecycle visibility and employee administration access.",
    privileged: false,
    permissions: [
      "View Users",
      "View Departments",
      "Request Access",
      "View Employment Data",
    ],
  },
  {
    id: "ROLE-004",
    name: "Employee",
    description:
      "Standard enterprise access for general employees.",
    privileged: false,
    permissions: [
      "View Own Profile",
      "Request Access",
    ],
  },
  {
    id: "ROLE-005",
    name: "Network Support",
    description:
      "Network operations, troubleshooting and infrastructure support access.",
    privileged: true,
    permissions: [
      "View Users",
      "View Network Assets",
      "View Tickets",
      "View Security Events",
    ],
  },
];

const permissionCatalog = [
  "Manage Users",
  "View Users",
  "Manage Groups",
  "View Groups",
  "Assign Roles",
  "Reset Passwords",
  "Unlock Accounts",
  "Manage MFA",
  "View Security Events",
  "Review MFA",
  "Review Access Requests",
  "View Audit Logs",
  "View Departments",
  "View Employment Data",
  "Request Access",
  "View Tickets",
  "View Own Profile",
  "View Network Assets",
];

function loadUsers(): IamUser[] {
  if (typeof window === "undefined") {
    return defaultIamUsers;
  }

  const savedUsers =
    window.localStorage.getItem(
      USERS_STORAGE_KEY,
    );

  if (!savedUsers) {
    window.localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(defaultIamUsers),
    );

    return defaultIamUsers;
  }

  try {
    const parsedUsers =
      JSON.parse(savedUsers) as IamUser[];

    return Array.isArray(parsedUsers)
      ? parsedUsers
      : defaultIamUsers;
  } catch {
    return defaultIamUsers;
  }
}

function loadRoles(): Role[] {
  if (typeof window === "undefined") {
    return defaultRoles;
  }

  const savedRoles =
    window.localStorage.getItem(
      ROLES_STORAGE_KEY,
    );

  if (!savedRoles) {
    window.localStorage.setItem(
      ROLES_STORAGE_KEY,
      JSON.stringify(defaultRoles),
    );

    return defaultRoles;
  }

  try {
    const parsedRoles =
      JSON.parse(savedRoles) as Role[];

    if (!Array.isArray(parsedRoles)) {
      return defaultRoles;
    }

    /*
      Migration:
      إذا كانت بيانات الـRoles القديمة ما زالت محفوظة
      نعيد بناءها بالنظام الجديد.

      هذا يمنع ظهور:
      IT Administrator
      HR Coordinator
      Security Reviewer

      بدل الـRoles الحقيقية الموجودة في iamUsers.
    */

    const currentRoleNames =
      defaultRoles.map(
        (role) => role.name,
      );

    const hasOldRoleStructure =
      parsedRoles.some(
        (role) =>
          !currentRoleNames.includes(
            role.name,
          ),
      );

    if (hasOldRoleStructure) {
      window.localStorage.setItem(
        ROLES_STORAGE_KEY,
        JSON.stringify(defaultRoles),
      );

      return defaultRoles;
    }

    /*
      ندمج الصلاحيات المحفوظة مع الـdefaults
      حتى ما نخسر أي Permission أضفناها سابقًا.
    */

    return defaultRoles.map(
      (defaultRole) => {
        const savedRole =
          parsedRoles.find(
            (role) =>
              role.name ===
              defaultRole.name,
          );

        if (!savedRole) {
          return defaultRole;
        }

        return {
          ...defaultRole,
          permissions:
            savedRole.permissions,
        };
      },
    );
  } catch {
    window.localStorage.setItem(
      ROLES_STORAGE_KEY,
      JSON.stringify(defaultRoles),
    );

    return defaultRoles;
  }
}

function saveRoles(
  roles: Role[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    ROLES_STORAGE_KEY,
    JSON.stringify(roles),
  );
}

export default function RolesPage() {
  const [roles, setRoles] =
    useState<Role[]>([]);

  const [users, setUsers] =
    useState<IamUser[]>([]);

  const [
    selectedRoleId,
    setSelectedRoleId,
  ] = useState("ROLE-001");

  const [
    selectedPermission,
    setSelectedPermission,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    setRoles(loadRoles());
    setUsers(loadUsers());
  }, []);

  const selectedRole = useMemo(
    () =>
      roles.find(
        (role) =>
          role.id ===
          selectedRoleId,
      ) ||
      roles[0] ||
      null,
    [
      roles,
      selectedRoleId,
    ],
  );

  const availablePermissions =
    useMemo(() => {
      if (!selectedRole) {
        return [];
      }

      return permissionCatalog.filter(
        (permission) =>
          !selectedRole.permissions.includes(
            permission,
          ),
      );
    }, [selectedRole]);

  function getRoleUserCount(
    roleName: string,
  ) {
    return users.filter(
      (user) =>
        user.role === roleName,
    ).length;
  }

  const assignedUsers =
    users.filter((user) =>
      roles.some(
        (role) =>
          role.name === user.role,
      ),
    ).length;

  const privilegedRoles =
    roles.filter(
      (role) =>
        role.privileged,
    ).length;

  function handleAssignPermission() {
    setMessage("");

    if (!selectedRole) {
      return;
    }

    if (!selectedPermission) {
      setMessage(
        "Select a permission first.",
      );

      return;
    }

    if (
      selectedRole.permissions.includes(
        selectedPermission,
      )
    ) {
      setMessage(
        "This role already has the selected permission.",
      );

      return;
    }

    const updatedRoles =
      roles.map((role) =>
        role.id ===
        selectedRole.id
          ? {
              ...role,
              permissions: [
                ...role.permissions,
                selectedPermission,
              ],
            }
          : role,
      );

    setRoles(updatedRoles);
    saveRoles(updatedRoles);

    setMessage(
      `Permission "${selectedPermission}" assigned successfully.`,
    );

    setSelectedPermission("");
  }

  function handleRemovePermission(
    permission: string,
  ) {
    if (!selectedRole) {
      return;
    }

    const updatedRoles =
      roles.map((role) =>
        role.id ===
        selectedRole.id
          ? {
              ...role,
              permissions:
                role.permissions.filter(
                  (item) =>
                    item !== permission,
                ),
            }
          : role,
      );

    setRoles(updatedRoles);
    saveRoles(updatedRoles);

    setMessage(
      `Permission "${permission}" removed successfully.`,
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Identity Governance
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Roles & Permissions
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Manage enterprise role assignments,
              privilege levels, and permission scope
              across identities.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              title="Total Roles"
              value={roles.length}
              subtitle="Defined access roles"
            />

            <KpiCard
              title="Privileged Roles"
              value={privilegedRoles}
              subtitle="Elevated access"
              valueClass="text-red-400"
            />

            <KpiCard
              title="Assigned Users"
              value={assignedUsers}
              subtitle="Users with assigned roles"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Permissions"
              value={permissionCatalog.length}
              subtitle="Permission catalog"
              valueClass="text-purple-400"
            />

          </div>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

            <div className="rounded-2xl border border-white/10 bg-zinc-900">

              <div className="border-b border-white/10 p-6">
                <h2 className="text-2xl font-semibold">
                  Enterprise Roles
                </h2>

                <p className="mt-2 text-gray-400">
                  Review role scope and assigned
                  permissions.
                </p>
              </div>

              <div className="divide-y divide-white/5">

                {roles.map((role) => {
                  const userCount =
                    getRoleUserCount(
                      role.name,
                    );

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoleId(
                          role.id,
                        );

                        setSelectedPermission(
                          "",
                        );

                        setMessage("");
                      }}
                      className={`block w-full p-6 text-left transition ${
                        selectedRoleId ===
                        role.id
                          ? "bg-blue-500/5"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div>
                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="text-lg font-semibold">
                              {role.name}
                            </h3>

                            {role.privileged && (
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                                Privileged
                              </span>
                            )}

                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {
                              role.description
                            }
                          </p>

                          <p className="mt-2 text-xs text-gray-600">
                            {role.id}
                          </p>
                        </div>

                        <div className="text-right">

                          <p className="text-2xl font-bold text-blue-400">
                            {userCount}
                          </p>

                          <p className="text-xs text-gray-500">
                            {userCount === 1
                              ? "assigned user"
                              : "assigned users"}
                          </p>

                        </div>

                      </div>
                    </button>
                  );
                })}

              </div>
            </div>

            <aside className="space-y-6">

              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Selected Role
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  {selectedRole?.name ??
                    "No role selected"}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  {selectedRole?.description ??
                    ""}
                </p>

                {selectedRole && (
                  <div className="mt-4 inline-flex rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs text-gray-400">
                    {
                      getRoleUserCount(
                        selectedRole.name,
                      )
                    }{" "}
                    assigned{" "}
                    {getRoleUserCount(
                      selectedRole.name,
                    ) === 1
                      ? "user"
                      : "users"}
                  </div>
                )}

                <div className="mt-6">

                  <p className="text-sm font-medium text-gray-300">
                    Permissions
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {selectedRole?.permissions.map(
                      (permission) => (
                        <div
                          key={
                            permission
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1"
                        >

                          <span className="text-xs font-semibold text-blue-300">
                            {
                              permission
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemovePermission(
                                permission,
                              )
                            }
                            className="text-xs font-bold text-red-400 transition hover:text-red-300"
                            aria-label={`Remove ${permission}`}
                          >
                            ×
                          </button>

                        </div>
                      ),
                    )}

                    {selectedRole &&
                      selectedRole.permissions
                        .length ===
                        0 && (
                        <p className="text-sm text-gray-500">
                          No permissions assigned.
                        </p>
                      )}

                  </div>
                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

                <h2 className="text-xl font-semibold">
                  Assign Permission
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Add a permission to the selected role.
                </p>

                <select
                  value={
                    selectedPermission
                  }
                  onChange={(event) => {
                    setSelectedPermission(
                      event.target.value,
                    );

                    setMessage("");
                  }}
                  disabled={
                    availablePermissions.length ===
                    0
                  }
                  className="mt-5 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:text-zinc-500"
                >
                  <option value="">
                    {availablePermissions.length >
                    0
                      ? "Select permission"
                      : "All permissions assigned"}
                  </option>

                  {availablePermissions.map(
                    (permission) => (
                      <option
                        key={
                          permission
                        }
                        value={
                          permission
                        }
                      >
                        {
                          permission
                        }
                      </option>
                    ),
                  )}
                </select>

                <button
                  type="button"
                  onClick={
                    handleAssignPermission
                  }
                  disabled={
                    !selectedRole ||
                    availablePermissions.length ===
                      0
                  }
                  className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  Assign Permission
                </button>

                {message && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                      message.includes(
                        "successfully",
                      )
                        ? "border-green-500/30 bg-green-500/10 text-green-300"
                        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                    }`}
                  >
                    {message}
                  </div>
                )}

              </div>

            </aside>

          </section>

        </div>
      </section>
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  valueClass = "text-white",
}: {
  title: string;
  value: number;
  subtitle: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {subtitle}
      </p>

    </div>
  );
}
