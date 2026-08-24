"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import { hasPermission } from "@/lib/iam/permissions";

import {
  loadM365Users,
  saveM365Users,
  type M365User,
} from "@/lib/data/m365Users";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type RiskLevel =
  | "Low"
  | "Medium"
  | "High";

type ConditionalAccessStatus =
  | "Applied"
  | "Not Applied";

type SecurityData = {
  userId: string;
  risk: RiskLevel;
  conditionalAccess: ConditionalAccessStatus;
  lastSignIn: string;
};

type SecurityRecord =
  M365User & SecurityData;

const SECURITY_STORAGE_KEY =
  "m365Security";

const defaultSecurityData: SecurityData[] = [
  {
    userId: "M365-001",
    risk: "Low",
    conditionalAccess: "Applied",
    lastSignIn: "Today, 08:31",
  },
  {
    userId: "M365-002",
    risk: "Low",
    conditionalAccess: "Applied",
    lastSignIn: "Today, 07:55",
  },
  {
    userId: "M365-003",
    risk: "Medium",
    conditionalAccess: "Not Applied",
    lastSignIn: "Yesterday, 18:42",
  },
  {
    userId: "M365-004",
    risk: "Low",
    conditionalAccess: "Applied",
    lastSignIn: "Today, 08:00",
  },
  {
    userId: "M365-005",
    risk: "Low",
    conditionalAccess: "Applied",
    lastSignIn: "Today, 08:00",
  },
];

function loadSecurityData(): SecurityData[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultSecurityData;
  }

  const saved =
    window.localStorage.getItem(
      SECURITY_STORAGE_KEY,
    );

  if (!saved) {
    window.localStorage.setItem(
      SECURITY_STORAGE_KEY,
      JSON.stringify(
        defaultSecurityData,
      ),
    );

    return defaultSecurityData;
  }

  try {
    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(
        SECURITY_STORAGE_KEY,
        JSON.stringify(
          defaultSecurityData,
        ),
      );

      return defaultSecurityData;
    }

    return parsed;
  } catch {
    window.localStorage.setItem(
      SECURITY_STORAGE_KEY,
      JSON.stringify(
        defaultSecurityData,
      ),
    );

    return defaultSecurityData;
  }
}

