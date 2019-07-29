/* eslint-disable */

import Base from './base'

class PenTool extends Base {
  configure (props) {
    this._canvas.isDrawingMode = true
    this._canvas.freeDrawingBrush.color = props.lineColor
    this._canvas.freeDrawingBrush.width = props.lineWidth
    this._canvas.selection = false
    this._canvas.defaultCursor = 'crosshair'
    this._canvas.setCursor('crosshair')
  }
}

export default PenTool
