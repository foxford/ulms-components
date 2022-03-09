/* eslint-disable no-param-reassign */
import { COPY_PASTE_SHIFT } from './constants'

class CCopyPasteProvider {
  constructor () {
    this.__clipboard = null
    this.__canvas = null
  }

  set canvas (canvas) {
    this.__canvas = canvas
  }

  copy = () => {
    if (this.__canvas && this.__canvas.getActiveObject()) {
      this.__canvas.getActiveObject().clone((cloned) => {
        this.__clipboard = cloned
      })
    }
  }

  paste = () => {
    if (this.__canvas && this.__clipboard) {
      this.__clipboard.clone(((clonedObj) => {
        this.__canvas.discardActiveObject()
        clonedObj.set({
          left: clonedObj.left + COPY_PASTE_SHIFT,
          top: clonedObj.top + COPY_PASTE_SHIFT,
          evented: true,
          __local: true,
        })
        if (clonedObj.type === 'activeSelection') {
          // active selection needs a reference to the canvas.
          clonedObj.canvas = this.__canvas
          clonedObj.forEachObject((obj) => {
            this.__canvas.add(obj)
          })
          // this should solve the unselectability
          clonedObj.setCoords()
        } else {
          this.__canvas.add(clonedObj)
        }
        this.__clipboard.top += COPY_PASTE_SHIFT
        this.__clipboard.left += COPY_PASTE_SHIFT
        this.__canvas.setActiveObject(clonedObj)
        this.__canvas.requestRenderAll()
      }))
    }
  }
}

export const CopyPasteProvider = new CCopyPasteProvider()
