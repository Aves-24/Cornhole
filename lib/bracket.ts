import { Match, Participant } from "./types";

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function emptyMatch(round: number, slot: number): Match {
  return {
    id: crypto.randomUUID(),
    round,
    slot,
    aId: null,
    bId: null,
    isBye: false,
    winnerId: null,
    aTotal: 0,
    bTotal: 0,
    rounds: [],
  };
}

/** Places a winning participant into the correct slot of the next round. */
function placeInNextRound(matches: Match[], round: number, slot: number, participantId: string) {
  const nextRound = round + 1;
  const nextSlot = Math.floor(slot / 2);
  const nextMatch = matches.find((m) => m.round === nextRound && m.slot === nextSlot);
  if (!nextMatch) return;
  if (slot % 2 === 0) {
    nextMatch.aId = participantId;
  } else {
    nextMatch.bId = participantId;
  }
}

/**
 * Builds a full single-elimination bracket skeleton (all rounds) for the given
 * participants, randomly seeded. Byes are auto-resolved and propagated.
 */
export function generateBracket(participants: Participant[]): { matches: Match[]; totalRounds: number } {
  const n = participants.length;
  const size = nextPowerOf2(n);
  const totalRounds = Math.log2(size);
  const matchesInRound1 = size / 2;
  const byeCount = size - n;

  const shuffledParticipants = shuffle(participants);
  // Spread byes across distinct round-1 matches so no match ends up with two byes.
  const byeMatchSlots = new Set(
    shuffle(Array.from({ length: matchesInRound1 }, (_, i) => i)).slice(0, byeCount)
  );

  const matches: Match[] = [];
  for (let round = 0; round < totalRounds; round++) {
    const matchesInRound = size / 2 ** (round + 1);
    for (let slot = 0; slot < matchesInRound; slot++) {
      matches.push(emptyMatch(round, slot));
    }
  }

  let pIdx = 0;
  const round0Matches = matches.filter((m) => m.round === 0);
  round0Matches.forEach((m) => {
    m.aId = shuffledParticipants[pIdx++].id;
    m.bId = byeMatchSlots.has(m.slot) ? null : shuffledParticipants[pIdx++].id;
  });

  // Resolve byes (a match with exactly one participant auto-advances).
  for (const m of matches.filter((m) => m.round === 0)) {
    if (m.aId && !m.bId) {
      m.isBye = true;
      m.winnerId = m.aId;
    } else if (!m.aId && m.bId) {
      m.isBye = true;
      m.winnerId = m.bId;
    }
    if (m.winnerId && totalRounds > 0) {
      placeInNextRound(matches, m.round, m.slot, m.winnerId);
    }
  }

  return { matches, totalRounds };
}

/**
 * Records a match's winner and propagates them into the next round's slot.
 * Cascades through any subsequent bye-only matches automatically.
 */
export function advanceWinner(matches: Match[], matchId: string, winnerId: string, totalRounds: number): Match[] {
  const next = matches.map((m) => ({ ...m, rounds: [...m.rounds] }));
  const match = next.find((m) => m.id === matchId);
  if (!match) return next;
  match.winnerId = winnerId;

  if (match.round + 1 < totalRounds) {
    placeInNextRound(next, match.round, match.slot, winnerId);
  }

  return next;
}

export function getFinalMatch(matches: Match[], totalRounds: number): Match | undefined {
  return matches.find((m) => m.round === totalRounds - 1);
}
