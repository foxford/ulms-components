import { CopyPasteProvider } from './copy-paste-provider'

export const keyboardEvents = {
  keyDown: 'keydown',
  keyUp: 'keyup',
}

class CKeyboardListenerProvider {
  constructor () {
    this.__keyDownListeners = []
    this.__keyUpListeners = []

    this.__element = null
  }

  /**
   * Init keyboard listeners
   *
   * @param {HTMLElement, HTMLDocument} el Dom element
   */
  init (el) {
    if (this.__element) {
      this.__element.removeEventListener
      && this.__element.removeEventListener(keyboardEvents.keyDown, this._handleKeyDownEvent)
      this.__element.removeEventListener
      && this.__element.removeEventListener(keyboardEvents.keyUp, this._handleKeyUpEvent)
      this.__element.removeEventListener('copy', this.handleCopyEvent)
    }

    if (el) {
      this.__element = el
      this.__element.addEventListener
      && this.__element.addEventListener(keyboardEvents.keyDown, this._handleKeyDownEvent)
      this.__element.addEventListener
      && this.__element.addEventListener(keyboardEvents.keyUp, this._handleKeyUpEvent)
      this.__element.addEventListener
      && this.__element.addEventListener('copy', this.handleCopyEvent)
      this.__element.addEventListener
      && this.__element.addEventListener('cut', this.handleCutEvent)
      this.__element.addEventListener
      && this.__element.addEventListener('paste', this.handlePasteEvent)
    }
  }

  /**
   * Removes all listeners
   */
  destroy () {
    if (this.__element) {
      this.__element.removeEventListener
      && this.__element.removeEventListener(keyboardEvents.keyDown, this._handleKeyDownEvent)
      this.__element.removeEventListener
      && this.__element.removeEventListener(keyboardEvents.keyUp, this._handleKeyUpEvent)
      this.__element.removeEventListener
      && this.__element.removeEventListener('copy', this.handleCopyEvent)
      this.__element.removeEventListener
      && this.__element.removeEventListener('cut', this.handleCutEvent)
      this.__element.removeEventListener
      && this.__element.removeEventListener('paste', this.handlePasteEvent)
    }
    this.__keyDownListeners = []
    this.__keyUpListeners = []

    this.__element = null
  }

  handleCopyEvent = (e) => {
    if (this.canHandleCopyEvent(e)) {
      CopyPasteProvider.copyToClipboard(e)
    }
  }

  handleCutEvent = (e) => {
    if (this.canHandleCopyEvent(e)) {
      CopyPasteProvider.cutToClipboard(e)
    }
  }

  handlePasteEvent = (e) => {
    if (this.canHandleEvent(e)) {
      CopyPasteProvider.pasteFromClipboard(e)
    }
  }

  canHandleEvent (e) {
    const { tagName } = (e.target || e.srcElement)

    return !(tagName.isContentEditable || tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA')
  }

  canHandleCopyEvent (e) {
    const { tagName } = (e.target || e.srcElement)

    return tagName === 'BODY'
  }

  _handleKeyDownEvent = (e) => {
    if (this.canHandleEvent(e)) {
      this.__keyDownListeners.forEach((handler) => { handler(e) })
    }
  }

  _handleKeyUpEvent = (e) => {
    if (this.canHandleEvent(e)) {
      this.__keyUpListeners.forEach((handler) => { handler(e) })
    }
  }

  /**
   * Add event listener
   *
   * @param {'keyup', 'keydown'} event Event type
   * @param {function} handler Event handler
   */
  on = (event, handler) => {
    if (typeof handler !== 'function') {
      throw new TypeError('KeyboardListenerProvider error: handler must be a function!')
    }

    switch (event) {
      case keyboardEvents.keyDown:
        this.__keyDownListeners.push(handler)
        break

      case keyboardEvents.keyUp:
        this.__keyUpListeners.push(handler)
        break

      default:
        throw new TypeError('KeyboardListenerProvider error: event must be "keydown" or "keyup"!')
    }
  }

  /**
   * Remove event listener
   *
   * @param {'keyup', 'keydown'} event Event type
   * @param {function} handler Event handler
   */
  off = (event, handler) => {
    let index

    switch (event) {
      case keyboardEvents.keyDown:
        index = this.__keyDownListeners.findIndex(item => item === handler)
        if (index !== -1) {
          this.__keyDownListeners.splice(index, 1)
        }
        break

      case keyboardEvents.keyUp:
        index = this.__keyUpListeners.findIndex(item => item === handler)
        if (index !== -1) {
          this.__keyUpListeners.splice(index, 1)
        }
        break

      default:
        throw new TypeError('KeyboardListenerProvider error: event must be "keydown" or "keyup"!')
    }
  }
}

export const KeyboardListenerProvider = new CKeyboardListenerProvider()
