"use client";

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

function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 1) return "Finał";
  if (fromEnd === 2) return "Półfinał";
  if (fromEnd === 3) return "Ćwierćfinał";
  return `Runda ${round + 1}`;
}

export default function Bracket({ matches, totalRounds, participants, activeMatchId, onSelectMatch }: Props) {
  const rounds = Array.from({ length: totalRounds }, (_, r) => matches.filter((m) => m.round === r));

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {rounds.map((roundMatches, r) => (
        <div key={r} className="flex min-w-[220px] flex-col justify-around gap-4">
          <div className="text-center text-sm font-semibold text-slate-400">
            {roundLabel(r, totalRounds)}
          </div>
          {roundMatches.map((m) => {
            const aName = nameOf(participants, m.aId);
            const bName = nameOf(participants, m.bId);
            const playable = !!m.aId && !!m.bId && !m.isBye;
            const isActive = m.id === activeMatchId;

            return (
              <button
                key={m.id}
                onClick={() => playable && onSelectMatch(m.id)}
                disabled={!playable}
                className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? "border-orange-500 bg-orange-600/10"
                    : playable
                    ? "border-slate-700 bg-slate-900 hover:border-slate-500"
                    : "border-slate-800 bg-slate-950 text-slate-500"
                }`}
              >
                <div
                  className={`flex justify-between ${
                    m.winnerId && m.winnerId === m.aId ? "font-semibold text-orange-400" : ""
                  }`}
                >
                  <span>{m.aId ? aName : "—"}</span>
                  {m.rounds.length > 0 && <span>{m.aTotal}</span>}
                </div>
                <div
                  className={`flex justify-between ${
                    m.winnerId && m.winnerId === m.bId ? "font-semibold text-orange-400" : ""
                  }`}
                >
                  <span>{m.bId ? bName : m.isBye ? "" : "—"}</span>
                  {m.rounds.length > 0 && <span>{m.bTotal}</span>}
                </div>
                {m.isBye && <div className="text-xs italic text-slate-600">wolny los</div>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
