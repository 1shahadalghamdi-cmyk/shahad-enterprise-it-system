/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

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

type SecurityRecord = {
  userId: string;
  risk: RiskLevel;
  conditionalAccess: ConditionalAccessStatus;
  lastSignIn: string;
};

const SECURITY_STORAGE_KEY =
  "m365Security";

const defaultSecurityData: SecurityRecord[] = [
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
    conditionalAccess:
      "Not Applied",
    lastSignIn:
      "Yesterday, 18:42",
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

function loadSecurityData(): SecurityRecord[] {
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

function saveSecurityData(
  records: SecurityRecord[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    SECURITY_STORAGE_KEY,
    JSON.stringify(records),
  );
}

export default function EditSecurityPage() {
  const router = useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const userId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

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
    useState<SecurityRecord[]>([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  const [
    risk,
    setRisk,
  ] =
    useState<RiskLevel>(
      "Low",
    );

  const [
    conditionalAccess,
    setConditionalAccess,
  ] =
    useState<ConditionalAccessStatus>(
      "Applied",
    );

  const [
    lastSignIn,
    setLastSignIn,
  ] =
    useState("");

  const [
    mfa,
    setMfa,
  ] =
    useState<
      "Enabled" | "Disabled"
    >("Enabled");

  const [
    accountStatus,
    setAccountStatus,
  ] =
    useState<
      "Active" | "Disabled"
    >("Active");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const canManageM365 =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:manage",
    );

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
          "m365:manage",
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

      const loadedUsers =
        loadM365Users();

      const loadedSecurity =
        loadSecurityData();

      setUsers(
        loadedUsers,
      );

      setSecurityData(
        loadedSecurity,
      );

      const foundUser =
        loadedUsers.find(
          (user) =>
            user.id ===
            userId,
        );

      const foundSecurity =
        loadedSecurity.find(
          (record) =>
            record.userId ===
            userId,
        );

      if (foundUser) {
        setMfa(
          foundUser.mfa,
        );

        setAccountStatus(
          foundUser.status,
        );
      }

      if (foundSecurity) {
        setRisk(
          foundSecurity.risk,
        );

        setConditionalAccess(
          foundSecurity
            .conditionalAccess,
        );

        setLastSignIn(
          foundSecurity
            .lastSignIn,
        );
      }

      setLoaded(true);
    } catch (
      error
    ) {
      console.error(
        "Failed to load security settings:",
        error,
      );

      router.replace(
        "/m365/security",
      );
    }
  }, [
    router,
    userId,
  ]);

  const user =
    useMemo(
      () =>
        users.find(
          (item) =>
            item.id ===
            userId,
        ),
      [
        users,
        userId,
      ],
    );

  const security =
    useMemo(
      () =>
        securityData.find(
          (item) =>
            item.userId ===
            userId,
        ),
      [
        securityData,
        userId,
      ],
    );

  function handleSave() {
    if (
      !user ||
      !security ||
      !canManageM365
    ) {
      return;
    }

    if (
      !lastSignIn.trim()
    ) {
      setMessage(
        "Last sign-in cannot be empty.",
      );

      return;
    }

    const updatedSecurityRecord: SecurityRecord =
      {
        ...security,
        risk,
        conditionalAccess,
        lastSignIn:
          lastSignIn.trim(),
      };

    const updatedSecurityData =
      securityData.map(
        (record) =>
          record.userId ===
          updatedSecurityRecord.userId
            ? updatedSecurityRecord
            : record,
      );

    const updatedUsers =
      users.map(
        (item) =>
          item.id ===
          user.id
            ? {
                ...item,
                mfa,
                status:
                  accountStatus,
              }
            : item,
      );

    setSaving(true);

    saveSecurityData(
      updatedSecurityData,
    );

    saveM365Users(
      updatedUsers,
    );

    setSecurityData(
      updatedSecurityData,
    );

    setUsers(
      updatedUsers,
    );

    setMessage(
      "Security settings saved successfully.",
    );

    setSaving(false);

    router.push(
      `/m365/security/${user.id}`,
    );
  }

  if (
    !loaded ||
    !currentUser ||
    !canManageM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading security settings...
        </p>
      </main>
    );
  }

  if (
    !user ||
    !security
  ) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center p-8">

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">

            <h1 className="text-3xl font-bold">
              Security Profile Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              Security information is not available for this user.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/m365/security",
                )
              }
              className="mt-6 rounded-xl border border-white/10 bg-zinc-950 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Security
            </button>

          </div>

        </section>

      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-6 xl:p-8">

        <div className="mx-auto max-w-6xl">

          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Microsoft 365 Security
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Manage Security
              </h1>

              <p className="mt-2 text-gray-400">
                {user.name}
                {" • "}
                {user.id}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/m365/security/${user.id}`,
                )
              }
              className="w-fit rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>

          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-300">
              {message}
            </div>
          )}

          {/* SUMMARY */}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              label="Risk Level"
              value={risk}
              subtitle="Current identity risk"
            />

            <SummaryCard
              label="MFA"
              value={mfa}
              subtitle="Authentication protection"
            />

            <SummaryCard
              label="Conditional Access"
              value={
                conditionalAccess
              }
              subtitle="Access policy"
            />

            <SummaryCard
              label="Account"
              value={
                accountStatus
              }
              subtitle="Account status"
            />

          </section>

          {/* RISK */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">

            <div className="border-b border-white/10 p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                Risk Management
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Identity Risk
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Review and configure the current identity risk level.
              </p>

            </div>

            <div className="p-6">

              <label className="block">

                <span className="mb-2 block text-sm text-gray-400">
                  Risk Level
                </span>

                <select
                  value={risk}
                  onChange={(
                    event,
                  ) =>
                    setRisk(
                      event
                        .target
                        .value as RiskLevel,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

              </label>

            </div>

          </section>

          {/* AUTHENTICATION */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">

            <div className="border-b border-white/10 p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                Authentication
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                MFA & Account Access
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Manage authentication protection and account access.
              </p>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

              <label className="block">

                <span className="mb-2 block text-sm text-gray-400">
                  MFA Status
                </span>

                <select
                  value={mfa}
                  onChange={(
                    event,
                  ) =>
                    setMfa(
                      event
                        .target
                        .value as
                        | "Enabled"
                        | "Disabled",
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >

                  <option value="Enabled">
                    Enabled
                  </option>

                  <option value="Disabled">
                    Disabled
                  </option>

                </select>

              </label>

              <label className="block">

                <span className="mb-2 block text-sm text-gray-400">
                  Account Status
                </span>

                <select
                  value={
                    accountStatus
                  }
                  onChange={(
                    event,
                  ) =>
                    setAccountStatus(
                      event
                        .target
                        .value as
                        | "Active"
                        | "Disabled",
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Disabled">
                    Disabled
                  </option>

                </select>

              </label>

            </div>

          </section>

          {/* CONDITIONAL ACCESS */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">

            <div className="border-b border-white/10 p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Access Policies
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Conditional Access
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Configure conditional access policy status and sign-in information.
              </p>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

              <label className="block">

                <span className="mb-2 block text-sm text-gray-400">
                  Conditional Access
                </span>

                <select
                  value={
                    conditionalAccess
                  }
                  onChange={(
                    event,
                  ) =>
                    setConditionalAccess(
                      event
                        .target
                        .value as ConditionalAccessStatus,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >

                  <option value="Applied">
                    Applied
                  </option>

                  <option value="Not Applied">
                    Not Applied
                  </option>

                </select>

              </label>

              <label className="block">

                <span className="mb-2 block text-sm text-gray-400">
                  Last Sign-In
                </span>

                <input
                  value={
                    lastSignIn
                  }
                  onChange={(
                    event,
                  ) => {
                    setLastSignIn(
                      event
                        .target
                        .value,
                    );

                    setMessage("");
                  }}
                  placeholder="Example: Today, 08:31"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                />

              </label>

            </div>

          </section>

          {/* IDENTITY */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">

            <div className="border-b border-white/10 p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Identity
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Microsoft 365 User
              </h2>

            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">

              <InfoCard
                title="User ID"
                value={user.id}
              />

              <InfoCard
                title="Username"
                value={
                  user.username ||
                  "Not configured"
                }
              />

              <InfoCard
                title="Email"
                value={
                  user.email
                }
              />

              <InfoCard
                title="Job Title"
                value={
                  user.jobTitle ||
                  "Not configured"
                }
              />

              <InfoCard
                title="Department"
                value={
                  user.department ||
                  "Not configured"
                }
              />

              <InfoCard
                title="License"
                value={
                  user.license
                }
              />

            </div>

          </section>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                saving
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/m365/security/${user.id}`,
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

function SummaryCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {subtitle}
      </p>

    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-5">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
        {title}
      </p>

      <p className="mt-2 break-words font-semibold text-white">
        {value}
      </p>

    </div>
  );
}
