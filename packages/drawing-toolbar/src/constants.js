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
  NEW_CIRCLE: 'WhiteboardCircle',
  TRIANGLE: 'triangle',
  TEXT: 'textbox',
  PATH: 'path',
  LINE: 'WhiteboardLine',
  ARROW: 'WhiteboardArrowLine',
}

export const ShapeTypes = [
  ObjectTypes.RECT,
  ObjectTypes.CIRCLE,
  ObjectTypes.NEW_CIRCLE,
  ObjectTypes.TRIANGLE,
]

export const LineTypes = [ObjectTypes.LINE, ObjectTypes.PATH, ObjectTypes.ARROW]

export const ColorTypes = [...ShapeTypes, ...LineTypes, ObjectTypes.TEXT]
