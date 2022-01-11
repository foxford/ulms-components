/* eslint-disable no-param-reassign,default-case,no-fallthrough,import/no-extraneous-dependencies */
import debounce from 'lodash/debounce'

import { fromCSSColor, toCSSColor } from '../util/to-css-color'

import { keycodes, DEBOUNCE_DELAY } from '../constants'

import { Base } from './base'

const POSITION_INCREMENT = 10

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

    this._initialConfigure()
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
    this._canvas.defaultCursor = 'default'
    this._canvas.setCursor('default')
    this._debouncedTriggerModified = debounce(this._triggerModified, DEBOUNCE_DELAY)
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

  handleTextEditStartEvent (opts) {
    if (opts.target && opts.target.hiddenTextarea) {
      opts.target.hiddenTextarea.style.width = '10px'
      opts.target.hiddenTextarea.style.height = '10px'
      opts.target.hiddenTextarea.style.fontSize = '10px'
    }
  }

  handleTextEditEndEvent () {
    this._triggerModified()
  }

  handleMouseDownEvent () {
    this.__mouseDown = true
  }

  handleMouseUpEvent () {
    this.__mouseDown = false
  }

  handleKeyDownEvent (e) {
    if (!this._active) return
    if (this.__object && this.__object.isEditing) return

    if (!this.__mouseDown && (this.__object && !this.__object._lockedbyuser)) {
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

  handleSelectionUpdatedEvent (opts) {
    if (!this._active) return
    this.__object = opts.target
  }

  handleSelectionCreatedEvent (opts) {
    if (!this._active) return
    this.__object = opts.target
  }

  handleSelectionClearedEvent () {
    if (!this._active) return
    this.__object = null
  }

  reset () {
    this.__shiftPressed = false
    this.__mouseDown = false

    this._canvas._currentTransform = null

    this._canvas.discardActiveObject()
  }
}
