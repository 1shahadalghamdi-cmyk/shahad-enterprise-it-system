/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { logActivity } from "@/lib/activityLogger";

interface Asset {
  id: string;
  name: string;
  category: string;
  department: string;
  assignedTo: string;
  status: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  status: "Active" | "Inactive";
}

interface AssetHistoryRecord {
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
}

type TicketStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting for User"
  | "Resolved"
  | "Closed";

type TicketPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

interface Ticket {
  id: string;
  title: string;
  description?: string;
  employeeId?: string;
  employeeName: string;
  assetId: string;
  assetName?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt?: string;
}

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

const defaultTickets: Ticket[] = [
  {
    id: "INC-1001",
    title: "Laptop will not start",
    description:
      "The employee reported that the laptop does not power on.",
    employeeName: "Ahmed Ali",
    assetId: "AST-001",
    assetName: "Dell Latitude 5420",
    priority: "High",
    status: "Open",
    assignedTo: "IT Support",
    createdAt: "2026-07-31T08:30:00.000Z",
    updatedAt: "2026-07-31T08:30:00.000Z",
  },
  {
    id: "INC-1002",
    title: "Microsoft Outlook login issue",
    description:
      "The employee cannot sign in to Microsoft Outlook.",
    employeeName: "Sara Mohammed",
    assetId: "AST-002",
    assetName: "HP EliteBook 840",
    priority: "Medium",
    status: "In Progress",
    assignedTo: "Shahad Alghamdi",
    createdAt: "2026-07-30T10:15:00.000Z",
    updatedAt: "2026-07-30T10:15:00.000Z",
  },
  {
    id: "INC-1003",
    title: "Monitor display problem",
    description:
      "The monitor intermittently loses signal.",
    employeeName: "Khalid Hassan",
    assetId: "AST-003",
    assetName: "Dell Monitor P2422H",
    priority: "Low",
    status: "Resolved",
    assignedTo: "IT Support",
    createdAt: "2026-07-29T07:45:00.000Z",
    updatedAt: "2026-07-29T07:45:00.000Z",
  },
];

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email?: string;
  role: UserRole;
};

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;

  const assetId = Array.isArray(rawId)
    ? rawId[0]
    : String(rawId || "");

  const [asset, setAsset] = useState<Asset | null>(null);

  const [assignedEmployee, setAssignedEmployee] =
    useState<Employee | null>(null);

  const [assetHistory, setAssetHistory] =
    useState<AssetHistoryRecord[]>([]);

  const [relatedTickets, setRelatedTickets] =
    useState<Ticket[]>([]);

  const [assetUrl, setAssetUrl] = useState("");

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    let parsedCurrentUser: CurrentUser;

    try {
      parsedCurrentUser =
        JSON.parse(savedCurrentUser) as CurrentUser;

      const validRoles: UserRole[] = [
        "IT Admin",
        "IT Support",
        "Employee",
      ];

      if (!validRoles.includes(parsedCurrentUser.role)) {
        window.localStorage.removeItem("currentUser");
        router.replace("/login");
        return;
      }

      setCurrentUser(parsedCurrentUser);
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
      return;
    }

    try {
      let storedAssets: Asset[] = [];
      let storedEmployees: Employee[] = [];
      let storedHistory: AssetHistoryRecord[] = [];
      let storedTickets: Ticket[] = [];

      const savedAssets =
        window.localStorage.getItem("assets");

      const savedEmployees =
        window.localStorage.getItem("employees");

      const savedHistory =
        window.localStorage.getItem("assetHistory");

      const savedTickets =
        window.localStorage.getItem("tickets");

      const deletedAssetIds = JSON.parse(
        window.localStorage.getItem("deletedAssetIds") || "[]",
      ) as string[];

      const deletedAssetIdSet = new Set(
        deletedAssetIds.map((id) =>
          id.toUpperCase(),
        ),
      );

      if (savedAssets) {
        const parsedAssets = JSON.parse(savedAssets);

        if (Array.isArray(parsedAssets)) {
          storedAssets = parsedAssets;
        }
      }

      if (savedEmployees) {
        const parsedEmployees =
          JSON.parse(savedEmployees);

        if (Array.isArray(parsedEmployees)) {
          storedEmployees = parsedEmployees;
        }
      }

      if (savedHistory) {
        const parsedHistory =
          JSON.parse(savedHistory);

        if (Array.isArray(parsedHistory)) {
          storedHistory = parsedHistory;
        }
      }

      if (savedTickets) {
        const parsedTickets =
          JSON.parse(savedTickets);

        if (Array.isArray(parsedTickets)) {
          storedTickets = parsedTickets;
        }
      }

      const assetsMap = new Map<string, Asset>();

      defaultAssets
        .filter(
          (item) =>
            !deletedAssetIdSet.has(
              item.id.toUpperCase(),
            ),
        )
        .forEach((item) => {
          assetsMap.set(
            item.id.toUpperCase(),
            item,
          );
        });

      storedAssets
        .filter(
          (item) =>
            !deletedAssetIdSet.has(
              item.id.toUpperCase(),
            ),
        )
        .forEach((item) => {
          assetsMap.set(
            item.id.toUpperCase(),
            item,
          );
        });

      const allAssets = Array.from(
        assetsMap.values(),
      );

      const foundAsset = allAssets.find(
        (item) =>
          item.id.toUpperCase() ===
          assetId.toUpperCase(),
      );

      if (
        parsedCurrentUser.role === "Employee" &&
        foundAsset
      ) {
        const normalizedUserName =
          parsedCurrentUser.name.toLowerCase().trim();

        const normalizedUserEmail =
          parsedCurrentUser.email
            ?.toLowerCase()
            .trim() || "";

        const matchingEmployee =
          storedEmployees.find((employee) => {
            const employeeName =
              employee.name.toLowerCase().trim();

            const employeeEmail =
              employee.email.toLowerCase().trim();

            return (
              employeeName === normalizedUserName ||
              (normalizedUserEmail !== "" &&
                employeeEmail === normalizedUserEmail)
            );
          });

        const normalizedEmployeeId =
          matchingEmployee?.id
            .toLowerCase()
            .trim() || "";

        const normalizedAssignedTo =
          foundAsset.assignedTo
            .toLowerCase()
            .trim();

        const ownsAsset =
          normalizedAssignedTo === normalizedUserName ||
          (normalizedEmployeeId !== "" &&
            normalizedAssignedTo === normalizedEmployeeId);

        if (!ownsAsset) {
          router.replace("/assets");
          return;
        }
      }

      setAsset(foundAsset ?? null);

      if (foundAsset?.assignedTo) {
        const employee = storedEmployees.find(
          (item) =>
            item.id === foundAsset.assignedTo ||
            item.name.toLowerCase() ===
              foundAsset.assignedTo.toLowerCase(),
        );

        setAssignedEmployee(employee ?? null);
      } else {
        setAssignedEmployee(null);
      }

      const currentAssetHistory = storedHistory
        .filter(
          (record) =>
            record.assetId.toUpperCase() ===
            assetId.toUpperCase(),
        )
        .sort(
          (firstRecord, secondRecord) =>
            new Date(
              secondRecord.changedAt,
            ).getTime() -
            new Date(
              firstRecord.changedAt,
            ).getTime(),
        );

      setAssetHistory(currentAssetHistory);

      const ticketsMap =
        new Map<string, Ticket>();

      defaultTickets.forEach((ticket) => {
        ticketsMap.set(
          ticket.id.toUpperCase(),
          ticket,
        );
      });

      storedTickets.forEach((ticket) => {
        ticketsMap.set(
          ticket.id.toUpperCase(),
          ticket,
        );
      });

      const allTickets = Array.from(
        ticketsMap.values(),
      );

      const currentRelatedTickets = allTickets
        .filter(
          (ticket) =>
            ticket.assetId?.toUpperCase() ===
            assetId.toUpperCase(),
        )
        .sort(
          (firstTicket, secondTicket) =>
            new Date(
              secondTicket.createdAt,
            ).getTime() -
            new Date(
              firstTicket.createdAt,
            ).getTime(),
        );

      setRelatedTickets(currentRelatedTickets);

      setAssetUrl(window.location.href);
      
    } catch (error) {
      console.error(
        "Asset loading error:",
        error,
      );

      const fallbackAsset =
        defaultAssets.find(
          (item) =>
            item.id.toUpperCase() ===
            assetId.toUpperCase(),
        );

      const fallbackRelatedTickets =
        defaultTickets.filter(
          (ticket) =>
            ticket.assetId.toUpperCase() ===
            assetId.toUpperCase(),
        );

      setAsset(fallbackAsset ?? null);
      setAssignedEmployee(null);
      setAssetHistory([]);
      setRelatedTickets(
        fallbackRelatedTickets,
      );

      const qrBaseUrl =
        window.location.hostname === "localhost"
          ? "http://192.168.100.13:3000"
          : window.location.origin;

      setAssetUrl(
        `${qrBaseUrl}/assets/${assetId}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [assetId, router]);

  function formatDate(
    dateValue: string,
  ) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  async function copyAssetLink() {
    if (!assetUrl) return;

    try {
      await navigator.clipboard.writeText(assetUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Copy link error:", error);
      window.prompt("Copy this asset link:", assetUrl);
    }
  }

  function downloadQrCode() {
    const svg = qrContainerRef.current?.querySelector("svg");

    if (!svg || !asset) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = objectUrl;
    downloadLink.download = `${asset.id}-qr-code.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(objectUrl);
  }

  function printAssetLabel() {
    const svg = qrContainerRef.current?.querySelector("svg");

    if (!svg || !asset) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const printWindow = window.open("", "_blank", "width=600,height=700");

    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <title>${asset.id} Asset Label</title>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              font-family: Arial, sans-serif;
              background: #ffffff;
              color: #111827;
            }
            .label {
              width: 360px;
              border: 2px solid #111827;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
            }
            .eyebrow {
              margin: 0 0 10px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.18em;
              text-transform: uppercase;
            }
            h1 { margin: 0; font-size: 24px; }
            .asset-id { margin: 8px 0 20px; font-size: 18px; font-weight: 700; }
            svg { width: 220px; height: 220px; }
            .footer { margin: 18px 0 0; font-size: 13px; }
            @media print {
              body { min-height: auto; }
              .label { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <p class="eyebrow">Enterprise IT Asset</p>
            <h1>${asset.name}</h1>
            <p class="asset-id">${asset.id}</p>
            ${svgData}
            <p class="footer">Property of ${asset.department || "IT Department"}</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function deleteAsset() {
    if (!asset || currentUser?.role !== "IT Admin") {
      window.alert(
        "Only the IT Admin can delete assets.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${asset.id} - ${asset.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const savedAssets = JSON.parse(
        window.localStorage.getItem("assets") || "[]",
      ) as Asset[];

      const updatedAssets = savedAssets.filter(
        (item) =>
          item.id.toUpperCase() !==
          asset.id.toUpperCase(),
      );

      window.localStorage.setItem(
        "assets",
        JSON.stringify(updatedAssets),
      );

      const savedDeletedAssetIds = JSON.parse(
        window.localStorage.getItem("deletedAssetIds") || "[]",
      ) as string[];

      const updatedDeletedAssetIds = Array.from(
        new Set([
          ...savedDeletedAssetIds.map((id) =>
            id.toUpperCase(),
          ),
          asset.id.toUpperCase(),
        ]),
      );

      window.localStorage.setItem(
        "deletedAssetIds",
        JSON.stringify(updatedDeletedAssetIds),
      );

      const savedHistory = JSON.parse(
        window.localStorage.getItem("assetHistory") || "[]",
      ) as AssetHistoryRecord[];

      const updatedHistory = savedHistory.filter(
        (record) =>
          record.assetId.toUpperCase() !==
          asset.id.toUpperCase(),
      );

      window.localStorage.setItem(
        "assetHistory",
        JSON.stringify(updatedHistory),
      );

      logActivity(
        "Deleted Asset",
        currentUser.name,
        `${asset.id} - ${asset.name}`,
      );

      router.push("/assets");
    } catch (error) {
      console.error("Asset deletion error:", error);

      window.alert(
        "Unable to delete the asset. Please try again.",
      );
    }
  }

  function getHistoryBadgeStyle(
    action: string,
  ) {
    if (
      action
        .toLowerCase()
        .includes("assignment")
    ) {
      return "bg-blue-500/10 text-blue-400";
    }

    if (
      action.toLowerCase().includes("status")
    ) {
      return "bg-yellow-500/10 text-yellow-400";
    }

    return "bg-gray-500/10 text-gray-400";
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-lg text-gray-400">
          Loading asset...
        </p>
      </main>
    );
  }

  if (!asset) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Asset Not Found
          </h1>

          <p className="mb-8 text-gray-400">
            No asset was found with the ID:{" "}
            {assetId}
          </p>

          <Link
            href="/assets"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
          >
            Back to Assets
          </Link>
        </div>
      </main>
    );
  }

  const assignedToDisplay =
    assignedEmployee?.name ||
    asset.assignedTo ||
    "Unassigned";

  const employeeEmail =
    assignedEmployee?.email ||
    "Not available";

  const latestAssignmentRecord =
    assetHistory.find((record) =>
      record.action
        .toLowerCase()
        .includes("assignment"),
    );

  const assignedDate =
    latestAssignmentRecord
      ? formatDate(
          latestAssignmentRecord.changedAt,
        )
      : "Not available";

  const openTicketCount =
    relatedTickets.filter(
      (ticket) =>
        ticket.status !== "Resolved" &&
        ticket.status !== "Closed",
    ).length;

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          Asset Details
        </p>

        <h1 className="mb-8 text-4xl font-bold md:text-5xl">
          {asset.name}
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-zinc-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              General Information
            </h2>

            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-white">
                  Asset ID:
                </strong>{" "}
                {asset.id}
              </p>

              <p>
                <strong className="text-white">
                  Category:
                </strong>{" "}
                {asset.category}
              </p>

              <p>
                <strong className="text-white">
                  Department:
                </strong>{" "}
                {asset.department || "Not assigned"}
              </p>

              <p>
                <strong className="text-white">
                  Status:
                </strong>{" "}
                {asset.status}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-zinc-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Assignment
            </h2>

            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-white">
                  Assigned To:
                </strong>{" "}
                {assignedToDisplay}
              </p>

              <p>
                <strong className="text-white">
                  Employee ID:
                </strong>{" "}
                {assignedEmployee?.id ||
                  "Not available"}
              </p>

              <p>
                <strong className="text-white">
                  Email:
                </strong>{" "}
                {employeeEmail}
              </p>

              <p>
                <strong className="text-white">
                  Assigned Date:
                </strong>{" "}
                {assignedDate}
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-zinc-900 p-6 md:col-span-2">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
                  Asset Tracking
                </p>

                <h2 className="mb-3 text-2xl font-semibold">
                  Scan Asset QR Code
                </h2>

                <p className="mb-5 text-gray-400">
                  Scan this code to open the asset
                  details page.
                </p>

                <div className="rounded-xl bg-zinc-800 p-4">
                  <p className="text-sm text-gray-400">
                    Asset URL
                  </p>

                  <p className="mt-2 break-all text-sm text-white">
                    {assetUrl}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                {assetUrl && (
                  <>
                    <div
                      ref={qrContainerRef}
                      className="rounded-2xl bg-white p-5"
                    >
                      <QRCode
                        value={assetUrl}
                        size={220}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                      />
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={downloadQrCode}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500"
                      >
                        Download QR
                      </button>

                      <button
                        type="button"
                        onClick={printAssetLabel}
                        className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold transition hover:bg-purple-500"
                      >
                        Print Label
                      </button>

                      <button
                        type="button"
                        onClick={copyAssetLink}
                        className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-700"
                      >
                        {linkCopied ? "Link Copied" : "Copy Link"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-zinc-900 p-6 md:col-span-2">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 uppercase tracking-[0.3em] text-red-500">
                  Helpdesk
                </p>

                <h2 className="text-2xl font-semibold">
                  Related Tickets
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Review all support incidents
                  connected to this asset.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="rounded-xl bg-zinc-950 px-4 py-3 text-center">
                  <p className="text-xs text-gray-500">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {relatedTickets.length}
                  </p>
                </div>

                <div className="rounded-xl bg-red-500/10 px-4 py-3 text-center">
                  <p className="text-xs text-red-400">
                    Active
                  </p>

                  <p className="mt-1 text-xl font-bold text-red-400">
                    {openTicketCount}
                  </p>
                </div>
              </div>
            </div>

            {relatedTickets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/50 px-6 py-10 text-center">
                <p className="font-medium text-gray-300">
                  No related tickets found.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Tickets created for this asset
                  will appear here automatically.
                </p>

                <Link
                  href="/tickets/new"
                  className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                >
                  Create Ticket
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {relatedTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block rounded-xl border border-white/10 bg-zinc-950/60 p-5 transition hover:border-blue-500/50 hover:bg-zinc-950"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-bold text-blue-400">
                            {ticket.id}
                          </p>

                          <TicketStatusBadge
                            status={ticket.status}
                          />

                          <TicketPriorityBadge
                            priority={ticket.priority}
                          />
                        </div>

                        <h3 className="mt-3 text-lg font-semibold text-white">
                          {ticket.title}
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                          <p>
                            Employee:{" "}
                            <span className="text-gray-200">
                              {ticket.employeeName}
                            </span>
                          </p>

                          <p>
                            Assigned To:{" "}
                            <span className="text-gray-200">
                              {ticket.assignedTo ||
                                "Unassigned"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-sm text-gray-500 md:text-right">
                        <p>
                          {formatDate(
                            ticket.createdAt,
                          )}
                        </p>

                        <p className="mt-3 font-semibold text-blue-400">
                          View Ticket →
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-zinc-900 p-6 md:col-span-2">
            <div className="mb-6">
              <p className="mb-3 uppercase tracking-[0.3em] text-purple-500">
                Asset Activity
              </p>

              <h2 className="text-2xl font-semibold">
                Assignment & Status History
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Review assignment and status changes
                made to this asset.
              </p>
            </div>

            {assetHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/50 px-6 py-10 text-center">
                <p className="font-medium text-gray-300">
                  No history records yet.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Assignment and status changes will
                  appear here after editing this asset.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assetHistory.map((record) => {
                  const assignmentChanged =
                    record.previousAssignedTo !==
                    record.newAssignedTo;

                  const statusChanged =
                    record.previousStatus !==
                    record.newStatus;

                  return (
                    <article
                      key={record.id}
                      className="rounded-xl border border-white/10 bg-zinc-950/60 p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getHistoryBadgeStyle(
                              record.action,
                            )}`}
                          >
                            {record.action}
                          </span>

                          <p className="mt-3 text-sm text-gray-400">
                            Changed by{" "}
                            <span className="font-medium text-white">
                              {record.changedBy}
                            </span>
                          </p>
                        </div>

                        <time className="text-sm text-gray-500">
                          {formatDate(
                            record.changedAt,
                          )}
                        </time>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {assignmentChanged && (
                          <div className="rounded-xl bg-zinc-900 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Assignment Change
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                {record.previousAssignedTo ||
                                  "Unassigned"}
                              </span>

                              <span className="text-gray-600">
                                →
                              </span>

                              <span className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
                                {record.newAssignedTo ||
                                  "Unassigned"}
                              </span>
                            </div>
                          </div>
                        )}

                        {statusChanged && (
                          <div className="rounded-xl bg-zinc-900 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                              Status Change
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                {record.previousStatus}
                              </span>

                              <span className="text-gray-600">
                                →
                              </span>

                              <span className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
                                {record.newStatus}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          {currentUser?.role !== "Employee" && (
            <Link
              href={`/assets/${asset.id}/edit`}
              className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400"
            >
              Edit Asset
            </Link>
          )}

          {currentUser?.role === "IT Admin" && (
            <button
              type="button"
              onClick={deleteAsset}
              className="rounded-xl border border-red-500/40 px-6 py-3 font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
            >
              Delete Asset
            </button>
          )}

          <Link
            href="/assets"
            className="rounded-xl bg-zinc-800 px-6 py-3 font-semibold hover:bg-zinc-700"
          >
            Back to Assets
          </Link>
        </div>
      </div>
    </main>
  );
}

function TicketPriorityBadge({
  priority,
}: {
  priority: TicketPriority;
}) {
  const styles: Record<TicketPriority, string> = {
    Low: "bg-green-500/10 text-green-400",
    Medium: "bg-yellow-500/10 text-yellow-400",
    High: "bg-orange-500/10 text-orange-400",
    Critical: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function TicketStatusBadge({
  status,
}: {
  status: TicketStatus;
}) {
  const styles: Record<TicketStatus, string> = {
    Open: "bg-blue-500/10 text-blue-400",
    Assigned:
      "bg-purple-500/10 text-purple-400",
    "In Progress":
      "bg-yellow-500/10 text-yellow-400",
    "Waiting for User":
      "bg-orange-500/10 text-orange-400",
    Resolved:
      "bg-green-500/10 text-green-400",
    Closed:
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
