"use client";

import { useMemo, useState } from "react";

import Sidebar from "@/app/components/system/Sidebar";

type SlaPriority =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

type SlaStatus =
  | "Within SLA"
  | "At Risk"
  | "Breached"
  | "Completed";

type SlaRecord = {
  id: string;
  title: string;
  priority: SlaPriority;
  assignedTo: string;
  responseTarget: string;
  resolutionTarget: string;
  responseTime: string;
  resolutionTime: string;
  status: SlaStatus;
  compliance: number;
};

const slaRecords: SlaRecord[] = [
  {
    id: "INC-1025",
    title: "Core switch is unreachable",
    priority: "Critical",
    assignedTo: "Sarah Hassan",
    responseTarget: "15 min",
    resolutionTarget: "4 hours",
    responseTime: "9 min",
    resolutionTime: "In progress",
    status: "At Risk",
    compliance: 76,
  },
  {
    id: "INC-1024",
    title: "VPN connection keeps disconnecting",
    priority: "High",
    assignedTo: "Mohammed Saleh",
    responseTarget: "30 min",
    resolutionTarget: "8 hours",
    responseTime: "18 min",
    resolutionTime: "3h 42m",
    status: "Within SLA",
    compliance: 92,
  },
  {
    id: "INC-1023",
    title: "Cisco phone handset has no audio",
    priority: "Medium",
    assignedTo: "Ali Nasser",
    responseTarget: "2 hours",
    resolutionTarget: "24 hours",
    responseTime: "42 min",
    resolutionTime: "In progress",
    status: "Within SLA",
    compliance: 88,
  },
  {
    id: "INC-1022",
    title: "Microsoft 365 account is locked",
    priority: "High",
    assignedTo: "Yousef Omar",
    responseTarget: "30 min",
    resolutionTarget: "8 hours",
    responseTime: "24 min",
    resolutionTime: "9h 10m",
    status: "Breached",
    compliance: 58,
  },
  {
    id: "INC-1021",
    title: "Printer is not available on the network",
    priority: "Low",
    assignedTo: "Sarah Hassan",
    responseTarget: "4 hours",
    resolutionTarget: "72 hours",
    responseTime: "1h 12m",
    resolutionTime: "2h 48m",
    status: "Completed",
    compliance: 100,
  },
  {
    id: "INC-1020",
    title: "Laptop fails to boot into Windows",
    priority: "Medium",
    assignedTo: "Mohammed Saleh",
    responseTarget: "2 hours",
    resolutionTarget: "24 hours",
    responseTime: "36 min",
    resolutionTime: "5h 20m",
    status: "Completed",
    compliance: 100,
  },
];

const technicianPerformance = [
  {
    name: "Sarah Hassan",
    incidents: 18,
    compliance: 98,
    avgResolution: "3.4h",
  },
  {
    name: "Mohammed Saleh",
    incidents: 16,
    compliance: 96,
    avgResolution: "4.1h",
  },
  {
    name: "Ali Nasser",
    incidents: 13,
    compliance: 94,
    avgResolution: "4.8h",
  },
  {
    name: "Yousef Omar",
    incidents: 11,
    compliance: 89,
    avgResolution: "5.6h",
  },
];

