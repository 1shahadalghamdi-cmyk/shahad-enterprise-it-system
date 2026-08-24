"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/system/Sidebar";

type Category =
  | "Network"
  | "Hardware"
  | "Software"
  | "Access"
  | "Microsoft 365";

type Priority = "Low" | "Medium" | "High" | "Critical";
type ReviewStatus = "Auto Approved" | "Needs Review";

type ClassifiedTicket = {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  suggestedTeam: string;
  confidence: number;
  status: ReviewStatus;
};

const initialTickets: ClassifiedTicket[] = [
  {
    id: "TKT-1042",
    title: "Cannot connect to office Wi-Fi",
    description: "Laptop disconnects from the corporate wireless network.",
    category: "Network",
    priority: "High",
    suggestedTeam: "Network Support",
    confidence: 94,
    status: "Auto Approved",
  },
  {
    id: "TKT-1043",
    title: "Outlook keeps asking for password",
    description: "User cannot keep Outlook signed in after password change.",
    category: "Microsoft 365",
    priority: "Medium",
    suggestedTeam: "Cloud Support",
    confidence: 91,
    status: "Auto Approved",
  },
  {
    id: "TKT-1044",
    title: "New employee needs system access",
    description: "Create access for HR systems and shared department resources.",
    category: "Access",
    priority: "Medium",
    suggestedTeam: "IAM Support",
    confidence: 88,
    status: "Auto Approved",
  },
  {
    id: "TKT-1045",
    title: "Laptop screen flickering",
    description: "Screen flickers continuously after startup.",
    category: "Hardware",
    priority: "High",
    suggestedTeam: "IT Support",
    confidence: 96,
    status: "Auto Approved",
  },
  {
    id: "TKT-1046",
    title: "Application closes unexpectedly",
    description: "Finance desktop application crashes during report export.",
    category: "Software",
    priority: "High",
    suggestedTeam: "Application Support",
    confidence: 76,
    status: "Needs Review",
  },
];

