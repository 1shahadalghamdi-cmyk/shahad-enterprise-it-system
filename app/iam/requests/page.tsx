"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "@/app/components/system/Sidebar";

import {
  defaultIamUsers,
  type IamUser,
} from "@/lib/data/iamUsers";

import {
  defaultIamGroups,
  type IamGroup,
} from "@/lib/data/iamGroups";

type UserRole =
  | "IT Admin"
  | "IT Support"
  | "Employee";

type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};

type AccessRequest = {
  id: string;
  user: string;
  email: string;
  requestType: string;
  resource: string;
  justification: string;
  requestedAt: string;
  status:
    | "Pending"
    | "Approved"
    | "Rejected";
  risk:
    | "Low"
    | "Medium"
    | "High";
};

const REQUESTS_STORAGE_KEY =
  "iamAccessRequests";

const USERS_STORAGE_KEY =
  "iamUsers";

const GROUPS_STORAGE_KEY =
  "iamGroups";

const initialRequests: AccessRequest[] = [
  {
    id: "REQ-001",
    user: "Ahmed AlHarbi",
    email:
      "ahmed.alharbi@enterprise.com",
    requestType:
      "Role Assignment",
    resource:
      "IT Support",
    justification:
      "Requires helpdesk permissions for new support responsibilities.",
    requestedAt:
      "Today, 09:20",
    status:
      "Pending",
    risk:
      "Medium",
  },
  {
    id: "REQ-002",
    user:
      "Noor Ali",
    email:
      "noor.ali@enterprise.com",
    requestType:
      "Group Membership",
    resource:
      "VPN Users",
    justification:
      "Remote access required for hybrid work.",
    requestedAt:
      "Today, 08:45",
    status:
      "Pending",
    risk:
      "Low",
  },
  {
    id: "REQ-003",
    user:
      "Mona AlOtaibi",
    email:
      "mona.alotaibi@enterprise.com",
    requestType:
      "Privileged Access",
    resource:
      "IT Administrators",
    justification:
      "Temporary elevated access for infrastructure maintenance.",
    requestedAt:
      "Yesterday, 15:10",
    status:
      "Pending",
    risk:
      "High",
  },
  {
    id: "REQ-004",
    user:
      "Sarah Hassan",
    email:
      "sarah.hassan@enterprise.com",
    requestType:
      "Application Access",
    resource:
      "Microsoft 365 Admin Center",
    justification:
      "HR onboarding administration support.",
    requestedAt:
      "Yesterday, 11:30",
    status:
      "Approved",
    risk:
      "Medium",
  },
];

function loadRequests():
  AccessRequest[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return initialRequests;
  }

  const savedRequests =
    window.localStorage.getItem(
      REQUESTS_STORAGE_KEY,
    );

  if (!savedRequests) {
    window.localStorage.setItem(
      REQUESTS_STORAGE_KEY,
      JSON.stringify(
        initialRequests,
      ),
    );

    return initialRequests;
  }

  try {
    const parsedRequests =
      JSON.parse(
        savedRequests,
      ) as AccessRequest[];

    return Array.isArray(
      parsedRequests,
    )
      ? parsedRequests
      : initialRequests;
  } catch {
    window.localStorage.setItem(
      REQUESTS_STORAGE_KEY,
      JSON.stringify(
        initialRequests,
      ),
    );

    return initialRequests;
  }
}

function saveRequests(
  requests: AccessRequest[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    REQUESTS_STORAGE_KEY,
    JSON.stringify(
      requests,
    ),
  );
}

function loadIamUsers():
  IamUser[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultIamUsers;
  }

  const savedUsers =
    window.localStorage.getItem(
      USERS_STORAGE_KEY,
    );

  if (!savedUsers) {
    window.localStorage.setItem(
      USERS_STORAGE_KEY,
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

    return Array.isArray(
      parsedUsers,
    )
      ? parsedUsers
      : defaultIamUsers;
  } catch {
    window.localStorage.setItem(
      USERS_STORAGE_KEY,
      JSON.stringify(
        defaultIamUsers,
      ),
    );

    return defaultIamUsers;
  }
}

function saveIamUsers(
  users: IamUser[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    USERS_STORAGE_KEY,
    JSON.stringify(users),
  );
}

