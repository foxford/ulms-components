/* eslint-disable no-param-reassign */
import { fabric } from 'fabric'

fabric.WhiteboardLine = fabric.WhiteboardLine || fabric.util.createClass(fabric.Line, {
  type: 'WhiteboardLine',
  initialize (points, options) {
    options || (options = { })
    // Origin is always centered
    options.originX = 'center'
    options.originY = 'center'
    this.callSuper('initialize', points, options)
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

fabric.WhiteboardLine.fromObject = fabric.WhiteboardLine.fromObject || function (object, callback) {
  // Correct the coordinates relative to top/left
  callback && callback(new fabric.WhiteboardLine([
    object.x1 + object.left,
    object.y1 + object.top,
    object.x2 + object.left,
    object.y2 + object.top,
  ], object))
}

export { fabric }
