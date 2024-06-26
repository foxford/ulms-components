/* eslint-disable react/prop-types, max-classes-per-file, promise/catch-or-return */
import React from 'react'
import { fabric } from 'fabric/dist/fabric.min'
import Hammer from 'hammerjs'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

import {
  penToolModeEnum,
  lineToolModeEnum,
  shapeToolModeEnum,
  toolEnum,
  defaultToolSettings,
  MAX_TEXT_LENGTH,
} from './constants'
import './util/fabric-presets'
import { HEXtoRGB, toCSSColor } from './util/to-css-color'
import { serializeObject, normalizeFields } from './util/serialize-object'
import { LockProvider } from './lock-provider'
import { CopyPasteProvider } from './copy-paste-provider'
import { CursorProvider } from './cursor-provider'
import { BroadcastProvider } from './broadcast-provider'
import {
  keyboardEvents,
  KeyboardListenerProvider,
} from './keyboard-listener-provider'
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
import { makeInteractive, makeNotInteractive } from './tools/object'

function isShapeObject(object) {
  return (
    object.type === shapeToolModeEnum.CIRCLE ||
    object.type === shapeToolModeEnum.RECT ||
    object.type === shapeToolModeEnum.TRIANGLE
  )
}

function clearExternalSelection() {
  // Сбрасываем выделение на других областях
  if (window.getSelection) {
    window.getSelection().removeAllRanges()
  } else if (document.selection) {
    document.selection.empty()
  }
}

let abortController = null
let signal = null

// eslint-disable-next-line import/prefer-default-export
export class Drawing extends React.Component {
  constructor(props) {
    super(props)

    this.canvas = null
    this.eventsEndabled = false
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

    const { tokenProvider } = this.props

    if (!tokenProvider) throw new TypeError('Absent tokenProvider')

    this.__lockModeTool = null
  }

  componentDidMount() {
    const {
      canDraw,
      tool,
      pattern,
      tokenProvider,
      broadcastProvider,
      pageObjects,
      staticCanvas,
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
      this.initCanvasListeners()
      this.eventsEndabled = canDraw
      KeyboardListenerProvider.enabled = canDraw
    }

    KeyboardListenerProvider.enabled = canDraw

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

  componentDidUpdate(prevProps) {
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
        this.initCanvasListeners()
        this.eventsEndabled = canDraw
        KeyboardListenerProvider.enabled = canDraw
      }
      KeyboardListenerProvider.enabled = canDraw

      this.updateCanvasParameters(true)
      this.createCanvasObjects(pageObjects)
    }

    if (canDraw !== prevProps.canDraw) {
      KeyboardListenerProvider.enabled = canDraw
      this.eventsEndabled = canDraw

      if (tool === toolEnum.SELECT) {
        if (canDraw) {
          LockTool.updateAllLock(this.canvas)
        } else {
          this.canvas.forEachObject((_) => makeNotInteractive(_))
        }
        this.canvas.requestRenderAll()
      }
    }

    if (prevProps.pattern !== pattern) {
      if (pattern === null) {
        this.dynamicPattern.destroy()
        this.destroyCanvasPattern()

        this.dynamicPattern = null
      } else {
        if (!this.dynamicPattern) {
          this.initCanvasPattern()

          this.dynamicPattern = new DynamicPattern(this.canvasPattern)
          this.updateCanvasPatternParameters()
        }

        this.dynamicPattern.setPattern(pattern)
        this.updateCanvasPattern()
      }
    }

    if (
      prevProps.height !== height ||
      prevProps.width !== width ||
      prevProps.x !== x ||
      prevProps.y !== y ||
      prevProps.zoom !== zoom
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
      (prevProps.tool !== tool ||
        prevProps.brushColor !== brushColor ||
        prevProps.brushMode !== brushMode ||
        // need to update the tool if it's a pen
        tool === toolEnum.PEN) &&
      (prevProps.tool !== tool || tool !== toolEnum.SELECT)
    ) {
      this.initTool(tool)
    }

