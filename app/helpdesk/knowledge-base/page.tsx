"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import Sidebar from "@/app/components/system/Sidebar";

type ArticleStatus =
  | "Published"
  | "Draft"
  | "Archived";

type KnowledgeArticle = {
  id: string;
  title: string;
  category: string;
  summary: string;
  author: string;
  status: ArticleStatus;
  lastUpdated: string;
  views: number;
};

const categories = [
  "All",
  "Hardware",
  "Software",
  "Microsoft 365",
  "Network",
  "Security",
  "Active Directory",
  "Printers",
];

const articles: KnowledgeArticle[] = [
  {
    id: "KB-1001",
    title: "Reset a Microsoft 365 User Password",
    category: "Microsoft 365",
    summary:
      "Standard procedure for resetting a Microsoft 365 password and requiring the user to change it at the next sign-in.",
    author: "Shahad AlGhamdi",
    status: "Published",
    lastUpdated: "Aug 3, 2026",
    views: 980,
  },
  {
    id: "KB-1002",
    title: "VPN Connectivity Troubleshooting Guide",
    category: "Network",
    summary:
      "Troubleshoot unstable VPN sessions, authentication errors, and failed access to internal applications.",
    author: "Sarah Hassan",
    status: "Published",
    lastUpdated: "Aug 2, 2026",
    views: 1240,
  },
  {
    id: "KB-1003",
    title: "Join a Windows Device to Active Directory",
    category: "Active Directory",
    summary:
      "Steps for joining a company Windows device to the enterprise domain and validating Group Policy.",
    author: "Mohammed Saleh",
    status: "Published",
    lastUpdated: "Aug 1, 2026",
    views: 865,
  },
  {
    id: "KB-1004",
    title: "Resolve a Network Printer Offline Issue",
    category: "Printers",
    summary:
      "Verify printer power, IP connectivity, print queue status, driver configuration, and network availability.",
    author: "Ali Nasser",
    status: "Published",
    lastUpdated: "Jul 30, 2026",
    views: 742,
  },
  {
    id: "KB-1005",
    title: "BitLocker Recovery Key Process",
    category: "Security",
    summary:
      "Internal process for validating user identity and retrieving an approved BitLocker recovery key.",
    author: "Yousef Omar",
    status: "Draft",
    lastUpdated: "Jul 29, 2026",
    views: 318,
  },
  {
    id: "KB-1006",
    title: "Replace a Damaged Laptop Keyboard",
    category: "Hardware",
    summary:
      "Inspection, replacement, testing, and maintenance documentation steps for a damaged laptop keyboard.",
    author: "Sarah Hassan",
    status: "Published",
    lastUpdated: "Jul 27, 2026",
    views: 460,
  },
  {
    id: "KB-1007",
    title: "Microsoft Teams Audio Troubleshooting",
    category: "Microsoft 365",
    summary:
      "Resolve microphone, speaker, permissions, selected device, and Teams audio configuration issues.",
    author: "Shahad AlGhamdi",
    status: "Published",
    lastUpdated: "Jul 26, 2026",
    views: 690,
  },
  {
    id: "KB-1008",
    title: "Legacy Windows 10 Deployment Procedure",
    category: "Software",
    summary:
      "Archived deployment instructions retained for reference during legacy device support.",
    author: "IT Support",
    status: "Archived",
    lastUpdated: "Jun 18, 2026",
    views: 205,
  },
];

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const filteredArticles = useMemo(() => {
    const normalizedSearch =
      searchTerm.toLowerCase().trim();

    return articles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All" ||
        article.category === selectedCategory;

      const matchesSearch =
        normalizedSearch === "" ||
        article.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.summary
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.author
          .toLowerCase()
          .includes(normalizedSearch) ||
        article.category
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const publishedCount = articles.filter(
    (article) => article.status === "Published",
  ).length;

  const draftCount = articles.filter(
    (article) => article.status === "Draft",
  ).length;

  const totalViews = articles.reduce(
    (total, article) => total + article.views,
    0,
  );

  const mostViewedArticles = [...articles]
    .sort(
      (firstArticle, secondArticle) =>
        secondArticle.views - firstArticle.views,
    )
    .slice(0, 3);

  const recentlyAddedArticles = articles.slice(0, 3);

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="min-w-0 flex-1 p-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
              IT Service Knowledge Management
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Knowledge Base
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Search technical articles, troubleshooting
              guides, standard operating procedures, and
              reusable service desk resolutions.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            + New Article
          </button>
        </div>

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Articles"
            value={articles.length.toString()}
            description="Knowledge records"
            valueClassName="text-blue-400"
          />

          <MetricCard
            label="Published"
            value={publishedCount.toString()}
            description="Available to technicians"
            valueClassName="text-green-400"
          />

          <MetricCard
            label="Drafts"
            value={draftCount.toString()}
            description="Awaiting review"
            valueClassName="text-yellow-300"
          />

          <MetricCard
            label="Total Views"
            value={totalViews.toLocaleString()}
            description="Article usage"
            valueClassName="text-purple-400"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Search Articles
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Find approved troubleshooting steps and
                internal procedures.
              </p>
            </div>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by title, category, or author..."
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-blue-500 xl:max-w-md"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((category) => {
              const isSelected =
                selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/15 text-blue-300"
                      : "border-white/10 bg-zinc-950 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Knowledge Articles
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Showing {filteredArticles.length} of{" "}
              {articles.length} articles.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">
                    Article
                  </th>
                  <th className="px-4 py-4">
                    Category
                  </th>
                  <th className="px-4 py-4">
                    Author
                  </th>
                  <th className="px-4 py-4">
                    Updated
                  </th>
                  <th className="px-4 py-4">
                    Views
                  </th>
                  <th className="px-4 py-4">
                    Status
                  </th>
                  <th className="px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="transition hover:bg-zinc-800/40"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-blue-400">
                        {article.id}
                      </p>

                      <p className="mt-2 font-medium text-white">
                        {article.title}
                      </p>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                        {article.summary}
                      </p>
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {article.category}
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {article.author}
                    </td>

                    <td className="px-4 py-5 text-sm text-gray-500">
                      {article.lastUpdated}
                    </td>

                    <td className="px-4 py-5 text-gray-300">
                      {article.views.toLocaleString()}
                    </td>

                    <td className="px-4 py-5">
                      <StatusBadge
                        status={article.status}
                      />
                    </td>

                    <td className="px-6 py-5">
                      <Link
                        href={`/helpdesk/knowledge-base/${article.id}`}
                        className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                      >
                        View Article
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredArticles.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center"
                    >
                      <p className="text-lg font-medium text-gray-300">
                        No articles found
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Try another search term or category.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
                Usage Analytics
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Most Viewed
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {mostViewedArticles.map(
                (article, index) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between gap-5 rounded-xl border border-white/10 bg-zinc-950 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 font-bold text-purple-400">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {article.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {article.category}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 font-semibold text-purple-400">
                      {article.views.toLocaleString()} views
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
                New Content
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Recently Added
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {recentlyAddedArticles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-xl border border-white/10 bg-zinc-950 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {article.title}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        {article.id} · {article.category}
                      </p>
                    </div>

                    <StatusBadge
                      status={article.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  description,
  valueClassName,
}: {
  label: string;
  value: string;
  description: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <p className="text-sm text-gray-400">
        {label}
      </p>

      <p
        className={`mt-4 text-4xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-600">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ArticleStatus;
}) {
  const classes: Record<
    ArticleStatus,
    string
  > = {
    Published:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Draft:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    Archived:
      "border-red-500/30 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}