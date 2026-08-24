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

type AllocationType =
  | "DHCP"
  | "Static";

type IpStatus =
  | "Assigned"
  | "Available"
  | "Reserved";

type FormMode =
  | "Assign"
  | "Reserve";

type IpRecord = {
  id: string;
  ip: string;
  vlan: number;
  vlanName: string;
  device: string;
  type: AllocationType;
  status: IpStatus;
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

type IpPool = {
  vlan: number;
  name: string;
  subnet: string;
  used: number;
  available: number;
};

const initialRecords: IpRecord[] = [
  {
    id: "IP-001",
    ip: "10.10.10.21",
    vlan: 10,
    vlanName: "HR",
    device: "HR-LAPTOP-021",
    type: "DHCP",
    status: "Assigned",
  },
  {
    id: "IP-002",
    ip: "10.10.20.15",
    vlan: 20,
    vlanName: "Finance",
    device: "FIN-PC-015",
    type: "DHCP",
    status: "Assigned",
  },
  {
    id: "IP-003",
    ip: "10.10.30.10",
    vlan: 30,
    vlanName: "IT",
    device: "IT-SRV-01",
    type: "Static",
    status: "Assigned",
  },
  {
    id: "IP-004",
    ip: "10.10.40.50",
    vlan: 40,
    vlanName: "Corporate",
    device: "CORP-PRINTER-01",
    type: "Static",
    status: "Reserved",
  },
  {
    id: "IP-005",
    ip: "10.10.50.25",
    vlan: 50,
    vlanName: "Guest",
    device: "-",
    type: "DHCP",
    status: "Available",
  },
];

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

export default function IpAddressingPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [records, setRecords] =
    useState<IpRecord[]>(initialRecords);

  const [vlans, setVlans] =
    useState<Vlan[]>(initialVlans);

  const [dataLoaded, setDataLoaded] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [formMode, setFormMode] =
    useState<FormMode>("Assign");

  const [message, setMessage] =
    useState("");

  const [ip, setIp] =
    useState("");

  const [vlan, setVlan] =
    useState("10");

  const [device, setDevice] =
    useState("");

  const [type, setType] =
    useState<AllocationType>("DHCP");

  const [
    selectedExistingRecordId,
    setSelectedExistingRecordId,
  ] = useState<string | null>(null);

  const canManageNetwork =
    currentUser?.role === "IT Admin" ||
    currentUser?.role === "IT Support";

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

  useEffect(() => {
    const savedRecords =
      window.localStorage.getItem(
        "networkIpRecords",
      );

    if (savedRecords) {
      try {
        const parsedRecords =
          JSON.parse(
            savedRecords,
          ) as IpRecord[];

        if (
          Array.isArray(
            parsedRecords,
          )
        ) {
          setRecords(
            parsedRecords,
          );
        }
      } catch {
        setRecords(
          initialRecords,
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

          if (
            parsedVlans.length > 0
          ) {
            setVlan(
              String(
                parsedVlans[0].id,
              ),
            );
          }
        }
      } catch {
        setVlans(
          initialVlans,
        );
      }
    }

    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!dataLoaded) {
      return;
    }

    window.localStorage.setItem(
      "networkIpRecords",
      JSON.stringify(
        records,
      ),
    );
  }, [
    records,
    dataLoaded,
  ]);

  useEffect(() => {
    if (!dataLoaded) {
      return;
    }

    window.localStorage.setItem(
      "networkVlans",
      JSON.stringify(
        vlans,
      ),
    );
  }, [
    vlans,
    dataLoaded,
  ]);

  const pools =
    useMemo<IpPool[]>(
      () => {
        return vlans.map(
          (item) => {
            const usableAddresses =
              253;

            return {
              vlan: item.id,
              name: item.name,
              subnet:
                item.subnet,
              used:
                item.devices,
              available:
                Math.max(
                  0,
                  usableAddresses -
                    item.devices,
                ),
            };
          },
        );
      },
      [vlans],
    );

  const filteredRecords =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return records;
      }

      return records.filter(
        (record) =>
          [
            record.ip,
            String(
              record.vlan,
            ),
            `vlan ${record.vlan}`,
            record.vlanName,
            record.device,
            record.type,
            record.status,
            record.id,
          ].some((value) =>
            value
              .toLowerCase()
              .includes(query),
          ),
      );
    }, [
      records,
      search,
    ]);

  const totalUsed =
    pools.reduce(
      (
        sum,
        pool,
      ) =>
        sum +
        pool.used,
      0,
    );

  const totalAvailable =
    pools.reduce(
      (
        sum,
        pool,
      ) =>
        sum +
        pool.available,
      0,
    );

  const staticCount =
    records.filter(
      (record) =>
        record.type === "Static" &&
        record.status !== "Available",
    ).length;

  function isValidIpv4(
    address: string,
  ) {
    const parts =
      address.split(".");

    if (
      parts.length !== 4
    ) {
      return false;
    }

    return parts.every(
      (part) => {
        if (
          !/^\d+$/.test(
            part,
          )
        ) {
          return false;
        }

        const number =
          Number(part);

        return (
          number >= 0 &&
          number <= 255
        );
      },
    );
  }

  function ipBelongsToSubnet(
    address: string,
    subnet: string,
  ) {
    if (
      !subnet.endsWith(
        "/24",
      )
    ) {
      return true;
    }

    const networkAddress =
      subnet.split("/")[0];

    const addressParts =
      address.split(".");

    const networkParts =
      networkAddress.split(
        ".",
      );

    if (
      addressParts.length !== 4 ||
      networkParts.length !== 4
    ) {
      return false;
    }

    return (
      addressParts[0] ===
        networkParts[0] &&
      addressParts[1] ===
        networkParts[1] &&
      addressParts[2] ===
        networkParts[2]
    );
  }

  function openAssignForm() {
    setSelectedExistingRecordId(
      null,
    );
    setFormMode("Assign");
    setType("DHCP");
    setIp("");
    setDevice("");
    setMessage("");

    if (
      pools.length > 0
    ) {
      setVlan(
        String(
          pools[0].vlan,
        ),
      );
    }

    setShowForm(true);
  }

  function openReserveForm() {
    setSelectedExistingRecordId(
      null,
    );
    setFormMode("Reserve");
    setType("Static");
    setIp("");
    setDevice("");
    setMessage("");

    if (
      pools.length > 0
    ) {
      setVlan(
        String(
          pools[0].vlan,
        ),
      );
    }

    setShowForm(true);
  }

  function openAssignExistingRecord(
    record: IpRecord,
  ) {
    if (!canManageNetwork) {
      setMessage(
        "You do not have permission to manage IP addresses.",
      );

      return;
    }

    if (
      record.status !== "Available"
    ) {
      setMessage(
        "Only available IP addresses can be assigned.",
      );

      return;
    }

    setSelectedExistingRecordId(
      record.id,
    );

    setFormMode("Assign");
    setIp(record.ip);

    setVlan(
      String(
        record.vlan,
      ),
    );

    setDevice("");
    setType(record.type);
    setMessage("");
    setShowForm(true);

    window.setTimeout(
      () => {
        const form =
          document.getElementById(
            "ip-management-form",
          );

        form?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      },
      50,
    );
  }

  function closeForm() {
    setShowForm(false);

    setSelectedExistingRecordId(
      null,
    );

    setIp("");
    setDevice("");
    setType("DHCP");
    setMessage("");
  }

  function releaseIp(
    record: IpRecord,
  ) {
    if (!canManageNetwork) {
      setMessage(
        "You do not have permission to manage IP addresses.",
      );

      return;
    }

    if (
      record.status ===
      "Available"
    ) {
      setMessage(
        "This IP address is already available.",
      );

      return;
    }

    const wasAssigned =
      record.status ===
      "Assigned";

    setRecords(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            record.id
              ? {
                  ...item,
                  device: "-",
                  status:
                    "Available",
                }
              : item,
        ),
    );

    if (wasAssigned) {
      setVlans(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              record.vlan
                ? {
                    ...item,
                    devices:
                      Math.max(
                        0,
                        item.devices -
                          1,
                      ),
                  }
                : item,
          ),
      );
    }

    setShowForm(false);

    setSelectedExistingRecordId(
      null,
    );

    setIp("");
    setDevice("");
    setType("DHCP");

    setMessage(
      `${record.ip} released successfully.`,
    );
  }

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
        "You do not have permission to manage IP addresses.",
      );

      return;
    }

    const selectedExistingRecord =
      selectedExistingRecordId
        ? records.find(
            (record) =>
              record.id ===
              selectedExistingRecordId,
          )
        : undefined;

    const normalizedIp =
      selectedExistingRecord
        ? selectedExistingRecord.ip
        : ip.trim();

    const normalizedDevice =
      device.trim();

    const effectiveVlan =
      selectedExistingRecord
        ? selectedExistingRecord.vlan
        : Number(vlan);

    if (
      !normalizedIp ||
      !normalizedDevice
    ) {
      setMessage(
        formMode ===
          "Reserve"
          ? "Enter an IP address and reservation name."
          : "Enter an IP address and device name.",
      );

      return;
    }

    if (
      !isValidIpv4(
        normalizedIp,
      )
    ) {
      setMessage(
        "Enter a valid IPv4 address.",
      );

      return;
    }

    const existingRecord =
      records.find(
        (record) =>
          record.ip ===
          normalizedIp,
      );

    if (
      existingRecord &&
      existingRecord.status !==
        "Available"
    ) {
      setMessage(
        "This IP address is already assigned or reserved.",
      );

      return;
    }

    const selectedPool =
      pools.find(
        (pool) =>
          pool.vlan ===
          effectiveVlan,
      );

    if (!selectedPool) {
      setMessage(
        "Selected VLAN was not found.",
      );

      return;
    }

    if (
      !ipBelongsToSubnet(
        normalizedIp,
        selectedPool.subnet,
      )
    ) {
      setMessage(
        `IP address must belong to ${selectedPool.subnet}.`,
      );

      return;
    }

    if (
      selectedPool.available <=
      0
    ) {
      setMessage(
        "No available addresses remain in this VLAN.",
      );

      return;
    }

    const nextNumber =
      Math.max(
        0,
        ...records.map(
          (record) =>
            Number(
              record.id.replace(
                "IP-",
                "",
              ),
            ),
        ),
      ) + 1;

    const newRecord: IpRecord = {
      id: `IP-${String(
        nextNumber,
      ).padStart(
        3,
        "0",
      )}`,

      ip:
        normalizedIp,

      vlan:
        selectedPool.vlan,

      vlanName:
        selectedPool.name,

      device:
        normalizedDevice,

      type:
        formMode ===
        "Reserve"
          ? "Static"
          : type,

      status:
        formMode ===
        "Reserve"
          ? "Reserved"
          : "Assigned",
    };

    setRecords(
      (current) => {
        const foundRecord =
          selectedExistingRecordId
            ? current.find(
                (record) =>
                  record.id ===
                  selectedExistingRecordId,
              )
            : current.find(
                (record) =>
                  record.ip ===
                  normalizedIp,
              );

        if (foundRecord) {
          return current.map(
            (record) =>
              record.id ===
              foundRecord.id
                ? {
                    ...record,
                    ip:
                      normalizedIp,
                    vlan:
                      selectedPool.vlan,
                    vlanName:
                      selectedPool.name,
                    device:
                      normalizedDevice,
                    type:
                      formMode ===
                      "Reserve"
                        ? "Static"
                        : type,
                    status:
                      formMode ===
                      "Reserve"
                        ? "Reserved"
                        : "Assigned",
                  }
                : record,
          );
        }

        return [
          ...current,
          newRecord,
        ];
      },
    );

    if (
      formMode ===
      "Assign"
    ) {
      setVlans(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              selectedPool.vlan
                ? {
                    ...item,
                    devices:
                      item.devices +
                      1,
                  }
                : item,
          ),
      );
    }

    setSelectedExistingRecordId(
      null,
    );

    setIp("");
    setDevice("");
    setType("DHCP");
    setShowForm(false);

    setMessage(
      formMode ===
        "Reserve"
        ? "IP address reserved successfully."
        : "IP address assigned successfully.",
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading IP Address
          Management...
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
                Enterprise Network
                Architecture
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                IP Address Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Track enterprise IP
                pools, DHCP and static
                assignments, VLAN
                subnets, reservations,
                and endpoint
                allocations.
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
                <>
                  <button
                    type="button"
                    onClick={
                      openReserveForm
                    }
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/20"
                  >
                    + Reserve IP
                  </button>

                  <button
                    type="button"
                    onClick={
                      openAssignForm
                    }
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                  >
                    + Assign IP
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="IP Pools"
              value={
                pools.length
              }
              subtitle="VLAN address pools"
            />

            <KpiCard
              title="Used Addresses"
              value={
                totalUsed
              }
              subtitle="Allocated endpoints"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Available"
              value={
                totalAvailable
              }
              subtitle="Remaining addresses"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Static Records"
              value={
                staticCount
              }
              subtitle="Manual assignments"
              valueClass="text-purple-400"
            />
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">
              IP Pools
            </h2>

            <p className="mt-2 text-gray-400">
              Address utilization
              across enterprise VLANs.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pools.map(
                (pool) => {
                  const total =
                    pool.used +
                    pool.available;

                  const percentage =
                    total > 0
                      ? Math.round(
                          (pool.used /
                            total) *
                            100,
                        )
                      : 0;

                  return (
                    <div
                      key={
                        pool.vlan
                      }
                      className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
                    >
                      <p className="text-sm font-semibold text-blue-400">
                        VLAN{" "}
                        {pool.vlan}
                      </p>

                      <h3 className="mt-2 text-lg font-bold">
                        {pool.name}
                      </h3>

                      <p className="mt-2 font-mono text-xs text-gray-500">
                        {
                          pool.subnet
                        }
                      </p>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-3 flex justify-between text-xs">
                        <span className="text-gray-400">
                          {
                            pool.used
                          }{" "}
                          used
                        </span>

                        <span className="text-green-400">
                          {
                            pool.available
                          }{" "}
                          free
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          {canManageNetwork &&
            showForm && (
              <form
                id="ip-management-form"
                onSubmit={
                  handleSubmit
                }
                className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                    {formMode ===
                    "Reserve"
                      ? "IP Reservation"
                      : "IP Assignment"}
                  </p>

                  <h2 className="text-2xl font-semibold">
                    {formMode ===
                    "Reserve"
                      ? "Reserve IP Address"
                      : "Assign IP Address"}
                  </h2>

                  <p className="text-sm text-gray-400">
                    {formMode ===
                    "Reserve"
                      ? "Reserve a static address for a device or future infrastructure requirement."
                      : selectedExistingRecordId
                        ? "Assign this available IP address to an enterprise endpoint."
                        : "Allocate an IP address to an enterprise endpoint."}
                  </p>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      IP Address
                    </span>

                    <input
                      value={ip}
                      readOnly={
                        Boolean(
                          selectedExistingRecordId,
                        )
                      }
                      onChange={(
                        event,
                      ) =>
                        setIp(
                          event.target
                            .value,
                        )
                      }
                      placeholder="10.10.30.25"
                      className={`w-full rounded-xl border px-4 py-3 outline-none ${
                        selectedExistingRecordId
                          ? "cursor-not-allowed border-blue-500/20 bg-blue-500/5 text-blue-300"
                          : "border-white/10 bg-zinc-950 focus:border-blue-500"
                      }`}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      VLAN
                    </span>

                    <select
                      value={vlan}
                      disabled={
                        Boolean(
                          selectedExistingRecordId,
                        )
                      }
                      onChange={(
                        event,
                      ) =>
                        setVlan(
                          event.target
                            .value,
                        )
                      }
                      className={`w-full rounded-xl border px-4 py-3 outline-none ${
                        selectedExistingRecordId
                          ? "cursor-not-allowed border-blue-500/20 bg-blue-500/5 text-blue-300"
                          : "border-white/10 bg-zinc-950 focus:border-blue-500"
                      }`}
                    >
                      {pools.map(
                        (pool) => (
                          <option
                            key={
                              pool.vlan
                            }
                            value={
                              String(
                                pool.vlan,
                              )
                            }
                          >
                            VLAN{" "}
                            {
                              pool.vlan
                            }{" "}
                            —{" "}
                            {
                              pool.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <Field
                    label={
                      formMode ===
                      "Reserve"
                        ? "Reservation / Device"
                        : "Device"
                    }
                    value={
                      device
                    }
                    onChange={
                      setDevice
                    }
                    placeholder={
                      formMode ===
                      "Reserve"
                        ? "Future Server"
                        : "IT-SRV-02"
                    }
                  />

                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      Allocation
                    </span>

                    {formMode ===
                    "Reserve" ? (
                      <div className="w-full rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 font-semibold text-purple-300">
                        Static
                      </div>
                    ) : (
                      <select
                        value={
                          type
                        }
                        onChange={(
                          event,
                        ) =>
                          setType(
                            event
                              .target
                              .value as AllocationType,
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                      >
                        <option value="DHCP">
                          DHCP
                        </option>

                        <option value="Static">
                          Static
                        </option>
                      </select>
                    )}
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className={`rounded-xl px-6 py-3 font-semibold transition ${
                      formMode ===
                      "Reserve"
                        ? "bg-purple-600 hover:bg-purple-500"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    {formMode ===
                    "Reserve"
                      ? "Reserve IP"
                      : "Assign IP"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      closeForm
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
                  Address Assignments
                </h2>

                <p className="mt-2 text-gray-400">
                  Search DHCP, static,
                  assigned, reserved,
                  and available IPs.
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
                placeholder="Search IP addresses..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 md:max-w-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      IP Address
                    </th>

                    <th className="px-4 py-4">
                      VLAN
                    </th>

                    <th className="px-4 py-4">
                      Device
                    </th>

                    <th className="px-4 py-4">
                      Allocation
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredRecords.map(
                    (record) => (
                      <tr
                        key={
                          record.id
                        }
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-mono font-semibold text-blue-400">
                            {
                              record.ip
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {
                              record.id
                            }
                          </p>
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          VLAN{" "}
                          {
                            record.vlan
                          }{" "}
                          —{" "}
                          {
                            record.vlanName
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            record.device
                          }
                        </td>

                        <td className="px-4 py-5">
                          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                            {
                              record.type
                            }
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              record.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end">
                            {canManageNetwork &&
                              (
                                record.status ===
                                "Available" ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openAssignExistingRecord(
                                        record,
                                      )
                                    }
                                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
                                  >
                                    Assign
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      releaseIp(
                                        record,
                                      )
                                    }
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                                  >
                                    Release
                                  </button>
                                )
                              )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {filteredRecords.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No IP
                        addresses
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

function StatusBadge({
  status,
}: {
  status: IpStatus;
}) {
  const classes =
    status === "Assigned"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : status === "Reserved"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        : "border-blue-500/30 bg-blue-500/10 text-blue-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}
