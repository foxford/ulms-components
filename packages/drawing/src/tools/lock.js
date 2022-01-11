// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash/debounce'

import { keycodes, DEBOUNCE_DELAY } from '../constants'

import { Base } from './base'
import { makeInteractive, makeNotInteractive } from './object'
import SelectTool from './select'

export class LockTool extends Base {
  static lockObject (object, options = {}) {
    const opts = {
      ...options,
      borderColor: 'rgba(255,0,0,0.75)',
    }

    const props = {
      borderColor: opts.borderColor,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      editable: false,
    }

    object.set(props)

    return object
  }

  static unlockObject (object, options = {}) {
    const opts = {
      ...options,
      borderColor: 'rgba(102,153,255,0.75)',
    }

    const props = {
      borderColor: opts.borderColor,
      hasControls: true,
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockUniScaling: false,
      editable: true,
    }

    object.set(props)

    return object
  }

  static isLocked (object) {
    return object && object._lockedbyuser
  }

  constructor (ctx, onLock, onSelect) {
    super(ctx)

    this.__lockIds = []
    this.__mouseDown = false
    this.__selectionLocked = false
    this.__textEditing = false

    this.__onLockListener = onLock
    this.__onSelectListener = onSelect

    onSelect && this._canvas.on('selection:created', this._handleSelect)
    onSelect && this._canvas.on('selection:updated', this._handleSelect)
    onSelect && this._canvas.on('selection:cleared', this._handleDeselect)

    onLock && this._canvas.on('text:editing:exited', this._handleEditingExited)
    onLock && this._canvas.on('text:editing:entered', this._handleEditingEntered)

    onLock && this._canvas.on('mouse:down', this._handleMouseDownEvent)
    onLock && this._canvas.on('mouse:move', this._handleMouseMoveEvent)
    onLock && this._canvas.on('mouse:up', this._handleMouseUpEvent)

    this._debouncedUnlock = debounce(() => {
      this._unlock()
    }, DEBOUNCE_DELAY)
  }

  updateAllLock = (lockIds) => {
    this.__lockIds = lockIds
    this._canvas.forEachObject((_) => {
      if (this.__lockIds.includes(_._id)) {
        makeNotInteractive(_)
        SelectTool.removeFromSelection(this._canvas, _)
      } else {
        makeInteractive(_)
      }
    })
  }

  updateObjectLock (object) {
    if (this.__lockIds.includes(object._id)) {
      makeNotInteractive(object)
    } else {
      makeInteractive(object)
    }
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

    if (target.type === 'textbox' && target._textBeforeEdit !== '') {
      this.__textEditing = true
      this._lock()
    }
  }

  _lock = () => {
    if (this.activeSelection.length) {
      const lockedIds = []

      this.activeSelection.forEach((_) => {
        if (!_._lockedbyuser) {
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

  _handleSelect = () => {
    this.__onSelectListener(this.activeSelection)
  }

  _handleDeselect = () => {
    this.__onSelectListener(null)
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
    this.__onSelectListener && this._canvas.on('selection:created', this._handleSelect)
    this.__onSelectListener && this._canvas.on('selection:updated', this._handleSelect)
    this.__onSelectListener && this._canvas.on('selection:cleared', this._handleDeselect)

    this.__onLockListener && this._canvas.on('text:editing:exited', this._handleEditingExited)
    this.__onLockListener && this._canvas.on('text:editing:entered', this._handleEditingEntered)

    this.__onLockListener && this._canvas.on('mouse:down', this._handleMouseDownEvent)
    this.__onLockListener && this._canvas.on('mouse:move', this._handleMouseMoveEvent)
    this.__onLockListener && this._canvas.on('mouse:up', this._handleMouseUpEvent)

    this._canvas = undefined
  }
}
