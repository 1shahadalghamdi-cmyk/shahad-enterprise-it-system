/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
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
      return defaultSecurityData;
    }

    return parsed;
  } catch {
    return defaultSecurityData;
  }
}

export default function SecurityUserViewPage() {
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

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedCurrentUser) {
      router.replace("/login");
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

      setUsers(
        loadM365Users(),
      );

      setSecurityData(
        loadSecurityData(),
      );

      setLoaded(true);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

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

  if (
    !loaded ||
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading security profile...
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

            <Link
              href="/m365/security"
              className="mt-6 inline-flex rounded-xl border border-white/10 bg-zinc-950 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Security
            </Link>
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
                {user.name}
              </h1>

              <p className="mt-2 text-gray-400">
                Security Profile
                {" • "}
                {user.id}
              </p>
            </div>

            <RiskBadge
              risk={
                security.risk
              }
            />
          </div>

          {/* SUMMARY */}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              label="Risk Level"
              value={
                security.risk
              }
              subtitle="Identity risk"
            />

            <SummaryCard
              label="MFA"
              value={
                user.mfa
              }
              subtitle="Multi-factor authentication"
            />

            <SummaryCard
              label="Conditional Access"
              value={
                security.conditionalAccess
              }
              subtitle="Access policy"
            />

            <SummaryCard
              label="Account"
              value={
                user.status
              }
              subtitle="Microsoft 365 account"
            />

          </section>

          {/* IDENTITY */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Identity
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                User Identity
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Microsoft 365 user and organizational information.
              </p>
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
                value={user.email}
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
                value={user.license}
              />

            </div>
          </section>

          {/* SECURITY */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">

            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Security Controls
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Identity Security
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Current security posture and access controls.
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">

              <SecurityCard
                title="Risk Level"
                value={
                  security.risk
                }
              />

              <SecurityCard
                title="MFA"
                value={
                  user.mfa
                }
              />

              <SecurityCard
                title="Conditional Access"
                value={
                  security.conditionalAccess
                }
              />

              <SecurityCard
                title="Last Sign-In"
                value={
                  security.lastSignIn
                }
              />

              <SecurityCard
                title="Account Status"
                value={
                  user.status
                }
              />

              <SecurityCard
                title="License"
                value={
                  user.license
                }
              />

            </div>
          </section>

          {/* ADMIN */}

          {canManageM365 && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900 p-6">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
                Administration
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Security Management
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Manage MFA, account status, risk level, and conditional access.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">

                <Link
                  href={`/m365/security/${user.id}/edit`}
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
                >
                  Manage Security
                </Link>

              </div>

            </section>
          )}

          {/* NAV */}

          <div className="mt-6 flex flex-wrap gap-3">

            <Link
              href="/m365/security"
              className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              ← Back to Security
            </Link>

            <Link
              href={`/m365/users/${user.id}`}
              className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
            >
              View Microsoft 365 User
            </Link>

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

function SecurityCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-5">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

function RiskBadge({
  risk,
}: {
  risk: RiskLevel;
}) {
  if (
    risk ===
    "Low"
  ) {
    return (
      <span className="w-fit rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
        Low Risk
      </span>
    );
  }

  if (
    risk ===
    "Medium"
  ) {
    return (
      <span className="w-fit rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300">
        Medium Risk
      </span>
    );
  }

  return (
    <span className="w-fit rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">
      High Risk
    </span>
  );
}
