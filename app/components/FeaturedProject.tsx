export default function FeaturedProject() {
  return (
    <section className="bg-black px-8 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="uppercase tracking-[0.3em] text-blue-500">
          FEATURED PROJECT
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-blue-500/20 bg-zinc-950">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 md:p-12">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Enterprise Case Study
              </p>

              <h2 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
                Enterprise IT Asset Management System
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-gray-200">
                Solving real IT asset tracking challenges
              </h3>

              <p className="mt-5 max-w-xl leading-8 text-gray-400">
                Inspired by a real operational challenge observed during my IT
                internship at Zamil Plastic Industries. The system centralizes
                asset records, employee assignments, maintenance activities and
                lifecycle status.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {["SQL", "Next.js", "React", "Tailwind CSS"].map(
                  (technology) => (
                    <span
                      key={technology}
                      className="rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-gray-300"
                    >
                      {technology}
                    </span>
                  ),
                )}
              </div>

              <a
                href="/projects/asset-management"
                className="mt-10 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                View Case Study →
              </a>
            </div>

            <div className="flex min-h-[420px] items-center justify-center border-t border-white/10 bg-gradient-to-br from-blue-500/10 via-zinc-900 to-black p-8 lg:border-l lg:border-t-0">
              <div className="w-full rounded-2xl border border-white/10 bg-black p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Enterprise IT Operations
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      Asset Dashboard
                    </p>
                  </div>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    Active
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                    <p className="text-xs text-gray-500">
                      Total Assets
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      128
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                    <p className="text-xs text-gray-500">
                      Assigned
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      94
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                    <p className="text-xs text-gray-500">
                      Maintenance
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      12
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
                    <p className="text-xs text-gray-500">
                      Available
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      22
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <p className="text-sm font-semibold">
                    Recent Asset
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">
                        Dell Latitude 7420
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        AST-00128
                      </p>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      Assigned
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}