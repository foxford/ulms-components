export const toolEnum = {
  ERASER: 'eraser',
  PAN: 'pan',
  PEN: 'pen',
  SELECT: 'select',
  SHAPE: 'shape',
  TEXT: 'textbox',
  COLOR: 'color',
  GRID: 'grid',
  IMAGE: 'image',
  LOCK: 'lock',
  STAMP: 'stamp',
  LIB: 'lib',
}

export const penToolModeEnum = {
  PENCIL: 'pencil',
  MARKER: 'marker',
  LINE: 'line',
}

export const shapeToolModeEnum = {
  CIRCLE: 'circle',
  CIRCLE_SOLID: 'circle-solid',
  RECT: 'rect',
  RECT_SOLID: 'rect-solid',
  TRIANGLE: 'triangle',
  TRIANGLE_SOLID: 'triangle-solid',
}

export const stampToolModeEnum = {
  DISLIKE: 'dislike',
  HEART: 'heart',
  LIKE: 'like',
  LOVE: 'love',
  PLEASED: 'pleased',
  QUESTION: 'question',
  SAD: 'sad',
  SMART: 'smart',
  STAR: 'star',
  TRYMORE: 'trymore',
  WELLDONE: 'welldone',
}

export const USER_LOCK_LABEL = '_lockedbyuser'

export const enhancedFields = [
  '_id',
  USER_LOCK_LABEL,
  'noScaleCache',
  'strokeUniform',
]

export const keycodes = {
  UP_KEYCODE: 38,
  DOWN_KEYCODE: 40,
  LEFT_KEYCODE: 37,
  RIGHT_KEYCODE: 39,
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
  DEL_KEYCODE: 46,
  BACKSPACE_KEYCODE: 8,
}

export const BROADCAST_MESSAGE_TYPE = 'draw-update'

export const DEBOUNCE_DELAY = 300

export const THROTTLE_DELAY = 500

export const COPY_PASTE_SHIFT = 30
