/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import { hasPermission } from "@/lib/iam/permissions";

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

type ArchiveStatus =
  | "Enabled"
  | "Disabled";

type MailboxMetaRecord = {
  mailboxSizeGb: number;
  quotaGb: number;
  alias: string;
  forwarding: string;
  archive: ArchiveStatus;
};

type MailboxMetaStore = Record<
  string,
  MailboxMetaRecord
>;

type MailboxRecord = M365User &
  MailboxMetaRecord;

const MAILBOX_META_KEY =
  "m365MailboxMeta";

const DEFAULT_MAILBOX_META: MailboxMetaStore = {
  "M365-001": {
    mailboxSizeGb: 18.4,
    quotaGb: 100,
    alias: "shahad@enterprise.com",
    forwarding: "Not configured",
    archive: "Enabled",
  },

  "M365-002": {
    mailboxSizeGb: 8.7,
    quotaGb: 50,
    alias: "msaleh@enterprise.com",
    forwarding: "Not configured",
    archive: "Enabled",
  },

  "M365-003": {
    mailboxSizeGb: 5.2,
    quotaGb: 50,
    alias: "sarah@enterprise.com",
    forwarding: "hr@enterprise.com",
    archive: "Disabled",
  },
};

function loadMailboxMeta(): MailboxMetaStore {
  try {
    const savedValue =
      window.localStorage.getItem(
        MAILBOX_META_KEY,
      );

    if (!savedValue) {
      return {
        ...DEFAULT_MAILBOX_META,
      };
    }

    const parsedValue =
      JSON.parse(
        savedValue,
      ) as MailboxMetaStore;

    return {
      ...DEFAULT_MAILBOX_META,
      ...parsedValue,
    };
  } catch (error) {
    console.error(
      "Failed to load mailbox metadata:",
      error,
    );

    return {
      ...DEFAULT_MAILBOX_META,
    };
  }
}

function getDefaultMailboxMeta(
  user: M365User,
): MailboxMetaRecord {
  return {
    mailboxSizeGb: 1.2,
    quotaGb: 50,
    alias: user.email,
    forwarding: "Not configured",
    archive: "Disabled",
  };
}

