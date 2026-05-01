# Pong 2D

Local 2-player Pong built with Phaser 3 + Bun + TypeScript.

## Controls

| Action | Player 1 | Player 2 |
| --- | --- | --- |
| Up | `W` | `↑` |
| Down | `S` | `↓` |

Global keys:

- `Space` — start / serve / rematch
- `P` or `Esc` — pause
- `M` — mute
- `R` — rematch (on Game Over)
- `O` — options (from main menu)

## Develop

Requires [Bun](https://bun.sh) >= 1.2.

```sh
bun install
bun run dev          # http://localhost:3000
bun test             # unit tests
bun run typecheck    # tsc --noEmit
bun run build        # → dist/
bun run preview      # serve dist/
```

## Architecture

- `src/main.ts` — Phaser bootstrap.
- `src/scenes/` — Boot, Preload, MainMenu, Options, Game, Pause, GameOver.
- `src/entities/` — Paddle, Ball.
- `src/ui/` — ScoreHUD, CenterLine.
- `src/systems/` — Juice (camera shake / hit-pause / particles), AudioBus (procedural Web Audio), InputMap, Telemetry.
- `src/logic/` — pure scoring + ball physics. Unit-tested under `tests/`.
- `src/config/` — Constants + Settings (localStorage-backed).

## Manual playtest checklist

- Paddles clamp at top/bottom walls without phasing.
- Ball reflects off paddles with angle modulated by hit position.
- Ball speed ramps each rally and resets to base on score.
- Score increments correctly. First to N (default 11) wins.
- Pause / blur both pause the game; resume continues cleanly.
- Mute (`M`) and Options changes persist across reload.
- No console errors on Chrome / Firefox / Safari / Edge.
- 60 FPS with full juice enabled.
