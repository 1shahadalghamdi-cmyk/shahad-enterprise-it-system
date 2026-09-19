const achievements = [
  {
    number: "6+",
    title: "Portfolio Projects",
    description:
      "A growing portfolio of completed systems, technical modules, prototypes, and upcoming projects.",
  },
  {
    number: "2",
    title: "Professional Roles",
    description:
      "Hands-on experience across IT Support and business operations.",
  },
  {
    number: "16",
    title: "Technical Skills",
    description:
      "Enterprise IT, systems administration, networking, data, support, and modern web technologies.",
  },
  {
    number: "1000+",
    title: "Employees Supported",
    description:
      "Supported large-scale employee services, records, insurance, and enterprise workflows.",
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
