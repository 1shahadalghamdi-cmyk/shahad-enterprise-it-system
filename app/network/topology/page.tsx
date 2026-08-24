"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

type VlanStatus =
  | "Active"
  | "Maintenance";

type Vlan = {
  id: number;
  name: string;
  department: string;
  subnet: string;
  gateway: string;
  devices: number;
  status: VlanStatus;
};

const initialVlans: Vlan[] = [
  {
    id: 10,
    name: "HR",
    department: "Human Resources",
    subnet: "10.10.10.0/24",
    gateway: "10.10.10.1",
    devices: 34,
    status: "Active",
  },
  {
    id: 20,
    name: "Finance",
    department: "Finance",
    subnet: "10.10.20.0/24",
    gateway: "10.10.20.1",
    devices: 28,
    status: "Active",
  },
  {
    id: 30,
    name: "IT",
    department: "Information Technology",
    subnet: "10.10.30.0/24",
    gateway: "10.10.30.1",
    devices: 41,
    status: "Active",
  },
  {
    id: 40,
    name: "Corporate",
    department: "Corporate Users",
    subnet: "10.10.40.0/24",
    gateway: "10.10.40.1",
    devices: 72,
    status: "Active",
  },
  {
    id: 50,
    name: "Guest",
    department: "Guest Network",
    subnet: "10.10.50.0/24",
    gateway: "10.10.50.1",
    devices: 18,
    status: "Active",
  },
];

export default function NetworkTopologyPage() {
  const [vlans, setVlans] =
    useState<Vlan[]>(initialVlans);

  useEffect(() => {
    const savedVlans =
      window.localStorage.getItem(
        "networkVlans",
      );

    if (!savedVlans) {
      return;
    }

    try {
      const parsedVlans =
        JSON.parse(
          savedVlans,
        ) as Vlan[];

      if (Array.isArray(parsedVlans)) {
        setVlans(parsedVlans);
      }
    } catch {
      setVlans(initialVlans);
    }
  }, []);

  const segmentationDetail =
    vlans.length > 0
      ? `Separates ${vlans
          .map((vlan) => vlan.name)
          .join(", ")} traffic.`
      : "No VLAN segments configured.";

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
                Network Topology
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Logical enterprise topology showing internet edge,
                firewall protection, core switching, VLAN segmentation,
                and endpoint networks.
              </p>
            </div>

            <Link
              href="/network"
              className="rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/5"
            >
              Network Dashboard
            </Link>
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div className="text-center">
              <Node
                title="Internet"
                subtitle="ISP / WAN"
                accent="cyan"
              />

              <Connector />

              <Node
                title="EDGE-RTR-01"
                subtitle="Cisco ISR 4331 • 10.10.0.1"
                accent="blue"
              />

              <Connector />

              <Node
                title="FW-01"
                subtitle="Cisco Firepower 1120 • 10.10.0.3"
                accent="red"
              />

              <Connector />

              <Node
                title="CORE-SW-01"
                subtitle="Cisco Catalyst 9300 • 10.10.0.2"
                accent="purple"
              />

              <div className="mx-auto h-10 w-px bg-white/15" />

              <div className="mx-auto mb-5 h-px max-w-5xl bg-white/15" />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {vlans.map((vlan) => (
                  <div
                    key={vlan.id}
                    className="rounded-2xl border border-blue-500/20 bg-zinc-950 p-5 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                          VLAN {vlan.id}
                        </p>

                        <h3 className="mt-2 text-xl font-bold">
                          {vlan.name}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          vlan.status ===
                          "Active"
                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                            : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                        }`}
                      >
                        {vlan.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                      {vlan.department}
                    </p>

                    <p className="mt-3 font-mono text-xs text-gray-500">
                      {vlan.subnet}
                    </p>

                    <div className="mt-4 rounded-xl border border-white/10 bg-zinc-900 p-3">
                      <p className="text-xs text-gray-500">
                        Endpoints
                      </p>

                      <p className="mt-1 text-lg font-bold text-green-400">
                        {vlan.devices}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="WAN Edge"
              value="EDGE-RTR-01"
              detail="Routes enterprise traffic to the ISP."
            />

            <InfoCard
              title="Security Boundary"
              value="FW-01"
              detail="Protects internal networks from external traffic."
            />

            <InfoCard
              title="Core Layer"
              value="CORE-SW-01"
              detail="Provides central switching and VLAN connectivity."
            />

            <InfoCard
              title="Segmentation"
              value={`${vlans.length} VLANs`}
              detail={segmentationDetail}
            />
          </div>

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Architecture Notes
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Note>
                Department traffic is segmented using VLANs to reduce
                broadcast scope and improve security.
              </Note>

              <Note>
                Inter-VLAN traffic passes through controlled routing
                and security policies.
              </Note>

              <Note>
                Infrastructure devices use dedicated management IP
                addresses for administration and monitoring.
              </Note>

              <Note>
                Guest traffic is isolated from internal enterprise
                resources.
              </Note>
            </div>
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/network/devices"
              className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400"
            >
              Network Devices
            </Link>

            <Link
              href="/network/vlans"
              className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-300"
            >
              VLAN Management
            </Link>

            <Link
              href="/network/ip-addressing"
              className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 font-semibold text-green-400"
            >
              IP Addressing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Connector() {
  return (
    <div className="mx-auto h-10 w-px bg-white/20" />
  );
}

function Node({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent:
    | "cyan"
    | "blue"
    | "red"
    | "purple";
}) {
  const classes = {
    cyan:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    blue:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",
    red:
      "border-red-500/30 bg-red-500/10 text-red-300",
    purple:
      "border-purple-500/30 bg-purple-500/10 text-purple-300",
  };

  return (
    <div
      className={`mx-auto max-w-sm rounded-2xl border p-5 ${classes[accent]}`}
    >
      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm opacity-75">
        {subtitle}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-blue-400">
        {value}
      </p>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        {detail}
      </p>
    </div>
  );
}

function Note({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm leading-6 text-gray-300">
      {children}
    </div>
  );
}