/* eslint-disable */
import { fabric } from 'fabric/dist/fabric.min'

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

export const triangle = (params = {}) => {
  return new fabric.Triangle({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...params,
    stroke: params.stroke,
    fill: params.fill || 'rgba(0,0,0,0.009)',
  })
}

export const triangleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'

  return new fabric.Triangle({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...params,
    stroke: filler,
    fill: filler,
  })
}

export const circle = (params = {}) => {
  return new fabric.Circle({
    ...commonDefaults,
    radius: 65,
    ...strokeDefaults,
    ...params,
    stroke: params.stroke,
    fill: params.fill || 'rgba(0,0,0,0.009)',
  })
}

export const circleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'

  return new fabric.Circle({
    ...commonDefaults,
    radius: 65,
    ...strokeDefaults,
    ...params,
    stroke: filler,
    fill: filler,
  })
}

export const rectangle = (params = {}) => {
  return new fabric.Rect({
    ...commonDefaults,
    ...dimensionDefaults,
    ...strokeDefaults,
    ...params,
    stroke: params.stroke,
    fill: params.fill || 'rgba(0,0,0,0.009)',
  })
}

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
