const achievements = [
  {
    number: "6+",
    title: "Enterprise Projects",
    description: "Designed and developed enterprise-focused portfolio projects.",
  },
  {
    number: "2",
    title: "Professional Experience",
    description: "Experience across IT Support and HR Operations.",
  },
  {
    number: "12+",
    title: "Technical Skills",
    description: "Microsoft 365, Active Directory, SQL, Networking and more.",
  },
  {
    number: "1000+",
    title: "Employees Supported",
    description: "Supported HR operations and employee services at scale.",
  },
];

export default function Achievements() {
  return (
    <section
      id="achievements"
      className="bg-black px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-6xl">

        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          ACHIEVEMENTS
        </p>

        <h2 className="mb-12 text-5xl font-bold">
          Career Highlights
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {achievements.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-zinc-900 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500"
            >
              <h3 className="text-5xl font-bold text-blue-500">
                {item.number}
              </h3>

              <h4 className="mt-5 text-xl font-semibold">
                {item.title}
              </h4>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                {item.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}