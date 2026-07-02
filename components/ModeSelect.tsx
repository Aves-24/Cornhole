"use client";

import { Mode } from "@/lib/types";

interface Props {
  playerCount: number;
  onSelect: (mode: Mode) => void;
  onBack: () => void;
}

export default function ModeSelect({ playerCount, onSelect, onBack }: Props) {
  const canTeams = playerCount >= 4 && playerCount % 2 === 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-4 sm:p-6">
      <div className="pt-2 text-center sm:pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Tryb gry</h1>
        <p className="mt-2 text-slate-400">Każdy na własną rękę, czy w parach?</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onSelect("solo")}
          className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-orange-500/50 hover:bg-slate-900"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl transition group-hover:bg-orange-500/15">
            🙋
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Każdy gra osobno</span>
            <span className="block text-sm text-slate-400">{playerCount} uczestników w drabince</span>
          </span>
          <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-orange-400">→</span>
        </button>

        <button
          onClick={() => canTeams && onSelect("teams")}
          disabled={!canTeams}
          className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition enabled:hover:border-orange-500/50 enabled:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl transition group-hover:bg-orange-500/15">
            👥
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Drużyny 2 na 2</span>
            <span className="block text-sm text-slate-400">
              {canTeams
                ? `${playerCount / 2} drużyn w drabince`
                : "Potrzeba parzystej liczby graczy (min. 4)"}
            </span>
          </span>
          <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-orange-400">→</span>
        </button>
      </div>

      <button
        onClick={onBack}
        className="self-center text-sm text-slate-500 transition hover:text-slate-300"
      >
        ← Wróć do listy graczy
      </button>
    </div>
  );
}
