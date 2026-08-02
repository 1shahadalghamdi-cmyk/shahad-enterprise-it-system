/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/system/Sidebar";
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

type DepartmentStatus =
  | "Active"
  | "Inactive";

type Department = {
  id: string;
  name: string;
  manager: string;
  description: string;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
};

type DepartmentForm = {
  name: string;
  manager: string;
  description: string;
  status: DepartmentStatus;
};

const STORAGE_KEY = "departments";

const defaultDepartments: Department[] = [
  {
    id: "DEP-001",
    name: "Information Technology",
    manager: "Shahad Alghamdi",
    description:
      "Manages infrastructure, technical support, systems, devices, and enterprise applications.",
    status: "Active",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "DEP-002",
    name: "Finance",
    manager: "Ahmed Ali",
    description:
      "Manages financial operations, budgeting, payments, and accounting records.",
    status: "Active",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "DEP-003",
    name: "Human Resources",
    manager: "Sara Mohammed",
    description:
      "Manages employees, recruitment, onboarding, records, and workforce services.",
    status: "Active",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "DEP-004",
    name: "Operations",
    manager: "Khalid Hassan",
    description:
      "Coordinates daily business operations and internal service delivery.",
    status: "Active",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z",
  },
];

const emptyForm: DepartmentForm = {
  name: "",
  manager: "",
  description: "",
  status: "Active",
};

function normalizeDepartmentName(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

  const aliases: Record<string, string> = {
    it: "information technology",
    "information technology department":
      "information technology",
    hr: "human resources",
    "human resources department":
      "human resources",
    ops: "operations",
    operation: "operations",
  };

  return aliases[normalized] || normalized;
}

