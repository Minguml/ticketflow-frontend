import { apiClient } from "@/lib/api-client";

export type Route = {
  id: string;
  name: string;
  origin_id: string;
  destination_id: string;
  created_at: string;
  updated_at: string;
};

export const routesApi = {
  list: () => apiClient.get<Route[]>("/routes").then(({ data }) => data),
  create: (input: { name: string; origin_id: string; destination_id: string }) =>
    apiClient.post<Route>("/routes", input).then(({ data }) => data),
  update: (
    id: string,
    input: { name: string; origin_id: string; destination_id: string },
  ) =>
    apiClient.put<Route>(`/routes/${id}`, input).then(({ data }) => data),
  patch: (
    id: string,
    input: Partial<{ name: string; origin_id: string; destination_id: string }>,
  ) =>
    apiClient.patch<Route>(`/routes/${id}`, input).then(({ data }) => data),
};

