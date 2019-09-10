/* eslint-disable */
import { fabric } from 'fabric'

export const triangle = (params = {}) => {
  return new fabric.Triangle({
    width: 100,
    height: 100,
    strokeWidth: 2,
    ...params,
    stroke: params.stroke,
    fill: params.fill || 'rgba(0,0,0,0.009)',
  })
}

export const triangleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'
  return new fabric.Triangle({
    width: 100,
    height: 100,
    strokeWidth: 2,
    ...params,
    stroke: filler,
    fill: filler,
  })
}

export const circle = (params = {}) => {
  return new fabric.Circle({
    radius: 65,
    strokeWidth: 2,
    ...params,
    stroke: params.stroke,
    fill: params.fill || 'rgba(0,0,0,0.009)',
  })
}

export const circleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'
  return new fabric.Circle({
    radius: 65,
    strokeWidth: 2,
    ...params,
    stroke: filler,
    fill: filler,
  })
}

export const rectangle = (params = {}) => {
  return new fabric.Rect({
    height: 100,
    strokeWidth: 2,
    width:100,
    ...params,
    stroke: params.stroke,
    fill: params.fill || 'rgba(0,0,0,0.009)',
  })
}

export const rectangleSolid = (params = {}) => {
  const filler = params.stroke || params.fill || 'rgba(0,0,0,1)'
  return new fabric.Rect({
    height: 100,
    strokeWidth: 2,
    width:100,
    ...params,
    stroke: filler,
    fill: filler,
  })
}
