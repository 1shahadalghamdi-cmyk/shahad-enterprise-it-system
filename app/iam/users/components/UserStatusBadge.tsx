import { IamUserStatus } from "@/lib/data/iamUsers";

type Props = {
  status: IamUserStatus;
};

export default function UserStatusBadge({
  status,
}: Props) {
  const styles: Record<IamUserStatus, string> = {
    Active:
      "border-green-500/30 bg-green-500/10 text-green-400",

    Locked:
      "border-red-500/30 bg-red-500/10 text-red-400",

    Disabled:
      "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",

    Pending:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}