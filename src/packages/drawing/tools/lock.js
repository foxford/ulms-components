/* eslint-disable */

import { StateTool } from './state-tool'
import { Debug } from '../../../util/index'
import { enhancedFields } from '../drawing'

const debug = Debug(`@netology-group/media-ui:drawing:lock-tool`)

export class LockTool extends StateTool {
  static lockObject(object, options = {}) {
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
    }

    Object.keys(props).forEach((key) => { object.set(key, props[key]) })

    return object
  }

  static unlockObject(object, options = {}) {
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
    }
    Object.keys(props).forEach((key) => { object.set(key, props[key]) })

    return object
  }

  static isLocked (object){
    return object && object._lockedbyuser
  }

  constructor(ctx, onSelect, onDeselect){
    super(ctx)

    this.__onSelectListener = onSelect
    this.__onDeselectListener = onDeselect

    this._canvas.on('selection:created', this.__handleSelect)
    this._canvas.on('selection:updated', this.__handleSelect)
    this._canvas.on('before:selection:cleared', this.__handleDeselect)
  }

  __handleSelect = (event) => {
    const { selected } = event

    const maybeProperSelectionForLock = Array.isArray(selected)
      && selected.length === 1

    const denyNewTextObject = selected[0].type === 'textbox'
     && selected[0].text.length !== 0
    // FIXME: we have to forbid knowing about other type of objects for the LockTool later :(

    if(
      (maybeProperSelectionForLock && selected[0].type !== 'textbox')
      || (maybeProperSelectionForLock && denyNewTextObject)
      ){
      this.__onSelectListener({
        target: !selected.length
          ? undefined
          : selected[0].toObject(enhancedFields)
      })
    } else {
      debug('Lock is unavailable (too much or wrong objects selected)')
    }

  }

  __handleDeselect = (event) => {
    const { target } = event

    this.__onDeselectListener({
      target: undefined
    })
  }

  destroy(){
    this._canvas.off('selection:created', this.__handleSelect)
    this._canvas.off('selection:updated', this.__handleSelect)
    this._canvas.off('before:selection:cleared', this.__handleDeselect)
    this.__listener = undefined
    this._canvas = undefined
  }
}
