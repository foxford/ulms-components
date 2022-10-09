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
  RIGHT_TRIANGLE: 'WhiteboardRightTriangle',
  STAR: 'WhiteboardStar',
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
  ObjectTypes.PATH,
  ObjectTypes.STAR,
  ObjectTypes.RIGHT_TRIANGLE,
]

export const LineTypes = [ObjectTypes.LINE, ObjectTypes.ARROW]

export const ColorTypes = [...ShapeTypes, ...LineTypes, ObjectTypes.TEXT]
