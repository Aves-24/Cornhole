import { roundPoints, isValidRound, applyRound, undoLastRound } from "./lib/scoring";
import { reducer, initialState } from "./lib/reducer";
import { generateBracket } from "./lib/bracket";
import { Match, Participant, TournamentState } from "./lib/types";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "OK " : "FAIL"} ${label}${ok ? "" : ` — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

function freshMatch(): Match {
  return {
    id: "m1", round: 0, slot: 0, aId: "A", bId: "B",
    isBye: false, winnerId: null, aTotal: 0, bTotal: 0, rounds: [],
  };
}

console.log("--- roundPoints (3 pkt dziura, 1 pkt tablica) ---");
check("4 w dziurze = 12", roundPoints(4, 0), 12);
check("2 dziury + 2 tablice = 8", roundPoints(2, 2), 8);
check("0 + 0 = 0", roundPoints(0, 0), 0);
check("0 dziur + 4 tablice = 4", roundPoints(0, 4), 4);

console.log("--- isValidRound (max 4 worki na gracza) ---");
check("4+0 poprawne", isValidRound(4, 0), true);
check("2+2 poprawne", isValidRound(2, 2), true);
check("4+1 = 5 workow, blad", isValidRound(4, 1), false);
check("ujemne, blad", isValidRound(-1, 0), false);

console.log("--- cancellation scoring ---");
let m = freshMatch();
m = applyRound(m, { aHole: 4, aBoard: 0, bHole: 1, bBoard: 2 });
check("A:12 vs B:5 -> A dostaje 7, B 0", [m.aTotal, m.bTotal], [7, 0]);
m = applyRound(m, { aHole: 1, aBoard: 0, bHole: 2, bBoard: 1 });
check("A:3 vs B:7 -> B dostaje 4", [m.aTotal, m.bTotal], [7, 4]);
m = applyRound(m, { aHole: 2, aBoard: 1, bHole: 2, bBoard: 1 });
check("remis 7:7 -> nikt nie punktuje", [m.aTotal, m.bTotal], [7, 4]);
check("brak zwyciezcy przed 21", m.winnerId, null);

console.log("--- prog 21 punktow ---");
let w = freshMatch();
w = applyRound(w, { aHole: 4, aBoard: 0, bHole: 0, bBoard: 0 });
w = applyRound(w, { aHole: 3, aBoard: 0, bHole: 0, bBoard: 0 });
check("21 dokladnie po 12+9", [w.aTotal, w.winnerId], [21, "A"]);
let w2 = freshMatch();
w2 = applyRound(w2, { aHole: 4, aBoard: 0, bHole: 0, bBoard: 0 });
w2 = applyRound(w2, { aHole: 2, aBoard: 2, bHole: 0, bBoard: 0 });
check("20 pkt to jeszcze nie wygrana", [w2.aTotal, w2.winnerId], [20, null]);
w2 = applyRound(w2, { aHole: 4, aBoard: 0, bHole: 0, bBoard: 0 });
check("przekroczenie 21 (32) tez wygrywa - bez bustu", [w2.aTotal, w2.winnerId], [32, "A"]);

console.log("--- undo ---");
let u = freshMatch();
u = applyRound(u, { aHole: 4, aBoard: 0, bHole: 0, bBoard: 0 });
u = applyRound(u, { aHole: 0, aBoard: 0, bHole: 3, bBoard: 1 });
u = undoLastRound(u);
check("po cofnieciu rundy 2 wraca stan po rundzie 1", [u.aTotal, u.bTotal, u.rounds.length], [12, 0, 1]);
let u2 = freshMatch();
u2 = applyRound(u2, { aHole: 4, aBoard: 0, bHole: 0, bBoard: 0 });
u2 = applyRound(u2, { aHole: 4, aBoard: 0, bHole: 0, bBoard: 0 });
check("wygrana 24:0 ustawiona", u2.winnerId, "A");
u2 = undoLastRound(u2);
check("cofniecie kasuje zwyciezce", [u2.aTotal, u2.winnerId], [12, null]);
check("undo na pustym meczu nic nie psuje", undoLastRound(freshMatch()).rounds.length, 0);

console.log("--- reducer: przebieg turnieju 4 osob ---");
function buildState(names: string[]): TournamentState {
  let s: TournamentState = { ...initialState };
  for (const n of names) s = reducer(s, { type: "ADD_PLAYER", name: n });
  s = reducer(s, { type: "CONTINUE_TO_MODE" });
  s = reducer(s, { type: "SET_MODE", mode: "solo" });
  return s;
}
let s = buildState(["P1", "P2", "P3", "P4"]);
check("4 graczy: 2 polfinaly + final = 3 mecze", s.matches.length, 3);
check("zadnych wolnych losow przy 4", s.matches.filter((x) => x.isBye).length, 0);

function playToWin(state: TournamentState, matchId: string, winnerSide: "a" | "b"): TournamentState {
  let st = state;
  for (let i = 0; i < 6; i++) {
    const match = st.matches.find((x) => x.id === matchId)!;
    if (match.winnerId) break;
    st = reducer(st, {
      type: "RECORD_ROUND",
      matchId,
      round: winnerSide === "a"
        ? { aHole: 4, aBoard: 0, bHole: 0, bBoard: 0 }
        : { aHole: 0, aBoard: 0, bHole: 4, bBoard: 0 },
    });
  }
  return st;
}
const semi1 = s.matches.find((x) => x.round === 0 && x.slot === 0)!;
const semi2 = s.matches.find((x) => x.round === 0 && x.slot === 1)!;
s = playToWin(s, semi1.id, "a");
s = playToWin(s, semi2.id, "b");
const final = s.matches.find((x) => x.round === 1)!;
check("zwyciezcy polfinalow trafili do finalu", [final.aId, final.bId], [semi1.aId, semi2.bId]);
check("brak mistrza przed finalem", s.championId, null);
s = playToWin(s, final.id, "a");
check("mistrz = zwyciezca finalu", s.championId, semi1.aId);

console.log("--- reducer: blokada undo po rozpoczeciu nastepnego meczu ---");
let g = buildState(["P1", "P2", "P3", "P4"]);
const gs1 = g.matches.find((x) => x.round === 0 && x.slot === 0)!;
g = playToWin(g, gs1.id, "a");
const gFinal = g.matches.find((x) => x.round === 1)!;
g = reducer(g, { type: "RECORD_ROUND", matchId: gFinal.id, round: { aHole: 1, aBoard: 0, bHole: 0, bBoard: 0 } });
const before = g.matches.find((x) => x.id === gs1.id)!;
g = reducer(g, { type: "UNDO_ROUND", matchId: gs1.id });
const after = g.matches.find((x) => x.id === gs1.id)!;
check("undo odrzucone gdy zwyciezca gra juz dalej", [after.winnerId, after.rounds.length], [before.winnerId, before.rounds.length]);

console.log("--- bracket: wolne losy przy 5 graczach ---");
for (let trial = 0; trial < 50; trial++) {
  const participants: Participant[] = ["A", "B", "C", "D", "E"].map((n) => ({ id: n, name: n, playerIds: [n] }));
  const { matches } = generateBracket(participants);
  const r0 = matches.filter((x) => x.round === 0);
  const emptyMatches = r0.filter((x) => !x.aId && !x.bId);
  const byes = r0.filter((x) => x.isBye);
  if (emptyMatches.length > 0 || byes.length !== 3) {
    failures++;
    console.log(`FAIL losowanie #${trial}: puste mecze=${emptyMatches.length}, byes=${byes.length}`);
    break;
  }
  if (trial === 49) console.log("OK  50 losowan drabinki 5-osobowej: zawsze 3 pojedyncze wolne losy, zero pustych meczy");
}

console.log(failures === 0 ? "\nWSZYSTKO OK" : `\n${failures} BLEDOW`);
process.exit(failures === 0 ? 0 : 1);
