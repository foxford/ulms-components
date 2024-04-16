import { calcDistance, snapCoord } from '../util'

import { PositionableObject, adjustPosition, makeNotInteractive } from './object'

const POINT_DELTA = 2

export class ShapeTool extends PositionableObject {
  constructor (canvas, objectFn, options = {}) {
    super(canvas, objectFn, options)

    this.__isOnCanvas = false
    this.__startPoint = null
    this.__isDrawing = false
    this.__currentPoint = null
    this.__shiftPressed = false
    this.__altPressed = false
    this.__cmdPressed = false
    this.__ctrlPressed = false
  }

  _reshape () {
    if (!this._active) return
    if (!this.__isDrawing) return

    if (
      this.__isOnCanvas
      || (this.__currentPoint && calcDistance(this.__startPoint, this.__currentPoint) > POINT_DELTA)
    ) {
      const currentWidth = this.__currentPoint.x - this.__startPoint.x
      const currentHeight = this.__currentPoint.y - this.__startPoint.y
      const radius = calcDistance(this.__currentPoint, this.__startPoint)

      const deltaX = Math.abs(this.__startPoint.x - this.__currentPoint.x)
      const deltaY = Math.abs(this.__startPoint.y - this.__currentPoint.y)
      const delta = deltaX - deltaY
      const multiplier = this.__altPressed ? 2 : 1

      let diff
      let width
      let height
      let scaleX
      let scaleY

      if (this.__object.type === 'circle' || this.__object.type === 'WhiteboardCircle') {
        if (this.__altPressed) {
          diff = {
            radius,
            originX: 'center',
            originY: 'center',
          }
        } else {
          diff = {
            radius: deltaX > deltaY ? deltaX / 2 : deltaY / 2,
            originX: ((currentWidth < 0) ? 'right' : 'left'),
            originY: ((currentHeight < 0) ? 'bottom' : 'top'),
          }
        }
      } else if (
        this.__object.type === 'path'
        || this.__object.type === 'WhiteboardRightTriangle'
      ) {
        const { width: originalWidth, height: originalHeight } = this.__object

        if (this.__shiftPressed) {
          if (delta > 0) {
            scaleX = currentWidth / originalWidth
            scaleY = currentWidth / originalWidth
          } else {
            scaleX = currentHeight / originalHeight
            scaleY = currentHeight / originalHeight
          }
        } else {
          scaleX = currentWidth / originalWidth
          scaleY = currentHeight / originalHeight
        }

        diff = {
          originX: this.__altPressed ? 'center' : ((currentWidth < 0) ? 'right' : 'left'),
          originY: this.__altPressed ? 'center' : ((currentHeight < 0) ? 'bottom' : 'top'),
          flipX: false,
          flipY: true,
          scaleX: scaleX * multiplier,
          scaleY: scaleY * multiplier,
        }
      } else {
        if (this.__shiftPressed) {
          if (delta > 0) {
            width = Math.abs(currentWidth)
            height = Math.abs(currentWidth)
          } else {
            width = Math.abs(currentHeight)
            height = Math.abs(currentHeight)
          }
        } else {
          width = Math.abs(currentWidth)
          height = Math.abs(currentHeight)
        }
        diff = {
          width: width * multiplier,
          height: height * multiplier,
          originX: this.__altPressed ? 'center' : ((currentWidth < 0) ? 'right' : 'left'),
          originY: this.__altPressed ? 'center' : ((currentHeight < 0) ? 'bottom' : 'top'),
          flipX: currentWidth < 0,
          flipY: currentHeight < 0,
        }
      }

      this.__object.set(diff)
      this.__object._id && this._throttledSendMessage(this.__object._id, diff)
      if (!this.__isOnCanvas) {
        this.__isOnCanvas = true
        this.__object.set({
          _noHistory: true, // Не сохраняем в undo/redo history
          _drawByStretch: true, // Признак того, что объект создается растягиванием. Для аналитиков
        })
        this._canvas.add(this.__object)
      }
      this._canvas.requestRenderAll()
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)
  }

  handleKeyDownEvent (e) {
    this.#handleKeyEvent(e)
  }

  handleKeyUpEvent (e) {
    this.#handleKeyEvent(e)
  }

  #handleKeyEvent (e) {
    const changed =
      this.__shiftPressed !== e.shiftKey
      || this.__altPressed !== e.altKey
      || this.__cmdPressed !== e.metaKey
      || this.__ctrlPressed !== e.ctrlKey

    this.__shiftPressed = e.shiftKey
    this.__altPressed = e.altKey
    this.__cmdPressed = e.metaKey
    this.__ctrlPressed = e.ctrlKey

    changed && this._reshape()
  }

  #preparePoint (e) {
    const point = this._canvas.getPointer(e)

    if (!(this.__cmdPressed || this.__ctrlPressed)) {
      return point
    }
    point.x = snapCoord(point.x)
    point.y = snapCoord(point.y)

    return point
  }

  handleMouseDownEvent (opts) {
    if (!this._active) return

    this.__resolveObject(opts)
    this.__startPoint = this.#preparePoint(opts.e)
    this.__object.set({
      left: this.__startPoint.x,
      top: this.__startPoint.y,
      hasControls: false,
      hasBorders: false,
      selectable: false,
    })

    this.__isDrawing = true
  }

  handleMouseMoveEvent (opts) {
    if (!this._active) return
    if (!this.__isDrawing) return

    this.__currentPoint = this.#preparePoint(opts.e)
    this._reshape()
  }

  handleMouseUpEvent (opts) {
    if (!this._active) return
    if (!this.__isDrawing) return

    if (!this.__isOnCanvas) {
      const [x, y] = adjustPosition(this.__object, opts.absolutePointer, this.__options.adjustCenter)

      this.__object.set({
        left: x,
        top: y,
      })
      this._canvas.add(this.__object)
    } else {
      this.__object.set({ _noHistory: undefined })
      // Чтобы объект можно было выделить!
      this.__object.setCoords()
      // Фиксируем изменения в эвенте
      this._canvas.fire('object:modified', { target: this.__object })
    }

    if (this.__options.selectOnInit) this._canvas.setActiveObject(this.__object)

    this.__isDrawing = false
    this.__isOnCanvas = false
    this.__object = null
    this.__startPoint = null
    this.__currentPoint = null
    this._canvas.renderAll()
  }
}
