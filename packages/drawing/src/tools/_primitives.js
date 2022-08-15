/* eslint-disable no-param-reassign */
import { fabric } from 'fabric/dist/fabric.min'

// define a function that can locate the controls.
// this function will be used both for drawing and for interaction.
function linePositionHandler (dim, finalMatrix, fabricObject) {
  const { startCoords, endCoords } = fabricObject.calcLineEndpointCoords()

  if (this.pointType === 'start') {
    return startCoords
  }

  return endCoords
}

function anchorWrapper (pointType) {
  return function anchorHandler (eventData, transform, x, y) {
    const fabricObject = transform.target

    if (pointType === 'start') {
      fabricObject.set({ 'x1': x, 'y1': y })
    } else {
      fabricObject.set({ 'x2': x, 'y2': y })
    }

    return true
  }
}

const WhiteboardLine = fabric.util.createClass(fabric.Line, {
  type: 'WhiteboardLine',
  initialize (points, options) {
    options || (options = { })

    options.noScaleCache = false
    // Origin is always centered
    options.originX = 'center'
    options.originY = 'center'
    options.strokeUniform = true

    this.callSuper('initialize', points, options)
    this.cornerStrokeColor = '#1A96F6'
    this.cornerColor = '#1A96F6'
    this.cornerStyle = 'rect'
    this.controls = {
      start: new fabric.Control({
        positionHandler: linePositionHandler,
        actionHandler: anchorWrapper('start'),
        actionName: 'modifyLine',
        pointType: 'start',
        withConnection: true,
      }),
      end: new fabric.Control({
        positionHandler: linePositionHandler,
        actionHandler: anchorWrapper('end'),
        actionName: 'modifyLine',
        pointType: 'end',
        withConnection: true,
      }),
    }
  },
  toObject (enhancedFields) {
    const resObject = fabric.util.object.extend(this.callSuper('toObject', enhancedFields))
    const {
      x1, x2, y1, y2,
    } = resObject
    const { x, y } = this.getCenterPoint()

    resObject.x1 = x + x1
    resObject.x2 = x + x2
    resObject.y1 = y + y1
    resObject.y2 = y + y2

    return resObject
  },
  _render (ctx) {
    this.callSuper('_render', ctx)
  },
})

WhiteboardLine.fromObject = function fromObject (object, callback) {
  // Correct the coordinates relative to top/left
  callback && callback(new fabric.WhiteboardLine([
    object.x1 + object.left,
    object.y1 + object.top,
    object.x2 + object.left,
    object.y2 + object.top,
  ], object))
}

fabric.WhiteboardLine = fabric.WhiteboardLine || WhiteboardLine

export { WhiteboardLine }
