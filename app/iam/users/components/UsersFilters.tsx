type UsersFiltersProps = {
  search: string;
  status: string;
  department: string;
  role: string;

  departments: string[];
  roles: string[];

  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: string) => void;
};

export default function UsersFilters({
  search,
  status,
  department,
  role,

  departments,
  roles,

  onSearchChange,
  onStatusChange,
  onDepartmentChange,
  onRoleChange,
}: UsersFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) =>
          onSearchChange(e.target.value)
        }
        className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-blue-500"
      />

      <select
        value={status}
        onChange={(e) =>
          onStatusChange(e.target.value)
        }
        className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
      >
        <option>All</option>
        <option>Active</option>
        <option>Locked</option>
        <option>Disabled</option>
        <option>Pending</option>
      </select>

      <select
        value={department}
        onChange={(e) =>
          onDepartmentChange(e.target.value)
        }
        className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
      >
        <option>All Departments</option>

        {departments.map((item) => (
          <option key={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={role}
        onChange={(e) =>
          onRoleChange(e.target.value)
        }
        className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
      >
        <option>All Roles</option>

        {roles.map((item) => (
          <option key={item}>
            {item}
          </option>
        ))}
      </select>

    </div>
  );
}