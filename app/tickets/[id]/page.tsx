/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import Sidebar from "../../components/system/Sidebar";
import { logActivity } from "@/lib/activityLogger";

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

type Ticket = {
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
};

type TicketActivity = {
  id: string;
  ticketId: string;
  action: string;
  description: string;
  changedBy: string;
  createdAt: string;
};

type TicketComment = {
  id: string;
  ticketId: string;
  author: string;
  message: string;
  createdAt: string;
};

type Asset = {
  id: string;
  name: string;
  category: string;
  assignedTo: string;
  department: string;
  status: string;
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
  ticketId?: string;
  ticketTitle?: string;
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

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;

  const ticketId = Array.isArray(rawId)
    ? rawId[0]
    : String(rawId || "");

  const [ticket, setTicket] =
    useState<Ticket | null>(null);

  const [activities, setActivities] = useState<
    TicketActivity[]
  >([]);

  const [comments, setComments] = useState<
    TicketComment[]
  >([]);

  const [newComment, setNewComment] = useState("");

  const [currentUserName, setCurrentUserName] =
    useState("System User");

  const [currentUserRole, setCurrentUserRole] =
    useState<UserRole>("Employee");

  const [commentError, setCommentError] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSendingToMaintenance, setIsSendingToMaintenance] =
    useState(false);

  const [hasActiveMaintenance, setHasActiveMaintenance] =
    useState(false);

  const [maintenanceError, setMaintenanceError] =
    useState("");

  useEffect(() => {
    const currentUser =
      window.localStorage.getItem("currentUser");

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedCurrentUser =
        JSON.parse(currentUser) as CurrentUser & {
          fullName?: string;
        };

      const resolvedUserName =
        parsedCurrentUser?.name ||
        parsedCurrentUser?.fullName ||
        parsedCurrentUser?.email ||
        "System User";

      setCurrentUserName(resolvedUserName);
      setCurrentUserRole(parsedCurrentUser.role);
    } catch {
      setCurrentUserName(currentUser);
    }

    try {
      const authorizationUser =
        JSON.parse(currentUser) as CurrentUser;

      const savedTickets = JSON.parse(
        window.localStorage.getItem("tickets") || "[]",
      ) as Ticket[];

      const savedActivities = JSON.parse(
        window.localStorage.getItem(
          "ticketActivities",
        ) || "[]",
      ) as TicketActivity[];

      const savedComments = JSON.parse(
        window.localStorage.getItem(
          "ticketComments",
        ) || "[]",
      ) as TicketComment[];

      const ticketsMap = new Map<string, Ticket>();

      defaultTickets.forEach((item) => {
        ticketsMap.set(
          item.id.toUpperCase(),
          item,
        );
      });

      savedTickets.forEach((item) => {
        ticketsMap.set(
          item.id.toUpperCase(),
          item,
        );
      });

      const allTickets = Array.from(
        ticketsMap.values(),
      );

      const foundTicket = allTickets.find(
        (item) =>
          item.id.toUpperCase() ===
          ticketId.toUpperCase(),
      );

      if (
        authorizationUser.role === "Employee" &&
        foundTicket &&
        foundTicket.employeeName
          .toLowerCase()
          .trim() !==
          authorizationUser.name
            .toLowerCase()
            .trim()
      ) {
        router.replace("/tickets");
        return;
      }

      setTicket(foundTicket ?? null);

      const currentTicketActivities =
        savedActivities
          .filter(
            (activity) =>
              activity.ticketId.toUpperCase() ===
              ticketId.toUpperCase(),
          )
          .sort(
            (first, second) =>
              new Date(
                second.createdAt,
              ).getTime() -
              new Date(
                first.createdAt,
              ).getTime(),
          );

      setActivities(currentTicketActivities);

      const currentTicketComments =
        savedComments
          .filter(
            (comment) =>
              comment.ticketId.toUpperCase() ===
              ticketId.toUpperCase(),
          )
          .sort(
            (first, second) =>
              new Date(
                second.createdAt,
              ).getTime() -
              new Date(
                first.createdAt,
              ).getTime(),
          );

      setComments(currentTicketComments);

      const savedMaintenanceRecords = JSON.parse(
        window.localStorage.getItem("maintenanceRecords") || "[]",
      ) as MaintenanceRecord[];

      const activeMaintenanceExists =
        Boolean(foundTicket?.assetId) &&
        savedMaintenanceRecords.some(
          (record) =>
            record.status !== "Completed" &&
            record.status !== "Cancelled" &&
            (
              record.ticketId?.toUpperCase() ===
                ticketId.toUpperCase() ||
              (
                !record.ticketId &&
                record.assetId.toUpperCase() ===
                  foundTicket?.assetId.toUpperCase()
              )
            ),
        );

      setHasActiveMaintenance(activeMaintenanceExists);
    } catch (error) {
      console.error(
        "Ticket loading error:",
        error,
      );

      setTicket(null);
      setActivities([]);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [router, ticketId]);

  function formatDate(dateValue?: string) {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function handleAddComment(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      setCommentError(
        "Please write a comment before submitting.",
      );
      return;
    }

    const comment: TicketComment = {
      id: crypto.randomUUID(),
      ticketId,
      author: currentUserName,
      message: trimmedComment,
      createdAt: new Date().toISOString(),
    };

    try {
      const savedComments = JSON.parse(
        window.localStorage.getItem(
          "ticketComments",
        ) || "[]",
      ) as TicketComment[];

      const updatedComments = [
        ...savedComments,
        comment,
      ];

      window.localStorage.setItem(
        "ticketComments",
        JSON.stringify(updatedComments),
      );

      setComments((currentComments) => [
        comment,
        ...currentComments,
      ]);

      setNewComment("");
      setCommentError("");
    } catch (error) {
      console.error(
        "Comment save error:",
        error,
      );

      setCommentError(
        "Unable to save the comment. Please try again.",
      );
    }
  }
  function generateMaintenanceId(
    records: MaintenanceRecord[],
  ) {
    const numbers = records
      .map((record) =>
        Number(record.id.replace("MNT-", "")),
      )
      .filter((number) => Number.isFinite(number));

    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;

    return `MNT-${String(nextNumber).padStart(3, "0")}`;
  }

  function sendAssetToMaintenance() {
    if (
      !ticket ||
      currentUserRole === "Employee" ||
      !ticket.assetId
    ) {
      return;
    }

    setMaintenanceError("");
    setIsSendingToMaintenance(true);

    try {
      const maintenanceRecords = JSON.parse(
        window.localStorage.getItem("maintenanceRecords") || "[]",
      ) as MaintenanceRecord[];

      const duplicateRecord = maintenanceRecords.find(
        (record) =>
          record.status !== "Completed" &&
          record.status !== "Cancelled" &&
          (
            record.ticketId?.toUpperCase() ===
              ticket.id.toUpperCase() ||
            (
              !record.ticketId &&
              record.assetId.toUpperCase() ===
                ticket.assetId.toUpperCase()
            )
          ),
      );

      if (duplicateRecord) {
        setHasActiveMaintenance(true);
        setMaintenanceError(
          `This asset already has an active maintenance record (${duplicateRecord.id}).`,
        );
        setIsSendingToMaintenance(false);
        return;
      }

      const now = new Date();
      const nowIso = now.toISOString();
      const startDate = nowIso.slice(0, 10);

      const newMaintenanceRecord: MaintenanceRecord = {
        id: generateMaintenanceId(maintenanceRecords),
        assetId: ticket.assetId,
        assetName: ticket.assetName || "Unknown Asset",
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        issue: ticket.title,
        technician:
          ticket.assignedTo ||
          currentUserName ||
          "IT Support",
        cost: 0,
        status: "In Progress",
        notes: `Created automatically from ticket ${ticket.id}.`,
        startDate,
        completionDate: "",
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      window.localStorage.setItem(
        "maintenanceRecords",
        JSON.stringify([
          newMaintenanceRecord,
          ...maintenanceRecords,
        ]),
      );

      const savedAssets = JSON.parse(
        window.localStorage.getItem("assets") || "[]",
      ) as Asset[];

      const assetIndex = savedAssets.findIndex(
        (asset) =>
          asset.id.toUpperCase() ===
          ticket.assetId.toUpperCase(),
      );

      if (assetIndex >= 0) {
        const updatedAssets = [...savedAssets];

        updatedAssets[assetIndex] = {
          ...updatedAssets[assetIndex],
          status: "Maintenance",
        };

        window.localStorage.setItem(
          "assets",
          JSON.stringify(updatedAssets),
        );
      }

      const savedTickets = JSON.parse(
        window.localStorage.getItem("tickets") || "[]",
      ) as Ticket[];

      const updatedTicket: Ticket = {
        ...ticket,
        status: "In Progress",
        updatedAt: nowIso,
      };

      const ticketIndex = savedTickets.findIndex(
        (item) =>
          item.id.toUpperCase() ===
          ticket.id.toUpperCase(),
      );

      let updatedTickets: Ticket[];

      if (ticketIndex >= 0) {
        updatedTickets = [...savedTickets];
        updatedTickets[ticketIndex] = updatedTicket;
      } else {
        updatedTickets = [
          updatedTicket,
          ...savedTickets,
        ];
      }

      window.localStorage.setItem(
        "tickets",
        JSON.stringify(updatedTickets),
      );

      const savedActivities = JSON.parse(
        window.localStorage.getItem("ticketActivities") || "[]",
      ) as TicketActivity[];

      const maintenanceActivity: TicketActivity = {
        id: crypto.randomUUID(),
        ticketId: ticket.id,
        action: "Sent to Maintenance",
        description:
          `${ticket.assetName || ticket.assetId} was sent to maintenance. ` +
          `Maintenance record ${newMaintenanceRecord.id} was created automatically.`,
        changedBy: currentUserName,
        createdAt: nowIso,
      };

      window.localStorage.setItem(
        "ticketActivities",
        JSON.stringify([
          ...savedActivities,
          maintenanceActivity,
        ]),
      );

      logActivity(
        "Created Maintenance",
        currentUserName,
        `${newMaintenanceRecord.id} - ${ticket.assetId} - ${ticket.assetName || "Unknown Asset"}`,
      );

      setTicket(updatedTicket);
      setActivities((currentActivities) => [
        maintenanceActivity,
        ...currentActivities,
      ]);
      setHasActiveMaintenance(true);

      router.push("/maintenance");
    } catch (error) {
      console.error(
        "Send to maintenance error:",
        error,
      );

      setMaintenanceError(
        "Unable to send the asset to maintenance. Please try again.",
      );
      setIsSendingToMaintenance(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg text-gray-400">
            Loading ticket...
          </p>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold">
              Ticket Not Found
            </h1>

            <p className="mt-4 text-gray-400">
              No ticket was found with the ID:{" "}
              {ticketId}
            </p>

            <Link
              href="/tickets"
              className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Back to Tickets
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                IT Helpdesk Ticket
              </p>

              <h1 className="text-4xl font-bold md:text-5xl">
                {ticket.id}
              </h1>

              <p className="mt-4 text-xl text-gray-300">
                {ticket.title}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge status={ticket.status} />

              <PriorityBadge
                priority={ticket.priority}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6 lg:col-span-2">
              <h2 className="mb-4 text-2xl font-semibold">
                Issue Description
              </h2>

              <p className="whitespace-pre-wrap leading-7 text-gray-300">
                {ticket.description ||
                  "No description was provided."}
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Ticket Information
              </h2>

              <div className="space-y-4 text-sm text-gray-300">
                <InfoRow
                  label="Status"
                  value={ticket.status}
                />

                <InfoRow
                  label="Priority"
                  value={ticket.priority}
                />

                <InfoRow
                  label="Assigned To"
                  value={
                    ticket.assignedTo ||
                    "Unassigned"
                  }
                />

                <InfoRow
                  label="Created"
                  value={formatDate(
                    ticket.createdAt,
                  )}
                />

                <InfoRow
                  label="Last Updated"
                  value={formatDate(
                    ticket.updatedAt ||
                      ticket.createdAt,
                  )}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Employee
              </h2>

              <div className="space-y-4 text-sm text-gray-300">
                <InfoRow
                  label="Name"
                  value={ticket.employeeName}
                />

                <InfoRow
                  label="Employee ID"
                  value={
                    ticket.employeeId ||
                    "Not available"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Related Asset
              </h2>

              <div className="space-y-4 text-sm text-gray-300">
                <InfoRow
                  label="Asset ID"
                  value={
                    ticket.assetId ||
                    "No related asset"
                  }
                />

                <InfoRow
                  label="Asset Name"
                  value={
                    ticket.assetName ||
                    "Not available"
                  }
                />
              </div>

              {ticket.assetId && (
                <Link
                  href={`/assets/${ticket.assetId}`}
                  className="mt-6 inline-block rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:border-blue-500 hover:text-blue-400"
                >
                  View Asset
                </Link>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6 lg:col-span-3">
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-purple-500">
                  Ticket Activity
                </p>

                <h2 className="text-2xl font-semibold">
                  Activity Timeline
                </h2>
              </div>

              <div className="space-y-4">
                <article className="rounded-xl border border-white/10 bg-zinc-950/60 p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <p className="font-semibold text-blue-400">
                        Ticket Created
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        Ticket opened for{" "}
                        {ticket.employeeName} and
                        assigned to{" "}
                        {ticket.assignedTo}.
                      </p>
                    </div>

                    <time className="text-sm text-gray-500">
                      {formatDate(
                        ticket.createdAt,
                      )}
                    </time>
                  </div>
                </article>

                {activities.map((activity) => (
                  <article
                    key={activity.id}
                    className="rounded-xl border border-white/10 bg-zinc-950/60 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <p className="font-semibold text-purple-400">
                          {activity.action}
                        </p>

                        <p className="mt-2 text-sm text-gray-400">
                          {activity.description}
                        </p>

                        <p className="mt-3 text-xs text-gray-500">
                          Changed by{" "}
                          {activity.changedBy}
                        </p>
                      </div>

                      <time className="text-sm text-gray-500">
                        {formatDate(
                          activity.createdAt,
                        )}
                      </time>
                    </div>
                  </article>
                ))}

                {activities.length === 0 && (
                  <p className="text-center text-sm text-gray-500">
                    No additional activity has
                    been recorded yet.
                  </p>
                )}
              </div>
            </section>

        
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6 lg:col-span-3">
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-green-500">
                  Communication
                </p>

                <h2 className="text-2xl font-semibold">
                  Comments & Updates
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Add additional information, updates, or
                  communication related to this ticket.
                </p>
              </div>

              <form
                onSubmit={handleAddComment}
                className="rounded-xl border border-white/10 bg-zinc-950/60 p-5"
              >
                <label
                  htmlFor="ticket-comment"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Add Comment
                </label>

                <textarea
                  id="ticket-comment"
                  rows={4}
                  value={newComment}
                  onChange={(event) => {
                    setNewComment(
                      event.target.value,
                    );

                    if (commentError) {
                      setCommentError("");
                    }
                  }}
                  placeholder="Example: Add more details, provide an update, or reply to the support team."
                  className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-green-500"
                />

                {commentError && (
                  <p className="mt-3 text-sm text-red-400">
                    {commentError}
                  </p>
                )}

                <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="text-xs text-gray-500">
                    Commenting as{" "}
                    <span className="font-semibold text-gray-300">
                      {currentUserName}
                    </span>
                  </p>

                  <button
                    type="submit"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500"
                  >
                    Add Comment
                  </button>
                </div>
              </form>

              <div className="mt-6 space-y-4">
                {comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-xl border border-white/10 bg-zinc-950/60 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 font-bold text-green-400">
                          {comment.author
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {comment.author}
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-300">
                            {comment.message}
                          </p>
                        </div>
                      </div>

                      <time className="shrink-0 text-sm text-gray-500">
                        {formatDate(
                          comment.createdAt,
                        )}
                      </time>
                    </div>
                  </article>
                ))}

                {comments.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/30 p-8 text-center">
                    <p className="text-gray-400">
                      No comments have been added
                      yet.
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      Add the first comment or update above.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {maintenanceError && (
            <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {maintenanceError}
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            {currentUserRole !== "Employee" &&
              ticket.assetId &&
              ticket.status !== "Resolved" &&
              ticket.status !== "Closed" && (
                <button
                  type="button"
                  onClick={sendAssetToMaintenance}
                  disabled={
                    hasActiveMaintenance ||
                    isSendingToMaintenance
                  }
                  className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {hasActiveMaintenance
                    ? "Already in Maintenance"
                    : isSendingToMaintenance
                      ? "Sending..."
                      : "Send Asset to Maintenance"}
                </button>
              )}

            {currentUserRole !== "Employee" && (
              <Link
                href={`/tickets/${ticket.id}/edit`}
                className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400"
              >
                Edit Ticket
              </Link>
            )}

            <Link
              href="/tickets"
              className="rounded-xl bg-zinc-800 px-6 py-3 font-semibold transition hover:bg-zinc-700"
            >
              Back to Tickets
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
      <span className="text-gray-500">
        {label}
      </span>

      <span className="text-right font-medium text-white">
        {value}
      </span>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: TicketPriority;
}) {
  const styles: Record<
    TicketPriority,
    string
  > = {
    Low: "bg-green-500/10 text-green-400",
    Medium:
      "bg-yellow-500/10 text-yellow-400",
    High: "bg-orange-500/10 text-orange-400",
    Critical: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-semibold ${styles[priority]}`}
    >
      {priority} Priority
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: TicketStatus;
}) {
  const styles: Record<
    TicketStatus,
    string
  > = {
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
      className={`rounded-full px-4 py-2 text-sm font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