export default function AiClassificationPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<ClassifiedTicket | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tickets;

    return tickets.filter((ticket) =>
      [
        ticket.id,
        ticket.title,
        ticket.category,
        ticket.priority,
        ticket.suggestedTeam,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [tickets, search]);

  function classifyTicket() {
    if (!title.trim() && !description.trim()) return;

    const text = `${title} ${description}`.toLowerCase();

    let category: Category = "Software";
    let priority: Priority = "Medium";
    let suggestedTeam = "Application Support";
    let confidence = 79;

    if (
      text.includes("wifi") ||
      text.includes("wi-fi") ||
      text.includes("network") ||
      text.includes("internet") ||
      text.includes("vpn")
    ) {
      category = "Network";
      suggestedTeam = "Network Support";
      confidence = 94;
    } else if (
      text.includes("password") ||
      text.includes("access") ||
      text.includes("login") ||
      text.includes("permission")
    ) {
      category = "Access";
      suggestedTeam = "IAM Support";
      confidence = 92;
    } else if (
      text.includes("outlook") ||
      text.includes("teams") ||
      text.includes("onedrive") ||
      text.includes("email")
    ) {
      category = "Microsoft 365";
      suggestedTeam = "Cloud Support";
      confidence = 93;
    } else if (
      text.includes("screen") ||
      text.includes("keyboard") ||
      text.includes("mouse") ||
      text.includes("laptop") ||
      text.includes("printer")
    ) {
      category = "Hardware";
      suggestedTeam = "IT Support";
      confidence = 90;
    }

    if (
      text.includes("down") ||
      text.includes("cannot work") ||
      text.includes("urgent") ||
      text.includes("critical")
    ) {
      priority = "Critical";
    } else if (
      text.includes("cannot") ||
      text.includes("crash") ||
      text.includes("disconnect") ||
      text.includes("failed")
    ) {
      priority = "High";
    }

    const classified: ClassifiedTicket = {
      id: `AI-${String(tickets.length + 1).padStart(3, "0")}`,
      title: title.trim() || "Untitled Ticket",
      description: description.trim(),
      category,
      priority,
      suggestedTeam,
      confidence,
      status: confidence >= 85 ? "Auto Approved" : "Needs Review",
    };

    setResult(classified);
  }

  function addToQueue() {
    if (!result) return;
    setTickets((current) => [result, ...current]);
    setTitle("");
    setDescription("");
    setResult(null);
  }

  const avgConfidence = Math.round(
    tickets.reduce((sum, ticket) => sum + ticket.confidence, 0) /
      tickets.length,
  );

  const reviewCount = tickets.filter(
    (ticket) => ticket.status === "Needs Review",
  ).length;

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
                Intelligent Service Desk
              </p>
              <h1 className="mt-3 text-4xl font-bold">
                AI Ticket Classification
              </h1>
              <p className="mt-3 max-w-3xl text-gray-400">
                Analyze incoming helpdesk requests and automatically suggest
                category, priority, support team, and classification confidence.
              </p>
            </div>

            <Link
              href="/tickets"
              className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 hover:bg-blue-500/20"
            >
              Open Helpdesk
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              title="Classified Tickets"
              value={tickets.length}
              subtitle="Processed by classification engine"
            />
            <Kpi
              title="Avg. Confidence"
              value={`${avgConfidence}%`}
              subtitle="Classification confidence"
              valueClass="text-green-400"
            />
            <Kpi
              title="Manual Review"
              value={reviewCount}
              subtitle="Low-confidence tickets"
              valueClass="text-yellow-300"
            />
            <Kpi
              title="Categories"
              value="5"
              subtitle="Enterprise support categories"
              valueClass="text-purple-400"
            />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="h-fit rounded-2xl border border-blue-500/20 bg-zinc-900 p-6">
              <h2 className="text-2xl font-semibold">
                Test Classification
              </h2>
              <p className="mt-2 text-gray-400">
                Enter a sample ticket to simulate automated classification.
              </p>

              <label className="mt-6 block">
                <span className="mb-2 block text-sm text-gray-400">
                  Ticket Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Cannot connect to VPN"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm text-gray-400">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the user's issue..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                />
              </label>

              <button
                type="button"
                onClick={classifyTicket}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
              >
                Analyze Ticket
              </button>

              {result && (
                <div className="mt-6 rounded-xl border border-purple-500/20 bg-zinc-950 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
                    AI Recommendation
                  </p>

                  <div className="mt-4 space-y-3">
                    <Detail label="Category" value={result.category} />
                    <Detail label="Priority" value={result.priority} />
                    <Detail label="Suggested Team" value={result.suggestedTeam} />
                    <Detail
                      label="Confidence"
                      value={`${result.confidence}%`}
                    />
                    <Detail label="Decision" value={result.status} />
                  </div>

                  <button
                    type="button"
                    onClick={addToQueue}
                    className="mt-5 w-full rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 font-semibold text-green-400 hover:bg-green-500/20"
                  >
                    Add to Classification Queue
                  </button>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Classification Queue
                  </h2>
                  <p className="mt-2 text-gray-400">
                    AI-classified service desk requests.
                  </p>
                </div>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search classifications..."
                  className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="divide-y divide-white/5">
                {filtered.map((ticket) => (
                  <div key={ticket.id} className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CategoryBadge category={ticket.category} />
                          <PriorityBadge priority={ticket.priority} />
                          <ReviewBadge status={ticket.status} />
                        </div>

                        <h3 className="mt-4 font-semibold text-blue-400">
                          {ticket.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-gray-400">
                          {ticket.description}
                        </p>
                        <p className="mt-3 text-xs text-gray-600">
                          {ticket.id} • Suggested: {ticket.suggestedTeam}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-center">
                        <p className="text-xs text-gray-600">Confidence</p>
                        <p className="mt-1 text-2xl font-bold text-green-400">
                          {ticket.confidence}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-2xl font-semibold">
              Classification Workflow
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <Node label="New Ticket" />
              <Arrow />
              <Node label="Text Analysis" />
              <Arrow />
              <Node label="Category Prediction" />
              <Arrow />
              <Node label="Priority Detection" />
              <Arrow />
              <Node label="Team Recommendation" />
              <Arrow />
              <Node label="Confidence Check" />
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
  value: number | string;
  subtitle: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`mt-3 text-3xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-semibold text-gray-300">
        {value}
      </span>
    </div>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
      {category}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const classes =
    priority === "Critical"
      ? "border-red-500/30 bg-red-500/10 text-red-400"
      : priority === "High"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
        : priority === "Medium"
          ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
          : "border-gray-500/30 bg-gray-500/10 text-gray-400";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {priority}
    </span>
  );
}

function ReviewBadge({ status }: { status: ReviewStatus }) {
  const classes =
    status === "Auto Approved"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-purple-500/30 bg-purple-500/10 text-purple-300";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

function Node({ label }: { label: string }) {
  return (
    <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-semibold text-blue-300">
      {label}
    </span>
  );
}

function Arrow() {
  return <span className="text-gray-600">→</span>;
}
