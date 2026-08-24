"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import { hasPermission } from "@/lib/iam/permissions";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

const cards = [
  {
    title: "Licensed Users",
    value: "284",
    color: "text-blue-400",
    subtitle: "Microsoft 365 accounts",
  },
  {
    title: "Exchange Mailboxes",
    value: "271",
    color: "text-green-400",
    subtitle: "Active mailboxes",
  },
  {
    title: "Teams Users",
    value: "263",
    color: "text-cyan-400",
    subtitle: "Enabled users",
  },
  {
    title: "OneDrive Storage",
    value: "12.5 TB",
    color: "text-purple-400",
    subtitle: "Organization usage",
  },
];

const services = [
  {
    name: "Users",
    href: "/m365/users",
  },
  {
    name: "Licenses",
    href: "/m365/licenses",
  },
  {
    name: "Exchange Online",
    href: "/m365/exchange",
  },
  {
    name: "Microsoft Teams",
    href: "/m365/teams",
  },
  {
    name: "OneDrive",
    href: "/m365/onedrive",
  },
  {
    name: "Security Center",
    href: "/m365/security",
  },
];

export default function Microsoft365Page() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const canViewM365 =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:view",
    );

  const canManageM365 =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "m365:manage",
    );

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(savedCurrentUser) as CurrentUser;

      if (
        !hasPermission(
          parsedUser.role,
          "m365:view",
        )
      ) {
        router.replace("/dashboard");
        return;
      }

      setCurrentUser(parsedUser);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  if (!currentUser || !canViewM365) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading Microsoft 365...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Microsoft 365 Administration
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Microsoft 365 Admin Center
          </h1>

          <p className="mt-3 max-w-3xl text-gray-400">
            Manage Microsoft 365 users,
            licenses, Exchange Online,
            Microsoft Teams, OneDrive and
            enterprise security.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-zinc-900 p-6"
              >
                <p className="text-sm text-gray-400">
                  {card.title}
                </p>

                <h2
                  className={`mt-3 text-4xl font-bold ${card.color}`}
                >
                  {card.value}
                </h2>

                <p className="mt-2 text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Microsoft 365 Services
              </h2>

              <p className="mt-2 text-gray-400">
                Core cloud services available
                for enterprise administration.
              </p>
            </div>

            <div className="divide-y divide-white/5">
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-6 hover:bg-white/5"
                >
                  <span className="font-medium">
                    {service.name}
                  </span>

                  <Link
                    href={service.href}
                    className="rounded-lg border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                  >
                    {canManageM365
                      ? "Manage"
                      : "View"}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}