import { calcDistance, snapCoord } from '../util'

import {
  PositionableObject,
  adjustPosition,
  makeNotInteractive,
} from './object'

const POINT_DELTA = 2

// eslint-disable-next-line import/prefer-default-export
export class ShapeTool extends PositionableObject {
  constructor(canvas, objectFunction, options = {}) {
    super(canvas, objectFunction, options)

    this.__isOnCanvas = false
    this.__startPoint = null
    this.__isDrawing = false
    this.__currentPoint = null
    this.__shiftPressed = false
    this.__altPressed = false
    this.__cmdPressed = false
    this.__ctrlPressed = false
  }

  _reshape() {
    if (!this._active) return
    if (!this.__isDrawing) return

    if (
      this.__isOnCanvas ||
      (this.__currentPoint &&
        calcDistance(this.__startPoint, this.__currentPoint) > POINT_DELTA)
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

      if (
        this.__object.type === 'circle' ||
        this.__object.type === 'WhiteboardCircle'
      ) {
        diff = this.__altPressed
          ? {
              radius,
              originX: 'center',
              originY: 'center',
            }
          : {
              radius: deltaX > deltaY ? deltaX / 2 : deltaY / 2,
              originX: currentWidth < 0 ? 'right' : 'left',
              originY: currentHeight < 0 ? 'bottom' : 'top',
            }
      } else if (
        this.__object.type === 'path' ||
        this.__object.type === 'WhiteboardRightTriangle'
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
          originX: this.__altPressed
            ? 'center'
            : currentWidth < 0
              ? 'right'
              : 'left',
          originY: this.__altPressed
            ? 'center'
            : currentHeight < 0
              ? 'bottom'
              : 'top',
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
          originX: this.__altPressed
            ? 'center'
            : currentWidth < 0
              ? 'right'
              : 'left',
          originY: this.__altPressed
            ? 'center'
            : currentHeight < 0
              ? 'bottom'
              : 'top',
          flipX: currentWidth < 0,
          flipY: currentHeight < 0,
        }
      }

      this.__object.set(diff)

      if (this.__object._id) {
        this._throttledSendMessage(this.__object._id, diff)
      }

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
  handleObjectAddedEvent(options) {
    makeNotInteractive(options.target)
  }

  handleKeyDownEvent(event) {
    this.#handleKeyEvent(event)
  }

  handleKeyUpEvent(event) {
    this.#handleKeyEvent(event)
  }

  #handleKeyEvent(event) {
    const changed =
      this.__shiftPressed !== event.shiftKey ||
      this.__altPressed !== event.altKey ||
      this.__cmdPressed !== event.metaKey ||
      this.__ctrlPressed !== event.ctrlKey

    this.__shiftPressed = event.shiftKey
    this.__altPressed = event.altKey
    this.__cmdPressed = event.metaKey
    this.__ctrlPressed = event.ctrlKey

    if (changed) this._reshape()
  }

  #preparePoint(event) {
    const point = this._canvas.getPointer(event)

    if (!(this.__cmdPressed || this.__ctrlPressed)) {
      return point
    }
    point.x = snapCoord(point.x)
    point.y = snapCoord(point.y)

    return point
  }

  handleMouseDownEvent(options) {
    if (!this._active) return

    this.__resolveObject(options)
    this.__startPoint = this.#preparePoint(options.e)
    this.__object.set({
      left: this.__startPoint.x,
      top: this.__startPoint.y,
      hasControls: false,
      hasBorders: false,
      selectable: false,
    })

    this.__isDrawing = true
  }

  handleMouseMoveEvent(options) {
    if (!this._active) return
    if (!this.__isDrawing) return

    this.__currentPoint = this.#preparePoint(options.e)
    this._reshape()
  }

  handleMouseUpEvent(options) {
    if (!this._active) return
    if (!this.__isDrawing) return

    if (this.__isOnCanvas) {
      this.__object.set({ _noHistory: undefined })
      // Чтобы объект можно было выделить!
      this.__object.setCoords()
      // Фиксируем изменения в эвенте
      this._canvas.fire('object:modified', { target: this.__object })
    } else {
      const [x, y] = adjustPosition(
        this.__object,
        options.absolutePointer,
        this.__options.adjustCenter,
      )

      this.__object.set({
        left: x,
        top: y,
      })
      this._canvas.add(this.__object)
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
