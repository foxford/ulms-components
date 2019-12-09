/* eslint-disable */

import { Base } from './base'
import debounce from 'lodash/debounce'

const POSITION_INCREMENT = 10

const DEL_KEYCODE = 46;
const BACKSPACE_KEYCODE = 8;

const UP_KEYCODE = 38;
const DOWN_KEYCODE = 40;
const LEFT_KEYCODE = 37;
const RIGHT_KEYCODE = 39;

const directions = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down'
}


export default class SelectTool extends Base {
  constructor (canvas) {
    super(canvas)

    this.__object = null

    this._shiftPressed = false

    this._canvas.forEachObject((_) => {
      Object.assign(_, {
        evented: true,
        hoverCursor: 'move',
        selectable: true,
      })
    })
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

  _deleteObject = (object) => {
    if(this.__object) {
      this._canvas.remove(object)
    }
  }

  _move = (direction) => {
    if(this.__object) {
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
      this.__debouncedUpdateObject();
    }
  }

  _moveLeft = () => this._move(directions.left)
  _moveRight = () => this._move(directions.right)
  _moveUp = () => this._move(directions.up)
  _moveDown = () => this._move(directions.down)

  _setObject (object) {
    this.__object = object
    this.__debouncedUpdateObject = debounce(() => {
      this._canvas.trigger('object:modified', {target: this.__object})
    }, 300)
  }

  handleKeyDownEvent (e) {
    let actionFunc
    const {keyCode} = e

    this._shiftPressed = e.shiftKey

    switch(keyCode) {
      case DEL_KEYCODE:
      case BACKSPACE_KEYCODE:
        actionFunc = this._deleteObject
        break
      case UP_KEYCODE:
        actionFunc = this._moveUp
        break
      case DOWN_KEYCODE:
        actionFunc = this._moveDown
        break
      case LEFT_KEYCODE:
        actionFunc = this._moveLeft
        break
      case RIGHT_KEYCODE:
        actionFunc = this._moveRight
        break
    }

    if (actionFunc) {
      actionFunc()
      this._canvas.renderAll()
    }
  }

  handleKeyUpEvent (e) {
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
    this._setObject(opts.target)
  }

  handleSelectionCreatedEvent (opts) {
    this._setObject(opts.target)
  }

  handleSelectionClearedEvent (opts) {
    this.__object = null
  }
}
