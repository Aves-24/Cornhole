"use client";

import { useEffect, useReducer, useState } from "react";
import PlayerSetup from "@/components/PlayerSetup";
import ModeSelect from "@/components/ModeSelect";
import TeamSetup from "@/components/TeamSetup";
import Bracket, { roundLabel } from "@/components/Bracket";
import MatchScoring from "@/components/MatchScoring";
import { initialState, reducer } from "@/lib/reducer";
import { loadState, saveState, clearState, loadRoster, saveRoster } from "@/lib/storage";
import { useWakeLock } from "@/lib/useWakeLock";

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [roster, setRoster] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useWakeLock();

  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: "LOAD", state: saved });
    setRoster(loadRoster());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (hydrated) saveRoster(roster);
  }, [roster, hydrated]);

  if (!hydrated) return null;

  function rememberPlayer(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRoster((prev) => (prev.some((n) => n.toLowerCase() === trimmed.toLowerCase()) ? prev : [...prev, trimmed]));
  }

  function forgetPlayer(name: string) {
    setRoster((prev) => prev.filter((n) => n.toLowerCase() !== name.toLowerCase()));
  }

  // Matches ready to play, in bracket order (round by round, top to bottom).
  const playableMatches = state.matches
    .filter((m) => m.aId && m.bId && !m.isBye && !m.winnerId)
    .sort((a, b) => a.round - b.round || a.slot - b.slot);

  const selectedMatch = state.matches.find((m) => m.id === activeMatchId) ?? null;
  const currentMatch = selectedMatch ?? playableMatches[0] ?? null;
  const nextMatch = playableMatches.find((m) => m.id !== currentMatch?.id) ?? null;

  function resolveName(id: string | null) {
    return state.participants.find((p) => p.id === id)?.name ?? "?";
  }

  function handleReset() {
    if (!confirm("Zresetować cały turniej? Ta operacja jest nieodwracalna.")) return;
    clearState();
    dispatch({ type: "RESET" });
    setActiveMatchId(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-slate-950/80 px-4 py-3 backdrop-blur sm:px-6">
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-base shadow-md shadow-orange-950/40">
            🌽
          </span>
          <span className="font-bold tracking-tight">Cornhole</span>
        </span>
        {state.stage !== "setup-players" && (
          <button
            onClick={handleReset}
            className="rounded-full border border-slate-800 px-3.5 py-1.5 text-sm text-slate-400 transition hover:border-red-900 hover:text-red-400"
          >
            Nowy turniej
          </button>
        )}
      </header>

      <main className="flex-1">
        {state.stage === "setup-players" && (
          <PlayerSetup
            players={state.players}
            roster={roster}
            onAdd={(name) => {
              dispatch({ type: "ADD_PLAYER", name });
              rememberPlayer(name);
            }}
            onRemove={(id) => dispatch({ type: "REMOVE_PLAYER", id })}
            onAddFromRoster={(name) => dispatch({ type: "ADD_PLAYER", name })}
            onForgetFromRoster={forgetPlayer}
            onContinue={() => dispatch({ type: "CONTINUE_TO_MODE" })}
          />
        )}

        {state.stage === "setup-mode" && (
          <ModeSelect
            playerCount={state.players.length}
            onSelect={(mode) => dispatch({ type: "SET_MODE", mode })}
            onBack={() => dispatch({ type: "LOAD", state: { ...state, stage: "setup-players" } })}
          />
        )}

        {state.stage === "setup-teams" && (
          <TeamSetup
            players={state.players}
            onConfirm={(teams) => dispatch({ type: "START_TEAM_BRACKET", teams })}
            onBack={() => dispatch({ type: "BACK_TO_MODE" })}
          />
        )}

        {state.stage === "bracket" && (
          <div className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
            {state.championId && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 px-4 py-6 text-center shadow-xl shadow-orange-950/40 sm:px-6 sm:py-8">
                <div className="text-4xl">🏆</div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-orange-100">
                  Mistrz turnieju
                </div>
                <div className="mt-1 text-3xl font-extrabold text-white drop-shadow sm:text-4xl">
                  {resolveName(state.championId)}
                </div>
              </div>
            )}

            {currentMatch && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Aktualny mecz · {roundLabel(currentMatch.round, state.totalRounds)}
                </span>
                <MatchScoring
                  match={currentMatch}
                  aName={resolveName(currentMatch.aId)}
                  bName={resolveName(currentMatch.bId)}
                  onRecordRound={(round) => {
                    dispatch({ type: "RECORD_ROUND", matchId: currentMatch.id, round });
                    setActiveMatchId(currentMatch.id);
                  }}
                  onUndo={() => dispatch({ type: "UNDO_ROUND", matchId: currentMatch.id })}
                  onClose={() => setActiveMatchId(null)}
                />
              </div>
            )}

            {nextMatch && (
              <button
                onClick={() => setActiveMatchId(nextMatch.id)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3.5 text-left transition hover:border-orange-500/40 hover:bg-slate-900"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Następny mecz · {roundLabel(nextMatch.round, state.totalRounds)}
                  </div>
                  <div className="mt-1 truncate font-medium">
                    {resolveName(nextMatch.aId)} <span className="text-slate-500">vs</span>{" "}
                    {resolveName(nextMatch.bId)}
                  </div>
                </div>
                <span className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-orange-400">
                  →
                </span>
              </button>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Drabinka</span>
              <Bracket
                matches={state.matches}
                totalRounds={state.totalRounds}
                participants={state.participants}
                activeMatchId={currentMatch?.id ?? null}
                onSelectMatch={setActiveMatchId}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
