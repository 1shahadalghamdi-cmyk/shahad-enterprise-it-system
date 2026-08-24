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

type GpoStatus = "Enabled" | "Disabled";

type GpoEnforcement =
  | "Enforced"
  | "Standard";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type Gpo = {
  id: string;
  name: string;
  category: string;
  linkedTo: string;
  setting: string;
  enforcement: GpoEnforcement;
  status: GpoStatus;
};

const initialPolicies: Gpo[] = [
  {
    id: "GPO-001",
    name: "Enterprise Password Policy",
    category: "Security",
    linkedTo: "enterprise.local",
    setting:
      "12 characters • 90-day expiry • history 10",
    enforcement: "Enforced",
    status: "Enabled",
  },
  {
    id: "GPO-002",
    name: "Account Lockout Policy",
    category: "Security",
    linkedTo: "enterprise.local",
    setting:
      "Lock account after 5 failed sign-in attempts",
    enforcement: "Enforced",
    status: "Enabled",
  },
  {
    id: "GPO-003",
    name: "USB Storage Restriction",
    category: "Device Control",
    linkedTo: "Finance OU",
    setting:
      "Block removable storage devices",
    enforcement: "Standard",
    status: "Enabled",
  },
  {
    id: "GPO-004",
    name: "Windows Update Policy",
    category: "Updates",
    linkedTo: "Corporate Computers OU",
    setting:
      "Install approved updates outside business hours",
    enforcement: "Standard",
    status: "Enabled",
  },
  {
    id: "GPO-005",
    name: "Windows Firewall Baseline",
    category: "Security",
    linkedTo: "Corporate Computers OU",
    setting:
      "Enable Domain, Private and Public firewall profiles with enhanced security rules",
    enforcement: "Enforced",
    status: "Enabled",
  },
  {
    id: "GPO-006",
    name: "Finance Drive Mapping",
    category: "User Configuration",
    linkedTo: "Finance OU",
    setting:
      "Map F: to \\\\FILE01\\Finance",
    enforcement: "Standard",
    status: "Enabled",
  },
  {
    id: "GPO-007",
    name: "HR Drive Mapping",
    category: "User Configuration",
    linkedTo: "HR OU",
    setting:
      "Map H: to \\\\FILE01\\HR",
    enforcement: "Standard",
    status: "Enabled",
  },
  {
    id: "GPO-008",
    name: "Guest Device Restrictions",
    category: "Device Control",
    linkedTo: "Guest OU",
    setting:
      "Restrict local admin and internal resource access",
    enforcement: "Standard",
    status: "Disabled",
  },
];

const ous = [
  "enterprise.local",
  "Corporate Computers OU",
  "IT OU",
  "HR OU",
  "Finance OU",
  "Guest OU",
];

const categories = [
  "Security",
  "Device Control",
  "Updates",
  "User Configuration",
  "Computer Configuration",
];

const GPO_STORAGE_KEY =
  "enterpriseGroupPolicies";

