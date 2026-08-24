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

type OneDriveRecord = {
  userId: string;
  usedGB: number;
  quotaGB: number;
  syncHealth:
    | "Healthy"
    | "Attention"
    | "Error";
  sharing:
    | "Internal Only"
    | "Internal + External";
  lastSync: string;
};

const ONEDRIVE_STORAGE_KEY =
  "m365OneDrive";

const defaultOneDriveData: OneDriveRecord[] = [
  {
    userId: "M365-001",
    usedGB: 42.6,
    quotaGB: 100,
    syncHealth: "Healthy",
    sharing: "Internal Only",
    lastSync: "Today, 09:42",
  },
  {
    userId: "M365-002",
    usedGB: 18.3,
    quotaGB: 100,
    syncHealth: "Healthy",
    sharing: "Internal Only",
    lastSync: "Today, 08:15",
  },
  {
    userId: "M365-003",
    usedGB: 67.8,
    quotaGB: 100,
    syncHealth: "Attention",
    sharing: "Internal + External",
    lastSync: "Yesterday, 16:20",
  },
  {
    userId: "M365-004",
    usedGB: 5.4,
    quotaGB: 100,
    syncHealth: "Healthy",
    sharing: "Internal Only",
    lastSync: "Today, 10:05",
  },
  {
    userId: "M365-005",
    usedGB: 0,
    quotaGB: 100,
    syncHealth: "Healthy",
    sharing: "Internal Only",
    lastSync: "Never",
  },
];

function loadOneDriveData(): OneDriveRecord[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultOneDriveData;
  }

  const saved =
    window.localStorage.getItem(
      ONEDRIVE_STORAGE_KEY,
    );

  if (!saved) {
    window.localStorage.setItem(
      ONEDRIVE_STORAGE_KEY,
      JSON.stringify(
        defaultOneDriveData,
      ),
    );

    return defaultOneDriveData;
  }

  try {
    const parsed =
      JSON.parse(saved);

    if (
      !Array.isArray(parsed)
    ) {
      return defaultOneDriveData;
    }

    return parsed;
  } catch {
    return defaultOneDriveData;
  }
}

export default function OneDriveUserPage() {
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
    oneDriveData,
    setOneDriveData,
  ] =
    useState<OneDriveRecord[]>([]);

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

      setUsers(
        loadM365Users(),
      );

      setOneDriveData(
        loadOneDriveData(),
      );

      setLoaded(true);
    } catch (
      error
    ) {
      console.error(
        "Failed to load OneDrive user:",
        error,
      );

      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace(
        "/login",
      );
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

  const drive =
    useMemo(
      () =>
        oneDriveData.find(
          (item) =>
            item.userId ===
            userId,
        ),
      [
        oneDriveData,
        userId,
      ],
    );

  const usagePercent =
    drive &&
    drive.quotaGB > 0
      ? Math.min(
          100,
          Math.round(
            (drive.usedGB /
              drive.quotaGB) *
              100,
          ),
        )
      : 0;

  if (
    !loaded ||
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading OneDrive user...
        </p>
      </main>
    );
  }

  if (
    !user ||
    !drive
  ) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center p-8">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <div className="text-5xl">
              🔎
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              OneDrive User Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              OneDrive information is
              not available for this
              Microsoft 365 user.
            </p>

            <Link
              href="/m365/onedrive"
              className="mt-6 inline-flex rounded-xl border border-white/10 bg-zinc-950 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to OneDrive
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const oneDriveEnabled =
    user.oneDrive ===
    "Enabled";

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-6 xl:p-8">
        <div className="mx-auto max-w-6xl">
          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Microsoft 365 Administration
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                {user.name}
              </h1>

              <p className="mt-2 text-gray-400">
                OneDrive for Business
                {" • "}
                {user.id}
              </p>
            </div>

            <StatusBadge
              enabled={
                oneDriveEnabled
              }
            />
          </div>

          {/* SUMMARY */}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Storage Used"
              value={`${drive.usedGB} GB`}
              subtitle="Current usage"
            />

            <SummaryCard
              label="Storage Quota"
              value={`${drive.quotaGB} GB`}
              subtitle="Assigned capacity"
            />

            <SummaryCard
              label="Usage"
              value={`${usagePercent}%`}
              subtitle="Quota consumed"
            />

            <SummaryCard
              label="Sync Health"
              value={
                drive.syncHealth
              }
              subtitle="Current sync state"
            />
          </section>

          {/* STORAGE */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Storage
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  OneDrive Storage
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Storage utilization
                  for this user.
                </p>
              </div>

              <p className="text-sm font-semibold text-gray-300">
                {drive.usedGB} GB /{" "}
                {drive.quotaGB} GB
              </p>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-950">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${usagePercent}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>
                {usagePercent}% used
              </span>

              <span>
                {Math.max(
                  0,
                  drive.quotaGB -
                    drive.usedGB,
                ).toFixed(1)}{" "}
                GB available
              </span>
            </div>
          </section>

          {/* USER + SYNC INFO */}

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-900">
              <div className="border-b border-white/10 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                  Identity
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  User Information
                </h2>
              </div>

              <div className="grid gap-4 p-6">
                <InfoCard
                  title="User ID"
                  value={user.id}
                />

                <InfoCard
                  title="User"
                  value={user.name}
                />

                <InfoCard
                  title="Email"
                  value={user.email}
                />

                <InfoCard
                  title="Department"
                  value={
                    user.department ||
                    "Not configured"
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900">
              <div className="border-b border-white/10 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                  Synchronization
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Sync & Sharing
                </h2>
              </div>

              <div className="grid gap-4 p-6">
                <InfoCard
                  title="Sync Health"
                  value={
                    drive.syncHealth
                  }
                />

                <InfoCard
                  title="Last Sync"
                  value={
                    drive.lastSync
                  }
                />

                <InfoCard
                  title="Sharing Policy"
                  value={
                    drive.sharing
                  }
                />

                <InfoCard
                  title="OneDrive Status"
                  value={
                    user.oneDrive
                  }
                />
              </div>
            </div>
          </section>

          {/* ADMIN */}

          {canManageM365 && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
                Administration
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                OneDrive Management
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Manage storage,
                sharing, and
                synchronization settings
                for this user.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/m365/onedrive/${user.id}/edit`}
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
                >
                  Manage OneDrive
                </Link>
              </div>
            </section>
          )}

          {/* NAVIGATION */}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/m365/onedrive"
              className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              ← Back to OneDrive
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

function StatusBadge({
  enabled,
}: {
  enabled: boolean;
}) {
  return (
    <span
      className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${
        enabled
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {enabled
        ? "Enabled"
        : "Disabled"}
    </span>
  );
}
