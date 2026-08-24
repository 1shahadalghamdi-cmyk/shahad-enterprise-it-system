type SecurityEvent = {
  id: string;
  title: string;
  description: string;
  actor: string;
  createdAt: string;
  type:
    | "Login"
    | "Password"
    | "MFA"
    | "Account"
    | "Permission";
};

const securityEvents: SecurityEvent[] = [
  {
    id: "SEC-1001",
    title: "Successful login",
    description:
      "User signed in successfully from a trusted company device.",
    actor: "System",
    createdAt: "Aug 4, 2026, 12:45 PM",
    type: "Login",
  },
  {
    id: "SEC-1002",
    title: "MFA verification completed",
    description:
      "Multi-factor authentication challenge was completed successfully.",
    actor: "Shahad AlGhamdi",
    createdAt: "Aug 4, 2026, 12:44 PM",
    type: "MFA",
  },
  {
    id: "SEC-1003",
    title: "Password changed",
    description:
      "The account password was updated according to the enterprise password policy.",
    actor: "Shahad AlGhamdi",
    createdAt: "Jul 28, 2026, 9:15 AM",
    type: "Password",
  },
  {
    id: "SEC-1004",
    title: "Role assigned",
    description:
      "IT Admin role was assigned to the user account.",
    actor: "Head of IT",
    createdAt: "Jul 20, 2026, 3:30 PM",
    type: "Permission",
  },
  {
    id: "SEC-1005",
    title: "Account created",
    description:
      "The enterprise identity record was provisioned and activated.",
    actor: "System Administrator",
    createdAt: "Jan 10, 2026, 8:00 AM",
    type: "Account",
  },
];

export default function SecurityTimeline() {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
          Identity Audit
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Security Timeline
        </h2>

        <p className="mt-2 text-gray-400">
          Recent authentication, account, password, and
          permission activity.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {securityEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-white/10 bg-zinc-950 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg ${getTypeClasses(
                    event.type,
                  )}`}
                >
                  {getTypeIcon(event.type)}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold">
                      {event.title}
                    </h3>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTypeClasses(
                        event.type,
                      )}`}
                    >
                      {event.type}
                    </span>
                  </div>

                  <p className="mt-3 leading-7 text-gray-400">
                    {event.description}
                  </p>

                  <p className="mt-3 text-xs text-gray-600">
                    Performed by {event.actor}
                  </p>
                </div>
              </div>

              <p className="shrink-0 text-xs text-gray-500">
                {event.createdAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getTypeIcon(
  type: SecurityEvent["type"],
) {
  const icons: Record<
    SecurityEvent["type"],
    string
  > = {
    Login: "🔐",
    Password: "🔑",
    MFA: "🛡️",
    Account: "👤",
    Permission: "✅",
  };

  return icons[type];
}

function getTypeClasses(
  type: SecurityEvent["type"],
) {
  const classes: Record<
    SecurityEvent["type"],
    string
  > = {
    Login:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Password:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    MFA:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    Account:
      "border-green-500/30 bg-green-500/10 text-green-400",
    Permission:
      "border-purple-500/30 bg-purple-500/10 text-purple-400",
  };

  return classes[type];
}