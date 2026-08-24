/* eslint-disable react-hooks/set-state-in-effect */

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

import {
  loadM365Users,
  saveM365Users,
  type M365User,
} from "@/lib/data/m365Users";

import {
  createTeamId,
  loadTeams,
  saveTeams,
  type TeamRecord,
  type TeamVisibility,
} from "@/lib/data/m365Teams";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

export default function MicrosoftTeamsPage() {
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

  const [teams, setTeams] =
    useState<TeamRecord[]>([]);

  const [
    newTeamName,
    setNewTeamName,
  ] = useState("");

  const [
    newTeamOwner,
    setNewTeamOwner,
  ] = useState("");

  const [
    visibility,
    setVisibility,
  ] =
    useState<TeamVisibility>(
      "Private",
    );

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loaded, setLoaded] =
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

      const loadedUsers =
        loadM365Users();

      const loadedTeams =
        loadTeams();

      setUsers(
        loadedUsers,
      );

      setTeams(
        loadedTeams,
      );

      const firstEnabledUser =
        loadedUsers.find(
          (user) =>
            user.teams ===
            "Enabled",
        );

      if (firstEnabledUser) {
        setNewTeamOwner(
          firstEnabledUser.id,
        );
      }

      setLoaded(true);
    } catch (error) {
      console.error(
        "Failed to load Microsoft Teams:",
        error,
      );

      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace(
        "/login",
      );
    }
  }, [router]);

  const enabledUsers =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.teams ===
            "Enabled",
        ),
      [users],
    );

  const filteredTeams =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return teams;
      }

      return teams.filter(
        (team) => {
          const owner =
            users.find(
              (user) =>
                user.id ===
                team.ownerId,
            );

          return (
            team.name
              .toLowerCase()
              .includes(
                query,
              ) ||
            team.id
              .toLowerCase()
              .includes(
                query,
              ) ||
            owner?.name
              .toLowerCase()
              .includes(
                query,
              )
          );
        },
      );
    }, [
      search,
      teams,
      users,
    ]);

  const totalMembers =
    useMemo(
      () =>
        teams.reduce(
          (
            total,
            team,
          ) =>
            total +
            team.members.length,
          0,
        ),
      [teams],
    );

  const totalChannels =
    useMemo(
      () =>
        teams.reduce(
          (
            total,
            team,
          ) =>
            total +
            team.channels.length,
          0,
        ),
      [teams],
    );

  function getUserName(
    userId: string,
  ) {
    return (
      users.find(
        (user) =>
          user.id === userId,
      )?.name ??
      "Unknown User"
    );
  }

  function createTeam() {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to create Microsoft Teams workspaces.",
      );
      return;
    }

    const cleanName =
      newTeamName.trim();

    if (!cleanName) {
      setMessage(
        "Enter a team name.",
      );
      return;
    }

    if (!newTeamOwner) {
      setMessage(
        "Select a team owner.",
      );
      return;
    }

    const duplicate =
      teams.some(
        (team) =>
          team.name
            .toLowerCase() ===
          cleanName.toLowerCase(),
      );

    if (duplicate) {
      setMessage(
        "A team with this name already exists.",
      );
      return;
    }

    const owner =
      users.find(
        (user) =>
          user.id ===
          newTeamOwner,
      );

    if (
      !owner ||
      owner.teams !==
        "Enabled"
    ) {
      setMessage(
        "The selected owner must have Microsoft Teams enabled.",
      );
      return;
    }

    const newTeam: TeamRecord = {
      id: createTeamId(
        teams,
      ),
      name: cleanName,
      ownerId:
        newTeamOwner,
      members: [
        newTeamOwner,
      ],
      channels: [
        "General",
      ],
      visibility,
    };

    const updatedTeams = [
      ...teams,
      newTeam,
    ];

    saveTeams(
      updatedTeams,
    );

    setTeams(
      updatedTeams,
    );

    setNewTeamName("");

    setVisibility(
      "Private",
    );

    setMessage(
      "Team created successfully.",
    );
  }

  function addMember(
    teamId: string,
    userId: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to add team members.",
      );
      return;
    }

    const selectedUser =
      users.find(
        (user) =>
          user.id ===
          userId,
      );

    if (
      !selectedUser ||
      selectedUser.teams !==
        "Enabled"
    ) {
      setMessage(
        "This user does not have Microsoft Teams enabled.",
      );
      return;
    }

    const updatedTeams =
      teams.map(
        (team) => {
          if (
            team.id !==
            teamId
          ) {
            return team;
          }

          if (
            team.members.includes(
              userId,
            )
          ) {
            return team;
          }

          return {
            ...team,

            members: [
              ...team.members,
              userId,
            ],
          };
        },
      );

    saveTeams(
      updatedTeams,
    );

    setTeams(
      updatedTeams,
    );

    setMessage(
      `${selectedUser.name} added successfully.`,
    );
  }

  function toggleTeamsAccess(
    userId: string,
  ) {
    setMessage("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setMessage(
        "You do not have permission to change Microsoft Teams access.",
      );
      return;
    }

    const updatedUsers =
      users.map(
        (user) =>
          user.id === userId
            ? {
                ...user,

                teams:
                  user.teams ===
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
      "Teams access updated successfully.",
    );
  }

  if (
    !loaded ||
    !currentUser ||
    !canViewM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Microsoft
          Teams...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Microsoft 365
                Administration
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Microsoft Teams
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage
                Teams-enabled
                users,
                collaboration
                workspaces,
                owners, members,
                and channels.
              </p>
            </div>

            <Link
              href="/m365/users"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold transition hover:bg-zinc-800"
            >
              View Users
            </Link>
          </div>

          {/* KPI */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Teams"
              value={
                teams.length
              }
              subtitle="Collaboration workspaces"
            />

            <KpiCard
              title="Teams Enabled Users"
              value={
                enabledUsers.length
              }
              subtitle="Users with Teams access"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Members"
              value={
                totalMembers
              }
              subtitle="Total team memberships"
              valueClass="text-blue-400"
            />

            <KpiCard
              title="Channels"
              value={
                totalChannels
              }
              subtitle="Across all teams"
              valueClass="text-purple-400"
            />
          </div>

          {/* CREATE TEAM */}

          {canManageM365 && (
            <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Create Team
              </h2>

              <p className="mt-2 text-gray-400">
                Create a new
                Microsoft Teams
                workspace.
              </p>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr_220px_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Team Name
                  </span>

                  <input
                    value={
                      newTeamName
                    }
                    onChange={(
                      event,
                    ) => {
                      setNewTeamName(
                        event
                          .target
                          .value,
                      );

                      setMessage("");
                    }}
                    placeholder="Example: Finance Operations"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Owner
                  </span>

                  <select
                    value={
                      newTeamOwner
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewTeamOwner(
                        event
                          .target
                          .value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {enabledUsers.length ===
                    0 ? (
                      <option value="">
                        No enabled
                        users
                      </option>
                    ) : (
                      enabledUsers.map(
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
                            }
                          </option>
                        ),
                      )
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Visibility
                  </span>

                  <select
                    value={
                      visibility
                    }
                    onChange={(
                      event,
                    ) =>
                      setVisibility(
                        event
                          .target
                          .value as TeamVisibility,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="Private">
                      Private
                    </option>

                    <option value="Public">
                      Public
                    </option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={
                    createTeam
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                >
                  Create Team
                </button>
              </div>

              {message && (
                <div className="mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                  {message}
                </div>
              )}
            </section>
          )}

          {/* DIRECTORY HEADER */}

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Teams Directory
                </h2>

                <p className="mt-2 text-gray-400">
                  View and manage
                  collaboration
                  workspaces.
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
                placeholder="Search teams..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 lg:max-w-sm"
              />
            </div>
          </section>

          {/* TEAM CARDS */}

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            {filteredTeams.map(
              (team) => {
                const availableMembers =
                  enabledUsers.filter(
                    (user) =>
                      !team.members.includes(
                        user.id,
                      ),
                  );

                return (
                  <article
                    key={
                      team.id
                    }
                    className="rounded-2xl border border-white/10 bg-zinc-900 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                          {
                            team.id
                          }
                        </p>

                        <h3 className="mt-2 text-2xl font-semibold">
                          {
                            team.name
                          }
                        </h3>

                        <p className="mt-2 text-sm text-gray-400">
                          Owner:{" "}
                          {getUserName(
                            team.ownerId,
                          )}
                        </p>
                      </div>

                      <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                        {
                          team.visibility
                        }
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <MiniStat
                        label="Members"
                        value={
                          team.members
                            .length
                        }
                      />

                      <MiniStat
                        label="Channels"
                        value={
                          team.channels
                            .length
                        }
                      />
                    </div>

                    {/* CHANNELS */}

                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-300">
                        Channels
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {team.channels.map(
                          (
                            channel,
                          ) => (
                            <span
                              key={
                                channel
                              }
                              className="rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs text-purple-300"
                            >
                              #{" "}
                              {
                                channel
                              }
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    {/* MEMBERS */}

                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-300">
                        Members
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {team.members.map(
                          (
                            memberId,
                          ) => (
                            <span
                              key={
                                memberId
                              }
                              className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs text-gray-300"
                            >
                              {getUserName(
                                memberId,
                              )}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    {/* ADD MEMBER */}

                    {canManageM365 &&
                      availableMembers.length >
                        0 && (
                        <div className="mt-6">
                          <p className="mb-2 text-sm font-medium text-gray-300">
                            Add Member
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {availableMembers.map(
                              (
                                user,
                              ) => (
                                <button
                                  key={
                                    user.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    addMember(
                                      team.id,
                                      user.id,
                                    )
                                  }
                                  className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                                >
                                  +{" "}
                                  {
                                    user.name
                                  }
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* ACTIONS */}

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                      <Link
                        href={`/m365/teams/${team.id}`}
                        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                      >
                        View
                      </Link>

                      {canManageM365 && (
                        <Link
                          href={`/m365/teams/${team.id}/edit`}
                          className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/20"
                        >
                          Manage
                        </Link>
                      )}
                    </div>
                  </article>
                );
              },
            )}

            {filteredTeams.length ===
              0 && (
              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center text-gray-500 xl:col-span-2">
                No teams found.
              </div>
            )}
          </section>

          {/* USER ACCESS */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Teams User Access
              </h2>

              <p className="mt-2 text-gray-400">
                View Microsoft
                Teams access
                status for each
                user.
              </p>
            </div>

            <div className="divide-y divide-white/5">
              {users.map(
                (user) => (
                  <div
                    key={
                      user.id
                    }
                    className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
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
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge
                        status={
                          user.teams
                        }
                      />

                      {canManageM365 && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleTeamsAccess(
                              user.id,
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                            user.teams ===
                            "Enabled"
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                              : "border-green-500/30 text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {user.teams ===
                          "Enabled"
                            ? "Disable"
                            : "Enable"}
                        </button>
                      )}
                    </div>
                  </div>
                ),
              )}
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

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
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
    status ===
    "Enabled";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        enabled
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}
