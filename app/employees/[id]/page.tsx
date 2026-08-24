/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
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
  status:
    | "Active"
    | "Inactive";
};

type Asset = {
  id: string;
  name?: string;
  category?: string;
  brand?: string;
  model?: string;
  assignedTo?: string;
};

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const employeeId =
    Array.isArray(params.id)
      ? params.id[0]
      : (params.id as string);

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
    assignedAssets,
    setAssignedAssets,
  ] =
    useState<Asset[]>([]);

  const [loading, setLoading] =
    useState(true);

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

      const savedEmployees =
        JSON.parse(
          window.localStorage.getItem(
            "employees",
          ) || "[]",
        ) as Employee[];

      const foundEmployee =
        savedEmployees.find(
          (item) =>
            item.id === employeeId,
        );

      setEmployee(
        foundEmployee ?? null,
      );

      const savedAssets =
        JSON.parse(
          window.localStorage.getItem(
            "assets",
          ) || "[]",
        ) as Asset[];

      const employeeAssets =
        savedAssets.filter(
          (asset) =>
            asset.assignedTo ===
              employeeId ||
            asset.assignedTo ===
              foundEmployee?.name,
        );

      setAssignedAssets(
        employeeAssets,
      );

      setLoading(false);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [employeeId, router]);

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

            <Link
              href="/employees"
              className="mt-6 inline-flex rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-zinc-800"
            >
              Back to Employees
            </Link>
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
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Employee Profile
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                {employee.name}
              </h1>

              <p className="mt-2 text-gray-400">
                {employee.id}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/employees"
                className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-3 font-semibold text-gray-300 transition hover:bg-zinc-800"
              >
                Back
              </Link>

              <Link
                href={`/employees/${employee.id}/edit`}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
              >
                Edit Employee
              </Link>
            </div>
          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              title="Employee ID"
              value={employee.id}
            />

            <InfoCard
              title="Full Name"
              value={employee.name}
            />

            <InfoCard
              title="Department"
              value={
                employee.department
              }
            />

            <InfoCard
              title="Email"
              value={employee.email}
            />

            <StatusCard
              status={
                employee.status
              }
            />

            <InfoCard
              title="Assigned Assets"
              value={String(
                assignedAssets.length,
              )}
            />
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Assigned IT Assets
              </h2>

              <p className="mt-2 text-gray-400">
                Devices currently assigned
                to this employee.
              </p>
            </div>

            {assignedAssets.length ===
            0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-gray-300">
                  No assets assigned
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Asset assignment will
                  appear here
                  automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                    <tr>
                      <th className="px-6 py-4">
                        Asset ID
                      </th>

                      <th className="px-4 py-4">
                        Asset
                      </th>

                      <th className="px-4 py-4">
                        Category
                      </th>

                      <th className="px-6 py-4 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {assignedAssets.map(
                      (asset) => {
                        const assetName =
                          asset.name ||
                          [
                            asset.brand,
                            asset.model,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                          "IT Asset";

                        return (
                          <tr
                            key={
                              asset.id
                            }
                            className="transition hover:bg-white/[0.03]"
                          >
                            <td className="px-6 py-5 font-semibold text-blue-400">
                              {
                                asset.id
                              }
                            </td>

                            <td className="px-4 py-5 text-gray-200">
                              {
                                assetName
                              }
                            </td>

                            <td className="px-4 py-5 text-gray-300">
                              {asset.category ||
                                "Not specified"}
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex justify-end">
                                <Link
                                  href={`/assets/${asset.id}`}
                                  className="rounded-lg border border-blue-500/30 px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10"
                                >
                                  View Asset
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-3 break-words font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function StatusCard({
  status,
}: {
  status:
    | "Active"
    | "Inactive";
}) {
  const active =
    status === "Active";

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-500">
        Status
      </p>

      <span
        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
          active
            ? "border-green-500/30 bg-green-500/10 text-green-400"
            : "border-red-500/30 bg-red-500/10 text-red-400"
        }`}
      >
        {status}
      </span>
    </div>
  );
}