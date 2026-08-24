"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import Sidebar from "@/app/components/system/Sidebar";

type ChangeType =
  | "Standard"
  | "Normal"
  | "Emergency";

type ChangeRisk =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

type CabStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Not Required";

type ChangeStatus =
  | "Planning"
  | "Waiting Approval"
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Failed"
  | "Cancelled";

type ChangeRecord = {
  id: string;
  title: string;
  category: string;
  type: ChangeType;
  risk: ChangeRisk;
  cabStatus: CabStatus;
  status: ChangeStatus;
  owner: string;
  scheduledStart: string;
  scheduledEnd: string;
  environment: string;
  businessImpact: string;
};

const changes: ChangeRecord[] = [
  {
    id: "CHG-1001",
    title: "Upgrade perimeter firewall firmware",
    category: "Network",
    type: "Normal",
    risk: "High",
    cabStatus: "Pending",
    status: "Waiting Approval",
    owner: "Sarah Hassan",
    scheduledStart: "Aug 5, 2026, 10:00 PM",
    scheduledEnd: "Aug 6, 2026, 1:00 AM",
    environment: "Production",
    businessImpact:
      "Brief internet and VPN interruption during failover.",
  },
  {
    id: "CHG-1002",
    title: "Deploy monthly Windows security updates",
    category: "Infrastructure",
    type: "Standard",
    risk: "Low",
    cabStatus: "Approved",
    status: "Scheduled",
    owner: "Mohammed Saleh",
    scheduledStart: "Aug 6, 2026, 11:00 PM",
    scheduledEnd: "Aug 7, 2026, 2:00 AM",
    environment: "Production",
    businessImpact:
      "Planned server restart outside business hours.",
  },
  {
    id: "CHG-1003",
    title: "Apply ERP application patch",
    category: "Application",
    type: "Normal",
    risk: "Medium",
    cabStatus: "Approved",
    status: "In Progress",
    owner: "Ali Nasser",
    scheduledStart: "Aug 4, 2026, 8:00 PM",
    scheduledEnd: "Aug 4, 2026, 11:30 PM",
    environment: "Production",
    businessImpact:
      "ERP access unavailable during deployment window.",
  },
  {
    id: "CHG-1004",
    title: "Replace warehouse distribution switch",
    category: "Network",
    type: "Normal",
    risk: "High",
    cabStatus: "Pending",
    status: "Planning",
    owner: "Yousef Omar",
    scheduledStart: "Aug 8, 2026, 7:00 AM",
    scheduledEnd: "Aug 8, 2026, 10:00 AM",
    environment: "Production",
    businessImpact:
      "Warehouse devices temporarily disconnected.",
  },
  {
    id: "CHG-1005",
    title: "Perform SQL database maintenance",
    category: "Database",
    type: "Standard",
    risk: "Medium",
    cabStatus: "Approved",
    status: "Completed",
    owner: "IT Team",
    scheduledStart: "Jul 31, 2026, 9:00 PM",
    scheduledEnd: "Jul 31, 2026, 11:00 PM",
    environment: "Production",
    businessImpact:
      "Reporting services unavailable during maintenance.",
  },
  {
    id: "CHG-1006",
    title: "Emergency replacement of failed UPS unit",
    category: "Infrastructure",
    type: "Emergency",
    risk: "Critical",
    cabStatus: "Approved",
    status: "Completed",
    owner: "Sarah Hassan",
    scheduledStart: "Jul 29, 2026, 4:30 PM",
    scheduledEnd: "Jul 29, 2026, 6:00 PM",
    environment: "Production",
    businessImpact:
      "Temporary reduction in server room power redundancy.",
  },
  {
    id: "CHG-1007",
    title: "Enable MFA for finance administrators",
    category: "Security",
    type: "Normal",
    risk: "Medium",
    cabStatus: "Rejected",
    status: "Cancelled",
    owner: "Mohammed Saleh",
    scheduledStart: "Aug 10, 2026, 6:00 PM",
    scheduledEnd: "Aug 10, 2026, 8:00 PM",
    environment: "Production",
    businessImpact:
      "Administrators required to complete MFA registration.",
  },
];

