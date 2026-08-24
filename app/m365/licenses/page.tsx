"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import { hasPermission } from "@/lib/iam/permissions";
import { logActivity } from "@/lib/activityLogger";

import {
  loadM365Users,
  saveM365Users,
  type M365User,
} from "@/lib/data/m365Users";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type LicensePlan = {
  name: string;
  total: number;
};

const licensePlans: LicensePlan[] = [
  {
    name: "Microsoft 365 E5",
    total: 25,
  },
  {
    name: "Microsoft 365 E3",
    total: 50,
  },
  {
    name: "Business Premium",
    total: 40,
  },
  {
    name: "Business Standard",
    total: 35,
  },
];

export default function Microsoft365LicensesPage() {
  const router = useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [users, setUsers] =
    useState<M365User[]>([]);

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");

  const [
    selectedLicense,
    setSelectedLicense,
  ] = useState(
    "Microsoft 365 E3",
  );

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const canViewM365 =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:view",
    );

  const canManageM365 =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:manage",
    );

  function refreshUsers() {
    setUsers(
      loadM365Users(),
    );
  }

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
        !hasPermission(
          parsedUser.role,
          "m365:view",
        )
      ) {
        router.replace(
          "/dashboard",
        );

        return;
      }

      setCurrentUser(
        parsedUser,
      );

      refreshUsers();
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    function handleRefresh() {
      refreshUsers();
    }

    window.addEventListener(
      "focus",
      handleRefresh,
    );

    window.addEventListener(
      "pageshow",
      handleRefresh,
    );

    window.addEventListener(
      "storage",
      handleRefresh,
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleRefresh,
      );

      window.removeEventListener(
        "pageshow",
        handleRefresh,
      );

      window.removeEventListener(
        "storage",
        handleRefresh,
      );
    };
  }, []);

  const selectedUser =
    useMemo(
      () =>
        users.find(
          (user) =>
            user.id ===
            selectedUserId,
        ) ?? null,
      [
        users,
        selectedUserId,
      ],
    );

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    if (
      licensePlans.some(
        (plan) =>
          plan.name ===
          selectedUser.license,
      )
    ) {
      setSelectedLicense(
        selectedUser.license,
      );
    }

    setMessage("");
  }, [selectedUser]);

  const licenseUsage =
    useMemo(() => {
      return licensePlans.map(
        (plan) => {
          const assigned =
            users.filter(
              (user) =>
                user.license ===
                plan.name,
            ).length;

          return {
            ...plan,
            assigned,
            available:
              Math.max(
                plan.total -
                  assigned,
                0,
              ),
          };
        },
      );
    }, [users]);

  const totalLicenses =
    useMemo(
      () =>
        licenseUsage.reduce(
          (
            sum,
            plan,
          ) =>
            sum +
            plan.total,
          0,
        ),
      [licenseUsage],
    );

  const assignedLicenses =
    useMemo(
      () =>
        licenseUsage.reduce(
          (
            sum,
            plan,
          ) =>
            sum +
            plan.assigned,
          0,
        ),
      [licenseUsage],
    );

  const availableLicenses =
    totalLicenses -
    assignedLicenses;

  const unlicensedUsers =
    useMemo(
      () =>
        users.filter(
          (user) =>
            !user.license ||
            user.license ===
              "Unlicensed",
        ).length,
      [users],
    );

  const filteredUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return users;
      }

      return users.filter(
        (user) =>
          user.name
            .toLowerCase()
            .includes(query) ||
          user.email
            .toLowerCase()
            .includes(query) ||
          user.license
            .toLowerCase()
            .includes(query) ||
          user.department
            .toLowerCase()
            .includes(query),
      );
    }, [
      users,
      search,
    ]);

  function persistUsers(
    nextUsers: M365User[],
  ) {
    saveM365Users(
      nextUsers,
    );

    setUsers(
      nextUsers,
    );
  }

  function assignLicense() {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to assign Microsoft 365 licenses.",
      );

      return;
    }

    if (!selectedUser) {
      setMessage(
        "Select a user first.",
      );

      return;
    }

    const currentLicense =
      selectedUser.license;

    if (
      currentLicense ===
      selectedLicense
    ) {
      setMessage(
        `${selectedUser.name} already has ${selectedLicense}.`,
      );

      return;
    }

    const selectedPlan =
      licenseUsage.find(
        (plan) =>
          plan.name ===
          selectedLicense,
      );

    if (!selectedPlan) {
      setMessage(
        "The selected license plan could not be found.",
      );

      return;
    }

    /*
     * If the user is moving FROM this
     * same plan this check is irrelevant,
     * but that case was already handled above.
     *
     * For a genuinely new plan, at least
     * one license must be available.
     */
    if (
      selectedPlan.available <=
      0
    ) {
      setMessage(
        `No available ${selectedLicense} licenses remain.`,
      );

      return;
    }

    const updatedUsers =
      users.map(
        (user) =>
          user.id ===
          selectedUser.id
            ? {
                ...user,
                license:
                  selectedLicense,
              }
            : user,
      );

    persistUsers(
      updatedUsers,
    );

    logActivity(
      currentLicense &&
        currentLicense !==
          "Unlicensed"
        ? "Changed M365 License"
        : "Assigned M365 License",
      currentUser.name,
      `${selectedUser.id} - ${selectedUser.name} - ${
        currentLicense ||
        "Unlicensed"
      } → ${selectedLicense}`,
    );

    setMessage(
      currentLicense &&
        currentLicense !==
          "Unlicensed"
        ? `License changed from ${currentLicense} to ${selectedLicense} successfully.`
        : `${selectedLicense} assigned successfully.`,
    );
  }

  function removeLicense(
    user: M365User,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to remove Microsoft 365 licenses.",
      );

      return;
    }

    if (
      !user.license ||
      user.license ===
        "Unlicensed"
    ) {
      setMessage(
        `${user.name} is already unlicensed.`,
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Remove ${user.license} from ${user.name}?`,
      );

    if (!confirmed) {
      return;
    }

    const previousLicense =
      user.license;

    const updatedUsers =
      users.map(
        (item) =>
          item.id === user.id
            ? {
                ...item,
                license:
                  "Unlicensed",
              }
            : item,
      );

    persistUsers(
      updatedUsers,
    );

    logActivity(
      "Removed M365 License",
      currentUser.name,
      `${user.id} - ${user.name} - ${previousLicense}`,
    );

    if (
      selectedUserId ===
      user.id
    ) {
      setSelectedUserId("");
    }

    setMessage(
      `${previousLicense} removed from ${user.name} successfully.`,
    );
  }

  if (
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Microsoft 365
          licenses...
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
                Microsoft 365
                Administration
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                License Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Track Microsoft
                365 license capacity,
                assignments,
                changes, and
                availability across
                enterprise users.
              </p>
            </div>

            <Link
              href="/m365/users"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold transition hover:bg-zinc-800"
            >
              View Users
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Licenses"
              value={
                totalLicenses
              }
              subtitle="Purchased capacity"
            />

            <KpiCard
              title="Assigned"
              value={
                assignedLicenses
              }
              subtitle="Currently allocated"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Available"
              value={
                availableLicenses
              }
              subtitle="Ready to assign"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Unlicensed"
              value={
                unlicensedUsers
              }
              subtitle="Users without a license"
              valueClass="text-yellow-300"
            />
          </div>

          {canManageM365 && (
            <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  Assign or Change
                  License
                </h2>

                <p className="mt-2 text-gray-400">
                  Select a user and
                  assign or change
                  their Microsoft
                  365 license.
                </p>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">
                    User
                  </span>

                  <select
                    value={
                      selectedUserId
                    }
                    onChange={(
                      event,
                    ) => {
                      setSelectedUserId(
                        event.target
                          .value,
                      );

                      setMessage(
                        "",
                      );
                    }}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select user
                    </option>

                    {users.map(
                      (user) => (
                        <option
                          key={
                            user.id
                          }
                          value={
                            user.id
                          }
                        >
                          {
                            user.name
                          }{" "}
                          —{" "}
                          {
                            user.license
                          }
                        </option>
                      ),
                    )}
                  </select>

                  {selectedUser && (
                    <p className="mt-2 text-xs text-gray-500">
                      Current
                      license:{" "}
                      <span className="font-semibold text-purple-300">
                        {
                          selectedUser.license
                        }
                      </span>
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">
                    License Plan
                  </span>

                  <select
                    value={
                      selectedLicense
                    }
                    onChange={(
                      event,
                    ) => {
                      setSelectedLicense(
                        event.target
                          .value,
                      );

                      setMessage(
                        "",
                      );
                    }}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {licenseUsage.map(
                      (plan) => (
                        <option
                          key={
                            plan.name
                          }
                          value={
                            plan.name
                          }
                        >
                          {
                            plan.name
                          }{" "}
                          (
                          {
                            plan.available
                          }{" "}
                          available)
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={
                    assignLicense
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                >
                  {selectedUser &&
                  selectedUser.license !==
                    "Unlicensed"
                    ? "Change License"
                    : "Assign License"}
                </button>
              </div>

              {message && (
                <div
                  className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                    message.includes(
                      "successfully",
                    )
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
            </section>
          )}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                License Inventory
              </h2>

              <p className="mt-2 text-gray-400">
                Current enterprise
                subscription capacity
                and allocation.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      License
                    </th>

                    <th className="px-4 py-4">
                      Total
                    </th>

                    <th className="px-4 py-4">
                      Assigned
                    </th>

                    <th className="px-4 py-4">
                      Available
                    </th>

                    <th className="px-6 py-4">
                      Utilization
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {licenseUsage.map(
                    (plan) => {
                      const utilization =
                        plan.total ===
                        0
                          ? 0
                          : Math.round(
                              (plan.assigned /
                                plan.total) *
                                100,
                            );

                      return (
                        <tr
                          key={
                            plan.name
                          }
                          className="transition hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-5 font-semibold text-purple-300">
                            {
                              plan.name
                            }
                          </td>

                          <td className="px-4 py-5">
                            {
                              plan.total
                            }
                          </td>

                          <td className="px-4 py-5 text-blue-400">
                            {
                              plan.assigned
                            }
                          </td>

                          <td className="px-4 py-5 text-green-400">
                            {
                              plan.available
                            }
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{
                                    width: `${Math.min(
                                      utilization,
                                      100,
                                    )}%`,
                                  }}
                                />
                              </div>

                              <span className="text-sm text-gray-400">
                                {
                                  utilization
                                }
                                %
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    User License
                    Assignments
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Current license
                    assigned to each
                    Microsoft 365
                    identity.
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
                  placeholder="Search user or license..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 lg:max-w-sm"
                />
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {filteredUsers.map(
                (user) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 p-6 transition hover:bg-white/[0.03] md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <Link
                        href={`/m365/users/${user.id}`}
                        className="font-semibold text-blue-400 transition hover:text-blue-300"
                      >
                        {
                          user.name
                        }
                      </Link>

                      <p className="mt-1 text-sm text-gray-500">
                        {
                          user.email
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        {
                          user.department
                        }
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <LicenseBadge
                        license={
                          user.license
                        }
                      />

                      {canManageM365 &&
                        user.license !==
                          "Unlicensed" && (
                          <button
                            type="button"
                            onClick={() =>
                              removeLicense(
                                user,
                              )
                            }
                            className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                          >
                            Remove
                            License
                          </button>
                        )}
                    </div>
                  </div>
                ),
              )}

              {filteredUsers.length ===
                0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  No license
                  assignments match
                  your search.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function LicenseBadge({
  license,
}: {
  license: string;
}) {
  const isUnlicensed =
    !license ||
    license ===
      "Unlicensed";

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
        isUnlicensed
          ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
          : "border-purple-500/30 bg-purple-500/10 text-purple-400"
      }`}
    >
      {license ||
        "Unlicensed"}
    </span>
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
