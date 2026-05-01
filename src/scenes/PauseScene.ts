import Phaser from 'phaser';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/Constants';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create(): void {
    this.add.rectangle(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, DESIGN_WIDTH, DESIGN_HEIGHT, 0x000000, 0.6);
    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.42, 'PAUSED', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '96px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.58, 'P / ESC TO RESUME    Q TO QUIT', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '24px',
        color: '#cccccc',
      })
      .setOrigin(0.5);

    const kb = this.input.keyboard!;
    kb.once('keydown-P', () => this.resumeGame());
    kb.once('keydown-ESC', () => this.resumeGame());
    kb.once('keydown-Q', () => this.quitToMenu());
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume('Game');
  }

  private quitToMenu(): void {
    this.scene.stop();
    this.scene.stop('Game');
    this.scene.start('MainMenu');
  }
}
