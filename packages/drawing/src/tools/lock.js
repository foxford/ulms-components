// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash/debounce'

import { keycodes, DEBOUNCE_DELAY } from '../constants'
import { LockProvider } from '../lock-provider'

import { Base } from './base'
import { makeInteractive, makeNotInteractive } from './object'
import SelectTool from './select'

export class LockTool extends Base {
  static updateAllLock = (canvas) => {
    canvas.forEachObject((object) => {
      if (LockProvider.isLockedBySelection(object)) {
        makeNotInteractive(object)
        SelectTool.removeFromSelection(canvas, object)
      } else {
        makeInteractive(object)
      }
    })
  }

  static updateObjectLock (object) {
    if (LockProvider.isLockedBySelection(object)) {
      makeNotInteractive(object)
    } else {
      makeInteractive(object)
    }
  }

  constructor (ctx, onLock) {
    super(ctx)

    this.__mouseDown = false
    this.__selectionLocked = false
    this.__textEditing = false

    this.__onLockListener = onLock

    onLock && this._canvas.on('text:editing:exited', this._handleEditingExited)
    onLock && this._canvas.on('text:editing:entered', this._handleEditingEntered)

    onLock && this._canvas.on('mouse:down', this._handleMouseDownEvent)
    onLock && this._canvas.on('mouse:move', this._handleMouseMoveEvent)
    onLock && this._canvas.on('mouse:up', this._handleMouseUpEvent)

    this._debouncedUnlock = debounce(() => {
      this._unlock()
    }, DEBOUNCE_DELAY)
  }

  get activeSelection () {
    return this._canvas.getActiveObjects()
  }

  _handleEditingExited = (event) => {
    const { target } = event

    if (target.type === 'textbox' && target.text.length !== 0) {
      this._unlock()
      this.__textEditing = false
    }
  }

  _handleEditingEntered = (event) => {
    const { target } = event

    if (target.type === 'textbox') {
      this.__textEditing = true
      this._lock()
    }
  }

  _lock = () => {
    if (this.activeSelection.length) {
      const lockedIds = []

      this.activeSelection.forEach((_) => {
        if (!LockProvider.isLockedByUser(_)) {
          lockedIds.push(_._id)
        }
      })
      if (lockedIds.length) {
        this.__selectionLocked = true
        this.__onLockListener({ lockedIds })
      }
    }
  }

  _unlock = () => {
    this.__onLockListener({ lockedIds: null })
    this.__selectionLocked = false
  }

  handleKeyDownEvent = (e) => {
    if (!this._mouseMove && !this.__selectionLocked && !this.__textEditing) {
      if ((e.keyCode === keycodes.UP_KEYCODE)
        || (e.keyCode === keycodes.DOWN_KEYCODE)
        || (e.keyCode === keycodes.LEFT_KEYCODE)
        || (e.keyCode === keycodes.RIGHT_KEYCODE)) {
        this._lock()
      }
    }
  }

  handleKeyUpEvent = (e) => {
    if (!this._mouseMove && this.__selectionLocked && !this.__textEditing) {
      if ((e.keyCode === keycodes.UP_KEYCODE)
        || (e.keyCode === keycodes.DOWN_KEYCODE)
        || (e.keyCode === keycodes.LEFT_KEYCODE)
        || (e.keyCode === keycodes.RIGHT_KEYCODE)) {
        this._debouncedUnlock()
      }
    }
  }

  _handleMouseDownEvent = () => {
    if (!this.activeSelection.length) return

    this.__mouseDown = true
  }

  _handleMouseUpEvent = () => {
    if (this.__mouseDown && this.__selectionLocked && !this.__textEditing) {
      this._unlock()
    }
    this.__mouseDown = false
  }

  _handleMouseMoveEvent = () => {
    if (this.__mouseDown && !this.__selectionLocked && !this.__textEditing) {
      this._lock()
    }
  }

  destroy () {
    this.__onLockListener && this._canvas.on('text:editing:exited', this._handleEditingExited)
    this.__onLockListener && this._canvas.on('text:editing:entered', this._handleEditingEntered)

    this.__onLockListener && this._canvas.on('mouse:down', this._handleMouseDownEvent)
    this.__onLockListener && this._canvas.on('mouse:move', this._handleMouseMoveEvent)
    this.__onLockListener && this._canvas.on('mouse:up', this._handleMouseUpEvent)

    this._canvas = undefined
  }
}
