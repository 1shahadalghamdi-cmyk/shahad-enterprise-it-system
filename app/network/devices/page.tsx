"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

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
  vendor: string;
  model: string;
  status: DeviceStatus;
};

const STORAGE_KEY = "networkDevices";

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

function loadDevices(): NetworkDevice[] {
  if (typeof window === "undefined") {
    return initialDevices;
  }

  const savedDevices =
    window.localStorage.getItem(STORAGE_KEY);

  if (!savedDevices) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialDevices),
    );

    return initialDevices;
  }

  try {
    const parsedDevices =
      JSON.parse(savedDevices) as NetworkDevice[];

    if (!Array.isArray(parsedDevices)) {
      return initialDevices;
    }

    return parsedDevices;
  } catch {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialDevices),
    );

    return initialDevices;
  }
}

function saveDevices(devices: NetworkDevice[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(devices),
  );
}

export default function NetworkDevicesPage() {
  const [devices, setDevices] =
    useState<NetworkDevice[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [name, setName] =
    useState("");

  const [type, setType] =
    useState<DeviceType>("Access Switch");

  const [ip, setIp] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [vendor, setVendor] =
    useState("Cisco");

  const [model, setModel] =
    useState("");

  useEffect(() => {
    setDevices(loadDevices());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    saveDevices(devices);
  }, [devices, loaded]);

  const filteredDevices = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return devices;
    }

    return devices.filter((device) =>
      [
        device.id,
        device.name,
        device.type,
        device.ip,
        device.location,
        device.vendor,
        device.model,
        device.status,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [devices, search]);

  const online = devices.filter(
    (device) =>
      device.status === "Online",
  ).length;

  const warnings = devices.filter(
    (device) =>
      device.status === "Warning",
  ).length;

  const offline = devices.filter(
    (device) =>
      device.status === "Offline",
  ).length;

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();
    setMessage("");

    if (
      !name.trim() ||
      !ip.trim() ||
      !location.trim() ||
      !vendor.trim() ||
      !model.trim()
    ) {
      setMessage(
        "Complete all device fields.",
      );
      return;
    }

    if (
      devices.some(
        (device) =>
          device.ip.toLowerCase() ===
          ip.trim().toLowerCase(),
      )
    ) {
      setMessage(
        "Management IP already exists.",
      );
      return;
    }

    const nextNumber =
      Math.max(
        0,
        ...devices.map((device) => {
          const number = Number(
            device.id.replace(
              "NET-",
              "",
            ),
          );

          return Number.isNaN(number)
            ? 0
            : number;
        }),
      ) + 1;

    const newDevice: NetworkDevice = {
      id: `NET-${String(
        nextNumber,
      ).padStart(3, "0")}`,
      name: name.trim(),
      type,
      ip: ip.trim(),
      location: location.trim(),
      vendor: vendor.trim(),
      model: model.trim(),
      status: "Online",
    };

    setDevices((current) => [
      ...current,
      newDevice,
    ]);

    setName("");
    setType("Access Switch");
    setIp("");
    setLocation("");
    setVendor("Cisco");
    setModel("");
    setShowForm(false);

    setMessage(
      "Network device added successfully.",
    );
  }

  function cycleStatus(id: string) {
    setDevices((current) =>
      current.map((device) => {
        if (device.id !== id) {
          return device;
        }

        const nextStatus: DeviceStatus =
          device.status === "Online"
            ? "Warning"
            : device.status === "Warning"
              ? "Offline"
              : "Online";

        return {
          ...device,
          status: nextStatus,
        };
      }),
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
                Network Devices
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage routers, switches,
                firewalls, wireless access
                points, management IPs, and
                device health.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/network"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/5"
              >
                Network Dashboard
              </Link>

              <Link
                href="/network/vlans"
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                VLANs
              </Link>

              <button
                type="button"
                onClick={() => {
                  setShowForm(
                    (current) =>
                      !current,
                  );
                  setMessage("");
                }}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
              >
                + Add Device
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Network Devices"
              value={devices.length}
              subtitle="Managed infrastructure"
            />

            <KpiCard
              title="Online"
              value={online}
              subtitle="Healthy devices"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Warnings"
              value={warnings}
              subtitle="Require attention"
              valueClass="text-yellow-400"
            />

            <KpiCard
              title="Offline"
              value={offline}
              subtitle="Unavailable devices"
              valueClass="text-red-400"
            />
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
            >
              <h2 className="text-2xl font-semibold">
                Add Network Device
              </h2>

              <p className="mt-2 text-gray-400">
                Register infrastructure in
                the enterprise network
                inventory.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Device Name"
                  value={name}
                  onChange={setName}
                  placeholder="ACC-SW-OPS-01"
                />

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-400">
                    Device Type
                  </span>

                  <select
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target
                          .value as DeviceType,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option>
                      Router
                    </option>
                    <option>
                      Core Switch
                    </option>
                    <option>
                      Access Switch
                    </option>
                    <option>
                      Firewall
                    </option>
                    <option>
                      Access Point
                    </option>
                  </select>
                </label>

                <Field
                  label="Management IP"
                  value={ip}
                  onChange={setIp}
                  placeholder="10.10.60.2"
                />

                <Field
                  label="Location"
                  value={location}
                  onChange={setLocation}
                  placeholder="Operations Floor"
                />

                <Field
                  label="Vendor"
                  value={vendor}
                  onChange={setVendor}
                  placeholder="Cisco"
                />

                <Field
                  label="Model"
                  value={model}
                  onChange={setModel}
                  placeholder="Catalyst 9200"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                >
                  Add Device
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
                  Infrastructure Inventory
                </h2>

                <p className="mt-2 text-gray-400">
                  Current enterprise network
                  hardware and operational
                  status.
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
                placeholder="Search devices..."
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
                      Type
                    </th>
                    <th className="px-4 py-4">
                      Management IP
                    </th>
                    <th className="px-4 py-4">
                      Vendor / Model
                    </th>
                    <th className="px-4 py-4">
                      Location
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
                  {filteredDevices.map(
                    (device) => (
                      <tr
                        key={device.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-blue-400">
                            {device.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {device.id}
                          </p>
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {device.type}
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {device.ip}
                        </td>

                        <td className="px-4 py-5">
                          <p className="text-gray-300">
                            {device.vendor}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {device.model}
                          </p>
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {device.location}
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              device.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              cycleStatus(
                                device.id,
                              )
                            }
                            className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                          >
                            Change Status
                          </button>
                        </td>
                      </tr>
                    ),
                  )}

                  {filteredDevices.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No network devices
                        found.
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-gray-400">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
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
  status: DeviceStatus;
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
