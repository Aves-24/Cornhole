"use client";

import { useState } from "react";
import { Player } from "@/lib/types";

interface Props {
  players: Player[];
  roster: string[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onAddFromRoster: (name: string) => void;
  onForgetFromRoster: (name: string) => void;
  onContinue: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function PlayerSetup({
  players,
  roster,
  onAdd,
  onRemove,
  onAddFromRoster,
  onForgetFromRoster,
  onContinue,
}: Props) {
  const [name, setName] = useState("");

  function submit() {
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  }

  const activeNames = new Set(players.map((p) => p.name.toLowerCase()));
  const availableRoster = roster.filter((n) => !activeNames.has(n.toLowerCase()));

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-4 sm:p-6">
      <div className="pt-2 text-center sm:pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Kto gra?</h1>
        <p className="mt-2 text-slate-400">Dodaj wszystkich, którzy staną dziś przy tablicy.</p>
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Imię gracza…"
          className="h-12 flex-1 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        />
        <button
          onClick={submit}
          className="h-12 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-5 font-semibold text-white shadow-lg shadow-orange-950/40 transition hover:from-orange-400 hover:to-orange-500 active:scale-95"
        >
          Dodaj
        </button>
      </div>

      {availableRoster.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Zapisani gracze — dotknij, żeby dodać
          </span>
          <div className="flex flex-wrap gap-2">
            {availableRoster.map((n) => (
              <span
                key={n}
                className="flex items-center gap-0.5 rounded-full border border-slate-700/60 bg-slate-900/80 py-1 pl-3 pr-1 text-sm transition hover:border-orange-500/50"
              >
                <button
                  onClick={() => onAddFromRoster(n)}
                  className="font-medium text-slate-200 transition hover:text-orange-400"
                >
                  + {n}
                </button>
                <button
                  onClick={() => onForgetFromRoster(n)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-slate-600 transition hover:bg-slate-800 hover:text-red-400"
                  aria-label={`Zapomnij ${n}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {players.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white">
              {initials(p.name)}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
            <button
              onClick={() => onRemove(p.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-800 hover:text-red-400"
              aria-label={`Usuń ${p.name}`}
            >
              ✕
            </button>
          </li>
        ))}
        {players.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
            Jeszcze nikogo nie ma — dodaj przynajmniej dwie osoby.
          </li>
        )}
      </ul>

      <button
        onClick={onContinue}
        disabled={players.length < 2}
        className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-orange-950/40 transition hover:from-orange-400 hover:to-orange-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
      >
        Dalej{players.length > 0 && ` · ${players.length} ${players.length === 1 ? "gracz" : "graczy"}`}
      </button>
    </div>
  );
}
