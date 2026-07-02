"use client";

import { useMemo, useState } from "react";
import { Participant, Player } from "@/lib/types";

interface Props {
  players: Player[];
  onConfirm: (teams: Participant[]) => void;
  onBack: () => void;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pairToTeams(players: Player[]): Participant[] {
  const teams: Participant[] = [];
  for (let i = 0; i < players.length; i += 2) {
    const a = players[i];
    const b = players[i + 1];
    teams.push({ id: crypto.randomUUID(), name: `${a.name} i ${b.name}`, playerIds: [a.id, b.id] });
  }
  return teams;
}

export default function TeamSetup({ players, onConfirm, onBack }: Props) {
  const [mode, setMode] = useState<"none" | "random" | "manual">("none");
  const [randomTeams, setRandomTeams] = useState<Participant[]>([]);
  const [manualTeams, setManualTeams] = useState<Participant[]>([]);
  const [pending, setPending] = useState<Player | null>(null);

  const assignedIds = useMemo(
    () => new Set(manualTeams.flatMap((t) => t.playerIds)),
    [manualTeams]
  );
  const unassigned = players.filter((p) => !assignedIds.has(p.id));

  function rollRandom() {
    setRandomTeams(pairToTeams(shuffle(players)));
    setMode("random");
  }

  function pickManual(player: Player) {
    if (!pending) {
      setPending(player);
      return;
    }
    if (pending.id === player.id) {
      setPending(null);
      return;
    }
    setManualTeams((teams) => [
      ...teams,
      {
        id: crypto.randomUUID(),
        name: `${pending.name} i ${player.name}`,
        playerIds: [pending.id, player.id],
      },
    ]);
    setPending(null);
  }

  function removeManualTeam(id: string) {
    setManualTeams((teams) => teams.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Przydział drużyn</h1>
        <p className="mt-1 text-slate-400">Losowo czy ręcznie?</p>
      </div>

      {mode === "none" && (
        <div className="flex flex-col gap-3">
          <button
            onClick={rollRandom}
            className="rounded-lg bg-orange-600 px-4 py-3 font-semibold hover:bg-orange-500"
          >
            🎲 Losuj drużyny
          </button>
          <button
            onClick={() => setMode("manual")}
            className="rounded-lg bg-slate-900 px-4 py-3 font-semibold hover:bg-slate-800"
          >
            Przydziel ręcznie
          </button>
        </div>
      )}

      {mode === "random" && (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {randomTeams.map((t) => (
              <li key={t.id} className="rounded-lg bg-slate-900 px-4 py-3">
                {t.name}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={rollRandom}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-medium hover:bg-slate-800"
            >
              Losuj ponownie
            </button>
            <button
              onClick={() => onConfirm(randomTeams)}
              className="flex-1 rounded-lg bg-orange-600 px-4 py-3 font-semibold hover:bg-orange-500"
            >
              Rozpocznij turniej
            </button>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 text-sm text-slate-400">
              {pending ? `Wybierz partnera dla: ${pending.name}` : "Kliknij dwóch graczy, żeby stworzyć drużynę"}
            </div>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickManual(p)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    pending?.id === p.id
                      ? "bg-orange-600"
                      : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {p.name}
                </button>
              ))}
              {unassigned.length === 0 && (
                <span className="text-sm text-slate-500">Wszyscy gracze przydzieleni.</span>
              )}
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {manualTeams.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3"
              >
                <span>{t.name}</span>
                <button
                  onClick={() => removeManualTeam(t.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => onConfirm(manualTeams)}
            disabled={manualTeams.length === 0 || unassigned.length > 0}
            className="rounded-lg bg-orange-600 px-4 py-3 font-semibold hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            Rozpocznij turniej ({manualTeams.length} drużyn)
          </button>
        </div>
      )}

      <button
        onClick={() => (mode === "none" ? onBack() : setMode("none"))}
        className="text-sm text-slate-500 hover:text-slate-300"
      >
        ← Wróć
      </button>
    </div>
  );
}
