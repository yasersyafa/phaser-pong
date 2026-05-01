import Phaser from 'phaser';
import { COLOR_LEFT, COLOR_RIGHT, DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/Constants';
import type { Side } from '../types';

export class Juice {
  private enabled = true;

  constructor(private scene: Phaser.Scene) {}

  setEnabled(v: boolean): void {
    this.enabled = v;
  }

  shake(duration: number, intensity: number): void {
    if (!this.enabled) return;
    this.scene.cameras.main.shake(duration, intensity);
  }

  hitPause(ms: number): void {
    if (!this.enabled) return;
    this.scene.physics.world.pause();
    this.scene.time.delayedCall(ms, () => this.scene.physics.world.resume());
  }

  paddleSquash(target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle): void {
    if (!this.enabled) return;
    this.scene.tweens.add({
      targets: target,
      scaleX: 0.7,
      scaleY: 1.25,
      duration: 60,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  hitParticles(x: number, y: number, color: number): void {
    if (!this.enabled) return;
    const emitter = this.scene.add.particles(x, y, 'spark', {
      speed: { min: 80, max: 220 },
      lifespan: 280,
      quantity: 10,
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    });
    emitter.explode(10, x, y);
    this.scene.time.delayedCall(400, () => emitter.destroy());
  }

  scoreFlash(side: Side): void {
    if (!this.enabled) return;
    const color = side === 'left' ? COLOR_LEFT : COLOR_RIGHT;
    const flash = this.scene.add
      .rectangle(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, DESIGN_WIDTH, DESIGN_HEIGHT, color, 0.35)
      .setDepth(1000);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 260,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  textPop(target: Phaser.GameObjects.Text | Phaser.GameObjects.BitmapText): void {
    if (!this.enabled) return;
    this.scene.tweens.add({
      targets: target,
      scale: 1.4,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  ballGlow(ball: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, color: number): void {
    if (!this.enabled) return;
    ball.setTint(color);
    this.scene.time.delayedCall(160, () => ball.clearTint());
  }
}
