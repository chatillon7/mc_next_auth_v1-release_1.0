"use client";

export async function getSessionUser() {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/session");
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}
