import Link from "next/link";

type Ticket = {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status:
    | "Open"
    | "Assigned"
    | "In Progress"
    | "Waiting for User";
  assignedTo: string;
};

const tickets: Ticket[] = [
  {
    id: "INC-1025",
    title: "Core switch is unreachable",
    priority: "Critical",
    status: "Open",
    assignedTo: "Sarah Hassan",
  },
  {
    id: "INC-1023",
    title: "Cisco phone handset has no audio",
    priority: "Medium",
    status: "Assigned",
    assignedTo: "Ali Nasser",
  },
  {
    id: "INC-1018",
    title: "Laptop camera is not detected",
    priority: "High",
    status: "In Progress",
    assignedTo: "Mohammed Saleh",
  },
];

export default function OpenTickets() {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Open Tickets
          </h2>

          <p className="mt-2 text-gray-400">
            Active helpdesk incidents linked to this user.
          </p>
        </div>

        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
          {tickets.length} Active
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/helpdesk/incidents/${ticket.id}`}
            className="block rounded-xl border border-white/10 bg-zinc-950 p-4 transition hover:border-blue-500/30 hover:bg-zinc-900"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-blue-400">
                  {ticket.id}
                </p>

                <h3 className="mt-2 font-semibold">
                  {ticket.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Assigned to {ticket.assignedTo}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <PriorityBadge
                  priority={ticket.priority}
                />

                <StatusBadge
                  status={ticket.status}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Ticket["priority"];
}) {
  const styles = {
    Critical:
      "border-red-500/30 bg-red-500/10 text-red-400",
    High:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    Medium:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    Low:
      "border-green-500/30 bg-green-500/10 text-green-400",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: Ticket["status"];
}) {
  const styles = {
    Open:
      "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Assigned:
      "border-purple-500/30 bg-purple-500/10 text-purple-400",
    "In Progress":
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    "Waiting for User":
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}