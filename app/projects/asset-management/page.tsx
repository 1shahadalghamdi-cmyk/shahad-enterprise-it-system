/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Asset = {
  id: string;
  name: string;
  category: string;
  department: string;
  assignedTo: string;
  status: string;
};

const sampleAssets: Asset[] = [
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
];
const features = [
  {
    title: "Asset Registration",
    description:
      "Register laptops, monitors, printers, accessories and other IT assets with unique records.",
  },
  {
    title: "Employee Assignment",
    description:
      "Track which employee, department or location is currently responsible for each asset.",
  },
  {
    title: "Maintenance History",
    description:
      "Record technical issues, maintenance dates, repair costs and service status.",
  },
  {
    title: "Lifecycle Tracking",
    description:
      "Monitor assets from purchase and deployment through maintenance, replacement and retirement.",
  },
  {
    title: "Search & Filters",
    description:
      "Quickly locate assets using serial numbers, categories, employees, departments or status.",
  },
  {
    title: "Operational Reports",
    description:
      "Provide clear summaries of available, assigned, damaged and retired assets.",
  },
];

export default function AssetManagementPage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    try {
      const savedAssets = window.localStorage.getItem("assets");
      const parsedAssets: Asset[] = savedAssets
        ? JSON.parse(savedAssets)
        : [];

      setAssets(Array.isArray(parsedAssets) ? parsedAssets : []);
    } catch (error) {
      console.error("Unable to load dashboard assets:", error);
      setAssets([]);
    }
  }, []);

  const dashboardAssets = assets.length > 0 ? assets : sampleAssets;

  const statistics = useMemo(() => {
    const total = dashboardAssets.length;
    const assigned = dashboardAssets.filter(
      (asset) => asset.status.toLowerCase() === "assigned",
    ).length;
    const maintenance = dashboardAssets.filter(
      (asset) => asset.status.toLowerCase() === "maintenance",
    ).length;
    const available = dashboardAssets.filter(
      (asset) => asset.status.toLowerCase() === "available",
    ).length;

    return { total, assigned, maintenance, available };
  }, [dashboardAssets]);

  const recentAssets = useMemo(
    () => [...dashboardAssets].reverse().slice(0, 4),
    [dashboardAssets],
  );

  const categoryDistribution = useMemo(() => {
    const counts = dashboardAssets.reduce<Record<string, number>>(
      (result, asset) => {
        const category = asset.category || "Other";
        result[category] = (result[category] || 0) + 1;
        return result;
      },
      {},
    );

    return Object.entries(counts)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 4);
  }, [dashboardAssets]);

  function getStatusStyle(status: string) {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "assigned") {
      return "bg-green-500/10 text-green-400";
    }

    if (normalizedStatus === "maintenance") {
      return "bg-yellow-500/10 text-yellow-400";
    }

    if (normalizedStatus === "available") {
      return "bg-blue-500/10 text-blue-400";
    }

    return "bg-gray-500/10 text-gray-400";
  }

  function exportAssetsReport() {
    const header = [
      "Asset ID",
      "Name",
      "Category",
      "Department",
      "Assigned To",
      "Status",
    ];

    const rows = dashboardAssets.map((asset) => [
      asset.id,
      asset.name,
      asset.category,
      asset.department,
      asset.assignedTo || "Unassigned",
      asset.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "asset-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="px-8 pb-24 pt-32">
        <div className="mx-auto max-w-6xl">
         <Link
  href="/"
  className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-blue-400"
>
  ← Back to Portfolio
</Link>


          <p className="mt-12 uppercase tracking-[0.3em] text-blue-500">
            ENTERPRISE CASE STUDY
          </p>

          <h1 className="mt-4 max-w-5xl text-5xl font-bold leading-tight md:text-7xl">
            Enterprise IT Asset Management System
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-400">
            A centralized enterprise solution designed to track IT assets,
            employee assignments, maintenance history, lifecycle status and
            operational reports.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "Next.js",
              "React",
              "SQL",
              "Tailwind CSS",
              "System Analysis",
            ].map((technology) => (
              <span
                key={technology}
                className="rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-gray-300"
              >
                {technology}
              </span>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-zinc-900 to-zinc-950 p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-sm uppercase tracking-widest text-gray-500">
                  Project Type
                </p>

                <p className="mt-3 text-xl font-semibold">
                  Enterprise Web System
                </p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-widest text-gray-500">
                  Primary Goal
                </p>

                <p className="mt-3 text-xl font-semibold">
                  Improve Asset Visibility
                </p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-widest text-gray-500">
                  Inspired By
                </p>

                <p className="mt-3 text-xl font-semibold">
                  A Real Internship Challenge
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge and Solution */}
      <section className="border-y border-white/10 bg-zinc-950 px-8 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-red-500/20 bg-zinc-900 p-8">
            <p className="uppercase tracking-[0.3em] text-red-400">
              THE CHALLENGE
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Limited visibility across IT assets
            </h2>

            <p className="mt-6 leading-8 text-gray-400">
              During my internship at Zamil Plastic Industries, I observed that
              IT assets such as monitors, mice and other equipment required a
              more centralized and structured tracking process.
            </p>

            <p className="mt-4 leading-8 text-gray-400">
              When information is distributed across manual records, it becomes
              harder to identify who is using each asset, where it is located,
              whether it requires maintenance and when it should be replaced.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-zinc-900 p-8">
            <p className="uppercase tracking-[0.3em] text-blue-400">
              THE SOLUTION
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              One centralized system for the complete asset lifecycle
            </h2>

            <p className="mt-6 leading-8 text-gray-400">
              I designed an enterprise asset management concept that provides a
              single source of truth for asset records, assignments,
              maintenance activities and lifecycle status.
            </p>

            <p className="mt-4 leading-8 text-gray-400">
              The system helps IT teams locate assets faster, reduce missing
              information and make better operational decisions using clear,
              searchable and organized data.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="uppercase tracking-[0.3em] text-blue-500">
            KEY FEATURES
          </p>

          <h2 className="mt-4 text-5xl font-bold">
            Built for enterprise IT operations
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-zinc-900 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500"
              >
                <span className="text-sm font-semibold text-blue-500">
                  0{index + 1}
                </span>

                <h3 className="mt-5 text-2xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="bg-zinc-950 px-8 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="uppercase tracking-[0.3em] text-blue-500">
            SYSTEM PREVIEW
          </p>

          <h2 className="mt-4 text-5xl font-bold">
            Asset management dashboard
          </h2>

          <p className="mt-5 max-w-3xl leading-8 text-gray-400">
            A centralized overview that helps IT teams monitor asset status,
            assignments, maintenance activity and recent records.
          </p>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
            {/* Dashboard Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-gray-500">
                  Enterprise IT Operations
                </p>

                <h3 className="mt-1 text-2xl font-bold">
                  Asset Dashboard
                </h3>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportAssetsReport}
                  className="rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-gray-300 transition hover:border-blue-500"
                >
                  Export Report
                </button>

                <Link
                  href="/assets/new"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  + Add Asset
                </Link>
              </div>
            </div>

            <div className="p-6">
              {/* Statistics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-sm text-gray-500">
                    Total Assets
                  </p>

                  <p className="mt-3 text-4xl font-bold">
                    {statistics.total}
                  </p>

                  <p className="mt-2 text-sm text-green-400">
                    Live inventory total
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-sm text-gray-500">
                    Assigned Assets
                  </p>

                  <p className="mt-3 text-4xl font-bold">
                    {statistics.assigned}
                  </p>

                  <p className="mt-2 text-sm text-blue-400">
                    {statistics.total > 0
                      ? `${Math.round((statistics.assigned / statistics.total) * 100)}% of inventory`
                      : "0% of inventory"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-sm text-gray-500">
                    In Maintenance
                  </p>

                  <p className="mt-3 text-4xl font-bold">
                    {statistics.maintenance}
                  </p>

                  <p className="mt-2 text-sm text-yellow-400">
                    Requires attention
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-sm text-gray-500">
                    Available Assets
                  </p>

                  <p className="mt-3 text-4xl font-bold">
                    {statistics.available}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    Ready for assignment
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Recent Assets */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div>
                      <h4 className="text-lg font-semibold">
                        Recent Assets
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        Latest records added to the system
                      </p>
                    </div>

                    <Link
                      href="/assets"
                      className="text-sm text-blue-400 transition hover:text-blue-300"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                      <thead className="border-b border-white/10 text-sm text-gray-500">
                        <tr>
                          <th className="px-5 py-4 font-medium">
                            Asset
                          </th>

                          <th className="px-5 py-4 font-medium">
                            Assigned To
                          </th>

                          <th className="px-5 py-4 font-medium">
                            Department
                          </th>

                          <th className="px-5 py-4 font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/10 text-sm">
                        {recentAssets.map((asset) => (
                          <tr key={asset.id}>
                            <td className="px-5 py-4">
                              <Link
                                href={`/assets/${asset.id}`}
                                className="font-medium text-white transition hover:text-blue-400"
                              >
                                {asset.name}
                              </Link>

                              <p className="mt-1 text-gray-500">
                                {asset.id}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-gray-300">
                              {asset.assignedTo || "Not Assigned"}
                            </td>

                            <td className="px-5 py-4 text-gray-300">
                              {asset.department || "Not Assigned"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs ${getStatusStyle(
                                  asset.status,
                                )}`}
                              >
                                {asset.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Asset Distribution */}
                <div className="rounded-2xl border border-white/10 bg-black p-5">
                  <h4 className="text-lg font-semibold">
                    Asset Distribution
                  </h4>

                  <p className="mt-1 text-sm text-gray-500">
                    Assets by category
                  </p>

                  <div className="mt-8 space-y-6">
                    {categoryDistribution.map(([category, count]) => {
                      const percentage = statistics.total
                        ? Math.max(8, Math.round((count / statistics.total) * 100))
                        : 0;

                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {category}
                            </span>

                            <span className="text-gray-500">
                              {count}
                            </span>
                          </div>

                          <div className="mt-2 h-2 rounded-full bg-zinc-800">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                    <p className="text-sm font-medium text-blue-300">
                      Inventory Insight
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      {categoryDistribution.length > 0
                        ? `${categoryDistribution[0][0]} represents the largest asset category with ${categoryDistribution[0][1]} recorded assets.`
                        : "Add assets to generate inventory insights."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}