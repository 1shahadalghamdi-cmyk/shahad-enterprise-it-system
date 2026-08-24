"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import {
  hasPermission,
  type UserRole,
} from "@/lib/iam/permissions";

type Severity =
  | "Critical"
  | "Warning"
  | "Info";

type AlertStatus =
  | "Open"
  | "Acknowledged"
  | "Resolved";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type Alert = {
  id: string;
  severity: Severity;
  source: string;
  category: string;
  message: string;
  createdAt: string;
  status: AlertStatus;
};

const initialAlerts: Alert[] = [
  {
    id: "ALT-001",
    severity: "Warning",
    source: "FILE01",
    category: "Storage",
    message:
      "Storage utilization exceeded the 85% warning threshold.",
    createdAt: "5 min ago",
    status: "Open",
  },
  {
    id: "ALT-002",
    severity: "Critical",
    source: "Backup Service",
    category: "Backup",
    message:
      "Nightly backup job failed and requires administrator attention.",
    createdAt: "18 min ago",
    status: "Open",
  },
  {
    id: "ALT-003",
    severity: "Warning",
    source: "CORE-SW01",
    category: "Network",
    message:
      "Interface Gi1/0/18 reported elevated packet errors.",
    createdAt: "34 min ago",
    status: "Acknowledged",
  },
  {
    id: "ALT-004",
    severity: "Info",
    source: "DC01",
    category: "System",
    message:
      "Scheduled Windows Server maintenance completed successfully.",
    createdAt: "1 hr ago",
    status: "Resolved",
  },
  {
    id: "ALT-005",
    severity: "Warning",
    source: "Microsoft 365",
    category: "Service",
    message:
      "Exchange response time temporarily exceeded monitoring baseline.",
    createdAt: "2 hrs ago",
    status: "Open",
  },
];

const ALERTS_STORAGE_KEY =
  "enterprise-monitoring-alerts";

