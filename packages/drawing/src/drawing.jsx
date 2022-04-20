/* eslint-disable react/prop-types, max-classes-per-file */
import React from 'react'
import { fabric } from 'fabric/dist/fabric.min'
import { queue as Queue } from 'd3-queue'
import Hammer from 'hammerjs'

import { BROADCAST_MESSAGE_TYPE, enhancedFields, penToolModeEnum, shapeToolModeEnum, stampToolModeEnum, toolEnum } from './constants'
import { toCSSColor } from './util/to-css-color'
import { LockProvider } from './lock-provider'
import { CopyPasteProvider } from './copy-paste-provider'
import { CursorProvider } from './cursor-provider'
import { keyboardEvents, KeyboardListenerProvider } from './keyboard-listener-provider'

import DynamicPattern from './tools/dynamic-pattern'
// FIXME: fix cycle dep
// eslint-disable-next-line import/no-cycle
import EraserTool from './tools/eraser'
import './tools/optimized-pencil-brush'
import './tools/limited-text-box'
import PanTool from './tools/pan'
import PenTool from './tools/pen'
import SelectTool from './tools/select'
import { LineTool } from './tools/line'
import { ShapeTool } from './tools/shape'
import { StampTool } from './tools/stamp'
import { TextboxTool } from './tools/textbox'
// FIXME: fix cycle dep
// eslint-disable-next-line import/no-cycle
import { LockTool } from './tools/lock'
import {
  circle,
  circleSolid,
  rectangle,
  rectangleSolid,
  triangle,
  triangleSolid,
} from './tools/_shapes'
import { makeNotInteractive } from './tools/object'

export const normalizeFields = (object, fields) => Object.assign(
  object,
  fields.reduce((a, field) => {
    // eslint-disable-next-line no-param-reassign
    a[field] = object[field] || undefined

    return a
  }, {})
)

// TODO: use common token provider
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
  const re = /^.*\/api\/(.*)\/sets\/(.*)\/objects\/(.*)$/

  return url.match(re)
}

fabric.disableStyleCopyPaste = true
const originalFabricLoadImageFn = fabric.util.loadImage

fabric.util.loadImage = function loadImage (url, callback, context, crossOrigin) {
  if (matchesStorageURIScheme(url)) {
    tp.getToken()
      .then((token) => {
        if (url.indexOf('access_token') !== -1) {
          originalFabricLoadImageFn(
            url.replace(/\?access_token=(.*)$/i, `?access_token=${token}`),
            callback,
            context,
            crossOrigin
          )
        } else {
          originalFabricLoadImageFn(`${url}?access_token=${token}`, callback, context, crossOrigin)
        }

        return null
      })
      .catch(error => console.log(error)) // eslint-disable-line no-console
  } else {
    originalFabricLoadImageFn(url, callback, context, crossOrigin)
  }
}

function maybeRemoveToken (object) {
  if (object.type === 'image' && object.src.indexOf('?access_token=') !== -1) {
    object.src = object.src.split('?')[0] // eslint-disable-line
  }

  return object
}

function isShapeObject (object) {
  return object.type === shapeToolModeEnum.CIRCLE
    || object.type === shapeToolModeEnum.RECT
    || object.type === shapeToolModeEnum.TRIANGLE
}

function isTextObject (object) {
  return object.type === toolEnum.TEXT
}

export class Drawing extends React.Component {
  constructor (props) {
    super(props)

    this.canvas = null
    this.canvasPattern = null
    this.canvasRef = React.createRef()
    this.canvasPatternRef = React.createRef()
    this.dynamicPattern = null
    this.ignoreObjectRemovedEvent = false
    this.q = null
    this.rq = null
    this.tool = null

    this._hammer = null
    this._hammerCenter = null
    this._hammerDistance = null
    this._hammerPanActive = false
    this._hammerZoom = null

    const {
      tokenProvider,
    } = this.props

    if (!tokenProvider) throw new TypeError('Absent tokenProvider')

    this.__lockModeTool = null
    this.__broadcastProvider = null
  }

