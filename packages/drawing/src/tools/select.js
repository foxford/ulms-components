/* eslint-disable */

import { Base } from './base'
import { makeInteractive, makeNotInteractive } from './object'
import debounce from 'lodash/debounce'

const POSITION_INCREMENT = 10

const DEBOUNCE_DELAY = 500

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
  down: 'down'
}

export default class SelectTool extends Base {
  constructor (canvas, options = {}) {
    super(canvas)

    this.__object = null

    this.__options = options

    this._shiftPressed = false
    this._mouseMove = false

    this._canvas.forEachObject((_) => {
      if(_._lockedselection && (_._lockedselection !== this._canvas._id)) {
        makeNotInteractive(_)
      } else {
        makeInteractive(_)
      }
    })
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
          if(!isOwner(selection)) {
            _.set({'_lockedselection': undefined})
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


  configure () {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.perPixelTargetFind = true
    this._canvas.defaultCursor = 'default'
    this._canvas.setCursor('default')
    this.__object = null
    this._shiftPressed = false
  }

  destroy () {
    this._unsetObject()
    this._canvas.discardActiveObject()
  }

  _deleteObject = () => {
    if (this.__object) {
      this.__object.set({'_toDelete': true})
      this._canvas.remove(this.__object)
    }
  }

  _move = (direction) => {
    if (this.__object) {
      if (this.__options.isPresentation) {
        switch (direction) {
          case directions.left:
          case directions.right:
            this.destroy()  // Moving to another page
        }
      } else {
        const increment = this._shiftPressed ? 10 : 1
        switch (direction) {
          case directions.left:
            this.__object.set({left: this.__object.get('left') - POSITION_INCREMENT * increment})
            break
          case directions.right:
            this.__object.set({left: this.__object.get('left') + POSITION_INCREMENT * increment})
            break
          case directions.up:
            this.__object.set({top: this.__object.get('top') - POSITION_INCREMENT * increment})
            break
          case directions.down:
            this.__object.set({top: this.__object.get('top') + POSITION_INCREMENT * increment})
            break
        }
        this.__object.setCoords()
        this.__debouncedUpdateObject()
      }
    }
  }

  _moveLeft = () => this._move(directions.left)
  _moveRight = () => this._move(directions.right)
  _moveUp = () => this._move(directions.up)
  _moveDown = () => this._move(directions.down)

  _setObject (object) {
    if (object) {
      object.set({'_lockedselection': this._canvas._id})
      this._canvas.trigger('object:modified', {target: object})
      this.__object = object

      this.__debouncedUpdateObject = debounce(() => {
        this._canvas.trigger('object:modified', {target: this.__object})
      }, DEBOUNCE_DELAY)
    }
  }

  _unsetObject () {
    if (this.__object) {
      this.__object.set({'_lockedselection': undefined})

      if (!this.__object.get('_toDelete')) {
        this._canvas.trigger('object:modified', { target: this.__object })
      }

      this.__object = null
    }
  }

  handleTextEditEndEvent (opts) {
    this._unsetObject()
  }

  handleMouseDownEvent (opts) {
    if (!this._active) return

    this._mouseMove = true
  }

  handleMouseUpEvent (opts) {
    this._mouseMove = false
  }

  handleKeyDownEvent (e) {
    if (!this._active) return
    if (this.__object && this.__object.isEditing) return

    if (!this._mouseMove && (this.__object && !this.__object._lockedbyuser)) {
      const {keyCode} = e

      this._shiftPressed = e.shiftKey

      switch (keyCode) {
        case DEL_KEYCODE:
        case BACKSPACE_KEYCODE:
          this._deleteObject()

          break
        case UP_KEYCODE:
          this._moveUp()
          this._canvas.renderAll()

          break
        case DOWN_KEYCODE:
          this._moveDown()
          this._canvas.renderAll()

          break
        case LEFT_KEYCODE:
          this._moveLeft()
          this._canvas.renderAll()

          break
        case RIGHT_KEYCODE:
          this._moveRight()
          this._canvas.renderAll()

          break
      }
    }
  }

  handleKeyUpEvent (e) {
    if (!this._active) return

    this._shiftPressed = e.shiftKey
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

    this._unsetObject()
    this._setObject(opts.target)
  }

  handleSelectionCreatedEvent (opts) {
    if (!this._active) return

    this._setObject(opts.target)
  }

  handleSelectionClearedEvent (opts) {
    if (!this._active) return

    this._unsetObject()
  }

  reset () {
    this._shiftPressed = false
    this._mouseMove = false

    this._canvas._currentTransform = null

    this._unsetObject()
    this._canvas.discardActiveObject()
  }
}
