"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

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

function loadUsers(): IamUser[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return defaultIamUsers;

  try {
    return JSON.parse(saved);
  } catch {
    return defaultIamUsers;
  }
}
export default function EditIamUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const userId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [users, setUsers] = useState<IamUser[]>([]);
  const [currentUser, setCurrentUser] =
    useState<IamUser | null>(null);

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadedUsers = loadUsers();
    setUsers(loadedUsers);

    const matchedUser =
      loadedUsers.find(
        (user) => user.id === userId,
      ) || null;

    if (!matchedUser) {
      setLoading(false);
      return;
    }

    setCurrentUser(matchedUser);
    setFullName(matchedUser.fullName);
    setUsername(matchedUser.username);
    setEmail(matchedUser.email);
    setDepartment(matchedUser.department);
    setJobTitle(matchedUser.jobTitle);
    setManager(matchedUser.manager);
    setRole(matchedUser.role);
    setStatus(matchedUser.status);
    setMfaStatus(matchedUser.mfaStatus);
    setLoading(false);
  }, [userId]);

  const hasChanges = useMemo(() => {
    if (!currentUser) {
      return false;
    }

    return (
      fullName.trim() !== currentUser.fullName ||
      username.trim() !== currentUser.username ||
      email.trim() !== currentUser.email ||
      department !== currentUser.department ||
      jobTitle.trim() !== currentUser.jobTitle ||
      manager.trim() !== currentUser.manager ||
      role !== currentUser.role ||
      status !== currentUser.status ||
      mfaStatus !== currentUser.mfaStatus
    );
  }, [
    currentUser,
    department,
    email,
    fullName,
    jobTitle,
    manager,
    mfaStatus,
    role,
    status,
    username,
  ]);
    function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!currentUser) {
      return;
    }

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

    const duplicateUsername = users.some(
      (user) =>
        user.id !== currentUser.id &&
        user.username.toLowerCase() ===
          username.trim().toLowerCase(),
    );

    const duplicateEmail = users.some(
      (user) =>
        user.id !== currentUser.id &&
        user.email.toLowerCase() ===
          email.trim().toLowerCase(),
    );

    if (duplicateUsername || duplicateEmail) {
      setError(
        "The username or email address is already assigned to another user.",
      );
      return;
    }

    const updatedUser: IamUser = {
      ...currentUser,
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      department,
      jobTitle: jobTitle.trim(),
      manager:
        manager.trim() || "Not Assigned",
      role,
      status,
      mfaStatus,
    };

    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id
        ? updatedUser
        : user,
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedUsers),
    );

    router.push(
      `/iam/users/${updatedUser.id}`,
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading user information...
        </p>
      </main>
    );
  }

  if (!currentUser) {
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

            <button
              type="button"
              onClick={() =>
                router.push("/iam/users")
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
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              Identity Lifecycle
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Edit User
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Update identity information, employment
              details, role assignment, account status,
              and MFA configuration.
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
                    className="input-style"
                    required
                  />
                </Field>

                <Field label="User ID">
                  <input
                    type="text"
                    value={currentUser.id}
                    disabled
                    className="input-style cursor-not-allowed opacity-60"
                  />
                </Field>
              </div>
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
                      setDepartment(event.target.value)
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
                    onChange={(event) => {
                      setJobTitle(event.target.value);
                      setError("");
                    }}
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
                    <option value="Active">
                      Active
                    </option>

                    <option value="Locked">
                      Locked
                    </option>

                    <option value="Disabled">
                      Disabled
                    </option>

                    <option value="Pending">
                      Pending
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
                    <option value="Enabled">
                      Enabled
                    </option>

                    <option value="Required">
                      Required
                    </option>

                    <option value="Disabled">
                      Disabled
                    </option>
                  </select>
                </Field>
              </div>

              <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                <p className="font-semibold text-blue-300">
                  Change Summary
                </p>

                <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                  <Summary
                    label="User"
                    value={fullName}
                  />

                  <Summary
                    label="Role"
                    value={role}
                  />

                  <Summary
                    label="Changes Detected"
                    value={hasChanges ? "Yes" : "No"}
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
                disabled={!hasChanges}
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/iam/users/${currentUser.id}`,
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
          border: 1px solid rgb(255 255 255 / 0.1);
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

