/* eslint-disable react/prop-types */
import React, { Fragment } from 'react'
import { fabric } from 'fabric'

import { toCSSColor } from '../../util/helpers'

import DynamicPattern from './tools/dynamic-pattern'
import EraserTool from './tools/eraser'
import PanTool from './tools/pan'
import PenTool from './tools/pen'
import SelectTool from './tools/select'

export const toolEnum = {
  ERASER: 'eraser',
  PAN: 'pan',
  PEN: 'pen',
  SELECT: 'select',
}

export const penToolModeEnum = {
  PENCIL: 'pencil',
  MARKER: 'marker',
}

export class DrawingComponent extends React.Component {
  static defaultProps = {
    brushColor: {
      r: 255, g: 255, b: 255, a: 1,
    },
    brushWidth: 12,
    tool: toolEnum.PEN,
    zoom: 1,
    zoomToCenter: false,
  }

  constructor () {
    super()

    this.canvas = null
    this.canvasPattern = null
    this.canvasRef = React.createRef()
    this.canvasPatternRef = React.createRef()
    this.dynamicPattern = null
    this.ignoreObjectRemovedEvent = false
    this.tool = null
  }

  componentDidMount () {
    const {
      canDraw, tool, height, width, objects, pattern, zoom,
    } = this.props

    if (canDraw) {
      this.initCanvas()
      this.initTool(tool)
    } else {
      this.initStaticCanvas()
    }

    if (pattern) {
      this.initCanvasPattern()

      this.dynamicPattern = new DynamicPattern(this.canvasPattern)

      this.updateCanvasPatternParameters(height, width)
      this.dynamicPattern.setPattern(pattern)
      this.updateCanvasPattern()
    }

    this.updateCanvasParameters(height, width, zoom)
    this.updateCanvasObjects(objects)
  }

  componentDidUpdate (prevProps) {
    const {
      brushColor, brushMode, brushWidth, canDraw, tool, height, width, objects, pattern, zoom,
    } = this.props

    if (prevProps.canDraw !== canDraw) {
      this.destroyCanvas()

      this.canvasRef.current.style.position = 'relative'

      if (canDraw) {
        this.initCanvas()
        this.initTool(tool)
      } else {
        this.initStaticCanvas()
      }

      this.updateCanvasParameters(height, width, zoom)
      this.updateCanvasObjects(objects)
    }

    if (prevProps.pattern !== pattern) {
      if (pattern !== null) {
        if (!this.dynamicPattern) {
          this.initCanvasPattern()

          this.dynamicPattern = new DynamicPattern(this.canvasPattern)
          this.updateCanvasPatternParameters(height, width)
        }

        this.dynamicPattern.setPattern(pattern)
        this.updateCanvasPattern()
      } else {
        this.dynamicPattern.destroy()
        this.destroyCanvasPattern()
      }
    }

    if (prevProps.height !== height || prevProps.width !== width || prevProps.zoom !== zoom) {
      this.updateCanvasParameters(height, width, zoom)

      if (this.dynamicPattern) {
        this.updateCanvasPatternParameters(height, width)
        this.updateCanvasPattern()
      }
    }

    if (prevProps.objects && objects && prevProps.objects !== objects) {
      this.updateCanvasObjects(objects)
    }

    if (prevProps.tool !== tool) {
      this.initTool(tool)
    }

    if (
      prevProps.brushColor !== brushColor
      || prevProps.brushMode !== brushMode
      || prevProps.brushWidth !== brushWidth
    ) {
      this.configureTool()
    }
  }

  componentWillUnmount () {
    if (this.dynamicPattern) {
      this.dynamicPattern.destroy()
    }

    this.destroyCanvasPattern()
    this.destroyCanvas()
  }

  _handleMouseDown = (opts) => {
    this.tool.handleMouseDownEvent(opts)
  }

  _handleMouseMove = (opts) => {
    this.tool.handleMouseMoveEvent(opts)
  }

  _handleMouseUp = (opts) => {
    this.tool.handleMouseUpEvent(opts)
  }

  _handleObjectAdded = (opts) => {
    this.tool.handleObjectAddedEvent(opts)
  }

  _handleAfterRender = () => {
    this.updateCanvasPattern()
  }

  initCanvas () {
    const {
      onDraw, onObjectRemove, uniqId,
    } = this.props

    this.canvas = new fabric.Canvas('canvas')

    this.canvas.perPixelTargetFind = true // fixme: move to select tool (need setup/release methods)

    this.canvas.on('mouse:down', opt => this._handleMouseDown(opt))
    this.canvas.on('mouse:move', opt => this._handleMouseMove(opt))
    this.canvas.on('mouse:up', opt => this._handleMouseUp(opt))
    this.canvas.on('object:added', opt => this._handleObjectAdded(opt))

    this.canvas.on('object:added', (event) => {
      const object = event.target

      if (!object.remote) {
        object._id = uniqId()
        onDraw && onDraw(object.toObject(['_id']))
      } else {
        delete object.remote
      }
    })

    this.canvas.on('object:modified', (event) => {
      const object = event.target

      onDraw && onDraw(object.toObject(['_id']))
    })

    this.canvas.on('object:removed', (event) => {
      if (this.ignoreObjectRemovedEvent) return

      const object = event.target

      onObjectRemove && onObjectRemove(object.toObject(['_id']))
    })

    this.canvas.on('after:render', () => this._handleAfterRender())

    // this.canvas.on('mouse:wheel', (opt) => {
    //   const delta = opt.e.deltaY
    //   let zoom = this.canvas.getZoom()
    //
    //   zoom += delta / 200
    //
    //   if (zoom > 20) zoom = 20
    //   if (zoom < 0.1) zoom = 0.1
    //
    //   this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
    //
    //   opt.e.preventDefault()
    //   opt.e.stopPropagation()
    // })
  }

