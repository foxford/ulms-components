import { Base } from './base'
import { makeNotInteractive, adjustPosition } from './object'
import {fabric} from "fabric";

const MIN_DELTA = 0.2
const POINT_DELTA = 5

export class LineTool extends Base {
  constructor (canvas, options) {
    super(canvas)

    this.__draftLine = new fabric.Line([0, 0, 1, 1], {
      fill:  'red',
      stroke: 'red',
      strokeDashArray: [5, 5],
      strokeWidth: 3,
      hasControls: false,
      hasBorders: false,
      selectable: false,
    });
    this.__draftLine.set('_draft', true);

    this.__isDrawing = false
    this.__shiftPressed = false
    this.__startX = 0
    this.__startY = 0
    this.__options = options || {}
  }

  __pointCkick(x, y) {
    return (Math.abs(this.__startX - x) < POINT_DELTA) && (Math.abs(this.__startY - y) < POINT_DELTA)
  }

  configure (props) {
    this.__color = props.lineColor
    this.__width = props.lineWidth

    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
    this._canvas.forEachObject(_ => makeNotInteractive(_))

  }

  handleKeyDownEvent(e) {
    this.__shiftPressed = e.shiftKey
  }

  handleKeyUpEvent(e) {
    this.__shiftPressed = e.shiftKey
  }

  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)
  }

  handleMouseDownEvent (opts) {

    const [x, y] = adjustPosition(this.__draftLine, opts.absolutePointer, this.__options.adjustCenter)

    this.__startX = x
    this.__startY = y
    this.__draftLine.set({'x1': x, 'y1': y, 'x2': x + 1, 'y2': y + 1})

    this._canvas.add(this.__draftLine)
    this.__isDrawing  = true
  }

  handleMouseMoveEvent (opts) {
    if(this.__isDrawing) {
      const [x, y] = adjustPosition(this.__draftLine, opts.absolutePointer, this.__options.adjustCenter)

      if(this.__shiftPressed) {
        const deltaX = Math.abs(this.__startX - x)
        const signX = Math.sign(this.__startX - x)
        const deltaY = Math.abs(this.__startY - y)
        const signY = Math.sign(this.__startY - y)
        const maxDelta = Math.max(deltaX, deltaY)
        const minDelta = Math.min(deltaX, deltaY)
        const delta = deltaX - deltaY

        if (Math.abs(delta) < (maxDelta * MIN_DELTA)){
          this.__draftLine.set({'x2': this.__startX - signX * minDelta, 'y2': this.__startY - signY * minDelta})
        } else if(delta > 0) {
          this.__draftLine.set({'x2': x, 'y2': this.__startY})
        } else {
          this.__draftLine.set({'x2': this.__startX, 'y2': y})
        }
      } else {
        this.__draftLine.set({'x2': x, 'y2': y})
      }
      this._canvas.renderAll()
    }
  }

  handleMouseUpEvent (opts) {
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
    if(this.__isDrawing) {

      const [x, y] = adjustPosition(this.__draftLine, opts.absolutePointer, this.__options.adjustCenter)
      if(this.__pointCkick(x, y)) {
        this._canvas.remove(this.__draftLine)
        this.__isDrawing = false
        this._canvas.renderAll()
        return
      }

      let line = new fabric.Line([this.__draftLine.x1, this.__draftLine.y1, this.__draftLine.x2, this.__draftLine.y2], {
        fill: this.__color,
        stroke: this.__color,
        strokeWidth: this.__width,
      });
      line.set('_new', true)
      this._canvas.add(line);

      this._canvas.remove(this.__draftLine)
      this.__isDrawing = false
      this._canvas.renderAll()


    }
  }
}
