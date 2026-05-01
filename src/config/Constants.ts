export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

export const PADDLE_WIDTH = 16;
export const PADDLE_HEIGHT = 110;
export const PADDLE_OFFSET_X = 48;
export const PADDLE_SPEED = 520;

export const BALL_SIZE = 16;
export const BALL_SPEED_BASE = 380;
export const BALL_SPEED_MAX = 880;
export const BALL_SPEED_RAMP = 1.045;
export const MAX_BOUNCE_ANGLE_DEG = 60;

export const SCORE_LIMIT_DEFAULT = 11;

export const COLOR_BG = 0x050505;
export const COLOR_FG = 0xf2f2f2;
export const COLOR_LEFT = 0x4ac1ff;
export const COLOR_RIGHT = 0xff5577;
export const COLOR_BALL = 0xffffff;
export const COLOR_SPARK = 0xffffff;

export const SERVE_DELAY_MS = 1000;
export const AUTO_SERVE_MS = 2200;

export const BALL_SPEED_TIERS = {
  slow: 0.8,
  normal: 1.0,
  fast: 1.25,
} as const;

export const SETTINGS_STORAGE_KEY = 'pong-game-2d.settings.v1';
