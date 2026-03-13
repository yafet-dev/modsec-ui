import apiClient from './client';

export interface IPGeolocationResponse {
  country: string | null;
  countryName: string | null;
}

// IP Geolocation API functions
export const ipGeolocationApi = {
  getCountryFromIP: async (ip: string): Promise<IPGeolocationResponse> => {
    const response = await apiClient.get<IPGeolocationResponse>(`/organizations/ip-geolocation/${ip}`);
    return response.data;
  },
};
