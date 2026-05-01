import { BALL_SPEED_BASE, BALL_SPEED_MAX, BALL_SPEED_RAMP, MAX_BOUNCE_ANGLE_DEG } from '../config/Constants';
import type { Side } from '../types';

const DEG_TO_RAD = Math.PI / 180;

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function relativeHitY(ballY: number, paddleY: number, paddleHeight: number): number {
  const half = paddleHeight / 2;
  if (half <= 0) return 0;
  return clamp((ballY - paddleY) / half, -1, 1);
}

export interface Velocity {
  vx: number;
  vy: number;
}

export function reflectVelocity(
  ballY: number,
  paddleY: number,
  paddleHeight: number,
  hitSide: Side,
  currentSpeed: number,
): Velocity {
  const rel = relativeHitY(ballY, paddleY, paddleHeight);
  const angleDeg = rel * MAX_BOUNCE_ANGLE_DEG;
  const angleRad = angleDeg * DEG_TO_RAD;
  const newSpeed = rampSpeed(currentSpeed);
  const dirX = hitSide === 'left' ? 1 : -1;
  return {
    vx: dirX * newSpeed * Math.cos(angleRad),
    vy: newSpeed * Math.sin(angleRad),
  };
}

export function rampSpeed(currentSpeed: number): number {
  return Math.min(currentSpeed * BALL_SPEED_RAMP, BALL_SPEED_MAX);
}

export function initialServeVelocity(towardSide: Side, baseSpeed = BALL_SPEED_BASE): Velocity {
  const angleDeg = (Math.random() * 40 - 20);
  const angleRad = angleDeg * DEG_TO_RAD;
  const dirX = towardSide === 'left' ? -1 : 1;
  return {
    vx: dirX * baseSpeed * Math.cos(angleRad),
    vy: baseSpeed * Math.sin(angleRad),
  };
}

export function speedOf(v: Velocity): number {
  return Math.hypot(v.vx, v.vy);
}
