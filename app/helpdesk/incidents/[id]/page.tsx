/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import Sidebar from "@/app/components/system/Sidebar";
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

type IncidentImpact =
  | "Low"
  | "Medium"
  | "High";

type IncidentUrgency =
  | "Low"
  | "Medium"
  | "High";

type IncidentPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

type IncidentStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting for User"
  | "Resolved"
  | "Closed";

type IncidentComment = {
  id: string;
  author: string;
  authorRole: UserRole;
  message: string;
  createdAt: string;
};

type IncidentActivity = {
  id: string;
  type: string;
  description: string;
  changedBy: string;
  createdAt: string;
};

type HelpdeskIncident = {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  category: string;
  subcategory: string;
  impact: IncidentImpact;
  urgency: IncidentUrgency;
  priority: IncidentPriority;
  status: IncidentStatus;
  assignedTo: string;
  assetId: string;
  assetName: string;
  slaTargetHours: number;
  slaDueAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByEmail: string;
  comments?: IncidentComment[];
  activity?: IncidentActivity[];
};

const STORAGE_KEY = "helpdeskIncidents";

const technicians = [
  "IT Support",
  "Sarah Hassan",
  "Mohammed Saleh",
  "Ali Nasser",
  "Yousef Omar",
];

const fallbackIncidents: HelpdeskIncident[] = [
  {
    id: "INC-1025",
    title: "Core switch is unreachable",
    description:
      "The core network switch in the server room is unreachable from the monitoring console. Multiple users are unable to access internal systems. Power and uplink cabling require immediate inspection.",
    employeeId: "EMP-016",
    employeeName: "Ahmed AlHarbi",
    employeeEmail: "ahmed.alharbi@enterprise.com",
    department: "Information Technology",
    category: "Network",
    subcategory: "Switch",
    impact: "High",
    urgency: "High",
    priority: "Critical",
    status: "Open",
    assignedTo: "Sarah Hassan",
    assetId: "AST-1785583074595",
    assetName: "Cisco Catalyst 2960-X",
    slaTargetHours: 4,
    slaDueAt: new Date(
      Date.now() + 45 * 60 * 1000,
    ).toISOString(),
    createdAt: "2026-08-03T12:40:00.000Z",
    updatedAt: "2026-08-03T12:40:00.000Z",
    createdBy: "Ahmed AlHarbi",
    createdByEmail:
      "ahmed.alharbi@enterprise.com",
    comments: [
      {
        id: "COM-1025-1",
        author: "Sarah Hassan",
        authorRole: "IT Support",
        message:
          "Incident acknowledged. I am checking switch power, uplink status, and console access.",
        createdAt:
          "2026-08-03T12:55:00.000Z",
      },
    ],
    activity: [
      {
        id: "ACT-1025-1",
        type: "Incident Created",
        description:
          "Incident opened and assigned to Sarah Hassan.",
        changedBy: "Ahmed AlHarbi",
        createdAt:
          "2026-08-03T12:40:00.000Z",
      },
      {
        id: "ACT-1025-2",
        type: "Technician Acknowledged",
        description:
          "Sarah Hassan acknowledged the incident and started investigation.",
        changedBy: "Sarah Hassan",
        createdAt:
          "2026-08-03T12:55:00.000Z",
      },
    ],
  },
  {
    id: "INC-1024",
    title: "VPN connection keeps disconnecting",
    description:
      "The employee loses VPN connectivity every few minutes while accessing internal applications. The internet connection is stable and the issue continues after reconnecting.",
    employeeId: "EMP-011",
    employeeName: "Noor Ali",
    employeeEmail: "noor.ali@enterprise.com",
    department: "Finance",
    category: "Access",
    subcategory: "VPN",
    impact: "Medium",
    urgency: "High",
    priority: "High",
    status: "In Progress",
    assignedTo: "Mohammed Saleh",
    assetId: "",
    assetName: "",
    slaTargetHours: 8,
    slaDueAt: new Date(
      Date.now() + 3.3 * 60 * 60 * 1000,
    ).toISOString(),
    createdAt: "2026-08-03T11:15:00.000Z",
    updatedAt: "2026-08-03T11:45:00.000Z",
    createdBy: "Noor Ali",
    createdByEmail: "noor.ali@enterprise.com",
    comments: [],
    activity: [],
  },
  {
    id: "INC-1023",
    title: "Cisco phone handset has no audio",
    description:
      "The Cisco IP Phone handset has no audio during calls, while speakerphone mode works normally. The phone was restarted but the issue remains.",
    employeeId: "EMP-016",
    employeeName: "Ahmed AlHarbi",
    employeeEmail:
      "ahmed.alharbi@enterprise.com",
    department: "Information Technology",
    category: "Hardware",
    subcategory: "IP Phone",
    impact: "Medium",
    urgency: "Medium",
    priority: "Medium",
    status: "Assigned",
    assignedTo: "Ali Nasser",
    assetId: "AST-1785582727673",
    assetName: "Cisco IP Phone 8841",
    slaTargetHours: 24,
    slaDueAt: new Date(
      Date.now() + 8 * 60 * 60 * 1000,
    ).toISOString(),
    createdAt: "2026-08-03T10:05:00.000Z",
    updatedAt: "2026-08-03T10:05:00.000Z",
    createdBy: "Ahmed AlHarbi",
    createdByEmail:
      "ahmed.alharbi@enterprise.com",
    comments: [],
    activity: [],
  },
  {
    id: "INC-1022",
    title: "Microsoft 365 account is locked",
    description:
      "The employee cannot sign in to Microsoft 365. The sign-in page reports that the account is locked. Password reset was attempted but access is still unavailable.",
    employeeId: "EMP-007",
    employeeName: "Reem Abdullah",
    employeeEmail:
      "reem.abdullah@enterprise.com",
    department: "Human Resources",
    category: "Microsoft 365",
    subcategory: "Account Locked",
    impact: "Medium",
    urgency: "High",
    priority: "High",
    status: "Waiting for User",
    assignedTo: "Yousef Omar",
    assetId: "",
    assetName: "",
    slaTargetHours: 8,
    slaDueAt: "2026-08-03T11:00:00.000Z",
    createdAt: "2026-08-03T08:20:00.000Z",
    updatedAt: "2026-08-03T09:00:00.000Z",
    createdBy: "Reem Abdullah",
    createdByEmail:
      "reem.abdullah@enterprise.com",
    comments: [],
    activity: [],
  },
  {
    id: "INC-1021",
    title:
      "Printer is not available on the network",
    description:
      "The department printer is offline and does not appear in the employee's printer list. The printer was restarted and network connectivity was restored.",
    employeeId: "EMP-005",
    employeeName: "Fahad AlQahtani",
    employeeEmail:
      "fahad.alqahtani@enterprise.com",
    department: "Administration",
    category: "Hardware",
    subcategory: "Printer",
    impact: "Low",
    urgency: "Low",
    priority: "Low",
    status: "Resolved",
    assignedTo: "Sarah Hassan",
    assetId: "",
    assetName: "",
    slaTargetHours: 72,
    slaDueAt: "2026-08-05T13:30:00.000Z",
    createdAt: "2026-08-02T13:30:00.000Z",
    updatedAt: "2026-08-02T14:10:00.000Z",
    createdBy: "Fahad AlQahtani",
    createdByEmail:
      "fahad.alqahtani@enterprise.com",
    comments: [],
    activity: [],
  },
  {
    id: "INC-1020",
    title: "Laptop fails to boot into Windows",
    description:
      "The laptop stops at the startup screen and does not load Windows. Startup repair was completed and the device is now operating normally.",
    employeeId: "EMP-004",
    employeeName: "Mona AlOtaibi",
    employeeEmail:
      "mona.alotaibi@enterprise.com",
    department: "Operations",
    category: "Hardware",
    subcategory: "Laptop",
    impact: "Medium",
    urgency: "Medium",
    priority: "Medium",
    status: "Closed",
    assignedTo: "Mohammed Saleh",
    assetId: "",
    assetName: "",
    slaTargetHours: 24,
    slaDueAt: "2026-08-03T10:10:00.000Z",
    createdAt: "2026-08-02T10:10:00.000Z",
    updatedAt: "2026-08-02T12:00:00.000Z",
    createdBy: "Mona AlOtaibi",
    createdByEmail:
      "mona.alotaibi@enterprise.com",
    comments: [],
    activity: [],
  },
];

