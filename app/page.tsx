"use client";

import { useEffect, useReducer, useState } from "react";
import PlayerSetup from "@/components/PlayerSetup";
import ModeSelect from "@/components/ModeSelect";
import TeamSetup from "@/components/TeamSetup";
import Bracket from "@/components/Bracket";
import MatchScoring from "@/components/MatchScoring";
import { initialState, reducer } from "@/lib/reducer";
import { loadState, saveState, clearState, loadRoster, saveRoster } from "@/lib/storage";

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [roster, setRoster] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  const activeMatch = state.matches.find((m) => m.id === activeMatchId) ?? null;

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
      <header className="flex items-center justify-between border-b border-slate-900 px-4 py-3 sm:px-6 sm:py-4">
        <span className="font-bold tracking-tight">🌽 Cornhole Turniej</span>
        {state.stage !== "setup-players" && (
          <button onClick={handleReset} className="text-sm text-slate-500 hover:text-red-400">
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
              <div className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-4 text-center sm:px-6 sm:py-5">
                <div className="text-sm uppercase tracking-widest text-orange-100">Mistrz turnieju</div>
                <div className="text-2xl font-extrabold sm:text-3xl">{resolveName(state.championId)} 🏆</div>
              </div>
            )}

            <Bracket
              matches={state.matches}
              totalRounds={state.totalRounds}
              participants={state.participants}
              activeMatchId={activeMatchId}
              onSelectMatch={setActiveMatchId}
            />

            {activeMatch && (
              <MatchScoring
                match={activeMatch}
                aName={resolveName(activeMatch.aId)}
                bName={resolveName(activeMatch.bId)}
                onRecordRound={(round) => dispatch({ type: "RECORD_ROUND", matchId: activeMatch.id, round })}
                onUndo={() => dispatch({ type: "UNDO_ROUND", matchId: activeMatch.id })}
                onClose={() => setActiveMatchId(null)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
