import { fabric } from 'fabric/dist/fabric.min'

import { defaultToolSettings } from '../constants'

import { PositionableObject, makeNotInteractive, adjustPosition } from './object'

export class TextboxTool extends PositionableObject {
  constructor (canvas, objectFn, options = {}) {
    super(canvas, objectFn, options)

    const { fontSize, ...restOptions } = options

    this.__fontSize = fontSize || defaultToolSettings.fontSize

    this.__lastAdded = undefined

    this.__objectFn = objectFn || (() => new fabric.Textbox('', {
      backgroundColor: defaultToolSettings.transparentColor, // FIXME: should be removed on select & eraser update
      borderScaleFactor: 1,
      fill: 'rgba(0,0,0,1)',
      padding: 7,
      perPixelTargetFind: false,
      scaleX: 0.5,
      scaleY: 0.5,
      strokeUniform: true,
      width: 600,
      ...restOptions,
    }))
  }

  handleTextEditEndEvent () {
  }

  handleObjectAddedEvent (opts) {
    this.__lastAdded = opts.target
    // memoize object was created last

    makeNotInteractive(opts.target)

    this.__object && this.__object.on('changed', () => {
      const object = this.__object

      if (object._unwrappedTextLines.length === 1 && object._textLines.length === 1) {
        const w = object.measureLine(0).width

        if ((object.get('width') - w) < 50) {
          object.set('width', w + 50)
        }
      }
    })
  }

  handleMouseDownEvent (opts) {
    if (this.__lastAdded) {
      const { x: nextObjX, y: nextObjY } = opts.absolutePointer
      const { x: lastX, y: lastY } = this.__lastAdded.aCoords.tl
      const { width: lastW, height: lastH } = this.__lastAdded.getBoundingRect()

      const isBetweenXDim = lastX <= nextObjX && nextObjX <= (lastX + lastW)
      const isBetweenYDim = lastY <= nextObjY && nextObjY <= (lastY + lastH)

      if (isBetweenXDim && isBetweenYDim) return
    }

    this.__resolveObject()

    const [x, y] = adjustPosition(this.__object, opts.absolutePointer, this.__options.adjustCenter)

    this.__object.set({
      left: x,
      top: y,
      fontSize: this.__fontSize,
    })

    this._canvas.add(this.__object)

    this._canvas.setActiveObject(this.__object)
    this.__object.enterEditing()
  }

  handleTextEditStartEvent () {
    if (this.__object && this.__object.hiddenTextarea) {
      this.__object.hiddenTextarea.style.width = '10px'
      this.__object.hiddenTextarea.style.height = '10px'
      this.__object.hiddenTextarea.style.fontSize = '10px'
    }
  }
}
