/* eslint-disable no-param-reassign */
import { fabric } from 'fabric/dist/fabric.min'

import { defaultToolSettings } from '../constants'

// define a function that can locate the controls.
// this function will be used both for drawing and for interaction.
function linePositionHandler(dim, finalMatrix, fabricObject) {
  const { startCoords, endCoords } = fabricObject.calcLineEndpointCoords()

  if (this.pointType === 'start') {
    return startCoords
  }

  return endCoords
}

function lineStyleHandler(eventData, control, fabricObject) {
  if (fabricObject.lockLine) {
    return 'not-allowed'
  }

  return control.cursorStyle
}

function anchorWrapper(pointType) {
  return function anchorHandler(eventData, transform, x, y) {
    const fabricObject = transform.target

    if (fabricObject.lockLine) return false

    if (pointType === 'start') {
      if (
        (fabricObject.flipY && fabricObject.flipX) ||
        (!fabricObject.flipY && !fabricObject.flipX)
      ) {
        fabricObject.set({
          x1: x,
          y1: y,
        })
      } else {
        fabricObject.set({
          x1: x,
          y2: y,
        })
      }
    } else if (
      (fabricObject.flipY && fabricObject.flipX) ||
      (!fabricObject.flipY && !fabricObject.flipX)
    ) {
      fabricObject.set({
        x2: x,
        y2: y,
      })
    } else {
      fabricObject.set({
        x2: x,
        y1: y,
      })
    }

    return true
  }
}

const WhiteboardLine = fabric.util.createClass(fabric.Line, {
  type: 'WhiteboardLine',
  initialize(points, options) {
    // eslint-disable-next-line no-unused-expressions
    options || (options = {})

    options.noScaleCache = false
    // Origin is always centered
    options.originX = 'center'
    options.originY = 'center'
    options.strokeUniform = true

    this.callSuper('initialize', points, options)
    this.cornerStrokeColor = '#8A51E6'
    this.cornerColor = '#8A51E6'
    this.cornerStyle = 'rect'
    this.controls = {
      start: new fabric.Control({
        positionHandler: linePositionHandler,
        actionHandler: anchorWrapper('start'),
        cursorStyleHandler: lineStyleHandler,
        actionName: 'modifyLine',
        pointType: 'start',
        withConnection: true,
      }),
      end: new fabric.Control({
        positionHandler: linePositionHandler,
        actionHandler: anchorWrapper('end'),
        cursorStyleHandler: lineStyleHandler,
        actionName: 'modifyLine',
        pointType: 'end',
        withConnection: true,
      }),
    }
  },
  toObject(enhancedFields) {
    const resultObject = fabric.util.object.extend(
      this.callSuper('toObject', enhancedFields),
    )
    const { x1, x2, y1, y2 } = resultObject
    const { x, y } = this.getCenterPoint()

    resultObject.x1 = x + x1
    resultObject.x2 = x + x2
    resultObject.y1 = y + y1
    resultObject.y2 = y + y2

    return resultObject
  },
  _render(context) {
    this.callSuper('_render', context)
  },
})

WhiteboardLine.fromObject = function fromObject(object, callback) {
  // Correct the coordinates relative to top/left
  if (callback) {
    callback(
      new fabric.WhiteboardLine(
        [object.x1, object.y1, object.x2, object.y2],
        object,
      ),
    )
  }
}

fabric.WhiteboardLine = fabric.WhiteboardLine || WhiteboardLine

const WhiteboardArrowLine = fabric.util.createClass(fabric.WhiteboardLine, {
  type: 'WhiteboardArrowLine',
  initialize(points, options) {
    // eslint-disable-next-line no-unused-expressions
    options || (options = {})
    options.objectCaching = false
    this.callSuper('initialize', points, options)
  },
  _render(context) {
    this.callSuper('_render', context)

    // do not render if width/height are zeros or object is not visible
    if ((this.width === 0 && this.height === 0) || !this.visible) return

    context.save()

    const shiftX = this.strokeWidth / 2 - 2
    const arrowSize = 10 + Math.log10(this.strokeWidth) * 24
    const xDiff = this.x2 - this.x1
    const yDiff = this.y2 - this.y1
    const angle = Math.atan2(yDiff, xDiff)

    context.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2)
    context.rotate(angle)
    context.beginPath()
    context.moveTo(-arrowSize - shiftX, arrowSize)
    context.lineTo(0 - shiftX, 0)
    context.lineTo(-arrowSize - shiftX, -arrowSize)

    context.strokeWidth = this.strokeWidth
    context.strokeStyle = this.stroke
    context.lineCap = 'round'
    context.lineJoin = 'miter'
    context.miterLimit = 4
    context.stroke()

    context.restore()
  },
})

WhiteboardArrowLine.fromObject = function fromObject(object, callback) {
  // Correct the coordinates relative to top/left
  if (callback) {
    callback(
      new fabric.WhiteboardArrowLine(
        [object.x1, object.y1, object.x2, object.y2],
        object,
      ),
    )
  }
}

fabric.WhiteboardArrowLine = fabric.WhiteboardArrowLine || WhiteboardArrowLine

const WhiteboardCircle = fabric.util.createClass(fabric.Circle, {
  type: 'WhiteboardCircle',
  _render(context) {
    this.callSuper('_render', context)

    // для кругов с обводкой рисуем дополнительный кружочек по центру
    if (this.fill === defaultToolSettings.transparentColor) {
      context.save()
      context.beginPath()
      context.arc(
        0,
        0,
        this.strokeWidth / 2,
        fabric.util.degreesToRadians(0),
        fabric.util.degreesToRadians(360),
        false,
      )
      context.fillStyle = this.stroke
      context.fill()
      context.restore()
    }
  },
})

WhiteboardCircle.fromObject = function fromObject(object, callback) {
  if (callback) {
    callback(new fabric.WhiteboardCircle(object, callback))
  }
}

fabric.WhiteboardCircle = fabric.WhiteboardCircle || WhiteboardCircle

export { WhiteboardLine, WhiteboardArrowLine, WhiteboardCircle }
