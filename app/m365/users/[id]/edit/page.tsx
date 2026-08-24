"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import { hasPermission } from "@/lib/iam/permissions";
import {
  loadM365Users,
  saveM365Users,
  type M365ServiceStatus,
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

export default function EditMicrosoft365UserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const userId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [users, setUsers] =
    useState<M365User[]>([]);

  const [name, setName] = useState("");

  const [username, setUsername] =
    useState("");

  const [email, setEmail] = useState("");

  const [jobTitle, setJobTitle] =
    useState("");

  const [department, setDepartment] =
    useState("Information Technology");

  const [license, setLicense] =
    useState("Microsoft 365 E3");

  const [exchange, setExchange] =
    useState<M365ServiceStatus>("Enabled");

  const [teams, setTeams] =
    useState<M365ServiceStatus>("Enabled");

  const [oneDrive, setOneDrive] =
    useState<M365ServiceStatus>("Enabled");

  const [mfa, setMfa] =
    useState<M365ServiceStatus>("Enabled");

  const [status, setStatus] =
    useState<"Active" | "Disabled">("Active");

  const [loaded, setLoaded] = useState(false);
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
      setUsers(loadM365Users());
      setLoaded(true);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  const user = useMemo(
    () =>
      users.find(
        (item) => item.id === userId,
      ) || null,
    [users, userId],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setUsername(user.username ?? "");
    setEmail(user.email);

    setJobTitle(
      user.jobTitle ?? "",
    );

    setDepartment(
      user.department ||
        "Information Technology",
    );

    setLicense(user.license);
    setExchange(user.exchange);
    setTeams(user.teams);
    setOneDrive(user.oneDrive);

    setMfa(
      user.mfa ?? "Disabled",
    );

    setStatus(
      user.status ?? "Active",
    );
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) {
      return false;
    }

    return (
      name.trim() !== user.name ||
      username.trim() !==
        (user.username ?? "") ||
      email.trim().toLowerCase() !==
        user.email.toLowerCase() ||
      jobTitle.trim() !==
        (user.jobTitle ?? "") ||
      department !==
        (user.department ||
          "Information Technology") ||
      license !== user.license ||
      exchange !== user.exchange ||
      teams !== user.teams ||
      oneDrive !== user.oneDrive ||
      mfa !==
        (user.mfa ?? "Disabled") ||
      status !==
        (user.status ?? "Active")
    );
  }, [
    department,
    email,
    exchange,
    jobTitle,
    license,
    mfa,
    name,
    oneDrive,
    status,
    teams,
    user,
    username,
  ]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (
      !currentUser ||
      !canManageM365
    ) {
      setError(
        "You do not have permission to edit Microsoft 365 users.",
      );
      return;
    }

    if (!user) {
      return;
    }

    if (
      name.trim().length < 3 ||
      username.trim().length < 3 ||
      !email.includes("@") ||
      jobTitle.trim().length < 2
    ) {
      setError(
        "Complete all required identity and employment information.",
      );
      return;
    }

    const duplicateUsername =
      users.some(
        (item) =>
          item.id !== user.id &&
          (item.username ?? "")
            .toLowerCase() ===
            username
              .trim()
              .toLowerCase(),
      );

    const duplicateEmail =
      users.some(
        (item) =>
          item.id !== user.id &&
          item.email.toLowerCase() ===
            email
              .trim()
              .toLowerCase(),
      );

    if (
      duplicateUsername ||
      duplicateEmail
    ) {
      setError(
        "The username or email address is already assigned to another user.",
      );
      return;
    }

    const updatedUser: M365User = {
      ...user,
      name: name.trim(),
      username:
        username.trim().toLowerCase(),
      email:
        email.trim().toLowerCase(),
      jobTitle: jobTitle.trim(),
      department,
      license,
      exchange,
      teams,
      oneDrive,
      mfa,
      status,
    };

    const updatedUsers =
      users.map((item) =>
        item.id === updatedUser.id
          ? updatedUser
          : item,
      );

    saveM365Users(updatedUsers);

    router.push(
      `/m365/users/${updatedUser.id}`,
    );
  }

  if (
    !loaded ||
    !currentUser ||
    !canManageM365
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Checking Microsoft 365
          permissions...
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
              User Not Found
            </h1>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/m365/users",
                )
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Back to Users
            </button>
          </div>
        </section>
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
              Edit User
            </h1>

            <p className="mt-3 text-gray-400">
              Update Microsoft 365 identity,
              license, services, MFA, and
              account status.
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
                    value={name}
                    onChange={(event) => {
                      setName(
                        event.target.value,
                      );
                      setError("");
                    }}
                    className="input-style"
                  />
                </Field>

                <Field label="Username">
                  <input
                    value={username}
                    onChange={(event) => {
                      setUsername(
                        event.target.value,
                      );
                      setError("");
                    }}
                    className="input-style"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(
                        event.target.value,
                      );
                      setError("");
                    }}
                    className="input-style"
                  />
                </Field>

                <Field label="User ID">
                  <input
                    value={user.id}
                    disabled
                    className="input-style cursor-not-allowed opacity-60"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Employment & License
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Job Title">
                  <input
                    value={jobTitle}
                    onChange={(event) => {
                      setJobTitle(
                        event.target.value,
                      );
                      setError("");
                    }}
                    className="input-style"
                  />
                </Field>

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
                    {departments.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field label="Microsoft 365 License">
                  <select
                    value={license}
                    onChange={(event) =>
                      setLicense(
                        event.target.value,
                      )
                    }
                    className="input-style"
                  >
                    {licenses.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field label="Account Status">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as
                          | "Active"
                          | "Disabled",
                      )
                    }
                    className="input-style"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Disabled">
                      Disabled
                    </option>
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Cloud Services
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <ServiceSelect
                  label="Exchange Online"
                  value={exchange}
                  onChange={setExchange}
                />

                <ServiceSelect
                  label="Microsoft Teams"
                  value={teams}
                  onChange={setTeams}
                />

                <ServiceSelect
                  label="OneDrive"
                  value={oneDrive}
                  onChange={setOneDrive}
                />

                <ServiceSelect
                  label="MFA"
                  value={mfa}
                  onChange={setMfa}
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
                disabled={!hasChanges}
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/m365/users/${user.id}`,
                  )
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

function ServiceSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: M365ServiceStatus;
  onChange: (
    value: M365ServiceStatus,
  ) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target
              .value as M365ServiceStatus,
          )
        }
        className="input-style"
      >
        <option value="Enabled">
          Enabled
        </option>

        <option value="Disabled">
          Disabled
        </option>
      </select>
    </Field>
  );
}
