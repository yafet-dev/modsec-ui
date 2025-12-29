import { type User, type UserRole } from "./users";

// Legacy interface for backward compatibility
// Use the one from lib/api/organization.ts for new code
export interface Organization {
  id: string;
  name: string;
  domains: string[];
  createdAt: string;
  createdBy?: string; // Optional for API response
  adminEmail?: string; // Optional - can be derived from members
  ownerEmail?: string | null; // From API
  adminInvited?: boolean; // Can be derived from members
  adminAccepted?: boolean; // Can be derived from members status
  status: "active" | "pending" | "suspended" | "disabled";
  members?: Array<{
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    status: "pending" | "verified";
    user?: {
      id: string;
      email: string;
      fullName: string | null;
    };
  }>;
}

export interface OrganizationUser extends User {
  organizationId: string;
  hosts: string[]; // Host IDs
}

export const initialOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Acme Corporation",
    domains: ["acme.com", "www.acme.com", "api.acme.com"],
    createdAt: "2024-01-15T08:00:00",
    createdBy: "owner@example.com",
    adminEmail: "admin@acme.com",
    adminInvited: true,
    adminAccepted: true,
    status: "active",
  },
  {
    id: "org-2",
    name: "TechStart Inc",
    domains: ["techstart.io"],
    createdAt: "2024-02-20T10:00:00",
    createdBy: "owner@example.com",
    adminEmail: "admin@techstart.io",
    adminInvited: true,
    adminAccepted: false,
    status: "pending",
  },
  {
    id: "org-3",
    name: "Global Services",
    domains: ["globalservices.com", "www.globalservices.com"],
    createdAt: "2024-03-10T14:00:00",
    createdBy: "owner@example.com",
    adminEmail: "admin@globalservices.com",
    adminInvited: true,
    adminAccepted: true,
    status: "active",
  },
];

// Organization users (scoped to organizations)
export const organizationUsers: OrganizationUser[] = [
  {
    id: "org-user-1",
    email: "admin@acme.com",
    name: "Alice Admin",
    role: "admin",
    status: "active",
    lastLogin: "2025-12-15T10:30:00",
    invitedAt: "2024-01-15T08:00:00",
    invitedBy: "owner@example.com",
    organizationId: "org-1",
    hosts: ["api", "www"],
  },
  {
    id: "org-user-2",
    email: "viewer@acme.com",
    name: "Bob Viewer",
    role: "viewer",
    status: "active",
    lastLogin: "2025-12-14T16:45:00",
    invitedAt: "2024-01-20T10:00:00",
    invitedBy: "admin@acme.com",
    organizationId: "org-1",
    hosts: ["www"],
  },
  {
    id: "org-user-3",
    email: "admin@techstart.io",
    name: "Charlie Admin",
    role: "admin",
    status: "pending",
    lastLogin: null,
    invitedAt: "2024-02-20T10:00:00",
    invitedBy: "owner@example.com",
    organizationId: "org-2",
    hosts: [],
  },
  {
    id: "org-user-4",
    email: "admin@globalservices.com",
    name: "Diana Admin",
    role: "admin",
    status: "active",
    lastLogin: "2025-12-15T09:15:00",
    invitedAt: "2024-03-10T14:00:00",
    invitedBy: "owner@example.com",
    organizationId: "org-3",
    hosts: ["api", "admin", "files"],
  },
];
