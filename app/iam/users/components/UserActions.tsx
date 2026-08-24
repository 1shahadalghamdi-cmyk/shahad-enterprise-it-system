import Link from "next/link";

type Props = {
  userId: string;
};

export default function UserActions({
  userId,
}: Props) {
  return (
    <div className="flex gap-2">

      <Link
        href={`/iam/users/${userId}`}
        className="rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
      >
        View
      </Link>

      <Link
        href={`/iam/users/${userId}/edit`}
        className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/10"
      >
        Edit
      </Link>

    </div>
  );
}