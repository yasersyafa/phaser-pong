import { describe, expect, test } from 'bun:test';
import { isMatchOver, makeScore, tickScore, winner } from '../src/logic/scoring';

describe('scoring', () => {
  test('makeScore starts at 0-0', () => {
    expect(makeScore()).toEqual({ left: 0, right: 0 });
  });

  test('tickScore increments correct side, leaves other untouched', () => {
    const s0 = makeScore();
    const s1 = tickScore(s0, 'left');
    expect(s1).toEqual({ left: 1, right: 0 });
    const s2 = tickScore(s1, 'right');
    expect(s2).toEqual({ left: 1, right: 1 });
    const s3 = tickScore(s2, 'left');
    expect(s3).toEqual({ left: 2, right: 1 });
  });

  test('tickScore returns a new object (immutability)', () => {
    const s0 = makeScore();
    const s1 = tickScore(s0, 'left');
    expect(s1).not.toBe(s0);
    expect(s0).toEqual({ left: 0, right: 0 });
  });

  test('isMatchOver false below limit, true at/above limit', () => {
    expect(isMatchOver({ left: 10, right: 9 }, 11)).toBe(false);
    expect(isMatchOver({ left: 11, right: 9 }, 11)).toBe(true);
    expect(isMatchOver({ left: 5, right: 11 }, 11)).toBe(true);
    expect(isMatchOver({ left: 12, right: 9 }, 11)).toBe(true);
  });

  test('winner returns null below limit, side at limit', () => {
    expect(winner({ left: 10, right: 9 }, 11)).toBeNull();
    expect(winner({ left: 11, right: 9 }, 11)).toBe('left');
    expect(winner({ left: 5, right: 11 }, 11)).toBe('right');
  });
});
