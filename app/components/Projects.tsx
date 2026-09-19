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
  caseStudyHref?: string;
  liveHref?: string;
  githubHref?: string;
};

const projects: Project[] = [
  {
    title: "Enterprise IT Asset Management",
    description:
      "Enterprise IT operations platform for asset tracking, employee assignments, helpdesk workflows, maintenance, access management, infrastructure monitoring, and recovery operations.",
    status: "Completed",
    caseStudyHref: "/projects/asset-management",
  },
  {
    title: "Active Directory Administration",
    description:
      "Identity and access management module covering users, groups, roles, permissions, password policies, and access workflows.",
    status: "Built Module",
  },
  {
    title: "Microsoft 365 Administration",
    description:
      "Microsoft 365 administration module covering users, licenses, Exchange Online, Teams, OneDrive, and security controls.",
    status: "Built Module",
  },
  {
    title: "NOVA Enterprise E-Commerce",
    description:
      "End-to-end retail platform featuring product catalog management, product detail pages, dynamic inventory, wishlist, cart, promo codes, test-mode checkout, delivery location, order tracking, customer accounts, admin dashboard, and customer support workflows.",
    status: "Completed",
    liveHref:
      "https://nova-ecommerce-shahad.vercel.app",
    githubHref:
      "https://github.com/1shahadalghamdi-cmyk/shahad-ecommerce",
  },
  {
    title: "SQL Inventory System",
    description:
      "Relational inventory management project focused on database design, SQL queries, data relationships, transactions, and reporting.",
    status: "Upcoming",
  },
  {
    title: "AI Helpdesk Ticket Classifier",
    description:
      "AI-assisted helpdesk prototype for analyzing support tickets and recommending categories, priorities, and routing decisions.",
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
                    project.status,
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="mt-7 leading-8 text-gray-400">
                {project.description}
              </p>

              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                {project.status === "Completed" &&
                  project.caseStudyHref && (
                    <Link
                      href={project.caseStudyHref}
                      className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                    >
                      View Case Study →
                    </Link>
                  )}

                {project.status === "Completed" &&
                  project.liveHref && (
                    <a
                      href={project.liveHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                    >
                      View Live Project →
                    </a>
                  )}

                {project.status === "Completed" &&
                  project.githubHref && (
                    <a
                      href={project.githubHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-gray-200 transition hover:border-blue-500/60 hover:text-white"
                    >
                      GitHub →
                    </a>
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

