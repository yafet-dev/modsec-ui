// Host-specific dashboard data

export interface HostStats {
  totalRequests: string;
  blockedAttacks: string;
  threatLevel: string;
  activeRules: string;
  requestsChange: number;
  attacksChange: number;
  threatChange: number;
  rulesChange: number;
}

export interface RecentActivity {
  time: string;
  event: string;
  ip: string;
  severity: "high" | "medium" | "low" | "critical";
}

// Different stats for each host
// Total across all hosts: ~10,000 requests over 30 months (realistic for small site)
const hostStatsData: Record<string, HostStats> = {
  all: {
    totalRequests: "10,000",
    blockedAttacks: "247",
    threatLevel: "Low",
    activeRules: "45",
    requestsChange: 5,
    attacksChange: -3,
    threatChange: 0,
    rulesChange: 2,
  },
  api: {
    totalRequests: "3,200",
    blockedAttacks: "128",
    threatLevel: "Medium",
    activeRules: "28",
    requestsChange: 8,
    attacksChange: 5,
    threatChange: 2,
    rulesChange: 1,
  },
  www: {
    totalRequests: "4,500",
    blockedAttacks: "67",
    threatLevel: "Low",
    activeRules: "35",
    requestsChange: 3,
    attacksChange: -5,
    threatChange: -2,
    rulesChange: 1,
  },
  admin: {
    totalRequests: "1,200",
    blockedAttacks: "38",
    threatLevel: "Medium",
    activeRules: "42",
    requestsChange: -2,
    attacksChange: 8,
    threatChange: 5,
    rulesChange: 3,
  },
  files: {
    totalRequests: "800",
    blockedAttacks: "12",
    threatLevel: "Low",
    activeRules: "18",
    requestsChange: 4,
    attacksChange: 1,
    threatChange: 0,
    rulesChange: 0,
  },
  cdn: {
    totalRequests: "300",
    blockedAttacks: "2",
    threatLevel: "Low",
    activeRules: "12",
    requestsChange: 6,
    attacksChange: -1,
    threatChange: -1,
    rulesChange: 0,
  },
};

// Different recent activity for each host
const hostActivityData: Record<string, RecentActivity[]> = {
  all: [
    { time: "2 minutes ago", event: "Blocked SQL injection attempt", ip: "192.168.1.100", severity: "high" },
    { time: "15 minutes ago", event: "XSS attack detected", ip: "10.0.0.45", severity: "high" },
    { time: "1 hour ago", event: "Rate limit exceeded", ip: "172.16.0.23", severity: "medium" },
    { time: "2 hours ago", event: "Suspicious file upload blocked", ip: "203.0.113.42", severity: "high" },
    { time: "3 hours ago", event: "Unauthorized access attempt", ip: "198.51.100.15", severity: "medium" },
  ],
  api: [
    { time: "1 minute ago", event: "NoSQL injection blocked", ip: "45.33.32.156", severity: "critical" },
    { time: "5 minutes ago", event: "API rate limit exceeded", ip: "104.248.50.87", severity: "medium" },
    { time: "12 minutes ago", event: "Invalid JWT token detected", ip: "167.99.209.184", severity: "high" },
    { time: "30 minutes ago", event: "GraphQL introspection blocked", ip: "159.65.140.3", severity: "low" },
    { time: "1 hour ago", event: "Brute force attempt on /api/login", ip: "185.220.101.34", severity: "high" },
  ],
  www: [
    { time: "5 minutes ago", event: "XSS payload in search query", ip: "91.189.88.152", severity: "high" },
    { time: "20 minutes ago", event: "Bot scraping detected", ip: "77.88.55.70", severity: "medium" },
    { time: "45 minutes ago", event: "Spam form submission", ip: "165.22.98.17", severity: "low" },
    { time: "2 hours ago", event: "WordPress scanner blocked", ip: "77.88.55.70", severity: "medium" },
    { time: "4 hours ago", event: "Cookie tampering attempt", ip: "134.209.29.73", severity: "medium" },
  ],
  admin: [
    { time: "30 seconds ago", event: "Failed admin login attempt", ip: "185.220.101.34", severity: "critical" },
    { time: "2 minutes ago", event: "Config file access blocked", ip: "51.15.127.45", severity: "critical" },
    { time: "8 minutes ago", event: "phpMyAdmin scanner detected", ip: "209.141.55.26", severity: "high" },
    { time: "15 minutes ago", event: "Directory traversal attempt", ip: "203.0.113.42", severity: "high" },
    { time: "1 hour ago", event: "Suspicious IP from threat list", ip: "62.210.202.63", severity: "critical" },
  ],
  files: [
    { time: "10 minutes ago", event: "Malicious file upload blocked", ip: "45.33.32.156", severity: "high" },
    { time: "30 minutes ago", event: "Path traversal in filename", ip: "203.0.113.42", severity: "high" },
    { time: "1 hour ago", event: "Oversized file rejected", ip: "138.68.79.95", severity: "low" },
    { time: "3 hours ago", event: "Invalid MIME type detected", ip: "88.198.56.78", severity: "medium" },
    { time: "5 hours ago", event: "Executable file blocked", ip: "178.128.87.134", severity: "high" },
  ],
  cdn: [
    { time: "1 hour ago", event: "Cache poisoning attempt", ip: "104.248.50.87", severity: "medium" },
    { time: "4 hours ago", event: "Hotlinking blocked", ip: "45.76.134.89", severity: "low" },
    { time: "8 hours ago", event: "DDoS pattern detected", ip: "68.183.47.156", severity: "high" },
    { time: "12 hours ago", event: "Invalid range request", ip: "157.245.123.89", severity: "low" },
    { time: "1 day ago", event: "Suspicious user agent", ip: "134.209.29.73", severity: "low" },
  ],
};