export default function ExchangeOnlinePage() {
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
    mailboxMeta,
    setMailboxMeta,
  ] =
    useState<MailboxMetaStore>(
      {},
    );

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
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

  const refreshExchangeData =
    useCallback(() => {
      setUsers(
        loadM365Users(),
      );

      setMailboxMeta(
        loadMailboxMeta(),
      );
    }, []);

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

      refreshExchangeData();
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace(
        "/login",
      );
    }
  }, [
    refreshExchangeData,
    router,
  ]);

  useEffect(() => {
    function handleFocus() {
      refreshExchangeData();
    }

    function handleStorage() {
      refreshExchangeData();
    }

    function handlePageShow() {
      refreshExchangeData();
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        refreshExchangeData();
      }
    }

    window.addEventListener(
      "focus",
      handleFocus,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [refreshExchangeData]);

  const mailboxes =
    useMemo<MailboxRecord[]>(
      () =>
        users.map(
          (user) => {
            const meta =
              mailboxMeta[
                user.id
              ] ??
              getDefaultMailboxMeta(
                user,
              );

            return {
              ...user,
              ...meta,
            };
          },
        ),
      [
        mailboxMeta,
        users,
      ],
    );

  const filteredMailboxes =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return mailboxes;
      }

      return mailboxes.filter(
        (mailbox) =>
          mailbox.name
            .toLowerCase()
            .includes(
              query,
            ) ||
          mailbox.email
            .toLowerCase()
            .includes(
              query,
            ) ||
          mailbox.alias
            .toLowerCase()
            .includes(
              query,
            ) ||
          mailbox.forwarding
            .toLowerCase()
            .includes(
              query,
            ),
      );
    }, [
      mailboxes,
      search,
    ]);

  const enabledMailboxes =
    useMemo(
      () =>
        mailboxes.filter(
          (mailbox) =>
            mailbox.exchange ===
            "Enabled",
        ).length,
      [mailboxes],
    );

  const disabledMailboxes =
    mailboxes.length -
    enabledMailboxes;

  const totalStorage =
    useMemo(
      () =>
        mailboxes.reduce(
          (
            sum,
            mailbox,
          ) =>
            sum +
            mailbox.mailboxSizeGb,
          0,
        ),
      [mailboxes],
    );

  function toggleExchange(
    userId: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to change mailbox status.",
      );

      return;
    }

    const updatedUsers =
      users.map(
        (user) =>
          user.id ===
          userId
            ? {
                ...user,

                exchange:
                  user.exchange ===
                  "Enabled"
                    ? ("Disabled" as const)
                    : ("Enabled" as const),
              }
            : user,
      );

    saveM365Users(
      updatedUsers,
    );

    setUsers(
      updatedUsers,
    );

    setMessage(
      "Mailbox status updated successfully.",
    );
  }

  if (
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Exchange Online...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-6 xl:p-8">
        <div className="mx-auto max-w-[1500px]">
          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Microsoft 365 Administration
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Exchange Online
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage enterprise mailboxes,
                aliases, mailbox storage,
                forwarding, and archive status.
              </p>
            </div>

            <Link
              href="/m365/users"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold transition hover:bg-zinc-800"
            >
              View Users
            </Link>
          </div>

          {/* KPI CARDS */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Mailboxes"
              value={
                mailboxes.length
              }
              subtitle="All Exchange identities"
            />

            <KpiCard
              title="Enabled"
              value={
                enabledMailboxes
              }
              subtitle="Active mailboxes"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Disabled"
              value={
                disabledMailboxes
              }
              subtitle="Mailbox access blocked"
              valueClass="text-red-400"
            />

            <KpiCard
              title="Storage Used"
              value={`${totalStorage.toFixed(
                1,
              )} GB`}
              subtitle="Across all mailboxes"
              valueClass="text-purple-400"
            />
          </div>

          {/* SEARCH */}

          <section className="mt-7 rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Mailbox Directory
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Search and manage Exchange
                  Online mailboxes.
                </p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Search mailbox..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-blue-500 lg:max-w-sm"
              />
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

          {/* MAILBOX TABLE */}

          <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed text-left">
                <colgroup>
                  <col className="w-[11%]" />
                  <col className="w-[18%]" />
                  <col className="w-[17%]" />
                  <col className="w-[13%]" />
                  <col className="w-[15%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[10%]" />
                </colgroup>

                <thead className="border-b border-white/10 bg-zinc-950/40 text-[11px] uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-4">
                      User
                    </th>

                    <th className="px-3 py-4">
                      Primary Email
                    </th>

                    <th className="px-3 py-4">
                      Alias
                    </th>

                    <th className="px-3 py-4">
                      Storage
                    </th>

                    <th className="px-3 py-4">
                      Forwarding
                    </th>

                    <th className="px-2 py-4">
                      Archive
                    </th>

                    <th className="px-2 py-4">
                      Status
                    </th>

                    <th className="px-3 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredMailboxes.map(
                    (mailbox) => {
                      const storagePercent =
                        Math.min(
                          Math.round(
                            (mailbox.mailboxSizeGb /
                              Math.max(
                                mailbox.quotaGb,
                                1,
                              )) *
                              100,
                          ),
                          100,
                        );

                      return (
                        <tr
                          key={
                            mailbox.id
                          }
                          className="transition hover:bg-white/[0.03]"
                        >
                          {/* USER */}

                          <td className="px-4 py-5 align-middle">
                            <Link
                              href={`/m365/users/${mailbox.id}`}
                              className="block truncate text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                              title={
                                mailbox.name
                              }
                            >
                              {
                                mailbox.name
                              }
                            </Link>

                            <p className="mt-1 truncate text-[10px] text-gray-600">
                              {
                                mailbox.id
                              }
                            </p>
                          </td>

                          {/* PRIMARY EMAIL */}

                          <td className="px-3 py-5 align-middle">
                            <p
                              className="truncate text-xs text-gray-300"
                              title={
                                mailbox.email
                              }
                            >
                              {
                                mailbox.email
                              }
                            </p>
                          </td>

                          {/* ALIAS */}

                          <td className="px-3 py-5 align-middle">
                            <p
                              className="truncate text-xs text-gray-300"
                              title={
                                mailbox.alias
                              }
                            >
                              {
                                mailbox.alias
                              }
                            </p>
                          </td>

                          {/* STORAGE */}

                          <td className="px-3 py-5 align-middle">
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-2 text-[10px] text-gray-500">
                                <span className="whitespace-nowrap">
                                  {mailbox.mailboxSizeGb.toFixed(
                                    1,
                                  )}{" "}
                                  GB
                                </span>

                                <span className="whitespace-nowrap">
                                  {
                                    mailbox.quotaGb
                                  }{" "}
                                  GB
                                </span>
                              </div>

                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{
                                    width: `${storagePercent}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* FORWARDING */}

                          <td className="px-3 py-5 align-middle">
                            <p
                              className="truncate text-xs text-gray-300"
                              title={
                                mailbox.forwarding
                              }
                            >
                              {
                                mailbox.forwarding
                              }
                            </p>
                          </td>

                          {/* ARCHIVE */}

                          <td className="px-2 py-5 align-middle">
                            <StatusBadge
                              status={
                                mailbox.archive
                              }
                            />
                          </td>

                          {/* STATUS */}

                          <td className="px-2 py-5 align-middle">
                            <StatusBadge
                              status={
                                mailbox.exchange
                              }
                            />
                          </td>

                          {/* ACTIONS */}

                          <td className="px-3 py-5 align-middle">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/m365/users/${mailbox.id}`}
                                className="rounded-md border border-blue-500/30 px-2 py-1.5 text-[10px] font-semibold text-blue-400 transition hover:bg-blue-500/10"
                              >
                                View
                              </Link>

                              {canManageM365 && (
                                <Link
                                  href={`/m365/exchange/${mailbox.id}`}
                                  className="rounded-md border border-yellow-500/30 px-2 py-1.5 text-[10px] font-semibold text-yellow-400 transition hover:bg-yellow-500/10"
                                >
                                  Manage
                                </Link>
                              )}

                              {canManageM365 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleExchange(
                                      mailbox.id,
                                    )
                                  }
                                  className={`rounded-md border px-2 py-1.5 text-[10px] font-semibold transition ${
                                    mailbox.exchange ===
                                    "Enabled"
                                      ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                  }`}
                                >
                                  {mailbox.exchange ===
                                  "Enabled"
                                    ? "Disable"
                                    : "Enable"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}

                  {filteredMailboxes.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No mailboxes found.
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

function StatusBadge({
  status,
}: {
  status:
    | "Enabled"
    | "Disabled";
}) {
  const enabled =
    status === "Enabled";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-semibold ${
        enabled
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {status}
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
  value: number | string;
  subtitle: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-xs text-gray-400">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}