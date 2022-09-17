const DRAW_UPDATE_MESSAGE = 'draw-update'

class CBroadcastProvider {
  constructor () {
    this.__provider = null
  }

  static messageTypes = {
    DRAW_UPDATE: 'draw-update',
  }

  set provider (provider) {
    this.__provider = provider
  }

  subscribe (handler) {
    if (this.__provider) {
      this.__provider.subscribe(DRAW_UPDATE_MESSAGE, handler)
    }
  }

  unsubscribe () {
    this.__provider.unsubscribe(DRAW_UPDATE_MESSAGE)
  }

  sendMessage (data) {
    if (this.__provider) {
      this.__provider.publish(DRAW_UPDATE_MESSAGE, data)
    }
  }

  destroy () {
    this.unsubscribe()
    this.__provider = null
  }
}

export const BroadcastProvider = new CBroadcastProvider()
