import { defaultIamUsers } from "@/lib/data/iamUsers";

export default function RecentUsersTable() {
  const recentUsers = [...defaultIamUsers]
    .sort(
      (firstUser, secondUser) =>
        new Date(secondUser.createdAt).getTime() -
        new Date(firstUser.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
      <div className="border-b border-white/10 p-5">
        <h2 className="text-xl font-semibold">
          Recent Users
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Most recently created enterprise identities.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-white/10 text-left text-sm text-gray-400">
            <tr>
              <th className="px-6 py-4">
                Name
              </th>

              <th className="px-4 py-4">
                Email
              </th>

              <th className="px-4 py-4">
                Department
              </th>

              <th className="px-4 py-4">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {recentUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-white/5 transition last:border-b-0 hover:bg-zinc-800/40"
              >
                <td className="px-6 py-4 font-medium">
                  {user.fullName}
                </td>

                <td className="px-4 py-4 text-gray-300">
                  {user.email}
                </td>

                <td className="px-4 py-4 text-gray-300">
                  {user.department}
                </td>

                <td className="px-4 py-4">
                  <StatusBadge
                    status={user.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    | "Active"
    | "Locked"
    | "Disabled"
    | "Pending";
}) {
  const classes =
    status === "Active"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : status === "Locked"
        ? "border-red-500/30 bg-red-500/10 text-red-400"
        : status === "Pending"
          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}
