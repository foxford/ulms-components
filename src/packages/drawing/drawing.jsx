/* eslint-disable react/prop-types */
import React, { Fragment } from 'react'
import { fabric } from 'fabric'

import { toCSSColor } from '../../util/helpers'

import DynamicPattern from './tools/dynamic-pattern'
import EraserTool from './tools/eraser'
import PanTool from './tools/pan'
import PenTool from './tools/pen'
import SelectTool from './tools/select'
import { PositionableObject } from './tools/object'
import { Textbox } from './tools/textbox'
import {
  circle,
  circleSolid,
  rectangle,
  rectangleSolid,
  triangle,
  triangleSolid,
} from './tools/shapes'

export const toolEnum = {
  ERASER: 'eraser',
  PAN: 'pan',
  PEN: 'pen',
  SELECT: 'select',
  SHAPE_CIRCLE_SOLID: 'shape-circle-solid',
  SHAPE_CIRCLE: 'shape-circle',
  SHAPE_SQUARE_SOLID: 'shape-square-solid',
  SHAPE_SQUARE: 'shape-square',
  SHAPE_TRIAG_SOLID: 'shape-triangle-solid',
  SHAPE_TRIAG: 'shape-triangle',
  TEXT: 'textbox',
}

export const penToolModeEnum = {
  PENCIL: 'pencil',
  MARKER: 'marker',
}

class TokenProvider {
  constructor () {
    this._provider = null
    this._rq = []
  }

  setProvider (provider) {
    this._provider = provider

    if (this._provider !== null) {
      this._provider()
        .then((token) => {
          this._rq.forEach((p) => {
            p.resolve(token)
          })

          this._rq = []

          return null
        })
        .catch(error => console.log(error)) // eslint-disable-line no-console
    }
  }

  getToken () {
    let p

    if (this._provider === null) {
      p = new Promise((resolve, reject) => {
        this._rq.push({ resolve, reject })
      })
    } else {
      p = this._provider()
    }

    return p
  }
}

const tp = new TokenProvider()

function matchesStorageURIScheme (url) {
  const re = /^.*\/api\/v1\/buckets\/(.*)\/sets\/(.*)\/objects\/(.*)$/

  return url.match(re)
}

const originalFabricLoadImegeFn = fabric.util.loadImage

fabric.util.loadImage = function loadImage (url, callback, context, crossOrigin) {
  if (matchesStorageURIScheme(url)) {
    tp.getToken()
      .then((token) => {
        originalFabricLoadImegeFn(`${url}?access_token=${token}`, callback, context, crossOrigin)

        return null
      })
      .catch(error => console.log(error)) // eslint-disable-line no-console
  } else {
    originalFabricLoadImegeFn(url, callback, context, crossOrigin)
  }
}

