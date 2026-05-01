import Phaser from 'phaser';
import { SettingsStore } from '../config/Settings';
import { audioBus } from '../systems/AudioBus';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const settings = SettingsStore.load();
    this.registry.set('settings', settings);
    audioBus.setVolume(settings.masterVolume);
    audioBus.setMuted(!settings.soundEnabled);
    this.scene.start('Preload');
  }
}