function loadIncidents() {
  const savedIncidents =
    window.localStorage.getItem(STORAGE_KEY);

  if (!savedIncidents) {
    return fallbackIncidents;
  }

  try {
    const parsedIncidents =
      JSON.parse(savedIncidents) as HelpdeskIncident[];

    return Array.isArray(parsedIncidents)
      ? parsedIncidents
      : fallbackIncidents;
  } catch {
    return fallbackIncidents;
  }
}

function saveIncidents(
  incidents: HelpdeskIncident[],
) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(incidents),
  );
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatSla(
  slaDueAt: string,
  status: IncidentStatus,
) {
  if (
    status === "Resolved" ||
    status === "Closed"
  ) {
    return {
      label: "SLA completed",
      className: "text-green-400",
    };
  }

  const dueDate = new Date(slaDueAt);
  const remainingMilliseconds =
    dueDate.getTime() - Date.now();

  if (
    Number.isNaN(dueDate.getTime()) ||
    remainingMilliseconds <= 0
  ) {
    return {
      label: "SLA breached",
      className: "text-red-400",
    };
  }

  const totalMinutes = Math.ceil(
    remainingMilliseconds / 60000,
  );

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes = totalMinutes % 60;

  return {
    label:
      hours > 0
        ? `${hours}h ${minutes}m remaining`
        : `${minutes} min remaining`,
    className:
      totalMinutes <= 60
        ? "text-orange-300"
        : "text-blue-400",
  };
}

