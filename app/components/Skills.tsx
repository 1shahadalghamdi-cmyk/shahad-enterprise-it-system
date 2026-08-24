export default function Skills() {
  const skills = [
    "Active Directory",
    "Microsoft 365",
    "Windows Server",
    "Cisco Networking",
    "SQL",
    "Power BI",
    "Odoo ERP",
    "IT Support",
    "TypeScript",
    "JavaScript",
    "Next.js",
    "React",
    "Tailwind CSS",
    "HTML & CSS",
    "RBAC",
    "Figma",
  ];

  return (
    <section
      id="skills"
      className="bg-black px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          SKILLS
        </p>

        <h2 className="mb-10 text-5xl font-bold">
          Technical Skills
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {skills.map((skill) => (
            <div
              key={skill}
              className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-center transition duration-300 hover:-translate-y-2 hover:border-blue-500 hover:bg-blue-600"
            >
              <span className="font-medium">
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
