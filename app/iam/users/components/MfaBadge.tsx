import { MfaStatus } from "@/lib/data/iamUsers";

type Props = {
  status: MfaStatus;
};

export default function MfaBadge({
  status,
}: Props) {
  const styles: Record<MfaStatus, string> = {
    Enabled:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",

    Required:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",

    Disabled:
      "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}