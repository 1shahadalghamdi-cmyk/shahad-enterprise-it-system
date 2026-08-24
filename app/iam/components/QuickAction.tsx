import Link from "next/link";

type QuickActionProps = {
  title: string;
  href: string;
};

export default function QuickAction({
  title,
  href,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900 p-5 font-semibold transition hover:border-blue-500 hover:bg-zinc-800"
    >
      {title}
    </Link>
  );
}