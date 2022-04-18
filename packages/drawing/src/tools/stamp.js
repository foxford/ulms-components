import { fabric } from 'fabric/dist/fabric.min'

import { CursorProvider } from '../cursor-provider'
import { stampToolModeEnum } from '../constants'

import { PositionableObject, adjustPosition, makeNotInteractive } from './object'

const stampsArray = [
  {
    mode: stampToolModeEnum.LIKE,
    offsetX: 6,
    offsetY: -6,
  },
  {
    mode: stampToolModeEnum.SMART,
    offsetX: 8,
  },
  {
    mode: stampToolModeEnum.STAR,
    offsetX: 8,
    offsetY: -8,
  },
  {
    mode: stampToolModeEnum.WELLDONE,
    offsetY: -20,
  },
]

const stampsMap = {}

stampsArray.forEach((stamp) => {
  stampsMap[stamp.mode] = stamp
})

const createStampFromUrl = (url, callback, event) => {
  fabric.Image.fromURL(url, (image) => {
    callback(image, event)
  }, { crossOrigin: 'anonymous' })
}

const cursorName = 'cursor_stamp.svg'

export class StampTool extends PositionableObject {
  constructor (canvas, mode, publicStorageProvider, options = {}) {
    super(canvas, () => {}, options)

    this.__mode = mode

    this._publicStorage = publicStorageProvider
  }

  configure (props) {
    super.configure(props)

    if (this._stampPreviewUrl) {
      createStampFromUrl(this._stampPreviewUrl, this._onPreviewLoad)
    } else {
      CursorProvider.setCursor()
    }

    this._canvas.defaultCursor = this._cursorString
    this._canvas.setCursor(this._cursorString)
  }

  get _cursorString () {
    return `url("${this._publicStorage.getUrl(this._publicStorage.types.STAMP, cursorName)}") 5 19, crosshair`
  }

  get _stampUrl () {
    if (!this.__mode) return ''

    return this._publicStorage.getUrl(this._publicStorage.types.STAMP, this.__mode, 'svg')
  }

  get _stampPreviewUrl () {
    if (!this.__mode) return ''

    return this._publicStorage.getUrl(this._publicStorage.types.STAMP, `${this.__mode}_preview`, 'svg')
  }

  _onPreviewLoad = (image) => {
    if (image) {
      CursorProvider.setCursor(image, '-1 0')
    } else {
      CursorProvider.setCursor()
    }
  }

  _onImageLoad = (image, event) => {
    if (image) {
      this.__object = image
      const [x, y] = adjustPosition(this.__object, event.absolutePointer, '-1 0')

      if (stampsMap[this.__mode]) {
        this.__object.set({
          left: x + (stampsMap[this.__mode].offsetX || 0),
          top: y + (stampsMap[this.__mode].offsetY || 0),
        })
      } else {
        this.__object.set({ left: x, top: y })
      }

      this._canvas.add(this.__object)

      makeNotInteractive(this.__object)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent () { }

  handleMouseUpEvent () {
    this._canvas.defaultCursor = this._cursorString
    this._canvas.setCursor(this._cursorString)
  }

  handleMouseDownEvent (event) {
    if (this._stampUrl) {
      createStampFromUrl(this._stampUrl, this._onImageLoad, event)
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Unknown stamp type: "${this.__mode}"!..`)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  destroy () {
    CursorProvider.setCursor()
  }
}
