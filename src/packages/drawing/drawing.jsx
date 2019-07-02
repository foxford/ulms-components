/* eslint-disable react/prop-types */
import React from 'react'
import { fabric } from 'fabric'

import { toCSSColor } from '../../util/helpers'

export class DrawingComponent extends React.Component {
  constructor () {
    super()

    this.canvas = null
    this.canvasRef = React.createRef()
  }

  componentDidMount () {
    const {
      brushColor, brushMode, brushWidth, canDraw, tool, height, width, objects, pageWidth,
    } = this.props

    if (canDraw) {
      this.initCanvas()
      this.updateCanvasDrawingMode(tool === 'brush')
      this.updateCanvasBrush({
        brushColor, brushMode, brushWidth,
      })
    } else {
      this.initStaticCanvas()
    }

    this.updateCanvasParameters(height, width, width / pageWidth)
    this.updateCanvasObjects(objects)
  }

  componentDidUpdate (prevProps) {
    const {
      brushColor, brushMode, brushWidth, canDraw, tool, height, width, objects, pageWidth,
    } = this.props

    if (prevProps.canDraw !== canDraw) {
      this.destroyCanvas()

      this.canvasRef.current.style.position = 'relative'

      if (canDraw) {
        this.initCanvas()
        this.updateCanvasDrawingMode(tool === 'brush')
        this.updateCanvasBrush({
          brushColor, brushMode, brushWidth,
        })
      } else {
        this.initStaticCanvas()
      }

      this.updateCanvasParameters(height, width, width / pageWidth)
      this.updateCanvasObjects(objects)
    }

    if (prevProps.height !== height || prevProps.width !== width) {
      this.updateCanvasParameters(height, width, width / pageWidth)
    }

    if (prevProps.objects && objects && prevProps.objects !== objects) {
      this.updateCanvasObjects(objects)
    }

    if (
      prevProps.brushColor !== brushColor
      || prevProps.brushMode !== brushMode
      || prevProps.brushWidth !== brushWidth
    ) {
      this.updateCanvasBrush({
        brushColor, brushMode, brushWidth,
      })
    }

    if (prevProps.tool !== tool) {
      this.updateCanvasDrawingMode(tool === 'brush')
    }
  }

  componentWillUnmount () {
    this.destroyCanvas()
  }

  initCanvas () {
    const { onDraw, onObjectClick } = this.props

    this.canvas = new fabric.Canvas('canvas')

    this.canvas.freeDrawingBrush.width = 12
    this.canvas.perPixelTargetFind = true
    this.canvas.selection = false

    this.canvas.on('mouse:up', (event) => {
      const object = event.target

      if (object !== null) {
        onObjectClick(object.toObject(['_id']))
      }
    })

    this.canvas.on('object:added', (event) => {
      const object = event.target

      if (!object.remote) {
        onDraw(object.toObject())
      } else {
        delete object.remote
      }
    })

    this.canvas.on('object:modified', (event) => {
      const object = event.target

      onDraw(object.toObject(['_id']))
    })
  }

  initStaticCanvas () {
    this.canvas = new fabric.StaticCanvas('canvas')
  }

  destroyCanvas () {
    if (this.canvas !== null) {
      this.canvas.clear()
      this.canvas.dispose()

      this.canvas = null
    }
  }

  updateCanvasDrawingMode (value) {
    this.canvas.isDrawingMode = value
  }

  updateCanvasBrush (settings) {
    const {
      brushColor, brushMode, brushWidth,
    } = settings
    const color = brushMode === 'marker'
      ? { ...brushColor, a: 0.5 }
      : brushColor

    this.canvas.freeDrawingBrush.color = toCSSColor(color)
    this.canvas.freeDrawingBrush.width = brushWidth
  }

  updateCanvasParameters (height, width, zoom) {
    if (height && width && zoom) {
      this.canvas.setHeight(height)
      this.canvas.setWidth(width)
      this.canvas.setZoom(zoom)
    }
  }

  updateCanvasObjects (objects) {
    this.canvas.clear()
    this.canvas.loadFromJSON(
      {
        objects: objects.map(_ => ({ ..._, remote: true })),
      },
      () => {
        this.canvas.renderAll()
      }
    )
  }

  render () {
    const { height, width } = this.props

    return (
      <canvas id='canvas' ref={this.canvasRef} width={width} height={height} />
    )
  }
}