export default function GroupPolicyPage() {
  const router = useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    policies,
    setPolicies,
  ] =
    useState<Gpo[]>(
      initialPolicies,
    );

  const [
    selectedId,
    setSelectedId,
  ] =
    useState(
      "GPO-001",
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    dataLoaded,
    setDataLoaded,
  ] =
    useState(false);

  const [
    showForm,
    setShowForm,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState(
      "Security",
    );

  const [
    linkedTo,
    setLinkedTo,
  ] =
    useState(
      "enterprise.local",
    );

  const [
    setting,
    setSetting,
  ] =
    useState("");

  const [
    enforcement,
    setEnforcement,
  ] =
    useState<GpoEnforcement>(
      "Standard",
    );

  const [
    status,
    setStatus,
  ] =
    useState<GpoStatus>(
      "Enabled",
    );

  const canManageGpo =
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
   * Load saved GPO data.
   */
  useEffect(() => {
    const savedPolicies =
      window.localStorage.getItem(
        GPO_STORAGE_KEY,
      );

    if (savedPolicies) {
      try {
        const parsedPolicies =
          JSON.parse(
            savedPolicies,
          ) as Gpo[];

        if (
          Array.isArray(
            parsedPolicies,
          )
        ) {
          setPolicies(
            parsedPolicies,
          );
        }
      } catch {
        setPolicies(
          initialPolicies,
        );
      }
    }

    setDataLoaded(
      true,
    );
  }, []);

  /*
   * Save GPO data.
   */
  useEffect(() => {
    if (!dataLoaded) {
      return;
    }

    window.localStorage.setItem(
      GPO_STORAGE_KEY,
      JSON.stringify(
        policies,
      ),
    );
  }, [
    policies,
    dataLoaded,
  ]);

  const selected =
    policies.find(
      (policy) =>
        policy.id ===
        selectedId,
    ) ??
    policies[0];

  const filteredPolicies =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return policies;
      }

      return policies.filter(
        (policy) =>
          [
            policy.name,
            policy.category,
            policy.linkedTo,
            policy.setting,
            policy.status,
            policy.enforcement,
          ].some(
            (value) =>
              value
                .toLowerCase()
                .includes(
                  query,
                ),
          ),
      );
    }, [
      policies,
      search,
    ]);

  const enabledCount =
    policies.filter(
      (policy) =>
        policy.status ===
        "Enabled",
    ).length;

  const enforcedCount =
    policies.filter(
      (policy) =>
        policy.enforcement ===
        "Enforced",
    ).length;

  function resetForm() {
    setName("");
    setCategory(
      "Security",
    );
    setLinkedTo(
      "enterprise.local",
    );
    setSetting("");
    setEnforcement(
      "Standard",
    );
    setStatus(
      "Enabled",
    );
    setEditingId(
      null,
    );
  }

  function openCreateForm() {
    setMessage("");

    if (
      !currentUser ||
      !canManageGpo
    ) {
      setMessage(
        "You do not have permission to create Group Policy Objects.",
      );
      return;
    }

    resetForm();

    setShowForm(
      true,
    );
  }

  function openEditForm() {
    setMessage("");

    if (
      !currentUser ||
      !canManageGpo
    ) {
      setMessage(
        "You do not have permission to edit Group Policy Objects.",
      );
      return;
    }

    if (!selected) {
      return;
    }

    setEditingId(
      selected.id,
    );

    setName(
      selected.name,
    );

    setCategory(
      selected.category,
    );

    setLinkedTo(
      selected.linkedTo,
    );

    setSetting(
      selected.setting,
    );

    setEnforcement(
      selected.enforcement,
    );

    setStatus(
      selected.status,
    );

    setShowForm(
      true,
    );

    setMessage("");
  }

  function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setMessage("");

    if (
      !currentUser ||
      !canManageGpo
    ) {
      setMessage(
        "You do not have permission to manage Group Policy Objects.",
      );
      return;
    }

    if (
      !name.trim() ||
      !category.trim() ||
      !linkedTo.trim() ||
      !setting.trim()
    ) {
      setMessage(
        "Complete all Group Policy fields.",
      );
      return;
    }

    if (editingId) {
      setPolicies(
        (current) =>
          current.map(
            (policy) =>
              policy.id ===
              editingId
                ? {
                    ...policy,
                    name:
                      name.trim(),
                    category:
                      category.trim(),
                    linkedTo,
                    setting:
                      setting.trim(),
                    enforcement,
                    status,
                  }
                : policy,
          ),
      );

      setSelectedId(
        editingId,
      );

      setMessage(
        "Group Policy updated successfully.",
      );
    } else {
      const duplicateName =
        policies.some(
          (policy) =>
            policy.name
              .toLowerCase() ===
            name
              .trim()
              .toLowerCase(),
        );

      if (
        duplicateName
      ) {
        setMessage(
          "A Group Policy with this name already exists.",
        );
        return;
      }

      const nextNumber =
        Math.max(
          0,
          ...policies.map(
            (policy) => {
              const number =
                Number(
                  policy.id.replace(
                    "GPO-",
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

      const newPolicy: Gpo =
        {
          id: `GPO-${String(
            nextNumber,
          ).padStart(
            3,
            "0",
          )}`,
          name:
            name.trim(),
          category:
            category.trim(),
          linkedTo,
          setting:
            setting.trim(),
          enforcement,
          status,
        };

      setPolicies(
        (current) => [
          ...current,
          newPolicy,
        ],
      );

      setSelectedId(
        newPolicy.id,
      );

      setMessage(
        "Group Policy created successfully.",
      );
    }

    resetForm();

    setShowForm(
      false,
    );
  }

  function togglePolicy(
    id: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageGpo
    ) {
      setMessage(
        "You do not have permission to change Group Policy status.",
      );
      return;
    }

    setPolicies(
      (current) =>
        current.map(
          (policy) =>
            policy.id === id
              ? {
                  ...policy,
                  status:
                    policy.status ===
                    "Enabled"
                      ? "Disabled"
                      : "Enabled",
                }
              : policy,
        ),
    );

    setMessage(
      "Group Policy status updated successfully.",
    );
  }

  function toggleEnforcement(
    id: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageGpo
    ) {
      setMessage(
        "You do not have permission to change Group Policy enforcement.",
      );
      return;
    }

    setPolicies(
      (current) =>
        current.map(
          (policy) =>
            policy.id === id
              ? {
                  ...policy,
                  enforcement:
                    policy.enforcement ===
                    "Enforced"
                      ? "Standard"
                      : "Enforced",
                }
              : policy,
        ),
    );

    setMessage(
      "Group Policy enforcement updated successfully.",
    );
  }

  function updateLink(
    newLinkedTo: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageGpo
    ) {
      setMessage(
        "You do not have permission to change GPO links.",
      );
      return;
    }

    if (!selected) {
      return;
    }

    setPolicies(
      (current) =>
        current.map(
          (policy) =>
            policy.id ===
            selected.id
              ? {
                  ...policy,
                  linkedTo:
                    newLinkedTo,
                }
              : policy,
        ),
    );

    setMessage(
      "GPO link updated successfully.",
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Group Policy Management...
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
                Group Policy Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage enterprise Group Policy Objects,
                security baselines, device restrictions,
                Windows configuration, and OU assignments.
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

              <Link
                href="/windows-server/dhcp"
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 font-semibold text-purple-300"
              >
                DHCP
              </Link>

              {canManageGpo && (
                <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  + New GPO
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Group Policies"
              value={
                policies.length
              }
              subtitle="Configured GPOs"
            />

            <KpiCard
              title="Enabled"
              value={
                enabledCount
              }
              subtitle="Policies currently active"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Enforced"
              value={
                enforcedCount
              }
              subtitle="Mandatory policy links"
              valueClass="text-red-400"
            />

            <KpiCard
              title="Organizational Units"
              value={
                ous.length - 1
              }
              subtitle="Managed OU targets"
              valueClass="text-purple-400"
            />
          </div>

          {canManageGpo &&
            showForm && (
              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {editingId
                        ? "Edit Group Policy"
                        : "Create Group Policy"}
                    </h2>

                    <p className="mt-2 text-gray-400">
                      {editingId
                        ? "Update the selected enterprise Group Policy Object."
                        : "Create a new Group Policy Object and link it to a domain or OU."}
                    </p>
                  </div>

                  {editingId && (
                    <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-400">
                      {editingId}
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <Field
                    label="Policy Name"
                    value={name}
                    onChange={
                      setName
                    }
                    placeholder="Operations Security Policy"
                  />

                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      Category
                    </span>

                    <select
                      value={
                        category
                      }
                      onChange={(
                        event,
                      ) =>
                        setCategory(
                          event
                            .target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      {categories.map(
                        (
                          item,
                        ) => (
                          <option
                            key={
                              item
                            }
                            value={
                              item
                            }
                          >
                            {item}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      Linked Location
                    </span>

                    <select
                      value={
                        linkedTo
                      }
                      onChange={(
                        event,
                      ) =>
                        setLinkedTo(
                          event
                            .target
                            .value,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      {ous.map(
                        (ou) => (
                          <option
                            key={ou}
                            value={ou}
                          >
                            {ou}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="md:col-span-2 xl:col-span-3">
                    <span className="mb-2 block text-sm text-gray-400">
                      Policy Setting
                    </span>

                    <textarea
                      value={
                        setting
                      }
                      onChange={(
                        event,
                      ) =>
                        setSetting(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Describe the security or configuration setting..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      Enforcement
                    </span>

                    <select
                      value={
                        enforcement
                      }
                      onChange={(
                        event,
                      ) =>
                        setEnforcement(
                          event
                            .target
                            .value as GpoEnforcement,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      <option>
                        Standard
                      </option>

                      <option>
                        Enforced
                      </option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-sm text-gray-400">
                      Status
                    </span>

                    <select
                      value={
                        status
                      }
                      onChange={(
                        event,
                      ) =>
                        setStatus(
                          event
                            .target
                            .value as GpoStatus,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                    >
                      <option>
                        Enabled
                      </option>

                      <option>
                        Disabled
                      </option>
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                  >
                    {editingId
                      ? "Save Changes"
                      : "Create GPO"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();

                      setShowForm(
                        false,
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
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Group Policy Objects
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Select a GPO to review its scope and configuration.
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
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Search policies..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 md:max-w-xs"
                />
              </div>

              <div className="divide-y divide-white/5">
                {filteredPolicies.map(
                  (
                    policy,
                  ) => (
                    <button
                      key={
                        policy.id
                      }
                      type="button"
                      onClick={() => {
                        setSelectedId(
                          policy.id,
                        );

                        setMessage(
                          "",
                        );
                      }}
                      className={`w-full p-6 text-left transition hover:bg-white/[0.03] ${
                        selected?.id ===
                        policy.id
                          ? "bg-blue-500/[0.07]"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-blue-400">
                              {
                                policy.name
                              }
                            </h3>

                            <StatusBadge
                              status={
                                policy.status
                              }
                            />

                            {policy.enforcement ===
                              "Enforced" && (
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                                Enforced
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-gray-400">
                            {
                              policy.setting
                            }
                          </p>

                          <p className="mt-3 text-xs text-gray-600">
                            {
                              policy.id
                            }{" "}
                            •{" "}
                            {
                              policy.category
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm">
                          <p className="text-xs text-gray-600">
                            Linked To
                          </p>

                          <p className="mt-1 font-semibold text-gray-300">
                            {
                              policy.linkedTo
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  ),
                )}

                {filteredPolicies.length ===
                  0 && (
                  <div className="p-12 text-center text-gray-500">
                    No Group Policy Objects found.
                  </div>
                )}
              </div>
            </section>

            {selected && (
              <div className="space-y-6">
                <section className="rounded-2xl border border-blue-500/20 bg-zinc-900 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                    Selected GPO
                  </p>

                  <h2 className="mt-3 text-xl font-semibold">
                    {
                      selected.name
                    }
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {
                      selected.setting
                    }
                  </p>

                  <div className="mt-6 space-y-3">
                    <Detail
                      label="Policy ID"
                      value={
                        selected.id
                      }
                    />

                    <Detail
                      label="Category"
                      value={
                        selected.category
                      }
                    />

                    <Detail
                      label="Status"
                      value={
                        selected.status
                      }
                    />

                    <Detail
                      label="Enforcement"
                      value={
                        selected.enforcement
                      }
                    />
                  </div>

                  {canManageGpo ? (
                    <div className="mt-6 grid gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          togglePolicy(
                            selected.id,
                          )
                        }
                        className={`w-full rounded-xl border px-4 py-3 font-semibold transition ${
                          selected.status ===
                          "Enabled"
                            ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        }`}
                      >
                        {selected.status ===
                        "Enabled"
                          ? "Disable Policy"
                          : "Enable Policy"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleEnforcement(
                            selected.id,
                          )
                        }
                        className={`w-full rounded-xl border px-4 py-3 font-semibold transition ${
                          selected.enforcement ===
                          "Enforced"
                            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20"
                            : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        {selected.enforcement ===
                        "Enforced"
                          ? "Remove Enforcement"
                          : "Enforce Policy"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          openEditForm
                        }
                        className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
                      >
                        Edit Policy
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-gray-500">
                      View only
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                  <h2 className="text-xl font-semibold">
                    GPO Link
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Assign the selected policy to an enterprise domain or OU.
                  </p>

                  {canManageGpo ? (
                    <label className="mt-5 block">
                      <span className="mb-2 block text-sm text-gray-400">
                        Linked Location
                      </span>

                      <select
                        value={
                          selected.linkedTo
                        }
                        onChange={(
                          event,
                        ) =>
                          updateLink(
                            event
                              .target
                              .value,
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                      >
                        {ous.map(
                          (ou) => (
                            <option
                              key={
                                ou
                              }
                              value={
                                ou
                              }
                            >
                              {ou}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                  ) : (
                    <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950 p-4">
                      <p className="text-xs text-gray-600">
                        Linked Location
                      </p>

                      <p className="mt-2 font-semibold text-gray-300">
                        {
                          selected.linkedTo
                        }
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        View only
                      </p>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                  <h2 className="text-xl font-semibold">
                    Policy Processing
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <ProcessStep
                      number="1"
                      text="Computer starts and contacts the domain controller."
                    />

                    <ProcessStep
                      number="2"
                      text="Active Directory determines the computer and user OU."
                    />

                    <ProcessStep
                      number="3"
                      text="Linked Group Policy Objects are evaluated."
                    />

                    <ProcessStep
                      number="4"
                      text="Security and configuration settings are applied."
                    />
                  </div>
                </section>
              </div>
            )}
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
  status: GpoStatus;
}) {
  const classes =
    status === "Enabled"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-gray-500/30 bg-gray-500/10 text-gray-400";

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

function ProcessStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-zinc-950 p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
        {number}
      </span>

      <p className="leading-6 text-gray-400">
        {text}
      </p>
    </div>
  );
}
