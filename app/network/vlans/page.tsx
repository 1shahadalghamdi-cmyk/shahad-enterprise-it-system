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

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

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
    status: "Maintenance",
  },
];

export default function VlansPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [vlans, setVlans] =
    useState<Vlan[]>(initialVlans);

  const [vlansLoaded, setVlansLoaded] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [vlanId, setVlanId] =
    useState("");

  const [name, setName] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [subnet, setSubnet] =
    useState("");

  const [gateway, setGateway] =
    useState("");

  const canManageNetwork =
    currentUser?.role === "IT Admin";

  // Load current user
  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          savedCurrentUser,
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

  // Load VLANs from localStorage
  useEffect(() => {
    const savedVlans =
      window.localStorage.getItem(
        "networkVlans",
      );

    if (savedVlans) {
      try {
        const parsedVlans =
          JSON.parse(savedVlans) as Vlan[];

        setVlans(parsedVlans);
      } catch {
        setVlans(initialVlans);
      }
    }

    setVlansLoaded(true);
  }, []);

  // Save VLANs whenever they change
  useEffect(() => {
    if (!vlansLoaded) {
      return;
    }

    window.localStorage.setItem(
      "networkVlans",
      JSON.stringify(vlans),
    );
  }, [vlans, vlansLoaded]);

  // Search VLANs
  const filteredVlans =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return vlans;
      }

      return vlans.filter(
        (vlan) =>
          vlan.name
            .toLowerCase()
            .includes(query) ||
          vlan.department
            .toLowerCase()
            .includes(query) ||
          vlan.subnet
            .toLowerCase()
            .includes(query) ||
          vlan.gateway
            .toLowerCase()
            .includes(query) ||
          `vlan ${vlan.id}`.includes(query) ||
          String(vlan.id).includes(query),
      );
    }, [search, vlans]);

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();
    setMessage("");

    if (
      !currentUser ||
      !canManageNetwork
    ) {
      setMessage(
        "You do not have permission to create VLANs.",
      );
      return;
    }

    const numericId =
      Number(vlanId);

    if (
      !vlanId.trim() ||
      !name.trim() ||
      !department.trim() ||
      !subnet.trim() ||
      !gateway.trim() ||
      Number.isNaN(numericId)
    ) {
      setMessage(
        "Complete all VLAN fields.",
      );
      return;
    }

    if (
      vlans.some(
        (vlan) =>
          vlan.id === numericId,
      )
    ) {
      setMessage(
        "VLAN ID already exists.",
      );
      return;
    }

    setVlans((current) => [
      ...current,
      {
        id: numericId,
        name: name.trim(),
        department:
          department.trim(),
        subnet: subnet.trim(),
        gateway: gateway.trim(),
        devices: 0,
        status: "Active",
      },
    ]);

    setVlanId("");
    setName("");
    setDepartment("");
    setSubnet("");
    setGateway("");
    setShowForm(false);

    setMessage(
      "VLAN created successfully.",
    );
  }

  function toggleStatus(
    id: number,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageNetwork
    ) {
      setMessage(
        "You do not have permission to change VLAN status.",
      );
      return;
    }

    setVlans((current) =>
      current.map((vlan) =>
        vlan.id === id
          ? {
              ...vlan,
              status:
                vlan.status === "Active"
                  ? "Maintenance"
                  : "Active",
            }
          : vlan,
      ),
    );

    setMessage(
      "VLAN status updated successfully.",
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading VLAN Management...
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
                Enterprise Network Architecture
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                VLAN Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage logical network
                segmentation for enterprise
                departments, users, and guest
                traffic.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/network"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/5"
              >
                Network Dashboard
              </Link>

              {canManageNetwork && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(
                      (value) => !value,
                    );

                    setMessage("");
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  + New VLAN
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total VLANs"
              value={vlans.length}
              subtitle="Configured segments"
            />

            <KpiCard
              title="Active VLANs"
              value={
                vlans.filter(
                  (vlan) =>
                    vlan.status ===
                    "Active",
                ).length
              }
              subtitle="Operational segments"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Connected Devices"
              value={vlans.reduce(
                (sum, vlan) =>
                  sum + vlan.devices,
                0,
              )}
              subtitle="Across all VLANs"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Maintenance"
              value={
                vlans.filter(
                  (vlan) =>
                    vlan.status ===
                    "Maintenance",
                ).length
              }
              subtitle="Segments under review"
              valueClass="text-yellow-400"
            />
          </div>

          {canManageNetwork &&
            showForm && (
              <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
              >
                <div>
                  <h2 className="text-2xl font-semibold">
                    Create VLAN
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Define a new logical
                    network segment.
                  </p>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                  <Field
                    label="VLAN ID"
                    value={vlanId}
                    onChange={setVlanId}
                    placeholder="60"
                    type="number"
                  />

                  <Field
                    label="Name"
                    value={name}
                    onChange={setName}
                    placeholder="Operations"
                  />

                  <Field
                    label="Department"
                    value={department}
                    onChange={
                      setDepartment
                    }
                    placeholder="Operations"
                  />

                  <Field
                    label="Subnet"
                    value={subnet}
                    onChange={setSubnet}
                    placeholder="10.10.60.0/24"
                  />

                  <Field
                    label="Gateway"
                    value={gateway}
                    onChange={setGateway}
                    placeholder="10.10.60.1"
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                  >
                    Create VLAN
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
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
                  Network Segments
                </h2>

                <p className="mt-2 text-gray-400">
                  VLAN configuration and
                  IP addressing overview.
                </p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search VLANs..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 md:max-w-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      VLAN
                    </th>

                    <th className="px-4 py-4">
                      Department
                    </th>

                    <th className="px-4 py-4">
                      Subnet
                    </th>

                    <th className="px-4 py-4">
                      Gateway
                    </th>

                    <th className="px-4 py-4">
                      Devices
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
                  {filteredVlans.map(
                    (vlan) => (
                      <tr
                        key={vlan.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-blue-400">
                            VLAN {vlan.id}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {vlan.name}
                          </p>
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {vlan.department}
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {vlan.subnet}
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {vlan.gateway}
                        </td>

                        <td className="px-4 py-5">
                          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                            {vlan.devices}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              vlan.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5 text-right">
                          {canManageNetwork ? (
                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(
                                  vlan.id,
                                )
                              }
                              className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                            >
                              Toggle Status
                            </button>
                          ) : (
                            <span className="text-sm text-gray-500">
                              View only
                            </span>
                          )}
                        </td>
                      </tr>
                    ),
                  )}

                  {filteredVlans.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No VLANs found.
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-400">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
      />
    </label>
  );
}

function StatusBadge({
  status,
}: {
  status: VlanStatus;
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
