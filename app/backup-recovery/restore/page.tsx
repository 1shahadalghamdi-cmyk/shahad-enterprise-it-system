"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

type RestoreType =
  | "Full Restore"
  | "File Restore"
  | "System State";

type RestoreStatus =
  | "Available"
  | "Completed"
  | "In Progress";

type RestorePoint = {
  id: string;
  system: string;
  date: string;
  type: RestoreType;
  size: string;
  repository: string;
  status: RestoreStatus;
};

const initialRestorePoints: RestorePoint[] = [
  {
    id: "RP-001",
    system: "DC01",
    date: "Today • 01:14",
    type: "System State",
    size: "19 GB",
    repository: "BACKUP01",
    status: "Available",
  },
  {
    id: "RP-002",
    system: "DC02",
    date: "Today • 01:14",
    type: "System State",
    size: "19 GB",
    repository: "BACKUP01",
    status: "Available",
  },
  {
    id: "RP-003",
    system: "FILE01",
    date: "Today • 02:42",
    type: "File Restore",
    size: "286 GB",
    repository: "BACKUP01",
    status: "Available",
  },
  {
    id: "RP-004",
    system: "Microsoft 365",
    date: "Today • 03:31",
    type: "File Restore",
    size: "124 GB",
    repository: "Cloud Repository",
    status: "Available",
  },
  {
    id: "RP-005",
    system: "Enterprise Systems",
    date: "Last Sunday",
    type: "Full Restore",
    size: "1.1 TB",
    repository: "Offsite Copy",
    status: "Available",
  },
];

type HistoryItem = {
  id: string;
  system: string;
  type: RestoreType;
  requestedBy: string;
  completedAt: string;
  status: "Completed";
};

const initialHistory: HistoryItem[] = [
  {
    id: "RST-001",
    system: "FILE01",
    type: "File Restore",
    requestedBy: "IT Admin",
    completedAt: "Aug 06 • 10:22",
    status: "Completed",
  },
  {
    id: "RST-002",
    system: "DC02",
    type: "System State",
    requestedBy: "IT Admin",
    completedAt: "Jul 29 • 14:10",
    status: "Completed",
  },
];

const RESTORE_HISTORY_STORAGE_KEY =
  "enterprise-restore-history";

