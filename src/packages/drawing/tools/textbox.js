import { fabric } from 'fabric'

import { PositionableObject, makeNotInteractive, adjustPosition } from './object'

export class Textbox extends PositionableObject {
  constructor (canvas, objectFn, options = {}) {
    super(canvas, objectFn, options)

    this.__lastAdded = undefined

    this.__objectFn = objectFn || (() => new fabric.Textbox('', {
      backgroundColor: 'rgba(0,0,0,0.009)', // FIXME: should be removed on select & eraser update
      borderScaleFactor: 1,
      fill: 'rgba(0,0,0,1)',
      padding: 7,
      perPixelTargetFind: false,
      scaleX: 0.5,
      scaleY: 0.5,
      strokeUniform: true,
      ...options,
    }))
  }

  handleObjectAddedEvent (opts) {
    this.__lastAdded = opts.target
    // memoize object was created last

    makeNotInteractive(opts.target)

    this.__object && this.__object.on('changed', () => {
      const object = this.__object

      const itemWidth = (5.9 + 1) * 17
      // avg. word length + 1 times avg. sentence length

      if (object.text.length > itemWidth * 2) {
        // text is greater than 2 sentences
        const nextWidth = object.canvas.width - object.getBoundingRect().left

        object.set('width', (nextWidth < itemWidth * 2) ? itemWidth * 10 : nextWidth)
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

    this.__object.set('left', x)
    this.__object.set('top', y)

    this._canvas.add(this.__object)

    this._canvas.setActiveObject(this.__object)
    this.__object.enterEditing()
  }
}
