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
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-4 sm:p-6">
      <div className="pt-2 text-center sm:pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Drużyny</h1>
        <p className="mt-2 text-slate-400">Los zdecyduje, czy dobieracie się sami?</p>
      </div>

      {mode === "none" && (
        <div className="flex flex-col gap-3">
          <button
            onClick={rollRandom}
            className="group flex items-center gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4 text-left transition hover:border-orange-500/60 hover:bg-orange-500/10"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-2xl">
              🎲
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Losuj drużyny</span>
              <span className="block text-sm text-slate-400">Los sparuje graczy za Was</span>
            </span>
            <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-orange-400">→</span>
          </button>
          <button
            onClick={() => setMode("manual")}
            className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-orange-500/50 hover:bg-slate-900"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-2xl">
              ✌️
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Przydziel ręcznie</span>
              <span className="block text-sm text-slate-400">Sami wybieracie pary</span>
            </span>
            <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-orange-400">→</span>
          </button>
        </div>
      )}

      {mode === "random" && (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {randomTeams.map((t, i) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="font-medium">{t.name}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={rollRandom}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-medium transition hover:border-slate-500 active:scale-[0.99]"
            >
              🎲 Jeszcze raz
            </button>
            <button
              onClick={() => onConfirm(randomTeams)}
              className="flex-1 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-950/40 transition hover:from-orange-400 hover:to-orange-500 active:scale-[0.99]"
            >
              Gramy!
            </button>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 text-sm text-slate-400">
              {pending ? (
                <>
                  Wybierz partnera dla: <span className="font-semibold text-orange-400">{pending.name}</span>
                </>
              ) : (
                "Kliknij dwóch graczy, żeby stworzyć drużynę"
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickManual(p)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95 ${
                    pending?.id === p.id
                      ? "border-orange-500 bg-orange-500/15 text-orange-400"
                      : "border-slate-700/60 bg-slate-900/80 hover:border-orange-500/50"
                  }`}
                >
                  {p.name}
                </button>
              ))}
              {unassigned.length === 0 && (
                <span className="text-sm text-slate-500">Wszyscy gracze przydzieleni ✓</span>
              )}
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {manualTeams.map((t, i) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{t.name}</span>
                <button
                  onClick={() => removeManualTeam(t.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-800 hover:text-red-400"
                  aria-label={`Rozwiąż drużynę ${t.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => onConfirm(manualTeams)}
            disabled={manualTeams.length === 0 || unassigned.length > 0}
            className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-orange-950/40 transition hover:from-orange-400 hover:to-orange-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
          >
            Gramy! · {manualTeams.length} drużyn
          </button>
        </div>
      )}

      <button
        onClick={() => (mode === "none" ? onBack() : setMode("none"))}
        className="self-center text-sm text-slate-500 transition hover:text-slate-300"
      >
        ← Wróć
      </button>
    </div>
  );
}