export default function RestoreRecoveryPage() {
  const [restorePoints] =
    useState(initialRestorePoints);

  const [history, setHistory] =
    useState<HistoryItem[]>(initialHistory);

  const [historyLoaded, setHistoryLoaded] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState("RP-001");

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [reason, setReason] =
    useState("");

  /*
   * Load saved restore history.
   */
  useEffect(() => {
    try {
      const savedHistory =
        window.localStorage.getItem(
          RESTORE_HISTORY_STORAGE_KEY
        );

      if (savedHistory) {
        const parsedHistory =
          JSON.parse(
            savedHistory
          ) as HistoryItem[];

        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load restore history:",
        error
      );

      setHistory(initialHistory);
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  /*
   * Save restore history whenever it changes.
   */
  useEffect(() => {
    if (!historyLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        RESTORE_HISTORY_STORAGE_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error(
        "Failed to save restore history:",
        error
      );
    }
  }, [history, historyLoaded]);

  const selected =
    restorePoints.find(
      (point) =>
        point.id === selectedId
    ) ?? restorePoints[0];

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return restorePoints;
      }

      return restorePoints.filter(
        (point) =>
          [
            point.system,
            point.type,
            point.repository,
            point.date,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [
      restorePoints,
      search,
    ]);

  function getNextRestoreId() {
    const highestNumber =
      history.reduce(
        (highest, item) => {
          const numericPart =
            Number(
              item.id.replace(
                "RST-",
                ""
              )
            );

          if (
            Number.isNaN(
              numericPart
            )
          ) {
            return highest;
          }

          return Math.max(
            highest,
            numericPart
          );
        },
        0
      );

    return `RST-${String(
      highestNumber + 1
    ).padStart(3, "0")}`;
  }

  function startRestore(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!reason.trim()) {
      setMessage(
        "Enter a recovery reason before starting the restore."
      );

      return;
    }

    const newHistoryItem: HistoryItem = {
      id: getNextRestoreId(),
      system: selected.system,
      type: selected.type,
      requestedBy: "IT Admin",
      completedAt: "Just now",
      status: "Completed",
    };

    setHistory(
      (current) => [
        newHistoryItem,
        ...current,
      ]
    );

    setReason("");

    setMessage(
      `Restore completed successfully for ${selected.system}.`
    );
  }

  if (!historyLoaded) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">
            Loading recovery data...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Backup & Disaster Recovery
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Restore & Recovery
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Select validated restore points
                and simulate recovery of
                enterprise servers, files,
                Active Directory system state,
                and protected cloud data.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/backup-recovery"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
              >
                Backup Dashboard
              </Link>

              <Link
                href="/backup-recovery/dr-plan"
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-300"
              >
                DR Plan
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Restore Points"
              value={restorePoints.length}
              subtitle="Validated recovery points"
            />

            <Kpi
              title="Repositories"
              value="3"
              subtitle="Local, cloud, and offsite"
              valueClass="text-blue-400"
            />

            <Kpi
              title="Recovery Tests"
              value={history.length}
              subtitle="Completed restore operations"
              valueClass="text-green-400"
            />

            <Kpi
              title="Recovery Readiness"
              value="Ready"
              subtitle="Restore workflow available"
              valueClass="text-purple-400"
            />
          </div>

          {message && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                message.includes(
                  "successfully"
                )
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Available Restore Points
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Choose a protected recovery
                    point.
                  </p>
                </div>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search restore points..."
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="divide-y divide-white/5">
                {filtered.map(
                  (point) => (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(
                          point.id
                        );

                        setMessage("");
                      }}
                      className={`w-full p-6 text-left transition hover:bg-white/[0.03] ${
                        selected.id ===
                        point.id
                          ? "bg-blue-500/[0.07]"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-blue-400">
                              {
                                point.system
                              }
                            </h3>

                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
                              {
                                point.status
                              }
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-gray-400">
                            {point.type} •{" "}
                            {point.date}
                          </p>

                          <p className="mt-2 text-xs text-gray-600">
                            {point.id} •{" "}
                            {
                              point.repository
                            }
                          </p>
                        </div>

                        <span className="font-mono text-sm text-gray-300">
                          {point.size}
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            </section>

            <form
              onSubmit={startRestore}
              className="h-fit rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Selected Recovery Point
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {selected.system}
              </h2>

              <p className="mt-1 text-gray-400">
                {selected.type}
              </p>

              <div className="mt-6 space-y-3">
                <Detail
                  label="Restore Point"
                  value={selected.id}
                />

                <Detail
                  label="Backup Date"
                  value={selected.date}
                />

                <Detail
                  label="Repository"
                  value={
                    selected.repository
                  }
                />

                <Detail
                  label="Backup Size"
                  value={selected.size}
                />
              </div>

              <label className="mt-6 block">
                <span className="mb-2 block text-sm text-gray-400">
                  Recovery Reason
                </span>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder="Example: Recover deleted department files..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              <button
                type="submit"
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
              >
                Start Restore
              </button>

              <p className="mt-3 text-xs leading-5 text-gray-600">
                Portfolio simulation: this
                action demonstrates the
                recovery workflow and does
                not modify a real server.
              </p>
            </form>
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Restore History
              </h2>

              <p className="mt-2 text-gray-400">
                Previously completed recovery
                operations and tests.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Restore
                    </th>

                    <th className="px-4 py-4">
                      System
                    </th>

                    <th className="px-4 py-4">
                      Type
                    </th>

                    <th className="px-4 py-4">
                      Requested By
                    </th>

                    <th className="px-4 py-4">
                      Completed
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {history.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-gray-400">
                          {item.id}
                        </td>

                        <td className="px-4 py-5 font-semibold text-blue-400">
                          {item.system}
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {item.type}
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            item.requestedBy
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {
                            item.completedAt
                          }
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                            Completed
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Recovery Workflow
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Node label="Incident Detected" />

              <Arrow />

              <Node label="Select Restore Point" />

              <Arrow />

              <Node label="Validate Backup" />

              <Arrow />

              <Node label="Restore System / Data" />

              <Arrow />

              <Node label="Service Verification" />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Kpi({
  title,
  value,
  subtitle,
  valueClass = "text-white",
}: {
  title: string;
  value: number | string;
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

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-gray-300">
        {value}
      </span>
    </div>
  );
}

function Node({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-semibold text-blue-300">
      {label}
    </span>
  );
}

function Arrow() {
  return (
    <span className="text-gray-600">
      →
    </span>
  );
}
