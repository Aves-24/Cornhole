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
  points,
  value,
  onChange,
  max,
}: {
  label: string;
  points: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label} <span className="text-slate-600">· {points}</span>
      </span>
      <div className="flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900 p-1">
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-90 sm:h-9 sm:w-9"
          aria-label={`Więcej: ${label}`}
        >
          +
        </button>
        <span className="w-8 text-center font-mono text-xl font-semibold tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-500 transition hover:bg-slate-800 hover:text-white active:scale-90 sm:h-9 sm:w-9"
          aria-label={`Mniej: ${label}`}
        >
          −
        </button>
      </div>
    </div>
  );
}

function ScoreSide({ name, total, leading }: { name: string; total: number; leading: boolean }) {
  const pct = Math.min(100, (total / WINNING_SCORE) * 100);
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <span className="max-w-full truncate text-sm font-medium text-slate-300">{name}</span>
      <span
        className={`font-mono text-5xl font-bold tabular-nums leading-none sm:text-6xl ${
          leading ? "text-orange-400" : "text-slate-100"
        }`}
      >
        {total}
      </span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800 sm:w-32">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
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

  const aPts = roundPoints(aHole, aBoard);
  const bPts = roundPoints(bHole, bBoard);
  const net = aPts - bPts;

  function submit() {
    if (!canSubmit) return;
    onRecordRound({ aHole, aBoard, bHole, bBoard });
    setAHole(0);
    setABoard(0);
    setBHole(0);
    setBBoard(0);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 px-4 py-3 sm:px-5">
        <h2 className="truncate text-sm font-semibold text-slate-300">
          {aName} <span className="font-normal text-slate-600">vs</span> {bName}
        </h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Zamknij mecz"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-5 sm:px-8">
        <ScoreSide name={aName} total={match.aTotal} leading={match.aTotal > match.bTotal} />
        <span className="rounded-full border border-slate-800 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          do {WINNING_SCORE}
        </span>
        <ScoreSide name={bName} total={match.bTotal} leading={match.bTotal > match.aTotal} />
      </div>

      {match.winnerId ? (
        <div className="mx-4 mb-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-4 text-center sm:mx-5">
          <div className="text-xl font-bold text-white drop-shadow-sm">
            🏆 Wygrywa {match.winnerId === match.aId ? aName : bName}!
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 pb-4 sm:px-5">
          <div className="text-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Runda {match.rounds.length + 1}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 p-4">
              <span className="text-sm font-semibold">{aName}</span>
              <div className="flex flex-wrap justify-center gap-3">
                <Stepper label="Dziura" points="3 pkt" value={aHole} onChange={setAHole} max={4 - aBoard} />
                <Stepper label="Tablica" points="1 pkt" value={aBoard} onChange={setABoard} max={4 - aHole} />
              </div>
              <span className="font-mono text-xs tabular-nums text-slate-500">{aPts} pkt w rundzie</span>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 p-4">
              <span className="text-sm font-semibold">{bName}</span>
              <div className="flex flex-wrap justify-center gap-3">
                <Stepper label="Dziura" points="3 pkt" value={bHole} onChange={setBHole} max={4 - bBoard} />
                <Stepper label="Tablica" points="1 pkt" value={bBoard} onChange={setBBoard} max={4 - bHole} />
              </div>
              <span className="font-mono text-xs tabular-nums text-slate-500">{bPts} pkt w rundzie</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {net !== 0 ? (
              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400">
                {net > 0 ? aName : bName} zgarnia +{Math.abs(net)} pkt
              </span>
            ) : (
              <span className="rounded-full bg-slate-800/60 px-3 py-1 text-sm text-slate-500">
                Punkty się znoszą — runda bez punktów
              </span>
            )}
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-orange-950/40 transition hover:from-orange-400 hover:to-orange-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
          >
            Zatwierdź rundę
          </button>
        </div>
      )}

      {match.rounds.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-slate-800/80 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium uppercase tracking-wider">Historia rund</span>
            <button onClick={onUndo} className="transition hover:text-red-400">
              ↩ Cofnij ostatnią
            </button>
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            {match.rounds.map((r, i) => {
              const ra = roundPoints(r.aHole, r.aBoard);
              const rb = roundPoints(r.bHole, r.bBoard);
              const rNet = ra - rb;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-3 py-2"
                >
                  <span className="text-slate-500">Runda {i + 1}</span>
                  <span className="font-mono text-xs tabular-nums text-slate-500">
                    {ra} — {rb}
                  </span>
                  {rNet !== 0 ? (
                    <span
                      className="min-w-[72px] rounded-full bg-orange-500/10 px-2 py-0.5 text-center font-mono text-xs tabular-nums text-orange-400"
                    >
                      +{Math.abs(rNet)} {rNet > 0 ? aName.slice(0, 8) : bName.slice(0, 8)}
                    </span>
                  ) : (
                    <span className="min-w-[72px] rounded-full bg-slate-800/60 px-2 py-0.5 text-center text-xs text-slate-600">
                      remis
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
