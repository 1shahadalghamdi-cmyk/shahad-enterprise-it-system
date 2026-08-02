"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type DemoUser = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

const demoUsers: DemoUser[] = [
  {
    email: "admin@enterprise.com",
    password: "Admin123!",
    name: "Shahad AlGhamdi",
    role: "IT Admin",
  },
  {
    email: "support@enterprise.com",
    password: "Support123!",
    name: "Eman AlZamil",
    role: "IT Support",
  },
  {
    email: "employee@enterprise.com",
    password: "Employee123!",
    name: "Ahmed AlHarbi",
    role: "Employee",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const user = demoUsers.find(
      (account) =>
        account.email.toLowerCase() ===
          email.toLowerCase().trim() &&
        account.password === password,
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    window.localStorage.setItem(
      "currentUser",
      JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );

    router.push("/dashboard");
  }

  function selectDemoAccount(user: DemoUser) {
    setEmail(user.email);
    setPassword(user.password);
    setError("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">
        <section>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            Enterprise IT Platform
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
            IT Asset Management System
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
            Manage company assets, employees, helpdesk
            tickets, maintenance operations, reports, and
            audit activity from one enterprise portal.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon="💻"
              title="Asset Tracking"
              description="Track ownership, status, assignments, and QR labels."
            />

            <FeatureCard
              icon="🎫"
              title="IT Helpdesk"
              description="Create, update, resolve, and audit support tickets."
            />

            <FeatureCard
              icon="🔧"
              title="Maintenance"
              description="Manage servicing, costs, technicians, and completion."
            />

            <FeatureCard
              icon="📊"
              title="Analytics"
              description="Review KPIs, operational metrics, and reports."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl md:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
              IT
            </div>

            <h2 className="text-3xl font-bold">
              Launch Live Demo
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Sign in with one of the demo roles to explore
              role-based access and system workflows.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="admin@enterprise.com"
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Demo Accounts
            </p>

            <div className="space-y-3">
              {demoUsers.map((user) => (
                <button
                  key={user.role}
                  type="button"
                  onClick={() =>
                    selectDemoAccount(user)
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/60 p-4 text-left transition hover:border-blue-500/50 hover:bg-zinc-950"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {user.role}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {user.email}
                      </p>
                    </div>

                    <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400">
                      Use Account
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Password: {user.password}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
      <div className="text-2xl">
        {icon}
      </div>

      <h2 className="mt-4 font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}
