import { apiClient } from "@/lib/api-client";

type RoleResponse = { user_id: string; role: string };

export const adminAccessApi = {
  grantOperator: (userId: string) =>
    apiClient.post<RoleResponse>(`/auth/admin/users/${userId}/operator`).then(({ data }) => data),
  revokeOperator: (userId: string) =>
    apiClient.delete<RoleResponse>(`/auth/admin/users/${userId}/operator`).then(({ data }) => data),
};
