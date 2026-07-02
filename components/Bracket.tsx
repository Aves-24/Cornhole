"use client";

import { useEffect, useState } from "react";
import { Match, Participant } from "@/lib/types";

interface Props {
  matches: Match[];
  totalRounds: number;
  participants: Participant[];
  activeMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
}

function nameOf(participants: Participant[], id: string | null): string {
  if (!id) return "?";
  return participants.find((p) => p.id === id)?.name ?? "?";
}

export function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 1) return "Finał";
  if (fromEnd === 2) return "Półfinał";
  if (fromEnd === 3) return "Ćwierćfinał";
  return `Runda ${round + 1}`;
}

/** First round that isn't fully decided yet, or the last round if the whole bracket is done. */
function findActiveRound(matches: Match[], totalRounds: number): number {
  for (let r = 0; r < totalRounds; r++) {
    const roundMatches = matches.filter((m) => m.round === r);
    if (roundMatches.some((m) => !m.winnerId)) return r;
  }
  return Math.max(totalRounds - 1, 0);
}

interface CardProps {
  match: Match;
  participants: Participant[];
  isActive: boolean;
  onSelectMatch: (matchId: string) => void;
  size: "compact" | "large";
}

function MatchCard({ match: m, participants, isActive, onSelectMatch, size }: CardProps) {
  const aName = nameOf(participants, m.aId);
  const bName = nameOf(participants, m.bId);
  const playable = !!m.aId && !!m.bId && !m.isBye;
  const large = size === "large";

  function row(id: string | null, name: string, total: number, emptyLabel: string) {
    const won = !!m.winnerId && m.winnerId === id;
    const lost = !!m.winnerId && !!id && m.winnerId !== id;
    return (
      <div className={`flex items-center justify-between gap-2 ${lost ? "opacity-50" : ""}`}>
        <span className={`truncate ${won ? "font-semibold text-orange-400" : ""}`}>
          {won && !m.isBye && <span className="mr-1">🏆</span>}
          {id ? name : emptyLabel}
        </span>
        {m.rounds.length > 0 && (
          <span className={`font-mono tabular-nums ${won ? "font-semibold text-orange-400" : "text-slate-400"}`}>
            {total}
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => playable && onSelectMatch(m.id)}
      disabled={!playable}
      className={`flex w-full flex-col gap-1.5 rounded-xl border text-left transition ${
        large ? "px-4 py-3 text-base" : "px-3 py-2.5 text-sm"
      } ${
        isActive
          ? "border-orange-500/70 bg-orange-500/10 ring-1 ring-orange-500/30"
          : playable
          ? "border-slate-700/70 bg-slate-900/70 hover:border-orange-500/40 hover:bg-slate-900 active:scale-[0.99]"
          : "border-slate-800/60 bg-slate-950/50 text-slate-500"
      }`}
    >
      {row(m.aId, aName, m.aTotal, "—")}
      {row(m.bId, bName, m.bTotal, m.isBye ? "" : "—")}
      {m.isBye && <div className="text-xs italic text-slate-600">wolny los</div>}
      {isActive && !m.winnerId && (
        <div className="text-[10px] font-medium uppercase tracking-wider text-orange-500">● trwa</div>
      )}
    </button>
  );
}

export default function Bracket({ matches, totalRounds, participants, activeMatchId, onSelectMatch }: Props) {
  const rounds = Array.from({ length: totalRounds }, (_, r) => matches.filter((m) => m.round === r));
  const [selectedRound, setSelectedRound] = useState(() => findActiveRound(matches, totalRounds));

  // Auto-advance the mobile tab once the round the player is looking at gets finished.
  useEffect(() => {
    setSelectedRound((prev) => {
      const prevRoundMatches = matches.filter((m) => m.round === prev);
      const prevDone = prevRoundMatches.length > 0 && prevRoundMatches.every((m) => m.winnerId);
      return prevDone ? findActiveRound(matches, totalRounds) : prev;
    });
  }, [matches, totalRounds]);

  return (
    <>
      {/* Mobile: round tabs + a single vertical column of matches. */}
      <div className="flex flex-col gap-4 md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {rounds.map((roundMatches, r) => {
            const done = roundMatches.length > 0 && roundMatches.every((m) => m.winnerId);
            return (
              <button
                key={r}
                onClick={() => setSelectedRound(r)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${
                  r === selectedRound
                    ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-md shadow-orange-950/40"
                    : "border border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200"
                }`}
              >
                {done && r !== selectedRound && <span className="mr-1 text-orange-500">✓</span>}
                {roundLabel(r, totalRounds)}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {rounds[selectedRound]?.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              participants={participants}
              isActive={m.id === activeMatchId}
              onSelectMatch={onSelectMatch}
              size="large"
            />
          ))}
        </div>
      </div>

      {/* Desktop: full bracket, all rounds side by side. */}
      <div className="hidden gap-6 overflow-x-auto pb-4 md:flex">
        {rounds.map((roundMatches, r) => (
          <div key={r} className="flex min-w-[220px] flex-col justify-around gap-4">
            <div className="text-center text-sm font-semibold text-slate-400">
              {roundLabel(r, totalRounds)}
            </div>
            {roundMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                participants={participants}
                isActive={m.id === activeMatchId}
                onSelectMatch={onSelectMatch}
                size="compact"
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
