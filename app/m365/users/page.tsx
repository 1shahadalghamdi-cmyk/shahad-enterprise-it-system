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
  type M365AccountStatus,
  type M365ServiceStatus,
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

export default function Microsoft365UsersPage() {
  const router = useRouter();

  const [users, setUsers] =
    useState<M365User[]>([]);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [
    accountFilter,
    setAccountFilter,
  ] = useState<
    "All" | M365AccountStatus
  >("All");

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
    function handleFocus() {
      refreshUsers();
    }

    function handlePageShow() {
      refreshUsers();
    }

    function handleStorage() {
      refreshUsers();
    }

    window.addEventListener(
      "focus",
      handleFocus,
    );

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, []);

  const activeCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.status ===
            "Active",
        ).length,
      [users],
    );

  const disabledCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.status ===
            "Disabled",
        ).length,
      [users],
    );

  const licensedCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.license &&
            user.license !==
              "Unlicensed",
        ).length,
      [users],
    );

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        search
          .toLowerCase()
          .trim();

      return users.filter(
        (user) => {
          const matchesAccount =
            accountFilter ===
              "All" ||
            user.status ===
              accountFilter;

          if (!matchesAccount) {
            return false;
          }

          if (
            !normalizedSearch
          ) {
            return true;
          }

          const searchableValues =
            [
              user.id,
              user.name,
              user.username,
              user.email,
              user.jobTitle,
              user.department,
              user.license,
              user.exchange,
              user.teams,
              user.oneDrive,
              user.mfa,
              user.status,
            ];

          return searchableValues.some(
            (value) =>
              value
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ),
          );
        },
      );
    }, [
      users,
      search,
      accountFilter,
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

  function toggleAccountStatus(
    user: M365User,
  ) {
    if (
      !currentUser ||
      !canManageM365
    ) {
      window.alert(
        "You do not have permission to manage Microsoft 365 users.",
      );

      return;
    }

    const nextStatus:
      M365AccountStatus =
        user.status ===
        "Active"
          ? "Disabled"
          : "Active";

    const actionText =
      nextStatus === "Disabled"
        ? "disable"
        : "enable";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${actionText} the Microsoft 365 account for ${user.name}?`,
      );

    if (!confirmed) {
      return;
    }

    const updatedUsers =
      users.map(
        (item) =>
          item.id === user.id
            ? {
                ...item,
                status:
                  nextStatus,
              }
            : item,
      );

    persistUsers(
      updatedUsers,
    );

    logActivity(
      nextStatus ===
        "Disabled"
        ? "Disabled M365 Account"
        : "Enabled M365 Account",
      currentUser.name,
      `${user.id} - ${user.name}`,
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
          users...
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
                Microsoft 365
                Users
              </h1>

              <p className="mt-3 text-gray-400">
                Manage Microsoft
                365 users, licenses,
                cloud services, and
                account access.
              </p>
            </div>

            {canManageM365 && (
              <Link
                href="/m365/users/new"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                + New User
              </Link>
            )}
          </div>

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Users"
              value={users.length}
              detail="Microsoft 365 identities"
            />

            <SummaryCard
              title="Active"
              value={
                activeCount
              }
              detail="Account access enabled"
              valueClassName="text-green-400"
            />

            <SummaryCard
              title="Disabled"
              value={
                disabledCount
              }
              detail="Account access blocked"
              valueClassName="text-red-400"
            />

            <SummaryCard
              title="Licensed"
              value={
                licensedCount
              }
              detail="Users with assigned licenses"
              valueClassName="text-purple-400"
            />
          </section>

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900 p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              <input
                type="text"
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search user, email, department, license..."
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
              />

              <select
                value={
                  accountFilter
                }
                onChange={(
                  event,
                ) =>
                  setAccountFilter(
                    event.target
                      .value as
                      | "All"
                      | M365AccountStatus,
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="All">
                  All Accounts
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Disabled">
                  Disabled
                </option>
              </select>
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Licensed Users
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Microsoft 365
                    licenses, cloud
                    services, and
                    account status.
                  </p>
                </div>

                <p className="text-sm text-gray-500">
                  Showing{" "}
                  {
                    filteredUsers.length
                  }{" "}
                  of {users.length}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      User
                    </th>

                    <th className="px-4 py-4">
                      Email
                    </th>

                    <th className="px-4 py-4">
                      License
                    </th>

                    <th className="px-4 py-4">
                      Exchange
                    </th>

                    <th className="px-4 py-4">
                      Teams
                    </th>

                    <th className="px-4 py-4">
                      OneDrive
                    </th>

                    <th className="px-4 py-4">
                      Account
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(
                    (user) => (
                      <tr
                        key={
                          user.id
                        }
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/m365/users/${user.id}`}
                            className="font-semibold text-blue-400 transition hover:text-blue-300"
                          >
                            {
                              user.name
                            }
                          </Link>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              user.id
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {
                              user.department
                            }
                          </p>
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            user.email
                          }
                        </td>

                        <td className="px-4 py-5">
                          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                            {
                              user.license
                            }
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <ServiceBadge
                            status={
                              user.exchange
                            }
                          />
                        </td>

                        <td className="px-4 py-5">
                          <ServiceBadge
                            status={
                              user.teams
                            }
                          />
                        </td>

                        <td className="px-4 py-5">
                          <ServiceBadge
                            status={
                              user.oneDrive
                            }
                          />
                        </td>

                        <td className="px-4 py-5">
                          <AccountBadge
                            status={
                              user.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/m365/users/${user.id}`}
                              className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                            >
                              View
                            </Link>

                            {canManageM365 && (
                              <>
                                <Link
                                  href={`/m365/users/${user.id}/edit`}
                                  className="rounded-lg border border-yellow-500/30 px-3 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
                                >
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleAccountStatus(
                                      user,
                                    )
                                  }
                                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                    user.status ===
                                    "Active"
                                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                  }`}
                                >
                                  {user.status ===
                                  "Active"
                                    ? "Disable"
                                    : "Enable"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {filteredUsers.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No Microsoft
                        365 users match
                        the current
                        search or
                        filter.
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

function ServiceBadge({
  status,
}: {
  status: M365ServiceStatus;
}) {
  const className =
    status === "Enabled"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function AccountBadge({
  status,
}: {
  status: M365AccountStatus;
}) {
  const className =
    status === "Active"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-red-500/30 bg-red-500/10 text-red-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  valueClassName = "text-white",
}: {
  title: string;
  value: number;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {detail}
      </p>
    </article>
  );
}