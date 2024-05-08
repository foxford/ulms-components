import { adjustPosition, makeNotInteractive } from './tools/object'

class CCursorProvider {
  constructor() {
    this.__canvas = null
    this.__cursor = null
    this.__cursorOnBoard = false
    this.__adjustPoint = '-0.5 -0.5'
  }

  set canvas(canvas) {
    this.__canvas = canvas
  }

  setCursor(cursorObject, adjustPoint = '-0.5 -0.5') {
    this._clearCursor()
    if (cursorObject) {
      cursorObject.clone((object) => {
        this.__cursor = object || null
        if (this.__cursor) {
          this.__adjustPoint = adjustPoint

          makeNotInteractive(this.__cursor)
          this.__cursor.set('_draft', true)
          this.__cursor.set('opacity', 0.5)
        }
      })
    } else {
      this.__cursor = null
    }
  }

  onMouseMove(event) {
    if (this.__canvas && this.__cursor) {
      const [x, y] = adjustPosition(
        this.__cursor,
        event.absolutePointer,
        this.__adjustPoint,
      )

      this.__cursor.set({ left: x, top: y }).setCoords()

      if (!this.__cursorOnBoard) {
        this.__canvas.add(this.__cursor)
        this.__cursorOnBoard = true
      }

      this.__canvas.renderAll()
    }
  }

  _clearCursor() {
    if (this.__canvas && this.__cursor) {
      this.__canvas.remove(this.__cursor)
      this.__cursor = null
      this.__cursorOnBoard = false
    }
  }

  hide() {
    if (this.__canvas && this.__cursor) {
      this.__canvas.remove(this.__cursor)
    }
  }

  show() {
    if (this.__canvas && this.__cursor) {
      this.__canvas.add(this.__cursor)
    }
  }

  destroy() {
    if (this.__canvas) {
      this._clearCursor()
    }

    this.__canvas = null
  }
}

// eslint-disable-next-line import/prefer-default-export
export const CursorProvider = new CCursorProvider()
