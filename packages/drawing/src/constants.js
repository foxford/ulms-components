export const toolEnum = {
  ERASER: 'eraser',
  PAN: 'pan',
  PEN: 'pen',
  SELECT: 'select',
  SHAPE: 'shape',
  TEXT: 'textbox',
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
  DEL_KEYCODE: 46,
  BACKSPACE_KEYCODE: 8,
}

export const BROADCAST_MESSAGE_TYPE = 'draw-update'

export const DEBOUNCE_DELAY = 300

export const THROTTLE_DELAY = 500

export const COPY_PASTE_SHIFT = 30