  componentDidMount () {
    const {
      canDraw, tool, objects, pattern, tokenProvider, broadcastProvider,
    } = this.props

    tp.setProvider(tokenProvider)

    if (broadcastProvider) {
      this.__broadcastProvider = broadcastProvider

      this.__broadcastProvider.subscribe(BROADCAST_MESSAGE_TYPE, this._drawUpdateHandler)
    }

    if (canDraw) {
      this.initCanvas()
      this.initTool(tool)
    } else {
      this.initStaticCanvas()
    }

    if (pattern) {
      this.initCanvasPattern()

      this.dynamicPattern = new DynamicPattern(this.canvasPattern)

      this.updateCanvasPatternParameters()
      this.dynamicPattern.setPattern(pattern)
      this.updateCanvasPattern()
    }

    this.updateCanvasParameters(true)
    this.updateCanvasObjects(objects)
  }

  componentDidUpdate (prevProps) {
    const {
      brushColor,
      brushMode,
      brushWidth,
      canDraw,
      eraserWidth,
      height,
      objects,
      pattern,
      shapeMode,
      stampMode,
      tool,
      width,
      x,
      y,
      zoom,
    } = this.props

    if (prevProps.canDraw !== canDraw) {
      this.destroyQueues()
      this.destroyCanvas()

      this.canvasRef.current.style.position = 'relative'

      if (canDraw) {
        this.initCanvas()
        this.initTool(tool)
      } else {
        this.initStaticCanvas()
      }

      this.updateCanvasParameters(true)
      this.updateCanvasObjects(objects)
    }

    if (prevProps.pattern !== pattern) {
      if (pattern !== null) {
        if (!this.dynamicPattern) {
          this.initCanvasPattern()

          this.dynamicPattern = new DynamicPattern(this.canvasPattern)
          this.updateCanvasPatternParameters()
        }

        this.dynamicPattern.setPattern(pattern)
        this.updateCanvasPattern()
      } else {
        this.dynamicPattern.destroy()
        this.destroyCanvasPattern()

        this.dynamicPattern = null
      }
    }

    if (
      prevProps.height !== height
      || prevProps.width !== width
      || prevProps.x !== x
      || prevProps.y !== y
      || prevProps.zoom !== zoom
    ) {
      this.updateCanvasParameters()

      if (this.dynamicPattern) {
        this.updateCanvasPatternParameters()
        this.updateCanvasPattern()
      }
    }

    if (prevProps.objects && objects && prevProps.objects !== objects) {
      this.updateCanvasObjects(objects)
    }

    if (
      canDraw
      && (
        prevProps.tool !== tool
        || prevProps.brushColor !== brushColor
        || prevProps.shapeMode !== shapeMode
        || prevProps.stampMode !== stampMode
        || prevProps.brushMode !== brushMode
        // need to update the tool if it's a pen
        || (tool === toolEnum.PEN && brushMode !== penToolModeEnum.LINE)
      )
    ) {
      if (prevProps.tool !== tool || tool !== toolEnum.SELECT) {
        this.initTool(tool)
      }
    }

    if (
      canDraw
      && (
        prevProps.brushColor !== brushColor
        || prevProps.brushMode !== brushMode
        || prevProps.brushWidth !== brushWidth
        || prevProps.eraserWidth !== eraserWidth
        || prevProps.shapeMode !== shapeMode
        || prevProps.stampMode !== stampMode
      )
    ) {
      this.configureTool()
    }
  }

  componentWillUnmount () {
    tp.setProvider(null)

    this.destroyQueues()

    this.destroyHammer()

    if (this.dynamicPattern) {
      this.dynamicPattern.destroy()
      this.destroyCanvasPattern()

      this.dynamicPattern = null
    }

    this.destroyCanvas()

    LockProvider.canvas = null
    CursorProvider.canvas = null
    CopyPasteProvider.canvas = null
  }

  _handleKeyDown = (opts) => {
    this.tool.handleKeyDownEvent(opts)
  }

  _handleKeyUp = (opts) => {
    this.tool.handleKeyUpEvent(opts)
  }

  _handleMouseDown = (opts) => {
    this.tool.handleMouseDownEvent(opts)
  }

