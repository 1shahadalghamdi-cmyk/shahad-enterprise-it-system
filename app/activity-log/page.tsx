/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/system/Sidebar";
import {
  getActivityLogs,
  type ActivityLog,
} from "@/lib/activityLogger";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

export default function ActivityLogPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [logs, setLogs] =
    useState<ActivityLog[]>([]);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] =
    useState("All");

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

      if (
        parsedUser.role !== "IT Admin" &&
        parsedUser.role !== "IT Support"
      ) {
        router.replace("/dashboard");
        return;
      }

      setCurrentUser(parsedUser);
      setLogs(getActivityLogs());
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

  const actionOptions = useMemo(() => {
    const uniqueActions = Array.from(
      new Set(
        logs
          .map((log) => log.action.trim())
          .filter(Boolean),
      ),
    );

    return uniqueActions.sort((first, second) =>
      first.localeCompare(second),
    );
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "All" ||
        log.action === actionFilter;

      const searchableValues = [
        log.action,
        log.user,
        log.target,
        log.timestamp,
      ];

      const matchesSearch =
        !normalizedSearch ||
        searchableValues.some((value) =>
          value
            .toLowerCase()
            .includes(normalizedSearch),
        );

      return matchesAction && matchesSearch;
    });
  }, [actionFilter, logs, search]);

  function clearActivityLogs() {
    if (currentUser?.role !== "IT Admin") {
      window.alert(
        "Only the IT Admin can clear the activity log.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all activity records?",
    );

    if (!confirmed) {
      return;
    }

    window.localStorage.removeItem("activityLogs");
    setLogs([]);
  }

  function formatDate(timestamp: string) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return new Intl.DateTimeFormat("en-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function getBadgeStyles(action: string) {
    const normalizedAction =
      action.toLowerCase();

    if (
      normalizedAction.includes("delete") ||
      normalizedAction.includes("remove")
    ) {
      return "bg-red-500/10 text-red-400";
    }

    if (
      normalizedAction.includes("create") ||
      normalizedAction.includes("add")
    ) {
      return "bg-green-500/10 text-green-400";
    }

    if (
      normalizedAction.includes("assign") ||
      normalizedAction.includes("status")
    ) {
      return "bg-yellow-500/10 text-yellow-400";
    }

    if (
      normalizedAction.includes("update") ||
      normalizedAction.includes("edit") ||
      normalizedAction.includes("change")
    ) {
      return "bg-blue-500/10 text-blue-400";
    }

    return "bg-purple-500/10 text-purple-400";
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading activity log...
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-purple-500">
                Enterprise Governance
              </p>

              <h1 className="text-4xl font-bold md:text-5xl">
                Activity Log
              </h1>

              <p className="mt-4 max-w-2xl text-gray-400">
                Review system actions, responsible users,
                affected records, and timestamps.
              </p>
            </div>

            {currentUser.role === "IT Admin" && (
              <button
                type="button"
                onClick={clearActivityLogs}
                className="rounded-xl border border-red-500/40 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
              >
                Clear Log
              </button>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Activities"
              value={logs.length.toString()}
            />

            <StatCard
              title="Visible Results"
              value={filteredLogs.length.toString()}
            />

            <StatCard
              title="Action Types"
              value={actionOptions.length.toString()}
            />
          </div>

          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search user, action, or target..."
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
              />

              <select
                value={actionFilter}
                onChange={(event) =>
                  setActionFilter(event.target.value)
                }
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-purple-500"
              >
                <option value="All">
                  All Actions
                </option>

                {actionOptions.map((action) => (
                  <option
                    key={action}
                    value={action}
                  >
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/40 px-6 py-14 text-center">
                <p className="text-lg font-medium text-gray-300">
                  No activity records found.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  New system actions will appear here
                  after the logger is connected to assets,
                  tickets, and employees.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <article
                    key={log.id}
                    className="rounded-xl border border-white/10 bg-zinc-950/60 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getBadgeStyles(
                              log.action,
                            )}`}
                          >
                            {log.action}
                          </span>

                          <span className="text-sm text-gray-500">
                            {log.target}
                          </span>
                        </div>

                        <p className="mt-4 text-sm text-gray-400">
                          Performed by{" "}
                          <span className="font-semibold text-white">
                            {log.user}
                          </span>
                        </p>
                      </div>

                      <time className="shrink-0 text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </time>
                    </div>
                  </article>
                ))}
              </div>
            )}
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
