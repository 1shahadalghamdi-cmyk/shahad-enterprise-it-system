/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useMemo, useState } from "react";
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

type SummaryItem = {
  label: string;
  value: number;
};

type ActivityLog = {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [activityLogs, setActivityLogs] =
    useState<ActivityLog[]>([]);

  const {
    assets,
    tickets,
    employees,
    isLoading,
  } = useEnterpriseData();

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(savedCurrentUser) as CurrentUser;

      const validRoles: UserRole[] = [
        "IT Admin",
        "IT Support",
        "Employee",
      ];

      if (!validRoles.includes(parsedUser.role)) {
        window.localStorage.removeItem("currentUser");
        router.replace("/login");
        return;
      }

      setCurrentUser(parsedUser);

      const savedActivityLogs = JSON.parse(
        window.localStorage.getItem("activityLogs") || "[]",
      ) as ActivityLog[];

      setActivityLogs(savedActivityLogs);
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

  const currentEmployee = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    const normalizedName =
      currentUser.name.toLowerCase().trim();

    const normalizedEmail =
      currentUser.email.toLowerCase().trim();

    return (
      employees.find((employee) => {
        const employeeName =
          employee.name.toLowerCase().trim();

        const employeeEmail =
          employee.email.toLowerCase().trim();

        return (
          employeeName === normalizedName ||
          employeeEmail === normalizedEmail
        );
      }) ?? null
    );
  }, [currentUser, employees]);

  const visibleAssets = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (
      currentUser.role === "IT Admin" ||
      currentUser.role === "IT Support"
    ) {
      return assets;
    }

    const normalizedUserName =
      currentUser.name.toLowerCase().trim();

    const normalizedEmployeeId =
      currentEmployee?.id.toLowerCase().trim() || "";

    return assets.filter((asset) => {
      const normalizedAssignedTo =
        asset.assignedTo.toLowerCase().trim();

      return (
        normalizedAssignedTo === normalizedUserName ||
        (normalizedEmployeeId !== "" &&
          normalizedAssignedTo === normalizedEmployeeId)
      );
    });
  }, [assets, currentEmployee, currentUser]);

  const visibleTickets = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (
      currentUser.role === "IT Admin" ||
      currentUser.role === "IT Support"
    ) {
      return tickets;
    }

    const normalizedUserName =
      currentUser.name.toLowerCase().trim();

    return tickets.filter(
      (ticket) =>
        ticket.employeeName
          .toLowerCase()
          .trim() === normalizedUserName,
    );
  }, [currentUser, tickets]);

  const assignedCount = useMemo(
    () =>
      visibleAssets.filter(
        (asset) => asset.status === "Assigned",
      ).length,
    [visibleAssets],
  );

  const availableCount = useMemo(
    () =>
      visibleAssets.filter(
        (asset) =>
          asset.status === "Available" ||
          asset.status === "Active",
      ).length,
    [visibleAssets],
  );

  const maintenanceCount = useMemo(
    () =>
      visibleAssets.filter(
        (asset) => asset.status === "Maintenance",
      ).length,
    [visibleAssets],
  );

  const openTicketCount = useMemo(
    () =>
      visibleTickets.filter(
        (ticket) =>
          ticket.status !== "Resolved" &&
          ticket.status !== "Closed",
      ).length,
    [visibleTickets],
  );

  const resolvedTicketCount = useMemo(
    () =>
      visibleTickets.filter(
        (ticket) =>
          ticket.status === "Resolved" ||
          ticket.status === "Closed",
      ).length,
    [visibleTickets],
  );

  const assetDepartmentSummary =
    useMemo<SummaryItem[]>(() => {
      const counts = new Map<string, number>();

      visibleAssets.forEach((asset) => {
        const department =
          asset.department.trim() || "Unassigned";

        counts.set(
          department,
          (counts.get(department) || 0) + 1,
        );
      });

      return Array.from(counts.entries())
        .map(([label, value]) => ({
          label,
          value,
        }))
        .sort(
          (first, second) =>
            second.value - first.value,
        );
    }, [visibleAssets]);

  const ticketStatusSummary =
    useMemo<SummaryItem[]>(() => {
      const statusOrder = [
        "Open",
        "Assigned",
        "In Progress",
        "Waiting for User",
        "Resolved",
        "Closed",
      ];

      const counts = new Map<string, number>();

      visibleTickets.forEach((ticket) => {
        counts.set(
          ticket.status,
          (counts.get(ticket.status) || 0) + 1,
        );
      });

      return statusOrder
        .map((status) => ({
          label: status,
          value: counts.get(status) || 0,
        }))
        .filter((item) => item.value > 0);
    }, [visibleTickets]);

  const recentActivity = useMemo(
    () => activityLogs.slice(0, 6),
    [activityLogs],
  );

  if (isLoading || !currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading dashboard...
        </p>
      </main>
    );
  }

  const isEmployee =
    currentUser.role === "Employee";

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
              {isEmployee
                ? "Employee Dashboard"
                : "Enterprise Dashboard"}
            </p>

            <p className="mb-2 text-sm text-gray-500">
              Welcome back,
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              {currentUser.name}
            </h1>

            <p className="mt-2 text-sm font-semibold text-blue-400">
              {currentUser.role}
            </p>

            <p className="mt-4 max-w-3xl text-gray-400">
              {isEmployee
                ? "Review your assigned assets and support ticket activity."
                : "Monitor company assets, employee coverage, and IT helpdesk performance."}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Card
              icon="💻"
              title={
                isEmployee
                  ? "My Assets"
                  : "Total Assets"
              }
              value={visibleAssets.length.toString()}
              detail="Tracked devices"
              accent="blue"
            />

            <Card
              icon="📦"
              title="Assigned"
              value={assignedCount.toString()}
              detail="Currently in use"
              accent="purple"
            />

            <Card
              icon="🎫"
              title="Available"
              value={availableCount.toString()}
              detail="Ready for assignment"
              accent="green"
            />

            <Card
              icon="🔧"
              title="Maintenance"
              value={maintenanceCount.toString()}
              detail="Needs attention"
              accent="orange"
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Card
              icon="🎫"
              title={
                isEmployee
                  ? "My Tickets"
                  : "Total Tickets"
              }
              value={visibleTickets.length.toString()}
              detail="Helpdesk records"
              accent="blue"
            />

            <Card
              icon="🚨"
              title="Open Tickets"
              value={openTicketCount.toString()}
              detail="Pending resolution"
              accent="red"
            />

            <Card
              icon="🟢"
              title="Resolved Tickets"
              value={resolvedTicketCount.toString()}
              detail="Resolved or closed"
              accent="green"
            />

            {!isEmployee && (
              <Card
                icon="👥"
                title="Employees"
                value={employees.length.toString()}
                detail="Registered users"
                accent="purple"
              />
            )}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <AnalyticsPanel
              title={
                isEmployee
                  ? "My Assets by Department"
                  : "Assets by Department"
              }
              description="Distribution of visible assets across departments."
              items={assetDepartmentSummary}
              emptyMessage="No asset data available."
            />

            <AnalyticsPanel
              title={
                isEmployee
                  ? "My Tickets by Status"
                  : "Tickets by Status"
              }
              description="Current helpdesk workload by ticket status."
              items={ticketStatusSummary}
              emptyMessage="No ticket data available."
            />
          </div>

          {!isEmployee && (
            <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-500">
                  Live System Activity
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Recent Activity
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  The latest asset and helpdesk actions recorded by the system.
                </p>
              </div>

              {recentActivity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/40 px-6 py-10 text-center text-gray-500">
                  No recent activity found.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recentActivity.map((activity) => (
                    <article
                      key={activity.id}
                      className="rounded-xl border border-white/10 bg-zinc-950/60 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                          {getActivityIcon(activity.action)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-semibold text-white">
                              {activity.action}
                            </p>

                            <time className="text-xs text-gray-500">
                              {formatActivityDate(
                                activity.timestamp,
                              )}
                            </time>
                          </div>

                          <p className="mt-2 break-words text-sm text-gray-400">
                            {activity.target}
                          </p>

                          <p className="mt-3 text-xs text-gray-500">
                            Performed by{" "}
                            <span className="font-semibold text-gray-300">
                              {activity.user}
                            </span>
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Card({
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
    | "green"
    | "orange"
    | "red"
    | "purple";
}) {
  const accentStyles = {
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    green:
      "border-green-500/30 bg-green-500/5 text-green-400",
    orange:
      "border-orange-500/30 bg-orange-500/5 text-orange-400",
    red: "border-red-500/30 bg-red-500/5 text-red-400",
    purple:
      "border-purple-500/30 bg-purple-500/5 text-purple-400",
  };

  return (
    <div
      className={`rounded-2xl border p-6 ${accentStyles[accent]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-3 text-6xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/70 text-2xl">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        {detail}
      </p>
    </div>
  );
}

function getActivityIcon(action: string) {
  const normalizedAction = action.toLowerCase();

  if (normalizedAction.includes("delete")) {
    return "🗑️";
  }

  if (normalizedAction.includes("close")) {
    return "🔒";
  }

  if (
    normalizedAction.includes("update") ||
    normalizedAction.includes("edit")
  ) {
    return "✏️";
  }

  if (
    normalizedAction.includes("create") ||
    normalizedAction.includes("add")
  ) {
    return "🟢";
  }

  if (normalizedAction.includes("asset")) {
    return "💻";
  }

  if (normalizedAction.includes("ticket")) {
    return "🎫";
  }

  if (normalizedAction.includes("employee")) {
    return "👤";
  }

  return "📌";
}

function formatActivityDate(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

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
  const maximumValue = Math.max(
    ...items.map((item) => item.value),
    1,
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        {description}
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-zinc-950/40 px-6 py-10 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {items.map((item) => {
            const widthPercentage =
              (item.value / maximumValue) * 100;

            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="truncate text-sm font-medium text-gray-300">
                    {item.label}
                  </p>

                  <p className="text-sm font-bold">
                    {item.value}
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-zinc-950">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${widthPercentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}