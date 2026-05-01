export type Side = 'left' | 'right';

export type MatchState =
  | { kind: 'idle' }
  | { kind: 'serving'; servingSide: Side }
  | { kind: 'rallying' }
  | { kind: 'scored'; scoringSide: Side }
  | { kind: 'gameOver'; winner: Side };

export interface Score {
  left: number;
  right: number;
}

export interface Settings {
  scoreLimit: number;
  ballSpeedTier: 'slow' | 'normal' | 'fast';
  juiceEnabled: boolean;
  soundEnabled: boolean;
  masterVolume: number;
}
