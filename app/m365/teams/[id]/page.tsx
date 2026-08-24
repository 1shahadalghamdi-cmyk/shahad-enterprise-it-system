"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import { hasPermission } from "@/lib/iam/permissions";

import {
  getTeam,
  loadTeams,
  saveTeams,
  type TeamRecord,
} from "@/lib/data/m365Teams";

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

export default function TeamDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const teamId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [team, setTeam] =
    useState<TeamRecord | null>(null);

  const [loaded, setLoaded] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [newChannel, setNewChannel] =
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
        router.replace("/dashboard");
        return;
      }

      setCurrentUser(parsedUser);

      if (!teamId) {
        setLoaded(true);
        return;
      }

      setTeam(
        getTeam(teamId) ?? null,
      );

      setLoaded(true);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router, teamId]);

  const owner = useMemo(() => {
    if (!team) {
      return undefined;
    }

    return getM365User(
      team.ownerId,
    );
  }, [team]);

  const memberUsers = useMemo(() => {
    if (!team) {
      return [];
    }

    return team.members
      .map((memberId) =>
        getM365User(memberId),
      )
      .filter(
        (
          user,
        ): user is M365User =>
          Boolean(user),
      );
  }, [team]);

  const allUsers = useMemo(() => {
    const userIds = [
      "M365-001",
      "M365-002",
      "M365-003",
      "M365-004",
      "M365-005",
    ];

    return userIds
      .map((id) =>
        getM365User(id),
      )
      .filter(
        (
          user,
        ): user is M365User =>
          Boolean(user),
      );
  }, []);

  const availableUsers =
    useMemo(() => {
      if (!team) {
        return [];
      }

      return allUsers.filter(
        (user) =>
          !team.members.includes(
            user.id,
          ),
      );
    }, [allUsers, team]);

  function updateTeam(
    updatedTeam: TeamRecord,
    successMessage: string,
  ) {
    const teams = loadTeams();

    const updatedTeams =
      teams.map((item) =>
        item.id === updatedTeam.id
          ? updatedTeam
          : item,
      );

    saveTeams(updatedTeams);
    setTeam(updatedTeam);
    setMessage(successMessage);
  }

  function handleAddMember(
    userId: string,
  ) {
    if (
      !team ||
      !canManageM365
    ) {
      return;
    }

    if (
      team.members.includes(
        userId,
      )
    ) {
      return;
    }

    const updatedTeam: TeamRecord = {
      ...team,
      members: [
        ...team.members,
        userId,
      ],
    };

    updateTeam(
      updatedTeam,
      "Member added successfully.",
    );
  }

  function handleRemoveMember(
    userId: string,
  ) {
    if (
      !team ||
      !canManageM365
    ) {
      return;
    }

    if (
      userId === team.ownerId
    ) {
      setMessage(
        "The team owner cannot be removed from the team.",
      );

      return;
    }

    const updatedTeam: TeamRecord = {
      ...team,
      members:
        team.members.filter(
          (memberId) =>
            memberId !== userId,
        ),
    };

    updateTeam(
      updatedTeam,
      "Member removed successfully.",
    );
  }

  function handleAddChannel() {
    if (
      !team ||
      !canManageM365
    ) {
      return;
    }

    const channelName =
      newChannel.trim();

    if (!channelName) {
      setMessage(
        "Enter a channel name.",
      );

      return;
    }

    const alreadyExists =
      team.channels.some(
        (channel) =>
          channel.toLowerCase() ===
          channelName.toLowerCase(),
      );

    if (alreadyExists) {
      setMessage(
        "This channel already exists.",
      );

      return;
    }

    const updatedTeam: TeamRecord = {
      ...team,
      channels: [
        ...team.channels,
        channelName,
      ],
    };

    updateTeam(
      updatedTeam,
      "Channel created successfully.",
    );

    setNewChannel("");
  }

  function handleRemoveChannel(
    channelName: string,
  ) {
    if (
      !team ||
      !canManageM365
    ) {
      return;
    }

    if (
      channelName === "General"
    ) {
      setMessage(
        "The General channel cannot be removed.",
      );

      return;
    }

    const updatedTeam: TeamRecord = {
      ...team,
      channels:
        team.channels.filter(
          (channel) =>
            channel !==
            channelName,
        ),
    };

    updateTeam(
      updatedTeam,
      "Channel removed successfully.",
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
          Loading Microsoft Teams...
        </p>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <p className="text-5xl">
              🔎
            </p>

            <h1 className="mt-5 text-3xl font-bold">
              Team Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              This Microsoft Teams
              workspace does not exist.
            </p>

            <Link
              href="/m365/teams"
              className="mt-6 inline-flex rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-zinc-900"
            >
              Back to Teams
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
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Microsoft 365 Administration
          </p>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold">
                  {team.name}
                </h1>

                <VisibilityBadge
                  visibility={
                    team.visibility
                  }
                />
              </div>

              <p className="mt-2 text-gray-400">
                Microsoft Teams Workspace
                {" • "}
                {team.id}
              </p>
            </div>

            <Link
              href="/m365/teams"
              className="w-fit rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              Back to Teams
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard
              title="Members"
              value={String(
                team.members.length,
              )}
              subtitle="Current team members"
            />

            <StatCard
              title="Channels"
              value={String(
                team.channels.length,
              )}
              subtitle="Workspace channels"
            />

            <StatCard
              title="Visibility"
              value={team.visibility}
              subtitle="Team access level"
            />
          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-4 text-sm text-cyan-300">
              {message}
            </div>
          )}

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Workspace
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Team Information
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Microsoft Teams workspace
                identity and ownership.
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <InfoCard
                title="Team ID"
                value={team.id}
              />

              <InfoCard
                title="Team Name"
                value={team.name}
              />

              <InfoCard
                title="Owner"
                value={
                  owner?.name ||
                  team.ownerId
                }
              />

              <InfoCard
                title="Visibility"
                value={
                  team.visibility
                }
              />
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Collaboration
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Channels
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                View and manage channels
                inside this workspace.
              </p>
            </div>

            {canManageM365 && (
              <div className="border-b border-white/10 p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={newChannel}
                    onChange={(event) =>
                      setNewChannel(
                        event.target.value,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleAddChannel();
                      }
                    }}
                    placeholder="Channel name..."
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50"
                  />

                  <button
                    type="button"
                    onClick={
                      handleAddChannel
                    }
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                  >
                    Add Channel
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-white/10">
              {team.channels.map(
                (channel) => (
                  <div
                    key={channel}
                    className="flex items-center justify-between gap-4 px-6 py-5"
                  >
                    <div>
                      <p className="font-semibold">
                        # {channel}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Microsoft Teams
                        channel
                      </p>
                    </div>

                    {canManageM365 &&
                      channel !==
                        "General" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveChannel(
                              channel,
                            )
                          }
                          className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      )}
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                Membership
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Team Members
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Users assigned to this
                Microsoft Teams workspace.
              </p>
            </div>

            <div className="divide-y divide-white/10">
              {memberUsers.map(
                (member) => {
                  const isOwner =
                    member.id ===
                    team.ownerId;

                  return (
                    <div
                      key={
                        member.id
                      }
                      className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-blue-400">
                            {
                              member.name
                            }
                          </p>

                          {isOwner && (
                            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] font-semibold text-yellow-300">
                              Owner
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            member.email
                          }
                        </p>
                      </div>

                      {canManageM365 &&
                        !isOwner && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(
                                member.id,
                              )
                            }
                            className="w-fit rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                          >
                            Remove Member
                          </button>
                        )}
                    </div>
                  );
                },
              )}
            </div>

            {canManageM365 &&
              availableUsers.length >
                0 && (
                <div className="border-t border-white/10 p-6">
                  <p className="text-sm font-semibold text-gray-300">
                    Add Member
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {availableUsers.map(
                      (
                        availableUser,
                      ) => (
                        <button
                          key={
                            availableUser.id
                          }
                          type="button"
                          onClick={() =>
                            handleAddMember(
                              availableUser.id,
                            )
                          }
                          className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                        >
                          +{" "}
                          {
                            availableUser.name
                          }
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/m365/teams"
              className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              ← Back to Teams
            </Link>

            <Link
              href="/m365/users"
              className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
            >
              View Users
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-2 break-words font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function VisibilityBadge({
  visibility,
}: {
  visibility: "Private" | "Public";
}) {
  return (
    <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
      {visibility}
    </span>
  );
}
