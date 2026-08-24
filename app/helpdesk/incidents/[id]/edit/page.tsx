/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  FormEvent,
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

type Employee = {
  id: string;
  name: string;
  email?: string;
  department?: string;
  status?: string;
};

type Asset = {
  id: string;
  name: string;
  assignedTo?: string;
  department?: string;
};

const STORAGE_KEY = "helpdeskIncidents";

const categories: Record<string, string[]> = {
  Hardware: [
    "Laptop",
    "Desktop",
    "Monitor",
    "Printer",
    "IP Phone",
    "Peripheral",
  ],
  Software: [
    "Application Error",
    "Installation",
    "License",
    "Operating System",
  ],
  Network: [
    "Internet",
    "Wi-Fi",
    "LAN",
    "VPN",
    "Switch",
    "Router",
  ],
  Access: [
    "Password Reset",
    "Account Locked",
    "Permission Request",
    "MFA",
  ],
  "Microsoft 365": [
    "Outlook",
    "Teams",
    "OneDrive",
    "SharePoint",
    "License",
  ],
  Security: [
    "Phishing",
    "Malware",
    "Suspicious Activity",
    "Lost Device",
  ],
};

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
    employeeEmail:
      "ahmed.alharbi@enterprise.com",
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
    updatedAt: "2026-08-03T12:55:00.000Z",
    createdBy: "Ahmed AlHarbi",
    createdByEmail:
      "ahmed.alharbi@enterprise.com",
    comments: [],
    activity: [],
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
    createdByEmail:
      "noor.ali@enterprise.com",
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
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function calculatePriority(
  impact: IncidentImpact,
  urgency: IncidentUrgency,
): IncidentPriority {
  if (impact === "High" && urgency === "High") {
    return "Critical";
  }

  if (
    impact === "High" ||
    urgency === "High"
  ) {
    return "High";
  }

  if (
    impact === "Medium" ||
    urgency === "Medium"
  ) {
    return "Medium";
  }

  return "Low";
}

function getSlaHours(
  priority: IncidentPriority,
) {
  const slaHours: Record<
    IncidentPriority,
    number
  > = {
    Critical: 4,
    High: 8,
    Medium: 24,
    Low: 72,
  };

  return slaHours[priority];
}

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

