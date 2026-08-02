/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const rawEmployeeId = params?.id;

  const employeeId = Array.isArray(rawEmployeeId)
    ? rawEmployeeId[0]
    : String(rawEmployeeId || "");

  const [employee, setEmployee] =
    useState<Employee | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser =
      window.localStorage.getItem("currentUser");

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    try {
      const savedEmployeesValue =
        window.localStorage.getItem("employees");

      const savedEmployees: Employee[] =
        savedEmployeesValue
          ? JSON.parse(savedEmployeesValue)
          : [];

      const foundEmployee = savedEmployees.find(
        (item) => item.id === employeeId,
      );

      setEmployee(foundEmployee ?? null);
    } catch (error) {
      console.error(
        "Employee loading error:",
        error,
      );

      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, router]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!employee) {
      return;
    }

    try {
      const savedEmployeesValue =
        window.localStorage.getItem("employees");

      const savedEmployees: Employee[] =
        savedEmployeesValue
          ? JSON.parse(savedEmployeesValue)
          : [];

      const updatedEmployees =
        savedEmployees.map((item) =>
          item.id === employeeId
            ? employee
            : item,
        );

      window.localStorage.setItem(
        "employees",
        JSON.stringify(updatedEmployees),
      );

      router.push(`/employees/${employee.id}`);
    } catch (error) {
      console.error(
        "Employee saving error:",
        error,
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p className="text-slate-600">
          Loading employee...
        </p>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Employee not found
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push("/employees")
            }
            className="mt-5 font-medium text-blue-600 hover:underline"
          >
            Back to Employees
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">
            Employee Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Edit Employee
          </h1>

          <p className="mt-1 text-slate-600">
            {employee.id}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Employee ID
            </label>

            <input
              value={employee.id}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 p-3 text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            <input
              value={employee.name}
              onChange={(event) =>
                setEmployee({
                  ...employee,
                  name: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>

            <input
              value={employee.department}
              onChange={(event) =>
                setEmployee({
                  ...employee,
                  department:
                    event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={employee.email}
              onChange={(event) =>
                setEmployee({
                  ...employee,
                  email: event.target.value,
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={employee.status}
              onChange={(event) =>
                setEmployee({
                  ...employee,
                  status: event.target.value as
                    | "Active"
                    | "Inactive",
                })
              }
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/employees/${employee.id}`,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white p-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
