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
import { createNotification } from "@/lib/notifications";

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
  assignedTo: string;
  department: string;
  status: string;
};

type Ticket = {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  assetId: string;
  assetName: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status:
    | "Open"
    | "Assigned"
    | "In Progress"
    | "Waiting for User"
    | "Resolved"
    | "Closed";
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
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

export default function NewTicketPage() {
  const router = useRouter();

  const {
    employees: enterpriseEmployees,
    assets: enterpriseAssets,
    isLoading,
  } = useEnterpriseData();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [assetId, setAssetId] = useState("");

  const [priority, setPriority] =
    useState<Ticket["priority"]>("Medium");

  const [assignedTo, setAssignedTo] =
    useState("IT Support");

  const [formError, setFormError] = useState("");

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedCurrentUser =
        JSON.parse(savedCurrentUser) as CurrentUser;

      setCurrentUser(parsedCurrentUser);
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

  const employees = useMemo<Employee[]>(
    () =>
      enterpriseEmployees.filter(
        (employee) => employee.status === "Active",
      ),
    [enterpriseEmployees],
  );

  useEffect(() => {
    if (
      !currentUser ||
      currentUser.role !== "Employee" ||
      employees.length === 0
    ) {
      return;
    }

    const normalizedEmail =
      currentUser.email.toLowerCase().trim();

    const normalizedName =
      currentUser.name.toLowerCase().trim();

    const matchedEmployee =
      employees.find(
        (employee) =>
          employee.email.toLowerCase().trim() ===
            normalizedEmail ||
          employee.name.toLowerCase().trim() ===
            normalizedName,
      ) ?? null;

    if (!matchedEmployee) {
      setFormError(
        "Your login account is not linked to an active employee record.",
      );
      return;
    }

    setEmployeeId(matchedEmployee.id);
    setAssignedTo("IT Support");
  }, [currentUser, employees]);

  const assets = useMemo<Asset[]>(() => {
    const assetsMap = new Map<string, Asset>();

    defaultAssets.forEach((asset) => {
      assetsMap.set(asset.id.toUpperCase(), asset);
    });

    enterpriseAssets.forEach((asset) => {
      assetsMap.set(asset.id.toUpperCase(), asset);
    });

    return Array.from(assetsMap.values());
  }, [enterpriseAssets]);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee.id === employeeId,
      ) ?? null,
    [employees, employeeId],
  );

  const employeeAssets = useMemo(() => {
    if (!selectedEmployee) {
      return assets;
    }

    return assets.filter((asset) => {
      const assignedValue =
        asset.assignedTo.toLowerCase().trim();

      return (
        assignedValue ===
          selectedEmployee.id.toLowerCase().trim() ||
        assignedValue ===
          selectedEmployee.name.toLowerCase().trim()
      );
    });
  }, [assets, selectedEmployee]);

  function handleEmployeeChange(
    selectedEmployeeId: string,
  ) {
    setEmployeeId(selectedEmployeeId);
    setAssetId("");
    setFormError("");
  }

  function generateTicketId(savedTickets: Ticket[]) {
    const ticketNumbers = savedTickets
      .map((ticket) => {
        const numberPart = ticket.id.replace(
          "INC-",
          "",
        );

        return Number(numberPart);
      })
      .filter((number) => !Number.isNaN(number));

    const highestTicketNumber =
      ticketNumbers.length > 0
        ? Math.max(...ticketNumbers)
        : 1003;

    return `INC-${highestTicketNumber + 1}`;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setFormError("Please enter the issue title.");
      return;
    }

    if (!cleanDescription) {
      setFormError(
        "Please enter a description of the issue.",
      );
      return;
    }

    if (!selectedEmployee) {
      setFormError("Please select an employee.");
      return;
    }

    try {
      const savedCurrentUser =
        window.localStorage.getItem("currentUser");

      if (!savedCurrentUser) {
        router.replace("/login");
        return;
      }

      let currentUserName = "Unknown User";

      try {
        const parsedCurrentUser = JSON.parse(
          savedCurrentUser,
        ) as {
          name?: string;
          email?: string;
        };

        currentUserName =
          parsedCurrentUser.name ||
          parsedCurrentUser.email ||
          "Unknown User";
      } catch {
        currentUserName = savedCurrentUser;
      }

      const savedTickets = JSON.parse(
        window.localStorage.getItem("tickets") || "[]",
      ) as Ticket[];

      const selectedAsset =
        assets.find((asset) => asset.id === assetId) ??
        null;

      const currentDate = new Date().toISOString();

      const newTicket: Ticket = {
        id: generateTicketId(savedTickets),
        title: cleanTitle,
        description: cleanDescription,

        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,

        assetId: selectedAsset?.id || "",
        assetName: selectedAsset?.name || "",

        priority,
        status: "Open",
        assignedTo: assignedTo.trim() || "IT Support",

        createdAt: currentDate,
        updatedAt: currentDate,
      };

      window.localStorage.setItem(
        "tickets",
        JSON.stringify([
          newTicket,
          ...savedTickets,
        ]),
      );

      logActivity(
        "Created Ticket",
        currentUserName,
        `${newTicket.id} - ${newTicket.title}`,
      );

      createNotification({
        title: "New Ticket Submitted",
        message: `${newTicket.employeeName} created ${newTicket.id}: ${newTicket.title}`,
        href: `/tickets/${newTicket.id}`,
        recipientRoles: ["IT Admin", "IT Support"],
      });

      router.push("/tickets");
    } catch (error) {
      console.error("Ticket creation error:", error);

      setFormError(
        "The ticket could not be created. Please try again.",
      );
    }
  }

  if (isLoading || !currentUser) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-gray-400">
            Loading ticket form...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              IT Helpdesk
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Create New Ticket
            </h1>

            <p className="mt-4 max-w-2xl text-gray-400">
              Record a technical incident and link it to
              the affected employee and company asset.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900 p-6 md:p-8"
          >
            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}
                        <div>
              <label className="mb-2 block text-sm font-medium">
                Issue Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Example: Laptop will not start"
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Employee
              </label>

              {currentUser?.role === "Employee" ? (
                <input
                  type="text"
                  value={
                    selectedEmployee
                      ? `${selectedEmployee.name} — ${selectedEmployee.department}`
                      : "Employee account not linked"
                  }
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-gray-400 outline-none"
                />
              ) : (
                <select
                  value={employeeId}
                  onChange={(event) =>
                    handleEmployeeChange(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name} —{" "}
                      {employee.department}
                    </option>
                  ))}
                </select>
              )}

              {employees.length === 0 && (
                <p className="mt-2 text-sm text-yellow-400">
                  No active employees are available.
                  Create or activate an employee first.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Related Asset
              </label>

              <select
                value={assetId}
                onChange={(event) =>
                  setAssetId(event.target.value)
                }
                disabled={!employeeId}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:text-gray-600 focus:border-blue-500"
              >
                <option value="">
                  No related asset
                </option>

                {employeeAssets.map((asset) => (
                  <option
                    key={asset.id}
                    value={asset.id}
                  >
                    {asset.id} — {asset.name}
                  </option>
                ))}
              </select>

              {employeeId &&
                employeeAssets.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    This employee has no assigned assets.
                    You may create the ticket without an
                    asset.
                  </p>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as Ticket["priority"],
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="High">High</option>
                  <option value="Critical">
                    Critical
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Assign To
                </label>

                <input
                  type="text"
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(event.target.value)
                  }
                  readOnly={
                    currentUser?.role === "Employee"
                  }
                  placeholder="IT Support"
                  className={`w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500 ${
                    currentUser?.role === "Employee"
                      ? "cursor-not-allowed text-gray-400"
                      : ""
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the issue, error messages and troubleshooting already attempted."
                rows={7}
                required
                className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-8 py-3 font-semibold transition hover:bg-blue-500"
              >
                Create Ticket
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/tickets")
                }
                className="rounded-xl border border-white/10 px-8 py-3 font-semibold transition hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}