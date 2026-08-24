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

type SyncHealth =
  | "Healthy"
  | "Attention"
  | "Error";

type SharingPolicy =
  | "Internal Only"
  | "Internal + External";

type OneDriveData = {
  userId: string;
  usedGB: number;
  quotaGB: number;
  syncHealth: SyncHealth;
  sharing: SharingPolicy;
  lastSync: string;
};

type OneDriveRecord =
  M365User & OneDriveData;

const ONEDRIVE_STORAGE_KEY =
  "m365OneDrive";

const defaultOneDriveData: OneDriveData[] = [
  {
    userId: "M365-001",
    usedGB: 42.6,
    quotaGB: 1024,
    syncHealth: "Healthy",
    sharing: "Internal + External",
    lastSync: "Today, 08:15",
  },
  {
    userId: "M365-002",
    usedGB: 18.2,
    quotaGB: 1024,
    syncHealth: "Healthy",
    sharing: "Internal Only",
    lastSync: "Today, 07:42",
  },
  {
    userId: "M365-003",
    usedGB: 11.6,
    quotaGB: 1024,
    syncHealth: "Attention",
    sharing: "Internal Only",
    lastSync: "Yesterday, 16:20",
  },
  {
    userId: "M365-004",
    usedGB: 2.4,
    quotaGB: 1024,
    syncHealth: "Healthy",
    sharing: "Internal Only",
    lastSync: "Today, 08:00",
  },
  {
    userId: "M365-005",
    usedGB: 2.4,
    quotaGB: 1024,
    syncHealth: "Healthy",
    sharing: "Internal Only",
    lastSync: "Today, 08:00",
  },
];

function loadOneDriveData(): OneDriveData[] {
  if (
    typeof window === "undefined"
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

    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(
        ONEDRIVE_STORAGE_KEY,
        JSON.stringify(
          defaultOneDriveData,
        ),
      );

      return defaultOneDriveData;
    }

    return parsed;
  } catch {
    window.localStorage.setItem(
      ONEDRIVE_STORAGE_KEY,
      JSON.stringify(
        defaultOneDriveData,
      ),
    );

    return defaultOneDriveData;
  }
}

