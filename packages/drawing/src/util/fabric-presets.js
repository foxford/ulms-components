import { fabric } from 'fabric/dist/fabric.min'

import tp from './token-provider'

function matchesStorageURIScheme (url) {
  const re = /^.*\/api\/(.*)\/sets\/(.*)\/objects\/(.*)$/

  return url.match(re)
}

fabric.disableStyleCopyPaste = true
const originalFabricLoadImageFn = fabric.util.loadImage

fabric.util.loadImage = function loadImage (url, callback, context, crossOrigin) {
  if (matchesStorageURIScheme(url)) {
    tp.getToken()
      .then((token) => {
        if (url.indexOf('access_token') !== -1) {
          originalFabricLoadImageFn(
            url.replace(/\?access_token=(.*)$/i, `?access_token=${token}`),
            callback,
            context,
            crossOrigin
          )
        } else {
          originalFabricLoadImageFn(`${url}?access_token=${token}`, callback, context, crossOrigin)
        }

        return null
      })
      .catch(error => console.log(error)) // eslint-disable-line no-console
  } else {
    originalFabricLoadImageFn(url, callback, context, crossOrigin)
  }
}

fabric.Line.prototype.calcLineEndpointCoords = function calcLineEndpointCoords () {
  if (!this.canvas) {
    return {
      startCoords: { x: 0, y: 0 },
      endCoords: { x: 0, y: 0 },
    }
  }

  const linePoints = this.calcLinePoints()
  const scaleX = this.scaleX || 1
  const scaleY = this.scaleY || 1
  const zoom = this.canvas.getZoom()
  const x = this.canvas.viewportTransform[4]
  const y = this.canvas.viewportTransform[5]

  let startCoords
  let endCoords

  if ((this.flipY && this.flipX) || (!this.flipY && !this.flipX)) {
    startCoords = {
      x: x + (this.left + linePoints.x1 * scaleX) * zoom,
      y: y + (this.top + linePoints.y1 * scaleY) * zoom,
    }
    endCoords = {
      x: x + (this.left + linePoints.x2 * scaleX) * zoom,
      y: y + (this.top + linePoints.y2 * scaleY) * zoom,
    }
  } else {
    startCoords = {
      x: x + (this.left + linePoints.x1 * scaleX) * zoom,
      y: y + (this.top + linePoints.y2 * scaleY) * zoom,
    }
    endCoords = {
      x: x + (this.left + linePoints.x2 * scaleX) * zoom,
      y: y + (this.top + linePoints.y1 * scaleY) * zoom,
    }
  }

  return { startCoords, endCoords }
}

// Эта подмена нужна, чтобы поправить баг с неправильным определением места курсора при печати длинного текста
// Это копипаста из Фабрика
const textBoxOnInput = fabric.Textbox.prototype.onInput
const textBoxFromObject = fabric.Textbox.fromObject

fabric.Textbox.prototype.onInput = function (e) {
  textBoxOnInput.call(this, e)

  if (this.canvas) {
    // Пересобираем кэш длин символов
    fabric.charWidthsCache[this.value] = {}
    this.canvas.getActiveObject().initDimensions()
    this.canvas.getActiveObject().setCoords()

    this.canvas.requestRenderAll()
  }
}

fabric.Textbox.fromObject = function (object, callback) {
  if (object.fontFamily.includes('BlinkMacSystemFont')) {
    // eslint-disable-next-line no-param-reassign
    object.fontFamily = object.fontFamily.split(', ').filter(item => item !== 'BlinkMacSystemFont').join(', ')
  }
  textBoxFromObject.call(this, object, callback)
}

// Вычисляет абсолютные координаты объекта во вьюпорте документа
fabric.Canvas.prototype.getAbsoluteCoords = function getAbsoluteCoords (object) {
  const canvasZoom = this.getZoom()
  const x = this.viewportTransform[4]
  const y = this.viewportTransform[5]

  const {
    top, left, width, height,
  } = object.getBoundingRect(true)

  return {
    left: x + left * canvasZoom,
    top: y + top * canvasZoom,
    width: width * canvasZoom,
    height: height * canvasZoom,
    offsetTop: this._offset.top, // Для корректировки размещения попапа
    offsetLeft: this._offset.left, // this._offset - смещение канвас относительно окна
  }
}

const rotateIcon = "data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 4C16.5893 6.23917 17.0607 11.4246 14.2322 14.253C11.4038 17.0815 6.21836 16.6101 3.97918 16.0208M16 4L14.2322 6.82843M16 4L18.8284 6.82843M3.97918 16.0208L6.80761 18.8492M3.97918 16.0208L7.61084 14.1318' stroke='%231A96F6'/%3E%3C/svg%3E%0A"

const rotateImg = document.createElement('img')

rotateImg.src = rotateIcon

function renderRotateIcon () {
  return function renderIcon (ctx, left, top, styleOverride, fabricObject) {
    const size = this.cornerSize

    ctx.save()
    ctx.translate(left, top)
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
    ctx.drawImage(rotateImg, -size / 2, -size / 2, size, size)
    ctx.restore()
  }
}

fabric.Object.prototype.hasBorders = false
fabric.Object.prototype.hasControls = false
fabric.Object.prototype.borderColor = '#1A96F6'
fabric.Object.prototype.cornerStrokeColor = '#1A96F6'
fabric.Object.prototype.cornerColor = '#1A96F6'
fabric.Object.prototype.transparentCorners = false
fabric.Object.prototype.cornerSize = 8

fabric.Object.prototype.controls.mtr = new fabric.Control({
  x: 0.5,
  y: 0.5,
  offsetY: 12,
  offsetX: 12,
  sizeX: 18,
  sizeY: 18,
  actionHandler: fabric.controlsUtils.rotationWithSnapping,
  cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
  render: renderRotateIcon(),
  actionName: 'rotate',
  cornerSize: 32,
  withConnection: false,
})

fabric.Textbox.prototype.controls.mtr = new fabric.Control({
  x: 0.5,
  y: 0.5,
  offsetY: 12,
  offsetX: 12,
  sizeX: 18,
  sizeY: 18,
  actionHandler: fabric.controlsUtils.rotationWithSnapping,
  cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
  render: renderRotateIcon(),
  actionName: 'rotate',
  cornerSize: 32,
  withConnection: false,
})
