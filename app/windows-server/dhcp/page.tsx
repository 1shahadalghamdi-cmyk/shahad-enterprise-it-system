"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import type { UserRole } from "@/lib/iam/permissions";

type ScopeStatus = "Active" | "Maintenance";
type LeaseStatus = "Active" | "Reserved";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type Scope = {
  id: string;
  name: string;
  vlan: string;
  network: string;
  pool: string;
  gateway: string;
  dns: string;
  leases: number;
  capacity: number;
  status: ScopeStatus;
};

type Lease = {
  id: string;
  device: string;
  ip: string;
  mac: string;
  scope: string;
  status: LeaseStatus;
};

const initialScopes: Scope[] = [
  {
    id: "SCOPE-010",
    name: "HR Scope",
    vlan: "VLAN 10",
    network: "10.10.10.0/24",
    pool: "10.10.10.50 - 10.10.10.200",
    gateway: "10.10.10.1",
    dns: "10.10.30.10",
    leases: 34,
    capacity: 151,
    status: "Active",
  },
  {
    id: "SCOPE-020",
    name: "Finance Scope",
    vlan: "VLAN 20",
    network: "10.10.20.0/24",
    pool: "10.10.20.50 - 10.10.20.200",
    gateway: "10.10.20.1",
    dns: "10.10.30.10",
    leases: 28,
    capacity: 151,
    status: "Active",
  },
  {
    id: "SCOPE-030",
    name: "IT Scope",
    vlan: "VLAN 30",
    network: "10.10.30.0/24",
    pool: "10.10.30.50 - 10.10.30.200",
    gateway: "10.10.30.1",
    dns: "10.10.30.10",
    leases: 41,
    capacity: 151,
    status: "Active",
  },
  {
    id: "SCOPE-040",
    name: "Corporate Scope",
    vlan: "VLAN 40",
    network: "10.10.40.0/24",
    pool: "10.10.40.50 - 10.10.40.220",
    gateway: "10.10.40.1",
    dns: "10.10.30.10",
    leases: 72,
    capacity: 171,
    status: "Active",
  },
  {
    id: "SCOPE-050",
    name: "Guest Scope",
    vlan: "VLAN 50",
    network: "10.10.50.0/24",
    pool: "10.10.50.50 - 10.10.50.200",
    gateway: "10.10.50.1",
    dns: "10.10.30.10",
    leases: 18,
    capacity: 151,
    status: "Maintenance",
  },
];

const initialLeases: Lease[] = [
  {
    id: "LEASE-001",
    device: "HR-LT-014",
    ip: "10.10.10.64",
    mac: "A4:7B:9D:21:18:10",
    scope: "HR Scope",
    status: "Active",
  },
  {
    id: "LEASE-002",
    device: "FIN-LT-008",
    ip: "10.10.20.58",
    mac: "90:E2:BA:31:20:08",
    scope: "Finance Scope",
    status: "Active",
  },
  {
    id: "LEASE-003",
    device: "IT-ADMIN-01",
    ip: "10.10.30.55",
    mac: "30:24:32:AA:30:01",
    scope: "IT Scope",
    status: "Reserved",
  },
  {
    id: "LEASE-004",
    device: "CORP-LT-041",
    ip: "10.10.40.91",
    mac: "BC:24:11:49:40:41",
    scope: "Corporate Scope",
    status: "Active",
  },
];

const DHCP_SCOPES_KEY = "enterpriseDhcpScopes";
const DHCP_LEASES_KEY = "enterpriseDhcpLeases";

