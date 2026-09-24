/**
 * Anonymous local identity for guest (offline-first) usage.
 *
 * Every browser gets a stable random id on first visit, stored in
 * localStorage. It is NOT a login — it only gives guest data a stable
 * identifier so a future cloud sync can link or merge this device's data
 * when the user optionally signs in (merge-on-login, see roadmap).
 */

const GUEST_ID_KEY = "habitflow_guest_id";

export function getGuestId(): string {
  if (typeof window === "undefined") return "";

  try {
    const existing = window.localStorage.getItem(GUEST_ID_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    window.localStorage.setItem(GUEST_ID_KEY, id);
    return id;
  } catch {
    // Storage unavailable (private mode etc.) — the app still works,
    // the id just won't persist across sessions.
    return "";
  }
}
