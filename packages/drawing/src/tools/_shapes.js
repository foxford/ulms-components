import { fabric } from 'fabric/dist/fabric.min'

import { defaultToolSettings } from '../constants'

const commonDefaults = {
  noScaleCache: false,
}

const dimensionDefaults = {
  width: 100,
  height: 100,
}

const strokeDefaults = {
  strokeWidth: 2,
  strokeUniform: true,
}

export const triangle = (params = {}) => new fabric.Triangle({
  ...commonDefaults,
  ...dimensionDefaults,
  ...strokeDefaults,
  ...params,
  stroke: params.stroke,
  fill: params.fill || defaultToolSettings.transparentColor,
  strokeLineCap: 'butt',
  strokeLineJoin: 'miter',
  strokeMiterLimit: 40,
})

export const triangleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'

  return new fabric.Triangle({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...params,
    stroke: filler,
    fill: filler,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeMiterLimit: 40,
  })
}

const trianglePath = (width = 100, height = 100) => `'M 0 0 L ${width} 0 L 0 ${height} z'`

// eslint-disable-next-line max-len
export const rightTriangle = (params = {}) => new fabric.WhiteboardRightTriangle(trianglePath(params.width, params.height), {
  ...commonDefaults,
  ...dimensionDefaults,
  ...strokeDefaults,
  ...params,
  flipY: true,
  stroke: params.stroke,
  fill: params.fill || defaultToolSettings.transparentColor,
  strokeLineCap: 'butt',
  strokeLineJoin: 'miter',
  strokeMiterLimit: 40,
})

export const rightTriangleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'

  return new fabric.WhiteboardRightTriangle(trianglePath(params.width, params.height), {
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...params,
    flipY: true,
    stroke: filler,
    fill: filler,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeMiterLimit: 40,
  })
}

function starPolygonPoints (spikeCount, outerRadius, innerRadius, startAngle = 0 /* in degrees */) {
  const cx = outerRadius
  const cy = outerRadius
  const sweep = Math.PI / spikeCount
  const points = []
  let angle = 2 * Math.PI * startAngle / 360 // in radian

  for (let i = 0; i < spikeCount; i++) {
    let x = cx + Math.cos(angle) * outerRadius
    let y = cy + Math.sin(angle) * outerRadius

    points.push({ x, y })
    angle += sweep

    x = cx + Math.cos(angle) * innerRadius
    y = cy + Math.sin(angle) * innerRadius
    points.push({ x, y })
    angle += sweep
  }

  return (points)
}

const STAR_VERTEX = 5
const STAR_DEPTH = 0.5
const starPoints = (width = 100) => starPolygonPoints(STAR_VERTEX, width / 2, (width / 2) * STAR_DEPTH, 18)

export const star = (params = {}) => new fabric.WhiteboardStar(starPoints(params.width), {
  ...commonDefaults,
  ...dimensionDefaults,
  ...strokeDefaults,
  ...params,
  flipY: true,
  stroke: params.stroke,
  fill: params.fill || defaultToolSettings.transparentColor,
  strokeLineCap: 'butt',
  strokeLineJoin: 'miter',
  strokeMiterLimit: 40,
})

export const starSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'

  return new fabric.WhiteboardStar(starPoints(params.width), {
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...params,
    flipY: true,
    stroke: filler,
    fill: filler,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeMiterLimit: 40,
  })
}

export const circle = (params = {}) => new fabric.WhiteboardCircle({
  ...commonDefaults,
  radius: 65,
  ...strokeDefaults,
  ...params,
  stroke: params.stroke,
  fill: params.fill || defaultToolSettings.transparentColor,
})

export const circleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'

  return new fabric.WhiteboardCircle({
    ...commonDefaults,
    radius: 65,
    ...strokeDefaults,
    ...params,
    stroke: filler,
    fill: filler,
  })
}

export const rectangle = (params = {}) => new fabric.Rect({
  ...commonDefaults,
  ...dimensionDefaults,
  ...strokeDefaults,
  ...params,
  stroke: params.stroke,
  fill: params.fill || defaultToolSettings.transparentColor,
})

export const rectangleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'

  return new fabric.Rect({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...params,
    stroke: filler,
    fill: filler,
  })
}
