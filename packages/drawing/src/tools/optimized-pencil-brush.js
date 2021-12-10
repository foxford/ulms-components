import { fabric } from 'fabric/dist/fabric.min'

fabric.OptimizedPencilBrush = fabric.util.createClass(fabric.PencilBrush, {
  initialize (canvas) {
    this.callSuper('initialize', canvas)

    this._active = true
  },
  convertPointsToSVGPath (points) {
    const path = this.callSuper('convertPointsToSVGPath', points)

    return path.map((_) => {
      if (typeof _ === 'number') return fabric.util.toFixed(_, 2)
      if (typeof _ === 'object') {
        // eslint-disable-next-line no-param-reassign
        Object.keys(_).forEach((key) => { _[key] = (typeof _[key] === 'number') ? fabric.util.toFixed(_[key], 2) : _[key] })
      }

      return _
    })
  },
  _render () {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('_render')
  },
  _finalizeAndAddPath () {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('_finalizeAndAddPath')
  },
  onMouseDown (pointer, options) {
    if (!this._active) return

    this.callSuper('onMouseDown', pointer, options)
  },
  onMouseMove (pointer, options) {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('onMouseMove', pointer, options)
  },
  onMouseUp (options) {
    if (!this._active) return
    if (!this._points.length) return

    this.callSuper('onMouseUp', options)
  },
  setActiveValue (value) {
    this._active = value
  },
  reset () {
    this._reset()
    this._resetShadow()
    this.canvas.clearContext(this.canvas.contextTop)
    this.canvas.requestRenderAll()
    this.oldEnd = undefined
  },
})
