/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type Employee = {
  id: string;
  name: string;
  department: string;
  email: string;
  status: "Active" | "Inactive";
};

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();

  const rawEmployeeId =
    params?.id;

  const employeeId =
    Array.isArray(rawEmployeeId)
      ? rawEmployeeId[0]
      : String(rawEmployeeId || "");

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    employee,
    setEmployee,
  ] =
    useState<Employee | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(
          savedCurrentUser,
        ) as CurrentUser;

      if (
        parsedUser.role !==
        "IT Admin"
      ) {
        router.replace(
          "/dashboard",
        );
        return;
      }

      setCurrentUser(parsedUser);

      const savedEmployeesValue =
        window.localStorage.getItem(
          "employees",
        );

      const savedEmployees: Employee[] =
        savedEmployeesValue
          ? JSON.parse(
              savedEmployeesValue,
            )
          : [];

      const foundEmployee =
        savedEmployees.find(
          (item) =>
            item.id === employeeId,
        );

      setEmployee(
        foundEmployee ?? null,
      );
    } catch (error) {
      console.error(
        "Employee loading error:",
        error,
      );

      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [employeeId, router]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");

    if (
      !currentUser ||
      currentUser.role !==
        "IT Admin"
    ) {
      setMessage(
        "You do not have permission to edit employees.",
      );
      return;
    }

    if (!employee) {
      return;
    }

    if (
      !employee.name.trim() ||
      !employee.department.trim() ||
      !employee.email.trim()
    ) {
      setMessage(
        "Complete all employee fields.",
      );
      return;
    }

    try {
      const savedEmployeesValue =
        window.localStorage.getItem(
          "employees",
        );

      const savedEmployees: Employee[] =
        savedEmployeesValue
          ? JSON.parse(
              savedEmployeesValue,
            )
          : [];

      const updatedEmployees =
        savedEmployees.map(
          (item) =>
            item.id === employeeId
              ? {
                  ...employee,
                  name:
                    employee.name.trim(),
                  department:
                    employee.department.trim(),
                  email:
                    employee.email.trim(),
                }
              : item,
        );

      window.localStorage.setItem(
        "employees",
        JSON.stringify(
          updatedEmployees,
        ),
      );

      router.push(
        `/employees/${employee.id}`,
      );
    } catch (error) {
      console.error(
        "Employee saving error:",
        error,
      );

      setMessage(
        "Unable to save employee changes.",
      );
    }
  }

  if (
    loading ||
    !currentUser
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading employee...
        </p>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center p-8">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 text-center">
            <p className="text-5xl">
              🔎
            </p>

            <h1 className="mt-5 text-3xl font-bold">
              Employee Not Found
            </h1>

            <p className="mt-3 text-gray-400">
              This employee record does
              not exist.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/employees",
                )
              }
              className="mt-6 rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Employees
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
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Employee Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Edit Employee
            </h1>

            <p className="mt-2 text-gray-400">
              {employee.id}
            </p>
          </div>

          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              <FieldLabel
                label="Employee ID"
              >
                <input
                  value={employee.id}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-gray-500"
                />
              </FieldLabel>

              <FieldLabel
                label="Full Name"
              >
                <input
                  value={
                    employee.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setEmployee({
                      ...employee,
                      name:
                        event.target
                          .value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />
              </FieldLabel>

              <FieldLabel
                label="Department"
              >
                <input
                  value={
                    employee.department
                  }
                  onChange={(
                    event,
                  ) =>
                    setEmployee({
                      ...employee,
                      department:
                        event.target
                          .value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />
              </FieldLabel>

              <FieldLabel
                label="Email"
              >
                <input
                  type="email"
                  value={
                    employee.email
                  }
                  onChange={(
                    event,
                  ) =>
                    setEmployee({
                      ...employee,
                      email:
                        event.target
                          .value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                  required
                />
              </FieldLabel>

              <FieldLabel
                label="Status"
              >
                <select
                  value={
                    employee.status
                  }
                  onChange={(
                    event,
                  ) =>
                    setEmployee({
                      ...employee,
                      status:
                        event.target
                          .value as
                          | "Active"
                          | "Inactive",
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </FieldLabel>

              {message && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {message}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/employees/${employee.id}`,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-5 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

function FieldLabel({
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
