export default function About() {
  return (
    <section
      id="about"
      className="bg-zinc-950 px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          ABOUT ME
        </p>

        <h2 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
          Bridging business operations with practical technology solutions
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-8 text-gray-300">
              I am an Information Systems graduate with practical experience
              across IT support, enterprise systems, and business operations.
            </p>

            <p className="mt-6 leading-8 text-gray-400">
              My background combines technical knowledge with a strong
              understanding of organizational processes. I have hands-on
              experience with Active Directory, Microsoft 365, Windows
              environments, IT troubleshooting, Odoo ERP, and enterprise
              business platforms.
            </p>

            <p className="mt-6 leading-8 text-gray-400">
              I enjoy identifying operational challenges, analyzing how
              processes work, and transforming business needs into structured
              digital solutions that improve efficiency, visibility, and user
              experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm uppercase tracking-widest text-gray-500">
                Degree
              </p>

              <p className="mt-3 text-xl font-semibold">
                BSc Information Systems
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm uppercase tracking-widest text-gray-500">
                Focus
              </p>

              <p className="mt-3 text-xl font-semibold">
                Enterprise IT Systems
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm uppercase tracking-widest text-gray-500">
                Location
              </p>

              <p className="mt-3 text-xl font-semibold">
                Dammam, Saudi Arabia
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
              <p className="text-sm uppercase tracking-widest text-gray-500">
                Career Focus
              </p>

              <p className="mt-3 text-xl font-semibold">
                IT Systems &amp; Support
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
