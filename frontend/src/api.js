// Thin API client. All calls send the httpOnly auth cookie (credentials: "include").
const BASE = import.meta.env.VITE_API_URL || "";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError("Can't reach the server. Check that the API is running.", 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || "Something went wrong. Try again.", res.status);
  return data;
}

export const api = {
  // auth
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  // events
  events: () => request("/events"),
  event: (id) => request(`/events/${id}`),
  createEvent: (body) => request("/events", { method: "POST", body }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: "PUT", body }),

  // bookings
  book: (eventId, quantity) => request(`/events/${eventId}/bookings`, { method: "POST", body: { quantity } }),
  myBookings: () => request("/events/customer/my-bookings"),
  eventBookings: (eventId) => request(`/events/${eventId}/bookings`)
};
