import { describe, expect, test } from 'bun:test';
import {
  BALL_SPEED_MAX,
  BALL_SPEED_RAMP,
  MAX_BOUNCE_ANGLE_DEG,
} from '../src/config/Constants';
import {
  clamp,
  initialServeVelocity,
  rampSpeed,
  reflectVelocity,
  relativeHitY,
  speedOf,
} from '../src/logic/ballPhysics';

const EPS = 1e-6;

describe('ballPhysics', () => {
  test('clamp', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  test('relativeHitY produces -1 / 0 / 1 at extremes', () => {
    expect(relativeHitY(50, 100, 100)).toBe(-1);
    expect(relativeHitY(100, 100, 100)).toBe(0);
    expect(relativeHitY(150, 100, 100)).toBe(1);
  });

  test('relativeHitY clamps beyond extremes', () => {
    expect(relativeHitY(0, 100, 100)).toBe(-1);
    expect(relativeHitY(500, 100, 100)).toBe(1);
  });

  test('relativeHitY safe for zero-height paddle', () => {
    expect(relativeHitY(50, 100, 0)).toBe(0);
  });

  test('rampSpeed multiplies but caps at BALL_SPEED_MAX', () => {
    expect(rampSpeed(100)).toBeCloseTo(100 * BALL_SPEED_RAMP, 5);
    expect(rampSpeed(BALL_SPEED_MAX)).toBe(BALL_SPEED_MAX);
    expect(rampSpeed(BALL_SPEED_MAX * 2)).toBe(BALL_SPEED_MAX);
  });

  test('reflectVelocity off left paddle dead-center: pure +x', () => {
    const v = reflectVelocity(100, 100, 100, 'left', 400);
    expect(v.vx).toBeGreaterThan(0);
    expect(Math.abs(v.vy)).toBeLessThan(EPS);
  });

  test('reflectVelocity off right paddle dead-center: pure -x', () => {
    const v = reflectVelocity(100, 100, 100, 'right', 400);
    expect(v.vx).toBeLessThan(0);
    expect(Math.abs(v.vy)).toBeLessThan(EPS);
  });

  test('reflectVelocity at top of paddle aims upward (negative vy)', () => {
    const v = reflectVelocity(50, 100, 100, 'left', 400);
    expect(v.vx).toBeGreaterThan(0);
    expect(v.vy).toBeLessThan(0);
  });

  test('reflectVelocity at bottom of paddle aims downward (positive vy)', () => {
    const v = reflectVelocity(150, 100, 100, 'left', 400);
    expect(v.vx).toBeGreaterThan(0);
    expect(v.vy).toBeGreaterThan(0);
  });

  test('reflectVelocity speed is rampSpeed(currentSpeed)', () => {
    const speed = speedOf(reflectVelocity(100, 100, 100, 'left', 400));
    expect(speed).toBeCloseTo(rampSpeed(400), 4);
  });

  test('reflectVelocity max angle stays within MAX_BOUNCE_ANGLE_DEG', () => {
    const v = reflectVelocity(150, 100, 100, 'left', 400);
    const angleDeg = (Math.atan2(v.vy, v.vx) * 180) / Math.PI;
    expect(Math.abs(angleDeg)).toBeLessThanOrEqual(MAX_BOUNCE_ANGLE_DEG + 0.001);
  });

  test('initialServeVelocity goes leftward when toward=left', () => {
    for (let i = 0; i < 20; i++) {
      const v = initialServeVelocity('left', 400);
      expect(v.vx).toBeLessThan(0);
    }
  });

  test('initialServeVelocity goes rightward when toward=right', () => {
    for (let i = 0; i < 20; i++) {
      const v = initialServeVelocity('right', 400);
      expect(v.vx).toBeGreaterThan(0);
    }
  });

  test('initialServeVelocity speed equals base', () => {
    const v = initialServeVelocity('right', 400);
    expect(speedOf(v)).toBeCloseTo(400, 4);
  });
});
