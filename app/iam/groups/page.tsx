"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import Sidebar from "@/app/components/system/Sidebar";

import {
  defaultIamGroups,
  type IamGroup,
} from "@/lib/data/iamGroups";

const STORAGE_KEY = "iamGroups";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

function loadGroups(): IamGroup[] {
  if (
    typeof window === "undefined"
  ) {
    return defaultIamGroups;
  }

  const savedGroups =
    window.localStorage.getItem(
      STORAGE_KEY,
    );

  if (!savedGroups) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        defaultIamGroups,
      ),
    );

    return defaultIamGroups;
  }

  try {
    const parsedGroups =
      JSON.parse(
        savedGroups,
      ) as IamGroup[];

    if (
      !Array.isArray(
        parsedGroups,
      )
    ) {
      return defaultIamGroups;
    }

    const hasOldData =
      parsedGroups.some(
        (group) =>
          !Array.isArray(
            group.memberIds,
          ),
      );

    if (hasOldData) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          defaultIamGroups,
        ),
      );

      return defaultIamGroups;
    }

    return parsedGroups;
  } catch {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        defaultIamGroups,
      ),
    );

    return defaultIamGroups;
  }
}

function loadCurrentUser():
  CurrentUser | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  const savedUser =
    window.localStorage.getItem(
      "currentUser",
    );

  if (!savedUser) {
    return null;
  }

  try {
    const parsedUser =
      JSON.parse(
        savedUser,
      ) as CurrentUser;

    return parsedUser;
  } catch {
    return null;
  }
}

export default function GroupsPage() {
  const [
    groups,
    setGroups,
  ] =
    useState<IamGroup[]>([]);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  useEffect(() => {
    setGroups(
      loadGroups(),
    );

    setCurrentUser(
      loadCurrentUser(),
    );
  }, []);

  const isAdmin =
    currentUser?.role ===
    "IT Admin";

  const securityGroups =
    groups.filter(
      (group) =>
        group.type ===
        "Security Group",
    ).length;

  const cloudGroups =
    groups.filter(
      (group) =>
        group.type ===
        "Cloud Group",
    ).length;

  const totalMemberships =
    groups.reduce(
      (
        total,
        group,
      ) =>
        total +
        group.memberIds.length,
      0,
    );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Identity Governance
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Groups Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Create, manage and
                organize enterprise
                security, Microsoft 365
                and role-based groups.
              </p>
            </div>

            {isAdmin && (
              <Link
                href="/iam/groups/new"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
              >
                + Create Group
              </Link>
            )}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total Groups"
              value={
                groups.length
              }
              description="Enterprise groups"
              valueClassName="text-blue-400"
            />

            <MetricCard
              label="Security Groups"
              value={
                securityGroups
              }
              description="Access control"
              valueClassName="text-green-400"
            />

            <MetricCard
              label="Cloud Groups"
              value={
                cloudGroups
              }
              description="Microsoft 365"
              valueClassName="text-cyan-400"
            />

            <MetricCard
              label="Total Memberships"
              value={
                totalMemberships
              }
              description="Group assignments"
              valueClassName="text-purple-400"
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Enterprise Groups
              </h2>

              <p className="mt-2 text-gray-400">
                Manage security, cloud
                and role-based groups.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Group
                    </th>

                    <th className="px-4 py-4">
                      Type
                    </th>

                    <th className="px-4 py-4">
                      Members
                    </th>

                    <th className="px-4 py-4">
                      Description
                    </th>

                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {groups.map(
                    (group) => (
                      <tr
                        key={
                          group.id
                        }
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <Link
                            href={`/iam/groups/${group.id}`}
                            className="font-semibold text-blue-400 transition hover:text-blue-300"
                          >
                            {
                              group.name
                            }
                          </Link>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              group.id
                            }
                          </p>
                        </td>

                        <td className="px-4 py-5">
                          <TypeBadge
                            type={
                              group.type
                            }
                          />
                        </td>

                        <td className="px-4 py-5 font-semibold text-gray-300">
                          {
                            group
                              .memberIds
                              .length
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {
                            group.description
                          }
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/iam/groups/${group.id}`}
                              className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                            >
                              View
                            </Link>

                            {isAdmin && (
                              <Link
                                href={`/iam/groups/${group.id}/edit`}
                                className="rounded-lg border border-yellow-500/30 px-3 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500/10"
                              >
                                Edit
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {groups.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          5
                        }
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No groups
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

function MetricCard({
  label,
  value,
  description,
  valueClassName,
}: {
  label: string;
  value: number;
  description: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p
        className={`mt-3 text-4xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function TypeBadge({
  type,
}: {
  type: IamGroup["type"];
}) {
  const className =
    type === "Security Group"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : type === "Cloud Group"
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
        : "border-purple-500/30 bg-purple-500/10 text-purple-400";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {type}
    </span>
  );
}
