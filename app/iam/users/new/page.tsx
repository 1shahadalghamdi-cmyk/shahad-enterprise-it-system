"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
import {
  defaultIamUsers,
  type IamUser,
  type IamUserStatus,
  type MfaStatus,
} from "@/lib/data/iamUsers";

const STORAGE_KEY = "iamUsers";

const departments = [
  "Information Technology",
  "Human Resources",
  "Finance",
  "Operations",
  "Administration",
  "Sales",
  "Procurement",
];

const roles = [
  "IT Admin",
  "System Administrator",
  "IT Support",
  "Network Support",
  "HR User",
  "Finance User",
  "Employee",
];

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, ".");
}

function loadUsers(): IamUser[] {
  const savedUsers =
    window.localStorage.getItem(STORAGE_KEY);

  if (!savedUsers) {
    return defaultIamUsers;
  }

  try {
    const parsedUsers =
      JSON.parse(savedUsers) as IamUser[];

    return Array.isArray(parsedUsers)
      ? parsedUsers
      : defaultIamUsers;
  } catch {
    return defaultIamUsers;
  }
}

function generateNextId(
  users: IamUser[],
  field: "id" | "employeeId",
  prefix: string,
) {
  const highestNumber = users.reduce(
    (highest, user) => {
      const value = user[field];
      const number = Number(
        value.replace(`${prefix}-`, ""),
      );

      return Number.isNaN(number)
        ? highest
        : Math.max(highest, number);
    },
    1000,
  );

  return `${prefix}-${highestNumber + 1}`;
}

export default function CreateIamUserPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(
    "Information Technology",
  );
  const [jobTitle, setJobTitle] = useState("");
  const [manager, setManager] = useState("");
  const [role, setRole] = useState("Employee");
  const [status, setStatus] =
    useState<IamUserStatus>("Pending");
  const [mfaStatus, setMfaStatus] =
    useState<MfaStatus>("Required");
  const [temporaryPassword, setTemporaryPassword] =
    useState("");
  const [error, setError] = useState("");

  const generatedUsername = useMemo(
    () => normalizeUsername(fullName),
    [fullName],
  );

  function handleGenerateIdentity() {
    if (!fullName.trim()) {
      setError(
        "Enter the employee name before generating the identity.",
      );
      return;
    }

    setUsername(generatedUsername);
    setEmail(
      `${generatedUsername}@enterprise.com`,
    );

    const randomPassword =
      `Temp@${Math.floor(
        100000 + Math.random() * 900000,
      )}`;

    setTemporaryPassword(randomPassword);
    setError("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (
      fullName.trim().length < 3 ||
      username.trim().length < 3 ||
      !email.includes("@") ||
      jobTitle.trim().length < 2
    ) {
      setError(
        "Complete the required identity and employment information.",
      );
      return;
    }

    const users = loadUsers();

    const duplicateUsername = users.some(
      (user) =>
        user.username.toLowerCase() ===
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

    const now = new Date();
    const passwordExpiry = new Date(now);

    passwordExpiry.setDate(
      passwordExpiry.getDate() + 90,
    );

    const newUser: IamUser = {
      id: generateNextId(users, "id", "USR"),
      employeeId: generateNextId(
        users,
        "employeeId",
        "EMP",
      ),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      department,
      jobTitle: jobTitle.trim(),
      manager:
        manager.trim() || "Not Assigned",
      role,
      status,
      mfaStatus,
      lastLogin: "",
      passwordExpiry:
        passwordExpiry.toISOString(),
      createdAt: now.toISOString(),
    };

    const updatedUsers = [...users, newUser];

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedUsers),
    );

    router.push(`/iam/users/${newUser.id}`);
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Identity Provisioning
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Create New User
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Provision a new enterprise identity,
              assign employment information, configure
              access status, and prepare MFA enrollment.
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
                    placeholder="Example: Ahmed AlHarbi"
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="Username">
                  <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    placeholder="ahmed.alharbi"
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="Enterprise Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="ahmed.alharbi@enterprise.com"
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="Temporary Password">
                  <input
                    type="text"
                    value={temporaryPassword}
                    onChange={(event) =>
                      setTemporaryPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Generate temporary password"
                    className="input-style"
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={handleGenerateIdentity}
                className="mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                Generate Username, Email & Password
              </button>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Employment Information
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

                <Field label="Job Title">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(event) =>
                      setJobTitle(event.target.value)
                    }
                    placeholder="Example: IT Support Specialist"
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="Manager">
                  <input
                    type="text"
                    value={manager}
                    onChange={(event) =>
                      setManager(event.target.value)
                    }
                    placeholder="Manager name"
                    className="input-style"
                  />
                </Field>

                <Field label="Assigned Role">
                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    className="input-style"
                  >
                    {roles.map((item) => (
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
                Account Security
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Account Status">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as IamUserStatus,
                      )
                    }
                    className="input-style"
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Active">
                      Active
                    </option>
                    <option value="Locked">
                      Locked
                    </option>
                    <option value="Disabled">
                      Disabled
                    </option>
                  </select>
                </Field>

                <Field label="MFA Status">
                  <select
                    value={mfaStatus}
                    onChange={(event) =>
                      setMfaStatus(
                        event.target
                          .value as MfaStatus,
                      )
                    }
                    className="input-style"
                  >
                    <option value="Required">
                      Required
                    </option>
                    <option value="Enabled">
                      Enabled
                    </option>
                    <option value="Disabled">
                      Disabled
                    </option>
                  </select>
                </Field>
              </div>

              <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <p className="font-semibold text-blue-300">
                  Provisioning Summary
                </p>

                <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                  <Summary
                    label="Username"
                    value={
                      username ||
                      generatedUsername ||
                      "Not generated"
                    }
                  />

                  <Summary
                    label="Role"
                    value={role}
                  />

                  <Summary
                    label="Initial Status"
                    value={status}
                  />
                </div>
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
                  router.push("/iam/users")
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

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}