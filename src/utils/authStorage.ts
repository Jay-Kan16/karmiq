// Tab-isolated authentication storage utility
// Uses sessionStorage so different tabs can hold different sessions (e.g. User in Tab 1, Worker in Tab 2)
// Falls back to localStorage for backward compatibility

export function getAuthToken(): string | null {
  return sessionStorage.getItem("kaamsaathi_token") || localStorage.getItem("kaamsaathi_token");
}

export function setAuthSession(token: string, user: any) {
  sessionStorage.setItem("kaamsaathi_token", token);
  sessionStorage.setItem("kaamsaathi_user", typeof user === "string" ? user : JSON.stringify(user));
}

export function getAuthUser(): any {
  const raw = sessionStorage.getItem("kaamsaathi_user") || localStorage.getItem("kaamsaathi_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  const token = sessionStorage.getItem("kaamsaathi_token");
  sessionStorage.removeItem("kaamsaathi_token");
  sessionStorage.removeItem("kaamsaathi_user");
  if (token && localStorage.getItem("kaamsaathi_token") === token) {
    localStorage.removeItem("kaamsaathi_token");
    localStorage.removeItem("kaamsaathi_user");
  }
}

