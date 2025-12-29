export interface Host {
  id: string;
  name: string;
  domain: string;
}

export const hostsData: Host[] = [
  { id: "all", name: "All Hosts", domain: "all" },
  { id: "api", name: "API Server", domain: "api.example.com" },
  { id: "www", name: "Main Website", domain: "www.example.com" },
  { id: "admin", name: "Admin Panel", domain: "admin.example.com" },
  { id: "files", name: "File Server", domain: "files.example.com" },
  { id: "cdn", name: "CDN", domain: "cdn.example.com" },
];

export function getHostById(id: string): Host | undefined {
  return hostsData.find((h) => h.id === id);
}

