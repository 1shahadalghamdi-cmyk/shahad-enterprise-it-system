"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";

import {
  defaultIamGroups,
  type IamGroup,
  type IamGroupType,
} from "@/lib/data/iamGroups";

const STORAGE_KEY = "iamGroups";

function loadGroups(): IamGroup[] {
  if (typeof window === "undefined") {
    return defaultIamGroups;
  }

  const savedGroups =
    window.localStorage.getItem(
      STORAGE_KEY,
    );

  if (!savedGroups) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultIamGroups),
    );

    return defaultIamGroups;
  }

  try {
    const parsedGroups =
      JSON.parse(savedGroups) as IamGroup[];

    if (!Array.isArray(parsedGroups)) {
      return defaultIamGroups;
    }

    const hasOldData = parsedGroups.some(
      (group) =>
        !Array.isArray(group.memberIds),
    );

    if (hasOldData) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultIamGroups),
      );

      return defaultIamGroups;
    }

    return parsedGroups;
  } catch {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultIamGroups),
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
    STORAGE_KEY,
    JSON.stringify(groups),
  );
}

export default function EditGroupPage() {
  const router = useRouter();

  const params =
    useParams<{ id: string }>();

  const groupId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [groups, setGroups] =
    useState<IamGroup[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [groupName, setGroupName] =
    useState("");

  const [groupType, setGroupType] =
    useState<IamGroupType>(
      "Security Group",
    );

  const [description, setDescription] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    setGroups(loadGroups());
    setLoading(false);
  }, []);

  const group = useMemo(
    () =>
      groups.find(
        (item) =>
          item.id === groupId,
      ) || null,
    [groupId, groups],
  );

  useEffect(() => {
    if (!group) {
      return;
    }

    setGroupName(group.name);
    setGroupType(group.type);
    setDescription(
      group.description,
    );
    setDepartment(
      group.department,
    );
  }, [group]);

  const hasChanges = useMemo(() => {
    if (!group) {
      return false;
    }

    return (
      groupName !== group.name ||
      groupType !== group.type ||
      description !==
        group.description ||
      department !==
        group.department
    );
  }, [
    description,
    department,
    group,
    groupName,
    groupType,
  ]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!group) {
      return;
    }

    if (!groupName.trim()) {
      setError(
        "Group name is required.",
      );

      return;
    }

    if (!description.trim()) {
      setError(
        "Description is required.",
      );

      return;
    }

    if (!department.trim()) {
      setError(
        "Department is required.",
      );

      return;
    }

    const updatedGroups =
      groups.map((item) =>
        item.id === group.id
          ? {
              ...item,
              name: groupName.trim(),
              type: groupType,
              description:
                description.trim(),
              department:
                department.trim(),
            }
          : item,
      );

    saveGroups(updatedGroups);
    setGroups(updatedGroups);

    setSuccess(
      "Group updated successfully.",
    );

    window.setTimeout(() => {
      router.push(
        `/iam/groups/${group.id}`,
      );
    }, 500);
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <p className="text-5xl">
            🔎
          </p>

          <h1 className="mt-5 text-3xl font-bold">
            Group not found
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/iam/groups",
              )
            }
            className="mt-6 rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-zinc-900"
          >
            Back to Groups
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Identity Governance
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Edit Group
          </h1>

          <p className="mt-3 text-gray-400">
            Update group information,
            description and type.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]"
          >

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

              <h2 className="text-xl font-semibold">
                Group Information
              </h2>

              <div className="mt-6 space-y-5">

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Group Name
                  </span>

                  <input
                    type="text"
                    value={groupName}
                    onChange={(event) => {
                      setGroupName(
                        event.target.value,
                      );

                      setError("");
                      setSuccess("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Group Type
                  </span>

                  <select
                    value={groupType}
                    onChange={(event) => {
                      setGroupType(
                        event.target
                          .value as IamGroupType,
                      );

                      setError("");
                      setSuccess("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="Security Group">
                      Security Group
                    </option>

                    <option value="Cloud Group">
                      Cloud Group
                    </option>

                    <option value="Role Group">
                      Role Group
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Department
                  </span>

                  <input
                    type="text"
                    value={department}
                    onChange={(event) => {
                      setDepartment(
                        event.target.value,
                      );

                      setError("");
                      setSuccess("");
                    }}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Description
                  </span>

                  <textarea
                    rows={6}
                    value={description}
                    onChange={(event) => {
                      setDescription(
                        event.target.value,
                      );

                      setError("");
                      setSuccess("");
                    }}
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>

              </div>
            </section>

            <aside className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

              <h2 className="text-xl font-semibold">
                Group Summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs text-gray-500">
                    Group ID
                  </p>

                  <p className="mt-2 font-semibold">
                    {group.id}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs text-gray-500">
                    Members
                  </p>

                  <p className="mt-2 text-2xl font-bold text-blue-400">
                    {group.memberIds.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs text-gray-500">
                    Changes
                  </p>

                  <p
                    className={`mt-2 font-semibold ${
                      hasChanges
                        ? "text-yellow-300"
                        : "text-gray-300"
                    }`}
                  >
                    {hasChanges
                      ? "Unsaved"
                      : "No Changes"}
                  </p>
                </div>

              </div>
            </aside>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 lg:col-span-2">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300 lg:col-span-2">
                {success}
              </div>
            )}

            <div className="flex flex-wrap gap-4 lg:col-span-2">

              <button
                type="submit"
                disabled={!hasChanges}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/iam/groups/${group.id}`,
                  )
                }
                className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-zinc-900"
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
