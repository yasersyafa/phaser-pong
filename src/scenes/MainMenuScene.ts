import Phaser from 'phaser';
import { COLOR_LEFT, COLOR_RIGHT, DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/Constants';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.32, 'PONG', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '160px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.55, 'PRESS SPACE TO START', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.68, 'O — OPTIONS    M — MUTE', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '20px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.78, 'P1: W / S         P2: ↑ / ↓', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.drawAccent(DESIGN_WIDTH * 0.18, COLOR_LEFT);
    this.drawAccent(DESIGN_WIDTH * 0.82, COLOR_RIGHT);

    const kb = this.input.keyboard!;
    kb.once('keydown-SPACE', () => this.scene.start('Game'));
    kb.once('keydown-O', () => this.scene.start('Options'));
  }

  private drawAccent(x: number, color: number): void {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(x - 8, DESIGN_HEIGHT * 0.32 - 60, 16, 120);
  }
}
