"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

type Health = "Healthy" | "Warning" | "Critical";
type DeviceType = "Server" | "Network";

type Device = {
  id: string;
  name: string;
  role: string;
  type: DeviceType;
  ip: string;
  cpu: number;
  memory: number;
  storage: number;
  uptime: string;
  lastCheck: string;
  status: Health;
};

type AlertStatus = "Open" | "Acknowledged" | "Resolved";

type StoredAlert = {
  id: string;
  status: AlertStatus;
};

const defaultDevices: Device[] = [
  {
    id: "MON-001",
    name: "DC01",
    role: "Domain Controller / DNS",
    type: "Server",
    ip: "10.10.30.10",
    cpu: 28,
    memory: 46,
    storage: 39,
    uptime: "99.99%",
    lastCheck: "10 sec ago",
    status: "Healthy",
  },
  {
    id: "MON-002",
    name: "DC02",
    role: "Secondary Domain Controller",
    type: "Server",
    ip: "10.10.30.11",
    cpu: 24,
    memory: 41,
    storage: 35,
    uptime: "99.98%",
    lastCheck: "12 sec ago",
    status: "Healthy",
  },
  {
    id: "MON-003",
    name: "DHCP01",
    role: "DHCP Server",
    type: "Server",
    ip: "10.10.30.20",
    cpu: 18,
    memory: 37,
    storage: 31,
    uptime: "99.97%",
    lastCheck: "9 sec ago",
    status: "Healthy",
  },
  {
    id: "MON-004",
    name: "FILE01",
    role: "Enterprise File Server",
    type: "Server",
    ip: "10.10.30.30",
    cpu: 62,
    memory: 76,
    storage: 88,
    uptime: "99.91%",
    lastCheck: "8 sec ago",
    status: "Warning",
  },
  {
    id: "MON-005",
    name: "CORE-SW01",
    role: "Core Layer 3 Switch",
    type: "Network",
    ip: "10.10.30.2",
    cpu: 34,
    memory: 52,
    storage: 20,
    uptime: "99.99%",
    lastCheck: "15 sec ago",
    status: "Healthy",
  },
  {
    id: "MON-006",
    name: "FW01",
    role: "Enterprise Firewall",
    type: "Network",
    ip: "10.10.30.1",
    cpu: 44,
    memory: 58,
    storage: 29,
    uptime: "99.96%",
    lastCheck: "11 sec ago",
    status: "Healthy",
  },
];

const ALERT_STORAGE_KEY = "enterprise-monitoring-alerts";