export default function OneDrivePage() {
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
    oneDriveData,
    setOneDriveData,
  ] =
    useState<OneDriveData[]>([]);

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

    setOneDriveData(
      loadOneDriveData(),
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

  const drives =
    useMemo(() => {
      return users.map(
        (user) => {
          const drive =
            oneDriveData.find(
              (item) =>
                item.userId ===
                user.id,
            );

          const fallback =
            defaultOneDriveData.find(
              (item) =>
                item.userId ===
                user.id,
            );

          const data =
            drive ??
            fallback ?? {
              userId:
                user.id,
              usedGB: 0,
              quotaGB: 1024,
              syncHealth:
                "Healthy" as SyncHealth,
              sharing:
                "Internal Only" as SharingPolicy,
              lastSync:
                "Not available",
            };

          return {
            ...user,
            ...data,
          };
        },
      );
    }, [
      users,
      oneDriveData,
    ]);

  const filteredDrives =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return drives;
      }

      return drives.filter(
        (drive) =>
          drive.name
            .toLowerCase()
            .includes(query) ||
          drive.email
            .toLowerCase()
            .includes(query) ||
          (
            drive.department ||
            ""
          )
            .toLowerCase()
            .includes(query),
      );
    }, [
      drives,
      search,
    ]);

  const enabledDrives =
    drives.filter(
      (drive) =>
        drive.oneDrive ===
        "Enabled",
    ).length;

  const attentionDrives =
    drives.filter(
      (drive) =>
        drive.syncHealth ===
          "Attention" ||
        drive.syncHealth ===
          "Error",
    ).length;

  const totalUsed =
    drives.reduce(
      (
        sum,
        drive,
      ) =>
        sum +
        drive.usedGB,
      0,
    );

  const totalQuota =
    drives.reduce(
      (
        sum,
        drive,
      ) =>
        sum +
        drive.quotaGB,
      0,
    );

  function toggleOneDrive(
    userId: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to change OneDrive access.",
      );

      return;
    }

    const updatedUsers =
      users.map(
        (user) =>
          user.id === userId
            ? {
                ...user,

                oneDrive:
                  user.oneDrive ===
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
      "OneDrive status updated successfully.",
    );
  }

  if (
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading OneDrive...
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
                OneDrive Administration
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Monitor OneDrive storage,
                sync health, sharing
                policies, and user
                access.
              </p>
            </div>

            <Link
              href="/m365/users"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold transition hover:bg-zinc-800"
            >
              View Users
            </Link>
          </div>

          {/* KPI */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              title="OneDrive Enabled"
              value={
                enabledDrives
              }
              subtitle="Users with OneDrive access"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Sync Attention"
              value={
                attentionDrives
              }
              subtitle="Users requiring review"
              valueClass="text-yellow-400"
            />

            <KpiCard
              title="Storage Used"
              value={`${totalUsed.toFixed(
                1,
              )} GB`}
              subtitle="Across all users"
              valueClass="text-purple-400"
            />

            <KpiCard
              title="Storage Capacity"
              value={
                totalQuota >= 1024
                  ? `${(
                      totalQuota /
                      1024
                    ).toFixed(
                      2,
                    )} TB`
                  : `${totalQuota.toFixed(
                      0,
                    )} GB`
              }
              subtitle="Provisioned capacity"
            />

          </div>

          {/* SEARCH */}

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <h2 className="text-2xl font-semibold">
                  OneDrive Directory
                </h2>

                <p className="mt-2 text-gray-400">
                  Search and manage
                  OneDrive user storage.
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
                      Storage
                    </th>

                    <th className="px-4 py-4">
                      Sync Health
                    </th>

                    <th className="px-4 py-4">
                      Sharing
                    </th>

                    <th className="px-4 py-4">
                      Last Sync
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-white/5">

                  {filteredDrives.map(
                    (drive) => {
                      const storagePercent =
                        drive.quotaGB >
                        0
                          ? Math.min(
                              Math.round(
                                (drive.usedGB /
                                  drive.quotaGB) *
                                  100,
                              ),
                              100,
                            )
                          : 0;

                      return (
                        <tr
                          key={
                            drive.id
                          }
                          className="transition hover:bg-white/[0.03]"
                        >

                          {/* USER */}

                          <td className="px-6 py-5">

                            <Link
                              href={`/m365/onedrive/${drive.id}`}
                              className="font-semibold text-blue-400 transition hover:text-blue-300"
                            >
                              {
                                drive.name
                              }
                            </Link>

                            <p className="mt-1 text-xs text-gray-500">
                              {
                                drive.email
                              }
                            </p>

                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-4 py-5 text-gray-300">
                            {drive.department ||
                              "Not configured"}
                          </td>

                          {/* STORAGE */}

                          <td className="px-4 py-5">

                            <div className="min-w-40">

                              <div className="flex items-center justify-between text-xs text-gray-400">

                                <span>
                                  {drive.usedGB.toFixed(
                                    1,
                                  )}{" "}
                                  GB
                                </span>

                                <span>
                                  {
                                    drive.quotaGB
                                  }{" "}
                                  GB
                                </span>

                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">

                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{
                                    width: `${storagePercent}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                          {/* SYNC */}

                          <td className="px-4 py-5">
                            <SyncBadge
                              status={
                                drive.syncHealth
                              }
                            />
                          </td>

                          {/* SHARING */}

                          <td className="px-4 py-5">

                            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                              {
                                drive.sharing
                              }
                            </span>

                          </td>

                          {/* LAST SYNC */}

                          <td className="px-4 py-5 text-gray-300">
                            {
                              drive.lastSync
                            }
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-5">
                            <StatusBadge
                              status={
                                drive.oneDrive
                              }
                            />
                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5">

                            <div className="flex justify-end gap-2">

                              <Link
                                href={`/m365/onedrive/${drive.id}`}
                                className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                              >
                                View
                              </Link>

                              {canManageM365 && (
                                <Link
                                  href={`/m365/onedrive/${drive.id}/edit`}
                                  className="rounded-lg border border-yellow-500/30 px-3 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
                                >
                                  Manage
                                </Link>
                              )}

                              {canManageM365 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleOneDrive(
                                      drive.id,
                                    )
                                  }
                                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                    drive.oneDrive ===
                                    "Enabled"
                                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                  }`}
                                >
                                  {drive.oneDrive ===
                                  "Enabled"
                                    ? "Disable"
                                    : "Enable"}
                                </button>
                              )}

                            </div>

                          </td>

                        </tr>
                      );
                    },
                  )}

                  {filteredDrives.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          8
                        }
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No OneDrive users found.
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

function SyncBadge({
  status,
}: {
  status: SyncHealth;
}) {
  if (
    status ===
    "Healthy"
  ) {
    return (
      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
        Healthy
      </span>
    );
  }

  if (
    status ===
    "Attention"
  ) {
    return (
      <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
        Attention
      </span>
    );
  }

  return (
    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
      Error
    </span>
  );
}
