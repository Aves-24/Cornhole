import { TournamentState } from "./types";

const STORAGE_KEY = "cornhole-tournament";
const ROSTER_KEY = "cornhole-roster";

export function loadState(): TournamentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TournamentState;
  } catch {
    return null;
  }
}

export function saveState(state: TournamentState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Roster of previously used player names, kept across tournaments/resets. */
export function loadRoster(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ROSTER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRoster(names: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROSTER_KEY, JSON.stringify(names));
}
