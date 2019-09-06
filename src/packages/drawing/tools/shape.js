import { PositionableObject, adjustPosition } from './object'

export class ShapeTool extends PositionableObject {
  constructor (canvas, objectFn, options = {}) {
    super(canvas, objectFn, options)

    this.__isEditing = false
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent () { }

  handleMouseDownEvent (opts) {
    if (this.__isEditing) return
    this.__isEditing = true

    this.__resolveObject(opts)

    const [x, y] = adjustPosition(this.__object, opts.absolutePointer, this.__options.adjustCenter)

    this.__object.set('left', x)
    this.__object.set('top', y)

    this._canvas.add(this.__object)

    this.__object.set('_new', true)
    // mark shape as new one

    this._canvas.setActiveObject(this.__object)
  }
}
