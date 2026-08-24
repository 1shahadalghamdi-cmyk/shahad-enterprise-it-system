import type { IamUser } from "@/lib/data/iamUsers";

type UserInfoProps = {
  user: IamUser;
};

function formatDate(value: string) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function UserInfo({
  user,
}: UserInfoProps) {
  const details = [
    ["User ID", user.id],
    ["Employee ID", user.employeeId],
    ["Username", user.username],
    ["Email", user.email],
    ["Department", user.department],
    ["Job Title", user.jobTitle],
    ["Manager", user.manager],
    ["Role", user.role],
    ["Last Login", formatDate(user.lastLogin)],
    [
      "Password Expiry",
      formatDate(user.passwordExpiry),
    ],
    ["Created At", formatDate(user.createdAt)],
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Directory Information
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          User Information
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-zinc-950 p-4"
          >
            <p className="text-xs uppercase tracking-wider text-gray-600">
              {label}
            </p>

            <p className="mt-2 break-words font-medium text-gray-200">
              {value || "Not Assigned"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}