  _handleMouseMove = (opts) => {
    const { onMouseMove } = this.props

    CursorProvider.onMouseMove(opts)
    this.tool.handleMouseMoveEvent(opts)
    onMouseMove && onMouseMove({ ...opts, vptCoords: this.canvas.vptCoords })
  }

  _handleMouseUp = (opts) => {
    this.tool.handleMouseUpEvent(opts)
  }

  _handleTextEditStartEvent = (opts) => {
    this.tool.handleTextEditStartEvent(opts)
  }

  _handleTextEditEndEvent = (opts) => {
    this.tool.handleTextEditEndEvent(opts)
  }

  _handleTextChangedEvent = (opts) => {
    this.tool.handleTextChangedEvent(opts)
  }

  _handleSelectionUpdatedEvent = (opts) => {
    this.tool.handleSelectionUpdatedEvent(opts)
  }

  _handleSelectionCreatedEvent = (opts) => {
    this.tool.handleSelectionCreatedEvent(opts)
  }

  _handleSelectionClearedEvent = (opts) => {
    this.tool.handleSelectionClearedEvent(opts)
  }

  _handleObjectAdded = (opts) => {
    this.tool.handleObjectAddedEvent(opts)
  }

  _handleAfterRender = () => {
    const { onAfterRender } = this.props

    this.updateCanvasPattern()

    onAfterRender && onAfterRender()
  }

