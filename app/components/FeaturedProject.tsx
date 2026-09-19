import Link from "next/link";

export default function FeaturedProject() {
  const technologies = [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "RBAC",
  ];

  const modules = [
    {
      title: "Asset Management",
      description: "Assets, assignments & QR tracking",
    },
    {
      title: "Helpdesk",
      description: "Tickets, priorities & workflows",
    },
    {
      title: "Identity & Access",
      description: "Users, roles & permissions",
    },
    {
      title: "Infrastructure",
      description:
        "Network, Windows Server & Microsoft 365",
    },
  ];

  return (
    <section className="bg-black px-8 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="uppercase tracking-[0.3em] text-blue-500">
          FEATURED PROJECT
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-blue-500/20 bg-zinc-950">
          <div className="grid lg:grid-cols-2">
            {/* Project information */}
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  Enterprise Case Study
                </p>

                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                  Completed
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                Enterprise IT Asset Management System
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-gray-200">
                Solving real IT operations and asset
                tracking challenges
              </h3>

              <p className="mt-5 max-w-xl leading-8 text-gray-400">
                Inspired by an operational challenge I
                observed during my IT internship at
                Zamil Plastic Industries. I designed
                and built an enterprise IT system that
                brings together asset management,
                helpdesk workflows, maintenance,
                identity and access management,
                Microsoft 365 administration,
                infrastructure monitoring, and
                disaster recovery concepts.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-gray-300"
                  >
                    {technology}
                  </span>
                ))}
              </div>

              <Link
                href="/projects/asset-management"
                className="mt-10 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                View Case Study →
              </Link>
            </div>

            {/* System preview */}
            <div className="flex min-h-[420px] items-center justify-center border-t border-white/10 bg-gradient-to-br from-blue-500/10 via-zinc-900 to-black p-8 lg:border-l lg:border-t-0">
              <div className="w-full rounded-2xl border border-white/10 bg-black p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Enterprise IT Operations
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      System Overview
                    </p>
                  </div>

                  <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                    RBAC Enabled
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {modules.map((module) => (
                    <div
                      key={module.title}
                      className="rounded-xl border border-white/10 bg-zinc-900 p-4"
                    >
                      <p className="font-semibold text-white">
                        {module.title}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-gray-500">
                        {module.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Role-Based Access
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "IT Admin",
                      "IT Support",
                      "Employee",
                    ].map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-gray-300"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-gray-600">
                  Front-end enterprise prototype using
                  browser storage for application data
                  and workflow state.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
