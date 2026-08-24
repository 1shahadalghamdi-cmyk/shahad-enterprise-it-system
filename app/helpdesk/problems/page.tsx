"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import Sidebar from "@/app/components/system/Sidebar";

type ProblemStatus =
  | "Investigation"
  | "Root Cause Found"
  | "Known Error"
  | "Resolved";

type ProblemPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

type ProblemRecord = {
  id: string;
  title: string;
  category: string;
  rootCause: string;
  priority: ProblemPriority;
  status: ProblemStatus;
  linkedIncidents: number;
  owner: string;
  updatedAt: string;
};

const problems: ProblemRecord[] = [
  {
    id: "PRB-1001",
    title: "Frequent VPN disconnections",
    category: "Network",
    rootCause: "Firewall session timeout",
    priority: "High",
    status: "Investigation",
    linkedIncidents: 8,
    owner: "Sarah Hassan",
    updatedAt: "Aug 3, 2026",
  },
  {
    id: "PRB-1002",
    title: "Microsoft 365 login failures",
    category: "Microsoft 365",
    rootCause: "Directory synchronization delay",
    priority: "Critical",
    status: "Known Error",
    linkedIncidents: 13,
    owner: "Mohammed Saleh",
    updatedAt: "Aug 3, 2026",
  },
  {
    id: "PRB-1003",
    title: "Network printers repeatedly offline",
    category: "Hardware",
    rootCause: "Outdated universal print driver",
    priority: "Medium",
    status: "Resolved",
    linkedIncidents: 4,
    owner: "Ali Nasser",
    updatedAt: "Aug 2, 2026",
  },
  {
    id: "PRB-1004",
    title: "ERP system response is slow",
    category: "Infrastructure",
    rootCause: "SQL query performance under review",
    priority: "High",
    status: "Investigation",
    linkedIncidents: 11,
    owner: "Yousef Omar",
    updatedAt: "Aug 2, 2026",
  },
  {
    id: "PRB-1005",
    title: "Warehouse Wi-Fi instability",
    category: "Network",
    rootCause: "Overloaded access point",
    priority: "High",
    status: "Root Cause Found",
    linkedIncidents: 6,
    owner: "Sarah Hassan",
    updatedAt: "Aug 1, 2026",
  },
  {
    id: "PRB-1006",
    title: "Recurring laptop battery swelling",
    category: "Hardware",
    rootCause: "Affected device batch",
    priority: "Critical",
    status: "Known Error",
    linkedIncidents: 5,
    owner: "Ali Nasser",
    updatedAt: "Jul 31, 2026",
  },
];

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | ProblemStatus>("All");
  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          problems.map(
            (problem) => problem.category,
          ),
        ),
      ).sort(),
    [],
  );

  const filteredProblems = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim();

    return problems.filter((problem) => {
      const matchesSearch =
        normalizedSearch === "" ||
        problem.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        problem.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        problem.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        problem.rootCause
          .toLowerCase()
          .includes(normalizedSearch) ||
        problem.owner
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        problem.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        problem.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    categoryFilter,
    searchTerm,
    statusFilter,
  ]);

  const openProblems = problems.filter(
    (problem) =>
      problem.status !== "Resolved",
  ).length;

  const knownErrors = problems.filter(
    (problem) =>
      problem.status === "Known Error",
  ).length;

  const rootCausePending = problems.filter(
    (problem) =>
      problem.status === "Investigation",
  ).length;

  const resolvedProblems = problems.filter(
    (problem) =>
      problem.status === "Resolved",
  ).length;

  const totalLinkedIncidents =
    problems.reduce(
      (total, problem) =>
        total + problem.linkedIncidents,
      0,
    );

  const analyzedProblems = problems.filter(
    (problem) =>
      problem.status !== "Investigation",
  ).length;

  const rootCauseRate = Math.round(
    (analyzedProblems / problems.length) *
      100,
  );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              ITIL Problem Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Problem Management
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Identify recurring incidents, perform
              root cause analysis, document known
              errors, and prevent future service
              disruption.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            + New Problem
          </button>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Open Problems"
            value={openProblems}
            description="Pending resolution"
            valueClassName="text-blue-400"
          />

          <MetricCard
            label="Known Errors"
            value={knownErrors}
            description="Reusable workarounds"
            valueClassName="text-purple-400"
          />

          <MetricCard
            label="Root Cause Pending"
            value={rootCausePending}
            description="Under investigation"
            valueClassName="text-orange-400"
          />

          <MetricCard
            label="Resolved"
            value={resolvedProblems}
            description="Permanent fix completed"
            valueClassName="text-green-400"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Problem Records
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Track root causes, owners, known
                  errors, and recurring incident impact.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Search problems..."
                  className="min-w-[220px] rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-blue-500"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "All"
                        | ProblemStatus,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Statuses
                  </option>
                  <option value="Investigation">
                    Investigation
                  </option>
                  <option value="Root Cause Found">
                    Root Cause Found
                  </option>
                  <option value="Known Error">
                    Known Error
                  </option>
                  <option value="Resolved">
                    Resolved
                  </option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">
                    Problem
                  </th>
                  <th className="px-4 py-4">
                    Title
                  </th>
                  <th className="px-4 py-4">
                    Category
                  </th>
                  <th className="px-4 py-4">
                    Root Cause
                  </th>
                  <th className="px-4 py-4">
                    Priority
                  </th>
                  <th className="px-4 py-4">
                    Status
                  </th>
                  <th className="px-4 py-4">
                    Linked Incidents
                  </th>
                  <th className="px-4 py-4">
                    Owner
                  </th>
                  <th className="px-4 py-4">
                    Updated
                  </th>
                  <th className="px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredProblems.map(
                  (problem) => (
                    <tr
                      key={problem.id}
                      className="transition hover:bg-zinc-800/40"
                    >
                      <td className="px-6 py-5 font-semibold text-blue-400">
                        {problem.id}
                      </td>

                      <td className="max-w-[260px] px-4 py-5">
                        <p className="truncate font-medium">
                          {problem.title}
                        </p>
                      </td>

                      <td className="px-4 py-5 text-gray-300">
                        {problem.category}
                      </td>

                      <td className="max-w-[280px] px-4 py-5 text-gray-400">
                        <p className="truncate">
                          {problem.rootCause}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <PriorityBadge
                          priority={
                            problem.priority
                          }
                        />
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge
                          status={problem.status}
                        />
                      </td>

                      <td className="px-4 py-5">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-bold text-blue-400">
                          {
                            problem.linkedIncidents
                          }
                        </span>
                      </td>

                      <td className="px-4 py-5 text-gray-300">
                        {problem.owner}
                      </td>

                      <td className="px-4 py-5 text-sm text-gray-500">
                        {problem.updatedAt}
                      </td>

                      <td className="px-6 py-5">
                        <Link
                          href={`/helpdesk/problems/${problem.id}`}
                          className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ),
                )}

                {filteredProblems.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-lg font-medium text-gray-300">
                        No problems found
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Try changing the search term or
                        filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {filteredProblems.length} of{" "}
              {problems.length} problems
            </p>

            <p>
              Root cause records ordered by latest
              update
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <InsightCard
            eyebrow="Known Errors"
            value={knownErrors.toString()}
            description="Documented errors with reusable workarounds."
            valueClassName="text-purple-400"
          />

          <InsightCard
            eyebrow="Root Cause Analysis"
            value={`${rootCauseRate}%`}
            description="Problem records with an identified or resolved root cause."
            valueClassName="text-orange-300"
          />

          <InsightCard
            eyebrow="Linked Incidents"
            value={totalLinkedIncidents.toString()}
            description="Recurring incidents grouped under problem records."
            valueClassName="text-green-400"
          />
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  description,
  valueClassName,
}: {
  label: string;
  value: number;
  description: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p
        className={`mt-4 text-4xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-600">
        {description}
      </p>
    </div>
  );
}

function InsightCard({
  eyebrow,
  value,
  description,
  valueClassName,
}: {
  eyebrow: string;
  value: string;
  description: string;
  valueClassName: string;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
        {eyebrow}
      </p>

      <p
        className={`mt-4 text-5xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-4 leading-7 text-gray-400">
        {description}
      </p>
    </section>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: ProblemPriority;
}) {
  const classes: Record<
    ProblemPriority,
    string
  > = {
    Critical:
      "border-red-500/30 bg-red-500/10 text-red-400",
    High:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Medium:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    Low:
      "border-green-500/30 bg-green-500/10 text-green-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: ProblemStatus;
}) {
  const classes: Record<
    ProblemStatus,
    string
  > = {
    Investigation:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    "Root Cause Found":
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    "Known Error":
      "border-purple-500/30 bg-purple-500/10 text-purple-400",
    Resolved:
      "border-green-500/30 bg-green-500/10 text-green-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}