  // eslint-disable-next-line react/sort-comp
  initCanvas () {
    const {
      selectOnInit,
      clientId,
      uniqId,
      disableMobileGestures,
      onLockSelection,
      onSelection,
      onKeyDown,
      onKeyUp,
    } = this.props

    this.canvas = new fabric.Canvas('canvas', {
      enablePointerEvents: 'PointerEvent' in window,
      allowTouchScrolling: !disableMobileGestures,
    })
    this.canvas._id = clientId
    this.canvas.freeDrawingBrush = new fabric.OptimizedPencilBrush(this.canvas)

    KeyboardListenerProvider.init(this.canvasRef.current.ownerDocument)

    this.__lockModeTool = new LockTool(this.canvas, onLockSelection, onSelection)

    this.canvas.on('mouse:down', opt => this._handleMouseDown(opt))
    this.canvas.on('mouse:move', opt => this._handleMouseMove(opt))
    this.canvas.on('mouse:up', opt => this._handleMouseUp(opt))
    this.canvas.on('object:added', opt => this._handleObjectAdded(opt))
    this.canvas.on('text:editing:entered', opt => this._handleTextEditStartEvent(opt))
    this.canvas.on('text:editing:exited', opt => this._handleTextEditEndEvent(opt))
    this.canvas.on('text:changed', opt => this._handleTextChangedEvent(opt))
    this.canvas.on('selection:updated', opt => this._handleSelectionUpdatedEvent(opt))
    this.canvas.on('selection:created', opt => this._handleSelectionCreatedEvent(opt))
    this.canvas.on('selection:cleared', opt => this._handleSelectionClearedEvent(opt))

    KeyboardListenerProvider.on(keyboardEvents.keyDown, this.__lockModeTool.handleKeyDownEvent)
    KeyboardListenerProvider.on(keyboardEvents.keyUp, this.__lockModeTool.handleKeyUpEvent)
    KeyboardListenerProvider.on(keyboardEvents.keyDown, this._handleKeyDown)
    KeyboardListenerProvider.on(keyboardEvents.keyUp, this._handleKeyUp)
    onKeyDown && KeyboardListenerProvider.on(keyboardEvents.keyDown, onKeyDown)
    onKeyUp && KeyboardListenerProvider.on(keyboardEvents.keyUp, onKeyUp)

    this.canvas.on('object:added', (event) => {
      const { onDraw } = this.props
      const object = event.target
      let serializedObj

      // Skipping draft objects
      if (object._draft) return

      if (!object.remote) {
        object._id = uniqId()
        serializedObj = object.toObject(enhancedFields)

        if (selectOnInit && isShapeObject(object)) return

        onDraw && onDraw(maybeRemoveToken(serializedObj))
      } else {
        delete object.remote
      }
    })

    this.canvas.on('selection:cleared', (event) => {
      const { deselected } = event
      if (!deselected || deselected.length !== 1) return

      const { onDraw } = this.props
      const [object] = deselected

      if (isShapeObject(object)) {
        const serializedObj = object.toObject(enhancedFields)

        if (object._new) {
          onDraw && onDraw(maybeRemoveToken(serializedObj))
          object.set('_new', undefined)
        }
      }
    })

    this.canvas.on('object:modified', (event) => {
      const { onDraw, onDrawUpdate } = this.props
      const object = event.target

      // Skipping draft objects
      if (object._draft) return

      const serializedObj = object.toObject(enhancedFields)

      if (isTextObject(object) && object._textBeforeEdit === '') {
        onDraw && onDraw(maybeRemoveToken(serializedObj))
      } else if (isShapeObject(object)) {
        object._new
          ? onDraw && onDraw(maybeRemoveToken(serializedObj))
          : onDrawUpdate && onDrawUpdate(maybeRemoveToken(serializedObj))

        object.set('_new', undefined)
      } else {
        onDrawUpdate && onDrawUpdate(maybeRemoveToken(serializedObj))
      }
    })

    this.canvas.on('object:removed', (event) => {
      if (this.ignoreObjectRemovedEvent) return

      const { onObjectRemove } = this.props
      const object = event.target

      // Skipping draft objects
      if (object._draft) return

      onObjectRemove && onObjectRemove(maybeRemoveToken(object.toObject(enhancedFields)))
    })

    this.canvas.on('after:render', () => this._handleAfterRender())

    if (!this._hammer && !disableMobileGestures) {
      this.initHammer(this.canvas.upperCanvasEl)
    }

    CursorProvider.canvas = this.canvas
    LockProvider.canvas = this.canvas
    CopyPasteProvider.canvas = this.canvas

    // this.canvas.on('mouse:wheel', (opt) => {
    //   const delta = opt.e.deltaY
    //   let zoom = this.canvas.getZoom()
    //
    //   zoom += delta / 200
    //
    //   if (zoom > 2) zoom = 2
    //   if (zoom < 0.5) zoom = 0.5
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
    const { clientId } = this.props

    this.canvas = new fabric.StaticCanvas('canvas')
    this.canvas._id = clientId

    LockProvider.canvas = null
    CursorProvider.canvas = null
    CopyPasteProvider.canvas = null
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
      this.ignoreObjectRemovedEvent = true
      this.canvas.clear()
      this.canvas.dispose()

      this.__cleanTools()

      KeyboardListenerProvider.destroy()

      this.canvas = null
      this.ignoreObjectRemovedEvent = false
    }
  }

  destroyCanvasPattern () {
    if (this.canvasPattern !== null) {
      this.canvasPattern.clear()
      this.canvasPattern.dispose()

      this.canvasPattern = null
    }
  }

  destroyQueues () {
    if (this.q !== null) {
      this.q.abort()

      this.q = null
    }

    if (this.rq !== null) {
      this.rq.abort()

      this.rq = null
    }
  }

  initTool (tool) {
    const {
      brushColor,
      brushMode,
      isPresentation,
      selectOnInit,
      shapeMode,
      stampMode,
      publicStorageProvider,
    } = this.props

    this.tool && this.tool.destroy()

    LockProvider.tool = tool

    switch (tool) {
      case toolEnum.ERASER:
        this.tool = new EraserTool(this.canvas)

        break

      case toolEnum.PAN:
        this.tool = new PanTool(this.canvas)

        break

      case toolEnum.PEN:
        if (brushMode === penToolModeEnum.LINE) {
          this.tool = new LineTool(this.canvas)
        } else {
          this.tool = new PenTool(this.canvas)
        }
        break

      case toolEnum.SELECT:
        this.tool = new SelectTool(this.canvas, { isPresentation })
        LockTool.updateAllLock(this.canvas)

        if (this.__broadcastProvider) {
          this.tool.onBroadcast = data => this.__broadcastProvider.publish(BROADCAST_MESSAGE_TYPE, data)
        }

        break

      case toolEnum.TEXT:
        this.tool = new TextboxTool(this.canvas, undefined, {
          fill: toCSSColor(brushColor),
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        })

        break

      case toolEnum.STAMP:
        this.tool = new StampTool(
          this.canvas,
          stampMode,
          publicStorageProvider,
        )

        break

      case toolEnum.SHAPE:
        switch (shapeMode) {
          case shapeToolModeEnum.CIRCLE:
            this.tool = new ShapeTool(
              this.canvas,
              () => circle({ stroke: toCSSColor(brushColor) }),
              {
                adjustCenter: '-0.5 -0.5',
                selectOnInit,
              }
            )

            break

          case shapeToolModeEnum.CIRCLE_SOLID:
            this.tool = new ShapeTool(
              this.canvas,
              () => circleSolid({ fill: toCSSColor(brushColor) }),
              {
                adjustCenter: '-0.5 -0.5',
                selectOnInit,
              }
            )

            break

          case shapeToolModeEnum.RECT:
            this.tool = new ShapeTool(
              this.canvas,
              () => rectangle({
                width: 97.2,
                height: 97.2,
                stroke: toCSSColor(brushColor),
              }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              }
            )

            break

          case shapeToolModeEnum.RECT_SOLID:
            this.tool = new ShapeTool(
              this.canvas,
              () => rectangleSolid({
                width: 97.2,
                height: 97.2,
                fill: toCSSColor(brushColor),
              }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              }
            )

            break

          case shapeToolModeEnum.TRIANGLE:
            this.tool = new ShapeTool(
              this.canvas,
              () => triangle({
                width: 97.2,
                height: 97.2,
                stroke: toCSSColor(brushColor),
              }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              }
            )

            break

          case shapeToolModeEnum.TRIANGLE_SOLID:
            this.tool = new ShapeTool(
              this.canvas,
              () => triangleSolid({
                fill: toCSSColor(brushColor),
                height: 97.2,
                width: 97.2,
              }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              }
            )

            break

          default:
            this.tool = new ShapeTool(
              this.canvas,
              () => rectangle({
                width: 97.2,
                height: 97.2,
                stroke: toCSSColor(brushColor),
              }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              }
            )
        }

        break

      default:
        this.tool = new PenTool(this.canvas)
    }

    this.configureTool(true)
  }

  configureTool (initial = false) {
    const {
      brushColor, brushMode, brushWidth, eraserWidth, eraserPrecision, tool,
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
        precision: eraserPrecision,
        eraserWidth,
        initial,
      })
    }
  }

  initHammer (element) {
    Hammer.defaults.touchAction = 'none'

    this._hammer = new Hammer(element)

    this._hammer.get('pan').set({ pointers: 2, threshold: 0 })

    this._hammer.on('panstart panmove panend pancancel', (event) => {
      // eslint-disable-next-line max-len
      const distance = Math.round(Math.sqrt((event.pointers[1].x - event.pointers[0].x) ** 2 + (event.pointers[1].y - event.pointers[0].y) ** 2))

      if (event.type === 'panstart') {
        if (this.tool) {
          this.tool.makeInactive()
          this.tool.reset()
        }

        this._hammerCenter = event.center
        this._hammerDistance = distance
        this._hammerPanActive = true
        this._hammerZoom = this.canvas.getZoom()
      } else if (event.type === 'panmove') {
        if (!this._hammerPanActive) return

        const zoom = this._hammerZoom
        let newZoom = zoom + 0.005 * (distance - this._hammerDistance)

        if (newZoom > 2) newZoom = 2
        if (newZoom < 0.2) newZoom = 0.2

        newZoom = parseFloat(newZoom.toPrecision(3))

        this.canvas.viewportTransform[4] += event.center.x - this._hammerCenter.x
        this.canvas.viewportTransform[5] += event.center.y - this._hammerCenter.y

        if (newZoom !== zoom) {
          this.canvas.zoomToPoint(event.center, newZoom)
        } else {
          this.canvas.requestRenderAll()
        }

        this._hammerCenter = event.center
        this._hammerDistance = distance
        this._hammerZoom = newZoom
      } else if (event.type === 'panend' || event.type === 'pancancel') {
        if (!this._hammerPanActive) return

        const newZoom = parseFloat(this._hammerZoom.toPrecision(2))

        this.canvas.zoomToPoint(event.center, newZoom)

        if (this.tool) {
          this.tool.makeActive()
        }

        this._hammerCenter = null
        this._hammerDistance = null
        this._hammerPanActive = false
        this._hammerZoom = null
      }
    })
  }

  destroyHammer () {
    if (this._hammer) {
      this._hammer.destroy()

      this._hammer = null
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

  updateCanvasParameters (forced = false) {
    const {
      height,
      width,
      x,
      y,
      zoom,
      zoomToCenter,
    } = this.props
    const { tl } = this.canvas.calcViewportBoundaries()
    const currentDimensions = {
      height: this.canvas.getHeight(),
      width: this.canvas.getWidth(),
      ...tl,
      zoom: this.canvas.getZoom(),
    }
    const dimensionsChanged = currentDimensions.height !== height
      || currentDimensions.width !== width
    const viewportChanged = currentDimensions.x !== x || currentDimensions.y !== y
    const zoomChanged = currentDimensions.zoom !== zoom

    // dimensions
    if (forced || dimensionsChanged) {
      this.canvas.setDimensions({ height, width })
    }

    // viewport
    if (forced || viewportChanged) {
      this.canvas.absolutePan({ x: x * currentDimensions.zoom, y: y * currentDimensions.zoom })
    }

    // zoom
    if (forced) {
      this.canvas.setZoom(zoom)
    } else if (zoomChanged) {
      if (zoomToCenter && !dimensionsChanged && !viewportChanged) {
        this.canvas.zoomToPoint({ x: width / 2, y: height / 2 }, zoom)
      } else {
        this.canvas.setZoom(zoom)
      }
    }
  }

  updateCanvasPatternParameters () {
    const { height, width } = this.props

    if (height && width) {
      this.canvasPattern.setDimensions({ height, width })
    }
  }

  _updateCanvasObjects (canvasObjects, objects) {
    const canvasObjectIds = canvasObjects.map(_ => _._id)
    const newObjectIds = new Set(objects.map(_ => _._id))
    const objectsToAdd = []
    const objectsToRemove = []

    this.destroyQueues()

    this.q = new Queue(50)
    this.rq = new Queue(50)

    this.canvas.renderOnAddRemove = false

    canvasObjects.forEach((_) => {
      if (!newObjectIds.has(_._id)) {
        if (!_.__local && !_._draft) {
          objectsToRemove.push(_)
        }
      } else if (_.__local) {
        _.set('__local', undefined)
      }
    })

    objects.forEach((_) => {
      const objIndex = canvasObjectIds.indexOf(_._id)
      const nextObject = normalizeFields(_, enhancedFields)

      if (objIndex === -1) {
        // add
        objectsToAdd.push(nextObject)
      } else {
        // update (only if revision has been changed)
        if (_._rev === canvasObjects[objIndex]._rev) {
          return
        }

        if (_._restored) {
          // если объект "восстановленный" - тоже сбрасываем выделение
          SelectTool.removeFromSelection(this.canvas, canvasObjects[objIndex])
        }

        if (LockProvider.isLockedByUser(_) !== LockProvider.isLockedByUser(canvasObjects[objIndex])) {
          canvasObjects[objIndex].set(nextObject)
          if (LockProvider.isLockedByUser(_)) {
            LockProvider.lockUserObject(canvasObjects[objIndex])
          } else {
            LockProvider.unlockUserObject(canvasObjects[objIndex])
          }
        } else {
          canvasObjects[objIndex].set(nextObject)
        }

        canvasObjects[objIndex].setCoords()
      }
    })

    return {
      objects,
      objectsToAdd,
      objectsToRemove,
    }
  }

  _drawUpdateHandler = (data) => {
    const objectId = data.id

    if (this.canvas) {
      const object = this.canvas.getObjects().find(_ => _._id === objectId)

      if (object) {
        object.set(data.diff)

        this.canvas.requestRenderAll()
      }
    }
  }

  updateCanvasObjects (_objects) {
    const canvasObjects = this.canvas.getObjects()
    const enlivenedObjects = new Map()
    const {
      objects,
      objectsToAdd,
      objectsToRemove,
    } = this._updateCanvasObjects(canvasObjects, _objects)

    if (objectsToRemove.length) {
      this.ignoreObjectRemovedEvent = true
      this.canvas.remove(...objectsToRemove)
      this.ignoreObjectRemovedEvent = false
    }

    if (objectsToAdd.length) {
      objectsToAdd
        .map(_ => ({ ..._, remote: true }))
        .forEach((_) => {
          this.q.defer((done) => {
            if (!document.hidden) {
              window.requestAnimationFrame(() => {
                fabric.util.enlivenObjects([_], ([fObject]) => {
                  if (fObject) {
                    enlivenedObjects.set(fObject._id, fObject)
                  }

                  done(null)
                })
              })
            } else {
              fabric.util.enlivenObjects([_], ([fObject]) => {
                if (fObject) {
                  enlivenedObjects.set(fObject._id, fObject)
                }

                done(null)
              })
            }
          })
        })

      this.q.awaitAll((error) => {
        if (error) {
          return
        }

        this.canvas.renderOnAddRemove = false

        const { objects: _o } = this.props
        const newObjectIdsAgain = new Set(_o.map(_ => _._id))

        objects.forEach((object) => {
          if (!enlivenedObjects.has(object._id)) {
            return
          }

          this.rq.defer((done) => {
            // With requestAnimationFrame objects may be duplicated on canvas
            if (this.canvas === null) {
              done()

              return
            }

            // Bypass objects which should be invalidated
            if (!newObjectIdsAgain.has(object._id) && !object._invalidate) {
              done()

              return
            }

            const objectToAdd = enlivenedObjects.get(object._id)

            this.canvas.add(objectToAdd)
            if (LockProvider.isLockedByUser(objectToAdd)) {
              LockProvider.lockUserObject(objectToAdd)
            }
            if (LockProvider.isLockedBySelection(objectToAdd)) {
              makeNotInteractive(objectToAdd)
            }

            done(null)
          })
        })

        this.rq.awaitAll((rqError) => {
          if (rqError) {
            return
          }

          this.canvas.renderOnAddRemove = true
          this.canvas.requestRenderAll()
        })
      })
    } else {
      this.canvas.renderOnAddRemove = true
      this.canvas.requestRenderAll()
    }
  }

  cleanSelection () {
    if (this.canvas.getActiveObject()) this.canvas.discardActiveObject()
  }

  currentSelection () {
    return this.canvas.getActiveObject().toObject(enhancedFields)
  }

  __cleanTools () {
    this.__lockModeTool && this.__lockModeTool.destroy()

    this.__lockModeTool = undefined
  }

  destroy () {
    if (this.__broadcastProvider) {
      this.__broadcastProvider.unsubscribe(BROADCAST_MESSAGE_TYPE)

      this.__broadcastProvider = null
    }
  }

  render () {
    const {
      height, width, pattern,
    } = this.props

    return (
      <>
        <div style={{ position: 'absolute' }}>
          {/* eslint-disable-next-line max-len */}
          <canvas id='canvasPattern' ref={this.canvasPatternRef} width={width} height={height} style={{ display: pattern ? 'block' : 'none' }} />
        </div>
        <canvas id='canvas' ref={this.canvasRef} width={width} height={height} />
      </>
    )
  }
}

Drawing.defaultProps = {
  brushColor: {
    r: 255, g: 255, b: 255, a: 1,
  },
  brushWidth: 12,
  shapeMode: shapeToolModeEnum.RECT,
  stampMode: stampToolModeEnum.PLEASED,
  tool: toolEnum.PEN,
  x: 0,
  y: 0,
  zoom: 1,
  zoomToCenter: false,
}
