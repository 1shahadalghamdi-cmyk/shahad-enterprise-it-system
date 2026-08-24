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

type SyncHealth =
  | "Healthy"
  | "Attention"
  | "Error";

type SharingPolicy =
  | "Internal Only"
  | "Internal + External";

type OneDriveRecord = {
  userId: string;
  usedGB: number;
  quotaGB: number;
  syncHealth: SyncHealth;
  sharing: SharingPolicy;
  lastSync: string;
};

const ONEDRIVE_STORAGE_KEY =
  "m365OneDrive";

const defaultOneDriveData: OneDriveRecord[] = [
  {
    userId: "M365-001",
    usedGB: 42.6,
    quotaGB: 1024,
    syncHealth: "Healthy",
    sharing:
      "Internal + External",
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
    lastSync:
      "Yesterday, 16:20",
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

function saveOneDriveData(
  records: OneDriveRecord[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    ONEDRIVE_STORAGE_KEY,
    JSON.stringify(records),
  );
}

export default function EditOneDriveUserPage() {
  const router = useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const userId =
    Array.isArray(
      params.id,
    )
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
    records,
    setRecords,
  ] =
    useState<OneDriveRecord[]>([]);

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  const [
    quotaGB,
    setQuotaGB,
  ] =
    useState("1024");

  const [
    sharing,
    setSharing,
  ] =
    useState<SharingPolicy>(
      "Internal Only",
    );

  const [
    syncHealth,
    setSyncHealth,
  ] =
    useState<SyncHealth>(
      "Healthy",
    );

  const [
    lastSync,
    setLastSync,
  ] =
    useState("");

  const [
    oneDriveStatus,
    setOneDriveStatus,
  ] =
    useState<
      "Enabled" | "Disabled"
    >("Enabled");

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

      const loadedRecords =
        loadOneDriveData();

      setUsers(
        loadedUsers,
      );

      setRecords(
        loadedRecords,
      );

      const foundUser =
        loadedUsers.find(
          (user) =>
            user.id ===
            userId,
        );

      const foundRecord =
        loadedRecords.find(
          (record) =>
            record.userId ===
            userId,
        );

      if (foundUser) {
        setOneDriveStatus(
          foundUser.oneDrive,
        );
      }

      let resolvedRecords =
        loadedRecords;

      let resolvedRecord =
        foundRecord;

      /*
       * Automatically provision a
       * OneDrive record for newly
       * created Microsoft 365 users.
       */
      if (
        foundUser &&
        !foundRecord
      ) {
        const newRecord: OneDriveRecord = {
          userId: foundUser.id,
          usedGB: 0,
          quotaGB: 1024,
          syncHealth: "Healthy",
          sharing: "Internal Only",
          lastSync: "Not available",
        };

        resolvedRecord =
          newRecord;

        resolvedRecords = [
          ...loadedRecords,
          newRecord,
        ];

        saveOneDriveData(
          resolvedRecords,
        );

        setRecords(
          resolvedRecords,
        );
      }

      if (resolvedRecord) {
        setQuotaGB(
          String(
            resolvedRecord.quotaGB,
          ),
        );

        setSharing(
          resolvedRecord.sharing,
        );

        setSyncHealth(
          resolvedRecord.syncHealth,
        );

        setLastSync(
          resolvedRecord.lastSync,
        );
      }

      setLoaded(true);
    } catch (
      error
    ) {
      console.error(
        "Failed to load OneDrive settings:",
        error,
      );

      router.replace(
        "/m365/onedrive",
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

  const drive =
    useMemo(
      () =>
        records.find(
          (item) =>
            item.userId ===
            userId,
        ),
      [
        records,
        userId,
      ],
    );

  function handleSave() {
    if (
      !user ||
      !drive ||
      !canManageM365
    ) {
      return;
    }

    const parsedQuota =
      Number(quotaGB);

    if (
      !Number.isFinite(
        parsedQuota,
      ) ||
      parsedQuota <= 0
    ) {
      setMessage(
        "Storage quota must be greater than 0 GB.",
      );

      return;
    }

    if (
      parsedQuota <
      drive.usedGB
    ) {
      setMessage(
        `Storage quota cannot be lower than current usage (${drive.usedGB} GB).`,
      );

      return;
    }

    const updatedRecord: OneDriveRecord = {
      ...drive,
      quotaGB:
        parsedQuota,
      sharing,
      syncHealth,
      lastSync:
        lastSync.trim() ||
        "Not available",
    };

    const updatedRecords =
      records.map(
        (record) =>
          record.userId ===
          updatedRecord.userId
            ? updatedRecord
            : record,
      );

    const updatedUsers =
      users.map(
        (item) =>
          item.id ===
          user.id
            ? {
                ...item,
                oneDrive:
                  oneDriveStatus,
              }
            : item,
      );

    setSaving(true);

    saveOneDriveData(
      updatedRecords,
    );

    saveM365Users(
      updatedUsers,
    );

    setRecords(
      updatedRecords,
    );

    setUsers(
      updatedUsers,
    );

    setMessage(
      "OneDrive settings saved successfully.",
    );

    setSaving(false);

    router.push(
      `/m365/onedrive/${user.id}`,
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
          Loading OneDrive settings...
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
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <h1 className="text-3xl font-bold">
              OneDrive User Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              OneDrive information is not available for this user.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/m365/onedrive",
                )
              }
              className="mt-6 rounded-xl border border-white/10 bg-zinc-950 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to OneDrive
            </button>
          </div>
        </section>
      </main>
    );
  }

  const usagePercent =
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
                Manage OneDrive
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
                  `/m365/onedrive/${user.id}`,
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
              label="Storage Used"
              value={`${drive.usedGB} GB`}
              subtitle="Current storage"
            />

            <SummaryCard
              label="Current Quota"
              value={`${drive.quotaGB} GB`}
              subtitle="Assigned capacity"
            />

            <SummaryCard
              label="Usage"
              value={`${usagePercent}%`}
              subtitle="Current utilization"
            />

            <SummaryCard
              label="Status"
              value={
                user.oneDrive
              }
              subtitle="OneDrive access"
            />
          </section>

          {/* STORAGE */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Storage Management
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Storage & Quota
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Configure OneDrive storage capacity for this user.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Storage Used
                </span>

                <input
                  value={`${drive.usedGB} GB`}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-gray-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Storage Quota (GB)
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={
                    quotaGB
                  }
                  onChange={(
                    event,
                  ) => {
                    setQuotaGB(
                      event
                        .target
                        .value,
                    );

                    setMessage("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>
            </div>
          </section>

          {/* SHARING & SYNC */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Policies
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Sharing & Synchronization
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Configure sharing permissions and sync health.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Sharing Policy
                </span>

                <select
                  value={
                    sharing
                  }
                  onChange={(
                    event,
                  ) =>
                    setSharing(
                      event
                        .target
                        .value as SharingPolicy,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="Internal Only">
                    Internal Only
                  </option>

                  <option value="Internal + External">
                    Internal + External
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Sync Health
                </span>

                <select
                  value={
                    syncHealth
                  }
                  onChange={(
                    event,
                  ) =>
                    setSyncHealth(
                      event
                        .target
                        .value as SyncHealth,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="Healthy">
                    Healthy
                  </option>

                  <option value="Attention">
                    Attention
                  </option>

                  <option value="Error">
                    Error
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Last Sync
                </span>

                <input
                  value={
                    lastSync
                  }
                  onChange={(
                    event,
                  ) =>
                    setLastSync(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Example: Today, 09:45"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  OneDrive Status
                </span>

                <select
                  value={
                    oneDriveStatus
                  }
                  onChange={(
                    event,
                  ) =>
                    setOneDriveStatus(
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
            </div>
          </section>

          {/* USER */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                User
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Microsoft 365 Identity
              </h2>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
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
                  `/m365/onedrive/${user.id}`,
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
