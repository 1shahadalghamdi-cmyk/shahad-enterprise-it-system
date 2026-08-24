"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";

const groups = [
  {
    id: "GRP-001",
    name: "IT Administrators",
    type: "Security Group",
    description: "Full administrative privileges.",
    members: [
      "Shahad AlGhamdi",
      "Mohammed Saleh",
      "Sarah Hassan",
      "Omar AlMutairi",
    ],
  },
  {
    id: "GRP-002",
    name: "Microsoft 365",
    type: "Cloud Group",
    description: "Exchange, Teams and OneDrive.",
    members: [
      "Shahad AlGhamdi",
      "Sarah Hassan",
      "Mohammed Saleh",
      "Omar AlMutairi",
      "Noor Ali",
      "Reem Abdullah",
      "Ahmed AlHarbi",
      "Mona AlOtaibi",
    ],
  },
  {
    id: "GRP-003",
    name: "VPN Users",
    type: "Security Group",
    description: "Remote network access.",
    members: [
      "Shahad AlGhamdi",
      "Mohammed Saleh",
      "Sarah Hassan",
      "Omar AlMutairi",
      "Fahad AlQahtani",
      "Noor Ali",
      "Reem Abdullah",
      "Ahmed AlHarbi",
      "Mona AlOtaibi",
      "Ali Nasser",
      "Saad AlZahrani",
      "Yousef Salem",
    ],
  },
  {
    id: "GRP-004",
    name: "Helpdesk Operators",
    type: "Role Group",
    description:
      "Incident management permissions.",
    members: [
      "Sarah Hassan",
      "Mohammed Saleh",
      "Omar AlMutairi",
      "Ali Nasser",
      "Reem Abdullah",
    ],
  },
];

export default function GroupDetailsPage() {
  const params = useParams<{ id: string }>();

  const group = useMemo(
    () =>
      groups.find(
        (item) => item.id === params.id,
      ),
    [params.id],
  );
    if (!group) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-6xl">🔎</p>

            <h1 className="mt-5 text-3xl font-bold">
              Group Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              The requested group does not exist.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Identity Governance
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {group.name}
          </h1>

          <p className="mt-3 text-gray-400">
            {group.description}
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm text-gray-400">
                Group Type
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {group.type}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm text-gray-400">
                Members
              </p>

              <h2 className="mt-3 text-2xl font-bold text-blue-400">
                {group.members.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm text-gray-400">
                Group ID
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {group.id}
              </h2>
            </div>

          </div>
                    <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Group Members
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Users currently assigned to this group.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  + Add Member
                </button>
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {group.members.map((member, index) => (
                <div
                  key={member}
                  className="flex flex-col gap-4 p-6 transition hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 font-bold text-blue-400">
                      {member
                        .split(" ")
                        .slice(0, 2)
                        .map((name) => name[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {member}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Enterprise identity
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                    >
                      View User
                    </button>

                    <button
                      type="button"
                      className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
                    <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              className="rounded-xl border border-yellow-500/30 px-6 py-3 font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
            >
              Edit Group
            </button>

            <button
              type="button"
              className="rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}
