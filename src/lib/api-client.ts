import axios from "axios";

export const apiClient = axios.create({
	baseURL: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, ""),
	headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
	const token = typeof window !== "undefined" ? window.localStorage.getItem("ticketflow_token") : null;
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		const requestUrl = error.config?.url || "";
		if (
			error.response?.status === 401 &&
			typeof window !== "undefined" &&
			!requestUrl.endsWith("/auth/login")
		) {
			window.dispatchEvent(new Event("ticketflow:session-expired"));
		}
		const message = error.response?.data?.error;
		if (message) error.message = message;
		return Promise.reject(error);
	},
);
