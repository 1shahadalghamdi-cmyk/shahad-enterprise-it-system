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
};

export default function Projects() {
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
        "Identity and access management simulation covering users, groups, roles, permissions, password policies, and enterprise access workflows.",
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
        "Planned modern shopping platform covering product management, cart workflows, checkout, and payment gateway simulation.",
      status: "Upcoming",
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

  function getStatusStyles(status: ProjectStatus) {
    if (status === "Completed") {
      return "border-green-500/30 bg-green-500/10 text-green-400";
    }

    if (status === "Built Module") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    }

    if (status === "Prototype") {
      return "border-purple-500/30 bg-purple-500/10 text-purple-400";
    }

    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  }

  return (
    <section
      id="projects"
      className="bg-zinc-950 px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
            PROJECTS
          </p>

          <h2 className="text-5xl font-bold">
            Featured Projects
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-gray-400">
            Enterprise-focused projects and technical modules that
            demonstrate practical experience across IT systems,
            infrastructure, administration, data, and business
            applications.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.title}
              className="flex min-h-[260px] flex-col rounded-3xl border border-white/10 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-500/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h3 className="text-2xl font-bold">
                  {project.title}
                </h3>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
                    project.status,
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="mt-5 leading-7 text-gray-400">
                {project.description}
              </p>

              <div className="mt-auto pt-8">
                {project.href ? (
                  <Link
                    href={project.href}
                    className="inline-flex rounded-full bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
                  >
                    View Case Study →
                  </Link>
                ) : project.status === "Upcoming" ? (
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-gray-400">
                    Upcoming Project
                  </span>
                ) : project.status === "Prototype" ? (
                  <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-5 py-3 text-sm text-purple-300">
                    Prototype Module
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm text-blue-300">
                    Included in Enterprise System
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
