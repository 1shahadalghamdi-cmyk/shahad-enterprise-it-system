/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/system/Sidebar";
import { useEnterpriseData } from "@/hooks/useEnterpriseData";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type MaintenanceStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled";

type MaintenanceRecord = {
  id: string;
  assetId: string;
  assetName: string;
  issue: string;
  technician: string;
  cost: number;
  status: MaintenanceStatus;
  notes: string;
  startDate: string;
  completionDate: string;
  createdAt: string;
  updatedAt: string;
};

type ActivityLog = {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
};

type SummaryItem = {
  label: string;
  value: number;
};

export default function ReportsPage() {
  const router = useRouter();

  const {
    assets,
    employees,
    tickets,
    isLoading,
  } = useEnterpriseData();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [
    maintenanceRecords,
    setMaintenanceRecords,
  ] = useState<MaintenanceRecord[]>([]);

  const [
    activityLogs,
    setActivityLogs,
  ] = useState<ActivityLog[]>([]);

  const refreshReportData =
    useCallback(() => {
      try {
        const savedMaintenance =
          JSON.parse(
            window.localStorage.getItem(
              "maintenanceRecords",
            ) || "[]",
          ) as MaintenanceRecord[];

        const savedActivityLogs =
          JSON.parse(
            window.localStorage.getItem(
              "activityLogs",
            ) || "[]",
          ) as ActivityLog[];

        setMaintenanceRecords(
          Array.isArray(savedMaintenance)
            ? savedMaintenance
            : [],
        );

        setActivityLogs(
          Array.isArray(savedActivityLogs)
            ? savedActivityLogs
            : [],
        );
      } catch (error) {
        console.error(
          "Failed to load report data:",
          error,
        );

        setMaintenanceRecords([]);
        setActivityLogs([]);
      }
    }, []);

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
        parsedUser.role !==
        "IT Admin"
      ) {
        router.replace(
          "/dashboard",
        );
        return;
      }

      setCurrentUser(parsedUser);

      refreshReportData();
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [refreshReportData, router]);

  useEffect(() => {
    function handleStorageChange() {
      refreshReportData();
    }

    function handleFocus() {
      refreshReportData();
    }

    function handlePageShow() {
      refreshReportData();
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshReportData();
      }
    }

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    window.addEventListener(
      "focus",
      handleFocus,
    );

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );

      window.removeEventListener(
        "focus",
        handleFocus,
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [refreshReportData]);

  /*
   * =========================================================
   * ASSET METRICS
   * =========================================================
   */

  const assignedAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.status ===
          "Assigned",
      ).length,
    [assets],
  );

  const availableAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.status ===
            "Available" ||
          asset.status ===
            "Active",
      ).length,
    [assets],
  );

  const maintenanceAssets =
    useMemo(
      () =>
        assets.filter(
          (asset) =>
            asset.status ===
            "Maintenance",
        ).length,
      [assets],
    );

  /*
   * =========================================================
   * TICKET METRICS
   * =========================================================
   */

  const openTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status !==
            "Resolved" &&
          ticket.status !==
            "Closed",
      ).length,
    [tickets],
  );

  const resolvedTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status ===
            "Resolved" ||
          ticket.status ===
            "Closed",
      ).length,
    [tickets],
  );

  /*
   * =========================================================
   * MAINTENANCE METRICS
   * =========================================================
   */

  const activeMaintenanceRecords =
    useMemo(
      () =>
        maintenanceRecords.filter(
          (record) =>
            record.status !==
            "Cancelled",
        ),
      [maintenanceRecords],
    );

  const maintenanceRecordCount =
    activeMaintenanceRecords.length;

  const maintenanceCost = useMemo(
    () =>
      activeMaintenanceRecords.reduce(
        (total, record) =>
          total +
          Number(
            record.cost || 0,
          ),
        0,
      ),
    [activeMaintenanceRecords],
  );

  /*
   * =========================================================
   * KPI RATES
   * =========================================================
   */

  const assetUtilizationRate =
    useMemo(() => {
      if (
        assets.length === 0
      ) {
        return 0;
      }

      return Math.round(
        (assignedAssets /
          assets.length) *
          100,
      );
    }, [
      assets.length,
      assignedAssets,
    ]);

  const ticketResolutionRate =
    useMemo(() => {
      if (
        tickets.length === 0
      ) {
        return 0;
      }

      return Math.round(
        (resolvedTickets /
          tickets.length) *
          100,
      );
    }, [
      resolvedTickets,
      tickets.length,
    ]);

  /*
   * =========================================================
   * ASSETS BY DEPARTMENT
   * =========================================================
   */

  const assetsByDepartment =
    useMemo<SummaryItem[]>(() => {
      const counts =
        new Map<
          string,
          number
        >();

      assets.forEach(
        (asset) => {
          const department =
            asset.department
              ?.trim() ||
            "Unassigned";

          counts.set(
            department,
            (counts.get(
              department,
            ) || 0) + 1,
          );
        },
      );

      return Array.from(
        counts.entries(),
      )
        .map(
          ([
            label,
            value,
          ]) => ({
            label,
            value,
          }),
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.value -
            first.value,
        );
    }, [assets]);

  /*
   * =========================================================
   * TICKETS BY STATUS
   * =========================================================
   */

  const ticketsByStatus =
    useMemo<SummaryItem[]>(() => {
      const counts =
        new Map<
          string,
          number
        >();

      tickets.forEach(
        (ticket) => {
          counts.set(
            ticket.status,
            (counts.get(
              ticket.status,
            ) || 0) + 1,
          );
        },
      );

      return Array.from(
        counts.entries(),
      )
        .map(
          ([
            label,
            value,
          ]) => ({
            label,
            value,
          }),
        )
        .sort(
          (
            first,
            second,
          ) =>
            second.value -
            first.value,
        );
    }, [tickets]);

  /*
   * =========================================================
   * TICKETS BY PRIORITY
   * =========================================================
   */

  const ticketsByPriority =
    useMemo<SummaryItem[]>(() => {
      const order = [
        "Critical",
        "High",
        "Medium",
        "Low",
      ];

      const counts =
        new Map<
          string,
          number
        >();

      tickets.forEach(
        (ticket) => {
          counts.set(
            ticket.priority,
            (counts.get(
              ticket.priority,
            ) || 0) + 1,
          );
        },
      );

      return order
        .map(
          (priority) => ({
            label:
              priority,
            value:
              counts.get(
                priority,
              ) || 0,
          }),
        )
        .filter(
          (item) =>
            item.value > 0,
        );
    }, [tickets]);

  /*
   * =========================================================
   * RECENT ACTIVITY
   * =========================================================
   */

  const recentActivity =
    useMemo(() => {
      return [...activityLogs]
        .sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.timestamp,
            ).getTime() -
            new Date(
              first.timestamp,
            ).getTime(),
        )
        .slice(0, 6);
    }, [activityLogs]);

  /*
   * =========================================================
   * CSV EXPORT
   * =========================================================
   */

  function escapeCsvValue(
    value:
      | string
      | number,
  ) {
    const stringValue =
      String(
        value ?? "",
      );

    return `"${stringValue.replace(
      /"/g,
      '""',
    )}"`;
  }

  function downloadCsv(
    filename: string,
    rows: Array<
      Array<
        string | number
      >
    >,
  ) {
    const csvContent =
      rows
        .map((row) =>
          row
            .map(
              escapeCsvValue,
            )
            .join(","),
        )
        .join("\n");

    const blob =
      new Blob(
        [
          `\uFEFF${csvContent}`,
        ],
        {
          type: "text/csv;charset=utf-8;",
        },
      );

    const objectUrl =
      URL.createObjectURL(
        blob,
      );

    const downloadLink =
      document.createElement(
        "a",
      );

    downloadLink.href =
      objectUrl;

    downloadLink.download =
      filename;

    document.body.appendChild(
      downloadLink,
    );

    downloadLink.click();

    downloadLink.remove();

    URL.revokeObjectURL(
      objectUrl,
    );
  }

  function exportReportCsv() {
    const generatedAt =
      new Date().toISOString();

    const rows: Array<
      Array<
        string | number
      >
    > = [
      [
        "Enterprise IT Operations Report",
      ],
      [
        "Generated At",
        generatedAt,
      ],
      [],
      [
        "Metric",
        "Value",
      ],
      [
        "Total Assets",
        assets.length,
      ],
      [
        "Assigned Assets",
        assignedAssets,
      ],
      [
        "Available Assets",
        availableAssets,
      ],
      [
        "Maintenance Assets",
        maintenanceAssets,
      ],
      [
        "Asset Utilization Rate",
        `${assetUtilizationRate}%`,
      ],
      [
        "Total Employees",
        employees.length,
      ],
      [
        "Total Tickets",
        tickets.length,
      ],
      [
        "Open Tickets",
        openTickets,
      ],
      [
        "Resolved Tickets",
        resolvedTickets,
      ],
      [
        "Ticket Resolution Rate",
        `${ticketResolutionRate}%`,
      ],
      [
        "Active Maintenance Records",
        maintenanceRecordCount,
      ],
      [
        "Maintenance Cost",
        `${maintenanceCost} SAR`,
      ],
      [],
      [
        "Assets by Department",
      ],
      [
        "Department",
        "Assets",
      ],
      ...assetsByDepartment.map(
        (item) => [
          item.label,
          item.value,
        ],
      ),
      [],
      [
        "Tickets by Status",
      ],
      [
        "Status",
        "Tickets",
      ],
      ...ticketsByStatus.map(
        (item) => [
          item.label,
          item.value,
        ],
      ),
      [],
      [
        "Tickets by Priority",
      ],
      [
        "Priority",
        "Tickets",
      ],
      ...ticketsByPriority.map(
        (item) => [
          item.label,
          item.value,
        ],
      ),
    ];

    downloadCsv(
      "enterprise-it-report.csv",
      rows,
    );
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (
    isLoading ||
    !currentUser
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading reports...
        </p>
      </main>
    );
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12 print:bg-white print:p-0 print:text-black">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                Enterprise
                Analytics
              </p>

              <h1 className="text-4xl font-bold md:text-5xl">
                Reports
              </h1>

              <p className="mt-4 max-w-3xl text-gray-400 print:text-gray-600">
                Review enterprise IT
                performance, asset
                utilization, ticket
                resolution, and
                maintenance costs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 print:hidden">
              <button
                type="button"
                onClick={() =>
                  window.print()
                }
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                🖨 Print Report
              </button>

              <button
                type="button"
                onClick={
                  exportReportCsv
                }
                className="rounded-xl bg-zinc-800 px-6 py-3 font-semibold transition hover:bg-zinc-700"
              >
                📄 Export CSV
              </button>
            </div>
          </div>

          {/* =========================
              PRIMARY METRICS
          ========================= */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon="💻"
              title="Total Assets"
              value={assets.length.toString()}
              detail={`${assignedAssets} assigned`}
              accent="blue"
            />

            <MetricCard
              icon="👥"
              title="Employees"
              value={employees.length.toString()}
              detail="Registered employees"
              accent="purple"
            />

            <MetricCard
              icon="🎫"
              title="Open Tickets"
              value={openTickets.toString()}
              detail={`${resolvedTickets} resolved`}
              accent="red"
            />

            <MetricCard
              icon="🔧"
              title="Maintenance"
              value={maintenanceRecordCount.toString()}
              detail={`${maintenanceCost.toLocaleString(
                "en-SA",
              )} SAR total cost`}
              accent="orange"
            />
          </div>

          {/* =========================
              KPI PROGRESS
          ========================= */}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <ProgressCard
              title="Asset Utilization"
              value={
                assetUtilizationRate
              }
              detail={`${assignedAssets} of ${assets.length} assets are assigned`}
            />

            <ProgressCard
              title="Ticket Resolution"
              value={
                ticketResolutionRate
              }
              detail={`${resolvedTickets} of ${tickets.length} tickets are resolved or closed`}
            />
          </div>

          {/* =========================
              ANALYTICS ROW 1
          ========================= */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <AnalyticsPanel
              title="Assets by Department"
              description="Distribution of assets across business departments."
              items={
                assetsByDepartment
              }
              emptyMessage="No asset data available."
            />

            <AnalyticsPanel
              title="Tickets by Status"
              description="Current helpdesk workload grouped by ticket status."
              items={
                ticketsByStatus
              }
              emptyMessage="No ticket data available."
            />
          </div>

          {/* =========================
              ANALYTICS ROW 2
          ========================= */}

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <AnalyticsPanel
              title="Tickets by Priority"
              description="Ticket volume grouped by urgency level."
              items={
                ticketsByPriority
              }
              emptyMessage="No ticket priority data available."
            />

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6 print:border-gray-300 print:bg-white">
              <h2 className="text-2xl font-bold">
                Asset Status Summary
              </h2>

              <p className="mt-2 text-sm text-gray-400 print:text-gray-600">
                Current operational
                status of enterprise
                assets.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <SmallStat
                  label="Assigned"
                  value={
                    assignedAssets
                  }
                />

                <SmallStat
                  label="Available"
                  value={
                    availableAssets
                  }
                />

                <SmallStat
                  label="Maintenance"
                  value={
                    maintenanceAssets
                  }
                />
              </div>
            </section>
          </div>

          {/* =========================
              RECENT ACTIVITY
          ========================= */}

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6 print:border-gray-300 print:bg-white">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-500">
                Audit Overview
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Recent Activity
              </h2>

              <p className="mt-2 text-sm text-gray-400 print:text-gray-600">
                Latest system
                activities recorded in
                the audit log.
              </p>
            </div>

            {recentActivity.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/40 px-6 py-10 text-center text-gray-500 print:border-gray-300 print:bg-white">
                No recent activity
                available.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recentActivity.map(
                  (activity) => (
                    <article
                      key={
                        activity.id
                      }
                      className="rounded-xl border border-white/10 bg-zinc-950/60 p-5 print:border-gray-300 print:bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                          {getActivityIcon(
                            activity.action,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-semibold">
                              {
                                activity.action
                              }
                            </p>

                            <time className="text-xs text-gray-500">
                              {formatDate(
                                activity.timestamp,
                              )}
                            </time>
                          </div>

                          <p className="mt-2 break-words text-sm text-gray-400 print:text-gray-600">
                            {
                              activity.target
                            }
                          </p>

                          <p className="mt-3 text-xs text-gray-500">
                            Performed
                            by{" "}
                            <span className="font-semibold text-gray-300 print:text-gray-700">
                              {
                                activity.user
                              }
                            </span>
                          </p>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/*
 * =========================================================
 * METRIC CARD
 * =========================================================
 */

function MetricCard({
  icon,
  title,
  value,
  detail,
  accent,
}: {
  icon: string;
  title: string;
  value: string;
  detail: string;
  accent:
    | "blue"
    | "purple"
    | "red"
    | "orange";
}) {
  const styles = {
    blue:
      "border-blue-500/30 bg-blue-500/5",

    purple:
      "border-purple-500/30 bg-purple-500/5",

    red:
      "border-red-500/30 bg-red-500/5",

    orange:
      "border-orange-500/30 bg-orange-500/5",
  };

  return (
    <div
      className={`rounded-2xl border p-6 print:border-gray-300 print:bg-white ${styles[accent]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 print:text-gray-600">
            {title}
          </p>

          <p className="mt-3 text-5xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/70 text-2xl print:bg-gray-100">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        {detail}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * PROGRESS CARD
 * =========================================================
 */

function ProgressCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 print:border-gray-300 print:bg-white">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 print:text-gray-600">
            {title}
          </p>

          <p className="mt-3 text-4xl font-bold">
            {value}%
          </p>
        </div>

        <p className="max-w-xs text-right text-xs text-gray-500">
          {detail}
        </p>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-950 print:bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${Math.min(
              Math.max(
                value,
                0,
              ),
              100,
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/*
 * =========================================================
 * ANALYTICS PANEL
 * =========================================================
 */

function AnalyticsPanel({
  title,
  description,
  items,
  emptyMessage,
}: {
  title: string;
  description: string;
  items: SummaryItem[];
  emptyMessage: string;
}) {
  const maximumValue =
    Math.max(
      ...items.map(
        (item) =>
          item.value,
      ),
      1,
    );

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6 print:border-gray-300 print:bg-white">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-gray-400 print:text-gray-600">
        {description}
      </p>

      {items.length ===
      0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-zinc-950/40 px-6 py-10 text-center text-gray-500 print:border-gray-300 print:bg-white">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {items.map(
            (item) => {
              const percentage =
                (item.value /
                  maximumValue) *
                100;

              return (
                <div
                  key={
                    item.label
                  }
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-medium text-gray-300 print:text-gray-700">
                      {
                        item.label
                      }
                    </p>

                    <p className="text-sm font-bold">
                      {
                        item.value
                      }
                    </p>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-zinc-950 print:bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
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
      )}
    </section>
  );
}

/*
 * =========================================================
 * SMALL STAT
 * =========================================================
 */

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-5 print:border-gray-300 print:bg-gray-50">
      <p className="text-sm text-gray-400 print:text-gray-600">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * ACTIVITY ICON
 * =========================================================
 */

function getActivityIcon(
  action: string,
) {
  const normalizedAction =
    action.toLowerCase();

  if (
    normalizedAction.includes(
      "delete",
    )
  ) {
    return "🗑️";
  }

  if (
    normalizedAction.includes(
      "close",
    )
  ) {
    return "🔒";
  }

  if (
    normalizedAction.includes(
      "update",
    ) ||
    normalizedAction.includes(
      "edit",
    )
  ) {
    return "✏️";
  }

  if (
    normalizedAction.includes(
      "maintenance",
    )
  ) {
    return "🔧";
  }

  if (
    normalizedAction.includes(
      "create",
    ) ||
    normalizedAction.includes(
      "add",
    )
  ) {
    return "🟢";
  }

  return "📌";
}

/*
 * =========================================================
 * DATE FORMATTER
 * =========================================================
 */

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-SA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}
