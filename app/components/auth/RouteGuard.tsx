"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type RouteGuardProps = {
  children: React.ReactNode;
};

function isRouteAllowed(
  pathname: string,
  role: UserRole,
) {
  // =========================================================
  // IT ADMIN
  // Full system access
  // =========================================================

  if (role === "IT Admin") {
    return true;
  }

  // =========================================================
  // EMPLOYEE
  // Limited self-service access
  // =========================================================

  if (role === "Employee") {
    // Dashboard
    if (pathname === "/dashboard") {
      return true;
    }

    // Assets main page
    if (pathname === "/assets") {
      return true;
    }

    // Employee can VIEW asset details,
    // but cannot create or edit assets.
    if (
      pathname.startsWith("/assets/") &&
      pathname !== "/assets/new" &&
      !pathname.endsWith("/edit")
    ) {
      return true;
    }

    // Tickets main page
    if (pathname === "/tickets") {
      return true;
    }

    // Employee can create a support ticket
    if (pathname === "/tickets/new") {
      return true;
    }

    // Employee can view ticket details,
    // but cannot access ticket edit pages.
    if (
      pathname.startsWith("/tickets/") &&
      !pathname.endsWith("/edit")
    ) {
      return true;
    }

    return false;
  }

  // =========================================================
  // IT SUPPORT
  // Operational IT access
  // =========================================================

  if (role === "IT Support") {
    const exactSupportRoutes = [
      "/dashboard",

      // Assets
      "/assets",

      // Tickets
      "/tickets",
      "/tickets/new",

      // IT Operations
      "/ai-classification",
      "/maintenance",
      "/activity-log",

      // Microsoft 365
      "/m365",

      // Identity & Access
      "/iam",
      "/iam/users",
      "/iam/groups",
      "/iam/requests",

      // Network
      "/network",

      // Windows Server
      "/windows-server",

      // Monitoring
      "/monitoring",

      // Backup & Recovery
      "/backup-recovery",
    ];

    if (
      exactSupportRoutes.includes(
        pathname,
      )
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // ASSETS
    // ---------------------------------------------------------

    // IT Support can view and edit existing assets,
    // but cannot create new assets.
    if (
      pathname.startsWith(
        "/assets/",
      ) &&
      pathname !== "/assets/new"
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // TICKETS
    // ---------------------------------------------------------

    // IT Support can access ticket details
    // and ticket actions.
    if (
      pathname.startsWith(
        "/tickets/",
      )
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // MICROSOFT 365
    // ---------------------------------------------------------

    // Main Microsoft 365 service pages
    if (
      pathname === "/m365/users" ||
      pathname === "/m365/licenses" ||
      pathname === "/m365/exchange" ||
      pathname === "/m365/teams" ||
      pathname === "/m365/onedrive" ||
      pathname === "/m365/security"
    ) {
      return true;
    }

    // Microsoft 365 user details:
    // view only.
    if (
      pathname.startsWith(
        "/m365/users/",
      ) &&
      pathname !==
        "/m365/users/new" &&
      !pathname.endsWith(
        "/edit",
      )
    ) {
      return true;
    }

    // Exchange mailbox details:
    // view only.
    if (
      pathname.startsWith(
        "/m365/exchange/",
      ) &&
      !pathname.endsWith(
        "/edit",
      )
    ) {
      return true;
    }

    // Teams details:
    // view only.
    if (
      pathname.startsWith(
        "/m365/teams/",
      ) &&
      !pathname.endsWith(
        "/edit",
      )
    ) {
      return true;
    }

    // OneDrive details:
    // view only.
    if (
      pathname.startsWith(
        "/m365/onedrive/",
      ) &&
      !pathname.endsWith(
        "/edit",
      )
    ) {
      return true;
    }

    // Security details:
    // view only.
    if (
      pathname.startsWith(
        "/m365/security/",
      ) &&
      !pathname.endsWith(
        "/edit",
      )
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // IDENTITY & ACCESS MANAGEMENT
    // ---------------------------------------------------------

    // IAM user details:
    // IT Support can VIEW users,
    // but cannot create or edit them.
    if (
      pathname.startsWith(
        "/iam/users/",
      ) &&
      pathname !==
        "/iam/users/new" &&
      !pathname.endsWith(
        "/edit",
      )
    ) {
      return true;
    }

    // IAM group details:
    // IT Support can VIEW groups,
    // but cannot create or edit them.
    if (
      pathname.startsWith(
        "/iam/groups/",
      ) &&
      pathname !==
        "/iam/groups/new" &&
      !pathname.endsWith(
        "/edit",
      )
    ) {
      return true;
    }

    // Admin-only IAM pages:
    //
    // /iam/users/new
    // /iam/users/[id]/edit
    // /iam/groups/new
    // /iam/groups/[id]/edit
    // /iam/roles
    // /iam/password-policy
    //
    // None of these reach a true condition
    // for IT Support.

    // ---------------------------------------------------------
    // NETWORK
    // ---------------------------------------------------------

    if (
      pathname.startsWith(
        "/network/",
      )
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // WINDOWS SERVER
    // ---------------------------------------------------------

    if (
      pathname.startsWith(
        "/windows-server/",
      )
    ) {
      return true;
    }

    // ---------------------------------------------------------
    // MONITORING
    // ---------------------------------------------------------

    if (
      pathname.startsWith(
        "/monitoring/",
      )
    ) {
      return true;
    }

    return false;
  }

  return false;
}

export default function RouteGuard({
  children,
}: RouteGuardProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    isAllowed,
    setIsAllowed,
  ] = useState(false);

  const [
    isChecking,
    setIsChecking,
  ] = useState(true);

  useEffect(() => {
    // Login page must always be accessible
    if (
      pathname === "/login"
    ) {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    const savedUser =
      window.localStorage.getItem(
        "currentUser",
      );

    // No logged-in user
    if (!savedUser) {
      setIsAllowed(false);
      setIsChecking(true);

      router.replace(
        "/login",
      );

      return;
    }

    try {
      const currentUser =
        JSON.parse(
          savedUser,
        ) as CurrentUser;

      const validRoles:
        UserRole[] = [
          "IT Admin",
          "IT Support",
          "Employee",
        ];

      // Invalid stored role
      if (
        !validRoles.includes(
          currentUser.role,
        )
      ) {
        window.localStorage.removeItem(
          "currentUser",
        );

        setIsAllowed(false);
        setIsChecking(true);

        router.replace(
          "/login",
        );

        return;
      }

      const allowed =
        isRouteAllowed(
          pathname,
          currentUser.role,
        );

      // Route is not allowed for this role
      if (!allowed) {
        setIsAllowed(false);
        setIsChecking(true);

        router.replace(
          "/dashboard",
        );

        return;
      }

      // Route allowed
      setIsAllowed(true);
      setIsChecking(false);
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      setIsAllowed(false);
      setIsChecking(true);

      router.replace(
        "/login",
      );
    }
  }, [
    pathname,
    router,
  ]);

  // Prevent protected page content
  // from flashing before permission
  // checking finishes.
  if (
    isChecking ||
    !isAllowed
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="text-4xl">
            🔐
          </div>

          <p className="mt-4 text-lg font-semibold">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
