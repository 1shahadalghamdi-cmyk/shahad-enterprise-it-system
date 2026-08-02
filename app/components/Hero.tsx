export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Blue glow */}
      <div className="absolute top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-[120px]" />

      {/* Content */}
      <div className="relative z-10">
        <p className="mb-4 text-sm uppercase tracking-[0.5em] text-blue-400">
          Information Systems Graduate
        </p>

        <h1 className="text-6xl font-extrabold md:text-8xl">
          Shahad
        </h1>

        <h2 className="mt-2 text-6xl font-extrabold text-blue-500 md:text-8xl">
          AlGhamdi
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-400">
          Building enterprise IT solutions, infrastructure systems,
          dashboards, databases, and modern business applications.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#projects"
            className="rounded-full bg-blue-600 px-8 py-4 font-semibold transition hover:-translate-y-1 hover:bg-blue-500"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="rounded-full border border-white/30 px-8 py-4 transition hover:-translate-y-1 hover:bg-white hover:text-black"
          >
            Contact
          </a>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-3 text-sm text-gray-400">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Microsoft 365
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Active Directory
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            SQL
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            IT Infrastructure
          </span>
        </div>
      </div>
    </section>
  );
}