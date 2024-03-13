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
  ObjectTypes.PATH,
]

export const LineTypes = [ObjectTypes.LINE, ObjectTypes.ARROW]

export const ColorTypes = [...ShapeTypes, ...LineTypes, ObjectTypes.TEXT]

export const settingsGroupContainerStyles = { marginTop: '-16px', marginLeft: '-2px' }

export const contextMenuContainerStyles = direction => ({
  left: '-12px', padding: '8px 12px', top: direction === 'top' ? '2px' : '-2px',
})
