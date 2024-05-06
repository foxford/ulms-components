/* eslint-disable class-methods-use-this */
import { toolEnum } from './constants'
import { USER_LOCK_LABEL } from './util/serialize-object'
import { makeInteractive, makeNotInteractive } from './tools/object'
// eslint-disable-next-line import/no-cycle
import SelectTool from './tools/select'

class CLockProvider {
  constructor() {
    this.__lockedIds = []
    this.__canvas = null
    this.__tool = null
    // Возможна ситуация, когда lockedIds получили, а canvas еще не задана
    this.__waitForCanvas = false
  }

  set canvas(canvas) {
    this.__canvas = canvas

    if (canvas && this.__waitForCanvas) {
      this.__waitForCanvas = false

      if (this.__tool === toolEnum.SELECT) {
        for (const id of this.__lockedIds) {
          if (this.__canvas._objectsMap.has(id)) {
            makeNotInteractive(this.__canvas._objectsMap.get(id))
          }
        }
      }
    }
  }

  set tool(tool) {
    this.__tool = tool
  }

  get lockedIds() {
    return this.__lockedIds
  }

  set lockedIds(ids) {
    const newIds = Array.isArray(ids) ? ids : [ids]

    if (this.__canvas) {
      if (this.__tool === toolEnum.SELECT) {
        const removedIds = []
        const addedIds = []

        for (const id of this.__lockedIds) {
          if (!newIds.includes(id)) {
            removedIds.push(id)
          }
        }

        for (const id of newIds) {
          if (!this.__lockedIds.includes(id)) {
            addedIds.push(id)
          }
        }

        for (const id of addedIds) {
          if (this.__canvas._objectsMap.has(id)) {
            const object = this.__canvas._objectsMap.get(id)

            makeNotInteractive(object)
            SelectTool.removeFromSelection(this.__canvas, object)
          }
        }

        for (const id of removedIds) {
          if (this.__canvas._objectsMap.has(id)) {
            makeInteractive(this.__canvas._objectsMap.get(id))
          }
        }
      }
    } else {
      this.__waitForCanvas = true
    }
    this.__lockedIds = newIds
  }

  isLockedByUser(object) {
    return object && object[USER_LOCK_LABEL]
  }

  isLockedBySelection(object) {
    return this.__lockedIds.includes(object._id)
  }

  isLocked(object) {
    return this.isLockedByUser(object) || this.isLockedBySelection(object)
  }

  lockUserObject(object, options = {}) {
    const props = {
      ...options,
      borderColor: 'rgba(255,0,0,0.75)',
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      lockLine: true,
      editable: false,

      [USER_LOCK_LABEL]: true,
    }

    object.set(props)

    return object
  }

  unlockUserObject(object, options = {}) {
    const props = {
      ...options,
      borderColor: 'rgba(102,153,255,0.75)',
      lockMovementX: false,
      lockMovementY: false,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
      lockLine: false,
      lockUniScaling: false,
      editable: true,

      [USER_LOCK_LABEL]: undefined,
    }

    object.set(props)

    return object
  }

  resetObjectUserLock(object) {
    // eslint-disable-next-line no-unused-vars
    const { [USER_LOCK_LABEL]: userLockLabel, ...restObject } = object

    return restObject
  }

  toggleUserLock(object_) {
    // ToDo: Заглушка. Пока работаем с одним объектом.
    // Когда появится множественное выделение - надо переработать
    const object = Array.isArray(object_) ? object_[0] : object_

    if (this.isLockedByUser(object)) {
      this.unlockUserObject(object)
    } else {
      this.lockUserObject(object)
    }

    if (this.__canvas) {
      this.__canvas.requestRenderAll()
      this.__canvas.fire('object:modified', { target: object })
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export const LockProvider = new CLockProvider()
