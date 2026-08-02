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
import Sidebar from "../../../components/system/Sidebar";
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

export default function EditTicketPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;

  const ticketId = Array.isArray(rawId)
    ? rawId[0]
    : String(rawId || "");

  const [originalTicket, setOriginalTicket] =
    useState<Ticket | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] =
    useState<TicketPriority>("Medium");

  const [status, setStatus] =
    useState<TicketStatus>("Open");

  const [assignedTo, setAssignedTo] = useState("");

  const [currentUserName, setCurrentUserName] =
    useState("System User");

  const [isAuthorized, setIsAuthorized] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedCurrentUser =
        JSON.parse(savedCurrentUser) as CurrentUser & {
          fullName?: string;
        };

      if (
        parsedCurrentUser.role !== "IT Admin" &&
        parsedCurrentUser.role !== "IT Support"
      ) {
        router.replace("/tickets");
        return;
      }

      const resolvedUserName =
        parsedCurrentUser?.name ||
        parsedCurrentUser?.fullName ||
        parsedCurrentUser?.email ||
        "System User";

      setCurrentUserName(resolvedUserName);
      setIsAuthorized(true);
    } catch {
      window.localStorage.removeItem("currentUser");
      router.replace("/login");
      return;
    }

    try {
      const savedTickets = JSON.parse(
        window.localStorage.getItem("tickets") || "[]",
      ) as Ticket[];

      const ticketsMap = new Map<string, Ticket>();

      defaultTickets.forEach((ticket) => {
        ticketsMap.set(
          ticket.id.toUpperCase(),
          ticket,
        );
      });

      savedTickets.forEach((ticket) => {
        ticketsMap.set(
          ticket.id.toUpperCase(),
          ticket,
        );
      });

      const allTickets = Array.from(
        ticketsMap.values(),
      );

      const foundTicket = allTickets.find(
        (ticket) =>
          ticket.id.toUpperCase() ===
          ticketId.toUpperCase(),
      );

      if (!foundTicket) {
        setOriginalTicket(null);
        return;
      }

      setOriginalTicket(foundTicket);
      setTitle(foundTicket.title);
      setDescription(foundTicket.description || "");
      setPriority(foundTicket.priority);
      setStatus(foundTicket.status);
      setAssignedTo(foundTicket.assignedTo || "");
    } catch (error) {
      console.error(
        "Ticket loading error:",
        error,
      );

      setOriginalTicket(null);
    } finally {
      setIsLoading(false);
    }
  }, [router, ticketId]);

  function createActivity(
    action: string,
    activityDescription: string,
  ): TicketActivity {
    return {
      id: crypto.randomUUID(),
      ticketId,
      action,
      description: activityDescription,
      changedBy: currentUserName,
      createdAt: new Date().toISOString(),
    };
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!originalTicket || !isAuthorized) {
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Issue title is required.");
      return;
    }

    if (!assignedTo.trim()) {
      setErrorMessage(
        "Assigned engineer is required.",
      );
      return;
    }

    setErrorMessage("");
    setIsSaving(true);

    try {
      const savedTickets = JSON.parse(
        window.localStorage.getItem("tickets") || "[]",
      ) as Ticket[];

      const updatedTicket: Ticket = {
        ...originalTicket,
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assignedTo: assignedTo.trim(),
        updatedAt: new Date().toISOString(),
      };

      const existingTicketIndex =
        savedTickets.findIndex(
          (ticket) =>
            ticket.id.toUpperCase() ===
            ticketId.toUpperCase(),
        );

      let updatedTickets: Ticket[];

      if (existingTicketIndex >= 0) {
        updatedTickets = [...savedTickets];
        updatedTickets[existingTicketIndex] =
          updatedTicket;
      } else {
        updatedTickets = [
          ...savedTickets,
          updatedTicket,
        ];
      }

      window.localStorage.setItem(
        "tickets",
        JSON.stringify(updatedTickets),
      );
    
          const savedActivities = JSON.parse(
        window.localStorage.getItem(
          "ticketActivities",
        ) || "[]",
      ) as TicketActivity[];

      const newActivities: TicketActivity[] = [];

      if (originalTicket.status !== status) {
        newActivities.push(
          createActivity(
            "Status Changed",
            `Status changed from ${originalTicket.status} to ${status}.`,
          ),
        );
      }

      if (originalTicket.priority !== priority) {
        newActivities.push(
          createActivity(
            "Priority Changed",
            `Priority changed from ${originalTicket.priority} to ${priority}.`,
          ),
        );
      }

      if (
        originalTicket.assignedTo.trim() !==
        assignedTo.trim()
      ) {
        newActivities.push(
          createActivity(
            "Assignment Changed",
            `Assigned engineer changed from ${
              originalTicket.assignedTo || "Unassigned"
            } to ${assignedTo.trim()}.`,
          ),
        );
      }

      if (
        originalTicket.title.trim() !== title.trim()
      ) {
        newActivities.push(
          createActivity(
            "Title Updated",
            `Issue title changed from "${originalTicket.title}" to "${title.trim()}".`,
          ),
        );
      }

      if (
        (originalTicket.description || "").trim() !==
        description.trim()
      ) {
        newActivities.push(
          createActivity(
            "Description Updated",
            "The ticket description was updated.",
          ),
        );
      }

      if (newActivities.length > 0) {
        window.localStorage.setItem(
          "ticketActivities",
          JSON.stringify([
            ...savedActivities,
            ...newActivities,
          ]),
        );
      }

      logActivity(
        status === "Closed"
          ? "Closed Ticket"
          : "Updated Ticket",
        currentUserName,
        `${updatedTicket.id} - ${updatedTicket.title}`,
      );

      router.push(`/tickets/${ticketId}`);
    } catch (error) {
      console.error(
        "Ticket save error:",
        error,
      );

      setErrorMessage(
        "Unable to save the ticket. Please try again.",
      );

      setIsSaving(false);
    }
  }

  if (isLoading || !isAuthorized) {
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

  if (!originalTicket) {
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
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-yellow-500">
              IT Helpdesk
            </p>

            <h1 className="text-4xl font-bold md:text-5xl">
              Edit Ticket
            </h1>

            <p className="mt-4 text-gray-400">
              Update {originalTicket.id} and record all
              changes automatically.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900 p-6 md:p-8"
          >
            {errorMessage && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Issue Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                placeholder="Enter issue title"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as TicketStatus,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">
                    Assigned
                  </option>
                  <option value="In Progress">
                    In Progress
                  </option>
                  <option value="Waiting for User">
                    Waiting for User
                  </option>
                  <option value="Resolved">
                    Resolved
                  </option>
                  <option value="Closed">
                    Closed
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as TicketPriority,
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
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
            </div>
                <div>
              <label
                htmlFor="assignedTo"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Assigned Engineer
              </label>

              <input
                id="assignedTo"
                type="text"
                value={assignedTo}
                onChange={(event) =>
                  setAssignedTo(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                placeholder="Example: Shahad Alghamdi"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={7}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                placeholder="Describe the issue"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-4">
              <p className="text-sm font-semibold text-gray-300">
                Related Information
              </p>

              <div className="mt-4 grid gap-4 text-sm text-gray-400 md:grid-cols-2">
                <p>
                  Employee:{" "}
                  <span className="text-white">
                    {originalTicket.employeeName}
                  </span>
                </p>

                <p>
                  Asset:{" "}
                  <span className="text-white">
                    {originalTicket.assetId ||
                      "No asset"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <Link
                href={`/tickets/${ticketId}`}
                className="rounded-xl bg-zinc-800 px-6 py-3 font-semibold transition hover:bg-zinc-700"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}