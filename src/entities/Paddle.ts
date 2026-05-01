import Phaser from 'phaser';
import { PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH } from '../config/Constants';
import type { Side } from '../types';

export class Paddle {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly side: Side;

  constructor(scene: Phaser.Scene, x: number, y: number, side: Side, tint: number) {
    this.side = side;
    this.sprite = scene.physics.add.sprite(x, y, 'paddle');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setTint(tint);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(PADDLE_WIDTH, PADDLE_HEIGHT, true);
    body.allowGravity = false;
    body.setImmovable(true);
    body.pushable = false;
    body.setCollideWorldBounds(true);
    body.checkCollision.up = true;
    body.checkCollision.down = true;
    body.checkCollision.left = true;
    body.checkCollision.right = true;
  }

  setInput(up: boolean, down: boolean): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (up && !down) body.setVelocityY(-PADDLE_SPEED);
    else if (down && !up) body.setVelocityY(PADDLE_SPEED);
    else body.setVelocityY(0);
  }

  resetTo(y: number): void {
    this.sprite.setY(y);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.sprite.setScale(1, 1);
  }

  get y(): number {
    return this.sprite.y;
  }

  get height(): number {
    return PADDLE_HEIGHT;
  }
}
