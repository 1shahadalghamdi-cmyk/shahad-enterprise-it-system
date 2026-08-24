/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

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
  status?: string;
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
};

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

function createIncidentId(
  existingIncidents: HelpdeskIncident[],
) {
  const highestNumber = existingIncidents.reduce(
    (highest, incident) => {
      const number = Number(
        incident.id.replace("INC-", ""),
      );

      return Number.isNaN(number)
        ? highest
        : Math.max(highest, number);
    },
    1025,
  );

  return `INC-${highestNumber + 1}`;
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export default function NewIncidentPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

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

  const [assignedTo, setAssignedTo] =
    useState("IT Support");

  const [assetId, setAssetId] = useState("");
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

      setCurrentUser(parsedCurrentUser);

      const savedEmployees =
        window.localStorage.getItem("employees");

      const parsedEmployees = savedEmployees
        ? (JSON.parse(savedEmployees) as Employee[])
        : [];

      const activeEmployees =
        parsedEmployees.filter(
          (employee) =>
            employee.status !== "Inactive",
        );

      setEmployees(activeEmployees);

      const savedAssets =
        window.localStorage.getItem("assets");

      setAssets(
        savedAssets
          ? (JSON.parse(savedAssets) as Asset[])
          : [],
      );

      if (
        parsedCurrentUser.role === "Employee"
      ) {
        const matchedEmployee =
          activeEmployees.find(
            (employee) =>
              normalize(employee.email || "") ===
                normalize(
                  parsedCurrentUser.email,
                ) ||
              normalize(employee.name) ===
                normalize(parsedCurrentUser.name),
          );

        if (matchedEmployee) {
          setEmployeeId(matchedEmployee.id);
          setDepartment(
            matchedEmployee.department || "",
          );
        }
      }
    } catch {
      window.localStorage.removeItem(
        "currentUser",
      );
      router.replace("/login");
    }
  }, [router]);

  const priority = useMemo(
    () => calculatePriority(impact, urgency),
    [impact, urgency],
  );

  const slaHours = useMemo(
    () => getSlaHours(priority),
    [priority],
  );

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.id === employeeId,
      ),
    [employeeId, employees],
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
        selectedEmployee.department &&
        normalize(asset.department || "") ===
          normalize(
            selectedEmployee.department,
          );

      return (
        assignedMatches ||
        departmentMatches ||
        !asset.assignedTo
      );
    });
  }, [assets, selectedEmployee]);

  const selectedAsset = useMemo(
    () =>
      assets.find(
        (asset) => asset.id === assetId,
      ),
    [assetId, assets],
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
      (item) =>
        item.id === selectedEmployeeId,
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

    if (!currentUser) {
      setFormError(
        "Your login session could not be verified.",
      );
      return;
    }

    if (!selectedEmployee) {
      setFormError(
        "Please select an employee.",
      );
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

    const savedIncidents =
      window.localStorage.getItem(
        "helpdeskIncidents",
      );

    const existingIncidents = savedIncidents
      ? (JSON.parse(
          savedIncidents,
        ) as HelpdeskIncident[])
      : [];

    const createdAt = new Date();
    const slaDueAt = new Date(
      createdAt.getTime() +
        slaHours * 60 * 60 * 1000,
    );

    const newIncident: HelpdeskIncident = {
      id: createIncidentId(
        existingIncidents,
      ),
      title: title.trim(),
      description: description.trim(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeEmail:
        selectedEmployee.email || "",
      department:
        department.trim() ||
        selectedEmployee.department ||
        "Not Assigned",
      category,
      subcategory,
      impact,
      urgency,
      priority,
      status:
        assignedTo === "IT Support"
          ? "Open"
          : "Assigned",
      assignedTo,
      assetId: selectedAsset?.id || "",
      assetName: selectedAsset?.name || "",
      slaTargetHours: slaHours,
      slaDueAt: slaDueAt.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      createdBy: currentUser.name,
      createdByEmail: currentUser.email,
    };

    window.localStorage.setItem(
      "helpdeskIncidents",
      JSON.stringify([
        newIncident,
        ...existingIncidents,
      ]),
    );

    logActivity(
      "Created Helpdesk Incident",
      currentUser.name,
      `${newIncident.id} - ${newIncident.title}`,
    );

    createNotification({
      title: "New Helpdesk Incident",
      message: `${newIncident.employeeName} created ${newIncident.id}: ${newIncident.title}`,
      href: `/helpdesk/incidents/${newIncident.id}`,
      recipientRoles: [
        "IT Admin",
        "IT Support",
      ],
    });

    router.push("/helpdesk/incidents");
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

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              ITIL Incident Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Create New Incident
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Record a technical disruption, calculate
              priority from impact and urgency, and apply
              the correct SLA target automatically.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
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
                    placeholder="Example: VPN connection keeps disconnecting"
                    required
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
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
                    placeholder="Describe the issue, error messages, business impact, and troubleshooting already attempted."
                    required
                    rows={6}
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 leading-7 outline-none placeholder:text-gray-600 focus:border-blue-500"
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">
                Requester & Configuration Item
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
                    disabled={
                      currentUser.role ===
                      "Employee"
                    }
                    required
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-70 focus:border-blue-500"
                  >
                    <option value="">
                      Select employee
                    </option>

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
                    placeholder="Information Technology"
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none placeholder:text-gray-600 focus:border-blue-500"
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
                    disabled={
                      currentUser.role ===
                      "Employee"
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-70 focus:border-blue-500"
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
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
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
                  label="Initial Status"
                  value={
                    assignedTo === "IT Support"
                      ? "Open"
                      : "Assigned"
                  }
                  valueClassName="text-purple-400"
                />
              </div>
            </div>

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
                Create Incident
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/helpdesk/incidents",
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