"use client";

import { useState } from "react";

import Sidebar from "@/app/components/system/Sidebar";

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] =
    useState("Security Group");

  const generatedId =
    "GRP-" +
    String(
      Math.floor(Math.random() * 900 + 100),
    );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Identity Governance
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Create Group
          </h1>

          <p className="mt-3 text-gray-400">
            Create a new enterprise security,
            Microsoft 365 or role group.
          </p>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
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
                    onChange={(event) =>
                      setGroupName(event.target.value)
                    }
                    placeholder="Example: Finance Managers"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Group Type
                  </span>

                  <select
                    value={groupType}
                    onChange={(event) =>
                      setGroupType(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="Security Group">
                      Security Group
                    </option>

                    <option value="Cloud Group">
                      Microsoft 365 Group
                    </option>

                    <option value="Role Group">
                      Role Group
                    </option>

                    <option value="Distribution List">
                      Distribution List
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">
                    Description
                  </span>

                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe the group purpose and access scope."
                    rows={6}
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </label>
              </div>
            </section>
                        <aside className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                Group Summary
              </p>

              <div className="mt-6 space-y-5">
                <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Group ID
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {generatedId}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Group Name
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {groupName || "Not entered"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Group Type
                  </p>

                  <p className="mt-2 font-semibold text-cyan-400">
                    {groupType}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Initial Members
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    0
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="font-semibold text-blue-300">
                  Provisioning Note
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Members can be assigned after the group
                  is created.
                </p>
              </div>
            </aside>
          </div>
                    <div className="mt-8 flex gap-4">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Create Group
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-zinc-900"
            >
              Cancel
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}