export default function MonitoringAlertsPage() {
  const router = useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    alerts,
    setAlerts,
  ] =
    useState<Alert[]>(
      initialAlerts,
    );

  const [
    alertsLoaded,
    setAlertsLoaded,
  ] =
    useState(false);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    severity,
    setSeverity,
  ] =
    useState<
      "All" | Severity
    >("All");

  const [
    status,
    setStatus,
  ] =
    useState<
      "All" | AlertStatus
    >("All");

  const canViewMonitoring =
    currentUser
      ? hasPermission(
          currentUser.role,
          "monitoring:view",
        )
      : false;

  const canAcknowledge =
    currentUser
      ? hasPermission(
          currentUser.role,
          "monitoring:acknowledge",
        )
      : false;

  const canResolve =
    currentUser
      ? hasPermission(
          currentUser.role,
          "monitoring:resolve",
        )
      : false;

  /*
   * Load and validate user.
   */
  useEffect(() => {
    const savedUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          savedUser,
        ) as CurrentUser;

      if (
        !hasPermission(
          parsedUser.role,
          "monitoring:view",
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
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  /*
   * Load alerts.
   */
  useEffect(() => {
    try {
      const savedAlerts =
        window.localStorage.getItem(
          ALERTS_STORAGE_KEY,
        );

      if (savedAlerts) {
        const parsedAlerts =
          JSON.parse(
            savedAlerts,
          ) as Alert[];

        if (
          Array.isArray(
            parsedAlerts,
          )
        ) {
          setAlerts(
            parsedAlerts,
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load saved alerts:",
        error,
      );

      setAlerts(
        initialAlerts,
      );
    }

    setAlertsLoaded(
      true,
    );
  }, []);

  /*
   * Save alerts.
   */
  useEffect(() => {
    if (!alertsLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        ALERTS_STORAGE_KEY,
        JSON.stringify(
          alerts,
        ),
      );
    } catch (error) {
      console.error(
        "Failed to save alerts:",
        error,
      );
    }
  }, [
    alerts,
    alertsLoaded,
  ]);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return alerts.filter(
        (alert) => {
          const matchesSeverity =
            severity === "All" ||
            alert.severity ===
              severity;

          const matchesStatus =
            status === "All" ||
            alert.status ===
              status;

          const matchesSearch =
            !query ||
            [
              alert.id,
              alert.source,
              alert.category,
              alert.message,
              alert.severity,
              alert.status,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                query,
              );

          return (
            matchesSeverity &&
            matchesStatus &&
            matchesSearch
          );
        },
      );
    }, [
      alerts,
      search,
      severity,
      status,
    ]);

  function acknowledge(
    id: string,
  ) {
    if (
      !currentUser ||
      !canAcknowledge
    ) {
      return;
    }

    setAlerts(
      (current) =>
        current.map(
          (alert) =>
            alert.id === id &&
            alert.status !==
              "Resolved"
              ? {
                  ...alert,
                  status:
                    "Acknowledged",
                }
              : alert,
        ),
    );
  }

  function resolve(
    id: string,
  ) {
    if (
      !currentUser ||
      !canResolve
    ) {
      return;
    }

    setAlerts(
      (current) =>
        current.map(
          (alert) =>
            alert.id === id
              ? {
                  ...alert,
                  status:
                    "Resolved",
                }
              : alert,
        ),
    );
  }

  const openCount =
    alerts.filter(
      (alert) =>
        alert.status ===
        "Open",
    ).length;

  const criticalCount =
    alerts.filter(
      (alert) =>
        alert.severity ===
          "Critical" &&
        alert.status !==
          "Resolved",
    ).length;

  const warningCount =
    alerts.filter(
      (alert) =>
        alert.severity ===
          "Warning" &&
        alert.status !==
          "Resolved",
    ).length;

  const resolvedCount =
    alerts.filter(
      (alert) =>
        alert.status ===
        "Resolved",
    ).length;

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Infrastructure Alerts...
        </p>
      </main>
    );
  }

  if (!canViewMonitoring) {
    return null;
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Infrastructure Monitoring
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Infrastructure Alerts
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Review operational alerts generated by
                enterprise servers, network infrastructure,
                backup services, and cloud services.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/monitoring"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
              >
                Monitoring Dashboard
              </Link>

              <Link
                href="/monitoring/devices"
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 hover:bg-blue-500/20"
              >
                Monitored Devices
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Open Alerts"
              value={
                openCount
              }
              subtitle="Require review"
              valueClass="text-yellow-300"
            />

            <Kpi
              title="Critical"
              value={
                criticalCount
              }
              subtitle="Immediate attention"
              valueClass="text-red-400"
            />

            <Kpi
              title="Warnings"
              value={
                warningCount
              }
              subtitle="Active warning events"
              valueClass="text-yellow-300"
            />

            <Kpi
              title="Resolved"
              value={
                resolvedCount
              }
              subtitle="Completed incidents"
              valueClass="text-green-400"
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Alert Console
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Filter, acknowledge, and resolve
                    infrastructure events.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <select
                    value={
                      severity
                    }
                    onChange={(
                      event,
                    ) =>
                      setSeverity(
                        event
                          .target
                          .value as
                          | "All"
                          | Severity,
                      )
                    }
                    className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="All">
                      All Severities
                    </option>

                    <option value="Critical">
                      Critical
                    </option>

                    <option value="Warning">
                      Warning
                    </option>

                    <option value="Info">
                      Info
                    </option>
                  </select>

                  <select
                    value={
                      status
                    }
                    onChange={(
                      event,
                    ) =>
                      setStatus(
                        event
                          .target
                          .value as
                          | "All"
                          | AlertStatus,
                      )
                    }
                    className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="All">
                      All Statuses
                    </option>

                    <option value="Open">
                      Open
                    </option>

                    <option value="Acknowledged">
                      Acknowledged
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>
                  </select>

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
                    placeholder="Search alerts..."
                    className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filtered.map(
                (alert) => (
                  <div
                    key={
                      alert.id
                    }
                    className="p-6 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <SeverityBadge
                            severity={
                              alert.severity
                            }
                          />

                          <StatusBadge
                            status={
                              alert.status
                            }
                          />

                          <span className="text-xs text-gray-600">
                            {
                              alert.id
                            }
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-blue-400">
                          {
                            alert.source
                          }
                        </h3>

                        <p className="mt-2 max-w-3xl leading-7 text-gray-300">
                          {
                            alert.message
                          }
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                          <span>
                            Category:{" "}
                            <strong className="text-gray-400">
                              {
                                alert.category
                              }
                            </strong>
                          </span>

                          <span>
                            Created:{" "}
                            <strong className="text-gray-400">
                              {
                                alert.createdAt
                              }
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-3">
                        {canAcknowledge && (
                          <button
                            type="button"
                            disabled={
                              alert.status ===
                                "Acknowledged" ||
                              alert.status ===
                                "Resolved"
                            }
                            onClick={() =>
                              acknowledge(
                                alert.id,
                              )
                            }
                            className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Acknowledge
                          </button>
                        )}

                        {canResolve && (
                          <button
                            type="button"
                            disabled={
                              alert.status ===
                              "Resolved"
                            }
                            onClick={() =>
                              resolve(
                                alert.id,
                              )
                            }
                            className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}

              {filtered.length ===
                0 && (
                <div className="p-14 text-center text-gray-500">
                  No alerts match the selected filters.
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Alert Workflow
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Node label="Metric Threshold" />
              <Arrow />
              <Node label="Alert Generated" />
              <Arrow />
              <Node label="IT Acknowledges" />
              <Arrow />
              <Node label="Investigation" />
              <Arrow />
              <Node label="Resolved" />
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

function SeverityBadge({
  severity,
}: {
  severity: Severity;
}) {
  const classes =
    severity ===
    "Critical"
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : severity ===
          "Warning"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        : "border-blue-500/30 bg-blue-500/10 text-blue-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {severity}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: AlertStatus;
}) {
  const classes =
    status ===
    "Resolved"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : status ===
          "Acknowledged"
        ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
        : "border-white/10 bg-white/5 text-gray-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
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
