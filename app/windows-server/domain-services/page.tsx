"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import type { UserRole } from "@/lib/iam/permissions";

type Health =
  | "Healthy"
  | "Warning";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type OrganizationalUnit = {
  name: string;
  users: number;
  computers: number;
  gpos: number;
};

type ReplicationItem = {
  source: string;
  destination: string;
  partition: string;
  lastSync: string;
  status: Health;
};

const domainControllers = [
  {
    name: "DC01",
    ip: "10.10.30.10",
    site: "Dammam-HQ",
    os: "Windows Server 2022",
    roles: "AD DS, DNS, Global Catalog",
    health: "Healthy" as Health,
  },
  {
    name: "DC02",
    ip: "10.10.30.11",
    site: "Dammam-HQ",
    os: "Windows Server 2022",
    roles: "AD DS, DNS, Global Catalog",
    health: "Healthy" as Health,
  },
];

const initialOrganizationalUnits:
  OrganizationalUnit[] = [
    {
      name: "IT",
      users: 41,
      computers: 35,
      gpos: 3,
    },
    {
      name: "HR",
      users: 34,
      computers: 30,
      gpos: 2,
    },
    {
      name: "Finance",
      users: 28,
      computers: 25,
      gpos: 3,
    },
    {
      name: "Corporate",
      users: 72,
      computers: 64,
      gpos: 2,
    },
    {
      name: "Guest",
      users: 18,
      computers: 18,
      gpos: 1,
    },
  ];

const fsmoRoles = [
  {
    role: "Schema Master",
    holder: "DC01",
  },
  {
    role: "Domain Naming Master",
    holder: "DC01",
  },
  {
    role: "RID Master",
    holder: "DC01",
  },
  {
    role: "PDC Emulator",
    holder: "DC01",
  },
  {
    role: "Infrastructure Master",
    holder: "DC01",
  },
];

const initialReplication:
  ReplicationItem[] = [
    {
      source: "DC01",
      destination: "DC02",
      partition: "enterprise.local",
      lastSync: "2 minutes ago",
      status: "Healthy",
    },
    {
      source: "DC02",
      destination: "DC01",
      partition: "Configuration",
      lastSync: "4 minutes ago",
      status: "Healthy",
    },
    {
      source: "DC01",
      destination: "DC02",
      partition: "DNS Application",
      lastSync: "5 minutes ago",
      status: "Healthy",
    },
  ];

const OU_STORAGE_KEY =
  "enterpriseOrganizationalUnits";

const REPLICATION_STORAGE_KEY =
  "enterpriseAdReplication";

