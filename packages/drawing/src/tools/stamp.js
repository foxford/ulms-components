import { fabric } from 'fabric/dist/fabric.min'

import { CursorProvider } from '../cursor-provider'
import { stampToolModeEnum } from '../constants'

import {
  PositionableObject,
  adjustPosition,
  makeNotInteractive,
} from './object'

const createStampFromUrl = (url, callback, event) => {
  fabric.Image.fromURL(
    url,
    (image) => {
      callback(image, event)
    },
    { crossOrigin: 'anonymous' },
  )
}

const cursorName = 'cursor_stamp.svg'

// eslint-disable-next-line import/prefer-default-export
export class StampTool extends PositionableObject {
  #image

  #mode

  #publicStorage

  constructor(canvas, mode, publicStorageProvider, options = {}) {
    super(canvas, () => {}, options)

    this.#mode = mode

    this.#image = null

    this.#publicStorage = publicStorageProvider

    this._cursorString = `url("${this.#publicStorage.getUrl(
      this.#publicStorage.types.STAMP,
      cursorName,
    )}") 5 19, crosshair`
  }

  configure(props) {
    super.configure(props)
    const { stampSrc } = props

    if (stampSrc) {
      createStampFromUrl(
        this.#publicStorage.getUrl(this.#publicStorage.types.STAMP, stampSrc),
        this._onLoad,
      )
    } else {
      CursorProvider.setCursor()
      this.#image = null
    }

    this._canvas.defaultCursor = this._cursorString
    this._canvas.setCursor(this._cursorString)
  }

  _onLoad = (image) => {
    if (image) {
      CursorProvider.setCursor(image, '-1 0')

      this.#image = image
    } else {
      CursorProvider.setCursor()

      this.#image = null
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent() {}

  handleMouseUpEvent() {
    this._canvas.defaultCursor = this._cursorString
    this._canvas.setCursor(this._cursorString)
  }

  handleMouseDownEvent(event) {
    if (this.#image) {
      this.#image.clone((clonedObject) => {
        const [x, y] = adjustPosition(
          clonedObject,
          event.absolutePointer,
          '-1 0',
          this._canvas.getZoom(),
        )

        clonedObject.set({ left: x, top: y }).setCoords()

        CursorProvider.hide() // Временно убираем курсор с доски, чтобы не сбивать логику выставления order

        this._canvas.add(clonedObject)

        CursorProvider.show() // Теперь можно снова показать курсор

        if (this.#mode === stampToolModeEnum.STAMP) {
          makeNotInteractive(clonedObject)
        }
        if (this.#mode === stampToolModeEnum.STICKER) {
          clonedObject.set({
            _selected: true,
            hasBorders: true,
            hasControls: true,
          })
          this._canvas.setActiveObject(clonedObject)
        }
        this._canvas.requestRenderAll()
      })
    }
  }

  // eslint-disable-next-line class-methods-use-this
  destroy() {
    CursorProvider.setCursor()
    this.#image = null
  }
}
