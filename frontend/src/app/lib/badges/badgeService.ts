import { apiClient } from "../api/client";
import { authService } from "../auth/authService";
import { Badge } from "../auth/types";

export const BagdeService = {
  async getBadges(): Promise<Badge[]> {
    const token = authService.getAccessToken();
    return apiClient.get<Badge[]>("/api/auth/badges/", token || undefined);
  },

  async giveBadge(data: Badge): Promise<Badge> {
    const token = authService.getAccessToken();
    return apiClient.post<Badge>("/api/auth/badges/", data, token || undefined);
  },
};
