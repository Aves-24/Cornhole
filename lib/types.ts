export type Mode = "solo" | "teams";

export type Stage =
  | "setup-players"
  | "setup-mode"
  | "setup-teams"
  | "bracket";

export interface Player {
  id: string;
  name: string;
}

export interface Participant {
  id: string;
  name: string;
  playerIds: string[];
}

export interface RoundScore {
  aHole: number;
  aBoard: number;
  bHole: number;
  bBoard: number;
}

export interface Match {
  id: string;
  round: number;
  slot: number;
  aId: string | null;
  bId: string | null;
  isBye: boolean;
  winnerId: string | null;
  aTotal: number;
  bTotal: number;
  rounds: RoundScore[];
}

export interface TournamentState {
  stage: Stage;
  players: Player[];
  mode: Mode | null;
  participants: Participant[];
  matches: Match[];
  totalRounds: number;
  championId: string | null;
}

export const WINNING_SCORE = 21;