    if (
      canDraw &&
      (prevProps.brushColor !== brushColor ||
        prevProps.brushMode !== brushMode ||
        prevProps.brushWidth !== brushWidth ||
        prevProps.eraserWidth !== eraserWidth ||
        prevProps.stampSrc !== stampSrc)
    ) {
      this.configureTool()
    }
  }

  componentWillUnmount() {
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

  _handleKeyDown = (options) => {
    if (this.eventsEndabled && this.tool) this.tool.handleKeyDownEvent(options)
  }

  _handleKeyUp = (options) => {
    if (this.eventsEndabled && this.tool) this.tool.handleKeyUpEvent(options)
  }

  _handleMouseDown = (options) => {
    const { onMouseDown, tool, isPresentation } = this.props

    if (
      this.tool &&
      (this.eventsEndabled || (tool === toolEnum.PAN && !isPresentation))
    ) {
      this.tool.handleMouseDownEvent(options)
    }

    if (onMouseDown) {
      onMouseDown({ ...options, vptCoords: this.canvas.vptCoords })
    }
  }

  _handleMouseMove = (options) => {
    const { onMouseMove, tool, isPresentation } = this.props

    CursorProvider.onMouseMove(options)

    if (
      this.tool &&
      (this.eventsEndabled || (tool === toolEnum.PAN && !isPresentation))
    ) {
      this.tool.handleMouseMoveEvent(options)
    }

    if (onMouseMove) {
      onMouseMove({ ...options, vptCoords: this.canvas.vptCoords })
    }
  }

  _handleMouseUp = (options) => {
    const { onMouseUp, tool, isPresentation } = this.props

    if (
      this.tool &&
      (this.eventsEndabled || (tool === toolEnum.PAN && !isPresentation))
    ) {
      this.tool.handleMouseUpEvent(options)
    }

    if (onMouseUp) {
      onMouseUp({ ...options, vptCoords: this.canvas.vptCoords })
    }
  }

  _handleMouseOver = (options) => {
    if (this.tool && this.eventsEndabled)
      this.tool.handleMouseOverEvent(options)
  }

  _handleMouseOut = (options) => {
    if (this.tool && this.eventsEndabled) this.tool.handleMouseOutEvent(options)
  }

  _handleTextEditStartEvent = (options) => {
    if (options.target.hiddenTextarea) {
      // limit textarea length
      // eslint-disable-next-line no-param-reassign
      options.target.hiddenTextarea.maxLength = MAX_TEXT_LENGTH
    }

    if (this.eventsEndabled && this.tool) {
      this.tool.handleTextEditStartEvent(options)
    }
  }

  _handleTextEditEndEvent = (options) => {
    if (this.eventsEndabled && this.tool) {
      this.tool.handleTextEditEndEvent(options)
    }
  }

  _handleTextChangedEvent = (options) => {
    if (this.eventsEndabled && this.tool) {
      this.tool.handleTextChangedEvent(options)
    }
  }

  _handleSelectionUpdatedEvent = (options) => {
    clearExternalSelection()

    if (this.eventsEndabled && this.tool) {
      this.tool.handleSelectionUpdatedEvent(options)
    }
  }

  _handleSelectionCreatedEvent = (options) => {
    clearExternalSelection()

    if (this.eventsEndabled && this.tool) {
      this.tool.handleSelectionCreatedEvent(options)
    }
  }

  _handleSelectionClearedEvent = (options) => {
    if (this.eventsEndabled && this.tool) {
      this.tool.handleSelectionClearedEvent(options)
    }
  }

  _handleAfterRender = () => {
    const { onAfterRender } = this.props

    this.updateCanvasPattern()

    if (onAfterRender) onAfterRender()
  }

  // eslint-disable-next-line react/sort-comp
  initCanvas() {
    const { clientId, onLockSelection, mobile, canDraw } = this.props

    fabric.Object.prototype.objectCaching = !mobile

    this.canvas = new fabric.Canvas('canvas', {
      selection: canDraw,
      enablePointerEvents: 'PointerEvent' in window,
      preserveObjectStacking: true, // Чтобы выделенный объект не выходил на верхний слой
    })

    if (!canDraw) {
      this.canvas.selection = false
      fabric.Object.prototype.hasControls = false
    }

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
    if (this.tool) this.tool.handleObjectAddedEvent(event)

    if (!this.canvas.renderOnAddRemove) return

    const { onDraw, uniqId, selectOnInit } = this.props
    const object = event.target

    // Skipping draft objects
    if (object._draft) return

    if (object.remote) {
      delete object.remote
    } else {
      object._id = uniqId()

      if (selectOnInit && isShapeObject(object)) return

      if (this.canvas._objects.length > 1) {
        const order = this.canvas._objects.at(-2)._order || 0

        object._order = order + 1
      } else {
        object._order = 0
      }

      if (onDraw) {
        onDraw(serializeObject(object))
      }

      this.canvas._objectsMap.set(object._id, object)
    }
  }

  _handleObjectModified = (event) => {
    const { onDrawUpdate } = this.props
    const object = event.target

    // Skipping draft objects
    if (object._draft) return

    if (object._order === undefined) {
      if (this.canvas._objects.length > 1) {
        const order = this.canvas._objects.at(-2)._order || 0

        object._order = order + 1
      } else {
        object._order = 0
      }
    }

    if (onDrawUpdate) onDrawUpdate(serializeObject(object))
  }

  _handleObjectRemoved = (event) => {
    if (!this.canvas.renderOnAddRemove) return

    if (this.ignoreObjectRemovedEvent) return

    const { onObjectRemove } = this.props
    const object = event.target

    // Skipping draft objects
    if (object._draft) return

    if (onObjectRemove) onObjectRemove(serializeObject(object))

    this.canvas._objectsMap.delete(object._id)
  }

  _handleMouseWheel = (event) => {
    const { onZoom } = this.props
    let delta = event.e.deltaY > 0 ? 0.05 : -0.05
    if (event.e.ctrlKey) delta = -delta // Это тачпад, а не мышь - инвертируем
    let zoom = this.canvas.getZoom() + delta

    if (zoom > 2) zoom = 2
    if (zoom < 0.2) zoom = 0.2

    this.canvas.zoomToPoint({ x: event.e.offsetX, y: event.e.offsetY }, zoom)

    const { tl } = this.canvas.calcViewportBoundaries()
    const { x, y } = tl

    event.e.preventDefault()
    event.e.stopPropagation()

    if (onZoom) {
      onZoom({ x, y, zoom })
    }
  }

  initCanvasListeners() {
    const {
      onKeyDown,
      isPresentation,
      onKeyUp,
      onZoom,
      disableMobileGestures,
    } = this.props

    this.canvas.allowTouchScrolling = !disableMobileGestures

    this.canvas.on('mouse:down', this._handleMouseDown)
    this.canvas.on('mouse:move', this._handleMouseMove)
    this.canvas.on('mouse:up', this._handleMouseUp)
    this.canvas.on('mouse:over', this._handleMouseOver)
    this.canvas.on('mouse:out', this._handleMouseOut)
    this.canvas.on('text:editing:entered', this._handleTextEditStartEvent)
    this.canvas.on('text:editing:exited', this._handleTextEditEndEvent)
    this.canvas.on('text:changed', this._handleTextChangedEvent)
    this.canvas.on('selection:updated', this._handleSelectionUpdatedEvent)
    this.canvas.on('selection:created', this._handleSelectionCreatedEvent)
    this.canvas.on('selection:cleared', this._handleSelectionClearedEvent)

    KeyboardListenerProvider.on(
      keyboardEvents.keyDown,
      this.__lockModeTool.handleKeyDownEvent,
    )
    KeyboardListenerProvider.on(
      keyboardEvents.keyUp,
      this.__lockModeTool.handleKeyUpEvent,
    )
    KeyboardListenerProvider.on(keyboardEvents.keyDown, this._handleKeyDown)
    KeyboardListenerProvider.on(keyboardEvents.keyUp, this._handleKeyUp)

    if (onKeyDown)
      KeyboardListenerProvider.on(keyboardEvents.keyDown, onKeyDown)
    if (onKeyUp) KeyboardListenerProvider.on(keyboardEvents.keyUp, onKeyUp)

    this.canvas.on('object:added', this._handleObjectAdded)

    // eslint-disable-next-line sonarjs/no-duplicate-string
    this.canvas.on('object:modified', this._handleObjectModified)

    this.canvas.on('object:removed', this._handleObjectRemoved)

    if (!this._hammer) {
      this.initHammer(this.canvas.upperCanvasEl, isPresentation)
    }

    if (onZoom) this.canvas.on('mouse:wheel', this._handleMouseWheel)
  }

  destroyCanvasListeners() {
    const { onKeyDown, onKeyUp, onZoom } = this.props

    this.canvas.allowTouchScrolling = false

    this.canvas.off('mouse:down', this._handleMouseDown)
    this.canvas.off('mouse:move', this._handleMouseMove)
    this.canvas.off('mouse:up', this._handleMouseUp)
    this.canvas.off('editing:entered', this._handleTextEditStartEvent)
    this.canvas.off('editing:exited', this._handleTextEditEndEvent)
    this.canvas.off('text:changed', this._handleTextChangedEvent)
    this.canvas.off('selection:updated', this._handleSelectionUpdatedEvent)
    this.canvas.off('selection:created', this._handleSelectionCreatedEvent)
    this.canvas.off('selection:cleared', this._handleSelectionClearedEvent)

    KeyboardListenerProvider.off(
      keyboardEvents.keyDown,
      this.__lockModeTool.handleKeyDownEvent,
    )
    KeyboardListenerProvider.off(
      keyboardEvents.keyUp,
      this.__lockModeTool.handleKeyUpEvent,
    )
    KeyboardListenerProvider.off(keyboardEvents.keyDown, this._handleKeyDown)
    KeyboardListenerProvider.off(keyboardEvents.keyUp, this._handleKeyUp)

    if (onKeyDown)
      KeyboardListenerProvider.off(keyboardEvents.keyDown, onKeyDown)
    if (onKeyUp) KeyboardListenerProvider.off(keyboardEvents.keyUp, onKeyUp)

    this.canvas.off('object:added', this._handleObjectAdded)

    this.canvas.off('object:modified', this._handleObjectModified)

    this.canvas.off('object:removed', this._handleObjectRemoved)

    if (onZoom) this.canvas.off('mouse:wheel', this._handleMouseWheel)

    this.destroyHammer()
  }

  initCanvasPattern() {
    this.canvasPattern = new fabric.StaticCanvas('canvasPattern')
  }

  initStaticCanvas() {
    const { clientId } = this.props

    this.canvas = new fabric.StaticCanvas('canvas')
    this.canvas._id = clientId

    this.canvas._objectsMap = new Map()

    LockProvider.canvas = null
    CursorProvider.canvas = null
    CopyPasteProvider.canvas = null
  }

  updateCanvasPattern() {
    if (this.dynamicPattern) {
      this.dynamicPattern.update({
        offsetX: this.canvas.viewportTransform[4],
        offsetY: this.canvas.viewportTransform[5],
        zoom: this.canvas.getZoom(),
      })
    }
  }

  destroyCanvas() {
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

  destroyCanvasPattern() {
    if (this.canvasPattern !== null) {
      this.canvasPattern.clear()
      this.canvasPattern.dispose()

      this.canvasPattern = null
    }
  }

  initTool(tool) {
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

    if (this.tool) this.tool.destroy()

    LockProvider.tool = tool

    switch (tool) {
      case toolEnum.ERASER: {
        this.tool = new EraserTool(this.canvas)

        break
      }

      case toolEnum.PAN: {
        this.tool = new PanTool(this.canvas)

        break
      }

      case toolEnum.PEN: {
        this.tool = new PenTool(this.canvas)
        break
      }

      case toolEnum.LINE: {
        this.tool =
          brushMode === lineToolModeEnum.LINE ||
          brushMode === lineToolModeEnum.DASHED_LINE
            ? new LineTool(this.canvas)
            : new ArrowTool(this.canvas)
        break
      }

      case toolEnum.SELECT: {
        this.tool = new SelectTool(this.canvas, { isPresentation })
        LockTool.updateAllLock(this.canvas)

        this.tool.zoom = zoom
        this.tool.onSelection = onSelection
        this.tool.showContextMenu = showContextMenu

        this.canvas.requestRenderAll()

        break
      }

      case toolEnum.TEXT: {
        this.tool = new TextboxTool(this.canvas, undefined, {
          fill: toCSSColor(brushColor),
          fontSize,
          fontFamily:
            '-apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        })

        break
      }

      case toolEnum.STAMP: {
        this.tool = new StampTool(this.canvas, brushMode, publicStorageProvider)

        break
      }

      case toolEnum.SHAPE: {
        // eslint-disable-next-line sonarjs/no-nested-switch
        switch (brushMode) {
          case shapeToolModeEnum.CIRCLE: {
            this.tool = new ShapeTool(
              this.canvas,
              () => circle({ stroke: toCSSColor(brushColor) }),
              {
                adjustCenter: '-0.5 -0.5',
                selectOnInit,
              },
            )

            break
          }

          case shapeToolModeEnum.CIRCLE_SOLID: {
            this.tool = new ShapeTool(
              this.canvas,
              () => circleSolid({ fill: toCSSColor(brushColor) }),
              {
                adjustCenter: '-0.5 -0.5',
                selectOnInit,
              },
            )

            break
          }

          case shapeToolModeEnum.RECT: {
            this.tool = new ShapeTool(
              this.canvas,
              () =>
                rectangle({
                  width: 97.2,
                  height: 97.2,
                  stroke: toCSSColor(brushColor),
                }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              },
            )

            break
          }

          case shapeToolModeEnum.RECT_SOLID: {
            this.tool = new ShapeTool(
              this.canvas,
              () =>
                rectangleSolid({
                  width: 97.2,
                  height: 97.2,
                  fill: toCSSColor(brushColor),
                }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              },
            )

            break
          }

          case shapeToolModeEnum.TRIANGLE: {
            this.tool = new ShapeTool(
              this.canvas,
              () =>
                triangle({
                  width: 97.2,
                  height: 97.2,
                  stroke: toCSSColor(brushColor),
                }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              },
            )

            break
          }

          case shapeToolModeEnum.TRIANGLE_SOLID: {
            this.tool = new ShapeTool(
              this.canvas,
              () =>
                triangleSolid({
                  fill: toCSSColor(brushColor),
                  height: 97.2,
                  width: 97.2,
                }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              },
            )

            break
          }

          case shapeToolModeEnum.RIGHT_TRIANGLE: {
            this.tool = new ShapeTool(
              this.canvas,
              () =>
                rightTriangle({
                  width: 97.2,
                  height: 97.2,
                  stroke: toCSSColor(brushColor),
                }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              },
            )

            break
          }

          case shapeToolModeEnum.RIGHT_TRIANGLE_SOLID: {
            this.tool = new ShapeTool(
              this.canvas,
              () =>
                rightTriangleSolid({
                  fill: toCSSColor(brushColor),
                  height: 97.2,
                  width: 97.2,
                }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              },
            )

            break
          }

          // eslint-disable-next-line sonarjs/no-duplicated-branches
          default: {
            this.tool = new ShapeTool(
              this.canvas,
              // eslint-disable-next-line sonarjs/no-identical-functions
              () =>
                rectangle({
                  width: 97.2,
                  height: 97.2,
                  stroke: toCSSColor(brushColor),
                }),
              {
                adjustCenter: '0 -1',
                selectOnInit,
              },
            )
          }
        }

        break
      }

      default: {
        this.tool = new PenTool(this.canvas)
      }
    }

    this.configureTool(true)
  }

  configureTool(initial = false) {
    const {
      brushColor,
      stampSrc,
      brushMode,
      brushWidth,
      eraserWidth,
      eraserPrecision,
      tool,
    } = this.props

    if (tool === toolEnum.PEN || tool === toolEnum.LINE) {
      const color =
        brushMode === penToolModeEnum.MARKER
          ? { ...brushColor, a: defaultToolSettings.markerAlpha }
          : brushColor
      const dashArray =
        brushMode === penToolModeEnum.DASHED_PENCIL ||
        brushMode === lineToolModeEnum.DASHED_LINE
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

  initHammer(element, isPresentation) {
    Hammer.defaults.touchAction = 'none'

    this._hammer = new Hammer(element)

    this._hammer.get('pan').set({ pointers: 2, threshold: 0 })

    if (!isPresentation) {
      this._hammer.on('panstart panmove panend pancancel', (event) => {
        // eslint-disable-next-line max-len
        const distance = Math.round(
          Math.hypot(
            event.pointers[1].x - event.pointers[0].x,
            event.pointers[1].y - event.pointers[0].y,
          ),
        )

        // eslint-disable-next-line default-case
        switch (event.type) {
          case 'panstart': {
            if (this.tool) {
              this.tool.makeInactive()
              this.tool.reset()
            }

            this._hammerCenter = event.center
            this._hammerDistance = distance
            this._hammerPanActive = true
            this._hammerZoom = this.canvas.getZoom()

            break
          }
          case 'panmove': {
            if (!this._hammerPanActive) return

            const zoom = this._hammerZoom
            let newZoom = zoom + 0.005 * (distance - this._hammerDistance)

            if (newZoom > 2) newZoom = 2
            if (newZoom < 0.2) newZoom = 0.2

            newZoom = Number.parseFloat(newZoom.toPrecision(3))

            this.canvas.viewportTransform[4] +=
              event.center.x - this._hammerCenter.x
            this.canvas.viewportTransform[5] +=
              event.center.y - this._hammerCenter.y

            if (newZoom === zoom) {
              this.canvas.requestRenderAll()
            } else {
              this.canvas.zoomToPoint(event.center, newZoom)
            }

            this._hammerCenter = event.center
            this._hammerDistance = distance
            this._hammerZoom = newZoom

            break
          }
          case 'panend':
          case 'pancancel': {
            if (!this._hammerPanActive) return

            const newZoom = Number.parseFloat(this._hammerZoom.toPrecision(2))

            this.canvas.zoomToPoint(event.center, newZoom)

            if (this.tool) {
              this.tool.makeActive()
            }

            this._hammerCenter = null
            this._hammerDistance = null
            this._hammerPanActive = false
            this._hammerZoom = null

            break
          }
          // No default
        }
      })
    }
  }

  destroyHammer() {
    if (this._hammer) {
      this._hammer.destroy()

      this._hammer = null
    }
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  addImage(url, options) {
    this.canvas.discardActiveObject()
    fabric.Image.fromURL(
      url,
      (image) => {
        const { tl, br } = this.canvas.calcViewportBoundaries()

        image.set({
          left: br.x - (br.x - tl.x) / 2 - image.width / 2,
          top: br.y - (br.y - tl.y) / 2 - image.height / 2,
          _selected: true, // Чтобы сработало выделение на новом объекте
        })

        this.canvas.add(image)
      },
      options,
    )
  }

  /**
   * Place set of images on board
   *
   * @param {Set} imageSet Set of image src's
   * @param {number} [offsetInc] offset of each image
   */
  // eslint-disable-next-line react/no-unused-class-component-methods
  addImageSet(imageSet, offsetInc = 16) {
    const { publicStorageProvider } = this.props
    const { tl, br } = this.canvas.calcViewportBoundaries()
    let offset = 0

    this.canvas.discardActiveObject()
    for (const source of imageSet) {
      fabric.Image.fromURL(
        publicStorageProvider.getUrl(publicStorageProvider.types.LIB, source),
        // eslint-disable-next-line no-loop-func
        (image) => {
          image.set({
            left: br.x - (br.x - tl.x) / 2 - image.width / 2 + offset,
            top: br.y - (br.y - tl.y) / 2 - image.height / 2 + offset,
            evented: true,
          })

          offset += offsetInc

          this.canvas.add(image)
        },
        { crossOrigin: 'anonymous' },
      )
    }
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  deleteSelection() {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      activeObject.set({ _toDelete: true })
      this.canvas.remove(activeObject)
    }
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  sendSelectionToBack() {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      const objects = this.canvas.getObjects()
      const order = objects[0]._order || 0

      activeObject.set({ _order: order - 1 })
      this.canvas.fire('object:modified', { target: activeObject })
      this.canvas.sendToBack(activeObject)
    }
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  bringSelectionToFront() {
    const activeObject = this.canvas.getActiveObject()

    if (activeObject) {
      const objects = this.canvas.getObjects()
      const order = objects.at(-1)._order

      activeObject.set({ _order: order + 1 })
      this.canvas.fire('object:modified', { target: activeObject })
      this.canvas.bringToFront(activeObject)
    }
  }

  updateCanvasParameters(forced = false) {
    const { height, width, x, y, zoom, zoomToCenter } = this.props
    const { tl } = this.canvas.calcViewportBoundaries()
    const currentDimensions = {
      height: this.canvas.getHeight(),
      width: this.canvas.getWidth(),
      ...tl,
      zoom: this.canvas.getZoom(),
    }
    const dimensionsChanged =
      currentDimensions.height !== height || currentDimensions.width !== width
    const viewportChanged =
      currentDimensions.x !== x || currentDimensions.y !== y
    const zoomChanged = currentDimensions.zoom !== zoom

    // dimensions
    if (forced || dimensionsChanged) {
      this.canvas.setDimensions({ height, width })
    }

    // viewport
    if (forced || viewportChanged) {
      this.canvas.absolutePan({
        x: x * currentDimensions.zoom,
        y: y * currentDimensions.zoom,
      })
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

  updateCanvasPatternParameters() {
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

  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  clearCanvasObjects({ silent } = { silent: true }) {
    this.canvas._objectsMap = new Map()
    if (this.canvas.getObjects().length > 0) {
      if (silent) this.ignoreObjectRemovedEvent = true
      this.canvas.clear()
      if (silent) this.ignoreObjectRemovedEvent = false
    }
  }

  _abortableCreateObjectsPromise = (pageObjects) =>
    new Promise((resolve) => {
      let shouldAbort = false

      signal.addEventListener('abort', () => {
        shouldAbort = true
        resolve()
      })

      const normalizedObjects = pageObjects
        .map((_) => normalizeFields({ ..._, remote: true }))
        .filter((_) => !_._removed)

      if (shouldAbort) return
      fabric.util.enlivenObjects(normalizedObjects, (enlivenedObjects) => {
        if (shouldAbort) return

        // Есть ситуации, когда во время выполнения enlivenObjects this.canvas уже нет
        if (!this.canvas) {
          resolve()

          return
        }

        for (const object of enlivenedObjects) {
          // Есть ситуации, когда во время выполнения enlivenObjects this.canvas уже нет
          if (!this.canvas) {
            resolve()

            // eslint-disable-next-line no-continue
            continue
          }

          this._fixObjectInteractivity(object)

          this.canvas._objectsMap.set(object._id, object)
        }
        if (shouldAbort) return
        this.canvas.renderOnAddRemove = false
        this.canvas.add(...enlivenedObjects)
        this.canvas.renderOnAddRemove = true

        if (shouldAbort) {
          // Если дошли до этого места и прервали загрузку объектов - надо удалить добавленные объекты
          this.canvas.remove(...enlivenedObjects)

          return
        }

        resolve()
      })
    })

  createCanvasObjects = (pageObjects) => {
    if (abortController) {
      abortController.abort()
      signal = null
      abortController = null
    }

    abortController = new window.AbortController()
    signal = abortController.signal

    this.clearCanvasObjects()

    if (pageObjects.length > 0) {
      this.canvas._loading = true
      this.canvas.defaultCursor = 'wait'
      this.canvas.freeDrawingCursor = 'wait'
      this.canvas.setCursor('wait')

      this._abortableCreateObjectsPromise(pageObjects)
        .then(() => {
          if (this.canvas) {
            this.canvas.requestRenderAll()
          }

          return null
        })
        .finally(() => {
          signal = null
          abortController = null

          if (!this.canvas) return

          this.canvas._loading = false
          this.canvas.defaultCursor = 'default'
          this.canvas.freeDrawingCursor = 'crosshair'
          this.canvas.setCursor('default')
          this.configureTool()
        })
    }
  }

  _prepareCanvasObjects(objects) {
    const objectsToAdd = []
    const objectsToRemove = []

    for (const _ of objects) {
      if (_._removed && this.canvas._objectsMap.has(_._id))
        objectsToRemove.push(this.canvas._objectsMap.get(_._id))

      if (this.canvas._objectsMap.has(_._id)) {
        this._updateExistingObject(normalizeFields(_))
      } else if (!_._removed) objectsToAdd.push(_)
    }

    return {
      objectsToRemove,
      objectsToAdd,
    }
  }

  _fixObjectInteractivity(object) {
    const { tool } = this.props

    if (tool === toolEnum.SELECT) {
      makeInteractive(object)
    } else if (tool === toolEnum.PAN) {
      object.set({ selectable: false, evented: false }) // Если PAN - не меняем курсор!
    } else {
      makeNotInteractive(object)
    }

    if (LockProvider.isLockedByUser(object)) {
      LockProvider.lockUserObject(object)
    }
    if (LockProvider.isLockedBySelection(object)) {
      makeNotInteractive(object)
    }
  }

  _updateExistingObject(object) {
    const canvasObject = this.canvas._objectsMap.get(object._id)

    if (object._restored) {
      // если объект "восстановленный" - тоже сбрасываем выделение
      SelectTool.removeFromSelection(this.canvas, canvasObject)
    }

    if (
      LockProvider.isLockedByUser(object) ===
      LockProvider.isLockedByUser(canvasObject)
    ) {
      // Поменялся order?
      if (object._order > canvasObject._order) {
        this.canvas.bringToFront(canvasObject)
      } else if (object._order < canvasObject._order) {
        this.canvas.sendToBack(canvasObject)
      }
      canvasObject.set(object)
    } else {
      canvasObject.set(object)
      if (LockProvider.isLockedByUser(object)) {
        LockProvider.lockUserObject(canvasObject)
      } else {
        LockProvider.unlockUserObject(canvasObject)
      }
    }

    canvasObject.setCoords()
  }

  updateCanvasObjects(objects) {
    const { objectsToAdd, objectsToRemove } =
      this._prepareCanvasObjects(objects)

    if (objectsToRemove.length > 0) {
      this.ignoreObjectRemovedEvent = true
      this.canvas.remove(...objectsToRemove)
      for (const object of objectsToRemove) {
        this.canvas._objectsMap.delete(object._id)
      }
      this.ignoreObjectRemovedEvent = false
    }

    if (objectsToAdd.length > 0) {
      const normalizedObjects = objectsToAdd.map((_) =>
        normalizeFields({ ..._, remote: true }),
      )

      fabric.util.enlivenObjects(normalizedObjects, (enlivenedObjects) => {
        // Есть ситуации, когда во время выполнения enlivenObjects this.canvas уже нет
        if (!this.canvas) return

        this.canvas.renderOnAddRemove = false

        for (const object of enlivenedObjects) {
          // Есть ситуации, когда во время выполнения enlivenObjects this.canvas уже нет
          // eslint-disable-next-line no-continue
          if (!this.canvas) continue

          this._fixObjectInteractivity(object)

          if (this.canvas._objectsMap.has(object._id)) {
            // Обрабатываем случай, когда к моменту "оживления" объекта такой объект уже появился на доске
            this._updateExistingObject(object)
          } else {
            if (
              this.canvas._objects.length > 0 &&
              object._order < this.canvas._objects.at(-1)._order
            ) {
              const index = this.canvas._objects.findIndex(
                (item) => item._order > object._order,
              )

              this.canvas.insertAt(object, index)
            } else {
              this.canvas.add(object)
            }

            this.canvas._objectsMap.set(object._id, object)
          }
        }
        this.canvas.renderOnAddRemove = true
        this.canvas.requestRenderAll()
      })
    }
    this.canvas.requestRenderAll()
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  cleanSelection() {
    if (
      this.canvas &&
      this.canvas.getActiveObject &&
      this.canvas.getActiveObject()
    )
      this.canvas.discardActiveObject()
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  currentSelection() {
    if (this.canvas && this.canvas.getActiveObject) {
      return serializeObject(this.canvas.getActiveObject())
    }

    return null
  }

  __cleanTools() {
    if (this.__lockModeTool) {
      this.__lockModeTool.destroy()

      this.__lockModeTool = undefined
    }
  }

  // eslint-disable-next-line class-methods-use-this,react/no-unused-class-component-methods
  destroy() {
    BroadcastProvider.destroy()
  }

  render() {
    const { height, width, pattern } = this.props

    return (
      <>
        <div style={{ position: 'absolute' }}>
          {/* eslint-disable-next-line max-len */}
          <canvas
            id="canvasPattern"
            ref={this.canvasPatternRef}
            width={width}
            height={height}
            style={{ display: pattern ? 'block' : 'none' }}
          />
        </div>
        <canvas
          id="canvas"
          ref={this.canvasRef}
          width={width}
          height={height}
        />
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
