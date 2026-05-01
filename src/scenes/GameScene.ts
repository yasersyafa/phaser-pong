import Phaser from 'phaser';
import {
  AUTO_SERVE_MS,
  BALL_SPEED_BASE,
  BALL_SPEED_TIERS,
  COLOR_BG,
  COLOR_LEFT,
  COLOR_RIGHT,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  PADDLE_OFFSET_X,
  SERVE_DELAY_MS,
} from '../config/Constants';
import { Ball } from '../entities/Ball';
import { Paddle } from '../entities/Paddle';
import { reflectVelocity } from '../logic/ballPhysics';
import { isMatchOver, makeScore, tickScore, winner } from '../logic/scoring';
import { audioBus } from '../systems/AudioBus';
import { bindMatchKeys, type MatchKeys } from '../systems/InputMap';
import { Juice } from '../systems/Juice';
import { Telemetry } from '../systems/Telemetry';
import { drawCenterLine } from '../ui/CenterLine';
import { ScoreHUD } from '../ui/ScoreHUD';
import type { MatchState, Score, Settings, Side } from '../types';

export class GameScene extends Phaser.Scene {
  private leftPaddle!: Paddle;
  private rightPaddle!: Paddle;
  private ball!: Ball;
  private hud!: ScoreHUD;
  private juice!: Juice;
  private keys!: MatchKeys;

  private state: MatchState = { kind: 'idle' };
  private score: Score = makeScore();
  private settings!: Settings;
  private serveHint: Phaser.GameObjects.Text | null = null;
  private autoServeEvent: Phaser.Time.TimerEvent | null = null;
  private matchStartTime = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    this.settings = (this.registry.get('settings') as Settings) ?? this.fallbackSettings();
    this.score = makeScore();

    this.cameras.main.setBackgroundColor(COLOR_BG);
    drawCenterLine(this);

    this.leftPaddle = new Paddle(this, PADDLE_OFFSET_X, DESIGN_HEIGHT / 2, 'left', COLOR_LEFT);
    this.rightPaddle = new Paddle(
      this,
      DESIGN_WIDTH - PADDLE_OFFSET_X,
      DESIGN_HEIGHT / 2,
      'right',
      COLOR_RIGHT,
    );

    this.ball = new Ball(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);
    this.ball.attachTrail(this);
    this.ball.setTrailEnabled(this.settings.juiceEnabled);

    this.hud = new ScoreHUD(this);
    this.hud.render(this.score);
    this.juice = new Juice(this);
    this.juice.setEnabled(this.settings.juiceEnabled);

