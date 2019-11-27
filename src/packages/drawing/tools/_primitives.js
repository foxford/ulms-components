import {fabric} from "fabric";


fabric.WhiteboardLine = fabric.WhiteboardLine || fabric.util.createClass(fabric.Line, {
  type: 'WhiteboardLine',
  initialize: function (points, options) {
    options || (options = { });
    // Origin всегда по центру
    options.originX = 'center'
    options.originY = 'center'
    this.callSuper('initialize', points, options)
  },
  toObject: function (enhancedFields) {
    const resObject = fabric.util.object.extend(this.callSuper('toObject', enhancedFields))
    const {x1, x2, y1, y2, top, left} = resObject

    resObject.x1 = left + x1
    resObject.x2 = left + x2
    resObject.y1 = top + y1
    resObject.y2 = top + y2

    return resObject
  },
  _render: function(ctx) {
    this.callSuper('_render', ctx)
  }
});

fabric.WhiteboardLine.fromObject = fabric.WhiteboardLine.fromObject || function(object, callback) {
  // Кореректируем координаты относительно top/left
  callback && callback(new fabric.WhiteboardLine([object.x1 + object.left, object.y1 + object.top, object.x2 + object.left, object.y2 + object.top], object))
};

export default fabric;
