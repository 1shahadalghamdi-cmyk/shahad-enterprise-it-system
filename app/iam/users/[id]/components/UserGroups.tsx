export default function UserGroups() {
  const groups = [
    {
      name: "IT Administrators",
      type: "Security Group",
      description: "Full administrative access",
    },
    {
      name: "Microsoft 365",
      type: "Cloud Group",
      description: "Exchange, Teams and OneDrive",
    },
    {
      name: "VPN Users",
      type: "Security Group",
      description: "Remote network access",
    },
    {
      name: "Helpdesk Operators",
      type: "Role Group",
      description: "Incident Management permissions",
    },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <h2 className="text-2xl font-bold">
        Group Membership
      </h2>

      <p className="mt-2 text-gray-400">
        Active Directory and Microsoft 365 groups assigned to this user.
      </p>

      <div className="mt-6 space-y-4">
        {groups.map((group) => (
          <div
            key={group.name}
            className="rounded-xl border border-white/10 bg-zinc-950 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {group.name}
              </h3>

              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                {group.type}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-400">
              {group.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}