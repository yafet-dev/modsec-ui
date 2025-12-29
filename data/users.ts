export type UserRole = "admin" | "viewer";
export type UserStatus = "active" | "disabled" | "pending";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  invitedAt: string;
  invitedBy: string;
}

export const initialUsers: User[] = [
  {
    id: "user-1",
    email: "admin@example.com",
    name: "John Doe",
    role: "admin",
    status: "active",
    lastLogin: "2025-12-15T10:30:00",
    invitedAt: "2024-01-15T08:00:00",
    invitedBy: "system",
  },
  {
    id: "user-2",
    email: "sarah@example.com",
    name: "Sarah Smith",
    role: "admin",
    status: "active",
    lastLogin: "2025-12-15T09:15:00",
    invitedAt: "2024-02-20T10:00:00",
    invitedBy: "admin@example.com",
  },
  {
    id: "user-3",
    email: "mike@example.com",
    name: "Mike Johnson",
    role: "viewer",
    status: "active",
    lastLogin: "2025-12-14T16:45:00",
    invitedAt: "2024-03-10T14:00:00",
    invitedBy: "admin@example.com",
  },
  {
    id: "user-4",
    email: "emily@example.com",
    name: "Emily Brown",
    role: "viewer",
    status: "active",
    lastLogin: "2025-12-15T11:20:00",
    invitedAt: "2024-04-05T09:00:00",
    invitedBy: "sarah@example.com",
  },
  {
    id: "user-5",
    email: "david@example.com",
    name: "David Wilson",
    role: "viewer",
    status: "pending",
    lastLogin: null,
    invitedAt: "2025-12-10T15:30:00",
    invitedBy: "admin@example.com",
  },
  {
    id: "user-6",
    email: "lisa@example.com",
    name: "Lisa Anderson",
    role: "viewer",
    status: "disabled",
    lastLogin: "2025-11-20T14:00:00",
    invitedAt: "2024-05-15T11:00:00",
    invitedBy: "sarah@example.com",
  },
];

export function getAdminCount(users: User[]): number {
  return users.filter((u) => u.role === "admin" && u.status !== "disabled").length;
}

export function canAddAdmin(users: User[]): boolean {
  return getAdminCount(users) < 3;
}

export function formatLastLogin(lastLogin: string | null): string {
  if (!lastLogin) return "Never";
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

