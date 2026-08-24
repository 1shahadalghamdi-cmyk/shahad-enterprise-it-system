"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "@/app/components/system/Sidebar";
import KPICard from "@/app/iam/components/KPICard";
import SectionHeader from "@/app/iam/components/SectionHeader";

import {
  defaultIamUsers,
  type IamUser,
} from "@/lib/data/iamUsers";

import UsersFilters from "./components/UsersFilters";
import UsersTable from "./components/UsersTable";

const STORAGE_KEY =
  "iamUsers";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

function loadUsers(): IamUser[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultIamUsers;
  }

  const savedUsers =
    window.localStorage.getItem(
      STORAGE_KEY,
    );

  if (!savedUsers) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        defaultIamUsers,
      ),
    );

    return defaultIamUsers;
  }

  try {
    const parsedUsers =
      JSON.parse(
        savedUsers,
      ) as IamUser[];

    if (
      !Array.isArray(
        parsedUsers,
      )
    ) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          defaultIamUsers,
        ),
      );

      return defaultIamUsers;
    }

    /*
      Merge current default identities
      with users already created in
      localStorage.

      Existing localStorage records win
      when the same identity already
      exists.
    */
    const usersMap =
      new Map<
        string,
        IamUser
      >();

    defaultIamUsers.forEach(
      (user) => {
        usersMap.set(
          user.id,
          user,
        );
      },
    );

    parsedUsers.forEach(
      (user) => {
        usersMap.set(
          user.id,
          user,
        );
      },
    );

    /*
      Fix the old USR-1009 collision.

      Noura is now the default identity
      USR-1009.

      If an older user was created with
      USR-1009 before Noura existed,
      move that created user to the next
      available ID instead of deleting
      either identity.
    */
    const defaultNoura =
      defaultIamUsers.find(
        (user) =>
          user.id ===
          "USR-1009",
      );

    const storedCollision =
      parsedUsers.find(
        (user) =>
          user.id ===
            "USR-1009" &&
          user.email.toLowerCase() !==
            defaultNoura?.email.toLowerCase(),
      );

    if (
      defaultNoura &&
      storedCollision
    ) {
      usersMap.set(
        defaultNoura.id,
        defaultNoura,
      );

      const allUsers =
        Array.from(
          usersMap.values(),
        );

      const highestUserNumber =
        allUsers.reduce(
          (
            highest,
            user,
          ) => {
            const match =
              user.id.match(
                /^USR-(\d+)$/,
              );

            if (!match) {
              return highest;
            }

            return Math.max(
              highest,
              Number(
                match[1],
              ),
            );
          },
          1000,
        );

      const nextUserId =
        `USR-${String(
          highestUserNumber +
            1,
        ).padStart(
          4,
          "0",
        )}`;

      const highestEmployeeNumber =
        allUsers.reduce(
          (
            highest,
            user,
          ) => {
            const match =
              user.employeeId.match(
                /^EMP-(\d+)$/,
              );

            if (!match) {
              return highest;
            }

            return Math.max(
              highest,
              Number(
                match[1],
              ),
            );
          },
          0,
        );

      const nextEmployeeId =
        `EMP-${String(
          highestEmployeeNumber +
            1,
        ).padStart(
          3,
          "0",
        )}`;

      usersMap.set(
        nextUserId,
        {
          ...storedCollision,
          id: nextUserId,
          employeeId:
            nextEmployeeId,
        },
      );
    }

    const mergedUsers =
      Array.from(
        usersMap.values(),
      ).sort(
        (
          firstUser,
          secondUser,
        ) => {
          const firstNumber =
            Number(
              firstUser.id.replace(
                "USR-",
                "",
              ),
            );

          const secondNumber =
            Number(
              secondUser.id.replace(
                "USR-",
                "",
              ),
            );

          return (
            firstNumber -
            secondNumber
          );
        },
      );

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        mergedUsers,
      ),
    );

    return mergedUsers;
  } catch {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        defaultIamUsers,
      ),
    );

    return defaultIamUsers;
  }
}

function loadCurrentUser():
  CurrentUser | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  const savedUser =
    window.localStorage.getItem(
      "currentUser",
    );

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(
      savedUser,
    ) as CurrentUser;
  } catch {
    return null;
  }
}

export default function IamUsersPage() {
  const [
    users,
    setUsers,
  ] =
    useState<IamUser[]>([]);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState(
      "All",
    );

  const [
    department,
    setDepartment,
  ] =
    useState(
      "All Departments",
    );

  const [
    role,
    setRole,
  ] =
    useState(
      "All Roles",
    );

  useEffect(() => {
    setUsers(
      loadUsers(),
    );

    setCurrentUser(
      loadCurrentUser(),
    );
  }, []);

  const isAdmin =
    currentUser?.role ===
    "IT Admin";

  const departments =
    useMemo(() => {
      return Array.from(
        new Set(
          users.map(
            (user) =>
              user.department,
          ),
        ),
      ).sort();
    }, [users]);

  const roles =
    useMemo(() => {
      return Array.from(
        new Set(
          users.map(
            (user) =>
              user.role,
          ),
        ),
      ).sort();
    }, [users]);

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        search
          .toLowerCase()
          .trim();

      return users.filter(
        (user) => {
          const matchesSearch =
            normalizedSearch ===
              "" ||
            user.id
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            user.employeeId
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            user.fullName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            user.email
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            user.username
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            user.jobTitle
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            status ===
              "All" ||
            user.status ===
              status;

          const matchesDepartment =
            department ===
              "All Departments" ||
            user.department ===
              department;

          const matchesRole =
            role ===
              "All Roles" ||
            user.role ===
              role;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesDepartment &&
            matchesRole
          );
        },
      );
    }, [
      department,
      role,
      search,
      status,
      users,
    ]);

  const activeUsers =
    users.filter(
      (user) =>
        user.status ===
        "Active",
    ).length;

  const lockedUsers =
    users.filter(
      (user) =>
        user.status ===
        "Locked",
    ).length;

  const disabledUsers =
    users.filter(
      (user) =>
        user.status ===
        "Disabled",
    ).length;

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Identity Lifecycle
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Users Management
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Manage enterprise identities,
              account status, departments,
              roles, and MFA enrollment.
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/iam/users/new"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              + New User
            </Link>
          )}
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Total Users"
            value={
              users.length
            }
            subtitle="All identity records"
          />

          <KPICard
            title="Active"
            value={
              activeUsers
            }
            color="text-green-400"
            subtitle="Enabled accounts"
          />

          <KPICard
            title="Locked"
            value={
              lockedUsers
            }
            color="text-red-400"
            subtitle="Requires unlock"
          />

          <KPICard
            title="Disabled"
            value={
              disabledUsers
            }
            color="text-zinc-400"
            subtitle="Access blocked"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 p-6">
            <SectionHeader
              title="Enterprise Directory"
              description={`Showing ${filteredUsers.length} of ${users.length} users.`}
            />

            <UsersFilters
              search={
                search
              }
              status={
                status
              }
              department={
                department
              }
              role={
                role
              }
              departments={
                departments
              }
              roles={
                roles
              }
              onSearchChange={
                setSearch
              }
              onStatusChange={
                setStatus
              }
              onDepartmentChange={
                setDepartment
              }
              onRoleChange={
                setRole
              }
            />
          </div>

          <UsersTable
            users={
              filteredUsers
            }
          />
        </section>
      </section>
    </main>
  );
}
