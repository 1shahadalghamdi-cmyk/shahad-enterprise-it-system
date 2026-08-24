"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import {
  hasPermission,
  type UserRole,
} from "@/lib/iam/permissions";

type BackupStatus =
  | "Success"
  | "Warning"
  | "Failed";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

const jobs = [
  {
    id: "BKP-001",
    name: "Domain Controllers",
    target: "DC01 + DC02",
    type: "System State",
    schedule: "Daily • 01:00",
    lastRun: "Today 01:14",
    duration: "14 min",
    size: "38 GB",
    status: "Success" as BackupStatus,
  },
  {
    id: "BKP-002",
    name: "File Server",
    target: "FILE01",
    type: "Incremental",
    schedule: "Daily • 02:00",
    lastRun: "Today 02:42",
    duration: "42 min",
    size: "286 GB",
    status: "Success" as BackupStatus,
  },
  {
    id: "BKP-003",
    name: "Microsoft 365",
    target: "Exchange / OneDrive",
    type: "Cloud Backup",
    schedule: "Daily • 03:00",
    lastRun: "Today 03:31",
    duration: "31 min",
    size: "124 GB",
    status: "Warning" as BackupStatus,
  },
  {
    id: "BKP-004",
    name: "Infrastructure Config",
    target: "FW01 + CORE-SW01",
    type: "Configuration",
    schedule: "Daily • 04:00",
    lastRun: "Today 04:08",
    duration: "8 min",
    size: "2.4 GB",
    status: "Success" as BackupStatus,
  },
  {
    id: "BKP-005",
    name: "Weekly Full Backup",
    target: "Enterprise Systems",
    type: "Full",
    schedule: "Sunday • 00:00",
    lastRun: "Last Sunday",
    duration: "2 hr 18 min",
    size: "1.2 TB",
    status: "Failed" as BackupStatus,
  },
];

const protectedSystems = [
  {
    name: "Active Directory",
    rpo: "4 hours",
    rto: "2 hours",
    retention: "30 days",
    protection: "Protected",
  },
  {
    name: "File Services",
    rpo: "4 hours",
    rto: "4 hours",
    retention: "30 days",
    protection: "Protected",
  },
  {
    name: "Microsoft 365",
    rpo: "8 hours",
    rto: "4 hours",
    retention: "90 days",
    protection: "Protected",
  },
  {
    name: "Network Configuration",
    rpo: "24 hours",
    rto: "2 hours",
    retention: "30 days",
    protection: "Protected",
  },
];

