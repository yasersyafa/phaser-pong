import Phaser from 'phaser';

export interface MatchKeys {
  p1Up: Phaser.Input.Keyboard.Key;
  p1Down: Phaser.Input.Keyboard.Key;
  p2Up: Phaser.Input.Keyboard.Key;
  p2Down: Phaser.Input.Keyboard.Key;
  serve: Phaser.Input.Keyboard.Key;
  pause: Phaser.Input.Keyboard.Key;
  pauseAlt: Phaser.Input.Keyboard.Key;
  mute: Phaser.Input.Keyboard.Key;
  rematch: Phaser.Input.Keyboard.Key;
}

export function bindMatchKeys(scene: Phaser.Scene): MatchKeys {
  const kb = scene.input.keyboard!;
  const KC = Phaser.Input.Keyboard.KeyCodes;
  return {
    p1Up: kb.addKey(KC.W),
    p1Down: kb.addKey(KC.S),
    p2Up: kb.addKey(KC.UP),
    p2Down: kb.addKey(KC.DOWN),
    serve: kb.addKey(KC.SPACE),
    pause: kb.addKey(KC.P),
    pauseAlt: kb.addKey(KC.ESC),
    mute: kb.addKey(KC.M),
    rematch: kb.addKey(KC.R),
  };
}
