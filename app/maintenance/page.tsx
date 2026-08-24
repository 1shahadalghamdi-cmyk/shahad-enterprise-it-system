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
import { hasPermission } from "@/lib/iam/permissions";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type MaintenanceStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled";

type MaintenanceRecord = {
  id: string;
  assetId: string;
  assetName: string;
  issue: string;
  technician: string;
  cost: number;
  status: MaintenanceStatus;
  notes: string;
  startDate: string;
  completionDate: string;
  createdAt: string;
  updatedAt: string;
};

type MaintenanceForm = {
  assetId: string;
  issue: string;
  technician: string;
  cost: string;
  status: MaintenanceStatus;
  notes: string;
  startDate: string;
  completionDate: string;
};

type Asset = {
  id: string;
  name: string;
  category: string;
  assignedTo: string;
  department: string;
  status: string;
};

const STORAGE_KEY = "maintenanceRecords";

const emptyForm: MaintenanceForm = {
  assetId: "",
  issue: "",
  technician: "IT Support",
  cost: "",
  status: "Scheduled",
  notes: "",
  startDate: new Date().toISOString().slice(0, 10),
  completionDate: "",
};

export default function MaintenancePage() {
  const router = useRouter();

  const {
    assets,
    isLoading,
    refreshData,
  } = useEnterpriseData();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const canCreateMaintenance =
    currentUser !== null &&
    hasPermission(currentUser.role, "maintenance:create");

  const canViewMaintenance =
    currentUser !== null &&
    hasPermission(currentUser.role, "maintenance:view");

  const canEditMaintenance =
    currentUser !== null &&
    hasPermission(currentUser.role, "maintenance:edit");

  const canCompleteMaintenance =
    currentUser !== null &&
    hasPermission(currentUser.role, "maintenance:complete");

  const canDeleteMaintenance =
    currentUser !== null &&
    hasPermission(currentUser.role, "maintenance:delete");

  const [records, setRecords] =
    useState<MaintenanceRecord[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | MaintenanceStatus>("All");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingRecordId, setEditingRecordId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<MaintenanceForm>(emptyForm);

  const [formError, setFormError] =
    useState("");

  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);

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

      if (
        !hasPermission(
          parsedUser.role,
          "maintenance:view",
        )
      ) {
        router.replace("/dashboard");
        return;
      }

      setCurrentUser(parsedUser);

      const savedRecords = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) || "[]",
      ) as MaintenanceRecord[];

      setRecords(savedRecords);
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  }, [router]);

  const recordsWithAssets = useMemo(
    () =>
      records.map((record) => {
        const linkedAsset =
          assets.find(
            (asset) =>
              asset.id.toUpperCase() ===
              record.assetId.toUpperCase(),
          ) ?? null;

        return {
          ...record,
          assetName:
            linkedAsset?.name ||
            record.assetName ||
            "Unknown Asset",
          department:
            linkedAsset?.department || "Not assigned",
          currentAssetStatus:
            linkedAsset?.status || "Unknown",
        };
      }),
    [assets, records],
  );

  const filteredRecords = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    return recordsWithAssets.filter((record) => {
      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        record.id,
        record.assetId,
        record.assetName,
        record.issue,
        record.technician,
        record.status,
        record.notes,
        record.department,
      ];

      return searchableValues.some((value) =>
        value
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [recordsWithAssets, search, statusFilter]);

  const scheduledCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === "Scheduled",
      ).length,
    [records],
  );

  const inProgressCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === "In Progress",
      ).length,
    [records],
  );

  const completedCount = useMemo(
    () =>
      records.filter(
        (record) =>
          record.status === "Completed",
      ).length,
    [records],
  );

  const totalCost = useMemo(
    () =>
      records
        .filter(
          (record) =>
            record.status !== "Cancelled",
        )
        .reduce(
          (sum, record) =>
            sum + record.cost,
          0,
        ),
    [records],
  );

  function persistRecords(
    nextRecords: MaintenanceRecord[],
  ) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextRecords),
    );

    setRecords(nextRecords);
  }

  function generateRecordId() {
    const numbers = records
      .map((record) =>
        Number(
          record.id.replace("MNT-", ""),
        ),
      )
      .filter((number) =>
        Number.isFinite(number),
      );

    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;

    return `MNT-${String(nextNumber).padStart(
      3,
      "0",
    )}`;
  }

  function openAddForm() {
    if (!canCreateMaintenance) {
      window.alert(
        "You do not have permission to create maintenance records.",
      );
      return;
    }

    setEditingRecordId(null);
    setForm({
      ...emptyForm,
      startDate:
        new Date().toISOString().slice(0, 10),
      technician:
        currentUser?.name || "IT Support",
    });
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(
    record: MaintenanceRecord,
  ) {
    if (!canEditMaintenance) {
      window.alert(
        "You do not have permission to edit maintenance records.",
      );
      return;
    }

    setEditingRecordId(record.id);

    setForm({
      assetId: record.assetId,
      issue: record.issue,
      technician: record.technician,
      cost:
        record.cost > 0
          ? record.cost.toString()
          : "",
      status: record.status,
      notes: record.notes,
      startDate: record.startDate,
      completionDate: record.completionDate,
    });

    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingRecordId(null);
    setForm(emptyForm);
    setFormError("");
    setIsFormOpen(false);
  }

  function updateAssetStatus(
    assetId: string,
    maintenanceStatus: MaintenanceStatus,
  ) {
    const savedAssets = JSON.parse(
      window.localStorage.getItem("assets") || "[]",
    ) as Asset[];

    const sourceAsset =
      assets.find(
        (asset) =>
          asset.id.toUpperCase() ===
          assetId.toUpperCase(),
      ) ?? null;

    if (!sourceAsset) {
      return;
    }

    const hasAssignment = Boolean(
      sourceAsset.assignedTo?.trim(),
    );

    const newAssetStatus =
      maintenanceStatus === "Completed" ||
      maintenanceStatus === "Cancelled"
        ? hasAssignment
          ? "Assigned"
          : "Available"
        : "Maintenance";

    const updatedAsset: Asset = {
      ...sourceAsset,
      status: newAssetStatus,
    };

    const existingIndex =
      savedAssets.findIndex(
        (asset) =>
          asset.id.toUpperCase() ===
          assetId.toUpperCase(),
      );

    let updatedAssets: Asset[];

    if (existingIndex >= 0) {
      updatedAssets = [...savedAssets];
      updatedAssets[existingIndex] =
        updatedAsset;
    } else {
      updatedAssets = [
        ...savedAssets,
        updatedAsset,
      ];
    }

    window.localStorage.setItem(
      "assets",
      JSON.stringify(updatedAssets),
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    if (
      editingRecordId &&
      !canEditMaintenance
    ) {
      setFormError(
        "You do not have permission to edit maintenance records.",
      );
      return;
    }

    if (
      !editingRecordId &&
      !canCreateMaintenance
    ) {
      setFormError(
        "You do not have permission to create maintenance records.",
      );
      return;
    }

    const cleanIssue = form.issue.trim();
    const cleanTechnician =
      form.technician.trim();
    const cleanNotes = form.notes.trim();

    if (!form.assetId) {
      setFormError(
        "Please select an asset.",
      );
      return;
    }

    if (!cleanIssue) {
      setFormError(
        "Please describe the maintenance issue.",
      );
      return;
    }

    if (!cleanTechnician) {
      setFormError(
        "Technician name is required.",
      );
      return;
    }

    if (!form.startDate) {
      setFormError(
        "Start date is required.",
      );
      return;
    }

    if (
      form.status === "Completed" &&
      !form.completionDate
    ) {
      setFormError(
        "Completion date is required for completed maintenance.",
      );
      return;
    }

    const selectedAsset =
      assets.find(
        (asset) =>
          asset.id === form.assetId,
      ) ?? null;

    if (!selectedAsset) {
      setFormError(
        "The selected asset could not be found.",
      );
      return;
    }

    const parsedCost =
      Number(form.cost || "0");

    if (
      Number.isNaN(parsedCost) ||
      parsedCost < 0
    ) {
      setFormError(
        "Maintenance cost must be zero or greater.",
      );
      return;
    }

    const now = new Date().toISOString();

    if (editingRecordId) {
      const originalRecord =
        records.find(
          (record) =>
            record.id === editingRecordId,
        ) ?? null;

      const updatedRecords =
        records.map((record) =>
          record.id === editingRecordId
            ? {
                ...record,
                assetId: selectedAsset.id,
                assetName: selectedAsset.name,
                issue: cleanIssue,
                technician: cleanTechnician,
                cost: parsedCost,
                status: form.status,
                notes: cleanNotes,
                startDate: form.startDate,
                completionDate:
                  form.status === "Completed"
                    ? form.completionDate
                    : "",
                updatedAt: now,
              }
            : record,
        );

      persistRecords(updatedRecords);
      updateAssetStatus(
        selectedAsset.id,
        form.status,
      );

      logActivity(
        form.status === "Completed" &&
          originalRecord?.status !== "Completed"
          ? "Completed Maintenance"
          : "Updated Maintenance",
        currentUser.name,
        `${editingRecordId} - ${selectedAsset.id} - ${selectedAsset.name}`,
      );
    } else {
      const newRecord: MaintenanceRecord = {
        id: generateRecordId(),
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        issue: cleanIssue,
        technician: cleanTechnician,
        cost: parsedCost,
        status: form.status,
        notes: cleanNotes,
        startDate: form.startDate,
        completionDate:
          form.status === "Completed"
            ? form.completionDate
            : "",
        createdAt: now,
        updatedAt: now,
      };

      persistRecords([
        newRecord,
        ...records,
      ]);

      updateAssetStatus(
        selectedAsset.id,
        form.status,
      );

      logActivity(
        "Created Maintenance",
        currentUser.name,
        `${newRecord.id} - ${selectedAsset.id} - ${selectedAsset.name}`,
      );
    }

    refreshData();
    closeForm();
  }

  function completeMaintenance(
    record: MaintenanceRecord,
  ) {
    if (!currentUser) {
      return;
    }

    if (!canCompleteMaintenance) {
      window.alert(
        "You do not have permission to complete maintenance records.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Mark ${record.id} as completed?`,
    );

    if (!confirmed) {
      return;
    }

    const now = new Date().toISOString();

    const updatedRecords =
      records.map((item) =>
        item.id === record.id
          ? {
              ...item,
              status: "Completed" as MaintenanceStatus,
              completionDate:
                now.slice(0, 10),
              updatedAt: now,
            }
          : item,
      );

    persistRecords(updatedRecords);

    updateAssetStatus(
      record.assetId,
      "Completed",
    );

    logActivity(
      "Completed Maintenance",
      currentUser.name,
      `${record.id} - ${record.assetId} - ${record.assetName}`,
    );

    refreshData();
  }

  function deleteMaintenance(
    record: MaintenanceRecord,
  ) {
    if (!currentUser) {
      return;
    }

    if (!canDeleteMaintenance) {
      window.alert(
        "Only the IT Admin can delete maintenance records.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${record.id}?`,
    );

    if (!confirmed) {
      return;
    }

    const updatedRecords =
      records.filter(
        (item) =>
          item.id !== record.id,
      );

    persistRecords(updatedRecords);

    logActivity(
      "Deleted Maintenance",
      currentUser.name,
      `${record.id} - ${record.assetId} - ${record.assetName}`,
    );
  }

  if (
    isLoading ||
    !currentUser ||
    !canViewMaintenance
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading maintenance records...
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
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
                Asset Operations
              </p>

              <h1 className="text-4xl font-bold md:text-5xl">
                Maintenance
              </h1>

              <p className="mt-4 max-w-3xl text-gray-400">
                Track asset maintenance, technicians,
                costs, progress, and completion history.
              </p>
            </div>

            {canCreateMaintenance && (
              <button
                type="button"
                onClick={openAddForm}
                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                + Add Maintenance
              </button>
            )}
          </div>

          <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="📅"
              title="Scheduled"
              value={scheduledCount}
              detail="Upcoming work"
              accent="blue"
            />

            <StatCard
              icon="🔧"
              title="In Progress"
              value={inProgressCount}
              detail="Currently being serviced"
              accent="yellow"
            />

            <StatCard
              icon="✅"
              title="Completed"
              value={completedCount}
              detail="Finished maintenance"
              accent="green"
            />

            <StatCard
              icon="💰"
              title="Total Cost"
              value={totalCost}
              detail="SAR across active records"
              isCurrency
              accent="purple"
            />
          </div>

          {isFormOpen && (
            <section className="mb-8 rounded-2xl border border-orange-500/20 bg-zinc-900 p-6">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                  {editingRecordId
                    ? "Edit Maintenance"
                    : "New Maintenance"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {editingRecordId
                    ? "Update Maintenance Record"
                    : "Create Maintenance Record"}
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
                      Asset
                    </label>

                    <select
                      value={form.assetId}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          assetId: event.target.value,
                        })
                      }
                      disabled={Boolean(editingRecordId)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:text-gray-500 focus:border-orange-500"
                    >
                      <option value="">
                        Select asset
                      </option>

                      {assets.map((asset) => (
                        <option
                          key={asset.id}
                          value={asset.id}
                        >
                          {asset.id} — {asset.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Technician
                    </label>

                    <input
                      type="text"
                      value={form.technician}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          technician:
                            event.target.value,
                        })
                      }
                      placeholder="IT Support"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Issue
                  </label>

                  <input
                    type="text"
                    value={form.issue}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        issue: event.target.value,
                      })
                    }
                    placeholder="Example: Battery replacement required"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) => {
                        const nextStatus =
                          event.target
                            .value as MaintenanceStatus;

                        setForm({
                          ...form,
                          status: nextStatus,
                          completionDate:
                            nextStatus === "Completed"
                              ? form.completionDate ||
                                new Date()
                                  .toISOString()
                                  .slice(0, 10)
                              : "",
                        });
                      }}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                    >
                      <option value="Scheduled">
                        Scheduled
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Cost (SAR)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cost}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          cost: event.target.value,
                        })
                      }
                      placeholder="0"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          startDate:
                            event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-300">
                      Completion Date
                    </label>

                    <input
                      type="date"
                      value={form.completionDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          completionDate:
                            event.target.value,
                        })
                      }
                      disabled={
                        form.status !== "Completed"
                      }
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:text-gray-600 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">
                    Notes
                  </label>

                  <textarea
                    rows={5}
                    value={form.notes}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Add troubleshooting details, parts replaced, or vendor notes."
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
                  >
                    {editingRecordId
                      ? "Save Changes"
                      : "Create Maintenance"}
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
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  Maintenance Records
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Review current and historical asset
                  maintenance work.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search maintenance..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-orange-500 sm:w-72"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "All"
                        | MaintenanceStatus,
                    )
                  }
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
                >
                  <option value="All">
                    All Statuses
                  </option>

                  <option value="Scheduled">
                    Scheduled
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-4">
                      Record
                    </th>

                    <th className="px-4 py-4">
                      Asset
                    </th>

                    <th className="px-4 py-4">
                      Issue
                    </th>

                    <th className="px-4 py-4">
                      Technician
                    </th>

                    <th className="px-4 py-4">
                      Cost
                    </th>

                    <th className="px-4 py-4">
                      Start Date
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
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-white/5 text-sm transition hover:bg-white/5"
                    >
                      <td className="px-4 py-5 font-semibold text-orange-400">
                        {record.id}
                      </td>

                      <td className="px-4 py-5">
                        <p className="font-semibold text-white">
                          {record.assetName}
                        </p>

                        <p className="mt-1 text-xs text-blue-400">
                          {record.assetId}
                        </p>
                      </td>

                      <td className="max-w-xs px-4 py-5 text-gray-300">
                        <p className="line-clamp-2">
                          {record.issue}
                        </p>
                      </td>

                      <td className="px-4 py-5 text-gray-400">
                        {record.technician}
                      </td>

                      <td className="px-4 py-5 text-gray-400">
                        {record.cost.toLocaleString(
                          "en-SA",
                        )}{" "}
                        SAR
                      </td>

                      <td className="px-4 py-5 text-gray-400">
                        {formatDate(record.startDate)}
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge
                          status={record.status}
                        />
                      </td>

                      <td className="min-w-[230px] px-4 py-5">
                        <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRecord(record)
                            }
                            className="rounded-lg border border-blue-500/40 px-4 py-2 text-sm text-blue-400 transition hover:bg-blue-500 hover:text-white"
                          >
                            View
                          </button>

                          {canEditMaintenance && (
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(record)
                              }
                              className="rounded-lg border border-yellow-500/40 px-4 py-2 text-sm text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
                            >
                              Edit
                            </button>
                          )}

                          {canCompleteMaintenance &&
                            record.status !==
                              "Completed" &&
                            record.status !==
                              "Cancelled" && (
                              <button
                                type="button"
                                onClick={() =>
                                  completeMaintenance(
                                    record,
                                  )
                                }
                                className="rounded-lg border border-green-500/40 px-4 py-2 text-sm text-green-400 transition hover:bg-green-500 hover:text-black"
                              >
                                Complete
                              </button>
                            )}

                          {canDeleteMaintenance && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteMaintenance(
                                  record,
                                )
                              }
                              className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRecords.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  No maintenance records found.
                </div>
              )}
            </div>
          </section>

          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                      Maintenance Details
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                      {selectedRecord.id}
                    </h2>

                    <p className="mt-2 text-gray-400">
                      {selectedRecord.assetId} —{" "}
                      {selectedRecord.assetName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRecord(null)
                    }
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <DetailItem
                    label="Asset"
                    value={`${selectedRecord.assetId} — ${selectedRecord.assetName}`}
                  />

                  <DetailItem
                    label="Technician"
                    value={selectedRecord.technician}
                  />

                  <DetailItem
                    label="Status"
                    value={selectedRecord.status}
                  />

                  <DetailItem
                    label="Cost"
                    value={`${selectedRecord.cost.toLocaleString(
                      "en-SA",
                    )} SAR`}
                  />

                  <DetailItem
                    label="Start Date"
                    value={formatDate(
                      selectedRecord.startDate,
                    )}
                  />

                  <DetailItem
                    label="Completion Date"
                    value={
                      selectedRecord.completionDate
                        ? formatDate(
                            selectedRecord.completionDate,
                          )
                        : "Not completed"
                    }
                  />
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Issue
                  </p>

                  <p className="mt-3 text-gray-200">
                    {selectedRecord.issue}
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Notes
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-gray-300">
                    {selectedRecord.notes ||
                      "No notes added."}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {canEditMaintenance && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecord(null);
                        openEditForm(selectedRecord);
                      }}
                      className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black transition hover:bg-yellow-400"
                    >
                      Edit Record
                    </button>
                  )}

                  {canCompleteMaintenance &&
                    selectedRecord.status !==
                      "Completed" &&
                    selectedRecord.status !==
                      "Cancelled" && (
                      <button
                        type="button"
                        onClick={() => {
                          completeMaintenance(
                            selectedRecord,
                          );
                          setSelectedRecord(null);
                        }}
                        className="rounded-xl bg-green-600 px-5 py-3 font-semibold transition hover:bg-green-500"
                      >
                        Mark Complete
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
  }).format(date);
}

function StatCard({
  icon,
  title,
  value,
  detail,
  isCurrency = false,
  accent,
}: {
  icon: string;
  title: string;
  value: number;
  detail: string;
  isCurrency?: boolean;
  accent:
    | "blue"
    | "yellow"
    | "green"
    | "purple";
}) {
  const accentStyles = {
    blue: "border-blue-500/30 bg-blue-500/5",
    yellow:
      "border-yellow-500/30 bg-yellow-500/5",
    green:
      "border-green-500/30 bg-green-500/5",
    purple:
      "border-purple-500/30 bg-purple-500/5",
  };

  return (
    <div
      className={`rounded-2xl border p-6 ${accentStyles[accent]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <p className="mt-3 text-4xl font-bold">
            {isCurrency
              ? value.toLocaleString("en-SA")
              : value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950/70 text-2xl">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        {detail}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: MaintenanceStatus;
}) {
  const styles: Record<
    MaintenanceStatus,
    string
  > = {
    Scheduled:
      "bg-blue-500/10 text-blue-400",
    "In Progress":
      "bg-yellow-500/10 text-yellow-400",
    Completed:
      "bg-green-500/10 text-green-400",
    Cancelled:
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
