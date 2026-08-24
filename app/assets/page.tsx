/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/system/Sidebar";
import { useEnterpriseData } from "@/hooks/useEnterpriseData";
import { deleteAssetById } from "@/lib/storage";
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

export default function AssetsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const {
    assets,
    employees,
    isLoading,
    refreshData,
  } = useEnterpriseData();

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

      const validRoles: UserRole[] = [
        "IT Admin",
        "IT Support",
        "Employee",
      ];

      if (!validRoles.includes(parsedUser.role)) {
        window.localStorage.removeItem(
          "currentUser",
        );

        router.replace("/login");
        return;
      }

      setCurrentUser(parsedUser);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  const currentEmployee = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    const normalizedName =
      currentUser.name.toLowerCase().trim();

    const normalizedEmail =
      currentUser.email.toLowerCase().trim();

    return (
      employees.find((employee) => {
        const employeeName =
          employee.name.toLowerCase().trim();

        const employeeEmail =
          employee.email.toLowerCase().trim();

        return (
          employeeName === normalizedName ||
          employeeEmail === normalizedEmail
        );
      }) ?? null
    );
  }, [currentUser, employees]);

  const visibleAssets = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    if (
      currentUser.role === "IT Admin" ||
      currentUser.role === "IT Support"
    ) {
      return assets;
    }

    const normalizedUserName =
      currentUser.name.toLowerCase().trim();

    const normalizedEmployeeId =
      currentEmployee?.id
        .toLowerCase()
        .trim() || "";

    return assets.filter((asset) => {
      const normalizedAssignedTo =
        asset.assignedTo
          .toLowerCase()
          .trim();

      return (
        normalizedAssignedTo ===
          normalizedUserName ||
        (normalizedEmployeeId !== "" &&
          normalizedAssignedTo ===
            normalizedEmployeeId)
      );
    });
  }, [
    assets,
    currentEmployee,
    currentUser,
  ]);

  const canAddAsset =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "assets:create",
    );

  const canEditAsset =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "assets:edit",
    );

  const canDeleteAsset =
    currentUser !== null &&
    hasPermission(
      currentUser.role,
      "assets:delete",
    );

  const deleteAsset = useCallback(
    (assetId: string) => {
      if (
        !currentUser ||
        !hasPermission(
          currentUser.role,
          "assets:delete",
        )
      ) {
        window.alert(
          "You do not have permission to delete assets.",
        );

        return;
      }

      const assetToDelete = assets.find(
        (asset) =>
          asset.id.toUpperCase() ===
          assetId.toUpperCase(),
      );

      const confirmed = window.confirm(
        `Are you sure you want to delete ${
          assetToDelete
            ? `${assetToDelete.id} - ${assetToDelete.name}`
            : assetId
        }?`,
      );

      if (!confirmed) {
        return;
      }

      deleteAssetById(assetId);

      logActivity(
        "Deleted Asset",
        currentUser.name,
        assetToDelete
          ? `${assetToDelete.id} - ${assetToDelete.name}`
          : assetId,
      );

      refreshData();
    },
    [
      assets,
      currentUser,
      refreshData,
    ],
  );

  const getAssignedEmployeeName =
    useCallback(
      (assignedTo: string) => {
        if (!assignedTo) {
          return "Unassigned";
        }

        const normalizedAssignedTo =
          assignedTo
            .toLowerCase()
            .trim();

        const employee = employees.find(
          (item) => {
            const employeeId =
              item.id
                .toLowerCase()
                .trim();

            const employeeName =
              item.name
                .toLowerCase()
                .trim();

            return (
              employeeId ===
                normalizedAssignedTo ||
              employeeName ===
                normalizedAssignedTo
            );
          },
        );

        return (
          employee?.name ||
          assignedTo
        );
      },
      [employees],
    );

  const filteredAssets = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    if (!searchValue) {
      return visibleAssets;
    }

    return visibleAssets.filter(
      (asset) => {
        const employeeName =
          getAssignedEmployeeName(
            asset.assignedTo,
          );

        const searchableValues = [
          asset.id,
          asset.name,
          asset.category,
          employeeName,
          asset.department,
          asset.status,
        ];

        return searchableValues.some(
          (value) =>
            value
              .toLowerCase()
              .includes(searchValue),
        );
      },
    );
  }, [
    getAssignedEmployeeName,
    search,
    visibleAssets,
  ]);

  const assignedCount = useMemo(
    () =>
      visibleAssets.filter(
        (asset) =>
          asset.status === "Assigned",
      ).length,
    [visibleAssets],
  );

  const availableCount = useMemo(
    () =>
      visibleAssets.filter(
        (asset) =>
          asset.status === "Available" ||
          asset.status === "Active",
      ).length,
    [visibleAssets],
  );

  const maintenanceCount = useMemo(
    () =>
      visibleAssets.filter(
        (asset) =>
          asset.status === "Maintenance",
      ).length,
    [visibleAssets],
  );

  if (isLoading || !currentUser) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-gray-400">
            Loading assets...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                Enterprise IT System
              </p>

              <h1 className="text-4xl font-bold md:text-5xl">
                {currentUser.role ===
                "Employee"
                  ? "My Assets"
                  : "IT Asset Management"}
              </h1>

              <p className="mt-4 max-w-2xl text-gray-400">
                {currentUser.role ===
                "Employee"
                  ? "Review the company assets currently assigned to you."
                  : "Track company devices, employees, departments and asset status through one centralized dashboard."}
              </p>
            </div>

            {canAddAsset && (
              <Link
                href="/assets/new"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                + Add Asset
              </Link>
            )}
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={
                currentUser.role ===
                "Employee"
                  ? "My Assets"
                  : "Total Assets"
              }
              value={visibleAssets.length.toString()}
            />

            <StatCard
              title="Assigned"
              value={assignedCount.toString()}
            />

            <StatCard
              title="Available"
              value={availableCount.toString()}
            />

            <StatCard
              title="Maintenance"
              value={maintenanceCount.toString()}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-semibold">
                  {currentUser.role ===
                  "Employee"
                    ? "My Asset Inventory"
                    : "Assets Inventory"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Search and review technology assets.
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search assets..."
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500 md:w-80"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-sm uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-4">
                      Asset ID
                    </th>

                    <th className="px-4 py-4">
                      Asset Name
                    </th>

                    <th className="px-4 py-4">
                      Category
                    </th>

                    <th className="px-4 py-4">
                      Assigned To
                    </th>

                    <th className="px-4 py-4">
                      Department
                    </th>

                    <th className="px-4 py-4">
                      Status
                    </th>

                    <th className="px-4 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssets.map(
                    (asset) => (
                      <tr
                        key={asset.id}
                        className="border-b border-white/5 text-sm transition hover:bg-white/5"
                      >
                        <td className="px-4 py-5 font-medium text-blue-400">
                          {asset.id}
                        </td>

                        <td className="px-4 py-5 font-medium">
                          {asset.name}
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {asset.category}
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {getAssignedEmployeeName(
                            asset.assignedTo,
                          )}
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {asset.department ||
                            "Not assigned"}
                        </td>

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              asset.status
                            }
                          />
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/assets/${asset.id}`}
                              className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-blue-500 hover:text-blue-400"
                            >
                              View
                            </Link>

                            {canEditAsset && (
                              <Link
                                href={`/assets/${asset.id}/edit`}
                                className="rounded-lg border border-yellow-500/40 px-4 py-2 text-sm text-yellow-400 transition hover:bg-yellow-500 hover:text-black"
                              >
                                Edit
                              </Link>
                            )}

                            {canDeleteAsset && (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteAsset(
                                    asset.id,
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
                    ),
                  )}
                </tbody>
              </table>

              {filteredAssets.length ===
                0 && (
                <div className="py-12 text-center text-gray-500">
                  {currentUser.role ===
                  "Employee"
                    ? "No assets are assigned to you."
                    : "No assets found."}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
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

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    Assigned:
      "bg-blue-500/10 text-blue-400",
    Available:
      "bg-green-500/10 text-green-400",
    Active:
      "bg-green-500/10 text-green-400",
    Maintenance:
      "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ??
        "bg-gray-500/10 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}
