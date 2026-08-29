/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/system/Sidebar";
import { useEnterpriseData } from "@/hooks/useEnterpriseData";
import { logActivity } from "@/lib/activityLogger";

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

type Asset = {
  id: string;
  name: string;
  category: string;
  department: string;
  assignedTo: string;
  status: string;
};

function generateNextAssetId(
  assets: Asset[],
) {
  const existingNumbers = assets
    .map((asset) => {
      const match = asset.id.match(
        /^AST-(\d{1,3})$/,
      );

      return match
        ? Number(match[1])
        : 0;
    })
    .filter((number) => number > 0);

  const highestNumber =
    existingNumbers.length > 0
      ? Math.max(...existingNumbers)
      : 0;

  const nextNumber = highestNumber + 1;

  return `AST-${String(nextNumber).padStart(
    3,
    "0",
  )}`;
}

export default function NewAssetPage() {
  const router = useRouter();

  const {
    employees: enterpriseEmployees,
    isLoading,
    refreshData,
  } = useEnterpriseData();

  const [assetName, setAssetName] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [isAuthorized, setIsAuthorized] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

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
        parsedUser.role !== "IT Admin" &&
        parsedUser.role !== "IT Support"
      ) {
        router.replace("/assets");
        return;
      }

      setCurrentUser(parsedUser);
      setIsAuthorized(true);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );
      router.replace("/login");
    }
  }, [router]);

  const employees = useMemo<Employee[]>(
    () =>
      enterpriseEmployees.filter(
        (employee) =>
          employee.status === "Active",
      ),
    [enterpriseEmployees],
  );

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.id === assignedTo,
      ) ?? null,
    [assignedTo, employees],
  );

  function handleEmployeeChange(
    employeeId: string,
  ) {
    setAssignedTo(employeeId);
    setFormError("");

    const employee =
      employees.find(
        (item) =>
          item.id === employeeId,
      ) ?? null;

    if (employee) {
      setDepartment(employee.department);
    } else {
      setDepartment("");
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");

    if (!isAuthorized || !currentUser) {
      return;
    }

    const cleanAssetName =
      assetName.trim();

    const cleanCategory =
      category.trim();

    const cleanDepartment =
      department.trim();

    if (!cleanAssetName) {
      setFormError(
        "Asset name is required.",
      );
      return;
    }

    if (!cleanCategory) {
      setFormError(
        "Category is required.",
      );
      return;
    }

    if (!cleanDepartment) {
      setFormError(
        "Department is required.",
      );
      return;
    }

    const savedAssets = JSON.parse(
      window.localStorage.getItem(
        "assets",
      ) || "[]",
    ) as Asset[];

    const newAsset: Asset = {
      id: generateNextAssetId(
        savedAssets,
      ),
      name: cleanAssetName,
      category: cleanCategory,
      department: cleanDepartment,
      assignedTo:
        selectedEmployee?.id || "",
      status: selectedEmployee
        ? "Assigned"
        : "Available",
    };

    window.localStorage.setItem(
      "assets",
      JSON.stringify([
        ...savedAssets,
        newAsset,
      ]),
    );

    logActivity(
      "Created Asset",
      currentUser.name,
      `${newAsset.id} - ${newAsset.name}`,
    );

    refreshData();
    router.push("/assets");
  }

  if (
    isLoading ||
    !isAuthorized ||
    !currentUser
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Checking access...
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 p-10">
        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          Add New Asset
        </p>

        <h1 className="mb-3 text-5xl font-bold">
          Register Company Asset
        </h1>

        <p className="mb-10 text-gray-400">
          Assign the asset to an active
          employee or leave it unassigned
          and available.
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl space-y-6 rounded-2xl bg-zinc-900 p-8"
        >
          {formError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Asset Name
            </label>

            <input
              type="text"
              value={assetName}
              onChange={(event) =>
                setAssetName(
                  event.target.value,
                )
              }
              required
              placeholder="Dell Latitude 5420"
              className="w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value,
                )
              }
              required
              placeholder="Laptop"
              className="w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Assigned To
            </label>

            <select
              value={assignedTo}
              onChange={(event) =>
                handleEmployeeChange(
                  event.target.value,
                )
              }
              className="w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Unassigned
              </option>

              {employees.map(
                (employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.name} —{" "}
                    {employee.id} —{" "}
                    {
                      employee.department
                    }
                  </option>
                ),
              )}
            </select>

            {employees.length === 0 && (
              <p className="mt-2 text-sm text-yellow-400">
                No active employees are
                available. Add or activate
                an employee first.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Department
            </label>

            <input
              type="text"
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value,
                )
              }
              readOnly={Boolean(
                selectedEmployee,
              )}
              required
              placeholder={
                selectedEmployee
                  ? "Selected automatically"
                  : "Information Technology"
              }
              className={`w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedEmployee
                  ? "cursor-not-allowed text-gray-400"
                  : ""
              }`}
            />

            {selectedEmployee && (
              <p className="mt-2 text-sm text-gray-500">
                Department is linked
                automatically to{" "}
                {selectedEmployee.name}.
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold transition hover:bg-blue-500"
            >
              Save Asset
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/assets")
              }
              className="rounded-xl bg-zinc-800 px-8 py-3 font-semibold transition hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
