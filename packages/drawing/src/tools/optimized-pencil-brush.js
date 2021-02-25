import { fabric } from 'fabric'

fabric.OptimizedPencilBrush = fabric.util.createClass(fabric.PencilBrush, {
  initialize (canvas) {
    this.callSuper('initialize', canvas)
  },

  convertPointsToSVGPath (points) {
    const path = this.callSuper('convertPointsToSVGPath', points)

    return path.map(_ => typeof _ === 'string' ? _ : fabric.util.toFixed(_, 2))
  },
})
