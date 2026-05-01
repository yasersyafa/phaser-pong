import type { Side } from '../types';

export const Telemetry = {
  matchStarted(_meta: { scoreLimit: number; ballSpeedTier: string }): void {
    /* no-op stub: swap PostHog/Plausible later */
  },
  matchEnded(_meta: { winner: Side; leftScore: number; rightScore: number; durationMs: number }): void {
    /* no-op */
  },
  optionsChanged(_meta: Record<string, unknown>): void {
    /* no-op */
  },
};
