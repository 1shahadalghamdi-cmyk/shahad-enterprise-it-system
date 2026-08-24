/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

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
  priority:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";
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
  category?:
    | "Network"
    | "Hardware"
    | "Software"
    | "Access"
    | "Microsoft 365";
  aiConfidence?: number;
  aiReviewStatus?:
    | "Auto Approved"
    | "Needs Manual Review";
  aiClassified?: boolean;
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
  const searchParams = useSearchParams();

  const {
    employees: enterpriseEmployees,
    assets: enterpriseAssets,
    isLoading,
  } = useEnterpriseData();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [employeeId, setEmployeeId] =
    useState("");

  const [assetId, setAssetId] =
    useState("");

  const [
    prefilledAssetId,
    setPrefilledAssetId,
  ] = useState("");

  const [priority, setPriority] =
    useState<Ticket["priority"]>(
      "Medium",
    );

  const [
    assignedTo,
    setAssignedTo,
  ] = useState("IT Support");

  const [formError, setFormError] =
    useState("");

  const [
    aiCategory,
    setAiCategory,
  ] =
    useState<Ticket["category"]>(
      "Software",
    );

  const [
    aiConfidence,
    setAiConfidence,
  ] = useState(0);

  const [
    aiReviewStatus,
    setAiReviewStatus,
  ] =
    useState<
      Ticket["aiReviewStatus"]
    >("Needs Manual Review");

  const [
    aiAnalyzed,
    setAiAnalyzed,
  ] = useState(false);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  /*
   * Load current signed-in user.
   */
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

      setCurrentUser(
        parsedCurrentUser,
      );
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );

      router.replace("/login");
    }
  }, [router]);

  /*
   * Only active employees are selectable.
   */
  const employees =
    useMemo<Employee[]>(
      () =>
        enterpriseEmployees.filter(
          (employee) =>
            employee.status ===
            "Active",
        ),
      [enterpriseEmployees],
    );

  /*
   * Employee accounts automatically map
   * to their own employee record.
   */
  useEffect(() => {
    if (
      !currentUser ||
      currentUser.role !==
        "Employee" ||
      employees.length === 0
    ) {
      return;
    }

    const normalizedEmail =
      currentUser.email
        .toLowerCase()
        .trim();

    const normalizedName =
      currentUser.name
        .toLowerCase()
        .trim();

    const matchedEmployee =
      employees.find(
        (employee) =>
          employee.email
            .toLowerCase()
            .trim() ===
            normalizedEmail ||
          employee.name
            .toLowerCase()
            .trim() ===
            normalizedName,
      ) ?? null;

    if (!matchedEmployee) {
      setFormError(
        "Your login account is not linked to an active employee record.",
      );

      return;
    }

    setEmployeeId(
      matchedEmployee.id,
    );

    setAssignedTo(
      "IT Support",
    );
  }, [
    currentUser,
    employees,
  ]);

  /*
   * Merge built-in assets and
   * enterprise/localStorage assets.
   */
  const assets =
    useMemo<Asset[]>(() => {
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

      enterpriseAssets.forEach(
        (asset) => {
          assetsMap.set(
            asset.id.toUpperCase(),
            asset,
          );
        },
      );

      return Array.from(
        assetsMap.values(),
      );
    }, [enterpriseAssets]);

  /*
   * Read assetId from URL when ticket
   * creation starts from Asset Details.
   *
   * Example:
   * /tickets/new?assetId=AST-123
   */
  useEffect(() => {
    if (
      !currentUser ||
      assets.length === 0
    ) {
      return;
    }

    const requestedAssetId =
      searchParams.get(
        "assetId",
      );

    if (!requestedAssetId) {
      return;
    }

    const matchedAsset =
      assets.find(
        (asset) =>
          asset.id.toUpperCase() ===
          requestedAssetId.toUpperCase(),
      ) ?? null;

    if (!matchedAsset) {
      return;
    }

    /*
     * Employee users must only use
     * an asset actually assigned to them.
     */
    if (
      currentUser.role ===
      "Employee"
    ) {
      const employee =
        employees.find(
          (employee) =>
            employee.id ===
            employeeId,
        ) ?? null;

      if (!employee) {
        return;
      }

      const assignedValue =
        matchedAsset.assignedTo
          .toLowerCase()
          .trim();

      const belongsToEmployee =
        assignedValue ===
          employee.id
            .toLowerCase()
            .trim() ||
        assignedValue ===
          employee.name
            .toLowerCase()
            .trim();

      if (!belongsToEmployee) {
        return;
      }
    }

    setAssetId(
      matchedAsset.id,
    );

    setPrefilledAssetId(
      matchedAsset.id,
    );

    /*
     * If IT Admin / IT Support starts
     * a ticket from an employee-owned asset,
     * automatically select that employee.
     */
    if (
      currentUser.role !==
      "Employee"
    ) {
      const assignedValue =
        matchedAsset.assignedTo
          .toLowerCase()
          .trim();

      const assignedEmployee =
        employees.find(
          (employee) =>
            employee.id
              .toLowerCase()
              .trim() ===
              assignedValue ||
            employee.name
              .toLowerCase()
              .trim() ===
              assignedValue,
        ) ?? null;

      if (assignedEmployee) {
        setEmployeeId(
          assignedEmployee.id,
        );
      }
    }
  }, [
    currentUser,
    assets,
    employees,
    employeeId,
    searchParams,
  ]);

  const selectedEmployee =
    useMemo(
      () =>
        employees.find(
          (employee) =>
            employee.id ===
            employeeId,
        ) ?? null,
      [
        employees,
        employeeId,
      ],
    );

  /*
   * Normally, once an employee is
   * selected, show only their assets.
   *
   * However, if we came from an Asset
   * Details page, always preserve that
   * originating asset even if its owner
   * is something like "Meeting Room A".
   */
  const employeeAssets =
    useMemo(() => {
      if (!selectedEmployee) {
        return assets;
      }

      return assets.filter(
        (asset) => {
          const assignedValue =
            asset.assignedTo
              .toLowerCase()
              .trim();

          const assignedToEmployee =
            assignedValue ===
              selectedEmployee.id
                .toLowerCase()
                .trim() ||
            assignedValue ===
              selectedEmployee.name
                .toLowerCase()
                .trim();

          const isPrefilledAsset =
            Boolean(
              prefilledAssetId,
            ) &&
            asset.id.toUpperCase() ===
              prefilledAssetId.toUpperCase();

          return (
            assignedToEmployee ||
            isPrefilledAsset
          );
        },
      );
    }, [
      assets,
      selectedEmployee,
      prefilledAssetId,
    ]);

  function handleEmployeeChange(
    selectedEmployeeId: string,
  ) {
    setEmployeeId(
      selectedEmployeeId,
    );

    /*
     * Normal ticket creation:
     * changing employee resets asset.
     *
     * Asset-originated ticket:
     * preserve the original asset.
     */
    if (!prefilledAssetId) {
      setAssetId("");
    }

    setFormError("");
  }

  function generateTicketId(
    savedTickets: Ticket[],
  ) {
    const ticketNumbers =
      savedTickets
        .map((ticket) => {
          const numberPart =
            ticket.id.replace(
              "INC-",
              "",
            );

          return Number(
            numberPart,
          );
        })
        .filter(
          (number) =>
            !Number.isNaN(
              number,
            ),
        );

    const highestTicketNumber =
      ticketNumbers.length > 0
        ? Math.max(
            ...ticketNumbers,
          )
        : 1003;

    return `INC-${
      highestTicketNumber + 1
    }`;
  }

  function analyzeTicket() {
    const text =
      `${title} ${description}`
        .toLowerCase()
        .trim();

    if (
      !title.trim() ||
      !description.trim()
    ) {
      setFormError(
        "Enter the issue title and description before AI analysis.",
      );

      return;
    }

    let category:
      Ticket["category"] =
        "Software";

    let suggestedPriority:
      Ticket["priority"] =
        "Medium";

    let suggestedTeam =
      "Application Support";

    let confidence = 79;

    if (
      text.includes("wifi") ||
      text.includes("wi-fi") ||
      text.includes("network") ||
      text.includes("internet") ||
      text.includes("vpn")
    ) {
      category = "Network";
      suggestedTeam =
        "Network Support";
      confidence = 94;
    } else if (
      text.includes("outlook") ||
      text.includes("teams") ||
      text.includes("onedrive") ||
      text.includes("email")
    ) {
      category =
        "Microsoft 365";
      suggestedTeam =
        "Cloud Support";
      confidence = 93;
    } else if (
      text.includes("password") ||
      text.includes("access") ||
      text.includes("login") ||
      text.includes("permission")
    ) {
      category = "Access";
      suggestedTeam =
        "IAM Support";
      confidence = 92;
    } else if (
      text.includes("screen") ||
      text.includes("keyboard") ||
      text.includes("mouse") ||
      text.includes("laptop") ||
      text.includes("printer") ||
      text.includes("projector")
    ) {
      category = "Hardware";
      suggestedTeam =
        "IT Support";
      confidence = 90;
    }

    if (
      text.includes("critical") ||
      text.includes("urgent") ||
      text.includes("system down") ||
      text.includes("cannot work")
    ) {
      suggestedPriority =
        "Critical";
    } else if (
      text.includes("cannot") ||
      text.includes("failed") ||
      text.includes("crash") ||
      text.includes("disconnect")
    ) {
      suggestedPriority =
        "High";
    }

    const reviewStatus =
      confidence >= 85
        ? "Auto Approved"
        : "Needs Manual Review";

    setAiCategory(
      category,
    );

    setPriority(
      suggestedPriority,
    );

    setAssignedTo(
      reviewStatus ===
        "Needs Manual Review"
        ? "IT Support"
        : suggestedTeam,
    );

    setAiConfidence(
      confidence,
    );

    setAiReviewStatus(
      reviewStatus,
    );

    setAiAnalyzed(true);

    setFormError("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError("");

    const cleanTitle =
      title.trim();

    const cleanDescription =
      description.trim();

    if (!cleanTitle) {
      setFormError(
        "Please enter the issue title.",
      );

      return;
    }

    if (!cleanDescription) {
      setFormError(
        "Please enter a description of the issue.",
      );

      return;
    }

    if (!selectedEmployee) {
      setFormError(
        "Please select an employee.",
      );

      return;
    }

    if (!aiAnalyzed) {
      setFormError(
        "Please run AI Analysis before creating the ticket.",
      );

      return;
    }

    try {
      const savedCurrentUser =
        window.localStorage.getItem(
          "currentUser",
        );

      if (!savedCurrentUser) {
        router.replace(
          "/login",
        );

        return;
      }

      let currentUserName =
        "Unknown User";

      try {
        const parsedCurrentUser =
          JSON.parse(
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
        currentUserName =
          savedCurrentUser;
      }

      const savedTickets =
        JSON.parse(
          window.localStorage.getItem(
            "tickets",
          ) || "[]",
        ) as Ticket[];

      const selectedAsset =
        assets.find(
          (asset) =>
            asset.id ===
            assetId,
        ) ?? null;

      const currentDate =
        new Date().toISOString();

      const newTicket: Ticket = {
        id: generateTicketId(
          savedTickets,
        ),

        title: cleanTitle,

        description:
          cleanDescription,

        employeeId:
          selectedEmployee.id,

        employeeName:
          selectedEmployee.name,

        assetId:
          selectedAsset?.id ||
          "",

        assetName:
          selectedAsset?.name ||
          "",

        priority,

        status: "Open",

        assignedTo:
          assignedTo.trim() ||
          "IT Support",

        category:
          aiCategory,

        aiConfidence,

        aiReviewStatus,

        aiClassified: true,

        createdAt:
          currentDate,

        updatedAt:
          currentDate,
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
        title:
          "New Ticket Submitted",

        message:
          `${newTicket.employeeName} created ${newTicket.id}: ${newTicket.title}`,

        href:
          `/tickets/${newTicket.id}`,

        recipientRoles: [
          "IT Admin",
          "IT Support",
        ],
      });

      /*
       * If ticket was created directly
       * from Asset Details, return to
       * that asset so the user can
       * immediately see it under
       * Related Tickets.
       */
      if (prefilledAssetId) {
        router.push(
          `/assets/${prefilledAssetId}`,
        );

        return;
      }

      router.push(
        "/tickets",
      );
    } catch (error) {
      console.error(
        "Ticket creation error:",
        error,
      );

      setFormError(
        "The ticket could not be created. Please try again.",
      );
    }
  }

  if (
    isLoading ||
    !currentUser
  ) {
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
              Record a technical
              incident and link it to
              the affected employee and
              company asset.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900 p-6 md:p-8"
          >
            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {formError}
              </div>
            )}

            {prefilledAssetId && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
                <p className="text-sm font-semibold text-blue-300">
                  Asset-linked ticket
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  This ticket was
                  started from an asset
                  record. The related
                  asset has been
                  selected automatically.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Issue Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(
                    event.target.value,
                  );

                  setAiAnalyzed(
                    false,
                  );
                }}
                placeholder="Example: Projector does not display image"
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Employee
              </label>

              {currentUser.role ===
              "Employee" ? (
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
                  value={
                    employeeId
                  }
                  onChange={(
                    event,
                  ) =>
                    handleEmployeeChange(
                      event.target
                        .value,
                    )
                  }
                  required
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select employee
                  </option>

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
              )}

              {employees.length ===
                0 && (
                <p className="mt-2 text-sm text-yellow-400">
                  No active employees
                  are available. Create
                  or activate an employee
                  first.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Related Asset
              </label>

              <select
                value={
                  assetId
                }
                onChange={(
                  event,
                ) =>
                  setAssetId(
                    event.target.value,
                  )
                }
                disabled={
                  !employeeId &&
                  !prefilledAssetId
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:text-gray-600 focus:border-blue-500"
              >
                <option value="">
                  No related asset
                </option>

                {employeeAssets.map(
                  (asset) => (
                    <option
                      key={
                        asset.id
                      }
                      value={
                        asset.id
                      }
                    >
                      {asset.id} —{" "}
                      {asset.name}
                    </option>
                  ),
                )}
              </select>

              {prefilledAssetId && (
                <p className="mt-2 text-sm text-blue-400">
                  Related asset loaded
                  from the originating
                  asset record.
                </p>
              )}

              {employeeId &&
                !prefilledAssetId &&
                employeeAssets.length ===
                  0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No assets are
                    currently assigned
                    to the selected
                    employee.
                  </p>
                )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={
                  description
                }
                onChange={(
                  event,
                ) => {
                  setDescription(
                    event.target.value,
                  );

                  setAiAnalyzed(
                    false,
                  );
                }}
                rows={5}
                required
                placeholder="Describe the technical issue, error message, and impact..."
                className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.05] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
                    AI Ticket
                    Classification
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    Analyze the title
                    and description to
                    suggest category,
                    priority, and
                    support team.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    analyzeTicket
                  }
                  className="rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500"
                >
                  Analyze with AI
                </button>
              </div>

              {aiAnalyzed && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <AiResult
                    label="Category"
                    value={
                      aiCategory ||
                      "Software"
                    }
                  />

                  <AiResult
                    label="Confidence"
                    value={`${aiConfidence}%`}
                  />

                  <AiResult
                    label="Review Status"
                    value={
                      aiReviewStatus ||
                      "Needs Manual Review"
                    }
                  />

                  <AiResult
                    label="Assigned Team"
                    value={
                      assignedTo
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-medium">
                  Priority
                </span>

                <select
                  value={
                    priority
                  }
                  onChange={(
                    event,
                  ) =>
                    setPriority(
                      event.target
                        .value as Ticket["priority"],
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Critical">
                    Critical
                  </option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium">
                  Assigned To
                </span>

                <input
                  value={
                    assignedTo
                  }
                  onChange={(
                    event,
                  ) =>
                    setAssignedTo(
                      event.target
                        .value,
                    )
                  }
                  readOnly={
                    currentUser.role ===
                    "Employee"
                  }
                  className={`w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none ${
                    currentUser.role ===
                    "Employee"
                      ? "cursor-not-allowed text-gray-400"
                      : "focus:border-blue-500"
                  }`}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                Create Ticket
              </button>

              <button
                type="button"
                onClick={() => {
                  if (
                    prefilledAssetId
                  ) {
                    router.push(
                      `/assets/${prefilledAssetId}`,
                    );

                    return;
                  }

                  router.push(
                    "/tickets",
                  );
                }}
                className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
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

function AiResult({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-purple-300">
        {value}
      </p>
    </div>
  );
}
