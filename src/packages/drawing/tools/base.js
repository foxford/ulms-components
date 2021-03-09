/* eslint-disable */

export class Base {
  constructor (canvas) {
    this._active = true
    this._canvas = canvas
  }

  configure () {}

  destroy () {}

  handleTextEditStartEvent () {}

  handleTextEditEndEvent () {}

  handleKeyDownEvent () {}

  handleKeyUpEvent () {}

  handleMouseDownEvent () {}

  handleMouseMoveEvent () {}

  handleMouseUpEvent () {}

  handleObjectAddedEvent () {}

  handleSelectionUpdatedEvent () {}

  handleSelectionCreatedEvent () {}

  handleSelectionClearedEvent () {}

  makeActive () {
    this._active = true
  }

  makeInactive () {
    this._active = false
  }

  reset () {}
}
