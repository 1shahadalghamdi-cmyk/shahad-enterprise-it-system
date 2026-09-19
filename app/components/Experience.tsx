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
                <h3 className="text-3xl font-bold md:text-4xl">
                  HR Assistant
                </h3>

                <p className="mt-2 text-lg font-medium text-blue-400">
                  Al Muhaideb National
                </p>

                <p className="text-sm text-gray-500">
                  Dammam, Saudi Arabia
                </p>
              </div>

              <span className="h-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                May 2026 – Present
              </span>
            </div>

            <ul className="mt-6 list-disc space-y-3 pl-5 leading-7 text-gray-400 marker:text-blue-500">
              <li>
                Manage employee data and large-scale administrative workflows
                through Odoo ERP and enterprise platforms supporting 1,000+
                employees.
              </li>

              <li>
                Maintain employee personnel documents in SharePoint,
                supporting centralized digital recordkeeping.
              </li>

              <li>
                Process employee transactions through Qiwa, Muqeem, and
                Absher.
              </li>

              <li>
                Manage health insurance operations for 1,000+ employees and
                dependents.
              </li>

              <li>
                Support payroll inputs, deductions, employee documentation,
                and compliance-related workflows.
              </li>

              <li>
                Collaborate with the IT department on an employee attendance
                application, translating HR requirements into system
                workflows.
              </li>
            </ul>
          </div>

          {/* Zamil */}
          <div className="rounded-3xl border border-blue-500/20 bg-zinc-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h3 className="text-3xl font-bold md:text-4xl">
                  IT Support Intern
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

            <ul className="mt-6 list-disc space-y-3 pl-5 leading-7 text-gray-400 marker:text-blue-500">
              <li>
                Resolved hardware, software, and network support tickets,
                achieving a 95% resolution rate.
              </li>

              <li>
                Reduced average issue resolution time by 20% through
                proactive troubleshooting and process improvements.
              </li>

              <li>
                Managed Active Directory user accounts, access permissions,
                and user lifecycle tasks.
              </li>

              <li>
                Configured and supported Microsoft 365 services, including
                Teams, OneDrive, and email, for 50+ users.
              </li>

              <li>
                Installed and configured Windows operating systems based on
                departmental requirements.
              </li>

              <li>
                Created IT workflow process maps and technical documentation
                to improve consistency and support onboarding.
              </li>

              <li>
                Supported LAN connectivity, network devices, data center
                operations, surveillance cameras, and asset tracking systems.
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Real Business Challenge
              </p>

              <p className="leading-7 text-gray-300">
                During my internship at{" "}
                <strong>Zamil Plastic Industries</strong>, I identified an
                operational challenge related to IT asset tracking and
                employee assignments. This experience inspired me to design
                and build the{" "}
                <span className="font-semibold text-white">
                  Enterprise IT Asset Management & Helpdesk System
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
