/* eslint-disable */

import { Base } from './base'
import { enhancedFields } from '../constants'

export class LockTool extends Base {
  static lockObject (object, options = {}) {
    const opts = {
      ...options,
      borderColor: 'rgba(255,0,0,0.75)'
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

    Object.keys(props).forEach((key) => { object.set(key, props[key]) })

    return object
  }

  static unlockObject (object, options = {}) {
    const opts = {
      ...options,
      borderColor: 'rgba(102,153,255,0.75)'
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
    Object.keys(props).forEach((key) => { object.set(key, props[key]) })

    return object
  }

  static isLocked (object) {
    return object && object._lockedbyuser
  }

  constructor (ctx, onSelect, onDeselect) {
    super(ctx)

    this.__onSelectListener = onSelect
    this.__onDeselectListener = onDeselect

    onSelect && this._canvas.on('selection:created', this.__handleSelect)
    onSelect && this._canvas.on('selection:updated', this.__handleSelect)
    onDeselect && this._canvas.on('selection:cleared', this.__handleDeselect)

    onSelect && this._canvas.on('text:editing:exited', this.__handleEditingExited)
    onDeselect && this._canvas.on('text:editing:entered', this.__handleEditingEntered)
  }

  __handleEditingEntered = (event) => {
    const { target } = event

    if (target.type === 'textbox' && target.text.length !== 0) {
      this.__onDeselectListener({
        target: undefined
      })
    }
  }

  __handleEditingExited = (event) => {
    const { target } = event

    if (target.type === 'textbox' && target._textBeforeEdit !== '') {
      this.__onSelectListener({
        target: target.toObject(enhancedFields)
      })
    }
  }

  __handleSelect = (event) => {
    const { selected } = event

    const maybeProperSelectionForLock = Array.isArray(selected) && selected.length === 1
    const denyNewTextObject = selected[0] && selected[0].type === 'textbox' && selected[0].text.length !== 0
    // FIXME: we have to forbid knowing about other type of objects for the LockTool later :(

    if (
      (maybeProperSelectionForLock && selected[0].type !== 'textbox')
      || (maybeProperSelectionForLock && denyNewTextObject)
    ) {
      this.__onSelectListener({
        target: !selected.length
          ? undefined
          : selected[0].toObject(enhancedFields)
      })
    }
  }

  __handleDeselect = () => {
    this.__onDeselectListener({
      target: undefined
    })
  }

  destroy () {
    this.__onSelectListener && this._canvas.off('selection:created', this.__handleSelect)
    this.__onSelectListener && this._canvas.off('selection:updated', this.__handleSelect)
    this.__onDeselectListener && this._canvas.off('selection:cleared', this.__handleDeselect)

    this.__onSelectListener && this._canvas.off('text:editing:exited', this.__handleEditingExited)
    this.__onDeselectListener && this._canvas.off('text:editing:entered', this.__handleEditingEntered)

    this._canvas = undefined
  }
}
