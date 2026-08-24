export type IamRole = {
  id: string;
  name: string;
  level: string;
  users: number;
};

export const defaultIamRoles: IamRole[] = [
  {
    id: "ROLE-001",
    name: "IT Admin",
    level: "Full Access",
    users: 2,
  },
  {
    id: "ROLE-002",
    name: "System Administrator",
    level: "Infrastructure",
    users: 2,
  },
  {
    id: "ROLE-003",
    name: "IT Support",
    level: "Service Desk",
    users: 7,
  },
  {
    id: "ROLE-004",
    name: "HR User",
    level: "Department",
    users: 6,
  },
  {
    id: "ROLE-005",
    name: "Employee",
    level: "Standard",
    users: 120,
  },
];