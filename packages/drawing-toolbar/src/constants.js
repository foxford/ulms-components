export const groupTypes = {
  GROUP_COLOR: 'group-color',
  GROUP_ERASER: 'group-eraser',
  GROUP_PEN: 'group-pen',
  GROUP_SHAPE: 'group-shape',
  GROUP_STAMP: 'group-stamp',
}

export const ObjectTypes = {
  RECT: 'rect',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  TEXT: 'textbox',
  PATH: 'path',
  LINE: 'WhiteboardLine',
}

export const ShapeTypes = [ObjectTypes.RECT, ObjectTypes.CIRCLE, ObjectTypes.TRIANGLE]

export const LineTypes = [ObjectTypes.LINE, ObjectTypes.PATH]

export const ColorTypes = [...ShapeTypes, ...LineTypes, ObjectTypes.TEXT]
