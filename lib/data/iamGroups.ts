export type IamGroupType =
  | "Security Group"
  | "Cloud Group"
  | "Role Group";

export type IamGroup = {
  id: string;
  name: string;
  type: IamGroupType;
  description: string;
  department: string;
  memberIds: string[];
  createdAt: string;
};

export const defaultIamGroups: IamGroup[] = [
  {
    id: "GRP-001",
    name: "IT Administrators",
    type: "Security Group",
    description: "Full administrative privileges.",
    department: "Information Technology",
    memberIds: [
      "USR-1001", // Shahad AlGhamdi
      "USR-1002", // Sarah Hassan
      "USR-1003", // Mohammed Saleh
    ],
    createdAt: "2026-01-10T08:00:00.000Z",
  },

  {
    id: "GRP-002",
    name: "Microsoft 365",
    type: "Cloud Group",
    description: "Exchange, Teams and OneDrive.",
    department: "All Departments",
    memberIds: [
      "USR-1001",
      "USR-1002",
      "USR-1003",
      "USR-1004",
      "USR-1005",
      "USR-1006",
      "USR-1007",
      "USR-1008",
      "USR-1009",
    ],
    createdAt: "2026-01-15T08:00:00.000Z",
  },

  {
    id: "GRP-003",
    name: "VPN Users",
    type: "Security Group",
    description: "Remote network access.",
    department: "All Departments",
    memberIds: [
      "USR-1001",
      "USR-1002",
      "USR-1003",
      "USR-1007",
    ],
    createdAt: "2026-02-01T08:00:00.000Z",
  },

  {
    id: "GRP-004",
    name: "Helpdesk Operators",
    type: "Role Group",
    description: "Incident management permissions.",
    department: "Information Technology",
    memberIds: [
      "USR-1001",
      "USR-1002",
      "USR-1003",
    ],
    createdAt: "2026-02-10T08:00:00.000Z",
  },
];
