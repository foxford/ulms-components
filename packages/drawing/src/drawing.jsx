/* eslint-disable react/prop-types, max-classes-per-file */
import React from 'react'
import { fabric } from 'fabric/dist/fabric.min'
import Hammer from 'hammerjs'

import {
  penToolModeEnum,
  lineToolModeEnum,
  shapeToolModeEnum,
  toolEnum,
  defaultToolSettings,
} from './constants'
import './util/fabric-presets'
import { HEXtoRGB, toCSSColor } from './util/to-css-color'
import { serializeObject, normalizeFields } from './util/serialize-object'
import { LockProvider } from './lock-provider'
import { CopyPasteProvider } from './copy-paste-provider'
import { CursorProvider } from './cursor-provider'
import { BroadcastProvider } from './broadcast-provider'
import { keyboardEvents, KeyboardListenerProvider } from './keyboard-listener-provider'
import TokenProvider from './util/token-provider'

import DynamicPattern from './tools/dynamic-pattern'
import EraserTool from './tools/eraser'
import './tools/optimized-pencil-brush'
import PanTool from './tools/pan'
import PenTool from './tools/pen'
import SelectTool from './tools/select'
import { LineTool } from './tools/line'
import { ArrowTool } from './tools/arrow'
import { ShapeTool } from './tools/shape'
import { StampTool } from './tools/stamp'
import { TextboxTool } from './tools/textbox'
import { LockTool } from './tools/lock'
import {
  circle,
  circleSolid,
  rectangle,
  rectangleSolid,
  triangle,
  triangleSolid,
  rightTriangle,
  rightTriangleSolid,
} from './tools/_shapes'
import { makeNotInteractive } from './tools/object'

function isShapeObject (object) {
  return object.type === shapeToolModeEnum.CIRCLE
    || object.type === shapeToolModeEnum.RECT
    || object.type === shapeToolModeEnum.TRIANGLE
}

