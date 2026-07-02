import { Match, RoundScore, WINNING_SCORE } from "./types";

export function roundPoints(hole: number, board: number): number {
  return hole * 3 + board;
}

export function isValidRound(hole: number, board: number): boolean {
  return hole >= 0 && board >= 0 && hole + board <= 4;
}

/**
 * Applies cancellation scoring for one round of 4 bags per side: the side
 * with more round points scores the difference, the other side scores 0.
 */
export function applyRound(match: Match, round: RoundScore): Match {
  const aPts = roundPoints(round.aHole, round.aBoard);
  const bPts = roundPoints(round.bHole, round.bBoard);
  const net = aPts - bPts;

  const aTotal = match.aTotal + (net > 0 ? net : 0);
  const bTotal = match.bTotal + (net < 0 ? -net : 0);

  const winnerId =
    aTotal >= WINNING_SCORE ? match.aId : bTotal >= WINNING_SCORE ? match.bId : null;

  return {
    ...match,
    rounds: [...match.rounds, round],
    aTotal,
    bTotal,
    winnerId,
  };
}

export function undoLastRound(match: Match): Match {
  if (match.rounds.length === 0) return match;
  const rounds = match.rounds.slice(0, -1);
  let aTotal = 0;
  let bTotal = 0;
  for (const r of rounds) {
    const net = roundPoints(r.aHole, r.aBoard) - roundPoints(r.bHole, r.bBoard);
    if (net > 0) aTotal += net;
    if (net < 0) bTotal += -net;
  }
  return { ...match, rounds, aTotal, bTotal, winnerId: null };
}
