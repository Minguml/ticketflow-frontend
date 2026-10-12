import { apiClient } from "@/lib/api-client";

export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  roles: string[];
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then(({ data }) => data),
  register: (name: string, email: string, password: string) =>
    apiClient.post<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }).then(({ data }) => data),
  me: () => apiClient.get<User>("/auth/me").then(({ data }) => data),
};
