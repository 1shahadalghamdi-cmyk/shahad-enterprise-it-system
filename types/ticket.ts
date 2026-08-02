export type TicketStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting for User"
  | "Resolved"
  | "Closed";

export type TicketPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

export type Ticket = {
  id: string;
  title: string;
  description?: string;
  employeeId?: string;
  employeeName: string;
  assetId: string;
  assetName?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt?: string;
};