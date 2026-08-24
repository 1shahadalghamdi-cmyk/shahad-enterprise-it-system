export default function Experience() {
  return (
    <section
      id="experience"
      className="bg-black px-8 py-32 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          EXPERIENCE
        </p>

        <h2 className="mb-12 text-5xl font-bold">
          Professional Experience
        </h2>

        <div className="space-y-8">
          {/* Al Muhaideb */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h3 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
                  💼 HR Assistant
                </h3>

                <p className="mt-2 text-lg font-medium text-blue-400">
                  Al Muhaideb National
                </p>

                <p className="text-sm text-gray-500">
                  Dammam, Saudi Arabia
                </p>
              </div>

              <span className="h-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                2026 – Present
              </span>
            </div>

            <ul className="mt-6 space-y-3 leading-7 text-gray-400">
              <li>
                ✔ Manage employee records and HR workflows using Odoo ERP.
              </li>

              <li>
                ✔ Process employee services through Qiwa, Muqeem, and Absher.
              </li>

              <li>
                ✔ Administer health insurance operations for employees and dependents.
              </li>

              <li>
                ✔ Support payroll inputs, deductions, employee documentation, and compliance processes.
              </li>

              <li>
                ✔ Support recruitment, onboarding, and high-volume employee administration.
              </li>
            </ul>
          </div>

          {/* Zamil */}
          <div className="rounded-3xl border border-blue-500/20 bg-zinc-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h3 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
                  🖥️ IT Support Intern
                </h3>

                <p className="mt-2 text-lg font-medium text-blue-400">
                  Zamil Plastic Industries
                </p>

                <p className="text-sm text-gray-500">
                  Dammam, Saudi Arabia
                </p>
              </div>

              <span className="h-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Jul 2025 – Aug 2025
              </span>
            </div>

            <ul className="mt-6 space-y-3 leading-7 text-gray-400">
              <li>
                ✔ Provided first-level support for hardware, software, and network issues.
              </li>

              <li>
                ✔ Managed Active Directory users, groups, access permissions, and account lifecycle tasks.
              </li>

              <li>
                ✔ Supported Microsoft 365 accounts, Teams, OneDrive, and user services.
              </li>

              <li>
                ✔ Installed and configured Windows workstations and supported LAN connectivity.
              </li>

              <li>
                ✔ Documented IT procedures, troubleshooting processes, and technical workflows.
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <h4 className="mb-2 text-lg font-semibold text-white">
                💡 Real Business Challenge
              </h4>

              <p className="leading-7 text-gray-300">
                During my internship at{" "}
                <strong>Zamil Plastic Industries</strong>, I observed an
                operational challenge in tracking IT assets and their
                assignments. This experience inspired me to design and build
                the{" "}
                <span className="font-semibold text-white">
                  Enterprise IT Asset Management System
                </span>
                , now showcased as the flagship project in this portfolio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
