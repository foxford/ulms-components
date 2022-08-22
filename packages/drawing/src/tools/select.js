/* eslint-disable no-param-reassign,default-case,no-fallthrough,import/no-extraneous-dependencies,class-methods-use-this */
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

import { fromCSSColor, toCSSColor } from '../util/to-css-color'

import { keycodes, DEBOUNCE_DELAY, THROTTLE_DELAY, toolEnum } from '../constants'

import { LockProvider } from '../lock-provider'

import { Base } from './base'

const POSITION_INCREMENT = 10

/**
 * calcDistance - вычисляет расстояние между двумя точками на доске
 * @param point1 - Point(x, y)
 * @param point2 - Point(x, y)
 * @return {number}
 */
const calcDistance = (point1, point2) => {
  if (point1 && point2) {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2)
  }

  return 0
}

const DELTA = 3 // Максимальное расстояние при клике, при котором срабатывает выделение

const directions = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down',
}

export default class SelectTool extends Base {
  constructor (canvas, options = {}) {
    super(canvas)

    this.__object = null
    this.__options = options

    this.__timer = null
    this.__shiftPressed = false
    this.__mouseDown = false
    this.__mouseDownPoint = null
    this.__isMoving = false
    this.__zoom = 0

    this._onBroadcast = null
    this._onSelection = null
    this._showContextMenuFunc = null
    this._debouncedTriggerModified = null

    this._initialConfigure()
  }

  set onBroadcast (func) {
    this._onBroadcast = func
  }

  set onSelection (func) {
    this._onSelection = func
  }

  set showContextMenu (func) {
    this._showContextMenuFunc = func
  }

  set zoom (zoom) {
    this.__zoom = zoom

    this._sendContextMenuEvent()
  }

