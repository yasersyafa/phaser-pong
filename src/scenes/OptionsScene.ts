import Phaser from 'phaser';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '../config/Constants';
import { SettingsStore } from '../config/Settings';
import { audioBus } from '../systems/AudioBus';
import { Telemetry } from '../systems/Telemetry';
import type { Settings } from '../types';

interface MenuItem {
  label: string;
  read: () => string;
  cycle: (dir: 1 | -1) => void;
}

export class OptionsScene extends Phaser.Scene {
  private items: MenuItem[] = [];
  private rows: Phaser.GameObjects.Text[] = [];
  private cursor = 0;
  private settings!: Settings;

  constructor() {
    super('Options');
  }

  create(): void {
    this.settings = { ...SettingsStore.load() };

    this.add
      .text(DESIGN_WIDTH / 2, 90, 'OPTIONS', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.items = [
      this.cycler('Score Limit', () => String(this.settings.scoreLimit), [5, 7, 11, 15, 21], (v) => (this.settings.scoreLimit = v)),
      this.cycler('Ball Speed', () => this.settings.ballSpeedTier.toUpperCase(), ['slow', 'normal', 'fast'] as const, (v) => (this.settings.ballSpeedTier = v)),
      this.toggle('Juice', () => this.settings.juiceEnabled, (v) => (this.settings.juiceEnabled = v)),
      this.toggle('Sound', () => this.settings.soundEnabled, (v) => (this.settings.soundEnabled = v)),
      this.cycler('Master Volume', () => Math.round(this.settings.masterVolume * 100) + '%', [0, 0.25, 0.5, 0.7, 0.85, 1.0], (v) => (this.settings.masterVolume = v)),
    ];

    this.items.forEach((item, i) => {
      const row = this.add
        .text(DESIGN_WIDTH / 2, 220 + i * 60, '', {
          fontFamily: 'ui-monospace, monospace',
          fontSize: '28px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.rows.push(row);
    });

    this.add
      .text(DESIGN_WIDTH / 2, DESIGN_HEIGHT - 80, '↑/↓ MOVE   ←/→ CHANGE   ESC SAVE & BACK', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '20px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.refresh();

    const kb = this.input.keyboard!;
    kb.on('keydown-UP', () => this.move(-1));
    kb.on('keydown-DOWN', () => this.move(1));
    kb.on('keydown-LEFT', () => this.items[this.cursor]!.cycle(-1));
    kb.on('keydown-RIGHT', () => this.items[this.cursor]!.cycle(1));
    kb.on('keydown-ESC', () => this.exit());
    kb.on('keydown-SPACE', () => this.exit());
  }

  private move(dir: 1 | -1): void {
    this.cursor = (this.cursor + dir + this.items.length) % this.items.length;
    this.refresh();
  }

  private refresh(): void {
    this.items.forEach((item, i) => {
      const isCursor = i === this.cursor;
      const row = this.rows[i]!;
      row.setText(`${isCursor ? '> ' : '  '}${item.label.padEnd(14)} : ${item.read()}`);
      row.setColor(isCursor ? '#ffd54a' : '#ffffff');
    });
  }

  private exit(): void {
    SettingsStore.save(this.settings);
    audioBus.setVolume(this.settings.masterVolume);
    audioBus.setMuted(!this.settings.soundEnabled);
    this.registry.set('settings', this.settings);
    Telemetry.optionsChanged({ ...this.settings });
    this.scene.start('MainMenu');
  }

  private cycler<T>(label: string, read: () => string, values: readonly T[], write: (v: T) => void): MenuItem {
    return {
      label,
      read,
      cycle: (dir) => {
        const current = read();
        const idx = Math.max(0, values.findIndex((v) => this.cyclerMatches(v, current)));
        const next = (idx + dir + values.length) % values.length;
        write(values[next] as T);
        this.refresh();
      },
    };
  }

  private cyclerMatches(value: unknown, displayed: string): boolean {
    if (typeof value === 'number') {
      const n = Math.round(value * 100);
      return displayed === String(value) || displayed === `${n}%`;
    }
    if (typeof value === 'string') return displayed.toUpperCase() === value.toUpperCase();
    return false;
  }

  private toggle(label: string, read: () => boolean, write: (v: boolean) => void): MenuItem {
    return {
      label,
      read: () => (read() ? 'ON' : 'OFF'),
      cycle: () => {
        write(!read());
        this.refresh();
      },
    };
  }
}
