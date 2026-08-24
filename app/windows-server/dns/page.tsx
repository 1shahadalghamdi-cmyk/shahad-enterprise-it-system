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

type DnsRecordType = "A" | "CNAME" | "MX";
type DnsStatus = "Active" | "Disabled";

type DnsRecord = {
  id: string;
  name: string;
  type: DnsRecordType;
  value: string;
  zone: string;
  ttl: number;
  status: DnsStatus;
};

const initialRecords: DnsRecord[] = [
  {
    id: "DNS-001",
    name: "dc01",
    type: "A",
    value: "10.10.30.10",
    zone: "enterprise.local",
    ttl: 3600,
    status: "Active",
  },
  {
    id: "DNS-002",
    name: "dc02",
    type: "A",
    value: "10.10.30.11",
    zone: "enterprise.local",
    ttl: 3600,
    status: "Active",
  },
  {
    id: "DNS-003",
    name: "dhcp01",
    type: "A",
    value: "10.10.30.20",
    zone: "enterprise.local",
    ttl: 3600,
    status: "Active",
  },
  {
    id: "DNS-004",
    name: "files",
    type: "CNAME",
    value: "file01.enterprise.local",
    zone: "enterprise.local",
    ttl: 3600,
    status: "Active",
  },
  {
    id: "DNS-005",
    name: "mail",
    type: "MX",
    value: "mail.enterprise.local",
    zone: "enterprise.local",
    ttl: 3600,
    status: "Active",
  },
];

const zones = [
  {
    name: "enterprise.local",
    type: "Primary",
    records: 18,
    server: "DC01",
  },
  {
    name: "_msdcs.enterprise.local",
    type: "Active Directory Integrated",
    records: 12,
    server: "DC01",
  },
  {
    name: "30.10.10.in-addr.arpa",
    type: "Reverse Lookup",
    records: 8,
    server: "DC01",
  },
  {
    name: "corp.enterprise.local",
    type: "Primary",
    records: 6,
    server: "DC02",
  },
];

const DNS_STORAGE_KEY = "enterpriseDnsRecords";

