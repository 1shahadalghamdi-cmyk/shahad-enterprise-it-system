import Link from "next/link";

type ProjectStatus =
  | "Completed"
  | "Built Module"
  | "Prototype"
  | "Upcoming";

type Project = {
  title: string;
  description: string;
  status: ProjectStatus;
  href?: string;
  external?: boolean;
};

const projects: Project[] = [
  {
    title: "Enterprise IT Asset Management",
    description:
      "Enterprise system for asset tracking, employee assignments, helpdesk tickets, maintenance, access control, infrastructure monitoring, and recovery operations.",
    status: "Completed",
    href: "/projects/asset-management",
  },
  {
    title: "Active Directory Administration",
    description:
      "Enterprise IAM simulation covering users, groups, roles, permissions, password policies, and access workflows.",
    status: "Built Module",
  },
  {
    title: "Microsoft 365 Administration",
    description:
      "Enterprise administration simulation for Microsoft 365 users, licenses, Exchange Online, Teams, OneDrive, and security controls.",
    status: "Built Module",
  },
  {
    title: "Enterprise E-Commerce",
    description:
      "Full e-commerce platform featuring product management, dynamic inventory, shopping cart, checkout simulation, order processing, admin authentication, and order management.",
    status: "Completed",
    href: "https://shahad-ecommerce.vercel.app",
    external: true,
  },
  {
    title: "SQL Inventory System",
    description:
      "Planned relational database project covering database design, SQL queries, inventory relationships, and reporting.",
    status: "Upcoming",
  },
  {
    title: "AI Helpdesk Ticket Classifier",
    description:
      "Helpdesk classification prototype for analyzing ticket information and recommending categories, priorities, and support routing.",
    status: "Prototype",
  },
];

function getStatusStyle(status: ProjectStatus) {
  switch (status) {
    case "Completed":
      return "border-green-500/30 bg-green-500/10 text-green-400";

    case "Built Module":
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";

    case "Prototype":
      return "border-purple-500/30 bg-purple-500/10 text-purple-400";

    case "Upcoming":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  }
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="bg-black px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          PROJECTS
        </p>

        <h2 className="mb-12 text-4xl font-bold md:text-5xl">
          Featured Projects
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.title}
              className="flex min-h-[330px] flex-col rounded-3xl border border-white/10 bg-zinc-900 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h3 className="max-w-md text-2xl font-bold">
                  {project.title}
                </h3>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="mt-7 leading-8 text-gray-400">
                {project.description}
              </p>

              <div className="mt-auto pt-8">
                {project.status === "Completed" &&
                  project.href &&
                  project.external && (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                    >
                      View Live Project →
                    </a>
                  )}

                {project.status === "Completed" &&
                  project.href &&
                  !project.external && (
                    <Link
                      href={project.href}
                      className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                    >
                      View Case Study →
                    </Link>
                  )}

                {project.status === "Built Module" && (
                  <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-blue-300">
                    Included in Enterprise System
                  </span>
                )}

                {project.status === "Prototype" && (
                  <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-purple-300">
                    Prototype Module
                  </span>
                )}

                {project.status === "Upcoming" && (
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3 text-gray-400">
                    Upcoming Project
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
