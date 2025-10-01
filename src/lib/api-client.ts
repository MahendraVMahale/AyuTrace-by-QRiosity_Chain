import { getServerSession } from "next-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  jwt?: string
) {
  const headers = new Headers(options.headers || {});
  
  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }
  
  headers.set("Content-Type", "application/json");
  
  const url = `${API_BASE}${path}`;
  
  return fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });
}

// Helper to get JWT token from session
export function getJWTFromSession(session: any): string | undefined {
  // NextAuth v5 stores the full token in the session
  return session?.accessToken || session?.user?.accessToken;
}