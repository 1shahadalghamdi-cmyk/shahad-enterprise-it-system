"use client";

import Link from "next/link";

import type { IamUser } from "@/lib/data/iamUsers";

import EmptyState from "./EmptyState";
import MfaBadge from "./MfaBadge";
import UserActions from "./UserActions";
import UserStatusBadge from "./UserStatusBadge";

type UsersTableProps = {
  users: IamUser[];
};

function formatDate(value: string) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString("en-SA");
}

export default function UsersTable({
  users,
}: UsersTableProps) {
  if (users.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1450px]">
        <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
          <tr>
            <th className="px-6 py-4">User</th>
            <th className="px-4 py-4">Username</th>
            <th className="px-4 py-4">Department</th>
            <th className="px-4 py-4">Job Title</th>
            <th className="px-4 py-4">Role</th>
            <th className="px-4 py-4">Status</th>
            <th className="px-4 py-4">MFA</th>
            <th className="px-4 py-4">Last Login</th>
            <th className="px-4 py-4">Password Expiry</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {users.map((user) => (
            <tr
              key={user.id}
              className="transition hover:bg-zinc-800/40"
            >
              <td className="px-6 py-5">
                <Link
                  href={`/iam/users/${user.id}`}
                  className="font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  {user.fullName}
                </Link>

                <p className="mt-1 text-sm text-gray-500">
                  {user.email}
                </p>

                <p className="mt-1 text-xs text-gray-700">
                  {user.id} · {user.employeeId}
                </p>
              </td>

              <td className="px-4 py-5 text-gray-300">
                {user.username}
              </td>

              <td className="px-4 py-5 text-gray-300">
                {user.department}
              </td>

              <td className="px-4 py-5 text-gray-400">
                {user.jobTitle}
              </td>

              <td className="px-4 py-5">
                <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                  {user.role}
                </span>
              </td>

              <td className="px-4 py-5">
                <UserStatusBadge status={user.status} />
              </td>

              <td className="px-4 py-5">
                <MfaBadge status={user.mfaStatus} />
              </td>

              <td className="px-4 py-5 text-sm text-gray-400">
                {formatDate(user.lastLogin)}
              </td>

              <td className="px-4 py-5 text-sm text-gray-400">
                {formatDate(user.passwordExpiry)}
              </td>

              <td className="px-6 py-5">
                <UserActions userId={user.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}