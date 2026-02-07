import apiClient from "./client";

export interface DomainWAFStatus {
  domain: string;
  wafEnabled: boolean;
}

export interface OrganizationWAFStatus {
  organizationId: string;
  domains: DomainWAFStatus[];
}

export interface ToggleWAFRequest {
  domain: string;
  enabled: boolean;
}

export interface ToggleWAFResponse {
  domain: string;
  wafEnabled: boolean;
  message: string;
}

export interface BulkUpdateWAFRequest {
  domains: DomainWAFStatus[];
}

// Domain WAF API functions
export const domainWafApi = {
  /**
   * Get WAF status for all domains in an organization
   */
  getStatus: async (organizationId: string): Promise<OrganizationWAFStatus> => {
    const response = await apiClient.get<OrganizationWAFStatus>(
      `/organizations/${organizationId}/waf-status`
    );
    return response.data;
  },

  /**
   * Toggle WAF status for a specific domain
   */
  toggleDomain: async (
    organizationId: string,
    domain: string,
    enabled: boolean
  ): Promise<ToggleWAFResponse> => {
    const response = await apiClient.post<ToggleWAFResponse>(
      `/organizations/${organizationId}/waf-status/toggle`,
      {
        domain,
        enabled,
      }
    );
    return response.data;
  },

  /**
   * Bulk update WAF status for multiple domains
   */
  bulkUpdate: async (
    organizationId: string,
    domains: DomainWAFStatus[]
  ): Promise<OrganizationWAFStatus> => {
    const response = await apiClient.put<OrganizationWAFStatus>(
      `/organizations/${organizationId}/waf-status`,
      {
        domains,
      }
    );
    return response.data;
  },
};

