"use client";

import { useState } from "react";
import { Match } from "@/lib/types";
import { isValidRound, roundPoints } from "@/lib/scoring";
import { WINNING_SCORE } from "@/lib/types";

interface Props {
  match: Match;
  aName: string;
  bName: string;
  onRecordRound: (hole: { aHole: number; aBoard: number; bHole: number; bBoard: number }) => void;
  onUndo: () => void;
  onClose: () => void;
}

function Stepper({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-11 w-11 shrink-0 rounded-full bg-slate-800 text-lg active:bg-slate-700 sm:h-9 sm:w-9 sm:text-base sm:hover:bg-slate-700"
        >
          −
        </button>
        <span className="w-5 text-center font-mono text-lg">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-11 w-11 shrink-0 rounded-full bg-slate-800 text-lg active:bg-slate-700 sm:h-9 sm:w-9 sm:text-base sm:hover:bg-slate-700"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function MatchScoring({ match, aName, bName, onRecordRound, onUndo, onClose }: Props) {
  const [aHole, setAHole] = useState(0);
  const [aBoard, setABoard] = useState(0);
  const [bHole, setBHole] = useState(0);
  const [bBoard, setBBoard] = useState(0);

  const aValid = isValidRound(aHole, aBoard);
  const bValid = isValidRound(bHole, bBoard);
  const canSubmit = aValid && bValid && !match.winnerId;

  function submit() {
    if (!canSubmit) return;
    onRecordRound({ aHole, aBoard, bHole, bBoard });
    setAHole(0);
    setABoard(0);
    setBHole(0);
    setBBoard(0);
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold sm:text-lg">
          {aName} <span className="text-slate-500">vs</span> {bName}
        </h2>
        <button onClick={onClose} className="shrink-0 p-1 text-slate-500 hover:text-slate-300">
          ✕
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 sm:gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold">{match.aTotal}</div>
          <div className="text-xs text-slate-400">{aName}</div>
        </div>
        <div className="text-slate-600">do {WINNING_SCORE}</div>
        <div className="text-center">
          <div className="text-3xl font-bold">{match.bTotal}</div>
          <div className="text-xs text-slate-400">{bName}</div>
        </div>
      </div>

      {match.winnerId ? (
        <div className="rounded-lg bg-orange-600/20 px-4 py-3 text-center font-semibold text-orange-400">
          Wygrywa {match.winnerId === match.aId ? aName : bName}!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-center text-sm text-slate-400">Runda {match.rounds.length + 1} — worki w dziurze / na tablicy</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-slate-950 p-3">
              <span className="text-sm font-medium">{aName}</span>
              <div className="flex gap-4 sm:gap-4">
                <Stepper label="Dziura (3pkt)" value={aHole} onChange={setAHole} max={4 - aBoard} />
                <Stepper label="Tablica (1pkt)" value={aBoard} onChange={setABoard} max={4 - aHole} />
              </div>
              <span className="text-xs text-slate-500">{roundPoints(aHole, aBoard)} pkt w rundzie</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-lg bg-slate-950 p-3">
              <span className="text-sm font-medium">{bName}</span>
              <div className="flex gap-4 sm:gap-4">
                <Stepper label="Dziura (3pkt)" value={bHole} onChange={setBHole} max={4 - bBoard} />
                <Stepper label="Tablica (1pkt)" value={bBoard} onChange={setBBoard} max={4 - bHole} />
              </div>
              <span className="text-xs text-slate-500">{roundPoints(bHole, bBoard)} pkt w rundzie</span>
            </div>
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-lg bg-orange-600 px-4 py-3 font-semibold hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            Zatwierdź rundę
          </button>
        </div>
      )}

      {match.rounds.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Historia rund</span>
            <button onClick={onUndo} className="text-slate-500 hover:text-red-400">
              Cofnij ostatnią rundę
            </button>
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            {match.rounds.map((r, i) => (
              <li
                key={i}
                className="flex flex-col gap-0.5 rounded bg-slate-950 px-3 py-1.5 text-slate-400 sm:flex-row sm:justify-between sm:gap-2"
              >
                <span>Runda {i + 1}</span>
                <span>
                  {r.aHole}🕳 {r.aBoard}▭ ({roundPoints(r.aHole, r.aBoard)}) — {r.bHole}🕳 {r.bBoard}▭ ({roundPoints(r.bHole, r.bBoard)})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
