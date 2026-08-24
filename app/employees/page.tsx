/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
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
      window.localStorage.getItem(
        "currentUser",
      );

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const currentUser =
        JSON.parse(
          savedCurrentUser,
        ) as CurrentUser;

      if (
        currentUser.role !== "IT Admin"
      ) {
        router.replace("/dashboard");
        return;
      }

      setIsAuthorized(true);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  if (
    !isAuthorized ||
    isLoading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading employees...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Enterprise Directory
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Employee Management
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Manage employee records,
                departments, status, and
                assigned IT assets.
              </p>
            </div>

            <Link
              href="/employees/new"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              + Add Employee
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Total Employees"
              value={employees.length}
              subtitle="All employee records"
            />

            <KpiCard
              title="Active"
              value={
                employees.filter(
                  (employee) =>
                    employee.status ===
                    "Active",
                ).length
              }
              subtitle="Currently active"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Inactive"
              value={
                employees.filter(
                  (employee) =>
                    employee.status !==
                    "Active",
                ).length
              }
              subtitle="Inactive employees"
              valueClass="text-red-400"
            />

            <KpiCard
              title="Departments"
              value={
                new Set(
                  employees.map(
                    (employee) =>
                      employee.department,
                  ),
                ).size
              }
              subtitle="Unique departments"
              valueClass="text-purple-400"
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Employee Directory
              </h2>

              <p className="mt-2 text-gray-400">
                Review enterprise employees
                and open individual records.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Employee ID
                    </th>

                    <th className="px-4 py-4">
                      Name
                    </th>

                    <th className="px-4 py-4">
                      Department
                    </th>

                    <th className="px-4 py-4">
                      Email
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {employees.map(
                    (employee) => (
                      <tr
                        key={employee.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5 font-semibold text-blue-400">
                          {employee.id}
                        </td>

                        <td className="px-4 py-5 text-gray-200">
                          {employee.name}
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            employee.department
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {employee.email}
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              employee.status
                            }
                          />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end">
                            <Link
                              href={`/employees/${employee.id}`}
                              className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                  {employees.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  valueClass = "text-white",
}: {
  title: string;
  value: number;
  subtitle: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const isActive =
    status === "Active";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        isActive
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
      }`}
    >
      {status}
    </span>
  );
}
