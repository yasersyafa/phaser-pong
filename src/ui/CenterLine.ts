import Phaser from 'phaser';
import { COLOR_FG, DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/Constants';

export function drawCenterLine(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(COLOR_FG, 0.25);
  const dashH = 16;
  const gap = 14;
  const x = DESIGN_WIDTH / 2 - 2;
  for (let y = 8; y < DESIGN_HEIGHT - 8; y += dashH + gap) {
    g.fillRect(x, y, 4, dashH);
  }
  g.setDepth(-1);
  return g;
}
