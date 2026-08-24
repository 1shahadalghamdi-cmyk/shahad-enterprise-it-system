"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";

import {
  defaultIamGroups,
  type IamGroup,
} from "@/lib/data/iamGroups";

import {
  defaultIamUsers,
  type IamUser,
} from "@/lib/data/iamUsers";

const GROUPS_STORAGE_KEY = "iamGroups";
const USERS_STORAGE_KEY = "iamUsers";

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
  if (typeof window === "undefined") {
    return defaultIamGroups;
  }

  const savedGroups =
    window.localStorage.getItem(
      GROUPS_STORAGE_KEY,
    );

  if (!savedGroups) {
    window.localStorage.setItem(
      GROUPS_STORAGE_KEY,
      JSON.stringify(defaultIamGroups),
    );

    return defaultIamGroups;
  }

  try {
    const parsedGroups =
      JSON.parse(
        savedGroups,
      ) as IamGroup[];

    if (!Array.isArray(parsedGroups)) {
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
        GROUPS_STORAGE_KEY,
        JSON.stringify(
          defaultIamGroups,
        ),
      );

      return defaultIamGroups;
    }

    return parsedGroups;
  } catch {
    window.localStorage.setItem(
      GROUPS_STORAGE_KEY,
      JSON.stringify(
        defaultIamGroups,
      ),
    );

    return defaultIamGroups;
  }
}

function saveGroups(
  groups: IamGroup[],
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    GROUPS_STORAGE_KEY,
    JSON.stringify(groups),
  );
}

function loadUsers(): IamUser[] {
  if (typeof window === "undefined") {
    return defaultIamUsers;
  }

  const savedUsers =
    window.localStorage.getItem(
      USERS_STORAGE_KEY,
    );

  if (!savedUsers) {
    return defaultIamUsers;
  }

  try {
    const parsedUsers =
      JSON.parse(
        savedUsers,
      ) as IamUser[];

    if (!Array.isArray(parsedUsers)) {
      return defaultIamUsers;
    }

    return parsedUsers;
  } catch {
    return defaultIamUsers;
  }
}

function loadCurrentUser():
  CurrentUser | null {
  if (typeof window === "undefined") {
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
    return JSON.parse(
      savedUser,
    ) as CurrentUser;
  } catch {
    return null;
  }
}

export default function GroupDetailsPage() {
  const params =
    useParams<{ id: string }>();

  const groupId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const [groups, setGroups] =
    useState<IamGroup[]>([]);

  const [users, setUsers] =
    useState<IamUser[]>([]);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    setGroups(loadGroups());
    setUsers(loadUsers());

    setCurrentUser(
      loadCurrentUser(),
    );

    setLoading(false);
  }, []);

  const isAdmin =
    currentUser?.role ===
    "IT Admin";

  const group = useMemo(
    () =>
      groups.find(
        (item) =>
          item.id === groupId,
      ),
    [groupId, groups],
  );

  const members = useMemo(() => {
    if (!group) {
      return [];
    }

    return group.memberIds
      .map((userId) =>
        users.find(
          (user) =>
            user.id === userId,
        ),
      )
      .filter(
        (
          user,
        ): user is IamUser =>
          Boolean(user),
      );
  }, [group, users]);

  const availableUsers =
    useMemo(() => {
      if (!group) {
        return [];
      }

      return users.filter(
        (user) =>
          !group.memberIds.includes(
            user.id,
          ),
      );
    }, [group, users]);

  function handleAddMember() {
    if (!group || !isAdmin) {
      return;
    }

    if (!selectedUserId) {
      setMessage(
        "Select a user before adding a member.",
      );

      return;
    }

    if (
      group.memberIds.includes(
        selectedUserId,
      )
    ) {
      setMessage(
        "This user is already assigned to the group.",
      );

      return;
    }

    const updatedGroups =
      groups.map((item) =>
        item.id === group.id
          ? {
              ...item,
              memberIds: [
                ...item.memberIds,
                selectedUserId,
              ],
            }
          : item,
      );

    saveGroups(updatedGroups);
    setGroups(updatedGroups);

    setSelectedUserId("");

    setMessage(
      "Member added successfully.",
    );
  }

  function handleRemoveMember(
    userId: string,
  ) {
    if (!group || !isAdmin) {
      return;
    }

    const updatedGroups =
      groups.map((item) =>
        item.id === group.id
          ? {
              ...item,
              memberIds:
                item.memberIds.filter(
                  (memberId) =>
                    memberId !== userId,
                ),
            }
          : item,
      );

    saveGroups(updatedGroups);
    setGroups(updatedGroups);

    setMessage(
      "Member removed successfully.",
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading group...
        </p>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <p className="text-6xl">
              🔎
            </p>

            <h1 className="mt-5 text-3xl font-bold">
              Group Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              The requested group does not
              exist.
            </p>

            <Link
              href="/iam/groups"
              className="mt-6 inline-flex rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Groups
            </Link>
          </div>
        </section>
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
                Identity Governance
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                {group.name}
              </h1>

              <p className="mt-3 text-gray-400">
                {group.description}
              </p>
            </div>

            {isAdmin && (
              <Link
                href={`/iam/groups/${group.id}/edit`}
                className="inline-flex items-center justify-center rounded-xl border border-yellow-500/30 px-5 py-3 font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
              >
                Edit Group
              </Link>
            )}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <SummaryCard
              label="Group Type"
              value={group.type}
            />

            <SummaryCard
              label="Members"
              value={String(
                group.memberIds.length,
              )}
              valueClassName="text-blue-400"
            />

            <SummaryCard
              label="Department"
              value={
                group.department
              }
            />

            <SummaryCard
              label="Group ID"
              value={group.id}
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Group Members
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Users currently assigned
                    to this group.
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
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

                        setMessage("");
                      }}
                      className="min-w-[260px] rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                    >
                      <option value="">
                        Select user...
                      </option>

                      {availableUsers.map(
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
                              user.fullName
                            }{" "}
                            —{" "}
                            {
                              user.department
                            }
                          </option>
                        ),
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={
                        handleAddMember
                      }
                      disabled={
                        availableUsers.length ===
                        0
                      }
                      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      + Add Member
                    </button>
                  </div>
                )}
              </div>

              {message && isAdmin && (
                <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-300">
                  {message}
                </div>
              )}
            </div>

            <div className="divide-y divide-white/5">
              {members.map(
                (member) => (
                  <div
                    key={member.id}
                    className="flex flex-col gap-4 p-6 transition hover:bg-white/[0.03] lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 font-bold text-blue-400">
                        {getInitials(
                          member.fullName,
                        )}
                      </div>

                      <div>
                        <Link
                          href={`/iam/users/${member.id}`}
                          className="font-semibold text-blue-400 transition hover:text-blue-300"
                        >
                          {
                            member.fullName
                          }
                        </Link>

                        <p className="mt-1 text-sm text-gray-400">
                          {
                            member.jobTitle
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                        {member.role}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          member.status ===
                          "Active"
                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                            : member.status ===
                                "Locked"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : member.status ===
                                  "Pending"
                                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                                : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {
                          member.status
                        }
                      </span>

                      <Link
                        href={`/iam/users/${member.id}`}
                        className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                      >
                        View User
                      </Link>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(
                              member.id,
                            )
                          }
                          className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ),
              )}

              {members.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-lg font-semibold text-gray-300">
                    No members assigned
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    No enterprise identities
                    are currently assigned to
                    this group.
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/iam/groups"
              className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              Back to Groups
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

function getInitials(
  fullName: string,
) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (name) =>
        name[0],
    )
    .join("")
    .toUpperCase();
}