export default function MonitoringDevicesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | DeviceType>("All");
  const [selectedId, setSelectedId] = useState("MON-001");

  const [devices, setDevices] =
    useState<Device[]>(defaultDevices);

  useEffect(() => {
    const syncDevicesWithAlerts = () => {
      try {
        const storedAlerts =
          localStorage.getItem(ALERT_STORAGE_KEY);

        if (!storedAlerts) {
          setDevices(defaultDevices);
          return;
        }

        const alerts = JSON.parse(
          storedAlerts
        ) as StoredAlert[];

        const fileAlert = alerts.find(
          (alert) => alert.id === "ALT-001"
        );

        setDevices(
          defaultDevices.map((device) => {
            if (device.name !== "FILE01") {
              return device;
            }

            if (fileAlert?.status === "Resolved") {
              return {
                ...device,
                storage: 68,
                status: "Healthy" as Health,
                lastCheck: "Just now",
              };
            }

            return {
              ...device,
              storage: 88,
              status: "Warning" as Health,
            };
          })
        );
      } catch (error) {
        console.error(
          "Failed to synchronize monitored devices:",
          error
        );

        setDevices(defaultDevices);
      }
    };

    syncDevicesWithAlerts();

    window.addEventListener(
      "storage",
      syncDevicesWithAlerts
    );

    window.addEventListener(
      "focus",
      syncDevicesWithAlerts
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncDevicesWithAlerts
      );

      window.removeEventListener(
        "focus",
        syncDevicesWithAlerts
      );
    };
  }, []);

  const selected =
    devices.find(
      (device) => device.id === selectedId
    ) ?? devices[0];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return devices.filter((device) => {
      const matchesType =
        filter === "All" ||
        device.type === filter;

      const matchesSearch =
        !query ||
        [
          device.name,
          device.role,
          device.ip,
          device.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesType && matchesSearch;
    });
  }, [search, filter, devices]);

  const totalDevices = devices.length;

  const totalServers = devices.filter(
    (device) => device.type === "Server"
  ).length;

  const totalNetworkDevices = devices.filter(
    (device) => device.type === "Network"
  ).length;

  const totalHealthy = devices.filter(
    (device) => device.status === "Healthy"
  ).length;

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Infrastructure Monitoring
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Monitored Devices
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Review monitored servers and network
                devices, operational health, utilization,
                availability, and the latest monitoring
                check.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/monitoring"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
              >
                Monitoring Dashboard
              </Link>

              <Link
                href="/monitoring/alerts"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-300 hover:bg-red-500/20"
              >
                Alerts
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Total Devices"
              value={totalDevices}
              subtitle="Monitored infrastructure"
            />

            <Kpi
              title="Servers"
              value={totalServers}
              subtitle="Windows infrastructure"
              valueClass="text-blue-400"
            />

            <Kpi
              title="Network Devices"
              value={totalNetworkDevices}
              subtitle="Core network infrastructure"
              valueClass="text-purple-400"
            />

            <Kpi
              title="Healthy"
              value={totalHealthy}
              subtitle="Operating normally"
              valueClass="text-green-400"
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_0.7fr]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Device Inventory
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Select a monitored system to inspect
                    its current metrics.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={filter}
                    onChange={(event) =>
                      setFilter(
                        event.target.value as
                          | "All"
                          | DeviceType
                      )
                    }
                    className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="All">
                      All Devices
                    </option>

                    <option value="Server">
                      Servers
                    </option>

                    <option value="Network">
                      Network Devices
                    </option>
                  </select>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search devices..."
                    className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                    <tr>
                      <th className="px-6 py-4">
                        Device
                      </th>

                      <th className="px-4 py-4">
                        IP Address
                      </th>

                      <th className="px-4 py-4">
                        CPU
                      </th>

                      <th className="px-4 py-4">
                        Memory
                      </th>

                      <th className="px-4 py-4">
                        Storage
                      </th>

                      <th className="px-4 py-4">
                        Uptime
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filtered.map((device) => (
                      <tr
                        key={device.id}
                        onClick={() =>
                          setSelectedId(device.id)
                        }
                        className={`cursor-pointer transition hover:bg-white/[0.03] ${
                          selected.id === device.id
                            ? "bg-blue-500/[0.07]"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-blue-400">
                            {device.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {device.role}
                          </p>
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {device.ip}
                        </td>

                        <td className="px-4 py-5">
                          <Metric
                            value={device.cpu}
                          />
                        </td>

                        <td className="px-4 py-5">
                          <Metric
                            value={device.memory}
                          />
                        </td>

                        <td className="px-4 py-5">
                          <Metric
                            value={device.storage}
                          />
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {device.uptime}
                        </td>

                        <td className="px-6 py-5">
                          <HealthBadge
                            status={device.status}
                          />
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No monitored devices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="h-fit rounded-2xl border border-blue-500/20 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Device Details
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {selected.name}
              </h2>

              <p className="mt-1 text-gray-400">
                {selected.role}
              </p>

              <div className="mt-6 space-y-3">
                <Detail
                  label="Monitoring ID"
                  value={selected.id}
                />

                <Detail
                  label="Device Type"
                  value={selected.type}
                />

                <Detail
                  label="IP Address"
                  value={selected.ip}
                />

                <Detail
                  label="Uptime"
                  value={selected.uptime}
                />

                <Detail
                  label="Last Check"
                  value={selected.lastCheck}
                />
              </div>

              <div className="mt-6 space-y-5">
                <LargeMetric
                  label="CPU Utilization"
                  value={selected.cpu}
                />

                <LargeMetric
                  label="Memory Utilization"
                  value={selected.memory}
                />

                <LargeMetric
                  label="Storage Utilization"
                  value={selected.storage}
                />
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950 p-4">
                <span className="text-sm text-gray-400">
                  Current Health
                </span>

                <HealthBadge
                  status={selected.status}
                />
              </div>
            </section>
          </div>
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

function Metric({
  value,
}: {
  value: number;
}) {
  const text =
    value >= 85
      ? "text-red-400"
      : value >= 70
        ? "text-yellow-300"
        : "text-green-400";

  return (
    <div className="min-w-[90px]">
      <span
        className={`text-xs font-semibold ${text}`}
      >
        {value}%
      </span>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-950">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

function LargeMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">
          {label}
        </span>

        <span className="font-semibold">
          {value}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-950">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
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

function HealthBadge({
  status,
}: {
  status: Health;
}) {
  const classes =
    status === "Healthy"
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