export default function SecurityCenterPage() {
  const router = useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    users,
    setUsers,
  ] =
    useState<M365User[]>([]);

  const [
    securityData,
    setSecurityData,
  ] =
    useState<SecurityData[]>([]);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const canViewM365 =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:view",
    );

  const canManageM365 =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:manage",
    );

  function refreshData() {
    setUsers(
      loadM365Users(),
    );

    setSecurityData(
      loadSecurityData(),
    );
  }

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedCurrentUser) {
      router.replace(
        "/login",
      );

      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          savedCurrentUser,
        ) as CurrentUser;

      if (
        !hasPermission(
          parsedUser.role,
          "m365:view",
        )
      ) {
        router.replace(
          "/dashboard",
        );

        return;
      }

      setCurrentUser(
        parsedUser,
      );

      refreshData();
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace(
        "/login",
      );
    }
  }, [router]);

  useEffect(() => {
    function handleFocus() {
      refreshData();
    }

    function handleStorage() {
      refreshData();
    }

    window.addEventListener(
      "focus",
      handleFocus,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, []);

  const records =
    useMemo(() => {
      return users.map(
        (user) => {
          const security =
            securityData.find(
              (item) =>
                item.userId ===
                user.id,
            );

          const fallback =
            defaultSecurityData.find(
              (item) =>
                item.userId ===
                user.id,
            );

          const data =
            security ??
            fallback ?? {
              userId:
                user.id,
              risk:
                "Low" as RiskLevel,
              conditionalAccess:
                "Applied" as ConditionalAccessStatus,
              lastSignIn:
                "Today, 08:00",
            };

          return {
            ...user,
            ...data,
          };
        },
      );
    }, [
      users,
      securityData,
    ]);

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return records;
      }

      return records.filter(
        (record) =>
          record.name
            .toLowerCase()
            .includes(query) ||
          record.email
            .toLowerCase()
            .includes(query) ||
          (
            record.department ||
            ""
          )
            .toLowerCase()
            .includes(query),
      );
    }, [
      records,
      search,
    ]);

  const mfaEnabled =
    records.filter(
      (record) =>
        record.mfa ===
        "Enabled",
    ).length;

  const riskyUsers =
    records.filter(
      (record) =>
        record.risk ===
          "Medium" ||
        record.risk ===
          "High",
    ).length;

  const caApplied =
    records.filter(
      (record) =>
        record.conditionalAccess ===
        "Applied",
    ).length;

  const secureScore =
    Math.min(
      100,
      Math.round(
        (mfaEnabled /
          Math.max(
            records.length,
            1,
          )) *
          55 +
          (caApplied /
            Math.max(
              records.length,
              1,
            )) *
            35 +
          (riskyUsers === 0
            ? 10
            : 5),
      ),
    );

  function toggleMfa(
    userId: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to change MFA settings.",
      );

      return;
    }

    const updatedUsers =
      users.map(
        (user) =>
          user.id ===
          userId
            ? {
                ...user,
                mfa:
                  user.mfa ===
                  "Enabled"
                    ? ("Disabled" as const)
                    : ("Enabled" as const),
              }
            : user,
      );

    saveM365Users(
      updatedUsers,
    );

    setUsers(
      updatedUsers,
    );

    setMessage(
      "MFA status updated successfully.",
    );
  }

  function toggleAccountStatus(
    userId: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to change account status.",
      );

      return;
    }

    const updatedUsers =
      users.map(
        (user) =>
          user.id ===
          userId
            ? {
                ...user,
                status:
                  user.status ===
                  "Active"
                    ? ("Disabled" as const)
                    : ("Active" as const),
              }
            : user,
      );

    saveM365Users(
      updatedUsers,
    );

    setUsers(
      updatedUsers,
    );

    setMessage(
      "Account status updated successfully.",
    );
  }

  if (
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Security Center...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">

        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Microsoft 365 Administration
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Security Center
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Monitor MFA,
                account risk,
                conditional access,
                secure score,
                and Microsoft 365
                identity security.
              </p>

            </div>

            <Link
              href="/m365/users"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold transition hover:bg-zinc-800"
            >
              View Users
            </Link>

          </div>

          {/* KPIs */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              title="Secure Score"
              value={`${secureScore}%`}
              subtitle="Simulated tenant score"
              valueClass="text-cyan-400"
            />

            <KpiCard
              title="MFA Enabled"
              value={
                mfaEnabled
              }
              subtitle="Protected identities"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Risky Users"
              value={
                riskyUsers
              }
              subtitle="Medium or high risk"
              valueClass="text-yellow-400"
            />

            <KpiCard
              title="Conditional Access"
              value={
                caApplied
              }
              subtitle="Policies applied"
              valueClass="text-purple-400"
            />

          </div>

          {/* SEARCH */}

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <h2 className="text-2xl font-semibold">
                  Identity Security
                </h2>

                <p className="mt-2 text-gray-400">
                  Review risk, MFA,
                  access policies,
                  and account status.
                </p>

              </div>

              <input
                type="search"
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Search users..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 lg:max-w-sm"
              />

            </div>

            {message && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                  message.includes(
                    "successfully",
                  )
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {message}
              </div>
            )}

          </section>

          {/* TABLE */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1180px]">

                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">

                  <tr>

                    <th className="px-6 py-4">
                      User
                    </th>

                    <th className="px-4 py-4">
                      Department
                    </th>

                    <th className="px-4 py-4">
                      Risk
                    </th>

                    <th className="px-4 py-4">
                      MFA
                    </th>

                    <th className="px-4 py-4">
                      Conditional Access
                    </th>

                    <th className="px-4 py-4">
                      Last Sign-in
                    </th>

                    <th className="px-4 py-4">
                      Account
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-white/5">

                  {filteredRecords.map(
                    (record) => (
                      <tr
                        key={
                          record.id
                        }
                        className="transition hover:bg-white/[0.03]"
                      >

                        {/* USER */}

                        <td className="px-6 py-5">

                          <Link
                            href={`/m365/security/${record.id}`}
                            className="font-semibold text-blue-400 transition hover:text-blue-300"
                          >
                            {
                              record.name
                            }
                          </Link>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              record.email
                            }
                          </p>

                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-4 py-5 text-gray-300">
                          {record.department ||
                            "Not configured"}
                        </td>

                        {/* RISK */}

                        <td className="px-4 py-5">
                          <RiskBadge
                            risk={
                              record.risk
                            }
                          />
                        </td>

                        {/* MFA */}

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              record.mfa
                            }
                          />
                        </td>

                        {/* CONDITIONAL ACCESS */}

                        <td className="px-4 py-5">
                          <PolicyBadge
                            status={
                              record.conditionalAccess
                            }
                          />
                        </td>

                        {/* LAST SIGN IN */}

                        <td className="px-4 py-5 text-gray-300">
                          {
                            record.lastSignIn
                          }
                        </td>

                        {/* ACCOUNT */}

                        <td className="px-4 py-5">
                          <AccountBadge
                            status={
                              record.status
                            }
                          />
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-5">

                          {canManageM365 ? (
                            <div className="flex justify-end gap-2">

                              <Link
                                href={`/m365/security/${record.id}`}
                                className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                              >
                                View
                              </Link>

                              <Link
                                href={`/m365/security/${record.id}/edit`}
                                className="rounded-lg border border-yellow-500/30 px-3 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
                              >
                                Manage
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleMfa(
                                    record.id,
                                  )
                                }
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                  record.mfa ===
                                  "Enabled"
                                    ? "border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                                    : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                }`}
                              >
                                {record.mfa ===
                                "Enabled"
                                  ? "Disable MFA"
                                  : "Enable MFA"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleAccountStatus(
                                    record.id,
                                  )
                                }
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                  record.status ===
                                  "Active"
                                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                }`}
                              >
                                {record.status ===
                                "Active"
                                  ? "Disable Account"
                                  : "Enable Account"}
                              </button>

                            </div>
                          ) : (
                            <div className="flex justify-end">

                              <Link
                                href={`/m365/security/${record.id}`}
                                className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                              >
                                View
                              </Link>

                            </div>
                          )}

                        </td>

                      </tr>
                    ),
                  )}

                  {filteredRecords.length ===
                    0 && (
                    <tr>

                      <td
                        colSpan={
                          8
                        }
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No security records found.
                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

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
  value:
    | number
    | string;
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

function RiskBadge({
  risk,
}: {
  risk: RiskLevel;
}) {
  const classes =
    risk ===
    "High"
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : risk ===
          "Medium"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        : "border-green-500/30 bg-green-500/10 text-green-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {risk}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status:
    | "Enabled"
    | "Disabled";
}) {
  const enabled =
    status ===
    "Enabled";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        enabled
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}

function PolicyBadge({
  status,
}: {
  status:
    | "Applied"
    | "Not Applied";
}) {
  const applied =
    status ===
    "Applied";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        applied
          ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}

function AccountBadge({
  status,
}: {
  status:
    | "Active"
    | "Disabled";
}) {
  const active =
    status ===
    "Active";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        active
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}