function loadIamGroups():
  IamGroup[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultIamGroups;
  }

  const savedGroups =
    window.localStorage.getItem(
      GROUPS_STORAGE_KEY,
    );

  if (!savedGroups) {
    window.localStorage.setItem(
      GROUPS_STORAGE_KEY,
      JSON.stringify(
        defaultIamGroups,
      ),
    );

    return defaultIamGroups;
  }

  try {
    const parsedGroups =
      JSON.parse(
        savedGroups,
      ) as IamGroup[];

    if (
      !Array.isArray(
        parsedGroups,
      )
    ) {
      return defaultIamGroups;
    }

    const hasOldData =
      parsedGroups.some(
        (group) =>
          !Array.isArray(
            group.memberIds,
          ),
      );

    if (hasOldData) {
      window.localStorage.setItem(
        GROUPS_STORAGE_KEY,
        JSON.stringify(
          defaultIamGroups,
        ),
      );

      return defaultIamGroups;
    }

    return parsedGroups;
  } catch {
    window.localStorage.setItem(
      GROUPS_STORAGE_KEY,
      JSON.stringify(
        defaultIamGroups,
      ),
    );

    return defaultIamGroups;
  }
}

function saveIamGroups(
  groups: IamGroup[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    GROUPS_STORAGE_KEY,
    JSON.stringify(groups),
  );
}

function getRequestedUser(
  request: AccessRequest,
) {
  const users =
    loadIamUsers();

  return (
    users.find(
      (user) =>
        user.email.toLowerCase() ===
        request.email.toLowerCase(),
    ) || null
  );
}

function applyRoleAssignment(
  request: AccessRequest,
) {
  const users =
    loadIamUsers();

  const updatedUsers =
    users.map((user) => {
      const sameUser =
        user.email.toLowerCase() ===
        request.email.toLowerCase();

      if (!sameUser) {
        return user;
      }

      return {
        ...user,
        role:
          request.resource,
      };
    });

  saveIamUsers(
    updatedUsers,
  );
}

function applyGroupMembership(
  request: AccessRequest,
) {
  const requestedUser =
    getRequestedUser(
      request,
    );

  if (!requestedUser) {
    return;
  }

  const groups =
    loadIamGroups();

  const updatedGroups =
    groups.map((group) => {
      if (
        group.name !==
        request.resource
      ) {
        return group;
      }

      if (
        group.memberIds.includes(
          requestedUser.id,
        )
      ) {
        return group;
      }

      return {
        ...group,
        memberIds: [
          ...group.memberIds,
          requestedUser.id,
        ],
      };
    });

  saveIamGroups(
    updatedGroups,
  );
}

function applyPrivilegedAccess(
  request: AccessRequest,
) {
  applyGroupMembership(
    request,
  );
}

function applyApprovedRequest(
  request: AccessRequest,
) {
  if (
    request.requestType ===
    "Role Assignment"
  ) {
    applyRoleAssignment(
      request,
    );

    return;
  }

  if (
    request.requestType ===
    "Group Membership"
  ) {
    applyGroupMembership(
      request,
    );

    return;
  }

  if (
    request.requestType ===
    "Privileged Access"
  ) {
    applyPrivilegedAccess(
      request,
    );
  }
}

