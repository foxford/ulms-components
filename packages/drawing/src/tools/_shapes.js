import { fabric } from 'fabric/dist/fabric.min'

import { defaultToolSettings } from '../constants'

const DEFAULT_FILLER = 'rgba(0,0,0,1)'

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

export const triangle = (parameters = {}) =>
  new fabric.Triangle({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...parameters,
    stroke: parameters.stroke,
    fill: parameters.fill || defaultToolSettings.transparentColor,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeMiterLimit: 40,
  })

export const triangleSolid = (parameters = {}) => {
  const filler = parameters.stroke || parameters.fill || DEFAULT_FILLER

  return new fabric.Triangle({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...parameters,
    stroke: filler,
    fill: filler,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeMiterLimit: 40,
  })
}

const trianglePath = (width = 100, height = 100) =>
  `'M 0 0 L ${width} 0 L 0 ${height} z'`

export const rightTriangle = (parameters = {}) =>
  new fabric.Path(trianglePath(parameters.width, parameters.height), {
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...parameters,
    flipY: true,
    stroke: parameters.stroke,
    fill: parameters.fill || defaultToolSettings.transparentColor,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeMiterLimit: 40,
  })

export const rightTriangleSolid = (parameters = {}) => {
  const filler = parameters.stroke || parameters.fill || DEFAULT_FILLER

  return new fabric.Path(trianglePath(parameters.width, parameters.height), {
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...parameters,
    flipY: true,
    stroke: filler,
    fill: filler,
    strokeLineCap: 'butt',
    strokeLineJoin: 'miter',
    strokeMiterLimit: 40,
  })
}

export const circle = (parameters = {}) =>
  new fabric.WhiteboardCircle({
    ...commonDefaults,
    radius: 65,
    ...strokeDefaults,
    ...parameters,
    stroke: parameters.stroke,
    fill: parameters.fill || defaultToolSettings.transparentColor,
  })

export const circleSolid = (parameters = {}) => {
  const filler = parameters.stroke || parameters.fill || DEFAULT_FILLER

  return new fabric.WhiteboardCircle({
    ...commonDefaults,
    radius: 65,
    ...strokeDefaults,
    ...parameters,
    stroke: filler,
    fill: filler,
  })
}

export const rectangle = (parameters = {}) =>
  new fabric.Rect({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...parameters,
    stroke: parameters.stroke,
    fill: parameters.fill || defaultToolSettings.transparentColor,
  })

export const rectangleSolid = (parameters = {}) => {
  const filler = parameters.stroke || parameters.fill || DEFAULT_FILLER

  return new fabric.Rect({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...parameters,
    stroke: filler,
    fill: filler,
  })
}
