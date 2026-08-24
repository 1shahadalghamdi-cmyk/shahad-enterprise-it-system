"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

type Health =
  | "Healthy"
  | "Warning"
  | "Critical";

type Severity =
  | "Critical"
  | "Warning"
  | "Info";

type AlertStatus =
  | "Open"
  | "Acknowledged"
  | "Resolved";

type MonitoringAlert = {
  id: string;
  severity: Severity;
  source: string;
  category: string;
  message: string;
  createdAt: string;
  status: AlertStatus;
};

type SystemItem = {
  name: string;
  type: string;
  cpu: number;
  memory: number;
  storage: number;
  uptime: string;
  status: Health;
};

type ServiceItem = {
  name: string;
  status: Health;
  response: string;
};

const ALERTS_STORAGE_KEY =
  "enterprise-monitoring-alerts";

const baseSystems: SystemItem[] = [
  {
    name: "DC01",
    type: "Domain Controller",
    cpu: 28,
    memory: 46,
    storage: 39,
    uptime: "99.99%",
    status: "Healthy",
  },
  {
    name: "DC02",
    type: "Domain Controller",
    cpu: 24,
    memory: 41,
    storage: 35,
    uptime: "99.98%",
    status: "Healthy",
  },
  {
    name: "DHCP01",
    type: "DHCP Server",
    cpu: 18,
    memory: 37,
    storage: 31,
    uptime: "99.97%",
    status: "Healthy",
  },
  {
    name: "FILE01",
    type: "File Server",
    cpu: 62,
    memory: 76,
    storage: 88,
    uptime: "99.91%",
    status: "Warning",
  },
  {
    name: "CORE-SW01",
    type: "Core Switch",
    cpu: 34,
    memory: 52,
    storage: 20,
    uptime: "99.99%",
    status: "Healthy",
  },
  {
    name: "FW01",
    type: "Firewall",
    cpu: 44,
    memory: 58,
    storage: 29,
    uptime: "99.96%",
    status: "Healthy",
  },
];

