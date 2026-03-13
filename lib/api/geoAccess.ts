import apiClient from "./client";

export interface GeoAccessControl {
  id: string;
  organizationId: string;
  domain: string;
  mode: "allow-all" | "allow-only" | "ban-specific";
  allowedCountries: string[];
  deniedCountries: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationGeoAccess {
  organizationId: string;
  settings: GeoAccessControl[];
}

export interface SaveGeoAccessRequest {
  domain: string;
  mode: "allow-all" | "allow-only" | "ban-specific";
  allowedCountries?: string[];
  deniedCountries?: string[];
}

// Geo Access API functions
export const geoAccessApi = {
  /**
   * Get geo access control settings for all domains in an organization
   */
  getAll: async (organizationId: string): Promise<OrganizationGeoAccess> => {
    const response = await apiClient.get<OrganizationGeoAccess>(
      `/organizations/${organizationId}/geo-access`
    );
    return response.data;
  },

  /**
   * Get geo access control settings for a specific domain
   */
  getByDomain: async (
    organizationId: string,
    domain: string
  ): Promise<GeoAccessControl> => {
    const response = await apiClient.get<GeoAccessControl>(
      `/organizations/${organizationId}/geo-access/${domain}`
    );
    return response.data;
  },

  /**
   * Create or update geo access control settings
   */
  save: async (
    organizationId: string,
    data: SaveGeoAccessRequest
  ): Promise<GeoAccessControl> => {
    const response = await apiClient.post<GeoAccessControl>(
      `/organizations/${organizationId}/geo-access`,
      data
    );
    return response.data;
  },

  /**
   * Delete geo access control settings for a domain
   */
  delete: async (
    organizationId: string,
    domain: string
  ): Promise<void> => {
    await apiClient.delete(
      `/organizations/${organizationId}/geo-access/${domain}`
    );
  },
};
