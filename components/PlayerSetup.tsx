"use client";

import { useState } from "react";
import { Player } from "@/lib/types";

interface Props {
  players: Player[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onContinue: () => void;
}

export default function PlayerSetup({ players, onAdd, onRemove, onContinue }: Props) {
  const [name, setName] = useState("");

  function submit() {
    if (!name.trim()) return;
    onAdd(name);
    setName("");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Turniej Cornhole</h1>
        <p className="mt-1 text-slate-400">Dodaj imiona graczy, którzy będą grać.</p>
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Imię gracza"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 outline-none focus:border-orange-500"
        />
        <button
          onClick={submit}
          className="rounded-lg bg-orange-600 px-4 py-2 font-medium hover:bg-orange-500"
        >
          Dodaj
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-2"
          >
            <span>
              <span className="mr-2 text-slate-500">{i + 1}.</span>
              {p.name}
            </span>
            <button
              onClick={() => onRemove(p.id)}
              className="text-slate-500 hover:text-red-400"
              aria-label={`Usuń ${p.name}`}
            >
              ✕
            </button>
          </li>
        ))}
        {players.length === 0 && (
          <li className="rounded-lg border border-dashed border-slate-800 px-4 py-6 text-center text-slate-500">
            Brak graczy — dodaj przynajmniej dwóch.
          </li>
        )}
      </ul>

      <button
        onClick={onContinue}
        disabled={players.length < 2}
        className="rounded-lg bg-orange-600 px-4 py-3 font-semibold hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
      >
        Dalej ({players.length} {players.length === 1 ? "gracz" : "graczy"})
      </button>
    </div>
  );
}
