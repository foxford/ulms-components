/* eslint-disable default-case,no-fallthrough,no-param-reassign,import/no-extraneous-dependencies */
import debounce from 'lodash/debounce'
import { fabric } from 'fabric/dist/fabric.min'

import { fromCSSColor, toCSSColor } from '../util/to-css-color'

import { Base } from './base'
import { makeInteractive, makeNotInteractive } from './object'

const POSITION_INCREMENT = 10

const DELAY = 100

const DEL_KEYCODE = 46
const BACKSPACE_KEYCODE = 8

const UP_KEYCODE = 38
const DOWN_KEYCODE = 40
const LEFT_KEYCODE = 37
const RIGHT_KEYCODE = 39

const A_KEYCODE = 65

const directions = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down',
}

export default class SelectTool extends Base {
  constructor (canvas, options = {}) {
    super(canvas)

    this.__options = options

    this.__lockedSelection = false
    this._timer = null
    this._shiftPressed = false
    this._mouseMove = false

    this._initialConfigure()
  }

  static isLockedSelection (object) {
    return !!object._lockedselection
  }

  static updateAllSelection (canvas, isSelected, isOwner) {
    canvas.forEachObject((_) => {
      const { _lockedselection: selection } = (_ || {})

      if (_ && selection) {
        if (isSelected(selection)) {
          makeNotInteractive(_)
        } else {
          makeInteractive(_)
          if (!isOwner(selection)) {
            _.set({ '_lockedselection': undefined })
          }
        }
      }
    })
  }

  static updateObjectSelection (canvas, object) {
    if (object._lockedselection && (object._lockedselection !== canvas._id)) {
      makeNotInteractive(object)
    } else {
      makeInteractive(object)
    }
  }

  static removeFromSelection (canvas, object) {
    if (canvas.getActiveObjects().length > 1) {
      // Remove one object from ActiveSelection
      canvas.getActiveObject().removeWithUpdate(object)
      canvas.renderAll()
    } else {
      // Remove last object from ActiveSelection
      const activeObject = canvas.getActiveObject() || {}

      if (activeObject._id === object._id) {
        canvas.discardActiveObject()
      }
    }
  }

  get _activeSelection () {
    if (this._canvas.getActiveObjects().length) {
      return this._canvas.getActiveObject()
    }

    return null
  }

  _initialConfigure () {
    this._canvas.forEachObject((_) => {
      if (_._lockedselection && (_._lockedselection !== this._canvas._id)) {
        makeNotInteractive(_)
      } else {
        makeInteractive(_)
      }
    })

    this._canvas.isDrawingMode = false
    this._canvas.selection = true
    this._canvas.perPixelTargetFind = true
    this._canvas.defaultCursor = 'default'
    this._canvas.setCursor('default')
    this._debouncedUnsetSelection = debounce(this._unsetSelection, DELAY)
  }

  _performAction (action, triggerModified = false, actionName = 'object:modified') {
    if (this._activeSelection) {
      const activeObjects = this._canvas.getActiveObjects()

      const modifiedObjects = activeObjects.map((object) => {
        object && action(object)

        return this._maybeFixCoords(object)
      })

      if (triggerModified) {
        this._canvas.trigger(actionName, { target: modifiedObjects })
      }
    }
  }

  _maybeFixCoords (object) {
    if (object.group) { // Если объект в группе, то надо пересчитать его координаты
      const updatedObject = fabric.util.object.clone(object) // Клонируем, чтобы на зааффектить локальные координаты в группе...
      const matrix = object.group.calcTransformMatrix()
      const { x: left, y: top } = fabric.util.transformPoint({ x: object.left, y: object.top }, matrix)
      const angle = (object.angle + object.group.angle) % 360

      updatedObject.set({
        top,
        left,
        angle,
        '_lockedlocal': this._canvas._id, // ...и локально пропускаем этот объект
      })

      return updatedObject
    }

    return object
  }

  configure (options) {
    if (!options.initial) {
      this._performAction(object => this._configureObject(object, options), true)
    }
  }

  _configureObject (object, options) {
    const newOpt = { stroke: options.lineColor }

    if (object.type === 'path') {
      const { a } = fromCSSColor(object.stroke)
      const {
        r, g, b,
      } = fromCSSColor(options.lineColor)

      newOpt.stroke = toCSSColor({
        r, g, b, a,
      })
    }
    // ToDo: вынести в константу!
    if (object.fill && (object.fill !== 'rgba(0,0,0,0.009)')) {
      newOpt.fill = options.lineColor
    }
    object.set(newOpt)
  }

  destroy () {
    this.__lockedSelection && this._unsetSelection()
    this._canvas.discardActiveObject()
  }

  _delete = () => {
    this._performAction(this._deleteObject, true, 'object:removed')
    this._canvas.discardActiveObject()
  }

  _deleteObject = (object) => {
    if (object) {
      object.set({ _draft: true })
      this._canvas.remove(object)
    }
  }