    this.physics.world.setBounds(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    this.physics.world.checkCollision.left = false;
    this.physics.world.checkCollision.right = false;
    (this.ball.sprite.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    this.physics.world.on('worldbounds', this.onWorldBounds, this);

    this.physics.add.collider(
      this.ball.sprite,
      this.leftPaddle.sprite,
      this.handlePaddleHit('left'),
      undefined,
      this,
    );
    this.physics.add.collider(
      this.ball.sprite,
      this.rightPaddle.sprite,
      this.handlePaddleHit('right'),
      undefined,
      this,
    );

    this.keys = bindMatchKeys(this);
    this.keys.pause.on('down', () => this.requestPause());
    this.keys.pauseAlt.on('down', () => this.requestPause());
    this.keys.mute.on('down', () => this.toggleMute());
    this.keys.serve.on('down', () => this.onServeKey());

    this.game.events.on(Phaser.Core.Events.BLUR, this.onWindowBlur, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

    this.matchStartTime = this.time.now;
    Telemetry.matchStarted({ scoreLimit: this.settings.scoreLimit, ballSpeedTier: this.settings.ballSpeedTier });
    this.beginServe(Math.random() < 0.5 ? 'left' : 'right');
  }

  override update(): void {
    if (this.state.kind === 'gameOver') return;

    this.leftPaddle.setInput(this.keys.p1Up.isDown, this.keys.p1Down.isDown);
    this.rightPaddle.setInput(this.keys.p2Up.isDown, this.keys.p2Down.isDown);

    if (this.state.kind === 'rallying') {
      if (this.ball.x < -16) this.onScored('right');
      else if (this.ball.x > DESIGN_WIDTH + 16) this.onScored('left');
    }
  }

  private fallbackSettings(): Settings {
    return {
      scoreLimit: 11,
      ballSpeedTier: 'normal',
      juiceEnabled: true,
      soundEnabled: true,
      masterVolume: 0.7,
    };
  }

  private handlePaddleHit(side: Side) {
    return (_obj1: unknown, _obj2: unknown) => {
      if (this.state.kind !== 'rallying') return;
      const paddle = side === 'left' ? this.leftPaddle : this.rightPaddle;
      const tierMul = BALL_SPEED_TIERS[this.settings.ballSpeedTier];
      const minSpeed = BALL_SPEED_BASE * tierMul;
      const currentSpeed = Math.max(this.ball.speed, minSpeed);
      const v = reflectVelocity(this.ball.y, paddle.y, paddle.height, side, currentSpeed);
      this.ball.applyVelocity(v);

      const color = side === 'left' ? COLOR_LEFT : COLOR_RIGHT;
      this.juice.paddleSquash(paddle.sprite);
      this.juice.hitParticles(this.ball.x, this.ball.y, color);
      this.juice.shake(60, 0.005);
      this.juice.hitPause(40);
      this.juice.ballGlow(this.ball.sprite, color);
      audioBus.play('paddleHit');
    };
  }

  private onWorldBounds = (
    _body: Phaser.Physics.Arcade.Body,
    _up: boolean,
    _down: boolean,
    _left: boolean,
    _right: boolean,
  ): void => {
    if (this.state.kind !== 'rallying') return;
    if (_up || _down) audioBus.play('wallBounce');
  };

  private onScored(scoringSide: Side): void {
    if (this.state.kind !== 'rallying') return;
    this.state = { kind: 'scored', scoringSide };
    this.score = tickScore(this.score, scoringSide);
    this.hud.render(this.score);
    this.juice.scoreFlash(scoringSide);
    this.juice.shake(220, 0.014);
    this.juice.textPop(this.hud.textFor(scoringSide));
    audioBus.play('score');
    this.ball.stopAt(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);

    if (isMatchOver(this.score, this.settings.scoreLimit)) {
      const win = winner(this.score, this.settings.scoreLimit)!;
      this.endMatch(win);
      return;
    }

    const loser: Side = scoringSide === 'left' ? 'right' : 'left';
    this.time.delayedCall(SERVE_DELAY_MS, () => this.beginServe(loser));
  }

  private beginServe(servingSide: Side): void {
    this.state = { kind: 'serving', servingSide };
    this.ball.stopAt(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);
    this.leftPaddle.resetTo(DESIGN_HEIGHT / 2);
    this.rightPaddle.resetTo(DESIGN_HEIGHT / 2);

    if (this.serveHint) this.serveHint.destroy();
    this.serveHint = this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT - 60, `SERVING ${servingSide.toUpperCase()} — PRESS SPACE`, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '22px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    this.autoServeEvent?.remove(false);
    this.autoServeEvent = this.time.delayedCall(AUTO_SERVE_MS, () => this.launchServe());
  }

  private onServeKey(): void {
    if (this.state.kind === 'serving') this.launchServe();
  }

  private launchServe(): void {
    if (this.state.kind !== 'serving') return;
    const toward: Side = this.state.servingSide === 'left' ? 'right' : 'left';
    this.ball.serve(toward, this.settings);
    this.state = { kind: 'rallying' };
    this.serveHint?.destroy();
    this.serveHint = null;
    this.autoServeEvent?.remove(false);
    this.autoServeEvent = null;
  }

  private endMatch(win: Side): void {
    this.state = { kind: 'gameOver', winner: win };
    audioBus.play('win');
    Telemetry.matchEnded({
      winner: win,
      leftScore: this.score.left,
      rightScore: this.score.right,
      durationMs: this.time.now - this.matchStartTime,
    });
    this.time.delayedCall(800, () => {
      this.scene.start('GameOver', { winner: win, score: this.score });
    });
  }

  private requestPause(): void {
    if (this.state.kind === 'gameOver') return;
    this.scene.pause();
    this.scene.launch('Pause');
  }

  private toggleMute(): void {
    const muted = audioBus.toggleMute();
    const settings = (this.registry.get('settings') as Settings) ?? this.fallbackSettings();
    settings.soundEnabled = !muted;
    this.registry.set('settings', settings);
  }

  private onWindowBlur(): void {
    if (this.scene.isActive() && this.state.kind !== 'gameOver') {
      this.requestPause();
    }
  }

  private onShutdown(): void {
    this.physics?.world?.off('worldbounds', this.onWorldBounds, this);
    this.game?.events?.off(Phaser.Core.Events.BLUR, this.onWindowBlur, this);
    this.input?.keyboard?.removeAllListeners();
    this.autoServeEvent?.remove(false);
    this.autoServeEvent = null;
  }
}
