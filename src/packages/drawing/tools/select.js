/* eslint-disable */

import { Base } from './base'

export default class SelectTool extends Base {
  constructor (canvas) {
    super(canvas)

    this._canvas.forEachObject((_) => {
      Object.assign(_, {
        evented: true,
        hoverCursor: 'move',
        selectable: true,
      })
    })
  }

  configure () {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    // this._canvas.perPixelTargetFind = true
    this._canvas.defaultCursor = 'default'
    this._canvas.setCursor('default')
  }

  handleObjectAddedEvent (opts) {
    Object.assign(opts.target, {
      evented: true,
      hoverCursor: 'move',
      selectable: true,
    })
  }
}
