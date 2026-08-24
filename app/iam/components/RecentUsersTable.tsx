import { defaultIamUsers } from "@/lib/data/iamUsers";

export default function RecentUsersTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
      <div className="border-b border-white/10 p-5">
        <h2 className="text-xl font-semibold">
          Recent Users
        </h2>
      </div>

      <table className="w-full">
        <thead className="border-b border-white/10 text-left text-sm text-gray-400">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {defaultIamUsers.slice(0, 5).map((user) => (
            <tr
              key={user.id}
              className="border-b border-white/5 hover:bg-zinc-800/40"
            >
              <td className="px-6 py-4 font-medium">
                {user.fullName}
              </td>

              <td>{user.email}</td>

              <td>{user.department}</td>

              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}