export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-zinc-950 px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 uppercase tracking-[0.3em] text-blue-500">
          CONTACT
        </p>

        <h2 className="max-w-3xl text-5xl font-bold leading-tight">
          Let&apos;s Connect
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
          Interested in opportunities across IT Systems, IT Support,
          enterprise technology, and business applications.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Email */}
          <a
            href="mailto:1shahadalghamdi@gmail.com"
            className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Email
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              1shahadalghamdi@gmail.com
            </p>
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/1shahadalghamdi"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <p className="text-sm uppercase tracking-widest text-gray-500">
              LinkedIn
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              linkedin.com/in/1shahadalghamdi
            </p>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/1shahadalghamdi-cmyk"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-blue-500"
          >
            <p className="text-sm uppercase tracking-widest text-gray-500">
              GitHub
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              1shahadalghamdi-cmyk
            </p>
          </a>

          {/* Location */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Location
            </p>

            <p className="mt-3 text-lg font-semibold text-white">
              Dammam, Saudi Arabia
            </p>
          </div>

          {/* Saudi Phone */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Saudi Arabia
            </p>

            <a
              href="tel:+966566336076"
              className="mt-3 block text-lg font-semibold text-white transition hover:text-blue-400"
            >
              +966 56 633 6076
            </a>

            <a
              href="https://wa.me/966566336076"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-green-400 transition hover:text-green-300"
            >
              WhatsApp →
            </a>
          </div>

          {/* Bahrain Phone */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Bahrain
            </p>

            <a
              href="tel:+97332052002"
              className="mt-3 block text-lg font-semibold text-white transition hover:text-blue-400"
            >
              +973 3205 2002
            </a>

            <a
              href="https://wa.me/97332052002"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-medium text-green-400 transition hover:text-green-300"
            >
              WhatsApp →
            </a>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-sm text-gray-500">
          © 2026 Shahad Alghamdi
        </div>
      </div>
    </section>
  );
}