export default function DepartmentsPage() {
  const router = useRouter();

  const {
    assets,
    employees,
    tickets,
    isLoading,
  } = useEnterpriseData();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingDepartmentId, setEditingDepartmentId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<DepartmentForm>(emptyForm);

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
        JSON.parse(savedCurrentUser) as CurrentUser;

      if (parsedUser.role !== "IT Admin") {
        router.replace("/dashboard");
        return;
      }

      setCurrentUser(parsedUser);

      const savedDepartments = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) || "[]",
      ) as Department[];

      const departmentMap =
        new Map<string, Department>();

      defaultDepartments.forEach((department) => {
        departmentMap.set(
          department.name.toLowerCase().trim(),
          department,
        );
      });

      savedDepartments.forEach((department) => {
        departmentMap.set(
          department.name.toLowerCase().trim(),
          department,
        );
      });

      setDepartments(
        Array.from(departmentMap.values()),
      );
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

  const departmentRows = useMemo(() => {
    return departments.map((department) => {
      const normalizedDepartmentName =
        normalizeDepartmentName(
          department.name,
        );

      const employeeCount = employees.filter(
        (employee) =>
          normalizeDepartmentName(
            employee.department,
          ) === normalizedDepartmentName,
      ).length;

      const assetCount = assets.filter(
        (asset) =>
          normalizeDepartmentName(
            asset.department,
          ) === normalizedDepartmentName,
      ).length;

      const openTicketCount = tickets.filter(
        (ticket) => {
          if (
            ticket.status === "Resolved" ||
            ticket.status === "Closed"
          ) {
            return false;
          }

          const ticketEmployee =
            employees.find(
              (employee) =>
                employee.name
                  .toLowerCase()
                  .trim() ===
                ticket.employeeName
                  .toLowerCase()
                  .trim(),
            );

          return (
            ticketEmployee &&
            normalizeDepartmentName(
              ticketEmployee.department,
            ) === normalizedDepartmentName
          );
        },
      ).length;

      return {
        department,
        employeeCount,
        assetCount,
        openTicketCount,
      };
    });
  }, [assets, departments, employees, tickets]);

  const filteredRows = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    if (!normalizedSearch) {
      return departmentRows;
    }

    return departmentRows.filter((row) => {
      const searchableValues = [
        row.department.id,
        row.department.name,
        row.department.manager,
        row.department.description,
        row.department.status,
      ];

      return searchableValues.some((value) =>
        value
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [departmentRows, search]);

  const activeDepartmentCount = useMemo(
    () =>
      departments.filter(
        (department) =>
          department.status === "Active",
      ).length,
    [departments],
  );

  const inactiveDepartmentCount = useMemo(
    () =>
      departments.filter(
        (department) =>
          department.status === "Inactive",
      ).length,
    [departments],
  );

  const totalAssignedAssets = useMemo(
    () =>
      departmentRows.reduce(
        (total, row) =>
          total + row.assetCount,
        0,
      ),
    [departmentRows],
  );

  function persistDepartments(
    nextDepartments: Department[],
  ) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextDepartments),
    );

    setDepartments(nextDepartments);
  }

  function generateDepartmentId() {
    const numbers = departments
      .map((department) =>
        Number(
          department.id.replace("DEP-", ""),
        ),
      )
      .filter((number) =>
        Number.isFinite(number),
      );

    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;

    return `DEP-${String(nextNumber).padStart(
      3,
      "0",
    )}`;
  }

  function openAddForm() {
    setEditingDepartmentId(null);
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(
    department: Department,
  ) {
    setEditingDepartmentId(department.id);

    setForm({
      name: department.name,
      manager: department.manager,
      description: department.description,
      status: department.status,
    });

    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingDepartmentId(null);
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(false);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    const cleanName = form.name.trim();
    const cleanManager = form.manager.trim();
    const cleanDescription =
      form.description.trim();

    if (!cleanName) {
      setFormError(
        "Department name is required.",
      );
      return;
    }

    if (!cleanManager) {
      setFormError(
        "Department manager is required.",
      );
      return;
    }

    const duplicateDepartment =
      departments.find(
        (department) =>
          department.name
            .toLowerCase()
            .trim() ===
            cleanName.toLowerCase() &&
          department.id !== editingDepartmentId,
      );

    if (duplicateDepartment) {
      setFormError(
        "A department with this name already exists.",
      );
      return;
    }

    const now = new Date().toISOString();

    if (editingDepartmentId) {
      const updatedDepartments =
        departments.map((department) =>
          department.id === editingDepartmentId
            ? {
                ...department,
                name: cleanName,
                manager: cleanManager,
                description: cleanDescription,
                status: form.status,
                updatedAt: now,
              }
            : department,
        );

      persistDepartments(updatedDepartments);

      logActivity(
        "Updated Department",
        currentUser.name,
        `${editingDepartmentId} - ${cleanName}`,
      );
    } else {
      const newDepartment: Department = {
        id: generateDepartmentId(),
        name: cleanName,
        manager: cleanManager,
        description: cleanDescription,
        status: form.status,
        createdAt: now,
        updatedAt: now,
      };

      persistDepartments([
        ...departments,
        newDepartment,
      ]);

      logActivity(
        "Created Department",
        currentUser.name,
        `${newDepartment.id} - ${newDepartment.name}`,
      );
    }

    closeForm();
  }

  function deleteDepartment(
    department: Department,
  ) {
    if (!currentUser) {
      return;
    }

    const relatedRow =
      departmentRows.find(
        (row) =>
          row.department.id === department.id,
      );

    const hasRelatedRecords =
      (relatedRow?.employeeCount || 0) > 0 ||
      (relatedRow?.assetCount || 0) > 0;

    if (hasRelatedRecords) {
      window.alert(
        "This department cannot be deleted because it still has employees or assets.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.name}?`,
    );

    if (!confirmed) {
      return;
    }

    const updatedDepartments =
      departments.filter(
        (item) =>
          item.id !== department.id,
      );

    persistDepartments(updatedDepartments);

    logActivity(
      "Deleted Department",
      currentUser.name,
      `${department.id} - ${department.name}`,
    );
  }

  if (isLoading || !currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading departments...
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                Enterprise Management
              </p>

              <h1 className="text-4xl font-bold md:text-5xl">
                Departments
              </h1>

              <p className="mt-4 max-w-3xl text-gray-400">
                Manage business departments and review
                employee, asset, and helpdesk coverage.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              + Add Department
            </button>
          </div>

          <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Departments"
              value={departments.length}
              detail="Registered departments"
            />

            <StatCard
              title="Active"
              value={activeDepartmentCount}
              detail="Currently operating"
            />

            <StatCard
              title="Inactive"
              value={inactiveDepartmentCount}
              detail="Temporarily disabled"
            />

            <StatCard
              title="Department Assets"
              value={totalAssignedAssets}
              detail="Assets across departments"
            />
          </div>

          {isFormOpen && (
            <section className="mb-8 rounded-2xl border border-blue-500/20 bg-zinc-900 p-6">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-500">
                  {editingDepartmentId
                    ? "Edit Department"
                    : "New Department"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {editingDepartmentId
                    ? "Update Department Information"
                    : "Create Department"}
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {formError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {formError}
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Department Name
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target.value,
                        })
                      }
                      placeholder="Information Technology"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Manager
                    </label>

                    <input
                      type="text"
                      value={form.manager}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          manager: event.target.value,
                        })
                      }
                      placeholder="Shahad Alghamdi"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Describe the department responsibilities."
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status:
                          event.target
                            .value as DepartmentStatus,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 md:w-72"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                  >
                    {editingDepartmentId
                      ? "Save Changes"
                      : "Create Department"}
                  </button>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Department Directory
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Review department ownership and operational
                  statistics.
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search departments..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500 md:w-80"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-4">
                      Department
                    </th>

                    <th className="px-4 py-4">
                      Manager
                    </th>

                    <th className="px-4 py-4">
                      Employees
                    </th>

                    <th className="px-4 py-4">
                      Assets
                    </th>

                    <th className="px-4 py-4">
                      Open Tickets
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-4 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.department.id}
                      className="border-b border-white/5 text-sm transition hover:bg-white/5"
                    >
                      <td className="px-4 py-5">
                        <p className="font-semibold text-white">
                          {row.department.name}
                        </p>

                        <p className="mt-1 text-xs text-blue-400">
                          {row.department.id}
                        </p>
                      </td>

                      <td className="px-4 py-5 text-gray-300">
                        {row.department.manager}
                      </td>

                      <td className="px-4 py-5 text-gray-400">
                        {row.employeeCount}
                      </td>

                      <td className="px-4 py-5 text-gray-400">
                        {row.assetCount}
                      </td>

                      <td className="px-4 py-5 text-gray-400">
                        {row.openTicketCount}
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge
                          status={
                            row.department.status
                          }
                        />
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                row.department,
                              )
                            }
                            className="rounded-lg border border-yellow-500/40 px-4 py-2 text-sm text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              row.employeeCount > 0 ||
                              row.assetCount > 0
                            }
                            title={
                              row.employeeCount > 0 ||
                              row.assetCount > 0
                                ? "Cannot delete a department that contains employees or assets."
                                : "Delete department"
                            }
                            onClick={() =>
                              deleteDepartment(
                                row.department,
                              )
                            }
                            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:border-white/10 disabled:text-gray-600 disabled:hover:bg-transparent"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRows.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  No departments found.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p className="mt-3 text-4xl font-bold">
        {value}
      </p>

      <p className="mt-3 text-xs text-gray-500">
        {detail}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: DepartmentStatus;
}) {
  const styles: Record<
    DepartmentStatus,
    string
  > = {
    Active:
      "bg-green-500/10 text-green-400",
    Inactive:
      "bg-gray-500/10 text-gray-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
