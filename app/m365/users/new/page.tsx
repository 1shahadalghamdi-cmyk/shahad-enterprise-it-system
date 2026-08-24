"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import { hasPermission } from "@/lib/iam/permissions";
import {
  getNextM365UserId,
  loadM365Users,
  saveM365Users,
  type M365User,
} from "@/lib/data/m365Users";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

const licenses = [
  "Microsoft 365 E5",
  "Microsoft 365 E3",
  "Business Premium",
  "Business Standard",
];

const departments = [
  "Information Technology",
  "Human Resources",
  "Finance",
  "Operations",
  "Administration",
];

export default function NewMicrosoft365UserPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [department, setDepartment] = useState(
    "Information Technology",
  );

  const [license, setLicense] = useState(
    "Microsoft 365 E3",
  );

  const [exchangeEnabled, setExchangeEnabled] =
    useState(true);

  const [teamsEnabled, setTeamsEnabled] =
    useState(true);

  const [oneDriveEnabled, setOneDriveEnabled] =
    useState(true);

  const [mfaRequired, setMfaRequired] =
    useState(true);

  const [error, setError] = useState("");

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
          "m365:manage",
        )
      ) {
        router.replace("/m365/users");
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

  function generateIdentity() {
    if (!canManageM365) {
      setError(
        "You do not have permission to create Microsoft 365 users.",
      );
      return;
    }

    if (!fullName.trim()) {
      setError(
        "Enter the full name before generating the identity.",
      );
      return;
    }

    const generatedUsername = fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, ".");

    setUsername(generatedUsername);
    setEmail(
      `${generatedUsername}@enterprise.com`,
    );

    setError("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!currentUser || !canManageM365) {
      setError(
        "You do not have permission to create Microsoft 365 users.",
      );
      return;
    }

    if (
      fullName.trim().length < 3 ||
      username.trim().length < 3 ||
      !email.includes("@") ||
      jobTitle.trim().length < 2
    ) {
      setError(
        "Complete all required user and employment information.",
      );
      return;
    }

    const users = loadM365Users();

    const duplicateUsername = users.some(
      (user) =>
        (user.username ?? "").toLowerCase() ===
        username.trim().toLowerCase(),
    );

    const duplicateEmail = users.some(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase(),
    );

    if (duplicateUsername || duplicateEmail) {
      setError(
        "The username or email address is already assigned.",
      );
      return;
    }

    const newUser: M365User = {
      id: getNextM365UserId(users),
      name: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      jobTitle: jobTitle.trim(),
      department,
      license,
      exchange: exchangeEnabled
        ? "Enabled"
        : "Disabled",
      teams: teamsEnabled
        ? "Enabled"
        : "Disabled",
      oneDrive: oneDriveEnabled
        ? "Enabled"
        : "Disabled",
      mfa: mfaRequired
        ? "Enabled"
        : "Disabled",
      status: "Active",
    };

    saveM365Users([...users, newUser]);

    router.push("/m365/users");
  }

  if (!currentUser || !canManageM365) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Checking Microsoft 365 permissions...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Microsoft 365 Administration
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Create Microsoft 365 User
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Create a Microsoft 365 identity,
              assign a license, and configure
              Exchange, Teams, OneDrive, and MFA.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Identity Information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Full Name">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value);
                      setError("");
                    }}
                    placeholder="Example: Omar AlMutairi"
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="Username">
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError("");
                    }}
                    placeholder="omar.almutairi"
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="Enterprise Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    placeholder="omar.almutairi@enterprise.com"
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="Job Title">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(event) => {
                      setJobTitle(event.target.value);
                      setError("");
                    }}
                    placeholder="IT Support Specialist"
                    className="input-style"
                    required
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={generateIdentity}
                className="mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                Generate Username & Email
              </button>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Employment & License
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Department">
                  <select
                    value={department}
                    onChange={(event) =>
                      setDepartment(
                        event.target.value,
                      )
                    }
                    className="input-style"
                  >
                    {departments.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Microsoft 365 License">
                  <select
                    value={license}
                    onChange={(event) =>
                      setLicense(event.target.value)
                    }
                    className="input-style"
                  >
                    {licenses.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Cloud Services
              </h2>

              <p className="mt-2 text-gray-400">
                Configure services that will be
                enabled for this account.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ServiceToggle
                  label="Exchange Online"
                  description="Create and enable the user mailbox."
                  enabled={exchangeEnabled}
                  onChange={setExchangeEnabled}
                />

                <ServiceToggle
                  label="Microsoft Teams"
                  description="Enable chat, meetings, and collaboration."
                  enabled={teamsEnabled}
                  onChange={setTeamsEnabled}
                />

                <ServiceToggle
                  label="OneDrive"
                  description="Provision personal cloud storage."
                  enabled={oneDriveEnabled}
                  onChange={setOneDriveEnabled}
                />

                <ServiceToggle
                  label="Require MFA"
                  description="Require multi-factor authentication enrollment."
                  enabled={mfaRequired}
                  onChange={setMfaRequired}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
              <h2 className="text-lg font-semibold text-blue-300">
                Provisioning Summary
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryItem
                  label="User"
                  value={
                    fullName || "Not entered"
                  }
                />

                <SummaryItem
                  label="License"
                  value={license}
                />

                <SummaryItem
                  label="Enabled Services"
                  value={String(
                    [
                      exchangeEnabled,
                      teamsEnabled,
                      oneDriveEnabled,
                    ].filter(Boolean).length,
                  )}
                />

                <SummaryItem
                  label="MFA"
                  value={
                    mfaRequired
                      ? "Required"
                      : "Not Required"
                  }
                />
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
              >
                Create User
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/m365/users")
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-7 py-3 font-semibold transition hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>

      <style jsx>{`
        .input-style {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid
            rgb(255 255 255 / 0.1);
          background: rgb(9 9 11);
          padding: 0.75rem 1rem;
          outline: none;
        }

        .input-style:focus {
          border-color: rgb(59 130 246);
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function ServiceToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="flex items-center justify-between gap-5 rounded-xl border border-white/10 bg-zinc-950 p-5 text-left transition hover:border-blue-500/30"
    >
      <div>
        <p className="font-semibold">
          {label}
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>

      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-blue-600"
            : "bg-zinc-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
