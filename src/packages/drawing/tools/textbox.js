import { fabric } from 'fabric'

import { PositionableObject } from './object'

export class Textbox extends PositionableObject {
  constructor (canvas, objectFn, options = {}) {
    super(canvas, objectFn, options)

    this.__objectFn = objectFn || (() => new fabric.Textbox('', {
      perPixelTargetFind: false,
      borderScaleFactor: 1,
      strokeUniform: true,
      fontSize: 16,
      scaleX: 1,
      scaleY: 1,
      ...options,
      fill: options.fill || 'rgba(0,0,0,1)',
    }))
  }

  handleMouseDownEvent (opts) {
    super.handleMouseDownEvent(opts)

    this._canvas.setActiveObject(this.__object)
    this.__object.enterEditing()
  }

  handleObjectAddedEvent () {
    this.__object && this.__object.on('changed', () => {
      const object = this.__object

      const itemWidth = (5.9 + 1) * 17
      // avg. word length + 1 times avg. sentence length

      if (object.text.length > itemWidth * 2) {
        // text is greater than 2 sentences
        const nextWidth = object.canvas.width - object.getBoundingRect().left

        object.set('width', (nextWidth < itemWidth * 2) ? itemWidth * 7 : nextWidth)
      }
    })
  }
}
