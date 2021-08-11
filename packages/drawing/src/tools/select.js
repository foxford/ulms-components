/* eslint-disable */

import { Base } from './base'
import { makeInteractive, makeNotInteractive } from './object'
import debounce from 'lodash/debounce'

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
  down: 'down'
}

export default class SelectTool extends Base {
  constructor (canvas, options = {}) {
    super(canvas)

    this.__object = null
    this.__options = options

    this._timer = null
    this._shiftPressed = false
    this._mouseMove = false

    this._canvas.forEachObject((_) => {
      if(_._lockedselection && (_._lockedselection !== this._canvas._id)) {
        makeNotInteractive(_)
      } else {
        makeInteractive(_)
      }
    })

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


  _initialConfigure () {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.perPixelTargetFind = true
    this._canvas.defaultCursor = 'default'
    this._canvas.setCursor('default')
  }

  configure(opt) {
    if(this.__object) {
      const newOpt = { stroke: opt.lineColor }

      if(object.type === 'path') {
        const {a} = fromCSSColor(object.stroke)
        const {r, g, b} = fromCSSColor(opt.lineColor)
        newOpt.stroke = toCSSColor({r, g, b, a})
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
        if(!this.__object._lockedselection) {
          this._setObject({delayed: true})
        }
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
          this._canvas.renderAll()
      }
    }
  }

  _moveLeft = () => this._move(directions.left)
  _moveRight = () => this._move(directions.right)
  _moveUp = () => this._move(directions.up)
  _moveDown = () => this._move(directions.down)

  _setObject (opt = {}) {
    if (this.__object) {
      this.__object.set({'_lockedselection': this._canvas._id})
      if(opt.delayed) {
        // пропускаем единичное нажатие клавиши
        this.__timer = setTimeout(() => {
          this._triggerModified()
        }, DELAY)
      }
      this._triggerModified()
    }
  }

  _unsetObject () {
    if (this.__object) {
      this.__object.set({'_lockedselection': undefined})

      this.__timer && clearTimeout(this.__timer)
      this.__timer = null

      if (!this.__object.get('_toDelete')) {
        this._triggerModified()
      }
    }
  }

  _triggerModified() {
    if(this.__object) {
      this._canvas.trigger('object:modified', {target: this.__object})
    }
  }

  handleTextEditStartEvent (opts) {
    this._setObject()
    if (opts.target && opts.target.hiddenTextarea) {
      opts.target.hiddenTextarea.style.width = '10px'
      opts.target.hiddenTextarea.style.height = '10px'
      opts.target.hiddenTextarea.style.fontSize = '10px'
    }
  }

  handleTextEditEndEvent (opts) {
    this._unsetObject()
  }

  handleMouseDownEvent () {
    if (!this._active || !this.__object) return

    this._mouseMove = true
  }

  handleMouseUpEvent () {
    if(this._mouseMove && this.__object._lockedselection) {
      this._unsetObject()
    }
    this._mouseMove = false
  }

  handleMouseMoveEvent () {
    if(this._mouseMove && !this.__object._lockedselection) {
      this._setObject()
    }
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

    if(!this._mouseMove && this.__object._lockedselection) {
      this._unsetObject()
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
    this.__object = opts.target
  }

  handleSelectionCreatedEvent (opts) {
    if (!this._active) return
    this.__object = opts.target
  }

  handleSelectionClearedEvent (opts) {
    if (!this._active) return
    this.__object = null
  }

  reset () {
    this._shiftPressed = false
    this._mouseMove = false

    this._canvas._currentTransform = null

    this._unsetObject()
    this._canvas.discardActiveObject()
  }
}
