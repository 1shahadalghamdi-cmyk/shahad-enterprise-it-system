"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import Sidebar from "@/app/components/system/Sidebar";

type IncidentPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

type IncidentStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting for User"
  | "Resolved"
  | "Closed";

type Incident = {
  id: string;
  title: string;
  employee: string;
  category: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  assignedTo: string;
  sla: string;
  createdAt: string;
};

const incidents: Incident[] = [
  {
    id: "INC-1025",
    title: "Core switch is unreachable",
    employee: "Ahmed AlHarbi",
    category: "Network",
    priority: "Critical",
    status: "Open",
    assignedTo: "Sarah Hassan",
    sla: "45 min remaining",
    createdAt: "Aug 3, 2026, 3:40 PM",
  },
  {
    id: "INC-1024",
    title: "VPN connection keeps disconnecting",
    employee: "Noor Ali",
    category: "Access",
    priority: "High",
    status: "In Progress",
    assignedTo: "Mohammed Saleh",
    sla: "3h 20m remaining",
    createdAt: "Aug 3, 2026, 2:15 PM",
  },
  {
    id: "INC-1023",
    title: "Cisco phone handset has no audio",
    employee: "Ahmed AlHarbi",
    category: "Hardware",
    priority: "Medium",
    status: "Assigned",
    assignedTo: "Ali Nasser",
    sla: "8h 10m remaining",
    createdAt: "Aug 3, 2026, 1:05 PM",
  },
  {
    id: "INC-1022",
    title: "Microsoft 365 account is locked",
    employee: "Reem Abdullah",
    category: "Microsoft 365",
    priority: "High",
    status: "Waiting for User",
    assignedTo: "Yousef Omar",
    sla: "Breached",
    createdAt: "Aug 3, 2026, 11:20 AM",
  },
  {
    id: "INC-1021",
    title: "Printer is not available on the network",
    employee: "Fahad AlQahtani",
    category: "Printing",
    priority: "Low",
    status: "Resolved",
    assignedTo: "Sarah Hassan",
    sla: "Completed",
    createdAt: "Aug 2, 2026, 4:30 PM",
  },
  {
    id: "INC-1020",
    title: "Laptop fails to boot into Windows",
    employee: "Mona AlOtaibi",
    category: "Hardware",
    priority: "Medium",
    status: "Closed",
    assignedTo: "Mohammed Saleh",
    sla: "Completed",
    createdAt: "Aug 2, 2026, 1:10 PM",
  },
];

export default function IncidentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | IncidentStatus>("All");
  const [priorityFilter, setPriorityFilter] =
    useState<"All" | IncidentPriority>("All");

  const filteredIncidents = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim();

    return incidents.filter((incident) => {
      const matchesSearch =
        normalizedSearch === "" ||
        incident.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        incident.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        incident.employee
          .toLowerCase()
          .includes(normalizedSearch) ||
        incident.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        incident.assignedTo
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        incident.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        incident.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    priorityFilter,
    searchTerm,
    statusFilter,
  ]);

  const openCount = incidents.filter(
    (incident) =>
      incident.status !== "Resolved" &&
      incident.status !== "Closed",
  ).length;

  const criticalCount = incidents.filter(
    (incident) =>
      incident.priority === "Critical",
  ).length;

  const breachedCount = incidents.filter(
    (incident) => incident.sla === "Breached",
  ).length;

  const resolvedCount = incidents.filter(
    (incident) =>
      incident.status === "Resolved" ||
      incident.status === "Closed",
  ).length;

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              ITIL Incident Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Incidents
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Review, prioritize, assign, and resolve
              enterprise IT incidents within agreed SLA
              targets.
            </p>
          </div>

          <Link
            href="/helpdesk/incidents/new"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            + New Incident
          </Link>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Open Incidents"
            value={openCount}
            description="Pending resolution"
            valueClassName="text-blue-400"
          />

          <MetricCard
            label="Critical"
            value={criticalCount}
            description="Immediate attention"
            valueClassName="text-red-500"
          />

          <MetricCard
            label="SLA Breached"
            value={breachedCount}
            description="Outside target"
            valueClassName="text-orange-400"
          />

          <MetricCard
            label="Resolved"
            value={resolvedCount}
            description="Resolved or closed"
            valueClassName="text-green-400"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Incident Queue
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Search and filter the active helpdesk
                  workload.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search incidents..."
                  className="min-w-[230px] rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-blue-500"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "All"
                        | IncidentStatus,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Statuses
                  </option>
                  <option value="Open">Open</option>
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
                      event.target.value as
                        | "All"
                        | IncidentPriority,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Priorities
                  </option>
                  <option value="Critical">
                    Critical
                  </option>
                  <option value="High">High</option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">
                    Incident
                  </th>
                  <th className="px-4 py-4">
                    Title
                  </th>
                  <th className="px-4 py-4">
                    Employee
                  </th>
                  <th className="px-4 py-4">
                    Category
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
                    SLA
                  </th>
                  <th className="px-4 py-4">
                    Created
                  </th>
                  <th className="px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredIncidents.map(
                  (incident) => (
                    <tr
                      key={incident.id}
                      className="transition hover:bg-zinc-800/40"
                    >
                      <td className="px-6 py-5 font-semibold text-blue-400">
                        {incident.id}
                      </td>

                      <td className="max-w-[260px] px-4 py-5">
                        <p className="truncate font-medium">
                          {incident.title}
                        </p>
                      </td>

                      <td className="px-4 py-5 text-gray-300">
                        {incident.employee}
                      </td>

                      <td className="px-4 py-5 text-gray-400">
                        {incident.category}
                      </td>

                      <td className="px-4 py-5">
                        <PriorityBadge
                          priority={
                            incident.priority
                          }
                        />
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge
                          status={incident.status}
                        />
                      </td>

                      <td className="px-4 py-5 text-gray-300">
                        {incident.assignedTo}
                      </td>

                      <td className="px-4 py-5">
                        <span
                          className={
                            incident.sla ===
                            "Breached"
                              ? "font-semibold text-red-400"
                              : incident.sla ===
                                  "Completed"
                                ? "text-green-400"
                                : "text-orange-300"
                          }
                        >
                          {incident.sla}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-sm text-gray-500">
                        {incident.createdAt}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <Link
                            href={`/helpdesk/incidents/${incident.id}`}
                            className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                          >
                            View
                          </Link>

                          <Link
                            href={`/helpdesk/incidents/${incident.id}/edit`}
                            className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-400 transition hover:bg-yellow-500/10"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ),
                )}

                {filteredIncidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-lg font-medium text-gray-300">
                        No incidents found
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
              Showing {filteredIncidents.length} of{" "}
              {incidents.length} incidents
            </p>

            <p>
              Sorted by latest activity
            </p>
          </div>
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

function PriorityBadge({
  priority,
}: {
  priority: IncidentPriority;
}) {
  const classes: Record<
    IncidentPriority,
    string
  > = {
    Critical:
      "border-red-500/30 bg-red-500/10 text-red-400",
    High: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Medium:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    Low: "border-green-500/30 bg-green-500/10 text-green-400",
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
  status: IncidentStatus;
}) {
  const classes: Record<
    IncidentStatus,
    string
  > = {
    Open:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Assigned:
      "border-purple-500/30 bg-purple-500/10 text-purple-400",
    "In Progress":
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    "Waiting for User":
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    Resolved:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Closed:
      "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}