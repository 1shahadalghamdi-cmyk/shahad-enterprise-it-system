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

          {/* Al Muhaidib */}
          <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 transition-all duration-300 hover:border-blue-500 hover:-translate-y-1">

            <div className="flex flex-col justify-between gap-4 md:flex-row">

              <div>
                <h3 className="text-4xl font-bold flex items-center gap-3">
                  💼 HR Assistant
                </h3>

                <p className="mt-2 text-lg font-medium text-blue-400">
                  Al Muhaidib National
                </p>

                <p className="text-sm text-gray-500">
                  Dammam, Saudi Arabia
                </p>
              </div>

              <span className="h-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                2026 – Present
              </span>

            </div>

            <ul className="mt-6 space-y-3 text-gray-400">

              <li>✔ Managed Microsoft 365 administration.</li>

              <li>✔ Managed employee records using Odoo ERP.</li>

              <li>✔ Processed Qiwa, Muqeem and Absher services.</li>

              <li>✔ Managed employee insurance and HR documentation.</li>

            </ul>

          </div>

          {/* Zamil */}
          <div className="rounded-3xl border border-blue-500/20 bg-zinc-900 p-6 transition-all duration-300 hover:border-blue-500 hover:-translate-y-1">

            <div className="flex flex-col justify-between gap-4 md:flex-row">

              <div>
                <h3 className="text-4xl font-bold flex items-center gap-3">
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

            <ul className="mt-6 space-y-3 text-gray-400">

              <li>✔ Managed Active Directory users, groups and permissions.</li>

              <li>✔ Supported Microsoft 365 administration and user accounts.</li>

              <li>✔ Installed and configured Windows workstations.</li>

              <li>✔ Diagnosed and resolved hardware, software and network issues.</li>

              <li>✔ Documented IT procedures and technical support workflows.</li>

            </ul>

            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">

              <h4 className="mb-2 text-lg font-semibold text-white">
                💡 Real Business Challenge
              </h4>

              <p className="leading-7 text-gray-300">
                During my internship at <strong>Zamil Plastic Industries</strong>,
                I identified an asset tracking challenge that inspired me to
                design and build the
                <span className="font-semibold text-white">
                  {" "}Enterprise IT Asset Management System
                </span>,
                now showcased as the flagship project in this portfolio.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}