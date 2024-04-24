/* eslint-disable class-methods-use-this */
// eslint-disable-next-line import/no-extraneous-dependencies
import throttle from 'lodash/throttle'

import { BroadcastProvider } from '../broadcast-provider'
import { THROTTLE_DELAY } from '../constants'

export class Base {
  constructor (canvas) {
    this._active = true
    this._canvas = canvas

    this._throttledSendMessage = throttle((id, diff) => BroadcastProvider.sendMessage({ id, diff }), THROTTLE_DELAY)
  }

  configure () {}

  destroy () {}

  handleTextEditStartEvent () {}

  handleTextEditEndEvent () {}

  handleTextChangedEvent () {}

  handleKeyDownEvent () {}

  handleKeyUpEvent () {}

  handleMouseDownEvent () {}

  handleMouseMoveEvent () {}

  handleMouseUpEvent () {}

  handleMouseOverEvent () {}

  handleMouseOutEvent () {}

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