export default function DomainServicesPage() {
  const router = useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    organizationalUnits,
    setOrganizationalUnits,
  ] =
    useState<OrganizationalUnit[]>(
      initialOrganizationalUnits,
    );

  const [
    replication,
    setReplication,
  ] =
    useState<ReplicationItem[]>(
      initialReplication,
    );

  const [
    dataLoaded,
    setDataLoaded,
  ] =
    useState(false);

  const [
    showOuForm,
    setShowOuForm,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    ouName,
    setOuName,
  ] =
    useState("");

  const [
    ouUsers,
    setOuUsers,
  ] =
    useState("");

  const [
    ouComputers,
    setOuComputers,
  ] =
    useState("");

  const [
    ouGpos,
    setOuGpos,
  ] =
    useState("");

  const canManageDomain =
    currentUser?.role ===
    "IT Admin";

  /*
   * Load and validate
   * signed-in user.
   */
  useEffect(() => {
    const savedUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedUser) {
      router.replace(
        "/login",
      );
      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          savedUser,
        ) as CurrentUser;

      if (
        parsedUser.role !==
          "IT Admin" &&
        parsedUser.role !==
          "IT Support"
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

      router.replace(
        "/login",
      );
    }
  }, [router]);

  /*
   * Load saved
   * Domain Services data.
   */
  useEffect(() => {
    const savedOus =
      window.localStorage.getItem(
        OU_STORAGE_KEY,
      );

    if (savedOus) {
      try {
        const parsedOus =
          JSON.parse(
            savedOus,
          ) as OrganizationalUnit[];

        if (
          Array.isArray(
            parsedOus,
          )
        ) {
          setOrganizationalUnits(
            parsedOus,
          );
        }
      } catch {
        setOrganizationalUnits(
          initialOrganizationalUnits,
        );
      }
    }

    const savedReplication =
      window.localStorage.getItem(
        REPLICATION_STORAGE_KEY,
      );

    if (savedReplication) {
      try {
        const parsedReplication =
          JSON.parse(
            savedReplication,
          ) as ReplicationItem[];

        if (
          Array.isArray(
            parsedReplication,
          )
        ) {
          setReplication(
            parsedReplication,
          );
        }
      } catch {
        setReplication(
          initialReplication,
        );
      }
    }

    setDataLoaded(
      true,
    );
  }, []);

  /*
   * Save OUs.
   */
  useEffect(() => {
    if (!dataLoaded) {
      return;
    }

    window.localStorage.setItem(
      OU_STORAGE_KEY,
      JSON.stringify(
        organizationalUnits,
      ),
    );
  }, [
    organizationalUnits,
    dataLoaded,
  ]);

  /*
   * Save replication state.
   */
  useEffect(() => {
    if (!dataLoaded) {
      return;
    }

    window.localStorage.setItem(
      REPLICATION_STORAGE_KEY,
      JSON.stringify(
        replication,
      ),
    );
  }, [
    replication,
    dataLoaded,
  ]);

  const totalUsers =
    organizationalUnits.reduce(
      (sum, ou) =>
        sum + ou.users,
      0,
    );

  const totalComputers =
    organizationalUnits.reduce(
      (sum, ou) =>
        sum + ou.computers,
      0,
    );

  const replicationHealth: Health =
    replication.some(
      (item) =>
        item.status ===
        "Warning",
    )
      ? "Warning"
      : "Healthy";

  /*
   * Create OU.
   * IT Admin only.
   */
  function createOu(
    event: FormEvent,
  ) {
    event.preventDefault();

    setMessage("");

    if (
      !currentUser ||
      !canManageDomain
    ) {
      setMessage(
        "You do not have permission to create Organizational Units.",
      );
      return;
    }

    const trimmedName =
      ouName.trim();

    if (!trimmedName) {
      setMessage(
        "Enter an Organizational Unit name.",
      );
      return;
    }

    const duplicateOu =
      organizationalUnits.some(
        (ou) =>
          ou.name
            .toLowerCase() ===
          trimmedName.toLowerCase(),
      );

    if (duplicateOu) {
      setMessage(
        "An Organizational Unit with this name already exists.",
      );
      return;
    }

    const users =
      Number(
        ouUsers,
      );

    const computers =
      Number(
        ouComputers,
      );

    const gpos =
      Number(
        ouGpos,
      );

    if (
      !Number.isInteger(
        users,
      ) ||
      users < 0 ||
      !Number.isInteger(
        computers,
      ) ||
      computers < 0 ||
      !Number.isInteger(
        gpos,
      ) ||
      gpos < 0
    ) {
      setMessage(
        "Users, computers, and GPO links must be whole numbers of 0 or more.",
      );
      return;
    }

    const newOu:
      OrganizationalUnit = {
        name:
          trimmedName,
        users,
        computers,
        gpos,
      };

    setOrganizationalUnits(
      (current) => [
        ...current,
        newOu,
      ],
    );

    setOuName("");
    setOuUsers("");
    setOuComputers("");
    setOuGpos("");

    setShowOuForm(
      false,
    );

    setMessage(
      "Organizational Unit created successfully.",
    );
  }

  /*
   * Successful replication
   * simulation.
   * IT Admin only.
   */
  function syncReplication(
    index: number,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageDomain
    ) {
      setMessage(
        "You do not have permission to synchronize Active Directory replication.",
      );
      return;
    }

    setReplication(
      (current) =>
        current.map(
          (
            item,
            itemIndex,
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  lastSync:
                    "Just now",
                  status:
                    "Healthy",
                }
              : item,
        ),
    );

    setMessage(
      "Active Directory replication completed successfully.",
    );
  }

  /*
   * Simulate a replication
   * warning.
   * IT Admin only.
   */
  function simulateWarning(
    index: number,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageDomain
    ) {
      setMessage(
        "You do not have permission to simulate Active Directory replication warnings.",
      );
      return;
    }

    setReplication(
      (current) =>
        current.map(
          (
            item,
            itemIndex,
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  lastSync:
                    "Sync delayed",
                  status:
                    "Warning",
                }
              : item,
        ),
    );

    setMessage(
      "Replication warning simulated. Review the affected replication link.",
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Domain Services...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Windows Server Infrastructure
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Domain Services
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Active Directory infrastructure
                overview including domain controllers,
                organizational units, FSMO roles,
                sites, and directory replication.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/windows-server"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
              >
                Server Dashboard
              </Link>

              <Link
                href="/windows-server/gpo"
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400"
              >
                Group Policy
              </Link>

              {canManageDomain && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOuForm(
                      (current) =>
                        !current,
                    );

                    setMessage(
                      "",
                    );
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  + New OU
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Active Directory Domain"
              value="enterprise.local"
              subtitle="Single-domain forest"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Domain Controllers"
              value={
                domainControllers.length
              }
              subtitle="Redundant AD DS servers"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Directory Users"
              value={
                totalUsers
              }
              subtitle="Users across managed OUs"
              valueClass="text-purple-400"
            />

            <KpiCard
              title="Domain Computers"
              value={
                totalComputers
              }
              subtitle="Joined enterprise endpoints"
            />
          </div>

          {canManageDomain &&
            showOuForm && (
              <form
                onSubmit={
                  createOu
                }
                className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
              >
                <h2 className="text-2xl font-semibold">
                  Create Organizational Unit
                </h2>

                <p className="mt-2 text-gray-400">
                  Add a new Active Directory OU
                  for an enterprise department
                  or managed group.
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <Field
                    label="OU Name"
                    value={
                      ouName
                    }
                    onChange={
                      setOuName
                    }
                    placeholder="Operations"
                    inputMode="text"
                  />

                  <Field
                    label="Users"
                    value={
                      ouUsers
                    }
                    onChange={
                      setOuUsers
                    }
                    placeholder="25"
                    inputMode="numeric"
                  />

                  <Field
                    label="Computers"
                    value={
                      ouComputers
                    }
                    onChange={
                      setOuComputers
                    }
                    placeholder="20"
                    inputMode="numeric"
                  />

                  <Field
                    label="GPO Links"
                    value={
                      ouGpos
                    }
                    onChange={
                      setOuGpos
                    }
                    placeholder="2"
                    inputMode="numeric"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                  >
                    Create OU
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOuForm(
                        false,
                      );

                      setMessage(
                        "",
                      );
                    }}
                    className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

          {message && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                message.includes(
                  "successfully",
                )
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : message.includes(
                        "warning",
                      ) ||
                      message.includes(
                        "Warning",
                      )
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-300"
              }`}
            >
              {message}
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Domain Controllers
              </h2>

              <p className="mt-2 text-gray-400">
                Active Directory Domain
                Services infrastructure.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Server
                    </th>

                    <th className="px-4 py-4">
                      IP Address
                    </th>

                    <th className="px-4 py-4">
                      AD Site
                    </th>

                    <th className="px-4 py-4">
                      Roles
                    </th>

                    <th className="px-4 py-4">
                      Operating System
                    </th>

                    <th className="px-6 py-4">
                      Health
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {domainControllers.map(
                    (dc) => (
                      <tr
                        key={
                          dc.name
                        }
                        className="hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5 font-semibold text-blue-400">
                          {
                            dc.name
                          }
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {
                            dc.ip
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            dc.site
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            dc.roles
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            dc.os
                          }
                        </td>

                        <td className="px-6 py-5">
                          <HealthBadge
                            status={
                              dc.health
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

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Organizational Units
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Logical Active Directory
                    structure aligned with
                    enterprise departments.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                  <p className="text-xs text-blue-400">
                    Managed OUs
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-300">
                    {
                      organizationalUnits.length
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {organizationalUnits.map(
                  (ou) => (
                    <div
                      key={
                        ou.name
                      }
                      className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                            Organizational Unit
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            {ou.name} OU
                          </h3>
                        </div>

                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                          Managed
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <SmallStat
                          label="Users"
                          value={
                            ou.users
                          }
                        />

                        <SmallStat
                          label="Computers"
                          value={
                            ou.computers
                          }
                        />

                        <SmallStat
                          label="GPO Links"
                          value={
                            ou.gpos
                          }
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                FSMO Roles
              </h2>

              <p className="mt-2 text-gray-400">
                Flexible Single Master
                Operations role ownership.
              </p>

              <div className="mt-6 space-y-3">
                {fsmoRoles.map(
                  (item) => (
                    <div
                      key={
                        item.role
                      }
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-zinc-950 p-4"
                    >
                      <span className="text-sm text-gray-400">
                        {
                          item.role
                        }
                      </span>

                      <span className="font-semibold text-purple-400">
                        {
                          item.holder
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  AD Site
                </p>

                <p className="mt-2 text-lg font-bold">
                  Dammam-HQ
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  10.10.0.0/16 enterprise network
                </p>
              </div>
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Active Directory Replication
                </h2>

                <p className="mt-2 text-gray-400">
                  Directory synchronization
                  between domain controllers.
                </p>
              </div>

              <ReplicationHealthCard
                status={
                  replicationHealth
                }
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Source
                    </th>

                    <th className="px-4 py-4">
                      Destination
                    </th>

                    <th className="px-4 py-4">
                      Partition
                    </th>

                    <th className="px-4 py-4">
                      Last Sync
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {replication.map(
                    (
                      item,
                      index,
                    ) => (
                      <tr
                        key={`${item.source}-${item.destination}-${index}`}
                        className="hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5 font-semibold text-blue-400">
                          {
                            item.source
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            item.destination
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            item.partition
                          }
                        </td>

                        <td
                          className={`px-4 py-5 ${
                            item.status ===
                            "Warning"
                              ? "font-semibold text-yellow-300"
                              : "text-gray-400"
                          }`}
                        >
                          {
                            item.lastSync
                          }
                        </td>

                        <td className="px-4 py-5">
                          <HealthBadge
                            status={
                              item.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5">
                          {canManageDomain ? (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  simulateWarning(
                                    index,
                                  )
                                }
                                className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
                              >
                                Simulate Warning
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  syncReplication(
                                    index,
                                  )
                                }
                                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/20"
                              >
                                Sync Now
                              </button>
                            </div>
                          ) : (
                            <div className="text-right text-sm text-gray-500">
                              View only
                            </div>
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Authentication Flow
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Node
                label="Employee Device"
              />

              <Arrow />

              <Node
                label="DNS Lookup"
              />

              <Arrow />

              <Node
                label="Domain Controller"
              />

              <Arrow />

              <Node
                label="Kerberos Authentication"
              />

              <Arrow />

              <Node
                label="GPO Applied"
              />
            </div>

            <p className="mt-5 leading-7 text-gray-400">
              Domain-joined endpoints locate a
              domain controller through DNS,
              authenticate users against Active
              Directory, and receive applicable
              Group Policy configuration based
              on domain and OU membership.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

function KpiCard({
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
        className={`mt-3 break-words text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
      <p className="text-xs text-gray-600">
        {label}
      </p>

      <p className="mt-1 font-bold text-gray-300">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  inputMode?:
    | "text"
    | "numeric";
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-gray-400">
        {label}
      </span>

      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        inputMode={
          inputMode
        }
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function HealthBadge({
  status,
}: {
  status: Health;
}) {
  const classes =
    status === "Healthy"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

function ReplicationHealthCard({
  status,
}: {
  status: Health;
}) {
  const classes =
    status === "Healthy"
      ? "border-green-500/20 bg-green-500/10"
      : "border-yellow-500/20 bg-yellow-500/10";

  const labelClass =
    status === "Healthy"
      ? "text-green-400"
      : "text-yellow-300";

  const valueClass =
    status === "Healthy"
      ? "text-green-300"
      : "text-yellow-200";

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${classes}`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${labelClass}`}
      >
        Replication Health
      </p>

      <p
        className={`mt-1 font-semibold ${valueClass}`}
      >
        {status}
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
