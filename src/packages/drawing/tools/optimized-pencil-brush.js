import { fabric } from 'fabric'

fabric.OptimizedPencilBrush = fabric.util.createClass(fabric.PencilBrush, {
  initialize: function (canvas) {
    this.callSuper('initialize', canvas)

    this._active = true
  },
  convertPointsToSVGPath: function (points) {
    const path = this.callSuper('convertPointsToSVGPath', points)

    return path.map(_ => typeof _ === 'string' ? _ : fabric.util.toFixed(_, 2))
  },
  _render: function () {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('_render')
  },
  _finalizeAndAddPath: function () {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('_finalizeAndAddPath')
  },
  onMouseDown: function (pointer, options) {
    if (!this._active) return

    this.callSuper('onMouseDown', pointer, options)
  },
  onMouseMove: function (pointer, options) {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('onMouseMove', pointer, options)
  },
  onMouseUp: function (options) {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('onMouseUp', options)
  },
  setActiveValue: function (value) {
    this._active = value
  },
  reset: function () {
    this._reset()
    this._resetShadow()
    this.canvas.clearContext(this.canvas.contextTop)
    this.canvas.requestRenderAll()
    this.oldEnd = undefined
  },
})