export default function SlaDashboardPage() {
  const [statusFilter, setStatusFilter] =
    useState<"All" | SlaStatus>("All");

  const [priorityFilter, setPriorityFilter] =
    useState<"All" | SlaPriority>("All");

  const filteredRecords = useMemo(
    () =>
      slaRecords.filter((record) => {
        const matchesStatus =
          statusFilter === "All" ||
          record.status === statusFilter;

        const matchesPriority =
          priorityFilter === "All" ||
          record.priority === priorityFilter;

        return matchesStatus && matchesPriority;
      }),
    [priorityFilter, statusFilter],
  );

  const totalRecords = slaRecords.length;

  const withinSlaCount = slaRecords.filter(
    (record) =>
      record.status === "Within SLA" ||
      record.status === "Completed",
  ).length;

  const breachedCount = slaRecords.filter(
    (record) => record.status === "Breached",
  ).length;

  const atRiskCount = slaRecords.filter(
    (record) => record.status === "At Risk",
  ).length;

  const complianceRate = Math.round(
    (withinSlaCount / totalRecords) * 100,
  );

  const avgCompliance = Math.round(
    slaRecords.reduce(
      (total, record) =>
        total + record.compliance,
      0,
    ) / totalRecords,
  );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Service Level Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              SLA Dashboard
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Monitor response and resolution targets,
              identify breached incidents, and measure
              service desk compliance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "All"
                    | SlaStatus,
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">
                All SLA Statuses
              </option>
              <option value="Within SLA">
                Within SLA
              </option>
              <option value="At Risk">
                At Risk
              </option>
              <option value="Breached">
                Breached
              </option>
              <option value="Completed">
                Completed
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value as
                    | "All"
                    | SlaPriority,
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
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

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="SLA Compliance"
            value={`${complianceRate}%`}
            description="Incidents within target"
            valueClassName="text-green-400"
          />

          <MetricCard
            label="Breached"
            value={breachedCount.toString()}
            description="Outside agreed target"
            valueClassName="text-red-500"
          />

          <MetricCard
            label="At Risk"
            value={atRiskCount.toString()}
            description="Approaching deadline"
            valueClassName="text-orange-400"
          />

          <MetricCard
            label="Average Score"
            value={`${avgCompliance}%`}
            description="Overall SLA performance"
            valueClassName="text-blue-400"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                Performance Overview
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                SLA Distribution
              </h2>
            </div>

            <div className="mt-8 space-y-6">
              <ProgressRow
                label="Within SLA"
                value={withinSlaCount}
                total={totalRecords}
                barClassName="bg-green-500"
              />

              <ProgressRow
                label="At Risk"
                value={atRiskCount}
                total={totalRecords}
                barClassName="bg-orange-500"
              />

              <ProgressRow
                label="Breached"
                value={breachedCount}
                total={totalRecords}
                barClassName="bg-red-500"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                SLA Targets
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Priority Matrix
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <TargetRow
                priority="Critical"
                response="15 min"
                resolution="4 hours"
              />

              <TargetRow
                priority="High"
                response="30 min"
                resolution="8 hours"
              />

              <TargetRow
                priority="Medium"
                response="2 hours"
                resolution="24 hours"
              />

              <TargetRow
                priority="Low"
                response="4 hours"
                resolution="72 hours"
              />
            </div>
          </section>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-2xl font-semibold">
              Incident SLA Records
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Response and resolution performance for
              active and completed incidents.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">
                    Incident
                  </th>
                  <th className="px-4 py-4">
                    Issue
                  </th>
                  <th className="px-4 py-4">
                    Priority
                  </th>
                  <th className="px-4 py-4">
                    Technician
                  </th>
                  <th className="px-4 py-4">
                    Response Target
                  </th>
                  <th className="px-4 py-4">
                    Response Time
                  </th>
                  <th className="px-4 py-4">
                    Resolution Target
                  </th>
                  <th className="px-4 py-4">
                    Resolution Time
                  </th>
                  <th className="px-4 py-4">
                    Compliance
                  </th>
                  <th className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-zinc-800/40"
                  >
                    <td className="px-6 py-5 font-semibold text-blue-400">
                      {record.id}
                    </td>

                    <td className="max-w-[260px] px-4 py-5">
                      <p className="truncate font-medium">
                        {record.title}
                      </p>
                    </td>

                    <td className="px-4 py-5">
                      <PriorityBadge
                        priority={record.priority}
                      />
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {record.assignedTo}
                    </td>

                    <td className="px-4 py-5 text-gray-400">
                      {record.responseTarget}
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {record.responseTime}
                    </td>

                    <td className="px-4 py-5 text-gray-400">
                      {record.resolutionTarget}
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {record.resolutionTime}
                    </td>

                    <td className="px-4 py-5">
                      <div className="min-w-[120px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Score
                          </span>

                          <span className="font-semibold text-gray-300">
                            {record.compliance}%
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-950">
                          <div
                            className={`h-full rounded-full ${
                              record.compliance >= 90
                                ? "bg-green-500"
                                : record.compliance >= 75
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${record.compliance}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge
                        status={record.status}
                      />
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-lg font-medium text-gray-300">
                        No SLA records found
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Try changing the selected filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Technician Analytics
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Technician SLA Performance
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {technicianPerformance.map(
              (technician) => (
                <div
                  key={technician.name}
                  className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                >
                  <p className="font-semibold">
                    {technician.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {technician.incidents} incidents
                  </p>

                  <p className="mt-5 text-3xl font-bold text-green-400">
                    {technician.compliance}%
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    SLA compliance
                  </p>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-sm text-gray-400">
                      Avg. Resolution
                    </p>

                    <p className="mt-1 font-semibold text-blue-400">
                      {technician.avgResolution}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
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
  value: string;
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

function ProgressRow({
  label,
  value,
  total,
  barClassName,
}: {
  label: string;
  value: number;
  total: number;
  barClassName: string;
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium">
          {label}
        </p>

        <p className="text-sm text-gray-400">
          {value} records · {percentage}%
        </p>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-950">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function TargetRow({
  priority,
  response,
  resolution,
}: {
  priority: SlaPriority;
  response: string;
  resolution: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
      <div className="flex items-center justify-between gap-4">
        <PriorityBadge priority={priority} />

        <div className="text-right">
          <p className="text-sm text-gray-400">
            Response:{" "}
            <span className="font-semibold text-white">
              {response}
            </span>
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Resolution:{" "}
            <span className="font-semibold text-white">
              {resolution}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: SlaPriority;
}) {
  const classes: Record<
    SlaPriority,
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
  status: SlaStatus;
}) {
  const classes: Record<
    SlaStatus,
    string
  > = {
    "Within SLA":
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    "At Risk":
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Breached:
      "border-red-500/30 bg-red-500/10 text-red-400",
    Completed:
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