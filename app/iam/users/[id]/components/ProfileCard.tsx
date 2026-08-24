"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import type { IamUser } from "@/lib/data/iamUsers";

import MfaBadge from "@/app/iam/users/components/MfaBadge";
import UserStatusBadge from "@/app/iam/users/components/UserStatusBadge";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type ProfileCardProps = {
  user: IamUser;
};

function getInitials(
  fullName: string,
) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();
}

export default function ProfileCard({
  user,
}: ProfileCardProps) {
  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  useEffect(() => {
    const savedUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedUser) {
      return;
    }

    try {
      setCurrentUser(
        JSON.parse(
          savedUser,
        ) as CurrentUser,
      );
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const canManage =
    currentUser?.role ===
    "IT Admin";

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl font-bold text-blue-400">
            {getInitials(
              user.fullName,
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-500">
              Identity Profile
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {user.fullName}
            </h1>

            <p className="mt-2 text-gray-400">
              {user.jobTitle} ·{" "}
              {user.department}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <UserStatusBadge
                status={user.status}
              />

              <MfaBadge
                status={
                  user.mfaStatus
                }
              />

              <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {canManage && (
            <Link
              href={`/iam/users/${user.id}/edit`}
              className="rounded-xl border border-yellow-500/30 px-5 py-3 font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
            >
              Edit User
            </Link>
          )}

          <Link
            href="/iam/users"
            className="rounded-xl border border-white/10 bg-zinc-950 px-5 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
          >
            Back to Users
          </Link>
        </div>
      </div>
    </section>
  );
}
