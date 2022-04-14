import { fabric } from 'fabric/dist/fabric.min'

import { stampToolModeEnum } from '../constants'

import { PositionableObject, adjustPosition, makeNotInteractive } from './object'

const stampsArray = {
  [stampToolModeEnum.DISLIKE]: {
    name: 'dislike',
  },
  [stampToolModeEnum.HEART]: {
    name: 'heart',
  },
  [stampToolModeEnum.LIKE]: {
    name: 'like',
    offsetX: 6,
    offsetY: -6,
  },
  [stampToolModeEnum.LOVE]: {
    name: 'love',
  },
  [stampToolModeEnum.PLEASED]: {
    name: 'pleased',
  },
  [stampToolModeEnum.QUESTION]: {
    name: 'question',
  },
  [stampToolModeEnum.SAD]: {
    name: 'sad',
  },
  [stampToolModeEnum.SMART]: {
    name: 'smart',
    offsetX: 8,
  },
  [stampToolModeEnum.STAR]: {
    name: 'star',
    offsetX: 8,
    offsetY: -8,
  },
  [stampToolModeEnum.TRYMORE]: {
    name: 'trymore',
  },
  [stampToolModeEnum.WELLDONE]: {
    name: 'welldone',
    offsetY: -20,
  },
}

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
    this.__previewStamp = null
    this.__previewOnBoard = false

    this._publicStorage = publicStorageProvider
  }

  configure (props) {
    super.configure(props)

    if (this.__previewStamp) {
      this._canvas.remove(this.__previewStamp)
      this.__previewStamp = null
      this.__previewOnBoard = false
    }

    if (this._stampPreviewUrl) {
      createStampFromUrl(this._stampPreviewUrl, this._onPreviewLoad)
    }

    this._canvas.defaultCursor = this._cursorString
    this._canvas.setCursor(this._cursorString)
  }

  get _cursorString () {
    return `url("${this._publicStorage.getUrl(this._publicStorage.types.STAMP, cursorName)}") 5 19, crosshair`
  }

  get _stamp () {
    return stampsArray[this.__mode] || {}
  }

  get _stampUrl () {
    return this._publicStorage.getUrl(this._publicStorage.types.STAMP, this._stamp.name, 'svg')
  }

  get _stampPreviewUrl () {
    return this._publicStorage.getUrl(this._publicStorage.types.STAMP, `${this._stamp.name}_preview`, 'svg')
  }

  _onPreviewLoad = (image) => {
    if (image) {
      this.__previewStamp = image

      makeNotInteractive(this.__previewStamp)
      this.__previewStamp.set('_draft', true)
    }
  }

  _onImageLoad = (image, event) => {
    if (image) {
      this.__object = image
      const [x, y] = adjustPosition(this.__object, event.absolutePointer, '-1 0')

      this.__object.set({ left: x + (this._stamp.offsetX || 0), top: y + (this._stamp.offsetY || 0) })

      this._canvas.add(this.__object)

      makeNotInteractive(this.__object)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleObjectAddedEvent () { }

  handleMouseMoveEvent (event) {
    if (this.__previewStamp) {
      const [x, y] = adjustPosition(this.__previewStamp, event.absolutePointer, '-1 0')

      this.__previewStamp.set({ left: x, top: y }).setCoords()

      if (!this.__previewOnBoard) {
        this._canvas.add(this.__previewStamp)
        this.__previewOnBoard = true
      } else {
        this._canvas.renderAll()
      }
    }
  }

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

  destroy () {
    if (this.__previewStamp) {
      this._canvas.remove(this.__previewStamp)
      this.__previewStamp = null
      this.__previewOnBoard = false
    }
  }
}
