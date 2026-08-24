export type IamGroup = {
  id: string;
  name: string;
  description: string;
  department: string;
  members: number;
};

export const defaultIamGroups: IamGroup[] = [
  {
    id: "GRP-001",
    name: "IT Administrators",
    description: "Full administrative access to enterprise systems.",
    department: "Information Technology",
    members: 3,
  },
  {
    id: "GRP-002",
    name: "IT Support",
    description: "Handles incidents and service requests.",
    department: "Information Technology",
    members: 8,
  },
  {
    id: "GRP-003",
    name: "Human Resources",
    description: "HR systems and employee records.",
    department: "Human Resources",
    members: 6,
  },
  {
    id: "GRP-004",
    name: "Finance",
    description: "Financial systems access.",
    department: "Finance",
    members: 5,
  },
  {
    id: "GRP-005",
    name: "Operations",
    description: "Operations department users.",
    department: "Operations",
    members: 12,
  },
];