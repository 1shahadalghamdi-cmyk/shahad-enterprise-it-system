/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

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

function saveMailboxMeta(
  value: MailboxMetaStore,
) {
  window.localStorage.setItem(
    MAILBOX_META_KEY,
    JSON.stringify(value),
  );
}

function getDefaultMeta(
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

export default function ManageMailboxPage() {
  const params = useParams();
  const router = useRouter();

  const rawUserId =
    params?.id;

  const userId =
    Array.isArray(rawUserId)
      ? rawUserId[0]
      : String(
          rawUserId || "",
        );

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    user,
    setUser,
  ] =
    useState<M365User | null>(
      null,
    );

  const [
    alias,
    setAlias,
  ] = useState("");

  const [
    forwarding,
    setForwarding,
  ] = useState("");

  const [
    archive,
    setArchive,
  ] =
    useState<ArchiveStatus>(
      "Disabled",
    );

  const [
    mailboxSizeGb,
    setMailboxSizeGb,
  ] = useState("0");

  const [
    quotaGb,
    setQuotaGb,
  ] = useState("50");

  const [
    exchangeStatus,
    setExchangeStatus,
  ] =
    useState<
      "Enabled" | "Disabled"
    >("Disabled");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

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

      const users =
        loadM365Users();

      const foundUser =
        users.find(
          (item) =>
            item.id ===
            userId,
        );

      if (!foundUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(foundUser);

      const metaStore =
        loadMailboxMeta();

      const meta =
        metaStore[
          foundUser.id
        ] ??
        getDefaultMeta(
          foundUser,
        );

      setAlias(
        meta.alias,
      );

      setForwarding(
        meta.forwarding ===
          "Not configured"
          ? ""
          : meta.forwarding,
      );

      setArchive(
        meta.archive,
      );

      setMailboxSizeGb(
        String(
          meta.mailboxSizeGb,
        ),
      );

      setQuotaGb(
        String(
          meta.quotaGb,
        ),
      );

      setExchangeStatus(
        foundUser.exchange,
      );
    } catch (error) {
      console.error(
        "Failed to load mailbox:",
        error,
      );

      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [
    router,
    userId,
  ]);

  const canManage =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:manage",
    );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");

    if (
      !user ||
      !currentUser
    ) {
      return;
    }

    if (!canManage) {
      setMessage(
        "You do not have permission to manage Exchange mailboxes.",
      );

      return;
    }

    const parsedMailboxSize =
      Number(
        mailboxSizeGb,
      );

    const parsedQuota =
      Number(
        quotaGb,
      );

    if (
      Number.isNaN(
        parsedMailboxSize,
      ) ||
      parsedMailboxSize < 0
    ) {
      setMessage(
        "Mailbox storage must be a valid number.",
      );
      return;
    }

    if (
      Number.isNaN(
        parsedQuota,
      ) ||
      parsedQuota <= 0
    ) {
      setMessage(
        "Mailbox quota must be greater than 0.",
      );
      return;
    }

    if (
      parsedMailboxSize >
      parsedQuota
    ) {
      setMessage(
        "Mailbox storage cannot exceed the mailbox quota.",
      );
      return;
    }

    setIsSaving(true);

    try {
      /*
       * Update Exchange
       * status on the
       * Microsoft 365 user.
       */
      const users =
        loadM365Users();

      const updatedUsers =
        users.map(
          (item) =>
            item.id ===
            user.id
              ? {
                  ...item,
                  exchange:
                    exchangeStatus,
                }
              : item,
        );

      saveM365Users(
        updatedUsers,
      );

      /*
       * Save mailbox-specific
       * configuration separately.
       */
      const metaStore =
        loadMailboxMeta();

      const updatedMeta: MailboxMetaStore =
        {
          ...metaStore,

          [user.id]: {
            alias:
              alias.trim() ||
              user.email,

            forwarding:
              forwarding.trim() ||
              "Not configured",

            archive,

            mailboxSizeGb:
              parsedMailboxSize,

            quotaGb:
              parsedQuota,
          },
        };

      saveMailboxMeta(
        updatedMeta,
      );

      setUser({
        ...user,
        exchange:
          exchangeStatus,
      });

      setMessage(
        "Mailbox settings saved successfully.",
      );
    } catch (error) {
      console.error(
        "Mailbox saving error:",
        error,
      );

      setMessage(
        "Unable to save mailbox settings.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (
    loading ||
    !currentUser
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading mailbox...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-xl rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <div className="text-5xl">
              📭
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Mailbox Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              The requested Microsoft
              365 mailbox could not be
              found.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/m365/exchange",
                )
              }
              className="mt-6 rounded-xl border border-white/10 bg-zinc-950 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Exchange
            </button>
          </div>
        </section>
      </main>
    );
  }

  const storagePercentage =
    Math.min(
      Math.round(
        (Number(
          mailboxSizeGb,
        ) /
          Math.max(
            Number(
              quotaGb,
            ),
            1,
          )) *
          100,
      ),
      100,
    );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Exchange Online
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Manage Mailbox
              </h1>

              <p className="mt-3 text-gray-400">
                Configure mailbox
                identity, forwarding,
                archive, storage quota,
                and Exchange access.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/m365/exchange",
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Exchange
            </button>
          </div>

          {/* User Summary */}

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Microsoft 365 User
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {user.name}
                </h2>

                <p className="mt-1 text-gray-400">
                  {user.email}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {user.id}
                </p>
              </div>

              <StatusBadge
                status={
                  exchangeStatus
                }
              />
            </div>
          </section>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-6 space-y-6"
          >
            {/* Mailbox Identity */}

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                  Mailbox Identity
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Address & Alias
                </h2>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field
                  label="Primary Email"
                >
                  <input
                    value={
                      user.email
                    }
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-gray-500"
                  />
                </Field>

                <Field
                  label="Mailbox Alias"
                >
                  <input
                    type="email"
                    value={
                      alias
                    }
                    onChange={(
                      event,
                    ) =>
                      setAlias(
                        event
                          .target
                          .value,
                      )
                    }
                    disabled={
                      !canManage
                    }
                    placeholder="alias@enterprise.com"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </Field>
              </div>
            </section>

            {/* Forwarding */}

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Mail Flow
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Email Forwarding
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Leave this field
                empty if mail
                forwarding is not
                configured.
              </p>

              <div className="mt-6">
                <Field
                  label="Forward To"
                >
                  <input
                    type="email"
                    value={
                      forwarding
                    }
                    onChange={(
                      event,
                    ) =>
                      setForwarding(
                        event
                          .target
                          .value,
                      )
                    }
                    disabled={
                      !canManage
                    }
                    placeholder="Example: manager@enterprise.com"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </Field>
              </div>
            </section>

            {/* Storage */}

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Mailbox Storage
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Storage & Quota
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field
                  label="Storage Used (GB)"
                >
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      mailboxSizeGb
                    }
                    onChange={(
                      event,
                    ) =>
                      setMailboxSizeGb(
                        event
                          .target
                          .value,
                      )
                    }
                    disabled={
                      !canManage
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </Field>

                <Field
                  label="Mailbox Quota (GB)"
                >
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      quotaGb
                    }
                    onChange={(
                      event,
                    ) =>
                      setQuotaGb(
                        event
                          .target
                          .value,
                      )
                    }
                    disabled={
                      !canManage
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </Field>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/60 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Storage
                    utilization
                  </span>

                  <span className="font-semibold">
                    {Number(
                      mailboxSizeGb ||
                        0,
                    ).toFixed(
                      1,
                    )}{" "}
                    GB /{" "}
                    {Number(
                      quotaGb ||
                        0,
                    )}{" "}
                    GB
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${storagePercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-right text-xs text-gray-500">
                  {
                    storagePercentage
                  }
                  % used
                </p>
              </div>
            </section>

            {/* Policies */}

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                Exchange Policies
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Mailbox Status
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field
                  label="Archive"
                >
                  <select
                    value={
                      archive
                    }
                    onChange={(
                      event,
                    ) =>
                      setArchive(
                        event
                          .target
                          .value as ArchiveStatus,
                      )
                    }
                    disabled={
                      !canManage
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="Enabled">
                      Enabled
                    </option>

                    <option value="Disabled">
                      Disabled
                    </option>
                  </select>
                </Field>

                <Field
                  label="Exchange Online"
                >
                  <select
                    value={
                      exchangeStatus
                    }
                    onChange={(
                      event,
                    ) =>
                      setExchangeStatus(
                        event
                          .target
                          .value as
                          | "Enabled"
                          | "Disabled",
                      )
                    }
                    disabled={
                      !canManage
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="Enabled">
                      Enabled
                    </option>

                    <option value="Disabled">
                      Disabled
                    </option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Message */}

            {message && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
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

            {/* Actions */}

            <div className="flex flex-col gap-3 sm:flex-row">
              {canManage && (
                <button
                  type="submit"
                  disabled={
                    isSaving
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Mailbox Settings"}
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/m365/exchange",
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </span>

      {children}
    </label>
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
      className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
        enabled
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}