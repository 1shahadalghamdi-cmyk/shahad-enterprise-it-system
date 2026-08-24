"use client";

import Sidebar from "@/app/components/system/Sidebar";

export default function HelpdeskPage() {
  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            🎧 IT Helpdesk
          </h1>

          <p className="mt-2 text-gray-400">
            Manage incidents, service requests, SLA,
            technicians, and ITIL workflows.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-sm text-gray-400">
              Open Incidents
            </p>

            <h2 className="mt-4 text-4xl font-bold text-blue-400">
              24
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-sm text-gray-400">
              Critical Incidents
            </p>

            <h2 className="mt-4 text-4xl font-bold text-red-500">
              3
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-sm text-gray-400">
              SLA Breached
            </p>

            <h2 className="mt-4 text-4xl font-bold text-orange-400">
              2
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-sm text-gray-400">
              Avg Resolution
            </p>

            <h2 className="mt-4 text-4xl font-bold text-green-400">
              4.2h
            </h2>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-2xl font-semibold">
              Recent Incidents
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Latest helpdesk incidents across the organization.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-white/10 text-left text-sm text-gray-400">
                <tr>
                  <th className="px-6 py-4">
                    Incident
                  </th>

                  <th className="px-4 py-4">
                    Employee
                  </th>

                  <th className="px-4 py-4">
                    Priority
                  </th>

                  <th className="px-4 py-4">
                    Status
                  </th>

                  <th className="px-4 py-4">
                    Assigned To
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                <tr className="transition hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium">
                    INC-1025
                  </td>

                  <td className="px-4 py-4">
                    Ahmed AlHarbi
                  </td>

                  <td className="px-4 py-4 text-red-500">
                    Critical
                  </td>

                  <td className="px-4 py-4 text-yellow-400">
                    Open
                  </td>

                  <td className="px-4 py-4">
                    Sarah
                  </td>
                </tr>

                <tr className="transition hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium">
                    INC-1024
                  </td>

                  <td className="px-4 py-4">
                    Noor Ali
                  </td>

                  <td className="px-4 py-4 text-orange-400">
                    High
                  </td>

                  <td className="px-4 py-4 text-blue-400">
                    In Progress
                  </td>

                  <td className="px-4 py-4">
                    Mohammed
                  </td>
                </tr>

                <tr className="transition hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium">
                    INC-1023
                  </td>

                  <td className="px-4 py-4">
                    Fahad AlQahtani
                  </td>

                  <td className="px-4 py-4 text-green-400">
                    Low
                  </td>

                  <td className="px-4 py-4 text-green-500">
                    Resolved
                  </td>

                  <td className="px-4 py-4">
                    Ali
                  </td>
                </tr>

                <tr className="transition hover:bg-zinc-800/50">
                  <td className="px-6 py-4 font-medium">
                    INC-1022
                  </td>

                  <td className="px-4 py-4">
                    Reem Abdullah
                  </td>

                  <td className="px-4 py-4 text-yellow-300">
                    Medium
                  </td>

                  <td className="px-4 py-4 text-purple-400">
                    Waiting for User
                  </td>

                  <td className="px-4 py-4">
                    Yousef
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h3 className="font-semibold">
              Critical
            </h3>

            <p className="mt-4 text-5xl font-bold text-red-500">
              3
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Incidents requiring immediate attention.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h3 className="font-semibold">
              Assigned Today
            </h3>

            <p className="mt-4 text-5xl font-bold text-blue-400">
              14
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Incidents assigned to technicians today.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h3 className="font-semibold">
              SLA Compliance
            </h3>

            <p className="mt-4 text-5xl font-bold text-green-400">
              98%
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Incidents completed within agreed SLA targets.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}