// Attack origins data per host (different countries)
// Scaled down to match realistic small site traffic
export const hostAttackOrigins: Record<string, Array<{
  country: string;
  lat: number;
  lng: number;
  count: number;
  severity: "high" | "medium" | "low";
}>> = {
  all: [
    { country: "China", lat: 35.8617, lng: 104.1954, count: 89, severity: "high" },
    { country: "Russia", lat: 61.524, lng: 105.3188, count: 64, severity: "high" },
    { country: "United States", lat: 39.8283, lng: -98.5795, count: 41, severity: "medium" },
    { country: "Germany", lat: 51.1657, lng: 10.4515, count: 30, severity: "medium" },
    { country: "Brazil", lat: -14.235, lng: -51.9253, count: 23, severity: "low" },
    { country: "Ethiopia", lat: 9.145, lng: 38.7667, count: 18, severity: "medium" },
  ],
  api: [
    { country: "China", lat: 35.8617, lng: 104.1954, count: 45, severity: "high" },
    { country: "Vietnam", lat: 14.0583, lng: 108.2772, count: 32, severity: "high" },
    { country: "Indonesia", lat: -0.7893, lng: 113.9213, count: 28, severity: "medium" },
    { country: "India", lat: 20.5937, lng: 78.9629, count: 15, severity: "medium" },
    { country: "Thailand", lat: 15.87, lng: 100.9925, count: 8, severity: "low" },
  ],
  www: [
    { country: "Russia", lat: 61.524, lng: 105.3188, count: 28, severity: "high" },
    { country: "United States", lat: 39.8283, lng: -98.5795, count: 20, severity: "medium" },
    { country: "United Kingdom", lat: 55.3781, lng: -3.436, count: 12, severity: "low" },
    { country: "France", lat: 46.2276, lng: 2.2137, count: 5, severity: "low" },
    { country: "Germany", lat: 51.1657, lng: 10.4515, count: 2, severity: "low" },
  ],
  admin: [
    { country: "Russia", lat: 61.524, lng: 105.3188, count: 18, severity: "high" },
    { country: "China", lat: 35.8617, lng: 104.1954, count: 12, severity: "high" },
    { country: "Iran", lat: 32.4279, lng: 53.688, count: 5, severity: "high" },
    { country: "North Korea", lat: 40.3399, lng: 127.5101, count: 2, severity: "high" },
    { country: "Nigeria", lat: 9.082, lng: 8.6753, count: 1, severity: "medium" },
  ],
  files: [
    { country: "Brazil", lat: -14.235, lng: -51.9253, count: 6, severity: "medium" },
    { country: "Argentina", lat: -38.4161, lng: -63.6167, count: 4, severity: "low" },
    { country: "Mexico", lat: 23.6345, lng: -102.5528, count: 2, severity: "low" },
  ],
  cdn: [
    { country: "United States", lat: 39.8283, lng: -98.5795, count: 1, severity: "low" },
    { country: "Japan", lat: 36.2048, lng: 138.2529, count: 1, severity: "low" },
  ],
};

export function getStatsByHost(hostId: string): HostStats {
  return hostStatsData[hostId] || hostStatsData.all;
}

export function getRecentActivityByHost(hostId: string): RecentActivity[] {
  return hostActivityData[hostId] || hostActivityData.all;
}

export function getAttackOriginsByHost(hostId: string) {
  return hostAttackOrigins[hostId] || hostAttackOrigins.all;
}

