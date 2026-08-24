"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

type Priority =
  | "Critical"
  | "High"
  | "Medium";

type TestStatus =
  | "Passed"
  | "Failed";

type Scenario = {
  scenario: string;
  action: string;
  target: string;
};

type DRTestHistoryItem = {
  id: string;
  scenario: string;
  targetRto: string;
  actualRecovery: string;
  testedBy: string;
  completedAt: string;
  status: TestStatus;
};

const recoveryOrder = [
  {
    order: 1,
    service: "Active Directory & DNS",
    owner: "Infrastructure Team",
    rto: "2 hours",
    priority: "Critical" as Priority,
  },
  {
    order: 2,
    service: "Core Network & Firewall",
    owner: "Network Team",
    rto: "2 hours",
    priority: "Critical" as Priority,
  },
  {
    order: 3,
    service: "DHCP Services",
    owner: "Infrastructure Team",
    rto: "3 hours",
    priority: "High" as Priority,
  },
  {
    order: 4,
    service: "File Services",
    owner: "IT Operations",
    rto: "4 hours",
    priority: "High" as Priority,
  },
  {
    order: 5,
    service: "Microsoft 365 Services",
    owner: "Cloud Admin",
    rto: "4 hours",
    priority: "High" as Priority,
  },
  {
    order: 6,
    service: "Non-Critical Endpoints",
    owner: "IT Support",
    rto: "24 hours",
    priority: "Medium" as Priority,
  },
];

const scenarios: Scenario[] = [
  {
    scenario: "Domain Controller Failure",
    action:
      "Promote DC02 services, validate DNS, restore DC01 system state.",
    target: "≤ 2 hours",
  },
  {
    scenario: "File Server Failure",
    action:
      "Provision replacement server and restore latest FILE01 recovery point.",
    target: "≤ 4 hours",
  },
  {
    scenario: "Site / Repository Failure",
    action:
      "Activate offsite backup copy and restore critical services by priority.",
    target: "≤ 8 hours",
  },
  {
    scenario: "Network Core Failure",
    action:
      "Restore saved firewall and core switch configuration to replacement hardware.",
    target: "≤ 2 hours",
  },
];

const contacts = [
  {
    role: "DR Coordinator",
    team: "IT Management",
    responsibility:
      "Declare disaster and coordinate recovery.",
  },
  {
    role: "Infrastructure Lead",
    team: "Infrastructure",
    responsibility:
      "Recover AD, DNS, DHCP, and Windows Server.",
  },
  {
    role: "Network Lead",
    team: "Network",
    responsibility:
      "Restore switching, routing, firewall, and connectivity.",
  },
  {
    role: "IT Support Lead",
    team: "Service Desk",
    responsibility:
      "Validate user access and business service recovery.",
  },
];

const initialTestHistory: DRTestHistoryItem[] = [
  {
    id: "DRT-001",
    scenario: "Domain Controller Failure",
    targetRto: "≤ 2 hours",
    actualRecovery: "1 hr 34 min",
    testedBy: "IT Admin",
    completedAt: "May 15 • 09:30",
    status: "Passed",
  },
  {
    id: "DRT-002",
    scenario: "Network Core Failure",
    targetRto: "≤ 2 hours",
    actualRecovery: "1 hr 47 min",
    testedBy: "IT Admin",
    completedAt: "Feb 12 • 14:10",
    status: "Passed",
  },
];

const DR_TEST_STORAGE_KEY =
  "enterprise-dr-test-history";

