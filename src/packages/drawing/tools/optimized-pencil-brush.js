import { fabric } from 'fabric'

fabric.OptimizedPencilBrush = fabric.util.createClass(fabric.PencilBrush, {
  initialize: function (canvas) {
    this.callSuper('initialize', canvas)
  },
  convertPointsToSVGPath: function (points) {
    const path = this.callSuper('convertPointsToSVGPath', points)

    return path.map(_ => typeof _ === 'string' ? _ : fabric.util.toFixed(_, 2))
  },
})