export default function EditIncidentPage() {
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

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [assets, setAssets] =
    useState<Asset[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [employeeId, setEmployeeId] =
    useState("");
  const [department, setDepartment] =
    useState("");
  const [category, setCategory] =
    useState("Hardware");
  const [subcategory, setSubcategory] =
    useState("Laptop");
  const [impact, setImpact] =
    useState<IncidentImpact>("Medium");
  const [urgency, setUrgency] =
    useState<IncidentUrgency>("Medium");
  const [status, setStatus] =
    useState<IncidentStatus>("Open");
  const [assignedTo, setAssignedTo] =
    useState("IT Support");
  const [assetId, setAssetId] =
    useState("");
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
      const parsedCurrentUser =
        JSON.parse(
          savedCurrentUser,
        ) as CurrentUser;

      if (
        parsedCurrentUser.role === "Employee"
      ) {
        router.replace(
          `/helpdesk/incidents/${incidentId}`,
        );
        return;
      }

      setCurrentUser(parsedCurrentUser);

      const loadedIncidents =
        loadIncidents();

      setIncidents(loadedIncidents);

      const matchedIncident =
        loadedIncidents.find(
          (item) => item.id === incidentId,
        ) || null;

      setIncident(matchedIncident);

      if (matchedIncident) {
        setTitle(matchedIncident.title);
        setDescription(
          matchedIncident.description,
        );
        setEmployeeId(
          matchedIncident.employeeId,
        );
        setDepartment(
          matchedIncident.department,
        );
        setCategory(
          matchedIncident.category,
        );
        setSubcategory(
          matchedIncident.subcategory,
        );
        setImpact(matchedIncident.impact);
        setUrgency(matchedIncident.urgency);
        setStatus(matchedIncident.status);
        setAssignedTo(
          matchedIncident.assignedTo,
        );
        setAssetId(matchedIncident.assetId);
      }

      const savedEmployees =
        window.localStorage.getItem(
          "employees",
        );

      setEmployees(
        savedEmployees
          ? (JSON.parse(
              savedEmployees,
            ) as Employee[])
          : [],
      );

      const savedAssets =
        window.localStorage.getItem("assets");

      setAssets(
        savedAssets
          ? (JSON.parse(savedAssets) as Asset[])
          : [],
      );
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );
      router.replace("/login");
    }
  }, [incidentId, router]);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.id === employeeId,
      ),
    [employeeId, employees],
  );

  const selectedAsset = useMemo(
    () =>
      assets.find(
        (asset) => asset.id === assetId,
      ),
    [assetId, assets],
  );

  const availableAssets = useMemo(() => {
    if (!selectedEmployee) {
      return assets;
    }

    return assets.filter((asset) => {
      const assignedMatches =
        normalize(asset.assignedTo || "") ===
        normalize(selectedEmployee.name);

      const departmentMatches =
        normalize(asset.department || "") ===
        normalize(
          selectedEmployee.department || "",
        );

      return (
        assignedMatches ||
        departmentMatches ||
        !asset.assignedTo
      );
    });
  }, [assets, selectedEmployee]);

  const priority = useMemo(
    () => calculatePriority(impact, urgency),
    [impact, urgency],
  );

  const slaHours = useMemo(
    () => getSlaHours(priority),
    [priority],
  );

  const subcategories =
    categories[category] || [];

  function handleEmployeeChange(
    selectedEmployeeId: string,
  ) {
    setEmployeeId(selectedEmployeeId);
    setAssetId("");
    setFormError("");

    const employee = employees.find(
      (item) => item.id === selectedEmployeeId,
    );

    setDepartment(
      employee?.department || "",
    );
  }

  function handleCategoryChange(
    selectedCategory: string,
  ) {
    setCategory(selectedCategory);

    const firstSubcategory =
      categories[selectedCategory]?.[0] || "";

    setSubcategory(firstSubcategory);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");

    if (!incident || !currentUser) {
      return;
    }

    if (
      title.trim().length < 5 ||
      description.trim().length < 15
    ) {
      setFormError(
        "Enter a clear title and a description of at least 15 characters.",
      );
      return;
    }

    const employee =
      selectedEmployee || {
        id: incident.employeeId,
        name: incident.employeeName,
        email: incident.employeeEmail,
        department: incident.department,
      };

    const now = new Date().toISOString();

    const slaChanged =
      priority !== incident.priority;

    const slaDueAt = slaChanged
      ? new Date(
          Date.now() +
            slaHours * 60 * 60 * 1000,
        ).toISOString()
      : incident.slaDueAt;

    const changeDescriptions: string[] = [];

    if (title.trim() !== incident.title) {
      changeDescriptions.push("title");
    }

    if (
      description.trim() !==
      incident.description
    ) {
      changeDescriptions.push("description");
    }

    if (status !== incident.status) {
      changeDescriptions.push(
        `status (${incident.status} → ${status})`,
      );
    }

    if (
      assignedTo !== incident.assignedTo
    ) {
      changeDescriptions.push(
        `assignment (${incident.assignedTo} → ${assignedTo})`,
      );
    }

    if (priority !== incident.priority) {
      changeDescriptions.push(
        `priority (${incident.priority} → ${priority})`,
      );
    }

    const updatedIncident: HelpdeskIncident = {
      ...incident,
      title: title.trim(),
      description: description.trim(),
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email || "",
      department:
        department.trim() ||
        employee.department ||
        "Not Assigned",
      category,
      subcategory,
      impact,
      urgency,
      priority,
      status,
      assignedTo,
      assetId: selectedAsset?.id || "",
      assetName: selectedAsset?.name || "",
      slaTargetHours: slaHours,
      slaDueAt,
      updatedAt: now,
      activity: [
        ...(incident.activity || []),
        {
          id: `ACT-${Date.now()}`,
          type: "Incident Edited",
          description:
            changeDescriptions.length > 0
              ? `Updated ${changeDescriptions.join(", ")}.`
              : "Incident information was reviewed and saved.",
          changedBy: currentUser.name,
          createdAt: now,
        },
      ],
    };

    const updatedIncidents =
      incidents.map((item) =>
        item.id === updatedIncident.id
          ? updatedIncident
          : item,
      );

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedIncidents),
    );

    logActivity(
      "Edited Helpdesk Incident",
      currentUser.name,
      `${updatedIncident.id} - ${updatedIncident.title}`,
    );

    createNotification({
      title: `${updatedIncident.id} Updated`,
      message: `${currentUser.name} updated ${updatedIncident.title}`,
      href: `/helpdesk/incidents/${updatedIncident.id}`,
      recipientRoles: ["Employee"],
      recipientEmails: [
        updatedIncident.employeeEmail,
      ],
    });

    router.push(
      `/helpdesk/incidents/${updatedIncident.id}`,
    );
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
            <p className="text-5xl">
              🔎
            </p>

            <h1 className="mt-5 text-3xl font-bold">
              Incident not found
            </h1>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/helpdesk/incidents",
                )
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Back to Incidents
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
              ITIL Incident Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Edit {incident.id}
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Update classification, requester,
              assignment, status, asset relationship,
              and incident details.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Incident Details
              </h2>

              <div className="mt-6 space-y-5">
                <Field label="Incident Title">
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setFormError("");
                    }}
                    required
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={description}
                    onChange={(event) => {
                      setDescription(
                        event.target.value,
                      );
                      setFormError("");
                    }}
                    required
                    rows={6}
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 leading-7 outline-none focus:border-blue-500"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Requester & Assignment
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Employee">
                  <select
                    value={employeeId}
                    onChange={(event) =>
                      handleEmployeeChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {employees.length === 0 && (
                      <option value={incident.employeeId}>
                        {incident.employeeName}
                      </option>
                    )}

                    {employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                        {employee.department
                          ? ` — ${employee.department}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Department">
                  <input
                    type="text"
                    value={department}
                    onChange={(event) =>
                      setDepartment(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </Field>

                <Field label="Related Asset / CI">
                  <select
                    value={assetId}
                    onChange={(event) =>
                      setAssetId(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">
                      No related asset
                    </option>

                    {incident.assetId &&
                      !assets.some(
                        (asset) =>
                          asset.id ===
                          incident.assetId,
                      ) && (
                        <option
                          value={incident.assetId}
                        >
                          {incident.assetName} —{" "}
                          {incident.assetId}
                        </option>
                      )}

                    {availableAssets.map((asset) => (
                      <option
                        key={asset.id}
                        value={asset.id}
                      >
                        {asset.name} — {asset.id}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Assigned Technician">
                  <select
                    value={assignedTo}
                    onChange={(event) =>
                      setAssignedTo(
                        event.target.value,
                      )
                    }
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

                <Field label="Status">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as IncidentStatus,
                      )
                    }
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
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Classification & SLA
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Category">
                  <select
                    value={category}
                    onChange={(event) =>
                      handleCategoryChange(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {Object.keys(categories).map(
                      (categoryName) => (
                        <option
                          key={categoryName}
                          value={categoryName}
                        >
                          {categoryName}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field label="Subcategory">
                  <select
                    value={subcategory}
                    onChange={(event) =>
                      setSubcategory(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    {subcategories.map(
                      (subcategoryName) => (
                        <option
                          key={subcategoryName}
                          value={subcategoryName}
                        >
                          {subcategoryName}
                        </option>
                      ),
                    )}
                  </select>
                </Field>

                <Field label="Impact">
                  <select
                    value={impact}
                    onChange={(event) =>
                      setImpact(
                        event.target
                          .value as IncidentImpact,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="Low">
                      Low — One user
                    </option>
                    <option value="Medium">
                      Medium — Team or department
                    </option>
                    <option value="High">
                      High — Multiple departments
                    </option>
                  </select>
                </Field>

                <Field label="Urgency">
                  <select
                    value={urgency}
                    onChange={(event) =>
                      setUrgency(
                        event.target
                          .value as IncidentUrgency,
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="Low">
                      Low — Can wait
                    </option>
                    <option value="Medium">
                      Medium — Work affected
                    </option>
                    <option value="High">
                      High — Work stopped
                    </option>
                  </select>
                </Field>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <SummaryCard
                  label="Calculated Priority"
                  value={priority}
                  valueClassName={
                    priority === "Critical"
                      ? "text-red-400"
                      : priority === "High"
                        ? "text-orange-300"
                        : priority === "Medium"
                          ? "text-yellow-300"
                          : "text-green-400"
                  }
                />

                <SummaryCard
                  label="Resolution SLA"
                  value={`${slaHours} hours`}
                  valueClassName="text-blue-400"
                />

                <SummaryCard
                  label="Current Status"
                  value={status}
                  valueClassName="text-purple-400"
                />
              </div>
            </section>

            {formError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {formError}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/helpdesk/incidents/${incident.id}`,
                  )
                }
                className="rounded-xl border border-white/10 bg-zinc-900 px-7 py-3 font-semibold transition hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </form>
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

function SummaryCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p
        className={`mt-3 text-xl font-bold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}