export default function DisasterRecoveryPlanPage() {
  const [testHistory, setTestHistory] =
    useState<DRTestHistoryItem[]>(
      initialTestHistory
    );

  const [historyLoaded, setHistoryLoaded] =
    useState(false);

  const [
    selectedScenario,
    setSelectedScenario,
  ] = useState(
    scenarios[0].scenario
  );

  const [message, setMessage] =
    useState("");

  const [running, setRunning] =
    useState(false);

  useEffect(() => {
    try {
      const savedHistory =
        window.localStorage.getItem(
          DR_TEST_STORAGE_KEY
        );

      if (savedHistory) {
        const parsed =
          JSON.parse(
            savedHistory
          ) as DRTestHistoryItem[];

        if (Array.isArray(parsed)) {
          setTestHistory(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load DR test history:",
        error
      );

      setTestHistory(
        initialTestHistory
      );
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!historyLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        DR_TEST_STORAGE_KEY,
        JSON.stringify(
          testHistory
        )
      );
    } catch (error) {
      console.error(
        "Failed to save DR test history:",
        error
      );
    }
  }, [
    testHistory,
    historyLoaded,
  ]);

  const currentScenario =
    useMemo(
      () =>
        scenarios.find(
          (item) =>
            item.scenario ===
            selectedScenario
        ) ?? scenarios[0],
      [selectedScenario]
    );

  const passedTests =
    testHistory.filter(
      (item) =>
        item.status === "Passed"
    ).length;

  function getNextTestId() {
    const highest =
      testHistory.reduce(
        (currentHighest, item) => {
          const number =
            Number(
              item.id.replace(
                "DRT-",
                ""
              )
            );

          if (
            Number.isNaN(number)
          ) {
            return currentHighest;
          }

          return Math.max(
            currentHighest,
            number
          );
        },
        0
      );

    return `DRT-${String(
      highest + 1
    ).padStart(3, "0")}`;
  }

  function getSimulatedRecoveryTime(
    scenarioName: string
  ) {
    if (
      scenarioName ===
      "Domain Controller Failure"
    ) {
      return "1 hr 26 min";
    }

    if (
      scenarioName ===
      "File Server Failure"
    ) {
      return "3 hr 12 min";
    }

    if (
      scenarioName ===
      "Site / Repository Failure"
    ) {
      return "6 hr 38 min";
    }

    return "1 hr 41 min";
  }

  function runDRTest(
    event: FormEvent
  ) {
    event.preventDefault();

    setRunning(true);
    setMessage("");

    const recoveryTime =
      getSimulatedRecoveryTime(
        currentScenario.scenario
      );

    const newTest: DRTestHistoryItem =
      {
        id: getNextTestId(),
        scenario:
          currentScenario.scenario,
        targetRto:
          currentScenario.target,
        actualRecovery:
          recoveryTime,
        testedBy: "IT Admin",
        completedAt: "Just now",
        status: "Passed",
      };

    setTestHistory(
      (current) => [
        newTest,
        ...current,
      ]
    );

    setRunning(false);

    setMessage(
      `${currentScenario.scenario} DR test completed successfully within the target RTO.`
    );
  }

  if (!historyLoaded) {
    return (
      <main className="flex min-h-screen bg-zinc-950 text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">
            Loading disaster recovery data...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Backup & Disaster Recovery
              </p>

              <h1 className="mt-3 text-4xl font-bold">
                Disaster Recovery Plan
              </h1>

              <p className="mt-3 max-w-3xl text-gray-400">
                Define recovery priorities,
                technical procedures,
                ownership, and business
                continuity targets for major
                enterprise infrastructure
                incidents.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/backup-recovery"
                className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5"
              >
                Backup Dashboard
              </Link>

              <Link
                href="/backup-recovery/restore"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
              >
                Restore & Recovery
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="DR Status"
              value="Ready"
              subtitle="Recovery plan documented"
              valueClass="text-green-400"
            />

            <Kpi
              title="Critical Services"
              value="2"
              subtitle="Highest recovery priority"
              valueClass="text-red-400"
            />

            <Kpi
              title="Offsite Backup"
              value="Enabled"
              subtitle="Secondary recovery copy"
              valueClass="text-blue-400"
            />

            <Kpi
              title="DR Tests Passed"
              value={passedTests}
              subtitle="Validated recovery exercises"
              valueClass="text-purple-400"
            />
          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                Recovery Priority
              </h2>

              <p className="mt-2 text-gray-400">
                Services are restored in
                dependency order to recover
                core enterprise operations.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Order
                    </th>

                    <th className="px-4 py-4">
                      Service
                    </th>

                    <th className="px-4 py-4">
                      Recovery Owner
                    </th>

                    <th className="px-4 py-4">
                      Target RTO
                    </th>

                    <th className="px-6 py-4">
                      Priority
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {recoveryOrder.map(
                    (item) => (
                      <tr
                        key={item.order}
                        className="hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
                            {item.order}
                          </span>
                        </td>

                        <td className="px-4 py-5 font-semibold text-blue-400">
                          {item.service}
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {item.owner}
                        </td>

                        <td className="px-4 py-5 font-mono text-sm text-gray-300">
                          {item.rto}
                        </td>

                        <td className="px-6 py-5">
                          <PriorityBadge
                            priority={
                              item.priority
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Disaster Scenarios
              </h2>

              <p className="mt-2 text-gray-400">
                Predefined technical response
                procedures.
              </p>

              <div className="mt-6 space-y-4">
                {scenarios.map(
                  (item) => (
                    <div
                      key={
                        item.scenario
                      }
                      className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold text-blue-400">
                          {
                            item.scenario
                          }
                        </h3>

                        <span className="shrink-0 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                          {
                            item.target
                          }
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {
                          item.action
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Recovery Roles
              </h2>

              <p className="mt-2 text-gray-400">
                Operational ownership during
                a disaster declaration.
              </p>

              <div className="mt-6 space-y-4">
                {contacts.map(
                  (contact) => (
                    <div
                      key={
                        contact.role
                      }
                      className="rounded-xl border border-white/10 bg-zinc-950 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-semibold">
                          {
                            contact.role
                          }
                        </h3>

                        <span className="text-sm font-semibold text-purple-400">
                          {
                            contact.team
                          }
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {
                          contact.responsibility
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Disaster Recovery Lifecycle
            </h2>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Node label="Incident Detected" />
              <Arrow />
              <Node label="Assess Impact" />
              <Arrow />
              <Node label="Declare Disaster" />
              <Arrow />
              <Node label="Recover Core Services" />
              <Arrow />
              <Node label="Validate Business Access" />
              <Arrow />
              <Node label="Return to Normal Operations" />
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/[0.05] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
              DR Validation
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              Quarterly Recovery Test
            </h2>

            <p className="mt-3 max-w-4xl leading-7 text-gray-400">
              Run a simulated recovery exercise
              to validate recovery procedures,
              backup integrity, service
              dependencies, and RTO targets.
            </p>

            <form
              onSubmit={runDRTest}
              className="mt-6"
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
                <label>
                  <span className="mb-2 block text-sm text-gray-400">
                    Disaster Scenario
                  </span>

                  <select
                    value={
                      selectedScenario
                    }
                    onChange={(event) =>
                      setSelectedScenario(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-green-500"
                  >
                    {scenarios.map(
                      (item) => (
                        <option
                          key={
                            item.scenario
                          }
                          value={
                            item.scenario
                          }
                        >
                          {
                            item.scenario
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <div>
                  <span className="mb-2 block text-sm text-gray-400">
                    Target RTO
                  </span>

                  <div className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-semibold text-purple-300">
                    {
                      currentScenario.target
                    }
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-sm font-semibold text-blue-400">
                  Recovery Procedure
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {
                    currentScenario.action
                  }
                </p>
              </div>

              <button
                type="submit"
                disabled={running}
                className="mt-5 rounded-xl bg-green-600 px-6 py-3 font-semibold hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {running
                  ? "Running DR Test..."
                  : "Run DR Test"}
              </button>
            </form>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 p-6">
              <h2 className="text-2xl font-semibold">
                DR Test History
              </h2>

              <p className="mt-2 text-gray-400">
                Previously completed disaster
                recovery exercises.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-sm text-gray-400">
                  <tr>
                    <th className="px-6 py-4">
                      Test
                    </th>

                    <th className="px-4 py-4">
                      Scenario
                    </th>

                    <th className="px-4 py-4">
                      Target RTO
                    </th>

                    <th className="px-4 py-4">
                      Actual Recovery
                    </th>

                    <th className="px-4 py-4">
                      Tested By
                    </th>

                    <th className="px-4 py-4">
                      Completed
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {testHistory.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-5 font-mono text-sm text-gray-400">
                          {item.id}
                        </td>

                        <td className="px-4 py-5 font-semibold text-blue-400">
                          {item.scenario}
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            item.targetRto
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            item.actualRecovery
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-300">
                          {
                            item.testedBy
                          }
                        </td>

                        <td className="px-4 py-5 text-gray-400">
                          {
                            item.completedAt
                          }
                        </td>

                        <td className="px-6 py-5">
                          <TestStatusBadge
                            status={
                              item.status
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Kpi({
  title,
  value,
  subtitle,
  valueClass = "text-white",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  valueClass?: string;
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

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const classes =
    priority === "Critical"
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : priority === "High"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        : "border-blue-500/30 bg-blue-500/10 text-blue-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {priority}
    </span>
  );
}

function TestStatusBadge({
  status,
}: {
  status: TestStatus;
}) {
  const classes =
    status === "Passed"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-red-500/30 bg-red-500/10 text-red-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

function Node({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-semibold text-blue-300">
      {label}
    </span>
  );
}

function Arrow() {
  return (
    <span className="text-gray-600">
      →
    </span>
  );
}
