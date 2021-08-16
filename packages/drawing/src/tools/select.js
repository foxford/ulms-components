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

const directions = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down',
}

export default class SelectTool extends Base {
  constructor (canvas, options = {}) {
    super(canvas)

    this.__selection = null
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
      canvas.discardActiveObject()
    }
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


  _performAction (action, triggerModified = false) {
    if (this.__selection) {
      if (this.__selection._objects) {
        this.__selection._objects.forEach((object) => {
          object && action(object)
        })
      } else {
        action(this.__selection)
      }
      if (triggerModified) {
        this._triggerModified()
      }
    }
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
    this._performAction(this._deleteObject)
    this._canvas.discardActiveObject()
  }

  _deleteObject = (object) => {
    if (object) {
      object.set({ '_toDelete': true })
      this._canvas.remove(object)
    }
  }

  _move (direction) {
    if (this.__selection) {
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
            this.__selection.set({ left: this.__selection.get('left') - POSITION_INCREMENT * increment })
            break

          case directions.right:
            this.__selection.set({ left: this.__selection.get('left') + POSITION_INCREMENT * increment })
            break

          case directions.up:
            this.__selection.set({ top: this.__selection.get('top') - POSITION_INCREMENT * increment })
            break

          case directions.down:
            this.__selection.set({ top: this.__selection.get('top') + POSITION_INCREMENT * increment })
            break
        }
        this.__selection.setCoords()
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
      const updatedObject = fabric.util.object.clone(object)

      object.set({ '_lockedlocal': this._canvas._id })

      if (object.group) { // Если объект в группе, то надо пересчитать его координаты
        const matrix = object.group.calcTransformMatrix()
        const { x: left, y: top } = fabric.util.transformPoint({ x: object.left, y: object.top }, matrix)

        updatedObject.set({ top, left })
      }
      this._canvas.trigger('object:modified', { target: updatedObject })
    }
  }

  _unsetObject = (object) => {
    if (object.get('_lockedselection')) {
      object.set({ '_lockedselection': undefined })
      const updatedObject = fabric.util.object.clone(object)

      object.set({ '_lockedlocal': this._canvas._id })

      if (object.group) { // Если объект в группе, то надо пересчитать его координаты
        const matrix = object.group.calcTransformMatrix()
        const { x: left, y: top } = fabric.util.transformPoint({ x: object.left, y: object.top }, matrix)

        updatedObject.set({ top, left })
      }
      this._canvas.trigger('object:modified', { target: updatedObject })
    }
  }

  _setSelection (opt = {}) {
    if (!this.__lockedSelection) {
      if (opt.delayed) {
        this.__timer = setTimeout(() => {
          this.__lockedSelection = true
          this._performAction(this._setObject)
        }, DELAY)
      } else {
        this.__lockedSelection = true
        this._performAction(this._setObject)
      }
    }
  }

  _unsetSelection () {
    this._performAction(this._unsetObject)

    this.__lockedSelection = false
    this.__timer && clearTimeout(this.__timer)
    this.__timer = null
  }

  _triggerObjectModified = (object) => {
    if (!object.get('_toDelete')) {
      this._canvas.trigger('object:modified', { target: object })
    }
  }

  _triggerModified () {
    this._performAction(this._triggerObjectModified)
  }

  handleTextEditStartEvent (opts) {
    this._setSelection()
    if (opts.target && opts.target.hiddenTextarea) {
      opts.target.hiddenTextarea.style.width = '10px'
      opts.target.hiddenTextarea.style.height = '10px'
      opts.target.hiddenTextarea.style.fontSize = '10px'
    }
  }

  handleTextEditEndEvent (opts) {
    this._unsetSelection()
  }

  handleMouseDownEvent () {
    if (!this._active || !this.__selection) return

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

    if (!this._mouseMove) {
      const { keyCode } = e

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

  handleSelectionUpdatedEvent (opts) {
    if (!this._active) return
    this.__selection = opts.target
  }

  handleSelectionCreatedEvent (opts) {
    if (!this._active) return
    this.__selection = opts.target
  }

  handleSelectionClearedEvent (opts) {
    if (!this._active) return
    this.__selection = null
  }

  reset () {
    this.__lockedSelection && this._unsetSelection()
    this._canvas.discardActiveObject()

    this.__selection = null
    this._shiftPressed = false
    this._mouseMove = false

    this._canvas._currentTransform = null
  }
}
