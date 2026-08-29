/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/system/Sidebar";

import { useEnterpriseData } from "@/hooks/useEnterpriseData";
import type { Ticket } from "@/types/ticket";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

export default function TicketsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const { tickets, isLoading } =
    useEnterpriseData();

  useEffect(() => {
    const savedUser =
      window.localStorage.getItem("currentUser");

    if (!savedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(savedUser) as CurrentUser;

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
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

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

  const filteredTickets = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return visibleTickets.filter((ticket) => {
      const searchableValues = [
        ticket.id,
        ticket.title,
        ticket.employeeName,
        ticket.assetId,
        ticket.priority,
        ticket.status,
        ticket.assignedTo,
      ];

      const matchesSearch =
        searchableValues.some((value) =>
          value
            .toLowerCase()
            .includes(searchValue),
        );

      const matchesStatus =
        statusFilter === "All" ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        ticket.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    priorityFilter,
    search,
    statusFilter,
    visibleTickets,
  ]);

  const openCount = useMemo(
    () =>
      visibleTickets.filter(
        (ticket) =>
          ticket.status === "Open" ||
          ticket.status === "Assigned" ||
          ticket.status === "In Progress" ||
          ticket.status === "Waiting for User",
      ).length,
    [visibleTickets],
  );

  const criticalCount = useMemo(
    () =>
      visibleTickets.filter(
        (ticket) =>
          ticket.priority === "Critical",
      ).length,
    [visibleTickets],
  );

  const resolvedCount = useMemo(
    () =>
      visibleTickets.filter(
        (ticket) =>
          ticket.status === "Resolved" ||
          ticket.status === "Closed",
      ).length,
    [visibleTickets],
  );

  function formatDate(dateValue: string) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  if (isLoading || !currentUser) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-gray-400">
            Loading tickets...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                IT Helpdesk
              </p>

              <h1 className="text-4xl font-bold md:text-5xl">
                {currentUser.role === "Employee"
                  ? "My Tickets"
                  : "Support Tickets"}
              </h1>

              <p className="mt-4 max-w-2xl text-gray-400">
                {currentUser.role === "Employee"
                  ? "Track your own technical incidents and resolution progress."
                  : "Track technical incidents, assigned assets, employee requests, priorities and resolution progress."}
              </p>
            </div>

            <Link
              href="/tickets/new"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              + New Ticket
            </Link>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={
                currentUser.role === "Employee"
                  ? "My Tickets"
                  : "Total Tickets"
              }
              value={visibleTickets.length.toString()}
            />

            <StatCard
              title="Active Tickets"
              value={openCount.toString()}
            />

            <StatCard
              title="Critical"
              value={criticalCount.toString()}
            />

            <StatCard
              title="Resolved"
              value={resolvedCount.toString()}
            />
          </div>

          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                {currentUser.role === "Employee"
                  ? "My Ticket Queue"
                  : "Ticket Queue"}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Search and filter helpdesk incidents.
              </p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tickets..."
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="All">
                  All Statuses
                </option>
                <option value="Open">
                  Open
                </option>
                <option value="Assigned">
                  Assigned
                </option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Waiting for User">
                  Waiting for User
                </option>
                <option value="Resolved">
                  Resolved
                </option>
                <option value="Closed">
                  Closed
                </option>
              </select>

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value,
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="All">
                  All Priorities
                </option>
                <option value="Low">
                  Low
                </option>
                <option value="Medium">
                  Medium
                </option>
                <option value="High">
                  High
                </option>
                <option value="Critical">
                  Critical
                </option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-sm uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-4">
                      Ticket ID
                    </th>
                    <th className="px-4 py-4">
                      Issue
                    </th>
                    <th className="px-4 py-4">
                      Employee
                    </th>
                    <th className="px-4 py-4">
                      Asset
                    </th>
                    <th className="px-4 py-4">
                      Priority
                    </th>
                    <th className="px-4 py-4">
                      Status
                    </th>
                    <th className="px-4 py-4">
                      Assigned To
                    </th>
                    <th className="px-4 py-4">
                      Created
                    </th>
                    <th className="px-4 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map(
                    (ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-white/5 text-sm transition hover:bg-white/5"
                      >
                        <td className="px-4 py-5 font-semibold text-blue-400">
                          {ticket.id}
                        </td>

                        <td className="max-w-[250px] px-4 py-5 font-medium">
                          {ticket.title}
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {ticket.employeeName}
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {ticket.assetId ||
                            "No asset"}
                        </td>

                        <td className="px-4 py-5">
                          <PriorityBadge
                            priority={ticket.priority}
                          />
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={ticket.status}
                          />
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {ticket.assignedTo}
                        </td>

                        <td className="px-4 py-5 text-gray-500">
                          {formatDate(
                            ticket.createdAt,
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="rounded-lg border border-white/10 px-4 py-2 transition hover:border-blue-500 hover:text-blue-400"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>

              {filteredTickets.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  {currentUser.role === "Employee"
                    ? "No tickets were found for your account."
                    : "No tickets found."}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Ticket["priority"];
}) {
  const styles: Record<
    Ticket["priority"],
    string
  > = {
    Low: "bg-green-500/10 text-green-400",
    Medium:
      "bg-yellow-500/10 text-yellow-400",
    High: "bg-orange-500/10 text-orange-400",
    Critical: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: Ticket["status"];
}) {
  const styles: Record<
    Ticket["status"],
    string
  > = {
    Open: "bg-blue-500/10 text-blue-400",
    Assigned:
      "bg-purple-500/10 text-purple-400",
    "In Progress":
      "bg-yellow-500/10 text-yellow-400",
    "Waiting for User":
      "bg-orange-500/10 text-orange-400",
    Resolved:
      "bg-green-500/10 text-green-400",
    Closed: "bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