  _move (direction) {
    if (this._activeSelection) {
      if (this.__options.isPresentation) {
        switch (direction) {
          case directions.left:

          case directions.right:
            this.destroy() // Moving to another page
        }
      } else {
        this._setSelection({ delayed: true })

        const increment = this._shiftPressed ? 10 : 1

        switch (direction) {
          case directions.left:
            this._activeSelection.set({ left: this._activeSelection.get('left') - POSITION_INCREMENT * increment })
            break

          case directions.right:
            this._activeSelection.set({ left: this._activeSelection.get('left') + POSITION_INCREMENT * increment })
            break

          case directions.up:
            this._activeSelection.set({ top: this._activeSelection.get('top') - POSITION_INCREMENT * increment })
            break

          case directions.down:
            this._activeSelection.set({ top: this._activeSelection.get('top') + POSITION_INCREMENT * increment })
            break
        }
        this._activeSelection.setCoords()
        this._canvas.requestRenderAll()
      }
    }
  }

  _moveLeft = () => this._move(directions.left)

  _moveRight = () => this._move(directions.right)

  _moveUp = () => this._move(directions.up)

  _moveDown = () => this._move(directions.down)

  _setObject = (object) => {
    if (!object.get('_lockedselection')) {
      object.set({ '_lockedselection': this._canvas._id })
    }
  }

  _unsetObject = (object) => {
    if (object.get('_lockedselection')) {
      object.set({ '_lockedselection': undefined })
    }
  }

  _setSelection (opt = {}) {
    if (!this.__lockedSelection) {
      if (opt.delayed) {
        this.__timer = setTimeout(() => {
          this.__lockedSelection = true
          this._performAction(this._setObject, true)
        }, DELAY)
      } else {
        this.__lockedSelection = true
        this._performAction(this._setObject, true)
      }
    }
  }

  _unsetSelection () {
    this._performAction(this._unsetObject, true)

    this.__lockedSelection = false
    this.__timer && clearTimeout(this.__timer)
    this.__timer = null
  }

  handleTextEditStartEvent (opts) {
    this._setSelection()
    if (opts.target && opts.target.hiddenTextarea) {
      opts.target.hiddenTextarea.style.width = '10px'
      opts.target.hiddenTextarea.style.height = '10px'
      opts.target.hiddenTextarea.style.fontSize = '10px'
    }
  }

  handleTextEditEndEvent () {
    this._unsetSelection()
  }

  handleMouseDownEvent () {
    if (!this._active || !this._activeSelection) return

    this._mouseMove = true
  }

  handleMouseUpEvent () {
    if (this._mouseMove && this.__lockedSelection) {
      this._unsetSelection()
    }
    this._mouseMove = false
  }

  handleMouseMoveEvent () {
    if (this._mouseMove && !this.__lockedSelection) {
      this._setSelection()
    }
  }

  handleKeyDownEvent (e) {
    if (!this._active) return

    const { keyCode } = e

    if (keyCode === A_KEYCODE && (e.metaKey || e.ctrlKey)) {
      this._canvas.discardActiveObject()
      const selection = new fabric.ActiveSelection(this._canvas.getObjects(), {
        canvas: this._canvas,
      })

      this._canvas.setActiveObject(selection)
      this._canvas.requestRenderAll()
    } else if (!this._mouseMove) {
      this._shiftPressed = e.shiftKey

      switch (keyCode) {
        case DEL_KEYCODE:

        case BACKSPACE_KEYCODE:
          this._delete()

          break

        case UP_KEYCODE:
          this._moveUp()

          break

        case DOWN_KEYCODE:
          this._moveDown()

          break

        case LEFT_KEYCODE:
          this._moveLeft()

          break

        case RIGHT_KEYCODE:
          this._moveRight()

          break
      }
    }
  }

  handleKeyUpEvent (e) {
    if (!this._active) return

    this._shiftPressed = e.shiftKey

    if (!this._mouseMove && this.__lockedSelection) {
      if ((e.keyCode === UP_KEYCODE)
        || (e.keyCode === DOWN_KEYCODE)
        || (e.keyCode === LEFT_KEYCODE)
        || (e.keyCode === RIGHT_KEYCODE)) {
        this._debouncedUnsetSelection()
      }
    }
  }

  handleObjectAddedEvent (opts) {
    Object.assign(opts.target, {
      evented: true,
      hoverCursor: 'move',
      selectable: true,
    })
  }

  handleSelectionUpdatedEvent () {}

  handleSelectionCreatedEvent () {}

  handleSelectionClearedEvent () {}

  makeInactive () {
    super.makeInactive()
    this._canvas.selection = false
  }

  makeActive () {
    super.makeActive()
    this._canvas.selection = true
  }

  reset () {
    this.__lockedSelection && this._unsetSelection()
    this._canvas.discardActiveObject()

    this._shiftPressed = false
    this._mouseMove = false

    this._canvas._currentTransform = null
  }
}
