export default function Projects() {
  const projects = [
    {
      title: "Enterprise IT Asset Management",
      description:
        "Track company devices, maintenance and employee assignments.",
    },
    {
      title: "Active Directory Administration",
      description:
        "Users, Groups, OU Structure and Group Policy management.",
    },
    {
      title: "Microsoft 365 Administration",
      description:
        "Exchange Online, Teams and SharePoint administration.",
    },
    {
      title: "Enterprise E-Commerce",
      description:
        "Modern shopping platform with payment gateway simulation.",
    },
    {
      title: "SQL Inventory System",
      description:
        "Database design, queries and reporting dashboard.",
    },
    {
      title: "AI Helpdesk Ticket Classifier",
      description:
        "Automatic ticket categorization using Python.",
    },
  ];

  return (
    <section
      id="projects"
      className="bg-zinc-950 px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">

        <h2 className="mb-12 text-5xl font-bold">
          Featured Projects
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {projects.map((project) => (
            <div
              key={project.title}
              className="rounded-3xl border border-white/10 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-blue-500"
            >
              <h3 className="mb-4 text-2xl font-bold">
                {project.title}
              </h3>

              <p className="mb-8 text-gray-400">
                {project.description}
              </p>

              <button className="rounded-full bg-blue-600 px-5 py-3 hover:bg-blue-500">
                View Case Study →
              </button>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}