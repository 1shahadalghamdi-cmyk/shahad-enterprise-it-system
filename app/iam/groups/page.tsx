"use client";

import Sidebar from "@/app/components/system/Sidebar";

const groups = [
  {
    id: "GRP-001",
    name: "IT Administrators",
    type: "Security Group",
    members: 4,
    description: "Full administrative privileges.",
  },
  {
    id: "GRP-002",
    name: "Microsoft 365",
    type: "Cloud Group",
    members: 8,
    description: "Exchange, Teams and OneDrive.",
  },
  {
    id: "GRP-003",
    name: "VPN Users",
    type: "Security Group",
    members: 12,
    description: "Remote network access.",
  },
  {
    id: "GRP-004",
    name: "Helpdesk Operators",
    type: "Role Group",
    members: 5,
    description: "Incident management permissions.",
  },
];

export default function GroupsPage() {
  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Identity Governance
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Groups Management
          </h1>

          <p className="mt-3 text-gray-400">
            Create, manage and organize enterprise security,
            Microsoft 365 and role-based groups.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
  <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
    <p className="text-sm text-gray-400">
      Total Groups
    </p>

    <h2 className="mt-3 text-4xl font-bold text-blue-400">
      {groups.length}
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Enterprise groups
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
    <p className="text-sm text-gray-400">
      Security Groups
    </p>

    <h2 className="mt-3 text-4xl font-bold text-green-400">
      {
        groups.filter((g) =>
          g.type.includes("Security"),
        ).length
      }
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Access control
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
    <p className="text-sm text-gray-400">
      Cloud Groups
    </p>

    <h2 className="mt-3 text-4xl font-bold text-cyan-400">
      {
        groups.filter((g) =>
          g.type.includes("Cloud"),
        ).length
      }
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Microsoft 365
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
    <p className="text-sm text-gray-400">
      Total Members
    </p>

    <h2 className="mt-3 text-4xl font-bold text-purple-400">
      {groups.reduce(
        (sum, g) => sum + g.members,
        0,
      )}
    </h2>

    <p className="mt-2 text-xs text-gray-500">
      Assigned identities
    </p>
  </div>
</div>

<section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900">

  <div className="border-b border-white/10 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Enterprise Groups
        </h2>

        <p className="mt-2 text-gray-400">
          Manage security, cloud and role-based groups.
        </p>
      </div>

      <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">
        + Create Group
      </button>
    </div>
  </div>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead className="border-b border-white/10 text-left text-sm text-gray-400">

        <tr>

          <th className="px-6 py-4">
            Group
          </th>

          <th>
            Type
          </th>

          <th>
            Members
          </th>

          <th>
            Description
          </th>

          <th className="text-right px-6">
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {groups.map((group) => (

          <tr
            key={group.id}
            className="border-b border-white/5 hover:bg-white/5"
          >

            <td className="px-6 py-5">

              <p className="font-semibold">
                {group.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {group.id}
              </p>

            </td>

            <td>
              {group.type}
            </td>

            <td>
              {group.members}
            </td>

            <td className="text-gray-400">
              {group.description}
            </td>

            <td className="px-6">

              <div className="flex justify-end gap-2">

                <button className="rounded-lg border border-blue-500/30 px-3 py-2 text-blue-400">
                  View
                </button>

                <button className="rounded-lg border border-yellow-500/30 px-3 py-2 text-yellow-400">
                  Edit
                </button>

              </div>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</section>

        </div>
      </section>
    </main>
  );
}