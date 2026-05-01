import Phaser from 'phaser';
import { COLOR_LEFT, COLOR_RIGHT, DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/Constants';
import type { Score, Side } from '../types';

interface GameOverData {
  winner: Side;
  score: Score;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    const winnerSide = data.winner;
    const winnerColor = winnerSide === 'left' ? COLOR_LEFT : COLOR_RIGHT;
    const winnerLabel = winnerSide === 'left' ? 'PLAYER 1' : 'PLAYER 2';

    this.cameras.main.setBackgroundColor(0x050505);

    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.28, `${winnerLabel} WINS`, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '96px',
        fontStyle: 'bold',
        color: toCss(winnerColor),
      })
      .setOrigin(0.5);

    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.5, `${data.score.left}  —  ${data.score.right}`, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '128px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.78, 'SPACE / R — REMATCH       ESC — MENU', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '24px',
        color: '#cccccc',
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: hint,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const kb = this.input.keyboard!;
    kb.once('keydown-SPACE', () => this.scene.start('Game'));
    kb.once('keydown-R', () => this.scene.start('Game'));
    kb.once('keydown-ESC', () => this.scene.start('MainMenu'));
  }
}

function toCss(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}
