import Phaser from 'phaser';
import { BALL_SIZE, BALL_SPEED_BASE, BALL_SPEED_TIERS, COLOR_BALL } from '../config/Constants';
import { initialServeVelocity, speedOf, type Velocity } from '../logic/ballPhysics';
import type { Settings, Side } from '../types';

export class Ball {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'ball');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setTint(COLOR_BALL);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    body.setBounce(1, 1);
    body.setCircle(BALL_SIZE / 2);
    body.setCollideWorldBounds(true, 1, 1);
  }

  attachTrail(scene: Phaser.Scene): void {
    if (this.trail) return;
    this.trail = scene.add.particles(0, 0, 'spark', {
      follow: this.sprite,
      lifespan: 280,
      speed: 0,
      scale: { start: 0.45, end: 0 },
      alpha: { start: 0.6, end: 0 },
      frequency: 18,
      blendMode: Phaser.BlendModes.ADD,
      tint: 0xffffff,
    });
    this.trail.setDepth(this.sprite.depth - 1);
  }

  setTrailEnabled(enabled: boolean): void {
    if (!this.trail) return;
    if (enabled) this.trail.start();
    else this.trail.stop();
  }

  applyVelocity(v: Velocity): void {
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(v.vx, v.vy);
  }

  serve(toward: Side, settings: Settings): void {
    const tierMul = BALL_SPEED_TIERS[settings.ballSpeedTier];
    const baseSpeed = BALL_SPEED_BASE * tierMul;
    this.applyVelocity(initialServeVelocity(toward, baseSpeed));
  }

  stopAt(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
  }

  get x(): number {
    return this.sprite.x;
  }

  get y(): number {
    return this.sprite.y;
  }

  get velocity(): Velocity {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return { vx: body.velocity.x, vy: body.velocity.y };
  }

  get speed(): number {
    return speedOf(this.velocity);
  }
}
