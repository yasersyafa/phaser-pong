import Phaser from 'phaser';
import { BALL_SIZE, PADDLE_HEIGHT, PADDLE_WIDTH } from '../config/Constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    this.generateTextures();
  }

  create(): void {
    this.scene.start('MainMenu');
  }

  private generateTextures(): void {
    const paddle = this.add.graphics();
    paddle.fillStyle(0xffffff, 1);
    paddle.fillRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
    paddle.generateTexture('paddle', PADDLE_WIDTH, PADDLE_HEIGHT);
    paddle.destroy();

    const r = BALL_SIZE / 2;
    const ball = this.add.graphics();
    ball.fillStyle(0xffffff, 1);
    ball.fillCircle(r, r, r);
    ball.generateTexture('ball', BALL_SIZE, BALL_SIZE);
    ball.destroy();

    const spark = this.add.graphics();
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(8, 8, 8);
    spark.generateTexture('spark', 16, 16);
    spark.destroy();
  }
}
