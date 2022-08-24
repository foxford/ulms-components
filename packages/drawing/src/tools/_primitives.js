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

    const linePoints = fabricObject.calcLinePoints()
    const scaleX = fabricObject.scaleX || 1
    const scaleY = fabricObject.scaleY || 1
    const zoom = fabricObject.canvas.getZoom()
    const canvasX = fabricObject.canvas.viewportTransform[4]
    const canvasY = fabricObject.canvas.viewportTransform[5]
    let x1; let x2; let y1; let
      y2

    if ((fabricObject.flipY && fabricObject.flipX) || (!fabricObject.flipY && !fabricObject.flipX)) {
      x1 = canvasX + (fabricObject.left + linePoints.x1 * scaleX) * zoom
      y1 = canvasY + (fabricObject.top + linePoints.y1 * scaleY) * zoom
      x2 = canvasX + (fabricObject.left + linePoints.x2 * scaleX) * zoom
      y2 = canvasY + (fabricObject.top + linePoints.y2 * scaleY) * zoom
    } else {
      x1 = canvasX + (fabricObject.left + linePoints.x1 * scaleX) * zoom
      y1 = canvasY + (fabricObject.top + linePoints.y2 * scaleY) * zoom
      x2 = canvasX + (fabricObject.left + linePoints.x2 * scaleX) * zoom
      y2 = canvasY + (fabricObject.top + linePoints.y1 * scaleY) * zoom
    }

    if (pointType === 'start') {
      if ((fabricObject.flipY && fabricObject.flipX) || (!fabricObject.flipY && !fabricObject.flipX)) {
        fabricObject.set({
          x1: x, y1: y, x2, y2,
        })
      } else {
        fabricObject.set({
          x1: x, y2: y, x2, y1,
        })
      }
    } else if ((fabricObject.flipY && fabricObject.flipX) || (!fabricObject.flipY && !fabricObject.flipX)) {
      fabricObject.set({
        x2: x, y2: y, x1, y1,
      })
    } else {
      fabricObject.set({
        x2: x, y1: y, x1, y2,
      })
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

const WhiteboardArrowLine = fabric.util.createClass(fabric.WhiteboardLine, {
  type: 'WhiteboardArrowLine',
  initialize (points, options) {
    options || (options = { })
    options.objectCaching = false
    this.callSuper('initialize', points, options)
  },
  _render (ctx) {
    this.callSuper('_render', ctx)

    // do not render if width/height are zeros or object is not visible
    if (this.width === 0 || this.height === 0 || !this.visible) return

    ctx.save()

    const shiftX = this.strokeWidth / 2 - 2
    const arrowSize = 10 + Math.log10(this.strokeWidth) * 24
    const xDiff = this.x2 - this.x1
    const yDiff = this.y2 - this.y1
    const angle = Math.atan2(yDiff, xDiff)

    ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(-arrowSize - shiftX, arrowSize)
    ctx.lineTo(0 - shiftX, 0)
    ctx.lineTo(-arrowSize - shiftX, -arrowSize)

    ctx.strokeWidth = this.strokeWidth
    ctx.strokeStyle = this.stroke
    ctx.lineCap = 'round'
    ctx.lineJoin = 'miter'
    ctx.miterLimit = 4
    ctx.stroke()

    ctx.restore()
  },
})

WhiteboardArrowLine.fromObject = function fromObject (object, callback) {
  // Correct the coordinates relative to top/left
  callback && callback(new fabric.WhiteboardArrowLine([
    object.x1 + object.left,
    object.y1 + object.top,
    object.x2 + object.left,
    object.y2 + object.top,
  ], object))
}

fabric.WhiteboardArrowLine = fabric.WhiteboardArrowLine || WhiteboardArrowLine

const WhiteboardCircle = fabric.util.createClass(fabric.Circle, {
  type: 'WhiteboardCircle',
  _render (ctx) {
    this.callSuper('_render', ctx)

    // для кругов с обводкой рисуем дополнительный кружочек по центру
    if (this.fill === 'rgba(0,0,0,0.009)') {
      ctx.save()
      ctx.beginPath()
      ctx.arc(
        0,
        0,
        this.strokeWidth / 2,
        fabric.util.degreesToRadians(0),
        fabric.util.degreesToRadians(360),
        false
      )
      ctx.fillStyle = this.stroke
      ctx.fill()
      ctx.restore()
    }
  },
})

WhiteboardCircle.fromObject = function fromObject (object, callback) {
  callback && callback(new fabric.WhiteboardCircle(object, callback))
}

fabric.WhiteboardCircle = fabric.WhiteboardCircle || WhiteboardCircle

export { WhiteboardLine, WhiteboardArrowLine, WhiteboardCircle }