export default function AccessRequestsPage() {
  const [
    requests,
    setRequests,
  ] =
    useState<
      AccessRequest[]
    >([]);

  const [
    filter,
    setFilter,
  ] =
    useState<
      | "All"
      | AccessRequest["status"]
    >("All");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<CurrentUser | null>(
      null,
    );

  useEffect(() => {
    setRequests(
      loadRequests(),
    );

    const savedCurrentUser =
      window.localStorage.getItem(
        "currentUser",
      );

    if (savedCurrentUser) {
      try {
        const parsedUser =
          JSON.parse(
            savedCurrentUser,
          ) as CurrentUser;

        setCurrentUser(
          parsedUser,
        );
      } catch {
        setCurrentUser(null);
      }
    }

    setLoading(false);
  }, []);

  const isAdmin =
    currentUser?.role ===
    "IT Admin";

  const filteredRequests =
    useMemo(() => {
      if (
        filter === "All"
      ) {
        return requests;
      }

      return requests.filter(
        (request) =>
          request.status ===
          filter,
      );
    }, [
      filter,
      requests,
    ]);

  const pending =
    requests.filter(
      (request) =>
        request.status ===
        "Pending",
    ).length;

  const approved =
    requests.filter(
      (request) =>
        request.status ===
        "Approved",
    ).length;

  const rejected =
    requests.filter(
      (request) =>
        request.status ===
        "Rejected",
    ).length;

  const highRisk =
    requests.filter(
      (request) =>
        request.risk ===
        "High",
    ).length;

  function updateRequest(
    id: string,
    status:
      | "Approved"
      | "Rejected",
  ) {
    if (!isAdmin) {
      setMessage(
        "Only IT Admin can approve or reject access requests.",
      );

      return;
    }

    const selectedRequest =
      requests.find(
        (request) =>
          request.id === id,
      );

    if (!selectedRequest) {
      setMessage(
        "Access request could not be found.",
      );

      return;
    }

    if (
      selectedRequest.status !==
      "Pending"
    ) {
      setMessage(
        "This access request has already been reviewed.",
      );

      return;
    }

    if (
      status ===
      "Approved"
    ) {
      applyApprovedRequest(
        selectedRequest,
      );
    }

    const updatedRequests =
      requests.map(
        (request) =>
          request.id === id
            ? {
                ...request,
                status,
              }
            : request,
      );

    setRequests(
      updatedRequests,
    );

    saveRequests(
      updatedRequests,
    );

    if (
      status ===
      "Approved"
    ) {
      setMessage(
        `${selectedRequest.user}'s access request was approved and applied successfully.`,
      );

      return;
    }

    setMessage(
      `${selectedRequest.user}'s access request was rejected.`,
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <p className="text-gray-400">
          Loading access requests...
        </p>
      </main>
    );
  }

  const successMessage =
    message.includes(
      "approved",
    );

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              Identity Governance
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Access Requests
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Review enterprise access requests,
              privilege changes, group memberships,
              and approval decisions.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Pending Requests"
              value={pending}
              subtitle="Awaiting review"
              valueClass="text-yellow-400"
            />

            <KpiCard
              title="Approved"
              value={approved}
              subtitle="Access granted"
              valueClass="text-green-400"
            />

            <KpiCard
              title="Rejected"
              value={rejected}
              subtitle="Access denied"
              valueClass="text-red-400"
            />

            <KpiCard
              title="High Risk"
              value={highRisk}
              subtitle="Elevated review required"
              valueClass="text-orange-400"
            />
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  Approval Queue
                </h2>

                <p className="mt-2 text-gray-400">
                  {isAdmin
                    ? "Review and approve identity access requests."
                    : "View identity access requests and approval decisions."}
                </p>
              </div>

              <select
                value={filter}
                onChange={(event) => {
                  setFilter(
                    event.target
                      .value as
                      | "All"
                      | AccessRequest["status"],
                  );

                  setMessage("");
                }}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500 lg:max-w-xs"
              >
                <option value="All">
                  All Requests
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

            {message && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                  successMessage
                    ? "border-green-500/30 bg-green-500/10 text-green-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {message}
              </div>
            )}
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="divide-y divide-white/5">
              {filteredRequests.map(
                (request) => (
                  <article
                    key={
                      request.id
                    }
                    className="p-6 transition hover:bg-white/[0.03]"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {
                              request.user
                            }
                          </h3>

                          <RiskBadge
                            risk={
                              request.risk
                            }
                          />

                          <StatusBadge
                            status={
                              request.status
                            }
                          />
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            request.email
                          }
                        </p>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <InfoItem
                            label="Request Type"
                            value={
                              request.requestType
                            }
                          />

                          <InfoItem
                            label="Resource"
                            value={
                              request.resource
                            }
                          />
                        </div>

                        <div className="mt-5 rounded-xl border border-white/10 bg-zinc-950 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Business Justification
                          </p>

                          <p className="mt-2 leading-6 text-gray-300">
                            {
                              request.justification
                            }
                          </p>
                        </div>

                        <p className="mt-4 text-xs text-gray-600">
                          {request.id} • Requested{" "}
                          {
                            request.requestedAt
                          }
                        </p>
                      </div>

                      {isAdmin &&
                        request.status ===
                          "Pending" && (
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateRequest(
                                  request.id,
                                  "Approved",
                                )
                              }
                              className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 font-semibold text-green-400 transition hover:bg-green-500/20"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateRequest(
                                  request.id,
                                  "Rejected",
                                )
                              }
                              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                    </div>
                  </article>
                ),
              )}

              {filteredRequests.length ===
                0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  No access requests found.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  valueClass,
}: {
  title: string;
  value: number;
  subtitle: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}

function InfoItem({
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

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function RiskBadge({
  risk,
}: {
  risk:
    AccessRequest["risk"];
}) {
  const classes =
    risk === "High"
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : risk === "Medium"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        : "border-green-500/30 bg-green-500/10 text-green-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {risk} Risk
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status:
    AccessRequest["status"];
}) {
  const classes =
    status === "Approved"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : status === "Rejected"
        ? "border-red-500/30 bg-red-500/10 text-red-400"
        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}