export default function IncidentDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const incidentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [incidents, setIncidents] =
    useState<HelpdeskIncident[]>([]);

  const [incident, setIncident] =
    useState<HelpdeskIncident | null>(null);

  const [status, setStatus] =
    useState<IncidentStatus>("Open");

  const [priority, setPriority] =
    useState<IncidentPriority>("Medium");

  const [assignedTo, setAssignedTo] =
    useState("IT Support");

  const [comment, setComment] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const savedCurrentUser =
      window.localStorage.getItem("currentUser");

    if (!savedCurrentUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedCurrentUser =
        JSON.parse(
          savedCurrentUser,
        ) as CurrentUser;

      setCurrentUser(parsedCurrentUser);

      const loadedIncidents =
        loadIncidents();

      setIncidents(loadedIncidents);

      const matchedIncident =
        loadedIncidents.find(
          (item) => item.id === incidentId,
        ) || null;

      if (matchedIncident) {
        setIncident(matchedIncident);
        setStatus(matchedIncident.status);
        setPriority(
          matchedIncident.priority,
        );
        setAssignedTo(
          matchedIncident.assignedTo,
        );
      }
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );
      router.replace("/login");
    }
  }, [incidentId, router]);

  const sla = useMemo(() => {
    if (!incident) {
      return {
        label: "Not available",
        className: "text-gray-400",
      };
    }

    return formatSla(
      incident.slaDueAt,
      incident.status,
    );
  }, [incident]);

  const activityItems = useMemo(() => {
    if (!incident) {
      return [];
    }

    const initialActivity:
      IncidentActivity[] = [
      {
        id: `${incident.id}-created`,
        type: "Incident Created",
        description: `${incident.id} was opened for ${incident.employeeName}.`,
        changedBy: incident.createdBy,
        createdAt: incident.createdAt,
      },
    ];

    return [
      ...initialActivity,
      ...(incident.activity || []),
    ].sort(
      (firstItem, secondItem) =>
        new Date(
          secondItem.createdAt,
        ).getTime() -
        new Date(
          firstItem.createdAt,
        ).getTime(),
    );
  }, [incident]);

  function updateIncident(
    updatedIncident: HelpdeskIncident,
  ) {
    const updatedIncidents =
      incidents.map((item) =>
        item.id === updatedIncident.id
          ? updatedIncident
          : item,
      );

    setIncident(updatedIncident);
    setIncidents(updatedIncidents);
    saveIncidents(updatedIncidents);
  }

  function handleSaveChanges() {
    if (!incident || !currentUser) {
      return;
    }

    const changes: string[] = [];

    if (status !== incident.status) {
      changes.push(
        `Status changed from ${incident.status} to ${status}.`,
      );
    }

    if (priority !== incident.priority) {
      changes.push(
        `Priority changed from ${incident.priority} to ${priority}.`,
      );
    }

    if (
      assignedTo !== incident.assignedTo
    ) {
      changes.push(
        `Assignment changed from ${incident.assignedTo} to ${assignedTo}.`,
      );
    }

    if (changes.length === 0) {
      setMessage("No changes to save.");
      return;
    }

    const now = new Date().toISOString();

    const newActivity:
      IncidentActivity = {
      id: `ACT-${Date.now()}`,
      type: "Incident Updated",
      description: changes.join(" "),
      changedBy: currentUser.name,
      createdAt: now,
    };

    const updatedIncident: HelpdeskIncident = {
      ...incident,
      status,
      priority,
      assignedTo,
      updatedAt: now,
      activity: [
        ...(incident.activity || []),
        newActivity,
      ],
    };

    updateIncident(updatedIncident);

    logActivity(
      "Updated Helpdesk Incident",
      currentUser.name,
      `${incident.id} - ${changes.join(" ")}`,
    );

    createNotification({
      title: `Incident ${incident.id} Updated`,
      message: changes.join(" "),
      href: `/helpdesk/incidents/${incident.id}`,
      recipientRoles: ["Employee"],
      recipientEmails: [
        incident.employeeEmail,
      ],
    });

    setMessage("Changes saved successfully.");
  }

  function handleAddComment() {
    if (
      !incident ||
      !currentUser ||
      comment.trim().length < 3
    ) {
      setMessage(
        "Enter a comment before posting.",
      );
      return;
    }

    const now = new Date().toISOString();

    const newComment:
      IncidentComment = {
      id: `COM-${Date.now()}`,
      author: currentUser.name,
      authorRole: currentUser.role,
      message: comment.trim(),
      createdAt: now,
    };

    const newActivity:
      IncidentActivity = {
      id: `ACT-${Date.now() + 1}`,
      type: "Comment Added",
      description: `${currentUser.name} added a comment.`,
      changedBy: currentUser.name,
      createdAt: now,
    };

    const updatedIncident: HelpdeskIncident = {
      ...incident,
      updatedAt: now,
      comments: [
        ...(incident.comments || []),
        newComment,
      ],
      activity: [
        ...(incident.activity || []),
        newActivity,
      ],
    };

    updateIncident(updatedIncident);

    logActivity(
      "Added Incident Comment",
      currentUser.name,
      `${incident.id} - ${comment.trim()}`,
    );

    createNotification({
      title: `New Comment on ${incident.id}`,
      message: `${currentUser.name}: ${comment.trim()}`,
      href: `/helpdesk/incidents/${incident.id}`,
      recipientRoles:
        currentUser.role === "Employee"
          ? ["IT Admin", "IT Support"]
          : ["Employee"],
      recipientEmails:
        currentUser.role === "Employee"
          ? undefined
          : [incident.employeeEmail],
    });

    setComment("");
    setMessage("Comment posted successfully.");
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Checking access...
        </p>
      </main>
    );
  }

  if (!incident) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <p className="text-5xl">🔎</p>

            <h1 className="mt-5 text-3xl font-bold">
              Incident not found
            </h1>

            <p className="mt-3 text-gray-400">
              The requested incident does not exist
              in the current helpdesk records.
            </p>

            <Link
              href="/helpdesk/incidents"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Back to Incidents
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const canManageIncident =
    currentUser.role === "IT Admin" ||
    currentUser.role === "IT Support";

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/helpdesk/incidents"
              className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
            >
              ← Back to Incidents
            </Link>

            {canManageIncident && (
              <Link
                href={`/helpdesk/incidents/${incident.id}/edit`}
                className="rounded-xl border border-yellow-500/30 px-5 py-2.5 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500/10"
              >
                Edit Incident
              </Link>
            )}
          </div>

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                ITIL Incident Record
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                {incident.id}
              </h1>

              <p className="mt-3 text-xl text-gray-300">
                {incident.title}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatusBadge
                status={incident.status}
              />

              <PriorityBadge
                priority={incident.priority}
              />

              <span
                className={`inline-flex items-center rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm font-semibold ${sla.className}`}
              >
                ⏱ {sla.label}
              </span>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                <h2 className="text-xl font-semibold">
                  Incident Description
                </h2>

                <p className="mt-5 whitespace-pre-wrap leading-8 text-gray-300">
                  {incident.description}
                </p>
              </section>

              <section className="grid gap-6 md:grid-cols-2">
                <InfoCard
                  title="Requester"
                  rows={[
                    [
                      "Employee",
                      incident.employeeName,
                    ],
                    [
                      "Employee ID",
                      incident.employeeId ||
                        "Not available",
                    ],
                    [
                      "Email",
                      incident.employeeEmail ||
                        "Not available",
                    ],
                    [
                      "Department",
                      incident.department ||
                        "Not assigned",
                    ],
                  ]}
                />

                <InfoCard
                  title="Related Asset / CI"
                  rows={[
                    [
                      "Asset ID",
                      incident.assetId ||
                        "No related asset",
                    ],
                    [
                      "Asset Name",
                      incident.assetName ||
                        "Not available",
                    ],
                    [
                      "Category",
                      incident.category,
                    ],
                    [
                      "Subcategory",
                      incident.subcategory,
                    ],
                  ]}
                />
              </section>

              <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                    Ticket Activity
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Activity Timeline
                  </h2>
                </div>

                <div className="mt-6 space-y-4">
                  {activityItems.map(
                    (activityItem) => (
                      <div
                        key={activityItem.id}
                        className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-blue-400">
                              {
                                activityItem.type
                              }
                            </p>

                            <p className="mt-2 leading-6 text-gray-300">
                              {
                                activityItem.description
                              }
                            </p>

                            <p className="mt-3 text-xs text-gray-600">
                              Changed by{" "}
                              {
                                activityItem.changedBy
                              }
                            </p>
                          </div>

                          <p className="text-xs text-gray-500">
                            {formatDate(
                              activityItem.createdAt,
                            )}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
                    Communication
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Comments
                  </h2>
                </div>

                <div className="mt-6 space-y-4">
                  {(incident.comments || []).map(
                    (incidentComment) => (
                      <div
                        key={incidentComment.id}
                        className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {
                                incidentComment.author
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-600">
                              {
                                incidentComment.authorRole
                              }
                            </p>
                          </div>

                          <p className="text-xs text-gray-500">
                            {formatDate(
                              incidentComment.createdAt,
                            )}
                          </p>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap leading-7 text-gray-300">
                          {
                            incidentComment.message
                          }
                        </p>
                      </div>
                    ),
                  )}

                  {(incident.comments || [])
                    .length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/10 px-6 py-10 text-center">
                      <p className="text-gray-400">
                        No comments have been added
                        yet.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 p-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-300">
                      Add Comment
                    </span>

                    <textarea
                      value={comment}
                      onChange={(event) => {
                        setComment(
                          event.target.value,
                        );
                        setMessage("");
                      }}
                      rows={5}
                      placeholder="Add troubleshooting notes, updates, or communication related to this incident."
                      className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 leading-7 outline-none placeholder:text-gray-600 focus:border-blue-500"
                    />
                  </label>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddComment}
                      className="rounded-xl bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-500"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                <h2 className="text-xl font-semibold">
                  Incident Information
                </h2>

                <div className="mt-6 space-y-4">
                  <DetailRow
                    label="Created"
                    value={formatDate(
                      incident.createdAt,
                    )}
                  />

                  <DetailRow
                    label="Last Updated"
                    value={formatDate(
                      incident.updatedAt,
                    )}
                  />

                  <DetailRow
                    label="Impact"
                    value={incident.impact}
                  />

                  <DetailRow
                    label="Urgency"
                    value={incident.urgency}
                  />

                  <DetailRow
                    label="SLA Target"
                    value={`${incident.slaTargetHours} hours`}
                  />

                  <DetailRow
                    label="SLA Due"
                    value={formatDate(
                      incident.slaDueAt,
                    )}
                  />
                </div>
              </section>

              {canManageIncident && (
                <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
                  <h2 className="text-xl font-semibold">
                    Manage Incident
                  </h2>

                  <div className="mt-6 space-y-5">
                    <Field label="Status">
                      <select
                        value={status}
                        onChange={(event) => {
                          setStatus(
                            event.target
                              .value as IncidentStatus,
                          );
                          setMessage("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                      >
                        <option value="Open">
                          Open
                        </option>
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
                    </Field>

                    <Field label="Priority">
                      <select
                        value={priority}
                        onChange={(event) => {
                          setPriority(
                            event.target
                              .value as IncidentPriority,
                          );
                          setMessage("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                      >
                        <option value="Critical">
                          Critical
                        </option>
                        <option value="High">
                          High
                        </option>
                        <option value="Medium">
                          Medium
                        </option>
                        <option value="Low">
                          Low
                        </option>
                      </select>
                    </Field>

                    <Field label="Assigned Technician">
                      <select
                        value={assignedTo}
                        onChange={(event) => {
                          setAssignedTo(
                            event.target.value,
                          );
                          setMessage("");
                        }}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                      >
                        {technicians.map(
                          (technician) => (
                            <option
                              key={technician}
                              value={technician}
                            >
                              {technician}
                            </option>
                          ),
                        )}
                      </select>
                    </Field>

                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </section>
              )}

              {message && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                  {message}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <div className="mt-6 space-y-4">
        {rows.map(([label, value]) => (
          <DetailRow
            key={label}
            label={label}
            value={value}
          />
        ))}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-gray-200">
        {value}
      </span>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: IncidentPriority;
}) {
  const classes: Record<
    IncidentPriority,
    string
  > = {
    Critical:
      "border-red-500/30 bg-red-500/10 text-red-400",
    High: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Medium:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    Low: "border-green-500/30 bg-green-500/10 text-green-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${classes[priority]}`}
    >
      {priority} Priority
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: IncidentStatus;
}) {
  const classes: Record<
    IncidentStatus,
    string
  > = {
    Open:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Assigned:
      "border-purple-500/30 bg-purple-500/10 text-purple-400",
    "In Progress":
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    "Waiting for User":
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    Resolved:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Closed:
      "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}