export default function DnsManagementPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [records, setRecords] =
    useState<DnsRecord[]>(initialRecords);

  const [recordsLoaded, setRecordsLoaded] =
    useState(false);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [type, setType] =
    useState<DnsRecordType>("A");
  const [value, setValue] = useState("");
  const [zone, setZone] =
    useState("enterprise.local");
  const [ttl, setTtl] = useState("3600");

  const canManageDns =
    currentUser?.role === "IT Admin";

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

  useEffect(() => {
    const savedRecords =
      window.localStorage.getItem(
        DNS_STORAGE_KEY,
      );

    if (savedRecords) {
      try {
        const parsedRecords =
          JSON.parse(savedRecords) as DnsRecord[];

        if (Array.isArray(parsedRecords)) {
          setRecords(parsedRecords);
        }
      } catch {
        setRecords(initialRecords);
      }
    }

    setRecordsLoaded(true);
  }, []);

  useEffect(() => {
    if (!recordsLoaded) {
      return;
    }

    window.localStorage.setItem(
      DNS_STORAGE_KEY,
      JSON.stringify(records),
    );
  }, [records, recordsLoaded]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      [
        record.name,
        record.type,
        record.value,
        record.zone,
        record.status,
      ].some((item) =>
        item.toLowerCase().includes(query),
      ),
    );
  }, [records, search]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (
      !currentUser ||
      !canManageDns
    ) {
      setMessage(
        "You do not have permission to create DNS records.",
      );
      return;
    }

    if (
      !name.trim() ||
      !value.trim() ||
      !ttl.trim()
    ) {
      setMessage(
        "Complete all DNS record fields.",
      );
      return;
    }

    const numericTtl = Number(ttl);

    if (
      Number.isNaN(numericTtl) ||
      numericTtl <= 0
    ) {
      setMessage(
        "TTL must be a valid positive number.",
      );
      return;
    }

    const duplicateRecord = records.some(
      (record) =>
        record.name.toLowerCase() ===
          name.trim().toLowerCase() &&
        record.type === type &&
        record.zone === zone,
    );

    if (duplicateRecord) {
      setMessage(
        "This DNS record already exists.",
      );
      return;
    }

    const nextNumber =
      Math.max(
        0,
        ...records.map((record) =>
          Number(
            record.id.replace("DNS-", ""),
          ),
        ),
      ) + 1;

    const newRecord: DnsRecord = {
      id: `DNS-${String(nextNumber).padStart(
        3,
        "0",
      )}`,
      name: name.trim(),
      type,
      value: value.trim(),
      zone,
      ttl: numericTtl,
      status: "Active",
    };

    setRecords((current) => [
      ...current,
      newRecord,
    ]);

    setName("");
    setType("A");
    setValue("");
    setZone("enterprise.local");
    setTtl("3600");
    setShowForm(false);

    setMessage(
      "DNS record created successfully.",
    );
  }

  function toggleStatus(id: string) {
    setMessage("");

    if (
      !currentUser ||
      !canManageDns
    ) {
      setMessage(
        "You do not have permission to change DNS record status.",
      );
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status:
                record.status === "Active"
                  ? "Disabled"
                  : "Active",
            }
          : record,
      ),
    );

    setMessage(
      "DNS record status updated successfully.",
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading DNS Management...
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
                DNS Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage enterprise DNS zones, host records,
                aliases, mail records, and internal name
                resolution.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/windows-server"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold transition hover:bg-white/5"
              >
                Server Dashboard
              </Link>

              {canManageDns && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(
                      (current) => !current,
                    );
                    setMessage("");
                  }}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  + Add DNS Record
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="DNS Zones"
              value={zones.length}
              subtitle="Configured zones"
            />

            <KpiCard
              title="DNS Records"
              value={records.length}
              subtitle="Managed records"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Active Records"
              value={
                records.filter(
                  (record) =>
                    record.status === "Active",
                ).length
              }
              subtitle="Available for resolution"
              valueClass="text-green-400"
            />

            <KpiCard
              title="DNS Server"
              value="DC01"
              subtitle="Primary name server"
              valueClass="text-purple-400"
            />
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold">
              DNS Zones
            </h2>

            <p className="mt-2 text-gray-400">
              Forward, reverse, and Active
              Directory-integrated zones.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {zones.map((dnsZone) => (
                <div
                  key={dnsZone.name}
                  className="rounded-2xl border border-white/10 bg-zinc-900 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    {dnsZone.type}
                  </p>

                  <h3 className="mt-3 break-all font-semibold">
                    {dnsZone.name}
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <SmallStat
                      label="Records"
                      value={String(
                        dnsZone.records,
                      )}
                    />

                    <SmallStat
                      label="Server"
                      value={dnsZone.server}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {canManageDns && showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
            >
              <h2 className="text-2xl font-semibold">
                Create DNS Record
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                <Field
                  label="Record Name"
                  value={name}
                  onChange={setName}
                  placeholder="server01"
                />

                <label>
                  <span className="mb-2 block text-sm text-gray-400">
                    Record Type
                  </span>

                  <select
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target
                          .value as DnsRecordType,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option>A</option>
                    <option>CNAME</option>
                    <option>MX</option>
                  </select>
                </label>

                <Field
                  label="Value / Target"
                  value={value}
                  onChange={setValue}
                  placeholder="10.10.30.40"
                />

                <label>
                  <span className="mb-2 block text-sm text-gray-400">
                    DNS Zone
                  </span>

                  <select
                    value={zone}
                    onChange={(event) =>
                      setZone(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {zones.map((dnsZone) => (
                      <option
                        key={dnsZone.name}
                        value={dnsZone.name}
                      >
                        {dnsZone.name}
                      </option>
                    ))}
                  </select>
                </label>

                <Field
                  label="TTL"
                  value={ttl}
                  onChange={setTtl}
                  placeholder="3600"
                  type="number"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
                >
                  Create Record
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
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
                  Resource Records
                </h2>

                <p className="mt-2 text-gray-400">
                  DNS host, alias, and mail records.
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
                placeholder="Search DNS records..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 md:max-w-xs"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Record
                    </th>

                    <th className="px-4 py-4">
                      Type
                    </th>

                    <th className="px-4 py-4">
                      Value / Target
                    </th>

                    <th className="px-4 py-4">
                      Zone
                    </th>

                    <th className="px-4 py-4">
                      TTL
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
                  {filteredRecords.map(
                    (record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-blue-400">
                            {record.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {record.id}
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                            {record.type}
                          </span>
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {record.value}
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {record.zone}
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {record.ttl}
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              record.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5 text-right">
                          {canManageDns ? (
                            <button
                              type="button"
                              onClick={() =>
                                toggleStatus(
                                  record.id,
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

                  {filteredRecords.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No DNS records found.
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

      <p className="mt-1 font-semibold text-gray-300">
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label>
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
  status: DnsStatus;
}) {
  const classes =
    status === "Active"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-red-500/30 bg-red-500/10 text-red-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}
