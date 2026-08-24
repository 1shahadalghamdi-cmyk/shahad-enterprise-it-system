"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

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

type DeviceType =
  | "Router"
  | "Core Switch"
  | "Access Switch"
  | "Firewall"
  | "Access Point";

type DeviceStatus =
  | "Online"
  | "Warning"
  | "Offline";

type NetworkDevice = {
  id: string;
  name: string;
  type: DeviceType;
  ip: string;
  location: string;
  vendor?: string;
  model?: string;
  status: DeviceStatus;
};

type VlanStatus =
  | "Active"
  | "Maintenance";

type Vlan = {
  id: number;
  name: string;
  subnet: string;
  gateway: string;
  department: string;
  devices: number;
  status: VlanStatus;
};

const initialDevices: NetworkDevice[] = [
  {
    id: "NET-001",
    name: "EDGE-RTR-01",
    type: "Router",
    ip: "10.10.0.1",
    location: "Server Room",
    vendor: "Cisco",
    model: "ISR 4331",
    status: "Online",
  },
  {
    id: "NET-002",
    name: "CORE-SW-01",
    type: "Core Switch",
    ip: "10.10.0.2",
    location: "Server Room",
    vendor: "Cisco",
    model: "Catalyst 9300",
    status: "Online",
  },
  {
    id: "NET-003",
    name: "FW-01",
    type: "Firewall",
    ip: "10.10.0.3",
    location: "Server Room",
    vendor: "Cisco",
    model: "Firepower 1120",
    status: "Online",
  },
  {
    id: "NET-004",
    name: "ACC-SW-HR-01",
    type: "Access Switch",
    ip: "10.10.10.2",
    location: "HR Floor",
    vendor: "Cisco",
    model: "Catalyst 9200",
    status: "Online",
  },
  {
    id: "NET-005",
    name: "ACC-SW-FIN-01",
    type: "Access Switch",
    ip: "10.10.20.2",
    location: "Finance Floor",
    vendor: "Cisco",
    model: "Catalyst 9200",
    status: "Warning",
  },
  {
    id: "NET-006",
    name: "AP-OFFICE-01",
    type: "Access Point",
    ip: "10.10.40.10",
    location: "Main Office",
    vendor: "Cisco",
    model: "Catalyst 9115",
    status: "Online",
  },
];

const initialVlans: Vlan[] = [
  {
    id: 10,
    name: "HR",
    subnet: "10.10.10.0/24",
    gateway: "10.10.10.1",
    department: "Human Resources",
    devices: 34,
    status: "Active",
  },
  {
    id: 20,
    name: "Finance",
    subnet: "10.10.20.0/24",
    gateway: "10.10.20.1",
    department: "Finance",
    devices: 28,
    status: "Active",
  },
  {
    id: 30,
    name: "IT",
    subnet: "10.10.30.0/24",
    gateway: "10.10.30.1",
    department: "Information Technology",
    devices: 41,
    status: "Active",
  },
  {
    id: 40,
    name: "Corporate",
    subnet: "10.10.40.0/24",
    gateway: "10.10.40.1",
    department: "Corporate Users",
    devices: 72,
    status: "Active",
  },
  {
    id: 50,
    name: "Guest",
    subnet: "10.10.50.0/24",
    gateway: "10.10.50.1",
    department: "Guest Network",
    devices: 18,
    status: "Maintenance",
  },
];

