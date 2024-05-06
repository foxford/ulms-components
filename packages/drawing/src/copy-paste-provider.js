/* eslint-disable no-param-reassign,no-undef */
import { fabric } from 'fabric/dist/fabric.min'

import {
  COPY_PASTE_SHIFT,
  defaultToolSettings,
  MAX_TEXT_LENGTH,
} from './constants'
import { serializeObject } from './util/serialize-object'
import { toCSSColor, HEXtoRGB } from './util/to-css-color'

const TEXT_PLAIN_MIME_TYPE = 'text/plain'

function b64Encode(string_) {
  return btoa(encodeURIComponent(string_))
}

function b64Decode(string_) {
  return decodeURIComponent(atob(string_))
}

class CCopyPasteProvider {
  clipboardType = 'whiteboard/object'

  constructor() {
    this.__clipboard = null
    this.__canvas = null
    this.__copyPasteIncrement = 0
  }

  set canvas(canvas) {
    this.__canvas = canvas
  }

  get isEmpty() {
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
      this.__clipboard.clone((clonedObject) => {
        this.__canvas.discardActiveObject()
        clonedObject.set({
          left: clonedObject.left + COPY_PASTE_SHIFT,
          top: clonedObject.top + COPY_PASTE_SHIFT,
          hasBorders: true,
          hasControls: true,
          _selected: true, // Чтобы сработало выделение на новом объекте
          evented: true,
        })
        if (clonedObject.type === 'activeSelection') {
          // active selection needs a reference to the canvas.
          clonedObject.canvas = this.__canvas
          clonedObject.forEachObject((object) => {
            this.__canvas.add(object)
          })
          // this should solve the unselectability
          clonedObject.setCoords()
        } else {
          this.__canvas.add(clonedObject)
        }
        this.__clipboard.top += COPY_PASTE_SHIFT
        this.__clipboard.left += COPY_PASTE_SHIFT
        this.__canvas.setActiveObject(clonedObject)
        this.__canvas.requestRenderAll()
      })
    }
  }

  copyToClipboard = (event) => {
    if (this.__canvas && this.__canvas.getActiveObject()) {
      this.__canvas.getActiveObject().clone(async (clonedObject) => {
        await this._copyObjectToClipboard(event, clonedObject)
        this.__copyPasteIncrement = 1
      })
    }
  }

  cutToClipboard = (event) => {
    if (this.__canvas && this.__canvas.getActiveObject()) {
      this.__canvas.getActiveObject().clone(async (clonedObject) => {
        if (await this._copyObjectToClipboard(event, clonedObject)) {
          this.__canvas.remove(this.__canvas.getActiveObject())
          this.__copyPasteIncrement = 0
        }
      })
    }
  }

  _copyObjectToClipboard = async (event, object) => {
    const serializedObject = serializeObject(object)

    try {
      if (object.type === 'image') {
        const blob = new Blob([b64Encode(JSON.stringify(serializedObject))], {
          type: TEXT_PLAIN_MIME_TYPE,
        })
        const data = [new ClipboardItem({ [TEXT_PLAIN_MIME_TYPE]: blob })]

        await navigator.clipboard.write(data)
      } else {
        const clipboardData =
          event.clipboardData ||
          window.clipboardData ||
          event.originalEvent.clipboardData

        clipboardData.setData(TEXT_PLAIN_MIME_TYPE, 'Whiteboard object')
        clipboardData.setData(
          this.clipboardType,
          JSON.stringify(serializedObject),
        )
      }

      event.preventDefault()

      return true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error copy to clipboard:', error)

      return false
    }
  }

  _processClipboardData(event, clipboardDataSource) {
    this.__canvas.discardActiveObject()
    if (clipboardDataSource) {
      fabric.util.enlivenObjects([clipboardDataSource], ([fObject]) => {
        if (fObject) {
          fObject.set({
            left: fObject.left + COPY_PASTE_SHIFT * this.__copyPasteIncrement,
            top: fObject.top + COPY_PASTE_SHIFT * this.__copyPasteIncrement,
            hasBorders: true,
            hasControls: true,
            _selected: true, // Чтобы сработало выделение на новом объекте
            evented: true,
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
    const clipboardData =
      event.clipboardData ||
      event.originalEvent.clipboardData ||
      window.clipboardData

    if (
      !(
        clipboardData &&
        (clipboardData.types.includes(this.clipboardType) ||
          clipboardData.types.includes(TEXT_PLAIN_MIME_TYPE))
      )
    ) {
      return true
    }

    if (clipboardData.types.includes(this.clipboardType)) {
      try {
        const clipboardDataSource = JSON.parse(
          clipboardData.getData(this.clipboardType),
        )

        return this._processClipboardData(event, clipboardDataSource)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error)

        return true
      }
    } else if (clipboardData.types.includes(TEXT_PLAIN_MIME_TYPE)) {
      try {
        const clipboardDataSource = JSON.parse(
          b64Decode(clipboardData.getData(TEXT_PLAIN_MIME_TYPE)),
        )

        return this._processClipboardData(event, clipboardDataSource)
      } catch {
        const text = new fabric.Textbox('', {
          backgroundColor: defaultToolSettings.transparentColor,
          borderScaleFactor: 1,
          fill: toCSSColor(HEXtoRGB(defaultToolSettings.color)),
          fontSize: defaultToolSettings.fontSize,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          padding: 7,
          perPixelTargetFind: false,
          scaleX: 0.5,
          scaleY: 0.5,
          strokeUniform: true,
          width: 600,
        })

        const clipboardText = clipboardData.getData(TEXT_PLAIN_MIME_TYPE)

        text.set('text', clipboardText.slice(0, Math.max(0, MAX_TEXT_LENGTH)))

        if (
          text._unwrappedTextLines.length === 1 &&
          text._textLines.length === 1
        ) {
          const w = text.measureLine(0).width

          if (text.get('width') - w < 50) {
            text.set('width', w + 50)
          }
        }
        const { tl, br } = this.__canvas.calcViewportBoundaries()

        text.set({
          left: br.x - (br.x - tl.x) / 2 - (text.width * text.scaleX) / 2,
          top: br.y - (br.y - tl.y) / 2 - (text.height * text.scaleY) / 2,
          hasBorders: true,
          hasControls: true,
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

// eslint-disable-next-line import/prefer-default-export
export const CopyPasteProvider = new CCopyPasteProvider()