function clearExternalSelection () {
  // Сбрасываем выделение на других областях
  if (window.getSelection) {
    window.getSelection().removeAllRanges()
  } else if (document.selection) {
    document.selection.empty()
  }
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
  }

  componentDidMount () {
    const {
      canDraw, tool, pattern, tokenProvider, broadcastProvider, pageObjects, staticCanvas,
    } = this.props

    TokenProvider.setProvider(tokenProvider)

    if (broadcastProvider) {
      BroadcastProvider.provider = broadcastProvider

      BroadcastProvider.subscribe(this._drawUpdateHandler)
    }

    if (staticCanvas) {
      this.initStaticCanvas()
    } else {
      this.initCanvas()
      if (canDraw) {
        this.initCanvasListeners()
      }
    }

    if (pattern) {
      this.initCanvasPattern()

      this.dynamicPattern = new DynamicPattern(this.canvasPattern)

      this.updateCanvasPatternParameters()
      this.dynamicPattern.setPattern(pattern)
      this.updateCanvasPattern()
    }

    this.updateCanvasParameters(true)
    this.createCanvasObjects(pageObjects)

    if (!staticCanvas) {
      this.initTool(tool)
    }
  }

  componentDidUpdate (prevProps) {
    const {
      pageObjects,
      updatedObjects,
      brushColor,
      brushMode,
      brushWidth,
      stampSrc,
      canDraw,
      eraserWidth,
      height,
      pattern,
      tool,
      width,
      x,
      y,
      zoom,
      staticCanvas,
    } = this.props

    if (prevProps.staticCanvas !== staticCanvas) {
      this.destroyCanvas()

      this.canvasRef.current.style.position = 'relative'

      if (staticCanvas) {
        this.initStaticCanvas()
      } else {
        this.initCanvas()
        if (canDraw) {
          this.initCanvasListeners()
        }
      }

      this.updateCanvasParameters(true)
      this.createCanvasObjects(pageObjects)
    }

    if (canDraw !== prevProps.canDraw) {
      this.destroyCanvasListeners()
      if (canDraw) {
        this.initCanvasListeners()
      }
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

    // Обновляем значение зум в Селектк, чтобы пересчитать координаты и размеры объекта для контекстного меню
    if (canDraw && prevProps.zoom !== zoom && tool === toolEnum.SELECT) {
      this.tool.zoom = zoom
    }

    if (prevProps.pageObjects !== pageObjects) {
      this.createCanvasObjects(pageObjects)
    }

    if (updatedObjects?.length && prevProps.updatedObjects !== updatedObjects) {
      this.updateCanvasObjects(updatedObjects)
    }

    if (
      prevProps.tool !== tool
        || prevProps.brushColor !== brushColor
        || prevProps.brushMode !== brushMode
        // need to update the tool if it's a pen
        || tool === toolEnum.PEN
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
        || prevProps.stampSrc !== stampSrc
      )
    ) {
      this.configureTool()
    }
  }

  componentWillUnmount () {
    TokenProvider.setProvider(null)

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
    this.tool && this.tool.handleKeyDownEvent(opts)
  }

  _handleKeyUp = (opts) => {
    this.tool && this.tool.handleKeyUpEvent(opts)
  }

  _handleMouseDown = (opts) => {
    const { onMouseDown } = this.props

    this.tool && this.tool.handleMouseDownEvent(opts)

    onMouseDown && onMouseDown({ ...opts, vptCoords: this.canvas.vptCoords })
  }

  _handleMouseMove = (opts) => {
    const { onMouseMove } = this.props

    CursorProvider.onMouseMove(opts)
    this.tool && this.tool.handleMouseMoveEvent(opts)
    onMouseMove && onMouseMove({ ...opts, vptCoords: this.canvas.vptCoords })
  }

  _handleMouseUp = (opts) => {
    const { onMouseUp } = this.props

    this.tool && this.tool.handleMouseUpEvent(opts)

    onMouseUp && onMouseUp({ ...opts, vptCoords: this.canvas.vptCoords })
  }

  _handleTextEditStartEvent = (opts) => {
    this.tool && this.tool.handleTextEditStartEvent(opts)
  }

  _handleTextEditEndEvent = (opts) => {
    this.tool && this.tool.handleTextEditEndEvent(opts)
  }

  _handleTextChangedEvent = (opts) => {
    this.tool && this.tool.handleTextChangedEvent(opts)
  }

  _handleSelectionUpdatedEvent = (opts) => {
    clearExternalSelection()
    this.tool && this.tool.handleSelectionUpdatedEvent(opts)
  }

  _handleSelectionCreatedEvent = (opts) => {
    clearExternalSelection()
    this.tool && this.tool.handleSelectionCreatedEvent(opts)
  }

  _handleSelectionClearedEvent = (opts) => {
    this.tool && this.tool.handleSelectionClearedEvent(opts)
  }

  _handleAfterRender = () => {
    const { onAfterRender } = this.props

    this.updateCanvasPattern()

    onAfterRender && onAfterRender()
  }

  // eslint-disable-next-line react/sort-comp
  initCanvas () {
    const {
      clientId,
      onLockSelection,
    } = this.props

    this.canvas = new fabric.Canvas('canvas', {
      enablePointerEvents: 'PointerEvent' in window,
      preserveObjectStacking: true, // Чтобы выделенный объект не выходил на верхний слой
    })
    this.canvas._id = clientId
    this.canvas.freeDrawingBrush = new fabric.OptimizedPencilBrush(this.canvas)

    KeyboardListenerProvider.init(this.canvasRef.current?.ownerDocument)

    this.__lockModeTool = new LockTool(this.canvas, onLockSelection)

    this.canvas._objectsMap = new Map()

    CursorProvider.canvas = this.canvas
    LockProvider.canvas = this.canvas
    CopyPasteProvider.canvas = this.canvas

    this.canvas.on('after:render', () => this._handleAfterRender())
  }

  _handleObjectAdded = (event) => {
    this.tool && this.tool.handleObjectAddedEvent(event)

    if (!this.canvas.renderOnAddRemove) return

    const {
      onDraw, uniqId, selectOnInit,
    } = this.props
    const object = event.target

    // Skipping draft objects
    if (object._draft) return

    if (!object.remote) {
      object._id = uniqId()

      if (selectOnInit && isShapeObject(object)) return

      if (this.canvas._objects.length > 1) {
        const order = this.canvas._objects[this.canvas._objects.length - 2]._order || 0

        object._order = order + 1
      } else {
        object._order = 0
      }
      onDraw && onDraw(serializeObject(object))
      this.canvas._objectsMap.set(object._id, object)
    } else {
      delete object.remote
    }
  }

  _handleObjectModified = (event) => {
    const { onDrawUpdate } = this.props
    const object = event.target

    // Skipping draft objects
    if (object._draft) return

    if (object._order === undefined) {
      if (this.canvas._objects.length > 1) {
        const order = this.canvas._objects[this.canvas._objects.length - 2]._order || 0

        object._order = order + 1
      } else {
        object._order = 0
      }
    }

    onDrawUpdate && onDrawUpdate(serializeObject(object))
  }

  _handleObjectRemoved = (event) => {
    if (!this.canvas.renderOnAddRemove) return

    if (this.ignoreObjectRemovedEvent) return

    const { onObjectRemove } = this.props
    const object = event.target

    // Skipping draft objects
    if (object._draft) return

    onObjectRemove && onObjectRemove(serializeObject(object))
    this.canvas._objectsMap.delete(object._id)
  }

  _handleMouseWheel = (event) => {
    const { onZoom } = this.props
    const delta = event.e.deltaY
    let zoom = this.canvas.getZoom()

    zoom += delta / 200

    if (zoom > 2) zoom = 2
    if (zoom < 0.5) zoom = 0.5

    this.canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom)

    event.e.preventDefault()
    event.e.stopPropagation()

    onZoom && onZoom(zoom)
  }

  initCanvasListeners () {
    const {
      onKeyDown,
      isPresentation,
      onKeyUp,
      onZoom,
    } = this.props

    this.canvas.allowTouchScrolling = true

    this.canvas.on('mouse:down', this._handleMouseDown)
    this.canvas.on('mouse:move', this._handleMouseMove)
    this.canvas.on('mouse:up', this._handleMouseUp)
    this.canvas.on('text:editing:entered', this._handleTextEditStartEvent)
    this.canvas.on('text:editing:exited', this._handleTextEditEndEvent)
    this.canvas.on('text:changed', this._handleTextChangedEvent)
    this.canvas.on('selection:updated', this._handleSelectionUpdatedEvent)
    this.canvas.on('selection:created', this._handleSelectionCreatedEvent)
    this.canvas.on('selection:cleared', this._handleSelectionClearedEvent)

    KeyboardListenerProvider.on(keyboardEvents.keyDown, this.__lockModeTool.handleKeyDownEvent)
    KeyboardListenerProvider.on(keyboardEvents.keyUp, this.__lockModeTool.handleKeyUpEvent)
    KeyboardListenerProvider.on(keyboardEvents.keyDown, this._handleKeyDown)
    KeyboardListenerProvider.on(keyboardEvents.keyUp, this._handleKeyUp)
    onKeyDown && KeyboardListenerProvider.on(keyboardEvents.keyDown, onKeyDown)
    onKeyUp && KeyboardListenerProvider.on(keyboardEvents.keyUp, onKeyUp)

    this.canvas.on('object:added', this._handleObjectAdded)

    this.canvas.on('object:modified', this._handleObjectModified)

    this.canvas.on('object:removed', this._handleObjectRemoved)

    if (!this._hammer) {
      this.initHammer(this.canvas.upperCanvasEl, isPresentation)
    }

    onZoom && this.canvas.on('mouse:wheel', this._handleMouseWheel)
  }

  destroyCanvasListeners () {
    const {
      onKeyDown,
      onKeyUp,
      onZoom,
    } = this.props

    this.canvas.allowTouchScrolling = false

    this.canvas.off('mouse:down', this._handleMouseDown)
    this.canvas.off('mouse:move', this._handleMouseMove)
    this.canvas.off('mouse:up', this._handleMouseUp)
    this.canvas.off('text:editing:entered', this._handleTextEditStartEvent)
    this.canvas.off('text:editing:exited', this._handleTextEditEndEvent)
    this.canvas.off('text:changed', this._handleTextChangedEvent)
    this.canvas.off('selection:updated', this._handleSelectionUpdatedEvent)
    this.canvas.off('selection:created', this._handleSelectionCreatedEvent)
    this.canvas.off('selection:cleared', this._handleSelectionClearedEvent)

    KeyboardListenerProvider.off(keyboardEvents.keyDown, this.__lockModeTool.handleKeyDownEvent)
    KeyboardListenerProvider.off(keyboardEvents.keyUp, this.__lockModeTool.handleKeyUpEvent)
    KeyboardListenerProvider.off(keyboardEvents.keyDown, this._handleKeyDown)
    KeyboardListenerProvider.off(keyboardEvents.keyUp, this._handleKeyUp)
    onKeyDown && KeyboardListenerProvider.off(keyboardEvents.keyDown, onKeyDown)
    onKeyUp && KeyboardListenerProvider.off(keyboardEvents.keyUp, onKeyUp)

    this.canvas.off('object:added', this._handleObjectAdded)

    this.canvas.off('object:modified', this._handleObjectModified)

    this.canvas.off('object:removed', this._handleObjectRemoved)

    onZoom && this.canvas.off('mouse:wheel', this._handleMouseWheel)

    this.destroyHammer()
  }

  initCanvasPattern () {
    this.canvasPattern = new fabric.StaticCanvas('canvasPattern')
  }

  initStaticCanvas () {
    const { clientId } = this.props

    this.canvas = new fabric.StaticCanvas('canvas')
    this.canvas._id = clientId

    this.canvas._objectsMap = new Map()

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

      this.destroyCanvasListeners()
      this.__cleanTools()

      KeyboardListenerProvider.destroy()

      this.canvas._objectsMap = null
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

  initTool (tool) {
    const {
      brushColor,
      brushMode,
      isPresentation,
      selectOnInit,
      fontSize,
      onSelection,
      showContextMenu,
      zoom,
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
        this.tool = new PenTool(this.canvas)
        break

      case toolEnum.LINE:
        if (brushMode === lineToolModeEnum.LINE || brushMode === lineToolModeEnum.DASHED_LINE) {
          this.tool = new LineTool(this.canvas)
        } else {
          this.tool = new ArrowTool(this.canvas)
        }
        break

      case toolEnum.SELECT:
        this.tool = new SelectTool(this.canvas, { isPresentation })
        LockTool.updateAllLock(this.canvas)

        this.tool.zoom = zoom
        this.tool.onSelection = onSelection
        this.tool.showContextMenu = showContextMenu

        this.canvas.requestRenderAll()

        break

      case toolEnum.TEXT:
        this.tool = new TextboxTool(this.canvas, undefined, {
          fill: toCSSColor(brushColor),
          fontSize,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        })

        break

      case toolEnum.STAMP:
        this.tool = new StampTool(
          this.canvas,
          brushMode,
          publicStorageProvider,
        )

        break

      case toolEnum.SHAPE:
        switch (brushMode) {
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

          case shapeToolModeEnum.RIGHT_TRIANGLE:
            this.tool = new ShapeTool(
              this.canvas,
              () => rightTriangle({
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

          case shapeToolModeEnum.RIGHT_TRIANGLE_SOLID:
            this.tool = new ShapeTool(
              this.canvas,
              () => rightTriangleSolid({
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
      brushColor, stampSrc, brushMode, brushWidth, eraserWidth, eraserPrecision, tool,
    } = this.props

    if (tool === toolEnum.PEN || tool === toolEnum.LINE) {
      const color = brushMode === penToolModeEnum.MARKER
        ? { ...brushColor, a: defaultToolSettings.markerAlpha }
        : brushColor
      const dashArray = (brushMode === penToolModeEnum.DASHED_PENCIL) || (brushMode === lineToolModeEnum.DASHED_LINE)
        ? [6, 6]
        : undefined

      this.tool.configure({
        lineColor: toCSSColor(color),
        lineWidth: brushWidth,
        dashArray,
      })
    } else {
      this.tool.configure({
        lineColor: toCSSColor(brushColor),
        lineWidth: brushWidth,
        precision: eraserPrecision,
        stampSrc,
        eraserWidth,
        initial,
      })
    }
  }

  initHammer (element, isPresentation) {
    Hammer.defaults.touchAction = 'none'

    this._hammer = new Hammer(element)

    this._hammer.get('pan').set({ pointers: 2, threshold: 0 })

    !isPresentation && this._hammer.on('panstart panmove panend pancancel', (event) => {
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
    this.canvas.discardActiveObject()
    fabric.Image.fromURL(url, (image) => {
      const { tl, br } = this.canvas.calcViewportBoundaries()

      image.set({
        left: br.x - (br.x - tl.x) / 2 - image.width / 2,
        top: br.y - (br.y - tl.y) / 2 - image.height / 2,
        _selected: true, // Чтобы сработало выделение на новом объекте
      })

      this.canvas.add(image)
    }, options)
  }

  /**
   * Place set of images on board
   *
   * @param {Set} imageSet Set of image src's
   * @param {number} [offsetInc] offset of each image
   */
  addImageSet (imageSet, offsetInc = 16) {
    const { publicStorageProvider } = this.props
    const { tl, br } = this.canvas.calcViewportBoundaries()
    let offset = 0

    this.canvas.discardActiveObject()
    imageSet.forEach((src) => {
      fabric.Image.fromURL(publicStorageProvider.getUrl(publicStorageProvider.types.LIB, src), (image) => {
        image.set({
          left: br.x - (br.x - tl.x) / 2 - image.width / 2 + offset,
          top: br.y - (br.y - tl.y) / 2 - image.height / 2 + offset,
          evented: true,
        })

        offset += offsetInc

        this.canvas.add(image)
      }, { crossOrigin: 'anonymous' })
    })
  }

  deleteSelection () {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      activeObject.set({ '_toDelete': true })
      this.canvas.remove(activeObject)
    }
  }

  sendSelectionToBack () {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      const objects = this.canvas.getObjects()
      const order = objects[0]._order || 0

      activeObject.set({ _order: order - 1 })
      this.canvas.fire('object:modified', { target: activeObject })
      this.canvas.sendToBack(activeObject)
    }
  }

  bringSelectionToFront () {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      const objects = this.canvas.getObjects()
      const order = objects[objects.length - 1]._order

      activeObject.set({ _order: order + 1 })
      this.canvas.fire('object:modified', { target: activeObject })
      this.canvas.bringToFront(activeObject)
    }
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

  _drawUpdateHandler = (data) => {
    const { id, diff } = data

    if (this.canvas) {
      const object = this.canvas._objectsMap.get(id)

      if (object) {
        object.set(diff)

        this.canvas.requestRenderAll()
      }
    }
  }

  clearCanvasObjects ({ silent } = { silent: true }) {
    if (this.canvas.getObjects().length) {
      if (silent) this.ignoreObjectRemovedEvent = true
      this.canvas.clear()
      if (silent) this.ignoreObjectRemovedEvent = false
    }
  }

  createCanvasObjects = (pageObjects) => {
    this.clearCanvasObjects()

    if (pageObjects.length) {
      const normalizedObjects = pageObjects.map(_ => normalizeFields({ ..._, remote: true }))

      fabric.util.enlivenObjects(normalizedObjects, (enlivenedObjects) => {
        this.canvas.renderOnAddRemove = false

        this.canvas.add(...enlivenedObjects)

        enlivenedObjects.forEach((object) => {
          this.canvas._objectsMap.set(object._id, object)

          if (LockProvider.isLockedByUser(object)) {
            LockProvider.lockUserObject(object)
          }
          if (LockProvider.isLockedBySelection(object)) {
            makeNotInteractive(object)
          }
        })

        this.canvas.renderOnAddRemove = true
        this.canvas.requestRenderAll()
      })
    }
  }

  _prepareCanvasObjects (objects) {
    const objectsToAdd = []
    const objectsToRemove = []

    objects.forEach((_) => {
      if (_._removed && this.canvas._objectsMap.has(_._id)) objectsToRemove.push(this.canvas._objectsMap.get(_._id))

      if (this.canvas._objectsMap.has(_._id)) {
        this._updateExistingObject(normalizeFields(_))
      } else if (!_._removed) objectsToAdd.push(_)
    })

    return {
      objectsToRemove,
      objectsToAdd,
    }
  }

  _updateExistingObject (object) {
    const canvasObject = this.canvas._objectsMap.get(object._id)

    if (object._restored) {
      // если объект "восстановленный" - тоже сбрасываем выделение
      SelectTool.removeFromSelection(this.canvas, canvasObject)
    }

    if (LockProvider.isLockedByUser(object) !== LockProvider.isLockedByUser(canvasObject)) {
      canvasObject.set(object)
      if (LockProvider.isLockedByUser(object)) {
        LockProvider.lockUserObject(canvasObject)
      } else {
        LockProvider.unlockUserObject(canvasObject)
      }
    } else {
      // Поменялся order?
      if (object._order > canvasObject._order) {
        this.canvas.bringToFront(canvasObject)
      } else if (object._order < canvasObject._order) {
        this.canvas.sendToBack(canvasObject)
      }
      canvasObject.set(object)
    }

    canvasObject.setCoords()
  }

  updateCanvasObjects (objects) {
    const {
      objectsToAdd,
      objectsToRemove,
    } = this._prepareCanvasObjects(objects)

    if (objectsToRemove.length) {
      this.ignoreObjectRemovedEvent = true
      this.canvas.remove(...objectsToRemove)
      objectsToRemove.forEach((object) => {
        this.canvas._objectsMap.delete(object._id)
      })
      this.ignoreObjectRemovedEvent = false
    }

    if (objectsToAdd.length) {
      const normalizedObjects = objectsToAdd.map(_ => normalizeFields({ ..._, remote: true }))

      fabric.util.enlivenObjects(normalizedObjects, (enlivenedObjects) => {
        this.canvas.renderOnAddRemove = false

        enlivenedObjects.forEach((object) => {
          if (this.canvas._objectsMap.has(object._id)) { // Обрабатываем случай, когда к моменту "оживления" объекта такой объект уже появился на доске
            this._updateExistingObject(object)
          } else {
            if (
              this.canvas._objects.length
              && object._order < this.canvas._objects[this.canvas._objects.length - 1]._order
            ) {
              const index = this.canvas._objects.findIndex(item => item._order > object._order)

              this.canvas.insertAt(object, index)
            } else {
              this.canvas.add(object)
            }

            this.canvas._objectsMap.set(object._id, object)
            if (LockProvider.isLockedByUser(object)) {
              LockProvider.lockUserObject(object)
            }
            if (LockProvider.isLockedBySelection(object)) {
              makeNotInteractive(object)
            }
          }
        })
        this.canvas.renderOnAddRemove = true
        this.canvas.requestRenderAll()
      })
    }
    this.canvas.requestRenderAll()
  }

  cleanSelection () {
    if (this.canvas && this.canvas.getActiveObject && this.canvas.getActiveObject()) this.canvas.discardActiveObject()
  }

  currentSelection () {
    if (this.canvas && this.canvas.getActiveObject) {
      return serializeObject(this.canvas.getActiveObject())
    }

    return null
  }

  __cleanTools () {
    this.__lockModeTool && this.__lockModeTool.destroy()

    this.__lockModeTool = undefined
  }

  // eslint-disable-next-line class-methods-use-this
  destroy () {
    BroadcastProvider.destroy()
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
  brushColor: { ...HEXtoRGB(defaultToolSettings.color), a: 1 },
  brushWidth: defaultToolSettings.size,
  tool: defaultToolSettings.tool,
  x: 0,
  y: 0,
  zoom: 1,
  zoomToCenter: false,
}