export default function NetworkDashboardPage() {
  const [search, setSearch] =
    useState("");

  const [devices, setDevices] =
    useState<NetworkDevice[]>(
      initialDevices,
    );

  const [vlans, setVlans] =
    useState<Vlan[]>(
      initialVlans,
    );

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(
      null,
    );

  useEffect(() => {
    const savedDevices =
      window.localStorage.getItem(
        "networkDevices",
      );

    if (savedDevices) {
      try {
        const parsedDevices =
          JSON.parse(
            savedDevices,
          ) as NetworkDevice[];

        if (
          Array.isArray(
            parsedDevices,
          )
        ) {
          setDevices(
            parsedDevices,
          );
        }
      } catch {
        setDevices(
          initialDevices,
        );
      }
    }

    const savedVlans =
      window.localStorage.getItem(
        "networkVlans",
      );

    if (savedVlans) {
      try {
        const parsedVlans =
          JSON.parse(
            savedVlans,
          ) as Vlan[];

        if (
          Array.isArray(
            parsedVlans,
          )
        ) {
          setVlans(
            parsedVlans,
          );
        }
      } catch {
        setVlans(
          initialVlans,
        );
      }
    }

    const savedUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedUser) {
      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          savedUser,
        ) as CurrentUser;

      setCurrentUser(
        parsedUser,
      );
    } catch {
      setCurrentUser(
        null,
      );
    }
  }, []);

  const canManageNetwork =
    currentUser?.role ===
    "IT Admin";

  const filteredDevices =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return devices;
      }

      return devices.filter(
        (device) =>
          device.name
            .toLowerCase()
            .includes(query) ||
          device.type
            .toLowerCase()
            .includes(query) ||
          device.ip
            .toLowerCase()
            .includes(query) ||
          device.location
            .toLowerCase()
            .includes(query),
      );
    }, [devices, search]);

  const onlineDevices =
    devices.filter(
      (device) =>
        device.status ===
        "Online",
    ).length;

  const warningDevices =
    devices.filter(
      (device) =>
        device.status ===
        "Warning",
    ).length;

  const assignedIps =
    vlans.reduce(
      (sum, vlan) =>
        sum +
        vlan.devices,
      0,
    );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Enterprise Network Architecture
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Network Operations Center
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Monitor enterprise network
                infrastructure, VLAN
                segmentation, Cisco devices,
                and IP addressing.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/network/vlans"
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                {canManageNetwork
                  ? "Manage VLANs"
                  : "View VLANs"}
              </Link>

              <Link
                href="/network/ip-addressing"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
              >
                IP Addressing
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Network Devices"
              value={
                devices.length
              }
              subtitle="Managed infrastructure"
            />

            <KpiCard
              title="Online"
              value={
                onlineDevices
              }
              subtitle="Healthy devices"
              valueClass="text-green-400"
            />

            <KpiCard
              title="VLANs"
              value={
                vlans.length
              }
              subtitle="Network segments"
              valueClass="text-purple-400"
            />

            <KpiCard
              title="Assigned IPs"
              value={
                assignedIps
              }
              subtitle="Active endpoints"
              valueClass={
                warningDevices > 0
                  ? "text-yellow-400"
                  : "text-blue-400"
              }
            />
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Logical Topology
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Enterprise Network Flow
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <TopologyNode
                  label="Internet"
                />
                <Arrow />
                <TopologyNode
                  label="Firewall"
                />
                <Arrow />
                <TopologyNode
                  label="Core Switch"
                />
                <Arrow />
                <TopologyNode
                  label="VLANs"
                />
                <Arrow />
                <TopologyNode
                  label="Endpoints"
                />
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Network Devices
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Cisco-style
                    infrastructure
                    inventory and health.
                  </p>
                </div>

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Search devices..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 md:max-w-xs"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                    <tr>
                      <th className="px-6 py-4">
                        Device
                      </th>

                      <th className="px-4 py-4">
                        Type
                      </th>

                      <th className="px-4 py-4">
                        Management IP
                      </th>

                      <th className="px-4 py-4">
                        Location
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredDevices.map(
                      (device) => (
                        <tr
                          key={
                            device.id
                          }
                          className="transition hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5">
                            <p className="font-semibold text-blue-400">
                              {
                                device.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {
                                device.id
                              }
                            </p>
                          </td>

                          <td className="px-4 py-5 text-gray-300">
                            {
                              device.type
                            }
                          </td>

                          <td className="px-4 py-5 font-mono text-sm text-gray-300">
                            {
                              device.ip
                            }
                          </td>

                          <td className="px-4 py-5 text-gray-300">
                            {
                              device.location
                            }
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge
                              status={
                                device.status
                              }
                            />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-white/10 p-5">
                <Link
                  href="/network/devices"
                  className="font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  View all network devices →
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900">
              <div className="border-b border-white/10 p-6">
                <h2 className="text-2xl font-semibold">
                  VLAN Overview
                </h2>

                <p className="mt-2 text-gray-400">
                  Department network
                  segmentation.
                </p>
              </div>

              <div className="divide-y divide-white/5">
                {vlans.map(
                  (vlan) => (
                    <div
                      key={
                        vlan.id
                      }
                      className="p-5 transition hover:bg-white/[0.03]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            VLAN{" "}
                            {
                              vlan.id
                            }{" "}
                            —{" "}
                            {
                              vlan.name
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              vlan.department
                            }
                          </p>
                        </div>

                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                          {
                            vlan.devices
                          }{" "}
                          devices
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <NetworkValue
                          label="Subnet"
                          value={
                            vlan.subnet
                          }
                        />

                        <NetworkValue
                          label="Gateway"
                          value={
                            vlan.gateway
                          }
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="border-t border-white/10 p-5">
                <Link
                  href="/network/vlans"
                  className="font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  {canManageNetwork
                    ? "Manage VLANs →"
                    : "View VLANs →"}
                </Link>
              </div>
            </section>
          </div>
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
  value: number;
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
  status:
    NetworkDevice["status"];
}) {
  const classes =
    status === "Online"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : status === "Warning"
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

function TopologyNode({
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

function NetworkValue({
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

      <p className="mt-1 font-mono text-xs text-gray-300">
        {value}
      </p>
    </div>
  );
}
