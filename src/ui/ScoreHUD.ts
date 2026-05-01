import Phaser from 'phaser';
import { COLOR_LEFT, COLOR_RIGHT, DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/Constants';
import type { Score, Side } from '../types';

export class ScoreHUD {
  private leftText: Phaser.GameObjects.Text;
  private rightText: Phaser.GameObjects.Text;

  constructor(private scene: Phaser.Scene) {
    const baseStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'ui-monospace, "Courier New", monospace',
      fontSize: '128px',
      fontStyle: 'bold',
      color: '#f2f2f2',
    };
    this.leftText = scene.add
      .text(DESIGN_WIDTH * 0.32, 90, '0', baseStyle)
      .setOrigin(0.5, 0)
      .setAlpha(0.85)
      .setColor(toCss(COLOR_LEFT));
    this.rightText = scene.add
      .text(DESIGN_WIDTH * 0.68, 90, '0', baseStyle)
      .setOrigin(0.5, 0)
      .setAlpha(0.85)
      .setColor(toCss(COLOR_RIGHT));
  }

  render(score: Score): void {
    this.leftText.setText(String(score.left));
    this.rightText.setText(String(score.right));
  }

  textFor(side: Side): Phaser.GameObjects.Text {
    return side === 'left' ? this.leftText : this.rightText;
  }

  destroy(): void {
    this.leftText.destroy();
    this.rightText.destroy();
  }
}

function toCss(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}

export const _DESIGN_HEIGHT = DESIGN_HEIGHT; // re-export marker, prevents tree-shake noise
