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

// Вычисляет абсолютные координаты объекта во вьюпорте документа
fabric.Canvas.prototype.getAbsoluteCoords = function getAbsoluteCoords (object) {
  const canvasZoom = this.getZoom()
  const x = this.viewportTransform[4]
  const y = this.viewportTransform[5]

  const {
    top, left, width, height,
  } = object.getBoundingRect(true)

  return {
    left: x + this._offset.left + left * canvasZoom, // this._offset - смещение канвас относительно окна
    top: y + this._offset.top + top * canvasZoom,
    width: width * canvasZoom,
    height: height * canvasZoom,
  }
}

const rotateIcon = "data:image/svg+xml,%3Csvg width='17' height='17' viewBox='0 0 17 17' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.24268 1C2.65342 3.23917 2.18202 8.42462 5.01044 11.253C7.83887 14.0815 13.0243 13.6101 15.2635 13.0208M3.24268 1L5.01044 3.82843M3.24268 1L0.414249 3.82843M15.2635 13.0208L12.4351 15.8492M15.2635 13.0208L11.6318 11.1318' stroke='%231A96F6'/%3E%3C/svg%3E%0A"

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

fabric.Object.prototype.borderColor = '#1A96F6'
fabric.Object.prototype.cornerStrokeColor = '#1A96F6'
fabric.Object.prototype.transparentCorners = false
fabric.Object.prototype.cornerSize = 8

fabric.Object.prototype.controls.mtr = new fabric.Control({
  x: -0.5,
  y: +0.5,
  offsetY: 8,
  offsetX: -8,
  actionHandler: fabric.controlsUtils.rotationWithSnapping,
  cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
  render: renderRotateIcon(),
  actionName: 'rotate',
  cornerSize: 24,
  withConnection: false,
})

fabric.Textbox.prototype.controls.mtr = new fabric.Control({
  x: -0.5,
  y: +0.5,
  offsetY: 8,
  offsetX: -8,
  actionHandler: fabric.controlsUtils.rotationWithSnapping,
  cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
  render: renderRotateIcon(),
  actionName: 'rotate',
  cornerSize: 24,
  withConnection: false,
})
