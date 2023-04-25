export const toolEnum = {
  ERASER: 'eraser',
  PAN: 'pan',
  PEN: 'pen',
  LINE: 'line',
  SELECT: 'select',
  SHAPE: 'shape',
  TEXT: 'textbox',
  GRID: 'grid',
  IMAGE: 'image',
  STAMP: 'stamp',
  LIB: 'lib',
}

export const penToolModeEnum = {
  PENCIL: 'pencil',
  DASHED_PENCIL: 'dashed-pencil',
  MARKER: 'marker',
}

export const lineToolModeEnum = {
  LINE: 'line',
  DASHED_LINE: 'dashed-line',
  ARROW: 'arrow',
}

export const shapeToolModeEnum = {
  CIRCLE: 'circle',
  CIRCLE_SOLID: 'circle-solid',
  RECT: 'rect',
  RECT_SOLID: 'rect-solid',
  TRIANGLE: 'triangle',
  TRIANGLE_SOLID: 'triangle-solid',
  RIGHT_TRIANGLE: 'right-triangle',
  RIGHT_TRIANGLE_SOLID: 'right-triangle-solid',
}

export const stampToolModeEnum = {
  STAMP: 'stamp',
  STICKER: 'sticker',
}

export const keycodes = {
  SHIFT_KEYCODE: 16,
  ALT_KEYCODE: 18,
  CTRL_KEYCODE: 17,
  META_KEYCODE: 91,
  UP_KEYCODE: 38,
  DOWN_KEYCODE: 40,
  LEFT_KEYCODE: 37,
  RIGHT_KEYCODE: 39,
  ONE_KEYCODE: 49,
  TWO_KEYCODE: 50,
  THREE_KEYCODE: 51,
  FOUR_KEYCODE: 52,
  FIVE_KEYCODE: 53,
  SIX_KEYCODE: 54,
  SEVEN_KEYCODE: 55,
  EIGHT_KEYCODE: 56,
  NINE_KEYCODE: 57,
  ZERO_KEYCODE: 48,
  C_KEYCODE: 67,
  Z_KEYCODE: 90,
  X_KEYCODE: 88,
  A_KEYCODE: 65,
  S_KEYCODE: 83,
  D_KEYCODE: 68,
  Q_KEYCODE: 68,
  W_KEYCODE: 87,
  E_KEYCODE: 69,
  R_KEYCODE: 82,
  T_KEYCODE: 84,
  Y_KEYCODE: 89,
  F_KEYCODE: 70,
  G_KEYCODE: 71,
  H_KEYCODE: 72,
  V_KEYCODE: 86,
  B_KEYCODE: 66,
  N_KEYCODE: 78,
  U_KEYCODE: 85,
  I_KEYCODE: 73,
  O_KEYCODE: 79,
  P_KEYCODE: 80,
  J_KEYCODE: 74,
  K_KEYCODE: 75,
  L_KEYCODE: 76,
  M_KEYCODE: 77,
  PLUS_KEYCODE: 187,
  MINUS_KEYCODE: 189,
  DEL_KEYCODE: 46,
  BACKSPACE_KEYCODE: 8,
  SPACE_KEYCODE: 32,
}

export const DEBOUNCE_DELAY = 300

export const THROTTLE_DELAY = 500

export const COPY_PASTE_SHIFT = 30

export const MAX_TEXT_LENGTH = 2000

export const defaultToolSettings = {
  tool: toolEnum.PEN,
  color: '#000000',
  markerColor: '#FFCE03',
  transparentColor: 'rgba(0,0,0,0.009)',
  size: 2,
  markerSize: 8,
  markerAlpha: 0.4,
  fontSize: 48,
  shape: shapeToolModeEnum.RECT,
  line: lineToolModeEnum.LINE,
  stamp: stampToolModeEnum.STAMP,
}
