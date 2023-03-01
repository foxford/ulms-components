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

export const rightTriangle = (params = {}) => new fabric.Path(trianglePath(params.width, params.height), {
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

  return new fabric.Path(trianglePath(params.width, params.height), {
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
