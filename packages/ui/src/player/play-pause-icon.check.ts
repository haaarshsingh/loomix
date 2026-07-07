// Run with: bun packages/ui/src/player/play-pause-icon.check.ts
// CSS `d` morphing requires both states of a path to have identical command
// structures; this fails loudly if someone edits the paths and breaks that.
import assert from "node:assert";
import { PLAY_PAUSE_PATHS } from "./play-pause-icon";

const structure = (d: string) => d.replace(/[^MLCSQTAZ]/gi, "");

for (const [half, states] of Object.entries(PLAY_PAUSE_PATHS)) {
  assert.strictEqual(
    structure(states.play),
    structure(states.pause),
    `${half} half: play/pause command structures differ`,
  );
}
console.log("play-pause-icon paths OK");