  initCanvasPattern () {
    this.canvasPattern = new fabric.StaticCanvas('canvasPattern')
  }

  initStaticCanvas () {
    this.canvas = new fabric.StaticCanvas('canvas')
  }

  updateCanvasPattern () {
    if (this.dynamicPattern) {
      this.dynamicPattern.update({
        offsetX: this.canvas.viewportTransform[4],
        offsetY: this.canvas.viewportTransform[5],
        zoom: this.canvas.getZoom(),
      })
    }
  }

  destroyCanvas () {
    if (this.canvas !== null) {
      this.canvas.clear()
      this.canvas.dispose()

      this.canvas = null
    }
  }

  destroyCanvasPattern () {
    if (this.canvasPattern !== null) {
      this.canvasPattern.clear()
      this.canvasPattern.dispose()

      this.canvasPattern = null
    }
  }

  initTool () {
    const { tool } = this.props

    switch (tool) {
      case toolEnum.ERASER:
        this.tool = new EraserTool(this.canvas)

        break

      case toolEnum.PAN:
        this.tool = new PanTool(this.canvas)

        break

      case toolEnum.PEN:
        this.tool = new PenTool(this.canvas)

        break

      case toolEnum.SELECT:
        this.tool = new SelectTool(this.canvas)

        break

      default:
        this.tool = new PenTool(this.canvas)
    }

    this.configureTool()
  }

  configureTool () {
    const {
      brushColor, brushMode, brushWidth, tool,
    } = this.props

    if (tool === toolEnum.PEN) {
      const color = brushMode === penToolModeEnum.MARKER
        ? { ...brushColor, a: 0.5 }
        : brushColor

      this.tool.configure({
        lineColor: toCSSColor(color),
        lineWidth: brushWidth,
      })
    } else {
      this.tool.configure()
    }
  }

  addImage (url, options) {
    fabric.Image.fromURL(url, (image) => {
      const { tl, br } = this.canvas.calcViewportBoundaries()

      image.set({
        left: br.x - (br.x - tl.x) / 2 - image.width / 2,
        top: br.y - (br.y - tl.y) / 2 - image.height / 2,
      })

      this.canvas.add(image)
    }, options)
  }

  updateCanvasParameters (height, width, zoom) {
    const { zoomToCenter } = this.props

    if (height && width && zoom) {
      this.canvas.setDimensions({ height, width })

      if (zoomToCenter) {
        this.canvas.zoomToPoint({ x: width / 2, y: height / 2 }, zoom)
      } else {
        this.canvas.setZoom(zoom)
      }
    }
  }

  updateCanvasPatternParameters (height, width) {
    if (height && width) {
      this.canvasPattern.setDimensions({ height, width })
    }
  }

  updateCanvasObjects (objects) {
    const canvasObjects = this.canvas.getObjects()
    const canvasObjectIds = canvasObjects.map(_ => _._id)
    const newObjectIds = objects.map(_ => _._id)
    const objectsToRemove = []

    canvasObjects.forEach((_) => {
      if (newObjectIds.indexOf(_._id) === -1) {
        objectsToRemove.push(_)
      }
    })

    if (objectsToRemove.length > 0) {
      this.ignoreObjectRemovedEvent = true
      this.canvas.remove(...objectsToRemove)
      this.ignoreObjectRemovedEvent = false
    }

    objects.forEach((_) => {
      const objIndex = canvasObjectIds.indexOf(_._id)

      if (objIndex === -1) {
        // add
        fabric.util.enlivenObjects([{ ..._, remote: true }], ([fObject]) => {
          this.canvas.add(fObject)
        })
      } else {
        // update
        canvasObjects[objIndex].set(_)
        canvasObjects[objIndex].setCoords()
      }
    })

    this.canvas.requestRenderAll()

    // this.canvas.clear()
    // this.canvas.loadFromJSON(
    //   {
    //     objects: objects.map(_ => ({ ..._, remote: true })),
    //   },
    //   () => {
    //     this.canvas.renderAll()
    //   }
    // )
  }

  render () {
    const {
      height, width, pattern,
    } = this.props

    return (
      <Fragment>
        { pattern && <canvas id='canvasPattern' ref={this.canvasPatternRef} width={width} height={height} style={{ position: 'absolute' }} /> }
        <canvas id='canvas' ref={this.canvasRef} width={width} height={height} />
      </Fragment>
    )
  }
}
