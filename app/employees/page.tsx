/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useEnterpriseData } from "@/hooks/useEnterpriseData";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

export default function EmployeesPage() {
  const router = useRouter();

  const { employees, isLoading } =
    useEnterpriseData();

  const [isAuthorized, setIsAuthorized] =
    useState(false);

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const currentUser =
        JSON.parse(savedCurrentUser) as CurrentUser;

      if (currentUser.role !== "IT Admin") {
        router.replace("/dashboard");
        return;
      }

      setIsAuthorized(true);
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

  if (!isAuthorized || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg text-slate-600">
          Loading employees...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Employee Management
            </h1>

            <p className="mt-1 text-slate-600">
              Manage employees and assigned IT assets.
            </p>
          </div>

          <Link
            href="/employees/new"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            + Add Employee
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4">
                  Employee ID
                </th>

                <th className="px-6 py-4">
                  Name
                </th>

                <th className="px-6 py-4">
                  Department
                </th>

                <th className="px-6 py-4">
                  Email
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-slate-200 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {employee.id}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {employee.name}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {employee.department}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {employee.email}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        employee.status ===
                        "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      href={`/employees/${employee.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              No employees found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
