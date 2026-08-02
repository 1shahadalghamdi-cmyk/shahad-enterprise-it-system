/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  department: string;
  email: string;
  status: "Active" | "Inactive";
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

  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    const savedEmployees: Employee[] = JSON.parse(
      localStorage.getItem("employees") || "[]"
    );

    const foundEmployee = savedEmployees.find(
      (item) => item.id === employeeId
    );

    setEmployee(foundEmployee || null);

    const savedAssets: Asset[] = JSON.parse(
      localStorage.getItem("assets") || "[]"
    );

    const employeeAssets = savedAssets.filter(
      (asset) =>
        asset.assignedTo === employeeId ||
        asset.assignedTo === foundEmployee?.name
    );

    setAssignedAssets(employeeAssets);
    setLoading(false);
  }, [employeeId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <p className="text-slate-600">Loading employee...</p>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Employee not found
          </h1>

          <Link
            href="/employees"
            className="mt-5 inline-block font-medium text-blue-600 hover:underline"
          >
            Back to Employees
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Employee Profile
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              {employee.name}
            </h1>

            <p className="mt-1 text-slate-600">{employee.id}</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/employees"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>

            <Link
              href={`/employees/${employee.id}/edit`}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Edit Employee
            </Link>
          </div>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Employee ID</p>
            <p className="mt-2 font-semibold text-slate-900">
              {employee.id}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Full Name</p>
            <p className="mt-2 font-semibold text-slate-900">
              {employee.name}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Department</p>
            <p className="mt-2 font-semibold text-slate-900">
              {employee.department}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 font-semibold text-slate-900">
              {employee.email}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Status</p>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                employee.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {employee.status}
            </span>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Assigned Assets</p>
            <p className="mt-2 font-semibold text-slate-900">
              {assignedAssets.length}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Assigned IT Assets
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Devices currently assigned to this employee.
            </p>
          </div>

          {assignedAssets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium text-slate-700">
                No assets assigned
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Asset assignment will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-5 py-3">Asset ID</th>
                    <th className="px-5 py-3">Asset</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {assignedAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {asset.id}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {asset.name ||
                          [asset.brand, asset.model]
                            .filter(Boolean)
                            .join(" ") ||
                          "IT Asset"}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {asset.category || "Not specified"}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          View Asset
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
