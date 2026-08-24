"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import {
  defaultIamUsers,
  type IamUser,
} from "@/lib/data/iamUsers";

import AssignedAssets from "./components/AssignedAssets";
import OpenTickets from "./components/OpenTickets";
import ProfileCard from "./components/ProfileCard";
import SecurityTimeline from "./components/SecurityTimeline";
import UserGroups from "./components/UserGroups";
import UserInfo from "./components/UserInfo";

const STORAGE_KEY = "iamUsers";

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();

  const userId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [user, setUser] =
    useState<IamUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const savedUsers =
      window.localStorage.getItem(STORAGE_KEY);

    let users: IamUser[] = defaultIamUsers;

    if (savedUsers) {
      try {
        const parsedUsers =
          JSON.parse(savedUsers) as IamUser[];

        if (Array.isArray(parsedUsers)) {
          users = parsedUsers;
        }
      } catch {
        users = defaultIamUsers;
      }
    }

    const matchedUser =
      users.find(
        (item) => item.id === userId,
      ) || null;

    setUser(matchedUser);
    setLoading(false);
  }, [userId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading user profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <p className="text-5xl">
              🔎
            </p>

            <h1 className="mt-5 text-3xl font-bold">
              User not found
            </h1>

            <p className="mt-3 text-gray-400">
              The requested identity record does not exist.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 space-y-8 p-8">
        <ProfileCard user={user} />

        <div className="grid gap-8 xl:grid-cols-2">
          <UserInfo user={user} />

          <AssignedAssets />
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <UserGroups />

          <OpenTickets />
        </div>

        <SecurityTimeline />
      </section>
    </main>
  );
}