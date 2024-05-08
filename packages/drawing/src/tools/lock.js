import debounce from 'lodash/debounce'

import { keycodes, DEBOUNCE_DELAY } from '../constants'
import { LockProvider } from '../lock-provider'

import { Base } from './base'
import { makeInteractive, makeNotInteractive } from './object'
import SelectTool from './select'

// eslint-disable-next-line import/prefer-default-export
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

  static updateObjectLock(object) {
    if (LockProvider.isLockedBySelection(object)) {
      makeNotInteractive(object)
    } else {
      makeInteractive(object)
    }
  }

  constructor(context, onLock) {
    super(context)

    this.__mouseDown = false
    this.__selectionLocked = false
    this.__textEditing = false

    this.__onLockListener = onLock

    if (this.__onLockListener) {
      this._canvas.on('text:editing:exited', this._handleEditingExited)
      this._canvas.on('text:editing:entered', this._handleEditingEntered)
      this._canvas.on('mouse:down', this._handleMouseDownEvent)
      this._canvas.on('mouse:move', this._handleMouseMoveEvent)
      this._canvas.on('mouse:up', this._handleMouseUpEvent)
    }

    this._debouncedUnlock = debounce(() => {
      this._unlock()
    }, DEBOUNCE_DELAY)
  }

  get activeSelection() {
    return this._canvas.getActiveObjects()
  }

  _handleEditingExited = (event) => {
    const { target } = event

    if (target.type === 'textbox' && target.text.length > 0) {
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
    if (this.activeSelection.length > 0) {
      const lockedIds = []

      for (const _ of this.activeSelection) {
        if (!LockProvider.isLockedByUser(_)) {
          lockedIds.push(_._id)
        }
      }
      if (lockedIds.length > 0) {
        this.__selectionLocked = true
        this.__onLockListener({ lockedIds })
      }
    }
  }

  _unlock = () => {
    this.__onLockListener({ lockedIds: null })
    this.__selectionLocked = false
  }

  handleKeyDownEvent = (event) => {
    if (
      !this._mouseMove &&
      !this.__selectionLocked &&
      !this.__textEditing &&
      (event.keyCode === keycodes.UP_KEYCODE ||
        event.keyCode === keycodes.DOWN_KEYCODE ||
        event.keyCode === keycodes.LEFT_KEYCODE ||
        event.keyCode === keycodes.RIGHT_KEYCODE)
    ) {
      this._lock()
    }
  }

  handleKeyUpEvent = (event) => {
    if (
      !this._mouseMove &&
      this.__selectionLocked &&
      !this.__textEditing &&
      (event.keyCode === keycodes.UP_KEYCODE ||
        event.keyCode === keycodes.DOWN_KEYCODE ||
        event.keyCode === keycodes.LEFT_KEYCODE ||
        event.keyCode === keycodes.RIGHT_KEYCODE)
    ) {
      this._debouncedUnlock()
    }
  }

  _handleMouseDownEvent = () => {
    if (this.activeSelection.length === 0) return

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

  destroy() {
    if (this.__onLockListener) {
      this._canvas.on('text:editing:exited', this._handleEditingExited)
      this._canvas.on('text:editing:entered', this._handleEditingEntered)
      this._canvas.on('mouse:down', this._handleMouseDownEvent)
      this._canvas.on('mouse:move', this._handleMouseMoveEvent)
      this._canvas.on('mouse:up', this._handleMouseUpEvent)
    }

    this._canvas = undefined
  }
}
