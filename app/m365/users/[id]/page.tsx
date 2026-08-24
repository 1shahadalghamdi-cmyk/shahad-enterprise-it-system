/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import {
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
  getM365User,
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

export default function Microsoft365UserPage() {
  const router = useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const userId =
    Array.isArray(
      params.id,
    )
      ? params.id[0]
      : params.id;

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
    loaded,
    setLoaded,
  ] =
    useState(false);

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

      if (!userId) {
        setLoaded(true);
        return;
      }

      const foundUser =
        getM365User(
          userId,
        ) ?? null;

      setUser(
        foundUser,
      );

      setLoaded(true);
    } catch (
      error
    ) {
      console.error(
        "Failed to load Microsoft 365 user:",
        error,
      );

      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace(
        "/login",
      );
    }
  }, [
    router,
    userId,
  ]);

  if (
    !loaded ||
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Microsoft 365 user...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center p-8">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <div className="text-5xl">
              🔎
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              User Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              This Microsoft 365 user does not exist.
            </p>

            <Link
              href="/m365/users"
              className="mt-6 inline-flex rounded-xl border border-white/10 bg-zinc-950 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Users
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const displayUsername =
    user.username?.trim() ||
    user.email
      .split("@")[0]
      .trim() ||
    "Not configured";

  const displayJobTitle =
    user.jobTitle?.trim() ||
    "Not configured";

  const displayDepartment =
    user.department?.trim() ||
    "Not configured";

  const enabledServices = [
    user.exchange,
    user.teams,
    user.oneDrive,
    user.mfa || "Disabled",
  ].filter(
    (status) =>
      status === "Enabled",
  ).length;

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-6 xl:p-8">
        <div className="mx-auto max-w-6xl">
          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Microsoft 365 Administration
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                {user.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-gray-400">
                  Microsoft 365 User Profile
                </p>

                <span className="text-gray-700">
                  •
                </span>

                <p className="text-sm text-gray-500">
                  {user.id}
                </p>
              </div>
            </div>

            <StatusBadge
              status={user.status}
            />
          </div>

          {/* SUMMARY */}

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="License"
              value={user.license}
              accent="purple"
            />

            <SummaryCard
              label="Enabled Services"
              value={`${enabledServices} / 4`}
              accent="green"
            />

            <SummaryCard
              label="Account Status"
              value={user.status}
              accent={
                user.status === "Active"
                  ? "green"
                  : "gray"
              }
            />
          </section>

          {/* IDENTITY */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                User Directory
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Identity & Employment
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Microsoft 365 account identity and organizational information.
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              <InfoCard
                title="User ID"
                value={user.id}
              />

              <InfoCard
                title="Username"
                value={displayUsername}
              />

              <InfoCard
                title="Primary Email"
                value={user.email}
              />

              <InfoCard
                title="Job Title"
                value={displayJobTitle}
                muted={
                  displayJobTitle ===
                  "Not configured"
                }
              />

              <InfoCard
                title="Department"
                value={displayDepartment}
                muted={
                  displayDepartment ===
                  "Not configured"
                }
              />

              <InfoCard
                title="License"
                value={user.license}
              />
            </div>
          </section>

          {/* SERVICES */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                Cloud Services
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Microsoft 365 Services
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Current cloud service provisioning for this identity.
              </p>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
              <ServiceCard
                icon="📧"
                title="Exchange Online"
                description="Mailbox & email"
                status={user.exchange}
              />

              <ServiceCard
                icon="💬"
                title="Microsoft Teams"
                description="Chat & meetings"
                status={user.teams}
              />

              <ServiceCard
                icon="☁️"
                title="OneDrive"
                description="Cloud storage"
                status={user.oneDrive}
              />

              <ServiceCard
                icon="🔐"
                title="MFA"
                description="Multi-factor authentication"
                status={
                  user.mfa ||
                  "Disabled"
                }
              />
            </div>
          </section>

          {/* ADMINISTRATION */}

          {canManageM365 && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400">
                Administration
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Management Actions
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Update the user identity or manage Exchange mailbox configuration.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/m365/users/${user.id}/edit`}
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
                >
                  Edit User
                </Link>

                <Link
                  href={`/m365/exchange/${user.id}`}
                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                >
                  Manage Mailbox
                </Link>
              </div>
            </section>
          )}

          {/* NAVIGATION */}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/m365/users"
              className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              ← Back to Users
            </Link>

            <Link
              href="/m365/exchange"
              className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              Exchange Online
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  title,
  value,
  muted = false,
}: {
  title: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-zinc-950 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
        {title}
      </p>

      <p
        className={`mt-3 break-words text-sm font-semibold ${
          muted
            ? "text-gray-500"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  status,
}: {
  icon: string;
  title: string;
  description: string;
  status:
    | "Enabled"
    | "Disabled";
}) {
  const enabled =
    status === "Enabled";

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-lg">
          {icon}
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
            enabled
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
          }`}
        >
          {status}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent:
    | "green"
    | "purple"
    | "gray";
}) {
  const valueClass =
    accent === "green"
      ? "text-green-400"
      : accent === "purple"
        ? "text-purple-400"
        : "text-gray-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    | "Active"
    | "Disabled";
}) {
  const active =
    status === "Active";

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${
        active
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}