  static removeFromSelection (canvas, object) {
    if (!canvas || !canvas.getActiveObjects || !canvas.getActiveObject) return

    if (canvas.getActiveObjects().length > 1) {
      // Remove one object from ActiveSelection
      canvas.getActiveObject().removeWithUpdate(object)
      canvas.renderAll()
    } else {
      // Remove last object from ActiveSelection
      let activeObject = canvas.getActiveObject()

      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          activeObject = activeObject._objects[0] || {}
        }

        if (activeObject._id === object._id) {
          canvas.discardActiveObject()
        }
      }
    }
  }

  _initialConfigure () {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.perPixelTargetFind = true
    this._canvas.targetFindTolerance = 15
    this._canvas.defaultCursor = 'default'
    this._canvas.setCursor('default')
    this._debouncedTriggerModified = debounce(this._triggerModified, DEBOUNCE_DELAY)
    this._throttledTriggerUpdate = throttle((id, diff) => this._triggerUpdate(id, diff), THROTTLE_DELAY)
  }

  configure (opt) {
    if (this.__object) {
      const newOpt = { stroke: opt.lineColor }

      if (this.__object.type === 'path') {
        const { a } = fromCSSColor(this.__object.stroke)
        const {
          r, g, b,
        } = fromCSSColor(opt.lineColor)

        newOpt.stroke = toCSSColor({
          r, g, b, a,
        })
      }

      // ToDo: вынести в константу!
      if (this.__object.fill && (this.__object.fill !== 'rgba(0,0,0,0.009)')) {
        newOpt.fill = opt.lineColor
      }

      this.__object.set(newOpt)
      this._triggerModified()
    }
  }

  destroy () {
    this._canvas.discardActiveObject()

    this._onBroadcast = null
    this._onSelection = null
    this._showContextMenuFunc = null
    this._debouncedTriggerModified = null
  }

  _sendContextMenuEvent = (close = false) => {
    if (this._showContextMenuFunc) {
      if (close || !this.__object) {
        this._showContextMenuFunc(false)
      } else {
        this._showContextMenuFunc(true, this._canvas.getAbsoluteCoords(this.__object))
      }
    }
  }

  _deleteObject = () => {
    if (this.__object) {
      this.__object.set({ '_toDelete': true })
      this._canvas.remove(this.__object)
    }
  }

  _move = (direction) => {
    if (this.__object) {
      if (this.__options.isPresentation) {
        switch (direction) {
          case directions.left:

          case directions.right:
            this.destroy() // Moving to another page
        }
      } else {
        const increment = this.__shiftPressed ? 10 : 1

        switch (direction) {
          case directions.left:
            this.__object.set({ left: this.__object.get('left') - POSITION_INCREMENT * increment })
            break

          case directions.right:
            this.__object.set({ left: this.__object.get('left') + POSITION_INCREMENT * increment })
            break

          case directions.up:
            this.__object.set({ top: this.__object.get('top') - POSITION_INCREMENT * increment })
            break

          case directions.down:
            this.__object.set({ top: this.__object.get('top') + POSITION_INCREMENT * increment })
            break
        }
        this.__object.setCoords()
        this._canvas.renderAll()
        this._debouncedTriggerModified()
      }
    }
  }

  _moveLeft = () => this._move(directions.left)

  _moveRight = () => this._move(directions.right)

  _moveUp = () => this._move(directions.up)

  _moveDown = () => this._move(directions.down)

  _triggerModified () {
    if (this.__object) {
      this._canvas.fire('object:modified', { target: this.__object })
    }
  }

  _triggerUpdate (id, diff) {
    if (id && this._onBroadcast) {
      this._onBroadcast({
        id,
        diff,
      })
    }
  }

  handleTextEditStartEvent (opts) {
    if (opts.target && opts.target.hiddenTextarea) {
      opts.target.hiddenTextarea.style.width = '10px'
      opts.target.hiddenTextarea.style.height = '10px'
      opts.target.hiddenTextarea.style.fontSize = '10px'
    }
  }

  handleTextEditEndEvent () {
    if (this.__object && this.__object.__local) {
      this.__object.set('__local', undefined)
    }
    this._triggerModified()
  }

  handleMouseDownEvent (event) {
    this.__mouseDown = true

    this.__mouseDownPoint = event.pointer
    if (event.target) {
      this.__isMoving = false
    }
  }

  handleMouseMoveEvent (event) {
    if (!this._active) return
    if (this.__mouseDown && event.target) {
      const { target } = event

      if (!this.__isMoving) { // Отсылаем только один раз в начале движения
        this.__isMoving = true
        this._sendContextMenuEvent(true)
      }
      this._throttledTriggerUpdate(target._id, { top: target.top, left: target.left })
    }
  }

  handleMouseUpEvent (event) {
    this.__mouseDown = false

    const mouseDistance = calcDistance(event.pointer, this.__mouseDownPoint)

    if (event.target) {
      // _selected - признак того, что на объекте уже есть выделение
      if (mouseDistance < DELTA || event.target._selected) {
        this._onSelection && this._onSelection(event.target)
        this._sendContextMenuEvent()

        if (LockProvider.isLockedByUser(event.target)) {
          LockProvider.lockUserObject(event.target, {
            _selected: true,
            hasBorders: true,
          })
        } else if (event.target.type === 'WhiteboardLine' || event.target.type === 'WhiteboardArrowLine') {
          event.target.set({
            hasControls: true, _selected: true,
          })
        } else {
          event.target.set({
            hasBorders: true, hasControls: true, _selected: true,
          })
        }
        this._canvas.requestRenderAll() // иначе не появится выделение до первой перерисовки
      } else { // мы просто передвинули объект - снимаем выделение
        this._canvas.discardActiveObject()
      }
    }
  }

  handleKeyDownEvent (e) {
    if (!this._active) return
    if (this.__object && this.__object.isEditing) return

    if (!this.__mouseDown && !LockProvider.isLockedByUser(this.__object)) {
      const { keyCode } = e

      this.__shiftPressed = e.shiftKey

      switch (keyCode) {
        case keycodes.DEL_KEYCODE:

        case keycodes.BACKSPACE_KEYCODE:
          this._deleteObject()

          break

        case keycodes.UP_KEYCODE:
          this._moveUp()

          break

        case keycodes.DOWN_KEYCODE:
          this._moveDown()

          break

        case keycodes.LEFT_KEYCODE:
          this._moveLeft()

          break

        case keycodes.RIGHT_KEYCODE:
          this._moveRight()

          break
      }
    }
  }

  handleKeyUpEvent (e) {
    if (!this._active) return

    this.__shiftPressed = e.shiftKey
  }

  handleObjectAddedEvent (opts) {
    Object.assign(opts.target, {
      evented: true,
      hoverCursor: 'move',
      selectable: true,
    })
  }

  handleSelectionUpdatedEvent = (event) => {
    if (!this._active) return

    this.__object = event.target
  }

  handleSelectionCreatedEvent = (event) => {
    if (!this._active) return

    this.__object = event.target

    if (event.target._selected) { // обрабатываем случай копипасты
      this._onSelection && this._onSelection(event.target)
      this._sendContextMenuEvent()
    }
  }

  handleSelectionClearedEvent = (event) => {
    if (!this._active) return

    let sendSelectionEvent = false

    event.deselected && event.deselected.forEach((object) => {
      sendSelectionEvent = sendSelectionEvent || object._selected
      object.set({
        hasBorders: false, hasControls: false, _selected: false,
      })
      if (object.type === toolEnum.TEXT && object.text === '') {
        this._canvas.remove(object)
      }
    })
    this._sendContextMenuEvent(true)
    if (this._onSelection && sendSelectionEvent) {
      this._onSelection(null)
    }
    this.__object = null
  }

  handleTextChangedEvent = (e) => {
    const { target } = e

    this._throttledTriggerUpdate(target._id, { text: target.text })
  }

  reset () {
    this.__shiftPressed = false
    this.__mouseDown = false

    this._canvas._currentTransform = null

    this._canvas.discardActiveObject()
  }
}
