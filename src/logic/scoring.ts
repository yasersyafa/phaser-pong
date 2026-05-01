import type { Score, Side } from '../types';

export function makeScore(): Score {
  return { left: 0, right: 0 };
}

export function tickScore(score: Score, scoringSide: Side): Score {
  return scoringSide === 'left'
    ? { ...score, left: score.left + 1 }
    : { ...score, right: score.right + 1 };
}

export function isMatchOver(score: Score, scoreLimit: number): boolean {
  return score.left >= scoreLimit || score.right >= scoreLimit;
}

export function winner(score: Score, scoreLimit: number): Side | null {
  if (score.left >= scoreLimit) return 'left';
  if (score.right >= scoreLimit) return 'right';
  return null;
}
