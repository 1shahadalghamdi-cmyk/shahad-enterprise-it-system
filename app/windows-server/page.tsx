"use client";

import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

type ServerStatus = "Online" | "Warning" | "Offline";

type Server = {
  name: string;
  role: string;
  ip: string;
  os: string;
  status: ServerStatus;
};

const servers: Server[] = [
  {
    name: "DC01",
    role: "Domain Controller / DNS",
    ip: "10.10.30.10",
    os: "Windows Server 2022",
    status: "Online",
  },
  {
    name: "DC02",
    role: "Secondary Domain Controller",
    ip: "10.10.30.11",
    os: "Windows Server 2022",
    status: "Online",
  },
  {
    name: "DHCP01",
    role: "DHCP Server",
    ip: "10.10.30.20",
    os: "Windows Server 2022",
    status: "Online",
  },
  {
    name: "FILE01",
    role: "File Server",
    ip: "10.10.30.30",
    os: "Windows Server 2022",
    status: "Warning",
  },
];

const services = [
  {
    title: "Active Directory Domain Services",
    value: "enterprise.local",
    detail: "Primary enterprise domain",
  },
  {
    title: "DNS Zones",
    value: "4",
    detail: "Forward and reverse lookup zones",
  },
  {
    title: "DHCP Scopes",
    value: "5",
    detail: "VLAN-based address scopes",
  },
  {
    title: "Group Policies",
    value: "8",
    detail: "Linked enterprise GPOs",
  },
];

export default function WindowsServerDashboardPage() {
  const onlineServers = servers.filter(
    (server) => server.status === "Online",
  ).length;

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
                Windows Server Administration
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage enterprise domain services, DNS, DHCP,
                Group Policy, and Windows Server infrastructure.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/windows-server/dns"
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                DNS
              </Link>

              <Link
                href="/windows-server/dhcp"
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/20"
              >
                DHCP
              </Link>

              <Link
                href="/windows-server/gpo"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
              >
                Group Policy
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Windows Servers"
              value={servers.length}
              subtitle="Managed infrastructure"
            />

            <KpiCard
              title="Online"
              value={onlineServers}
              subtitle="Healthy servers"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Domain Controllers"
              value={2}
              subtitle="AD DS redundancy"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Domain"
              value="enterprise.local"
              subtitle="Active Directory forest"
              valueClass="text-purple-400"
            />
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">
              Core Services
            </h2>

            <p className="mt-2 text-gray-400">
              Key Windows Server roles supporting the enterprise.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-2xl border border-white/10 bg-zinc-900 p-6"
                >
                  <p className="text-sm text-gray-400">
                    {service.title}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-blue-400">
                    {service.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {service.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Server Inventory
              </h2>

              <p className="mt-2 text-gray-400">
                Current Windows Server roles and operational status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Server</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">IP Address</th>
                    <th className="px-4 py-4">Operating System</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {servers.map((server) => (
                    <tr
                      key={server.name}
                      className="transition hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5 font-semibold text-blue-400">
                        {server.name}
                      </td>

                      <td className="px-4 py-5 text-gray-300">
                        {server.role}
                      </td>

                      <td className="px-4 py-5 font-mono text-sm text-gray-300">
                        {server.ip}
                      </td>

                      <td className="px-4 py-5 text-gray-300">
                        {server.os}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={server.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Infrastructure Architecture
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Node label="Client Devices" />
              <Arrow />
              <Node label="DHCP" />
              <Arrow />
              <Node label="DNS" />
              <Arrow />
              <Node label="Active Directory" />
              <Arrow />
              <Node label="Group Policy" />
            </div>

            <p className="mt-5 leading-7 text-gray-400">
              Enterprise endpoints receive IP configuration from DHCP,
              resolve internal resources through DNS, authenticate against
              Active Directory, and receive configuration through Group Policy.
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
  value: number | string;
  subtitle: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`mt-3 text-3xl font-bold ${valueClass}`}>
        {value}
      </p>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ServerStatus;
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

function Node({ label }: { label: string }) {
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