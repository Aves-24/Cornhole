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
      <div>
        <h1 className="text-2xl font-bold">Tryb gry</h1>
        <p className="mt-1 text-slate-400">
          Gracie każdy na własną rękę, czy w drużynach 2 na 2?
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onSelect("solo")}
          className="rounded-lg bg-slate-900 px-4 py-4 text-left hover:bg-slate-800"
        >
          <div className="font-semibold">Każdy gra osobno</div>
          <div className="text-sm text-slate-400">{playerCount} uczestników w drabince</div>
        </button>

        <button
          onClick={() => canTeams && onSelect("teams")}
          disabled={!canTeams}
          className="rounded-lg bg-slate-900 px-4 py-4 text-left hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <div className="font-semibold">Drużyny (2 na 2)</div>
          <div className="text-sm text-slate-400">
            {canTeams
              ? `${playerCount / 2} drużyn w drabince`
              : "Potrzeba parzystej liczby graczy (min. 4)"}
          </div>
        </button>
      </div>

      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-300">
        ← Wróć do listy graczy
      </button>
    </div>
  );
}
