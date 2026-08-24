type KPICardProps = {
  title: string;
  value: number | string;
  color?: string;
  subtitle?: string;
};

export default function KPICard({
  title,
  value,
  color = "text-blue-400",
  subtitle,
}: KPICardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-blue-500/40">
      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h2 className={`mt-4 text-5xl font-bold ${color}`}>
        {value}
      </h2>

      {subtitle && (
        <p className="mt-3 text-sm text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}