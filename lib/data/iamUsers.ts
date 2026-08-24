export type IamUserStatus =
  | "Active"
  | "Locked"
  | "Disabled"
  | "Pending";

export type MfaStatus =
  | "Enabled"
  | "Disabled"
  | "Required";

export type IamUser = {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  username: string;
  department: string;
  jobTitle: string;
  manager: string;
  role: string;
  status: IamUserStatus;
  mfaStatus: MfaStatus;
  lastLogin: string;
  passwordExpiry: string;
  createdAt: string;
};

export const defaultIamUsers: IamUser[] = [
  {
    id: "USR-1001",
    employeeId: "EMP-001",
    fullName: "Shahad AlGhamdi",
    email: "shahad.alghamdi@enterprise.com",
    username: "shahad.alghamdi",
    department: "Information Technology",
    jobTitle: "IT Administrator",
    manager: "Head of IT",
    role: "IT Admin",
    status: "Active",
    mfaStatus: "Enabled",
    lastLogin: "2026-08-04T12:45:00.000Z",
    passwordExpiry: "2026-10-15T00:00:00.000Z",
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "USR-1002",
    employeeId: "EMP-002",
    fullName: "Sarah Hassan",
    email: "sarah.hassan@enterprise.com",
    username: "sarah.hassan",
    department: "Human Resources",
    jobTitle: "HR Specialist",
    manager: "HR Manager",
    role: "HR User",
    status: "Active",
    mfaStatus: "Disabled",
    lastLogin: "2026-08-04T11:20:00.000Z",
    passwordExpiry: "2026-09-28T00:00:00.000Z",
    createdAt: "2026-02-02T08:00:00.000Z",
  },
  {
    id: "USR-1003",
    employeeId: "EMP-003",
    fullName: "Mohammed Saleh",
    email: "m.saleh@enterprise.com",
    username: "mohammed.saleh",
    department: "Information Technology",
    jobTitle: "IT Support Specialist",
    manager: "Shahad AlGhamdi",
    role: "IT Support",
    status: "Disabled",
    mfaStatus: "Disabled",
    lastLogin: "2026-08-04T10:05:00.000Z",
    passwordExpiry: "2026-09-20T00:00:00.000Z",
    createdAt: "2026-02-15T08:00:00.000Z",
  },
  {
    id: "USR-1004",
    employeeId: "EMP-004",
    fullName: "Mona AlOtaibi",
    email: "mona.alotaibi@enterprise.com",
    username: "mona.alotaibi",
    department: "Operations",
    jobTitle: "Operations Coordinator",
    manager: "Khalid Nasser",
    role: "Employee",
    status: "Locked",
    mfaStatus: "Required",
    lastLogin: "2026-08-03T07:40:00.000Z",
    passwordExpiry: "2026-08-10T00:00:00.000Z",
    createdAt: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "USR-1005",
    employeeId: "EMP-005",
    fullName: "Fahad AlQahtani",
    email: "fahad.alqahtani@enterprise.com",
    username: "fahad.alqahtani",
    department: "Administration",
    jobTitle: "Administrative Assistant",
    manager: "Reem Abdullah",
    role: "Employee",
    status: "Active",
    mfaStatus: "Disabled",
    lastLogin: "2026-08-04T08:15:00.000Z",
    passwordExpiry: "2026-08-18T00:00:00.000Z",
    createdAt: "2026-03-10T08:00:00.000Z",
  },
  {
    id: "USR-1006",
    employeeId: "EMP-006",
    fullName: "Noor Ali",
    email: "noor.ali@enterprise.com",
    username: "noor.ali",
    department: "Finance",
    jobTitle: "Finance Analyst",
    manager: "Abdullah Saeed",
    role: "Employee",
    status: "Disabled",
    mfaStatus: "Disabled",
    lastLogin: "2026-07-22T09:30:00.000Z",
    passwordExpiry: "2026-07-30T00:00:00.000Z",
    createdAt: "2026-04-05T08:00:00.000Z",
  },
  {
    id: "USR-1007",
    employeeId: "EMP-007",
    fullName: "Reem Abdullah",
    email: "reem.abdullah@enterprise.com",
    username: "reem.abdullah",
    department: "Human Resources",
    jobTitle: "HR Specialist",
    manager: "HR Manager",
    role: "HR User",
    status: "Active",
    mfaStatus: "Enabled",
    lastLogin: "2026-08-04T09:10:00.000Z",
    passwordExpiry: "2026-10-02T00:00:00.000Z",
    createdAt: "2026-04-20T08:00:00.000Z",
  },
  {
    id: "USR-1008",
    employeeId: "EMP-008",
    fullName: "Ahmed AlHarbi",
    email: "ahmed.alharbi@enterprise.com",
    username: "ahmed.alharbi",
    department: "Information Technology",
    jobTitle: "Network Technician",
    manager: "Shahad AlGhamdi",
    role: "Network Support",
    status: "Pending",
    mfaStatus: "Required",
    lastLogin: "",
    passwordExpiry: "2026-08-25T00:00:00.000Z",
    createdAt: "2026-08-03T08:00:00.000Z",
  },
  {
    id: "USR-1009",
    employeeId: "EMP-009",
    fullName: "Noura Alqahtani",
    email: "noura.alqahtani@enterprise.com",
    username: "noura.alqahtani",
    department: "Information Technology",
    jobTitle: "Business Analyst",
    manager: "Shahad AlGhamdi",
    role: "Employee",
    status: "Active",
    mfaStatus: "Enabled",
    lastLogin: "2026-08-04T08:00:00.000Z",
    passwordExpiry: "2026-10-20T00:00:00.000Z",
    createdAt: "2026-05-01T08:00:00.000Z",
  },
];
