import { advanceWinner, generateBracket, getFinalMatch } from "./bracket";
import { applyRound, undoLastRound } from "./scoring";
import { Match, Mode, Participant, Player, RoundScore, TournamentState } from "./types";

export const initialState: TournamentState = {
  stage: "setup-players",
  players: [],
  mode: null,
  participants: [],
  matches: [],
  totalRounds: 0,
  championId: null,
};

export type Action =
  | { type: "ADD_PLAYER"; name: string }
  | { type: "REMOVE_PLAYER"; id: string }
  | { type: "CONTINUE_TO_MODE" }
  | { type: "SET_MODE"; mode: Mode }
  | { type: "START_SOLO_BRACKET" }
  | { type: "START_TEAM_BRACKET"; teams: Participant[] }
  | { type: "RECORD_ROUND"; matchId: string; round: RoundScore }
  | { type: "UNDO_ROUND"; matchId: string }
  | { type: "BACK_TO_MODE" }
  | { type: "RESET" }
  | { type: "LOAD"; state: TournamentState };

function buildBracketState(participants: Participant[]): Pick<TournamentState, "participants" | "matches" | "totalRounds" | "stage" | "championId"> {
  const { matches, totalRounds } = generateBracket(participants);
  return { participants, matches, totalRounds, stage: "bracket", championId: null };
}

function checkChampion(matches: Match[], totalRounds: number): string | null {
  const final = getFinalMatch(matches, totalRounds);
  return final?.winnerId ?? null;
}

export function reducer(state: TournamentState, action: Action): TournamentState {
  switch (action.type) {
    case "ADD_PLAYER": {
      const name = action.name.trim();
      if (!name) return state;
      const player: Player = { id: crypto.randomUUID(), name };
      return { ...state, players: [...state.players, player] };
    }
    case "REMOVE_PLAYER":
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };

    case "CONTINUE_TO_MODE":
      return { ...state, stage: "setup-mode" };

    case "SET_MODE":
      if (action.mode === "solo") {
        const participants: Participant[] = state.players.map((p) => ({
          id: p.id,
          name: p.name,
          playerIds: [p.id],
        }));
        return { ...state, mode: "solo", ...buildBracketState(participants) };
      }
      return { ...state, mode: "teams", stage: "setup-teams" };

    case "START_TEAM_BRACKET":
      return { ...state, ...buildBracketState(action.teams) };

    case "BACK_TO_MODE":
      return { ...state, stage: "setup-mode", mode: null };

    case "RECORD_ROUND": {
      const matches = state.matches.map((m) => (m.id === action.matchId ? applyRound(m, action.round) : m));
      const scored = matches.find((m) => m.id === action.matchId)!;
      const finalMatches = scored.winnerId
        ? advanceWinner(matches, scored.id, scored.winnerId, state.totalRounds)
        : matches;
      return {
        ...state,
        matches: finalMatches,
        championId: checkChampion(finalMatches, state.totalRounds),
      };
    }

    case "UNDO_ROUND": {
      const target = state.matches.find((m) => m.id === action.matchId);
      if (!target) return state;

      const nextMatch =
        target.round + 1 < state.totalRounds
          ? state.matches.find((m) => m.round === target.round + 1 && m.slot === Math.floor(target.slot / 2))
          : undefined;

      // Refuse to undo once the winner has already been scored in the next round.
      if (target.winnerId && nextMatch && nextMatch.rounds.length > 0) {
        return state;
      }

      let matches = state.matches.map((m) => (m.id === action.matchId ? undoLastRound(m) : m));

      if (target.winnerId && nextMatch) {
        matches = matches.map((m) => {
          if (m.id !== nextMatch.id) return m;
          const clearA = target.slot % 2 === 0;
          return { ...m, aId: clearA ? null : m.aId, bId: clearA ? m.bId : null };
        });
      }

      return { ...state, matches, championId: checkChampion(matches, state.totalRounds) };
    }

    case "RESET":
      return initialState;

    case "LOAD":
      return action.state;

    default:
      return state;
  }
}