const fallbackAlerts: MonitoringAlert[] = [
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

const services: ServiceItem[] = [
  {
    name: "Active Directory",
    status: "Healthy",
    response: "18 ms",
  },
  {
    name: "DNS",
    status: "Healthy",
    response: "12 ms",
  },
  {
    name: "DHCP",
    status: "Healthy",
    response: "21 ms",
  },
  {
    name: "File Services",
    status: "Warning",
    response: "84 ms",
  },
  {
    name: "Microsoft 365",
    status: "Healthy",
    response: "31 ms",
  },
];

export default function MonitoringDashboardPage() {
  const [alerts, setAlerts] =
    useState<MonitoringAlert[]>(
      fallbackAlerts,
    );

  const [
    alertsLoaded,
    setAlertsLoaded,
  ] = useState(false);

  /*
   * Load monitoring alerts from the same localStorage
   * used by the Infrastructure Alerts page.
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
          ) as MonitoringAlert[];

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
        "Failed to load monitoring alerts:",
        error,
      );
    }

    setAlertsLoaded(true);
  }, []);

  /*
   * Sync changes if localStorage is updated
   * from another browser tab/window.
   */
  useEffect(() => {
    function handleStorage(
      event: StorageEvent,
    ) {
      if (
        event.key !==
          ALERTS_STORAGE_KEY ||
        !event.newValue
      ) {
        return;
      }

      try {
        const parsedAlerts =
          JSON.parse(
            event.newValue,
          ) as MonitoringAlert[];

        if (
          Array.isArray(
            parsedAlerts,
          )
        ) {
          setAlerts(
            parsedAlerts,
          );
        }
      } catch (error) {
        console.error(
          "Failed to sync monitoring alerts:",
          error,
        );
      }
    }

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, []);

  /*
   * FILE01 health is linked to ALT-001.
   *
   * If the storage alert is unresolved:
   * Storage = 88%
   * Health = Warning
   *
   * If the alert is resolved:
   * Storage = 68%
   * Health = Healthy
   */
  const systems: SystemItem[] =
    useMemo(() => {
      const file01StorageAlert =
        alerts.find(
          (alert) =>
            alert.id ===
            "ALT-001",
        );

      return baseSystems.map(
        (system): SystemItem => {
          if (
            system.name !==
            "FILE01"
          ) {
            return system;
          }

          const fileAlertResolved =
            file01StorageAlert?.status ===
            "Resolved";

          return {
            ...system,
            storage:
              fileAlertResolved
                ? 68
                : 88,
            status:
              fileAlertResolved
                ? "Healthy"
                : "Warning",
          };
        },
      );
    }, [alerts]);

  /*
   * Only non-resolved alerts are active.
   */
  const activeAlerts =
    useMemo(
      () =>
        alerts.filter(
          (alert) =>
            alert.status !==
            "Resolved",
        ),
      [alerts],
    );

  /*
   * Show the three latest unresolved alerts
   * on the Monitoring Dashboard.
   */
  const recentAlerts =
    activeAlerts.slice(
      0,
      3,
    );

  /*
   * Infrastructure KPI calculations.
   */
  const healthy =
    systems.filter(
      (item) =>
        item.status ===
        "Healthy",
    ).length;

  const warnings =
    systems.filter(
      (item) =>
        item.status ===
        "Warning",
    ).length;

  const avgCpu =
    Math.round(
      systems.reduce(
        (sum, item) =>
          sum + item.cpu,
        0,
      ) /
        systems.length,
    );

  const avgMemory =
    Math.round(
      systems.reduce(
        (sum, item) =>
          sum +
          item.memory,
        0,
      ) /
        systems.length,
    );

  const highestStorage =
    Math.max(
      ...systems.map(
        (item) =>
          item.storage,
      ),
    );

  /*
   * Check whether FILE01 storage issue
   * has been resolved.
   */
  const file01Resolved =
    alerts.find(
      (alert) =>
        alert.id ===
        "ALT-001",
    )?.status ===
    "Resolved";

  /*
   * File Services health is also connected
   * to the FILE01 storage alert.
   */
  const dynamicServices: ServiceItem[] =
    services.map(
      (
        service,
      ): ServiceItem => {
        if (
          service.name !==
          "File Services"
        ) {
          return service;
        }

        return {
          ...service,
          status:
            file01Resolved
              ? "Healthy"
              : "Warning",
          response:
            file01Resolved
              ? "24 ms"
              : "84 ms",
        };
      },
    );

  /*
   * Prevent initial fallback values from flashing
   * before localStorage has been loaded.
   */
  if (!alertsLoaded) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">
            Loading monitoring data...
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
                Enterprise Operations
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Infrastructure Monitoring
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Monitor enterprise servers,
                network infrastructure,
                resource utilization,
                service health, uptime,
                and operational alerts
                from one dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/monitoring/alerts"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-300 hover:bg-red-500/20"
              >
                View Alerts
              </Link>

              <Link
                href="/monitoring/devices"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
              >
                Monitored Devices
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Monitored Systems"
              value={
                systems.length
              }
              subtitle="Servers and network devices"
            />

            <Kpi
              title="Healthy"
              value={
                healthy
              }
              subtitle="Operating normally"
              valueClass="text-green-400"
            />

            <Kpi
              title="Warnings"
              value={
                warnings
              }
              subtitle="Require investigation"
              valueClass="text-yellow-300"
            />

            <Kpi
              title="Active Alerts"
              value={
                activeAlerts.length
              }
              subtitle="Operational notifications"
              valueClass="text-red-400"
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="border-b border-white/10 p-6">
                <h2 className="text-2xl font-semibold">
                  Infrastructure Health
                </h2>

                <p className="mt-2 text-gray-400">
                  Current resource utilization
                  across monitored infrastructure.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                    <tr>
                      <th className="px-6 py-4">
                        System
                      </th>

                      <th className="px-4 py-4">
                        CPU
                      </th>

                      <th className="px-4 py-4">
                        Memory
                      </th>

                      <th className="px-4 py-4">
                        Storage
                      </th>

                      <th className="px-4 py-4">
                        Uptime
                      </th>

                      <th className="px-6 py-4">
                        Health
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {systems.map(
                      (system) => (
                        <tr
                          key={
                            system.name
                          }
                          className="hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold text-blue-400">
                              {
                                system.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {
                                system.type
                              }
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <Metric
                              value={
                                system.cpu
                              }
                            />
                          </td>

                          <td className="px-4 py-5">
                            <Metric
                              value={
                                system.memory
                              }
                            />
                          </td>

                          <td className="px-4 py-5">
                            <Metric
                              value={
                                system.storage
                              }
                            />
                          </td>

                          <td className="px-4 py-5 font-mono text-sm text-gray-300">
                            {
                              system.uptime
                            }
                          </td>

                          <td className="px-6 py-5">
                            <HealthBadge
                              status={
                                system.status
                              }
                            />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Resource Overview
              </h2>

              <p className="mt-2 text-gray-400">
                Average infrastructure utilization.
              </p>

              <div className="mt-6 space-y-6">
                <LargeMetric
                  label="Average CPU"
                  value={
                    avgCpu
                  }
                />

                <LargeMetric
                  label="Average Memory"
                  value={
                    avgMemory
                  }
                />

                <LargeMetric
                  label="Highest Storage"
                  value={
                    highestStorage
                  }
                />
              </div>
            </section>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Service Health
              </h2>

              <p className="mt-2 text-gray-400">
                Availability and response time
                of core enterprise services.
              </p>

              <div className="mt-6 space-y-3">
                {dynamicServices.map(
                  (service) => (
                    <div
                      key={
                        service.name
                      }
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {
                            service.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          Response:{" "}
                          {
                            service.response
                          }
                        </p>
                      </div>

                      <HealthBadge
                        status={
                          service.status
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Recent Alerts
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Latest unresolved infrastructure
                    events requiring attention.
                  </p>
                </div>

                <Link
                  href="/monitoring/alerts"
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                  View all
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {recentAlerts.map(
                  (alert) => (
                    <div
                      key={
                        alert.id
                      }
                      className="rounded-xl border border-white/10 bg-zinc-950 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={
                              alert.severity ===
                              "Critical"
                                ? "font-semibold text-red-400"
                                : alert.severity ===
                                    "Warning"
                                  ? "font-semibold text-yellow-300"
                                  : "font-semibold text-blue-400"
                            }
                          >
                            {
                              alert.source
                            }
                          </p>

                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {
                              alert.message
                            }
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-gray-600">
                          {
                            alert.createdAt
                          }
                        </span>
                      </div>
                    </div>
                  ),
                )}

                {recentAlerts.length ===
                  0 && (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5 text-sm text-green-300">
                    No active monitoring alerts.
                  </div>
                )}
              </div>
            </section>
          </div>
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

function Metric({
  value,
}: {
  value: number;
}) {
  const text =
    value >= 85
      ? "text-red-400"
      : value >= 70
        ? "text-yellow-300"
        : "text-green-400";

  return (
    <div className="min-w-[110px]">
      <div className="flex justify-between text-xs">
        <span
          className={
            text
          }
        >
          {value}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-950">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function LargeMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">
          {label}
        </span>

        <span className="font-semibold">
          {value}%
        </span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-950">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function HealthBadge({
  status,
}: {
  status: Health;
}) {
  const classes =
    status ===
    "Healthy"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : status ===
          "Warning"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        : "border-red-500/30 bg-red-500/10 text-red-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}
