"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type UserActionsProps = {
  userId: string;
};

export default function UserActions({
  userId,
}: UserActionsProps) {
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
    <div className="flex gap-2">
      <Link
        href={`/iam/users/${userId}`}
        className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
      >
        View
      </Link>

      {canManage && (
        <Link
          href={`/iam/users/${userId}/edit`}
          className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
        >
          Edit
        </Link>
      )}
    </div>
  );
}
