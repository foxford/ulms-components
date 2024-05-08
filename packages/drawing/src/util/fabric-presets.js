import { fabric } from 'fabric/dist/fabric.min'

import tp from './token-provider'

function matchesStorageURIScheme(url) {
  const re = /^.*\/api\/(.*)\/sets\/(.*)\/objects\/(.*)$/

  return url.match(re)
}

fabric.disableStyleCopyPaste = true
const originalFabricLoadImageFunction = fabric.util.loadImage

fabric.util.loadImage = function loadImage(
  url,
  callback,
  context,
  crossOrigin,
) {
  if (matchesStorageURIScheme(url)) {
    tp.getToken()
      .then((token) => {
        if (url.includes('access_token')) {
          originalFabricLoadImageFunction(
            url.replace(/\?access_token=(.*)$/i, `?access_token=${token}`),
            callback,
            context,
            crossOrigin,
          )
        } else {
          originalFabricLoadImageFunction(
            `${url}?access_token=${token}`,
            callback,
            context,
            crossOrigin,
          )
        }

        return null
      })
      .catch((error) => console.log(error)) // eslint-disable-line no-console
  } else {
    originalFabricLoadImageFunction(url, callback, context, crossOrigin)
  }
}

fabric.Line.prototype.calcLineEndpointCoords =
  function calcLineEndpointCoords() {
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

fabric.Textbox.prototype.onInput = function onInput(event) {
  textBoxOnInput.call(this, event)

  if (this.canvas) {
    // Пересобираем кэш длин символов
    fabric.charWidthsCache[this.value] = {}

    if (this.canvas.getActiveObject()) {
      this.canvas.getActiveObject().initDimensions()
      this.canvas.getActiveObject().setCoords()
    }

    this.canvas.requestRenderAll()
  }
}

fabric.Textbox.fromObject = function fromObject(object, callback) {
  if (object.fontFamily.includes('BlinkMacSystemFont')) {
    // eslint-disable-next-line no-param-reassign
    object.fontFamily = object.fontFamily
      .split(', ')
      .filter((item) => item !== 'BlinkMacSystemFont')
      .join(', ')
  }
  textBoxFromObject.call(this, object, callback)
}

// Вычисляет абсолютные координаты объекта во вьюпорте документа
fabric.Canvas.prototype.getAbsoluteCoords = function getAbsoluteCoords(object) {
  const canvasZoom = this.getZoom()
  const x = this.viewportTransform[4]
  const y = this.viewportTransform[5]

  const { top, left, width, height } = object.getBoundingRect(true)

  return {
    left: x + left * canvasZoom,
    top: y + top * canvasZoom,
    width: width * canvasZoom,
    height: height * canvasZoom,
    offsetTop: this._offset.top, // Для корректировки размещения попапа
    offsetLeft: this._offset.left, // this._offset - смещение канвас относительно окна
  }
}

function commonEventInfo(eventData, transform, x, y) {
  return {
    e: eventData,
    transform,
    pointer: {
      x,
      y,
    },
  }
}

/**
 * Action handler
 * @private
 * @param {Event} eventData javascript event that is doing the transform
 * @param {Object} transform javascript object containing a series of information around the current transform
 * @param {number} x current mouse x position, canvas normalized
 * @param {number} y current mouse y position, canvas normalized
 * @return {Boolean} true if the translation occurred
 */
function dragHandler(eventData, transform, x, y) {
  const { lastX, lastY, offsetX, offsetY, shiftKey, target } = transform
  const newLeft = x - offsetX
  const newTop = y - offsetY
  let lockX = false
  let lockY = false

  // Если нажат shift - лочим движение по Х или Y
  if (shiftKey) {
    if (Math.abs(x - lastX) > Math.abs(y - lastY)) {
      lockY = true
    } else {
      lockX = true
    }
  }

  const moveX =
    !target.get('lockMovementX') && !lockX && target.left !== newLeft
  const moveY = !target.get('lockMovementY') && !lockY && target.top !== newTop

  if (moveX) target.set('left', newLeft)
  if (moveY) target.set('top', newTop)

  if (lockX) target.set('left', lastX - offsetX)
  if (lockY) target.set('top', lastY - offsetY)

  if (moveX || moveY) {
    fabric.controlsUtils.fireEvent(
      'moving',
      commonEventInfo(eventData, transform, x, y),
    )
  }

  return moveX || moveY
}

fabric.controlsUtils.dragHandler = dragHandler

const rotateIcon =
  "data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 4C16.5893 6.23917 17.0607 11.4246 14.2322 14.253C11.4038 17.0815 6.21836 16.6101 3.97918 16.0208M16 4L14.2322 6.82843M16 4L18.8284 6.82843M3.97918 16.0208L6.80761 18.8492M3.97918 16.0208L7.61084 14.1318' stroke='%238A51E6'/%3E%3C/svg%3E%0A"

const rotateImg = document.createElement('img')

rotateImg.src = rotateIcon

const SNAP_ANGLE = 45

/**
 * Action handler for rotation and snapping, without anchor point.
 * Needs to be wrapped with `wrapWithFixedAnchor` to be effective
 * @param {Event} eventData javascript event that is doing the transform
 * @param {Object} transform javascript object containing a series of information around the current transform
 * @param {number} x current mouse x position, canvas normalized
 * @param {number} y current mouse y position, canvas normalized
 * @return {Boolean} true if some change happened
 * @private
 */
function rotationWithSnapping(eventData, transform, x, y) {
  const { ex, ey, originX, originY, shiftKey, target, theta } = transform

  const pivotPoint = target.translateToOriginPoint(
    target.getCenterPoint(),
    originX,
    originY,
  )

  if (target.lockRotation) {
    return false
  }

  const lastAngle = Math.atan2(ey - pivotPoint.y, ex - pivotPoint.x)
  const currentAngle = Math.atan2(y - pivotPoint.y, x - pivotPoint.x)
  let angle = fabric.util.radiansToDegrees(currentAngle - lastAngle + theta)
  let hasRotated = true

  // Теперь еще проверяем нажатый shift
  if (target.snapAngle > 0 || shiftKey) {
    const snapAngle = target.snapAngle || SNAP_ANGLE
    const snapThreshold = target.snapThreshold || snapAngle
    const rightAngleLocked = Math.ceil(angle / snapAngle) * snapAngle
    const leftAngleLocked = Math.floor(angle / snapAngle) * snapAngle

    if (Math.abs(angle - leftAngleLocked) < snapThreshold) {
      angle = leftAngleLocked
    } else if (Math.abs(angle - rightAngleLocked) < snapThreshold) {
      angle = rightAngleLocked
    }
  }

  // normalize angle to positive value
  if (angle < 0) {
    angle = 360 + angle
  }
  angle %= 360

  hasRotated = target.angle !== angle
  target.angle = angle

  return hasRotated
}

const wrappedRotationWithSnapping = fabric.controlsUtils.wrapWithFireEvent(
  'rotating',
  fabric.controlsUtils.wrapWithFixedAnchor(rotationWithSnapping),
)

function renderRotateIcon() {
  return function renderIcon(context, left, top, styleOverride, fabricObject) {
    const size = this.cornerSize

    context.save()
    context.translate(left, top)
    context.rotate(fabric.util.degreesToRadians(fabricObject.angle))
    context.drawImage(rotateImg, -size / 2, -size / 2, size, size)
    context.restore()
  }
}

fabric.Object.prototype.hasBorders = false
fabric.Object.prototype.hasControls = false
fabric.Object.prototype.borderColor = '#8A51E6'
fabric.Object.prototype.cornerStrokeColor = '#8A51E6'
fabric.Object.prototype.cornerColor = '#8A51E6'
fabric.Object.prototype.transparentCorners = false
fabric.Object.prototype.cornerSize = 8

fabric.Object.prototype.controls.mtr = new fabric.Control({
  x: 0.5,
  y: 0.5,
  offsetY: 12,
  offsetX: 12,
  sizeX: 18,
  sizeY: 18,
  actionHandler: wrappedRotationWithSnapping,
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
  actionHandler: wrappedRotationWithSnapping,
  cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
  render: renderRotateIcon(),
  actionName: 'rotate',
  cornerSize: 32,
  withConnection: false,
})
