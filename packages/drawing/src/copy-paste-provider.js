/* eslint-disable no-param-reassign,no-undef */
import { fabric } from 'fabric/dist/fabric.min'

import { COPY_PASTE_SHIFT, defaultToolSettings } from './constants'
import { serializeObject } from './util/serialize-object'
import { toCSSColor, HEXtoRGB } from './util/to-css-color'

function b64Encode (str) {
  return btoa(encodeURIComponent(str))
}

function b64Decode (str) {
  return decodeURIComponent(atob(str))
}

class CCopyPasteProvider {
  clipboardType = 'whiteboard/object'

  constructor () {
    this.__clipboard = null
    this.__canvas = null
    this.__copyPasteIncrement = 0
  }

  set canvas (canvas) {
    this.__canvas = canvas
  }

  get isEmpty () {
    return !this.__clipboard
  }

  clear = () => {
    this.__clipboard = null
  }

  copy = () => {
    if (this.__canvas && this.__canvas.getActiveObject()) {
      this.__canvas.getActiveObject().clone((cloned) => {
        this.__clipboard = cloned
      })
    } else {
      this.__clipboard = null
    }
  }

  paste = () => {
    if (this.__canvas && this.__clipboard) {
      this.__clipboard.clone(((clonedObj) => {
        this.__canvas.discardActiveObject()
        clonedObj.set({
          left: clonedObj.left + COPY_PASTE_SHIFT,
          top: clonedObj.top + COPY_PASTE_SHIFT,
          hasBorders: true,
          hasControls: true,
          _selected: true, // Чтобы сработало выделение на новом объекте
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

  copyToClipboard = (event) => {
    if (this.__canvas && this.__canvas.getActiveObject()) {
      this.__canvas.getActiveObject().clone(async (clonedObj) => {
        await this._copyObjectToClipboard(event, clonedObj)
        this.__copyPasteIncrement = 1
      })
    }
  }

  cutToClipboard = (event) => {
    if (this.__canvas && this.__canvas.getActiveObject()) {
      this.__canvas.getActiveObject().clone(async (clonedObj) => {
        if (await this._copyObjectToClipboard(event, clonedObj)) {
          this.__canvas.remove(this.__canvas.getActiveObject())
          this.__copyPasteIncrement = 0
        }
      })
    }
  }

  _copyObjectToClipboard = async (event, object) => {
    const serializedObj = serializeObject(object)

    try {
      if (object.type !== 'image') {
        const clipboardData = event.clipboardData || window.clipboardData || event.originalEvent.clipboardData

        clipboardData.setData('text/plain', 'Whiteboard object')
        clipboardData.setData(this.clipboardType, JSON.stringify(serializedObj))
      } else {
        const type = 'text/plain'

        const blob = new Blob([b64Encode(JSON.stringify(serializedObj))], { type })
        const data = [new ClipboardItem({ [type]: blob })]

        await navigator.clipboard.write(data)
      }

      event.preventDefault()

      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error copy to clipboard: ', error)

      return false
    }
  }

  _processClipboardData (event, clipboardDataSrc) {
    this.__canvas.discardActiveObject()
    if (clipboardDataSrc) {
      fabric.util.enlivenObjects([clipboardDataSrc], ([fObject]) => {
        if (fObject) {
          fObject.set({
            left: fObject.left + COPY_PASTE_SHIFT * this.__copyPasteIncrement,
            top: fObject.top + COPY_PASTE_SHIFT * this.__copyPasteIncrement,
            hasBorders: true,
            hasControls: true,
            _selected: true, // Чтобы сработало выделение на новом объекте
            evented: true,
            __local: true,
          })

          this.__canvas.add(fObject)
          this.__canvas.setActiveObject(fObject)
          this.__canvas.requestRenderAll()
        }
        this.__copyPasteIncrement += 1
        event.preventDefault()

        return false
      })
    }

    return true
  }

  pasteFromClipboard = (event) => {
    const clipboardData = event.clipboardData || event.originalEvent.clipboardData || window.clipboardData

    if (!(clipboardData && (clipboardData.types.includes(this.clipboardType) || clipboardData.types.includes('text/plain')))) {
      return true
    }

    if (clipboardData.types.includes(this.clipboardType)) {
      try {
        const clipboardDataSrc = JSON.parse(clipboardData.getData(this.clipboardType))

        return this._processClipboardData(event, clipboardDataSrc)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error)

        return true
      }
    } else if (clipboardData.types.includes('text/plain')) {
      try {
        const clipboardDataSrc = JSON.parse(b64Decode(clipboardData.getData('text/plain')))

        return this._processClipboardData(event, clipboardDataSrc)
      } catch {
        const text = new fabric.Textbox('', {
          backgroundColor: defaultToolSettings.transparentColor,
          borderScaleFactor: 1,
          fill: toCSSColor(HEXtoRGB(defaultToolSettings.color)),
          fontSize: defaultToolSettings.fontSize,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          padding: 7,
          perPixelTargetFind: false,
          scaleX: 0.5,
          scaleY: 0.5,
          strokeUniform: true,
          width: 600,
        })

        text.set('text', clipboardData.getData('text/plain'))

        if (text._unwrappedTextLines.length === 1 && text._textLines.length === 1) {
          const w = text.measureLine(0).width

          if ((text.get('width') - w) < 50) {
            text.set('width', w + 50)
          }
        }
        const { tl, br } = this.__canvas.calcViewportBoundaries()

        text.set({
          left: br.x - (br.x - tl.x) / 2 - (text.width * text.scaleX) / 2,
          top: br.y - (br.y - tl.y) / 2 - (text.height * text.scaleY) / 2,
          hasBorders: true,
          hasControls: true,
          __local: true,
          _selected: true, // Чтобы сработало выделение на новом объекте
        })

        this.__canvas.add(text)
        this.__canvas.setActiveObject(text)
        this.__canvas.requestRenderAll()

        event.preventDefault()

        return false
      }
    }

    return true
  }
}

export const CopyPasteProvider = new CCopyPasteProvider()