export default function BackupRecoveryPage() {
  const router = useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  /*
   * Load the signed-in user and
   * protect the Backup dashboard.
   */
  useEffect(() => {
    const savedUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          savedUser,
        ) as CurrentUser;

      if (
        !hasPermission(
          parsedUser.role,
          "backup:view",
        )
      ) {
        router.replace(
          "/dashboard",
        );
        return;
      }

      setCurrentUser(
        parsedUser,
      );
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  /*
   * Role-based actions.
   */
  const canRestore =
    currentUser
      ? hasPermission(
          currentUser.role,
          "backup:restore",
        )
      : false;

  const canManageBackup =
    currentUser
      ? hasPermission(
          currentUser.role,
          "backup:manage",
        )
      : false;

  /*
   * All dashboard values are derived
   * from the same jobs dataset.
   */
  const success =
    jobs.filter(
      (job) =>
        job.status ===
        "Success",
    ).length;

  const failed =
    jobs.filter(
      (job) =>
        job.status ===
        "Failed",
    ).length;

  const warning =
    jobs.filter(
      (job) =>
        job.status ===
        "Warning",
    ).length;

  const failedJobs =
    jobs.filter(
      (job) =>
        job.status ===
        "Failed",
    );

  const warningJobs =
    jobs.filter(
      (job) =>
        job.status ===
        "Warning",
    );

  const protectedCount =
    protectedSystems.length;

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Backup & Recovery...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Business Continuity
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Backup & Disaster Recovery
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Protect critical enterprise systems with
                scheduled backups, retention policies,
                recovery objectives, and restore readiness.
              </p>
            </div>

            {/*
             * Administrative actions.
             *
             * IT Support only has backup:view,
             * so these buttons do not appear.
             */}
            {(canRestore ||
              canManageBackup) && (
              <div className="flex flex-wrap gap-3">
                {canRestore && (
                  <Link
                    href="/backup-recovery/restore"
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                  >
                    Restore & Recovery
                  </Link>
                )}

                {canManageBackup && (
                  <Link
                    href="/backup-recovery/dr-plan"
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-300 hover:bg-purple-500/20"
                  >
                    DR Plan
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* KPI Cards */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Backup Jobs"
              value={jobs.length}
              subtitle="Scheduled protection jobs"
            />

            <Kpi
              title="Successful"
              value={success}
              subtitle="Latest runs completed"
              valueClass="text-green-400"
            />

            <Kpi
              title="Failed Jobs"
              value={failed}
              subtitle="Require investigation"
              valueClass="text-red-400"
            />

            <Kpi
              title="Protected Systems"
              value={
                protectedCount
              }
              subtitle="Critical service groups"
              valueClass="text-blue-400"
            />
          </div>

          {/* Backup Jobs + Storage */}
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            {/* Backup Jobs */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="border-b border-white/10 p-6">
                <h2 className="text-2xl font-semibold">
                  Backup Jobs
                </h2>

                <p className="mt-2 text-gray-400">
                  Current backup schedules and latest
                  execution results.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                    <tr>
                      <th className="px-6 py-4">
                        Job
                      </th>

                      <th className="px-4 py-4">
                        Type
                      </th>

                      <th className="px-4 py-4">
                        Schedule
                      </th>

                      <th className="px-4 py-4">
                        Last Run
                      </th>

                      <th className="px-4 py-4">
                        Backup Size
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {jobs.map(
                      (job) => (
                        <tr
                          key={
                            job.id
                          }
                          className="hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold text-blue-400">
                              {
                                job.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {
                                job.id
                              }{" "}
                              •{" "}
                              {
                                job.target
                              }
                            </p>
                          </td>

                          <td className="px-4 py-5 text-gray-300">
                            {
                              job.type
                            }
                          </td>

                          <td className="px-4 py-5 text-gray-300">
                            {
                              job.schedule
                            }
                          </td>

                          <td className="px-4 py-5">
                            <p className="text-gray-300">
                              {
                                job.lastRun
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {
                                job.duration
                              }
                            </p>
                          </td>

                          <td className="px-4 py-5 font-mono text-sm text-gray-300">
                            {
                              job.size
                            }
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                job.status
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

            {/* Storage + Alerts */}
            <div className="space-y-6">
              {/* Storage */}
              <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                <h2 className="text-xl font-semibold">
                  Backup Storage
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Primary enterprise backup repository.
                </p>

                <div className="mt-6">
                  <StorageMetric
                    used={4.8}
                    total={8}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <Detail
                    label="Repository"
                    value="BACKUP01"
                  />

                  <Detail
                    label="Storage Type"
                    value="On-Premises Repository"
                  />

                  <Detail
                    label="Encryption"
                    value="AES-256"
                  />

                  <Detail
                    label="Offsite Copy"
                    value="Enabled"
                  />
                </div>
              </section>

              {/* Dynamic Failed Job Alerts */}
              {failedJobs.map(
                (job) => (
                  <section
                    key={
                      job.id
                    }
                    className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                      Attention Required
                    </p>

                    <h2 className="mt-3 text-xl font-semibold">
                      {
                        job.name
                      }
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      The latest{" "}
                      {job.type.toLowerCase()}{" "}
                      backup for{" "}
                      <span className="font-medium text-gray-300">
                        {
                          job.target
                        }
                      </span>{" "}
                      failed. Investigate the backup job
                      and repository availability before
                      the next scheduled recovery window.
                    </p>

                    <div className="mt-4 border-t border-red-500/10 pt-4">
                      <p className="text-xs text-gray-500">
                        {
                          job.id
                        }{" "}
                        • Last run:{" "}
                        {
                          job.lastRun
                        }
                      </p>
                    </div>
                  </section>
                ),
              )}

              {/* Dynamic Warning Summary */}
              {warning > 0 && (
                <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.05] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
                    Warning
                  </p>

                  <h2 className="mt-3 text-xl font-semibold">
                    {warning} Backup Job
                    {warning > 1
                      ? "s"
                      : ""}{" "}
                    Require Review
                  </h2>

                  <div className="mt-4 space-y-3">
                    {warningJobs.map(
                      (job) => (
                        <div
                          key={
                            job.id
                          }
                          className="rounded-xl border border-white/5 bg-zinc-950/50 p-4"
                        >
                          <p className="font-semibold text-yellow-300">
                            {
                              job.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              job.id
                            }{" "}
                            •{" "}
                            {
                              job.target
                            }{" "}
                            •{" "}
                            {
                              job.lastRun
                            }
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </section>
              )}

              {/* Healthy State */}
              {failedJobs.length ===
                0 &&
                warningJobs.length ===
                  0 && (
                  <section className="rounded-2xl border border-green-500/20 bg-green-500/[0.05] p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
                      Backup Health
                    </p>

                    <h2 className="mt-3 text-xl font-semibold">
                      All Backup Jobs Healthy
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      All scheduled backup jobs completed
                      successfully and no backup
                      operations currently require
                      investigation.
                    </p>
                  </section>
                )}
            </div>
          </div>

          {/* Recovery Objectives */}
          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Recovery Objectives
            </h2>

            <p className="mt-2 text-gray-400">
              Recovery Point Objective (RPO), Recovery Time
              Objective (RTO), and retention targets.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {protectedSystems.map(
                (system) => (
                  <div
                    key={
                      system.name
                    }
                    className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-blue-400">
                        {
                          system.name
                        }
                      </h3>

                      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
                        {
                          system.protection
                        }
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <Detail
                        label="RPO"
                        value={
                          system.rpo
                        }
                      />

                      <Detail
                        label="RTO"
                        value={
                          system.rto
                        }
                      />

                      <Detail
                        label="Retention"
                        value={
                          system.retention
                        }
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* Backup Strategy */}
          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Backup Strategy
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Node label="Production Systems" />

              <Arrow />

              <Node label="Daily Incremental" />

              <Arrow />

              <Node label="Weekly Full" />

              <Arrow />

              <Node label="BACKUP01 Repository" />

              <Arrow />

              <Node label="Offsite Copy" />
            </div>

            <p className="mt-5 max-w-4xl leading-7 text-gray-400">
              Critical enterprise workloads are protected
              through scheduled local backups with
              encrypted repository storage and an
              additional offsite copy to reduce the impact
              of infrastructure failure or site-level
              incidents.
            </p>
          </section>
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
  value: string | number;
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

function StatusBadge({
  status,
}: {
  status: BackupStatus;
}) {
  const classes =
    status === "Success"
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

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-gray-300">
        {value}
      </span>
    </div>
  );
}

function StorageMetric({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const percent =
    Math.round(
      (used / total) *
        100,
    );

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">
          Repository Utilization
        </span>

        <span className="font-semibold">
          {percent}%
        </span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-950">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <p className="mt-2 text-xs text-gray-600">
        {used} TB used of {total} TB
      </p>
    </div>
  );
}

function Node({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-semibold text-blue-300">
      {label}
    </span>
  );
}

function Arrow() {
  return (
    <span className="text-gray-600">
      →
    </span>
  );
}