export default function ChangesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | ChangeStatus>("All");
  const [riskFilter, setRiskFilter] =
    useState<"All" | ChangeRisk>("All");
  const [typeFilter, setTypeFilter] =
    useState<"All" | ChangeType>("All");

  const filteredChanges = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim();

    return changes.filter((change) => {
      const matchesSearch =
        normalizedSearch === "" ||
        change.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        change.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        change.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        change.owner
          .toLowerCase()
          .includes(normalizedSearch) ||
        change.environment
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        change.status === statusFilter;

      const matchesRisk =
        riskFilter === "All" ||
        change.risk === riskFilter;

      const matchesType =
        typeFilter === "All" ||
        change.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRisk &&
        matchesType
      );
    });
  }, [
    riskFilter,
    searchTerm,
    statusFilter,
    typeFilter,
  ]);

  const pendingApproval = changes.filter(
    (change) =>
      change.cabStatus === "Pending",
  ).length;

  const approved = changes.filter(
    (change) =>
      change.cabStatus === "Approved",
  ).length;

  const emergencyChanges = changes.filter(
    (change) =>
      change.type === "Emergency",
  ).length;

  const completed = changes.filter(
    (change) =>
      change.status === "Completed",
  ).length;

  const completedChanges = changes.filter(
    (change) =>
      change.status === "Completed",
  );

  const successfulChanges =
    completedChanges.filter(
      (change) =>
        change.status !== "Failed",
    ).length;

  const successRate =
    completedChanges.length === 0
      ? 0
      : Math.round(
          (successfulChanges /
            completedChanges.length) *
            100,
        );

  const approvedOrNotRequired =
    changes.filter(
      (change) =>
        change.cabStatus === "Approved" ||
        change.cabStatus ===
          "Not Required",
    ).length;

  const cabApprovalRate = Math.round(
    (approvedOrNotRequired /
      changes.length) *
      100,
  );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              ITIL Change Enablement
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Change Management
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Plan, assess, approve, schedule, and monitor
              infrastructure changes while minimizing
              operational and business risk.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            + New Change
          </button>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Pending Approval"
            value={pendingApproval}
            description="Awaiting CAB decision"
            valueClassName="text-orange-400"
          />

          <MetricCard
            label="Approved"
            value={approved}
            description="CAB approved requests"
            valueClassName="text-green-400"
          />

          <MetricCard
            label="Emergency Changes"
            value={emergencyChanges}
            description="Urgent production work"
            valueClassName="text-red-500"
          />

          <MetricCard
            label="Completed"
            value={completed}
            description="Successfully implemented"
            valueClassName="text-blue-400"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-6">
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Change Requests
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Review risk, CAB approval, schedule,
                  environment, and implementation status.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Search changes..."
                  className="min-w-[220px] rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-blue-500"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "All"
                        | ChangeStatus,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Statuses
                  </option>
                  <option value="Planning">
                    Planning
                  </option>
                  <option value="Waiting Approval">
                    Waiting Approval
                  </option>
                  <option value="Scheduled">
                    Scheduled
                  </option>
                  <option value="In Progress">
                    In Progress
                  </option>
                  <option value="Completed">
                    Completed
                  </option>
                  <option value="Failed">
                    Failed
                  </option>
                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>

                <select
                  value={riskFilter}
                  onChange={(event) =>
                    setRiskFilter(
                      event.target.value as
                        | "All"
                        | ChangeRisk,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Risks
                  </option>
                  <option value="Critical">
                    Critical
                  </option>
                  <option value="High">
                    High
                  </option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="Low">
                    Low
                  </option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as
                        | "All"
                        | ChangeType,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Types
                  </option>
                  <option value="Standard">
                    Standard
                  </option>
                  <option value="Normal">
                    Normal
                  </option>
                  <option value="Emergency">
                    Emergency
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1380px]">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">
                    Change
                  </th>
                  <th className="px-4 py-4">
                    Title
                  </th>
                  <th className="px-4 py-4">
                    Category
                  </th>
                  <th className="px-4 py-4">
                    Type
                  </th>
                  <th className="px-4 py-4">
                    Risk
                  </th>
                  <th className="px-4 py-4">
                    CAB
                  </th>
                  <th className="px-4 py-4">
                    Status
                  </th>
                  <th className="px-4 py-4">
                    Schedule
                  </th>
                  <th className="px-4 py-4">
                    Environment
                  </th>
                  <th className="px-4 py-4">
                    Owner
                  </th>
                  <th className="px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredChanges.map((change) => (
                  <tr
                    key={change.id}
                    className="transition hover:bg-zinc-800/40"
                  >
                    <td className="px-6 py-5 font-semibold text-blue-400">
                      {change.id}
                    </td>

                    <td className="max-w-[300px] px-4 py-5">
                      <p className="truncate font-medium">
                        {change.title}
                      </p>

                      <p className="mt-2 truncate text-xs text-gray-600">
                        {change.businessImpact}
                      </p>
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {change.category}
                    </td>

                    <td className="px-4 py-5">
                      <TypeBadge
                        type={change.type}
                      />
                    </td>

                    <td className="px-4 py-5">
                      <RiskBadge
                        risk={change.risk}
                      />
                    </td>

                    <td className="px-4 py-5">
                      <CabBadge
                        status={
                          change.cabStatus
                        }
                      />
                    </td>

                    <td className="px-4 py-5">
                      <StatusBadge
                        status={change.status}
                      />
                    </td>

                    <td className="px-4 py-5 text-sm text-gray-400">
                      <p>
                        {change.scheduledStart}
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        to {change.scheduledEnd}
                      </p>
                    </td>

                    <td className="px-4 py-5">
                      <span className="inline-flex rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-semibold text-gray-300">
                        {change.environment}
                      </span>
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {change.owner}
                    </td>

                    <td className="px-6 py-5">
                      <Link
                        href={`/helpdesk/changes/${change.id}`}
                        className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredChanges.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-lg font-medium text-gray-300">
                        No change requests found
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
              Showing {filteredChanges.length} of{" "}
              {changes.length} change requests
            </p>

            <p>
              Production changes sorted by schedule
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <InsightCard
            eyebrow="CAB Approval Rate"
            value={`${cabApprovalRate}%`}
            description="Approved or pre-authorized change requests."
            valueClassName="text-green-400"
          />

          <InsightCard
            eyebrow="Change Success Rate"
            value={`${successRate}%`}
            description="Completed changes without implementation failure."
            valueClassName="text-blue-400"
          />

          <InsightCard
            eyebrow="Emergency Changes"
            value={emergencyChanges.toString()}
            description="Urgent changes requiring accelerated approval."
            valueClassName="text-red-400"
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

function TypeBadge({
  type,
}: {
  type: ChangeType;
}) {
  const classes: Record<
    ChangeType,
    string
  > = {
    Standard:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Normal:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Emergency:
      "border-red-500/30 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[type]}`}
    >
      {type}
    </span>
  );
}

function RiskBadge({
  risk,
}: {
  risk: ChangeRisk;
}) {
  const classes: Record<
    ChangeRisk,
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
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[risk]}`}
    >
      {risk}
    </span>
  );
}

function CabBadge({
  status,
}: {
  status: CabStatus;
}) {
  const classes: Record<
    CabStatus,
    string
  > = {
    Pending:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Approved:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Rejected:
      "border-red-500/30 bg-red-500/10 text-red-400",
    "Not Required":
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

function StatusBadge({
  status,
}: {
  status: ChangeStatus;
}) {
  const classes: Record<
    ChangeStatus,
    string
  > = {
    Planning:
      "border-purple-500/30 bg-purple-500/10 text-purple-400",
    "Waiting Approval":
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Scheduled:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    "In Progress":
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    Completed:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Failed:
      "border-red-500/30 bg-red-500/10 text-red-400",
    Cancelled:
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