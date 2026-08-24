"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  defaultIamGroups,
  type IamGroup,
} from "@/lib/data/iamGroups";

const GROUPS_STORAGE_KEY =
  "iamGroups";

function loadGroups(): IamGroup[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultIamGroups;
  }

  const savedGroups =
    window.localStorage.getItem(
      GROUPS_STORAGE_KEY,
    );

  if (!savedGroups) {
    window.localStorage.setItem(
      GROUPS_STORAGE_KEY,
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

    const hasInvalidData =
      parsedGroups.some(
        (group) =>
          !Array.isArray(
            group.memberIds,
          ),
      );

    if (hasInvalidData) {
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

export default function UserGroups({
  userId,
}: {
  userId: string;
}) {
  const [
    groups,
    setGroups,
  ] =
    useState<IamGroup[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    setGroups(
      loadGroups(),
    );

    setLoading(false);
  }, []);

  const userGroups =
    useMemo(() => {
      return groups.filter(
        (group) =>
          group.memberIds.includes(
            userId,
          ),
      );
    }, [
      groups,
      userId,
    ]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold">
          Group Membership
        </h2>

        <p className="mt-6 text-sm text-gray-500">
          Loading group memberships...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

      <h2 className="text-2xl font-bold">
        Group Membership
      </h2>

      <p className="mt-2 text-gray-400">
        Active Directory and Microsoft 365 groups
        assigned to this user.
      </p>

      {userGroups.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-zinc-950 p-6 text-center">

          <p className="font-semibold text-gray-300">
            No group memberships
          </p>

          <p className="mt-2 text-sm text-gray-500">
            This identity is not currently
            assigned to any groups.
          </p>

        </div>
      ) : (
        <div className="mt-6 space-y-4">

          {userGroups.map(
            (group) => (
              <div
                key={group.id}
                className="rounded-xl border border-white/10 bg-zinc-950 p-4"
              >

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h3 className="font-semibold">
                      {group.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-600">
                      {group.id}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      group.type ===
                      "Security Group"
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : group.type ===
                            "Cloud Group"
                          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                          : "border-purple-500/30 bg-purple-500/10 text-purple-400"
                    }`}
                  >
                    {group.type}
                  </span>

                </div>

                <p className="mt-3 text-sm text-gray-400">
                  {group.description}
                </p>

                <p className="mt-3 text-xs text-gray-600">
                  Department:{" "}
                  {group.department}
                </p>

              </div>
            ),
          )}

        </div>
      )}

    </section>
  );
}