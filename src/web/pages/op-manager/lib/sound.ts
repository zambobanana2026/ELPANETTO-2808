// Small synthesized sound effects via the Web Audio API, so no external
// audio assets need to be shipped or loaded over the network.

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedContext) sharedContext = new AudioCtx();
  return sharedContext;
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playSuccessChime(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.16); // C5
  playTone(ctx, 659.25, now + 0.1, 0.16); // E5
  playTone(ctx, 783.99, now + 0.2, 0.28); // G5
}

export function playNeutralChime(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 349.23, now, 0.18); // F4
  playTone(ctx, 293.66, now + 0.12, 0.22); // D4
}

// A quick "cha-ching" for logging a cash expense — two fast high notes.
export function playCashRegisterChime(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playTone(ctx, 987.77, now, 0.08); // B5
  playTone(ctx, 1318.51, now + 0.06, 0.14); // E6
}
