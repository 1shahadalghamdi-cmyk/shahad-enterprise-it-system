/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Sidebar from "../../../components/system/Sidebar";

import { logActivity } from "@/lib/activityLogger";

type Asset = {
  id: string;
  name: string;
  category: string;
  assignedTo: string;
  department: string;
  status: string;
};

type Employee = {
  id: string;
  name: string;
  department: string;
  email: string;
  status: "Active" | "Inactive";
};

type AssetHistoryRecord = {
  id: string;
  assetId: string;
  assetName: string;
  action: string;
  previousAssignedTo: string;
  newAssignedTo: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
};

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email?: string;
  role: UserRole;
};

const defaultAssets: Asset[] = [
  {
    id: "AST-001",
    name: "Dell Latitude 5420",
    category: "Laptop",
    department: "Finance",
    assignedTo: "Ahmed Ali",
    status: "Assigned",
  },
  {
    id: "AST-002",
    name: "HP EliteBook 840",
    category: "Laptop",
    department: "Human Resources",
    assignedTo: "Sara Mohammed",
    status: "Assigned",
  },
  {
    id: "AST-003",
    name: "Dell Monitor P2422H",
    category: "Monitor",
    department: "IT",
    assignedTo: "",
    status: "Available",
  },
  {
    id: "AST-004",
    name: "Cisco Network Switch",
    category: "Network Device",
    department: "IT",
    assignedTo: "",
    status: "Maintenance",
  },
  {
    id: "AST-005",
    name: "Logitech Wireless Mouse",
    category: "Accessory",
    department: "Operations",
    assignedTo: "",
    status: "Available",
  },
];

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;

  const assetId = Array.isArray(rawId)
    ? rawId[0]
    : String(rawId || "");

  const [assetName, setAssetName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [status, setStatus] =
    useState("Available");

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [allEmployees, setAllEmployees] =
    useState<Employee[]>([]);

  const [allAssets, setAllAssets] =
    useState<Asset[]>([]);

  const [
    originalAsset,
    setOriginalAsset,
  ] = useState<Asset | null>(null);

  const [
    assetFound,
    setAssetFound,
  ] = useState(true);

  const [
    isAuthorized,
    setIsAuthorized,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    currentUser,
    setCurrentUser,
  ] = useState<CurrentUser | null>(null);

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
      const parsedCurrentUser =
        JSON.parse(
          savedCurrentUser,
        ) as CurrentUser;

      if (
        parsedCurrentUser.role !==
          "IT Admin" &&
        parsedCurrentUser.role !==
          "IT Support"
      ) {
        router.replace("/assets");
        return;
      }

      setCurrentUser(
        parsedCurrentUser,
      );

      setIsAuthorized(true);

      const savedAssets = JSON.parse(
        window.localStorage.getItem(
          "assets",
        ) || "[]",
      ) as Asset[];

      const savedEmployees =
        JSON.parse(
          window.localStorage.getItem(
            "employees",
          ) || "[]",
        ) as Employee[];

      const assetsMap =
        new Map<string, Asset>();

      defaultAssets.forEach(
        (asset) => {
          assetsMap.set(
            asset.id.toUpperCase(),
            asset,
          );
        },
      );

      savedAssets.forEach(
        (asset) => {
          assetsMap.set(
            asset.id.toUpperCase(),
            asset,
          );
        },
      );

      const combinedAssets =
        Array.from(
          assetsMap.values(),
        );

      const selectedAsset =
        combinedAssets.find(
          (asset) =>
            asset.id.toUpperCase() ===
            assetId.toUpperCase(),
        );

      if (!selectedAsset) {
        setAssetFound(false);
        setIsLoading(false);
        return;
      }

      /*
        Keep all employee records for matching
        the asset's existing assignment.

        Only active employees are available
        for NEW assignments.
      */
      const activeEmployees =
        savedEmployees.filter(
          (employee) =>
            employee.status ===
            "Active",
        );

      const matchedEmployee =
        savedEmployees.find(
          (employee) =>
            employee.id ===
              selectedAsset.assignedTo ||
            employee.name
              .trim()
              .toLowerCase() ===
              selectedAsset.assignedTo
                .trim()
                .toLowerCase(),
        );

      /*
        IMPORTANT:
        If the current assignment is not an
        employee (example: Meeting Room A,
        Security Team), preserve the raw value.

        Previously this became an empty string
        and accidentally changed the asset to
        Unassigned when saving.
      */
      const initialAssignedValue =
        matchedEmployee?.id ||
        selectedAsset.assignedTo ||
        "";

      setAllAssets(
        combinedAssets,
      );

      setAllEmployees(
        savedEmployees,
      );

      setEmployees(
        activeEmployees,
      );

      setAssetName(
        selectedAsset.name,
      );

      setCategory(
        selectedAsset.category,
      );

      setDepartment(
        selectedAsset.department,
      );

      setAssignedTo(
        initialAssignedValue,
      );

      setStatus(
        selectedAsset.status,
      );

      setOriginalAsset(
        selectedAsset,
      );

      setAssetFound(true);
    } catch (error) {
      console.error(
        "Asset loading error:",
        error,
      );

      setAssetFound(false);
    } finally {
      setIsLoading(false);
    }
  }, [assetId, router]);

  function handleEmployeeChange(
    employeeValue: string,
  ) {
    setAssignedTo(
      employeeValue,
    );

    if (!employeeValue) {
      /*
        Unassign the asset, but DO NOT
        automatically erase its department.

        Department represents the asset's
        owning/business department and can
        remain even when no employee is
        currently assigned.
      */
      setStatus("Available");
      return;
    }

    const selectedEmployee =
      allEmployees.find(
        (employee) =>
          employee.id ===
            employeeValue ||
          employee.name
            .trim()
            .toLowerCase() ===
            employeeValue
              .trim()
              .toLowerCase(),
      );

    if (selectedEmployee) {
      setDepartment(
        selectedEmployee.department,
      );

      setStatus("Assigned");
      return;
    }

    /*
      If it is a non-employee assignment
      such as Meeting Room A or Security Team,
      preserve the existing department and
      assignment instead of wiping them.
    */
    if (
      originalAsset &&
      employeeValue ===
        originalAsset.assignedTo
    ) {
      setDepartment(
        originalAsset.department,
      );

      setStatus(
        originalAsset.status,
      );
    }
  }

  function getEmployeeName(
    employeeValue: string,
  ) {
    if (!employeeValue) {
      return "Unassigned";
    }

    const matchedEmployee =
      allEmployees.find(
        (employee) =>
          employee.id ===
            employeeValue ||
          employee.name
            .trim()
            .toLowerCase() ===
            employeeValue
              .trim()
              .toLowerCase(),
      );

    return (
      matchedEmployee?.name ||
      employeeValue
    );
  }

  function getChangedBy() {
    const currentUserValue =
      window.localStorage.getItem(
        "currentUser",
      );

    if (!currentUserValue) {
      return "Admin";
    }

    try {
      const parsedUser =
        JSON.parse(
          currentUserValue,
        ) as {
          name?: string;
          email?: string;
        };

      return (
        parsedUser.name ||
        parsedUser.email ||
        "Admin"
      );
    } catch {
      return currentUserValue;
    }
  }

  function normalizeAssignment(
    value: string,
  ) {
    if (!value) {
      return "";
    }

    const matchedEmployee =
      allEmployees.find(
        (employee) =>
          employee.id === value ||
          employee.name
            .trim()
            .toLowerCase() ===
            value
              .trim()
              .toLowerCase(),
      );

    return (
      matchedEmployee?.id ||
      value
    );
  }

  function createHistoryRecord(
    updatedAsset: Asset,
    assignmentChanged: boolean,
    statusChanged: boolean,
  ) {
    if (
      !originalAsset ||
      !isAuthorized
    ) {
      return;
    }

    try {
      const savedHistory =
        JSON.parse(
          window.localStorage.getItem(
            "assetHistory",
          ) || "[]",
        ) as AssetHistoryRecord[];

      let action =
        "Asset information updated";

      if (
        assignmentChanged &&
        statusChanged
      ) {
        action =
          "Assignment and status updated";
      } else if (
        assignmentChanged
      ) {
        action =
          "Asset assignment updated";
      } else if (
        statusChanged
      ) {
        action =
          "Asset status updated";
      }

      const historyRecord: AssetHistoryRecord =
        {
          id:
            typeof crypto !==
              "undefined" &&
            typeof crypto.randomUUID ===
              "function"
              ? crypto.randomUUID()
              : `${Date.now()}-${updatedAsset.id}`,

          assetId:
            updatedAsset.id,

          assetName:
            updatedAsset.name,

          action,

          previousAssignedTo:
            getEmployeeName(
              originalAsset.assignedTo,
            ),

          newAssignedTo:
            getEmployeeName(
              updatedAsset.assignedTo,
            ),

          previousStatus:
            originalAsset.status,

          newStatus:
            updatedAsset.status,

          changedBy:
            getChangedBy(),

          changedAt:
            new Date().toISOString(),
        };

      window.localStorage.setItem(
        "assetHistory",
        JSON.stringify([
          historyRecord,
          ...savedHistory,
        ]),
      );
    } catch (error) {
      console.error(
        "Asset history saving error:",
        error,
      );
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!originalAsset) {
      return;
    }

    const updatedAsset: Asset = {
      ...originalAsset,

      name:
        assetName.trim(),

      category:
        category.trim(),

      department:
        department.trim(),

      assignedTo,

      status,
    };

    const updatedAssets =
      allAssets.map(
        (asset) =>
          asset.id.toUpperCase() ===
          assetId.toUpperCase()
            ? updatedAsset
            : asset,
      );

    window.localStorage.setItem(
      "assets",
      JSON.stringify(
        updatedAssets,
      ),
    );

    logActivity(
      "Updated Asset",
      getChangedBy(),
      `${updatedAsset.id} - ${updatedAsset.name}`,
    );

    /*
      Compare normalized values so:
      "Sarah Mohammed" and EMP-xxx
      do not falsely count as two
      different assignments.
    */
    const originalAssignedValue =
      normalizeAssignment(
        originalAsset.assignedTo,
      );

    const newAssignedValue =
      normalizeAssignment(
        assignedTo,
      );

    const assignmentChanged =
      originalAssignedValue !==
      newAssignedValue;

    const statusChanged =
      originalAsset.status !==
      status;

    if (
      assignmentChanged ||
      statusChanged
    ) {
      createHistoryRecord(
        updatedAsset,
        assignmentChanged,
        statusChanged,
      );
    }

    router.push(
      `/assets/${assetId}`,
    );
  }

  if (
    isLoading ||
    !isAuthorized
  ) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center p-10">
          <p className="text-lg text-gray-400">
            Loading asset...
          </p>
        </main>
      </div>
    );
  }

  if (!assetFound) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <main className="flex-1 p-10">
          <div className="max-w-3xl rounded-2xl bg-zinc-900 p-8">
            <h1 className="text-3xl font-bold">
              Asset Not Found
            </h1>

            <p className="mt-4 text-gray-400">
              No asset was found with
              the ID: {assetId}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/assets",
                )
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Back to Assets
            </button>
          </div>
        </main>
      </div>
    );
  }

  /*
    Is the current assignment represented
    by one of the active employee options?
  */
  const currentAssignmentIsActiveEmployee =
    employees.some(
      (employee) =>
        employee.id ===
          assignedTo ||
        employee.name
          .trim()
          .toLowerCase() ===
          assignedTo
            .trim()
            .toLowerCase(),
    );

  /*
    If the asset is currently assigned to
    a room/team/inactive employee, show that
    assignment as its own option so opening
    Edit never silently resets it.
  */
  const showCurrentLegacyAssignment =
    Boolean(assignedTo) &&
    !currentAssignmentIsActiveEmployee;

  const isITAdmin =
    currentUser?.role ===
    "IT Admin";

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 p-10">
        <p className="mb-3 uppercase tracking-[0.3em] text-yellow-500">
          Edit Asset
        </p>

        <h1 className="mb-3 text-5xl font-bold">
          Update Asset Information
        </h1>

        <p className="mb-10 text-gray-400">
          Asset ID: {assetId}
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl space-y-6 rounded-2xl bg-zinc-900 p-8"
        >
          {currentUser?.role ===
            "IT Support" && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
              IT Support can manage
              asset assignment and
              operational status.
              Core asset information is
              controlled by IT Admin.
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
              readOnly={
                !isITAdmin
              }
              required
              className={`w-full rounded-xl bg-zinc-800 p-3 outline-none ${
                isITAdmin
                  ? "focus:ring-2 focus:ring-yellow-500"
                  : "cursor-not-allowed text-gray-400"
              }`}
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
              readOnly={
                !isITAdmin
              }
              required
              className={`w-full rounded-xl bg-zinc-800 p-3 outline-none ${
                isITAdmin
                  ? "focus:ring-2 focus:ring-yellow-500"
                  : "cursor-not-allowed text-gray-400"
              }`}
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
              className="w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">
                Unassigned
              </option>

              {showCurrentLegacyAssignment && (
                <option
                  value={
                    assignedTo
                  }
                >
                  {getEmployeeName(
                    assignedTo,
                  )}{" "}
                  — Current Assignment
                </option>
              )}

              {employees.map(
                (employee) => (
                  <option
                    key={
                      employee.id
                    }
                    value={
                      employee.id
                    }
                  >
                    {
                      employee.name
                    }{" "}
                    —{" "}
                    {
                      employee.department
                    }
                  </option>
                ),
              )}
            </select>

            {employees.length ===
              0 && (
              <p className="mt-2 text-sm text-gray-400">
                No active employees
                are available.
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
              readOnly
              placeholder="Selected automatically"
              className="w-full cursor-not-allowed rounded-xl bg-zinc-800 p-3 text-gray-400 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
              }
              className="w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="Active">
                Active
              </option>

              <option value="Assigned">
                Assigned
              </option>

              <option value="Available">
                Available
              </option>

              <option value="Maintenance">
                Maintenance
              </option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-black transition hover:bg-yellow-400"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/assets/${assetId}`,
                )
              }
              className="rounded-xl border border-white/10 px-8 py-3 font-semibold transition hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
