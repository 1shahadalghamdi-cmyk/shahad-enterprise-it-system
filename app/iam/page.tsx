"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "@/app/components/system/Sidebar";
import KPICard from "@/app/iam/components/KPICard";
import QuickAction from "@/app/iam/components/QuickAction";
import RecentUsersTable from "@/app/iam/components/RecentUsersTable";
import SectionHeader from "@/app/iam/components/SectionHeader";

import {
  defaultIamUsers,
  type IamUser,
} from "@/lib/data/iamUsers";

import { defaultIamGroups } from "@/lib/data/iamGroups";
import { defaultIamRoles } from "@/lib/data/iamRoles";

const STORAGE_KEY = "iamUsers";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

function loadUsers(): IamUser[] {
  if (typeof window === "undefined") {
    return defaultIamUsers;
  }

  const savedUsers =
    window.localStorage.getItem(STORAGE_KEY);

  if (!savedUsers) {
    window.localStorage.setItem(
      STORAGE_KEY,
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

function loadCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedUser =
    window.localStorage.getItem(
      "currentUser",
    );

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(
      savedUser,
    ) as CurrentUser;
  } catch {
    return null;
  }
}

function daysUntil(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.ceil(
    (date.getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );
}

export default function IamDashboardPage() {
  const [users, setUsers] =
    useState<IamUser[]>([]);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  useEffect(() => {
    setUsers(loadUsers());
    setCurrentUser(loadCurrentUser());
  }, []);

  const isAdmin =
    currentUser?.role === "IT Admin";

  const metrics = useMemo(() => {
    const totalUsers = users.length;

    const activeUsers = users.filter(
      (user) => user.status === "Active",
    ).length;

    const lockedUsers = users.filter(
      (user) => user.status === "Locked",
    ).length;

    const disabledUsers = users.filter(
      (user) => user.status === "Disabled",
    ).length;

    const pendingUsers = users.filter(
      (user) => user.status === "Pending",
    ).length;

    const mfaEnabled = users.filter(
      (user) =>
        user.mfaStatus === "Enabled",
    ).length;

    const mfaRequired = users.filter(
      (user) =>
        user.mfaStatus === "Required",
    ).length;

    const passwordsExpiring =
      users.filter((user) => {
        const remainingDays = daysUntil(
          user.passwordExpiry,
        );

        return (
          remainingDays >= 0 &&
          remainingDays <= 30
        );
      }).length;

    return {
      totalUsers,
      activeUsers,
      lockedUsers,
      disabledUsers,
      pendingUsers,
      mfaEnabled,
      mfaRequired,
      passwordsExpiring,
    };
  }, [users]);

  const usersByDepartment = useMemo(() => {
    const departmentCounts =
      users.reduce<Record<string, number>>(
        (counts, user) => {
          counts[user.department] =
            (counts[user.department] || 0) + 1;

          return counts;
        },
        {},
      );

    return Object.entries(departmentCounts)
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort(
        (
          firstDepartment,
          secondDepartment,
        ) =>
          secondDepartment.count -
          firstDepartment.count,
      );
  }, [users]);

  const usersByRole = useMemo(() => {
    const roleCounts =
      users.reduce<Record<string, number>>(
        (counts, user) => {
          counts[user.role] =
            (counts[user.role] || 0) + 1;

          return counts;
        },
        {},
      );

    return Object.entries(roleCounts)
      .map(([role, count]) => ({
        role,
        count,
      }))
      .sort(
        (firstRole, secondRole) =>
          secondRole.count -
          firstRole.count,
      );
  }, [users]);

  const securityEvents = useMemo(() => {
    const events: {
      title: string;
      description: string;
      severity:
        | "High"
        | "Medium"
        | "Low";
      time: string;
    }[] = [];

    const lockedUser = users.find(
      (user) =>
        user.status === "Locked",
    );

    if (lockedUser) {
      events.push({
        title: "Locked account detected",
        description: `${lockedUser.fullName} requires account review and unlock action.`,
        severity: "High",
        time: "12 minutes ago",
      });
    }

    const mfaRequiredUser = users.find(
      (user) =>
        user.mfaStatus === "Required",
    );

    if (mfaRequiredUser) {
      events.push({
        title: "MFA registration required",
        description: `${mfaRequiredUser.fullName} must complete MFA enrollment before access is approved.`,
        severity: "Medium",
        time: "1 hour ago",
      });
    }

    if (metrics.passwordsExpiring > 0) {
      events.push({
        title: "Password expiring soon",
        description: `${metrics.passwordsExpiring} user passwords expire within the next 30 days.`,
        severity: "Medium",
        time: "2 hours ago",
      });
    }

    const disabledUser = users.find(
      (user) =>
        user.status === "Disabled",
    );

    if (disabledUser) {
      events.push({
        title: "Disabled account review",
        description: `${disabledUser.fullName} has a disabled account pending offboarding verification.`,
        severity: "Low",
        time: "Yesterday",
      });
    }

    return events;
  }, [
    metrics.passwordsExpiring,
    users,
  ]);

  const mfaAdoption =
    metrics.totalUsers > 0
      ? Math.round(
          (metrics.mfaEnabled /
            metrics.totalUsers) *
            100,
        )
      : 0;

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Identity Governance
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Identity & Access Management
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Manage enterprise identities,
              account lifecycle, groups, roles,
              MFA, password security, and access
              governance.
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/iam/users/new"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              + New User
            </Link>
          )}
        </div>

        <section>
          <SectionHeader
            title="Identity Overview"
            description="Current enterprise account status and access health."
          />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard
              title="Total Users"
              value={metrics.totalUsers}
              subtitle="All identity records"
            />

            <KPICard
              title="Active Accounts"
              value={metrics.activeUsers}
              color="text-green-400"
              subtitle="Enabled and available"
            />

            <KPICard
              title="Locked Accounts"
              value={metrics.lockedUsers}
              color="text-red-400"
              subtitle="Requires administrator action"
            />

            <KPICard
              title="Disabled Accounts"
              value={metrics.disabledUsers}
              color="text-zinc-400"
              subtitle="Access currently blocked"
            />
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader
            title="Security Overview"
            description="MFA adoption, pending identities, and password risk."
          />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KPICard
              title="MFA Enabled"
              value={metrics.mfaEnabled}
              color="text-cyan-400"
              subtitle="Protected identities"
            />

            <KPICard
              title="MFA Required"
              value={metrics.mfaRequired}
              color="text-orange-300"
              subtitle="Enrollment pending"
            />

            <KPICard
              title="Passwords Expiring"
              value={metrics.passwordsExpiring}
              color="text-yellow-300"
              subtitle="Within 30 days"
            />

            <KPICard
              title="Pending Accounts"
              value={metrics.pendingUsers}
              color="text-purple-400"
              subtitle="Awaiting activation"
            />
          </div>
        </section>

        {isAdmin && (
          <section className="mt-10">
            <SectionHeader
              title="Quick Actions"
              description="Common identity administration tasks."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <QuickAction
                title="+ Create User"
                href="/iam/users/new"
              />

              <QuickAction
                title="+ Create Group"
                href="/iam/groups/new"
              />

              <QuickAction
                title="Assign Role"
                href="/iam/roles"
              />

              <QuickAction
                title="Reset Password"
                href="/iam/password-policy"
              />
            </div>
          </section>
        )}

        <section className="mt-10 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <SectionHeader
              title="Users by Department"
              description="Identity distribution across the organization."
            />

            <div className="space-y-5">
              {usersByDepartment.map(
                ({ department, count }) => {
                  const percentage =
                    users.length > 0
                      ? Math.round(
                          (count /
                            users.length) *
                            100,
                        )
                      : 0;

                  return (
                    <div key={department}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium">
                          {department}
                        </p>

                        <p className="text-sm text-gray-400">
                          {count} users
                        </p>
                      </div>

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-950">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <SectionHeader
              title="Users by Role"
              description="Role assignment across current identities."
            />

            <div className="space-y-4">
              {usersByRole.map(
                ({ role, count }) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950 p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {role}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Assigned identity role
                      </p>
                    </div>

                    <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-purple-500/10 px-3 font-bold text-purple-400">
                      {count}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <RecentUsersTable />
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <SectionHeader
              title="Security Events"
              description="Recent identity risks requiring administrator review."
            />

            <div className="space-y-4">
              {securityEvents.map(
                (event) => (
                  <div
                    key={event.title}
                    className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold">
                            {event.title}
                          </h3>

                          <SeverityBadge
                            severity={
                              event.severity
                            }
                          />
                        </div>

                        <p className="mt-3 leading-7 text-gray-400">
                          {
                            event.description
                          }
                        </p>
                      </div>

                      <p className="shrink-0 text-xs text-gray-600">
                        {event.time}
                      </p>
                    </div>
                  </div>
                ),
              )}

              {securityEvents.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950 p-8 text-center">
                  <p className="font-semibold text-green-400">
                    No active security risks
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    No identity events currently
                    require administrator review.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                Directory Summary
              </p>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="Groups"
                  value={
                    defaultIamGroups.length
                  }
                />

                <SummaryRow
                  label="Roles"
                  value={
                    defaultIamRoles.length
                  }
                />

                <SummaryRow
                  label="Departments"
                  value={
                    usersByDepartment.length
                  }
                />

                <SummaryRow
                  label="MFA Adoption"
                  value={`${mfaAdoption}%`}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-purple-600/10 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                Access Governance
              </p>

              <h2 className="mt-4 text-2xl font-bold">
                Review pending access
              </h2>

              <p className="mt-3 leading-7 text-gray-300">
                Review new accounts, role
                assignments, MFA enrollment,
                and privileged access.
              </p>

              <Link
                href="/iam/requests"
                className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-gray-200"
              >
                Open Access Requests
              </Link>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
      <span className="text-gray-400">
        {label}
      </span>

      <span className="font-bold text-white">
        {value}
      </span>
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const classes: Record<string, string> = {
    High:
      "border-red-500/30 bg-red-500/10 text-red-400",
    Medium:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Low:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        classes[severity] ||
        "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {severity}
    </span>
  );
}
