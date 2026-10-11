export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  roles: string[];
};

export type Station = {
  id: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
};

export type Route = {
  id: string;
  name: string;
  origin_id: string;
  destination_id: string;
  created_at: string;
  updated_at: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("ticketflow_token")
      : null;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!response.ok) {
    if (response.status === 401 && token && path !== "/auth/login")
      window.dispatchEvent(new Event("ticketflow:session-expired"));
    throw new ApiError(
      body.error || `Request failed (${response.status})`,
      response.status,
    );
  }
  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  me: () => request<User>("/auth/me"),
  stations: () => request<Station[]>("/stations"),
  createStation: (input: { name: string; address: string }) =>
    request<Station>("/stations", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateStation: (id: string, input: { name: string; address: string }) =>
    request<Station>(`/stations/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  patchStation: (
    id: string,
    input: Partial<{ name: string; address: string }>,
  ) =>
    request<Station>(`/stations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  routes: () => request<Route[]>("/routes"),
  createRoute: (input: {
    name: string;
    origin_id: string;
    destination_id: string;
  }) =>
    request<Route>("/routes", { method: "POST", body: JSON.stringify(input) }),
  updateRoute: (
    id: string,
    input: { name: string; origin_id: string; destination_id: string },
  ) =>
    request<Route>(`/routes/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  patchRoute: (
    id: string,
    input: Partial<{ name: string; origin_id: string; destination_id: string }>,
  ) =>
    request<Route>(`/routes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  grantOperator: (userId: string) =>
    request<{ user_id: string; role: string }>(
      `/auth/admin/users/${userId}/operator`,
      { method: "POST" },
    ),
  revokeOperator: (userId: string) =>
    request<{ user_id: string; role: string }>(
      `/auth/admin/users/${userId}/operator`,
      { method: "DELETE" },
    ),
};
