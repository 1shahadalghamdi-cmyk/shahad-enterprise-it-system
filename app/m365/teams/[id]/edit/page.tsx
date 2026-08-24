/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  useEffect,
  useMemo,
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
  type M365User,
} from "@/lib/data/m365Users";

import {
  getTeam,
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

export default function EditTeamPage() {
  const router = useRouter();

  const params =
    useParams<{
      id: string;
    }>();

  const teamId =
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
    users,
    setUsers,
  ] =
    useState<M365User[]>([]);

  const [
    team,
    setTeam,
  ] =
    useState<TeamRecord | null>(
      null,
    );

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  const [
    teamName,
    setTeamName,
  ] =
    useState("");

  const [
    ownerId,
    setOwnerId,
  ] =
    useState("");

  const [
    visibility,
    setVisibility,
  ] =
    useState<TeamVisibility>(
      "Private",
    );

  const [
    members,
    setMembers,
  ] =
    useState<string[]>([]);

  const [
    channels,
    setChannels,
  ] =
    useState<string[]>([]);

  const [
    newChannel,
    setNewChannel,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

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
      router.replace(
        "/login",
      );

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
          "m365:manage",
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

      setUsers(
        loadedUsers,
      );

      if (!teamId) {
        setLoaded(true);
        return;
      }

      const foundTeam =
        getTeam(
          teamId,
        ) ?? null;

      setTeam(
        foundTeam,
      );

      if (foundTeam) {
        setTeamName(
          foundTeam.name,
        );

        setOwnerId(
          foundTeam.ownerId,
        );

        setVisibility(
          foundTeam.visibility,
        );

        setMembers(
          foundTeam.members,
        );

        setChannels(
          foundTeam.channels,
        );
      }

      setLoaded(true);
    } catch (
      error
    ) {
      console.error(
        "Failed to load team:",
        error,
      );

      router.replace(
        "/m365/teams",
      );
    }
  }, [
    router,
    teamId,
  ]);

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

  const memberUsers =
    useMemo(
      () =>
        members
          .map(
            (memberId) =>
              users.find(
                (user) =>
                  user.id ===
                  memberId,
              ),
          )
          .filter(
            (
              user,
            ): user is M365User =>
              Boolean(
                user,
              ),
          ),
      [
        members,
        users,
      ],
    );

  const availableUsers =
    useMemo(
      () =>
        enabledUsers.filter(
          (user) =>
            !members.includes(
              user.id,
            ),
        ),
      [
        enabledUsers,
        members,
      ],
    );

  function handleOwnerChange(
    value: string,
  ) {
    setOwnerId(
      value,
    );

    if (
      value &&
      !members.includes(
        value,
      )
    ) {
      setMembers(
        (
          currentMembers,
        ) => [
          ...currentMembers,
          value,
        ],
      );
    }

    setMessage("");
  }

  function handleAddMember(
    userId: string,
  ) {
    if (
      members.includes(
        userId,
      )
    ) {
      return;
    }

    setMembers(
      (
        currentMembers,
      ) => [
        ...currentMembers,
        userId,
      ],
    );

    setMessage("");
  }

  function handleRemoveMember(
    userId: string,
  ) {
    if (
      userId ===
      ownerId
    ) {
      setMessage(
        "The team owner cannot be removed. Change the owner first.",
      );

      return;
    }

    setMembers(
      (
        currentMembers,
      ) =>
        currentMembers.filter(
          (
            memberId,
          ) =>
            memberId !==
            userId,
        ),
    );

    setMessage("");
  }

  function handleAddChannel() {
    const cleanChannel =
      newChannel.trim();

    if (!cleanChannel) {
      setMessage(
        "Enter a channel name.",
      );

      return;
    }

    const exists =
      channels.some(
        (channel) =>
          channel
            .toLowerCase() ===
          cleanChannel.toLowerCase(),
      );

    if (exists) {
      setMessage(
        "This channel already exists.",
      );

      return;
    }

    setChannels(
      (
        currentChannels,
      ) => [
        ...currentChannels,
        cleanChannel,
      ],
    );

    setNewChannel("");
    setMessage("");
  }

  function handleRemoveChannel(
    channelName: string,
  ) {
    if (
      channelName.toLowerCase() ===
      "general"
    ) {
      setMessage(
        "The General channel cannot be removed.",
      );

      return;
    }

    setChannels(
      (
        currentChannels,
      ) =>
        currentChannels.filter(
          (channel) =>
            channel !==
            channelName,
        ),
    );

    setMessage("");
  }

  function handleSave() {
    if (
      !team ||
      !canManageM365
    ) {
      return;
    }

    const cleanName =
      teamName.trim();

    if (!cleanName) {
      setMessage(
        "Team name is required.",
      );

      return;
    }

    if (!ownerId) {
      setMessage(
        "Select a team owner.",
      );

      return;
    }

    if (
      !members.includes(
        ownerId,
      )
    ) {
      setMessage(
        "The team owner must also be a member.",
      );

      return;
    }

    if (
      channels.length ===
      0
    ) {
      setMessage(
        "The team must have at least one channel.",
      );

      return;
    }

    const updatedTeam: TeamRecord = {
      ...team,
      name: cleanName,
      ownerId,
      visibility,
      members,
      channels,
    };

    setSaving(true);

    const allTeams =
      loadTeams();

    const updatedTeams =
      allTeams.map(
        (item) =>
          item.id ===
          updatedTeam.id
            ? updatedTeam
            : item,
      );

    saveTeams(
      updatedTeams,
    );

    setTeam(
      updatedTeam,
    );

    setMessage(
      "Team settings saved successfully.",
    );

    setSaving(false);

    router.push(
      `/m365/teams/${updatedTeam.id}`,
    );
  }

  if (
    !loaded ||
    !currentUser ||
    !canManageM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading team settings...
        </p>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex min-w-0 flex-1 items-center justify-center p-8">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <h1 className="text-3xl font-bold">
              Team Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              This Microsoft Teams workspace does not exist.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/m365/teams",
                )
              }
              className="mt-6 rounded-xl border border-white/10 bg-zinc-950 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Teams
            </button>
          </div>
        </section>
      </main>
    );
  }

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
                Manage Team
              </h1>

              <p className="mt-2 text-gray-400">
                {team.name} • {team.id}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/m365/teams/${team.id}`,
                )
              }
              className="w-fit rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-300">
              {message}
            </div>
          )}

          {/* TEAM SETTINGS */}

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Team Settings
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Workspace Information
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Update the team name, owner, and visibility.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Team Name
                </span>

                <input
                  value={
                    teamName
                  }
                  onChange={(
                    event,
                  ) => {
                    setTeamName(
                      event
                        .target
                        .value,
                    );

                    setMessage("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Team ID
                </span>

                <input
                  value={
                    team.id
                  }
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-gray-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
                  Owner
                </span>

                <select
                  value={
                    ownerId
                  }
                  onChange={(
                    event,
                  ) =>
                    handleOwnerChange(
                      event
                        .target
                        .value,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  {enabledUsers.map(
                    (user) => (
                      <option
                        key={
                          user.id
                        }
                        value={
                          user.id
                        }
                      >
                        {user.name}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">
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
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="Private">
                    Private
                  </option>

                  <option value="Public">
                    Public
                  </option>
                </select>
              </label>
            </div>
          </section>

          {/* CHANNELS */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                Collaboration
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Channels
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Add or remove Microsoft Teams channels.
              </p>
            </div>

            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={
                    newChannel
                  }
                  onChange={(
                    event,
                  ) =>
                    setNewChannel(
                      event
                        .target
                        .value,
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
                  placeholder="Example: Projects"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none transition focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={
                    handleAddChannel
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  Add Channel
                </button>
              </div>
            </div>

            <div className="divide-y divide-white/10">
              {channels.map(
                (channel) => (
                  <div
                    key={
                      channel
                    }
                    className="flex items-center justify-between gap-4 px-6 py-5"
                  >
                    <div>
                      <p className="font-semibold">
                        # {channel}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Microsoft Teams channel
                      </p>
                    </div>

                    {channel.toLowerCase() !==
                      "general" && (
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

          {/* MEMBERS */}

          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-400">
                Membership
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Team Members
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Manage users assigned to this workspace.
              </p>
            </div>

            <div className="divide-y divide-white/10">
              {memberUsers.map(
                (member) => {
                  const isOwner =
                    member.id ===
                    ownerId;

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

                      {!isOwner && (
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

            {availableUsers.length >
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

          {/* ACTIONS */}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                saving
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/m365/teams/${team.id}`,
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