export default function DhcpManagementPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [scopes, setScopes] =
    useState<Scope[]>(initialScopes);

  const [leases, setLeases] =
    useState<Lease[]>(initialLeases);

  const [dataLoaded, setDataLoaded] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showReservation, setShowReservation] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [device, setDevice] =
    useState("");

  const [ip, setIp] =
    useState("");

  const [mac, setMac] =
    useState("");

  const [scope, setScope] =
    useState("IT Scope");

  const canManageDhcp =
    currentUser?.role === "IT Admin";

  /*
   * Load and validate logged-in user.
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
        parsedUser.role !== "IT Admin" &&
        parsedUser.role !== "IT Support"
      ) {
        router.replace("/dashboard");
        return;
      }

      setCurrentUser(parsedUser);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  /*
   * Load saved DHCP data.
   */
  useEffect(() => {
    const savedScopes =
      window.localStorage.getItem(
        DHCP_SCOPES_KEY,
      );

    const savedLeases =
      window.localStorage.getItem(
        DHCP_LEASES_KEY,
      );

    if (savedScopes) {
      try {
        const parsedScopes =
          JSON.parse(
            savedScopes,
          ) as Scope[];

        if (
          Array.isArray(
            parsedScopes,
          )
        ) {
          setScopes(
            parsedScopes,
          );
        }
      } catch {
        setScopes(
          initialScopes,
        );
      }
    }

    if (savedLeases) {
      try {
        const parsedLeases =
          JSON.parse(
            savedLeases,
          ) as Lease[];

        if (
          Array.isArray(
            parsedLeases,
          )
        ) {
          setLeases(
            parsedLeases,
          );
        }
      } catch {
        setLeases(
          initialLeases,
        );
      }
    }

    setDataLoaded(true);
  }, []);

  /*
   * Save DHCP scopes.
   */
  useEffect(() => {
    if (!dataLoaded) return;

    window.localStorage.setItem(
      DHCP_SCOPES_KEY,
      JSON.stringify(
        scopes,
      ),
    );
  }, [scopes, dataLoaded]);

  /*
   * Save leases and reservations.
   */
  useEffect(() => {
    if (!dataLoaded) return;

    window.localStorage.setItem(
      DHCP_LEASES_KEY,
      JSON.stringify(
        leases,
      ),
    );
  }, [leases, dataLoaded]);

  const totalLeases =
    scopes.reduce(
      (total, item) =>
        total +
        item.leases,
      0,
    );

  const totalCapacity =
    scopes.reduce(
      (total, item) =>
        total +
        item.capacity,
      0,
    );

  const utilization =
    totalCapacity > 0
      ? Math.round(
          (totalLeases /
            totalCapacity) *
            100,
        )
      : 0;

  const reservations =
    leases.filter(
      (item) =>
        item.status ===
        "Reserved",
    ).length;

  const filteredLeases =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return leases;
      }

      return leases.filter(
        (lease) =>
          [
            lease.device,
            lease.ip,
            lease.mac,
            lease.scope,
            lease.status,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(
                query,
              ),
          ),
      );
    }, [leases, search]);

  /*
   * Enable / maintenance DHCP scope.
   * IT Admin only.
   */
  function toggleScope(
    id: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageDhcp
    ) {
      setMessage(
        "You do not have permission to change DHCP scope status.",
      );
      return;
    }

    setScopes(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  status:
                    item.status ===
                    "Active"
                      ? "Maintenance"
                      : "Active",
                }
              : item,
        ),
    );

    setMessage(
      "DHCP scope status updated successfully.",
    );
  }

  /*
   * Simulate reserved client requesting
   * its DHCP address.
   * IT Admin only.
   */
  function simulateClientRequest(
    id: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageDhcp
    ) {
      setMessage(
        "You do not have permission to simulate DHCP client requests.",
      );
      return;
    }

    const selectedLease =
      leases.find(
        (lease) =>
          lease.id === id,
      );

    if (!selectedLease) {
      setMessage(
        "DHCP reservation was not found.",
      );
      return;
    }

    if (
      selectedLease.status !==
      "Reserved"
    ) {
      setMessage(
        "This client already has an active DHCP lease.",
      );
      return;
    }

    const selectedScope =
      scopes.find(
        (item) =>
          item.name ===
          selectedLease.scope,
      );

    if (!selectedScope) {
      setMessage(
        "The DHCP scope for this reservation was not found.",
      );
      return;
    }

    if (
      selectedScope.status !==
      "Active"
    ) {
      setMessage(
        "Client request failed because the DHCP scope is not active.",
      );
      return;
    }

    setLeases(
      (current) =>
        current.map(
          (lease) =>
            lease.id === id
              ? {
                  ...lease,
                  status:
                    "Active",
                }
              : lease,
        ),
    );

    setMessage(
      "Client DHCP request simulated successfully. Reserved address is now active.",
    );
  }

  /*
   * Create a DHCP reservation.
   * IT Admin only.
   */
  function createReservation(
    event: FormEvent,
  ) {
    event.preventDefault();
    setMessage("");

    if (
      !currentUser ||
      !canManageDhcp
    ) {
      setMessage(
        "You do not have permission to create DHCP reservations.",
      );
      return;
    }

    if (
      !device.trim() ||
      !ip.trim() ||
      !mac.trim()
    ) {
      setMessage(
        "Complete all reservation fields.",
      );
      return;
    }

    const macPattern =
      /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

    if (
      !macPattern.test(
        mac.trim(),
      )
    ) {
      setMessage(
        "Enter a valid MAC address.",
      );
      return;
    }

    const duplicateIp =
      leases.some(
        (lease) =>
          lease.ip ===
          ip.trim(),
      );

    if (duplicateIp) {
      setMessage(
        "This IP address is already assigned.",
      );
      return;
    }

    const duplicateMac =
      leases.some(
        (lease) =>
          lease.mac
            .toLowerCase() ===
          mac
            .trim()
            .toLowerCase(),
      );

    if (duplicateMac) {
      setMessage(
        "This MAC address already has a lease.",
      );
      return;
    }

    const selectedScope =
      scopes.find(
        (item) =>
          item.name ===
          scope,
      );

    if (!selectedScope) {
      setMessage(
        "Selected DHCP scope was not found.",
      );
      return;
    }

    const networkPrefix =
      selectedScope.network
        .split("/")[0]
        .split(".")
        .slice(0, 3)
        .join(".");

    if (
      !ip
        .trim()
        .startsWith(
          `${networkPrefix}.`,
        )
    ) {
      setMessage(
        `Reserved IP must belong to ${selectedScope.network}.`,
      );
      return;
    }

    const lastOctet =
      Number(
        ip
          .trim()
          .split(".")[3],
      );

    if (
      Number.isNaN(
        lastOctet,
      ) ||
      lastOctet < 1 ||
      lastOctet > 254
    ) {
      setMessage(
        "Enter a valid IPv4 address.",
      );
      return;
    }

    const nextNumber =
      Math.max(
        0,
        ...leases.map(
          (lease) => {
            const number =
              Number(
                lease.id.replace(
                  "LEASE-",
                  "",
                ),
              );

            return Number.isNaN(
              number,
            )
              ? 0
              : number;
          },
        ),
      ) + 1;

    const newLease: Lease = {
      id: `LEASE-${String(
        nextNumber,
      ).padStart(
        3,
        "0",
      )}`,
      device:
        device.trim(),
      ip:
        ip.trim(),
      mac:
        mac
          .trim()
          .toUpperCase(),
      scope,
      status:
        "Reserved",
    };

    setLeases(
      (current) => [
        ...current,
        newLease,
      ],
    );

    setDevice("");
    setIp("");
    setMac("");
    setScope(
      "IT Scope",
    );
    setShowReservation(
      false,
    );

    setMessage(
      "DHCP reservation created successfully.",
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading DHCP Management...
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
                DHCP Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage DHCP scopes, IP address pools,
                active leases, reservations, gateways,
                and DNS assignments across enterprise VLANs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/windows-server"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/5"
              >
                Server Dashboard
              </Link>

              <Link
                href="/windows-server/dns"
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400"
              >
                DNS
              </Link>

              {canManageDhcp && (
                <button
                  type="button"
                  onClick={() => {
                    setShowReservation(
                      (current) =>
                        !current,
                    );

                    setMessage("");
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  + New Reservation
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="DHCP Scopes"
              value={
                scopes.length
              }
              subtitle="VLAN-based scopes"
            />

            <KpiCard
              title="Active Leases"
              value={
                totalLeases
              }
              subtitle="Assigned client addresses"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Reservations"
              value={
                reservations
              }
              subtitle="Fixed DHCP assignments"
              valueClass="text-purple-400"
            />

            <KpiCard
              title="Pool Utilization"
              value={`${utilization}%`}
              subtitle={`${totalLeases} of ${totalCapacity} addresses`}
              valueClass="text-blue-400"
            />
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">
              DHCP Scopes
            </h2>

            <p className="mt-2 text-gray-400">
              Address pools mapped to the enterprise VLAN architecture.
            </p>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              {scopes.map(
                (item) => {
                  const used =
                    Math.round(
                      (item.leases /
                        item.capacity) *
                        100,
                    );

                  return (
                    <div
                      key={
                        item.id
                      }
                      className="rounded-2xl border border-white/10 bg-zinc-900 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                            {
                              item.vlan
                            }{" "}
                            •{" "}
                            {
                              item.id
                            }
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            {
                              item.name
                            }
                          </h3>

                          <p className="mt-1 font-mono text-sm text-gray-500">
                            {
                              item.network
                            }
                          </p>
                        </div>

                        <ScopeBadge
                          status={
                            item.status
                          }
                        />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <SmallStat
                          label="Gateway"
                          value={
                            item.gateway
                          }
                        />

                        <SmallStat
                          label="DNS"
                          value={
                            item.dns
                          }
                        />

                        <SmallStat
                          label="Leases"
                          value={`${item.leases} / ${item.capacity}`}
                        />
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            Address pool utilization
                          </span>

                          <span>
                            {
                              used
                            }
                            %
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-950">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${used}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950 p-4">
                        <p className="text-xs text-gray-600">
                          Dynamic IP Pool
                        </p>

                        <p className="mt-1 font-mono text-sm text-gray-300">
                          {
                            item.pool
                          }
                        </p>
                      </div>

                      {canManageDhcp ? (
                        <button
                          type="button"
                          onClick={() =>
                            toggleScope(
                              item.id,
                            )
                          }
                          className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                        >
                          Toggle Scope Status
                        </button>
                      ) : (
                        <p className="mt-5 text-sm text-gray-500">
                          View only
                        </p>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </section>

          {canManageDhcp &&
            showReservation && (
              <form
                onSubmit={
                  createReservation
                }
                className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
              >
                <h2 className="text-2xl font-semibold">
                  Create DHCP Reservation
                </h2>

                <p className="mt-2 text-gray-400">
                  Reserve a fixed IP address for a known enterprise device.
                </p>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <Field
                    label="Device Name"
                    value={
                      device
                    }
                    onChange={
                      setDevice
                    }
                    placeholder="IT-PRINTER-01"
                  />

                  <Field
                    label="Reserved IP"
                    value={ip}
                    onChange={
                      setIp
                    }
                    placeholder="10.10.30.60"
                  />

                  <Field
                    label="MAC Address"
                    value={mac}
                    onChange={
                      setMac
                    }
                    placeholder="AA:BB:CC:DD:EE:FF"
                  />

                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      DHCP Scope
                    </span>

                    <select
                      value={
                        scope
                      }
                      onChange={(
                        event,
                      ) =>
                        setScope(
                          event.target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      {scopes.map(
                        (item) => (
                          <option
                            key={
                              item.id
                            }
                            value={
                              item.name
                            }
                          >
                            {
                              item.name
                            }{" "}
                            (
                            {
                              item.vlan
                            }
                            )
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                  >
                    Create Reservation
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowReservation(
                        false,
                      )
                    }
                    className="rounded-xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/5"
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
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {message}
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  DHCP Leases & Reservations
                </h2>

                <p className="mt-2 text-gray-400">
                  Track dynamically assigned and reserved addresses.
                </p>
              </div>

              <input
                type="search"
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search leases..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 md:max-w-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Device
                    </th>

                    <th className="px-4 py-4">
                      IP Address
                    </th>

                    <th className="px-4 py-4">
                      MAC Address
                    </th>

                    <th className="px-4 py-4">
                      Scope
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
                  {filteredLeases.map(
                    (lease) => (
                      <tr
                        key={
                          lease.id
                        }
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-blue-400">
                            {
                              lease.device
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {
                              lease.id
                            }
                          </p>
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {
                            lease.ip
                          }
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-400">
                          {
                            lease.mac
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            lease.scope
                          }
                        </td>

                        <td className="px-4 py-5">
                          <LeaseBadge
                            status={
                              lease.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5 text-right">
                          {lease.status ===
                          "Reserved" ? (
                            canManageDhcp ? (
                              <button
                                type="button"
                                onClick={() =>
                                  simulateClientRequest(
                                    lease.id,
                                  )
                                }
                                className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400 transition hover:bg-green-500/20"
                              >
                                Simulate Client Request
                              </button>
                            ) : (
                              <span className="text-sm text-gray-500">
                                View only
                              </span>
                            )
                          ) : (
                            <span className="text-sm font-medium text-green-400">
                              Client Connected
                            </span>
                          )}
                        </td>
                      </tr>
                    ),
                  )}

                  {filteredLeases.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No DHCP leases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
  value: number | string;
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

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-3">
      <p className="text-xs text-gray-600">
        {label}
      </p>

      <p className="mt-1 font-mono text-sm font-semibold text-gray-300">
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
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-gray-400">
        {label}
      </span>

      <input
        value={value}
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
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function ScopeBadge({
  status,
}: {
  status: ScopeStatus;
}) {
  const classes =
    status === "Active"
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

function LeaseBadge({
  status,
}: {
  status: LeaseStatus;
}) {
  const classes =
    status === "Active"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-purple-500/30 bg-purple-500/10 text-purple-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}