function maybeRemoveToken (object) {
  if (object.type === 'image' && object.src.indexOf('?access_token=') !== -1) {
    object.src = object.src.split('?')[0] // eslint-disable-line
  }

  return object
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
      canDraw, tool, height, width, objects, pattern, tokenProvider, zoom,
    } = this.props

    tp.setProvider(tokenProvider)

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

    if (
      prevProps.tool !== tool
      || prevProps.brushColor !== brushColor
    ) {
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
    tp.setProvider(null)

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
      onDraw,
      onDrawUpdate,
      onObjectRemove,
      uniqId,
    } = this.props

    this.canvas = new fabric.Canvas('canvas')

    this.canvas.perPixelTargetFind = true // fixme: move to select tool (need setup/release methods)

    this.canvas.on('mouse:down', opt => this._handleMouseDown(opt))
    this.canvas.on('mouse:move', opt => this._handleMouseMove(opt))
    this.canvas.on('mouse:up', opt => this._handleMouseUp(opt))
    this.canvas.on('object:added', opt => this._handleObjectAdded(opt))

    this.canvas.on('object:added', (event) => {
      const object = event.target
      const { injectContextData } = this.props
      let serializedObj

      if (!object.remote) {
        object._id = uniqId()
        serializedObj = injectContextData ? injectContextData(object) : object.toObject(['_id'])

        object.type !== toolEnum.TEXT && onDraw && onDraw(maybeRemoveToken(serializedObj))
      } else {
        delete object.remote
      }
    })

    this.canvas.on('object:modified', (event) => {
      const object = event.target
      const { injectContextData } = this.props
      const serializedObj = injectContextData ? injectContextData(object) : object.toObject(['_id'])

      if (object.type === toolEnum.TEXT && object._textBeforeEdit === '') {
        onDraw && onDraw(maybeRemoveToken(serializedObj))
      } else {
        onDrawUpdate && onDrawUpdate(serializedObj)
      }
    })

    this.canvas.on('object:removed', (event) => {
      if (this.ignoreObjectRemovedEvent) return

      const object = event.target

      onObjectRemove && onObjectRemove(maybeRemoveToken(object.toObject(['_id'])))
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

  initTool (tool) {
    const { brushColor } = this.props

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

      case toolEnum.TEXT:
        this.tool = new Textbox(this.canvas, undefined, {
          fill: toCSSColor(brushColor),
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        })

        break

      case toolEnum.SHAPE_CIRCLE:
        this.tool = new PositionableObject(
          this.canvas,
          () => circle({ stroke: toCSSColor(brushColor) }),
          { adjustCenter: '-0.5 -0.5' }
        )
        break

      case toolEnum.SHAPE_CIRCLE_SOLID:
        this.tool = new PositionableObject(
          this.canvas,
          () => circleSolid({ fill: toCSSColor(brushColor) }),
          { adjustCenter: '-0.5 -0.5' }
        )
        break

      case toolEnum.SHAPE_SQUARE:
        this.tool = new PositionableObject(
          this.canvas,
          () => rectangle({
            width: 97.2,
            height: 97.2,
            stroke: toCSSColor(brushColor),
          }),
          { adjustCenter: '0 -1' }
        )
        break

      case toolEnum.SHAPE_SQUARE_SOLID:
        this.tool = new PositionableObject(
          this.canvas,
          () => rectangleSolid({
            width: 97.2,
            height: 97.2,
            fill: toCSSColor(brushColor),
          }),
          { adjustCenter: '0 -1' }
        )
        break

      case toolEnum.SHAPE_TRIAG:
        this.tool = new PositionableObject(
          this.canvas,
          () => triangle({
            width: 97.2,
            height: 97.2,
            stroke: toCSSColor(brushColor),
          }),
          { adjustCenter: '0 -1' }
        )
        break

      case toolEnum.SHAPE_TRIAG_SOLID:
        this.tool = new PositionableObject(
          this.canvas,
          () => triangleSolid({
            fill: toCSSColor(brushColor),
            height: 97.2,
            width: 97.2,
          }),
          { adjustCenter: '0 -1' }
        )
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
      this.tool.configure({
        lineColor: toCSSColor(brushColor),
        lineWidth: brushWidth,
      })
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

  existsInCanvas (id) {
    const canvasObjectIds = this.canvas.getObjects().map(_ => _._id)

    return canvasObjectIds.indexOf(id) !== -1
  }

  existsInObjects (id) {
    const { objects } = this.props

    return objects.map(_ => _._id).indexOf(id) !== -1
  }

  sortObjects () {
    const { objects } = this.props
    const canvasObjectIds = this.canvas.getObjects().map(_ => _._id)
    const objectIds = objects.map(_ => _._id)
    const filteredObjectIds = objectIds.filter(_ => canvasObjectIds.indexOf(_) !== -1) // eslint-disable-line max-len

    this.canvas.forEachObject((_) => {
      _.moveTo(filteredObjectIds.indexOf(_._id))
    })
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
    const objectsToAdd = []
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
        objectsToAdd.push(_)
      } else {
        // update
        canvasObjects[objIndex].set(_)
        canvasObjects[objIndex].setCoords()
      }
    })

    if (objectsToAdd.length) {
      fabric.util.enlivenObjects(objectsToAdd.map(_ => ({ ..._, remote: true })), (fObjectList) => {
        fObjectList.forEach((fObject) => {
          if (!this.existsInObjects(fObject._id) || this.existsInCanvas(fObject._id)) {
            return
          }

          this.canvas.add(fObject)
        })

        this.sortObjects()
      })
    }

    this.canvas.requestRenderAll()
  }

  render () {
    const {
      height, width, pattern,
    } = this.props

    return (
      <Fragment>
        {pattern && <canvas id='canvasPattern' ref={this.canvasPatternRef} width={width} height={height} style={{ position: 'absolute' }} />}
        <canvas id='canvas' ref={this.canvasRef} width={width} height={height} />
      </Fragment>
    )
  }
}
