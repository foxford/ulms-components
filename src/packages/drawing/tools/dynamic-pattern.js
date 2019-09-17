import { fabric } from 'fabric'

export default class DynamicPattern {
  constructor (canvas) {
    this._canvas = canvas
    this._offsetX = null
    this._offsetY = null
    this._patternCanvas = null
    this._pattern = null
    this._patternImageSrc = null
    this._patternImageWidth = null
    this._patternImageHeight = null
    this._patternRect = null
    this._zoom = 1
  }

  _getPatternSource () {
    this._patternCanvas.setDimensions({
      width: this._patternImageWidth * this._zoom,
      height: this._patternImageHeight * this._zoom,
    })
    this._patternCanvas.setZoom(this._zoom)
    this._patternCanvas.renderAll()

    return this._patternCanvas.getElement()
  }

  setPattern (src) {
    this._patternImageSrc = src

    if (!this._patternCanvas) {
      this._patternCanvas = new fabric.StaticCanvas()

      this._patternCanvas.enableRetinaScaling = false
    }

    fabric.Image.fromURL(this._patternImageSrc, (imageObject) => {
      this._patternImageWidth = imageObject.width
      this._patternImageHeight = imageObject.height

      this._patternCanvas.clear()
      this._patternCanvas.add(imageObject)
      this._patternCanvas.renderAll()

      if (!this._pattern) {
        this._pattern = new fabric.Pattern({
          source: this._getPatternSource.bind(this),
          repeat: 'repeat',
        })
      }

      if (!this._patternRect) {
        this._patternRect = new fabric.Rect({
          width: this._canvas.width,
          height: this._canvas.height,
          fill: this._pattern,
          objectCaching: false,
        })

        this._canvas.add(this._patternRect)
      }

      this._render()
    }, { crossOrigin: 'anonymous' })
  }

  update (options) {
    const {
      offsetX, offsetY, zoom,
    } = options

    this._offsetX = offsetX
    this._offsetY = offsetY
    this._zoom = zoom

    this._render()
  }

  _render () {
    if (this._patternRect) {
      this._patternRect.setOptions({
        width: this._canvas.width,
        height: this._canvas.height,
      })
    }

    if (this._pattern) {
      this._pattern.offsetX = this._offsetX
      this._pattern.offsetY = this._offsetY
    }

    if (this._canvas) {
      this._canvas.requestRenderAll()
    }
  }

  destroy () {
    this._canvas.remove(this._patternRect)
    this._canvas = null

    this._offsetX = null
    this._offsetY = null

    this._patternCanvas.clear()
    this._patternCanvas.dispose()

    this._patternCanvas = null
    this._pattern = null
    this._patternImageSrc = null
    this._patternImageWidth = null
    this._patternImageHeight = null
    this._patternRect = null
    this._zoom = 1
  }
}
