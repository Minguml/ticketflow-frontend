import { apiClient } from "@/lib/api-client";

export type Station = {
	id: string;
	name: string;
	address: string;
	created_at: string;
	updated_at: string;
};

export const stationsApi = {
	list: () => apiClient.get<Station[]>("/stations").then(({ data }) => data),
	create: (input: { name: string; address: string }) =>
		apiClient
			.post<Station>("/stations", {
				method: "POST",
				body: JSON.stringify(input),
			})
			.then(({ data }) => data),
	update: (id: string, input: { name: string; address: string }) =>
		apiClient
			.put<Station>(`/stations/${id}`, {
				method: "PUT",
				body: JSON.stringify(input),
			})
			.then(({ data }) => data),
	patch: (id: string, input: Partial<{ name: string; address: string }>) =>
		apiClient
			.patch<Station>(`/stations/${id}`, {
				method: "PATCH",
				body: JSON.stringify(input),
			})
			.then(({ data }) => data),
};
