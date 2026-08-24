/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

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

type HelpdeskIncident = {
  id: string;
  title: string;
  employeeName: string;
  department: string;
  category: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  assignedTo: string;
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "helpdeskIncidents";

const fallbackIncidents: HelpdeskIncident[] = [
  {
    id: "INC-1025",
    title: "Core switch is unreachable",
    employeeName: "Ahmed AlHarbi",
    department: "Information Technology",
    category: "Network",
    priority: "Critical",
    status: "Open",
    assignedTo: "Sarah Hassan",
    slaDueAt: new Date(
      Date.now() + 45 * 60 * 1000,
    ).toISOString(),
    createdAt: "2026-08-03T12:40:00.000Z",
    updatedAt: "2026-08-03T12:55:00.000Z",
  },
  {
    id: "INC-1024",
    title: "VPN connection keeps disconnecting",
    employeeName: "Noor Ali",
    department: "Finance",
    category: "Access",
    priority: "High",
    status: "In Progress",
    assignedTo: "Mohammed Saleh",
    slaDueAt: new Date(
      Date.now() + 3.3 * 60 * 60 * 1000,
    ).toISOString(),
    createdAt: "2026-08-03T11:15:00.000Z",
    updatedAt: "2026-08-03T11:45:00.000Z",
  },
  {
    id: "INC-1023",
    title: "Cisco phone handset has no audio",
    employeeName: "Ahmed AlHarbi",
    department: "Information Technology",
    category: "Hardware",
    priority: "Medium",
    status: "Assigned",
    assignedTo: "Ali Nasser",
    slaDueAt: new Date(
      Date.now() + 8 * 60 * 60 * 1000,
    ).toISOString(),
    createdAt: "2026-08-03T10:05:00.000Z",
    updatedAt: "2026-08-03T10:05:00.000Z",
  },
  {
    id: "INC-1022",
    title: "Microsoft 365 account is locked",
    employeeName: "Reem Abdullah",
    department: "Human Resources",
    category: "Microsoft 365",
    priority: "High",
    status: "Waiting for User",
    assignedTo: "Yousef Omar",
    slaDueAt: "2026-08-03T11:00:00.000Z",
    createdAt: "2026-08-03T08:20:00.000Z",
    updatedAt: "2026-08-03T09:00:00.000Z",
  },
  {
    id: "INC-1021",
    title: "Printer is not available on the network",
    employeeName: "Fahad AlQahtani",
    department: "Administration",
    category: "Hardware",
    priority: "Low",
    status: "Resolved",
    assignedTo: "Sarah Hassan",
    slaDueAt: "2026-08-05T13:30:00.000Z",
    createdAt: "2026-08-02T13:30:00.000Z",
    updatedAt: "2026-08-02T14:10:00.000Z",
  },
  {
    id: "INC-1020",
    title: "Laptop fails to boot into Windows",
    employeeName: "Mona AlOtaibi",
    department: "Operations",
    category: "Hardware",
    priority: "Medium",
    status: "Closed",
    assignedTo: "Mohammed Saleh",
    slaDueAt: "2026-08-03T10:10:00.000Z",
    createdAt: "2026-08-02T10:10:00.000Z",
    updatedAt: "2026-08-02T12:00:00.000Z",
  },
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function loadIncidents() {
  const savedIncidents =
    window.localStorage.getItem(STORAGE_KEY);

  if (!savedIncidents) {
    return fallbackIncidents;
  }

  try {
    const parsedIncidents =
      JSON.parse(savedIncidents) as HelpdeskIncident[];

    return Array.isArray(parsedIncidents)
      ? parsedIncidents
      : fallbackIncidents;
  } catch {
    return fallbackIncidents;
  }
}

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

function getSlaState(
  incident: HelpdeskIncident,
) {
  if (
    incident.status === "Resolved" ||
    incident.status === "Closed"
  ) {
    return {
      label: "Completed",
      className: "text-green-400",
      breached: false,
    };
  }

  const dueDate = new Date(
    incident.slaDueAt,
  );

  const remainingMilliseconds =
    dueDate.getTime() - Date.now();

  if (
    Number.isNaN(dueDate.getTime()) ||
    remainingMilliseconds <= 0
  ) {
    return {
      label: "Breached",
      className: "text-red-400",
      breached: true,
    };
  }

  const totalMinutes = Math.ceil(
    remainingMilliseconds / 60000,
  );

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes = totalMinutes % 60;

  return {
    label:
      hours > 0
        ? `${hours}h ${minutes}m remaining`
        : `${minutes} min remaining`,
    className:
      totalMinutes <= 60
        ? "text-orange-300"
        : "text-blue-400",
    breached: false,
  };
}

export default function MyQueuePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [incidents, setIncidents] =
    useState<HelpdeskIncident[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | IncidentStatus>("All");

  const [
    technicianFilter,
    setTechnicianFilter,
  ] = useState("All");

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedCurrentUser =
        JSON.parse(
          savedCurrentUser,
        ) as CurrentUser;

      setCurrentUser(parsedCurrentUser);
      setIncidents(loadIncidents());

      if (
        parsedCurrentUser.role ===
        "IT Support"
      ) {
        setTechnicianFilter(
          parsedCurrentUser.name,
        );
      }
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );
      router.replace("/login");
    }
  }, [router]);

  const technicians = useMemo(
    () =>
      Array.from(
        new Set(
          incidents
            .map(
              (incident) =>
                incident.assignedTo,
            )
            .filter(Boolean),
        ),
      ).sort(),
    [incidents],
  );

  const queueIncidents = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const normalizedSearch =
      searchTerm.toLowerCase().trim();

    return incidents
      .filter((incident) => {
        const isClosed =
          incident.status === "Resolved" ||
          incident.status === "Closed";

        const roleMatches =
          currentUser.role === "IT Admin" ||
          normalize(
            incident.assignedTo,
          ) ===
            normalize(currentUser.name) ||
          normalize(
            incident.assignedTo,
          ) === "it support";

        const technicianMatches =
          technicianFilter === "All" ||
          incident.assignedTo ===
            technicianFilter;

        const statusMatches =
          statusFilter === "All" ||
          incident.status === statusFilter;

        const searchMatches =
          normalizedSearch === "" ||
          incident.id
            .toLowerCase()
            .includes(normalizedSearch) ||
          incident.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          incident.employeeName
            .toLowerCase()
            .includes(normalizedSearch) ||
          incident.category
            .toLowerCase()
            .includes(normalizedSearch) ||
          incident.department
            .toLowerCase()
            .includes(normalizedSearch);

        return (
          !isClosed &&
          roleMatches &&
          technicianMatches &&
          statusMatches &&
          searchMatches
        );
      })
      .sort(
        (firstIncident, secondIncident) =>
          new Date(
            secondIncident.updatedAt,
          ).getTime() -
          new Date(
            firstIncident.updatedAt,
          ).getTime(),
      );
  }, [
    currentUser,
    incidents,
    searchTerm,
    statusFilter,
    technicianFilter,
  ]);

  const myActiveIncidents = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return incidents.filter(
      (incident) =>
        incident.status !== "Resolved" &&
        incident.status !== "Closed" &&
        (currentUser.role === "IT Admin" ||
          normalize(
            incident.assignedTo,
          ) ===
            normalize(currentUser.name) ||
          normalize(
            incident.assignedTo,
          ) === "it support"),
    );
  }, [currentUser, incidents]);

  const criticalCount =
    myActiveIncidents.filter(
      (incident) =>
        incident.priority === "Critical",
    ).length;

  const inProgressCount =
    myActiveIncidents.filter(
      (incident) =>
        incident.status === "In Progress",
    ).length;

  const breachedCount =
    myActiveIncidents.filter(
      (incident) =>
        getSlaState(incident).breached,
    ).length;

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Checking access...
        </p>
      </main>
    );
  }

  if (currentUser.role === "Employee") {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <p className="text-5xl">
              🔒
            </p>

            <h1 className="mt-5 text-3xl font-bold">
              Technician Access Required
            </h1>

            <p className="mt-3 leading-7 text-gray-400">
              My Queue is available only to
              IT Admin and IT Support users.
            </p>

            <Link
              href="/helpdesk"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Back to Helpdesk
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            Technician Workspace
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            My Queue
          </h1>

          <p className="mt-3 max-w-3xl text-gray-400">
            Review assigned incidents, prioritize
            urgent work, and protect SLA targets from
            one technician workspace.
          </p>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Active Queue"
            value={myActiveIncidents.length}
            description="Open technician workload"
            valueClassName="text-blue-400"
          />

          <MetricCard
            label="Critical"
            value={criticalCount}
            description="Immediate attention"
            valueClassName="text-red-500"
          />

          <MetricCard
            label="In Progress"
            value={inProgressCount}
            description="Currently being handled"
            valueClassName="text-cyan-400"
          />

          <MetricCard
            label="SLA Breached"
            value={breachedCount}
            description="Outside target"
            valueClassName="text-orange-400"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Assigned Work
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Showing active incidents assigned to
                  the selected technician.
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
                  placeholder="Search queue..."
                  className="min-w-[220px] rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-blue-500"
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
                </select>

                <select
                  value={technicianFilter}
                  onChange={(event) =>
                    setTechnicianFilter(
                      event.target.value,
                    )
                  }
                  disabled={
                    currentUser.role ===
                    "IT Support"
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70 focus:border-blue-500"
                >
                  <option value="All">
                    All Technicians
                  </option>

                  {technicians.map(
                    (technician) => (
                      <option
                        key={technician}
                        value={technician}
                      >
                        {technician}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">
                    Incident
                  </th>
                  <th className="px-4 py-4">
                    Issue
                  </th>
                  <th className="px-4 py-4">
                    Requester
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
                    Technician
                  </th>
                  <th className="px-4 py-4">
                    SLA
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
                {queueIncidents.map(
                  (incident) => {
                    const sla =
                      getSlaState(incident);

                    return (
                      <tr
                        key={incident.id}
                        className="transition hover:bg-zinc-800/40"
                      >
                        <td className="px-6 py-5 font-semibold text-blue-400">
                          {incident.id}
                        </td>

                        <td className="max-w-[280px] px-4 py-5">
                          <p className="truncate font-medium">
                            {incident.title}
                          </p>

                          <p className="mt-2 text-xs text-gray-600">
                            {incident.department}
                          </p>
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {incident.employeeName}
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

                        <td
                          className={`px-4 py-5 text-sm font-semibold ${sla.className}`}
                        >
                          {sla.label}
                        </td>

                        <td className="px-4 py-5 text-sm text-gray-500">
                          {formatDate(
                            incident.updatedAt,
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <Link
                            href={`/helpdesk/incidents/${incident.id}`}
                            className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  },
                )}

                {queueIncidents.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-4xl">
                        ✅
                      </p>

                      <p className="mt-4 text-lg font-medium text-gray-300">
                        Queue is clear
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        No active incidents match the
                        selected filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {queueIncidents.length} active
              incidents
            </p>

            <Link
              href="/helpdesk/incidents"
              className="font-semibold text-blue-400 transition hover:text-blue-300"
            >
              View all incidents →
            </Link>
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