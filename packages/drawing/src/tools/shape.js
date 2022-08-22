import { calcDistance } from '../util'

import { PositionableObject, adjustPosition, makeNotInteractive } from './object'

const POINT_DELTA = 2

export class ShapeTool extends PositionableObject {
  constructor (canvas, objectFn, options = {}) {
    super(canvas, objectFn, options)

    this.__isOnCanvas = false
    this.__startPoint = null
    this.__isDrawing = false
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)
  }

  handleMouseDownEvent (opts) {
    if (!this._active) return

    this.__resolveObject(opts)
    this.__startPoint = this._canvas.getPointer(opts.e)
    this.__object.set({
      left: this.__startPoint.x,
      top: this.__startPoint.y,
      hasControls: false,
      hasBorders: false,
      selectable: false,
      _new: true,
    })

    this.__isDrawing = true
  }

  handleMouseMoveEvent (opts) {
    if (!this._active) return
    if (!this.__isDrawing) return

    const { x, y } = this._canvas.getPointer(opts.e)

    if (this.__isOnCanvas || calcDistance(this.__startPoint, { x, y }) > POINT_DELTA) {
      const width = x - this.__startPoint.x
      const height = y - this.__startPoint.y
      const radius = calcDistance({ x, y }, this.__startPoint)

      let diff

      if (this.__object.type === 'circle' || this.__object.type === 'WhiteboardCircle') {
        diff = {
          radius,
          originX: 'center',
          originY: 'center',
        }
      } else if (this.__object.type === 'path') {
        const { width: originalWidth, height: originalHeight } = this.__object

        diff = {
          originX: (width < 0) ? 'right' : 'left',
          originY: (height < 0) ? 'bottom' : 'top',
          flipX: false,
          flipY: false,
          scaleX: width / originalWidth,
          scaleY: height / originalHeight,
        }
      } else {
        diff = {
          width: Math.abs(width),
          height: Math.abs(height),
          originX: (width < 0) ? 'right' : 'left',
          originY: (height < 0) ? 'bottom' : 'top',
          flipX: width < 0,
          flipY: height < 0,
        }
      }

      this.__object.set(diff)

      this.__object._id && this._throttledSendMessage(this.__object._id, diff)
      if (!this.__isOnCanvas) {
        this.__isOnCanvas = true
        this._canvas.add(this.__object)
      }
      this._canvas.requestRenderAll()
    }
  }

  handleMouseUpEvent (opts) {
    if (!this._active) return
    if (!this.__isDrawing) return

    if (!this.__isOnCanvas) {
      const [x, y] = adjustPosition(this.__object, opts.absolutePointer, this.__options.adjustCenter)

      this.__object.set({
        left: x,
        top: y,
        _new: true,
      })
      this._canvas.add(this.__object)
    } else {
      // Фиксируем изменения в эвенте
      this._canvas.fire('object:modified', { target: this.__object })
    }

    if (this.__options.selectOnInit) this._canvas.setActiveObject(this.__object)

    this.__isDrawing = false
    this.__isOnCanvas = false
    this.__object = null
    this._canvas.renderAll()
  }
}
