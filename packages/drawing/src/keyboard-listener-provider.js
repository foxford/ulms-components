import { CopyPasteProvider } from './copy-paste-provider'

export const keyboardEvents = {
  keyDown: 'keydown',
  keyUp: 'keyup',
  keyDownCapture: 'keydowcapture',
  keyUpCapture: 'keyupcapture',
}

class CKeyboardListenerProvider {
  #enabled = true

  #element = null

  #keyDownListeners = []

  #keyUpListeners = []

  #keyDownCaptureListeners = []

  #keyUpCaptureListeners = []

  set enabled (enabled) {
    this.#enabled = enabled
  }

  /**
   * Init keyboard listeners
   *
   * @param {HTMLElement, HTMLDocument} el Dom element
   */
  init (el) {
    if (this.#element && this.#element.removeEventListener) {
      this.#element.removeEventListener(keyboardEvents.keyDown, this.#handleKeyDownEvent)
      this.#element.removeEventListener(keyboardEvents.keyUp, this.#handleKeyUpEvent)
      this.#element.removeEventListener(keyboardEvents.keyDown, this.#handleKeyDownCaptureEvent, true)
      this.#element.removeEventListener(keyboardEvents.keyUp, this.#handleKeyUpCaptureEvent, true)
      this.#element.removeEventListener('copy', this.handleCopyEvent)
      this.#element.removeEventListener('cut', this.handleCopyEvent)
      this.#element.removeEventListener('paste', this.handleCopyEvent)
    }

    if (el && el.addEventListener) {
      this.#element = el
      this.#element.addEventListener(keyboardEvents.keyDown, this.#handleKeyDownEvent)
      this.#element.addEventListener(keyboardEvents.keyUp, this.#handleKeyUpEvent)
      this.#element.addEventListener(keyboardEvents.keyDown, this.#handleKeyDownCaptureEvent, true)
      this.#element.addEventListener(keyboardEvents.keyUp, this.#handleKeyUpCaptureEvent, true)
      this.#element.addEventListener('copy', this.handleCopyEvent)
      this.#element.addEventListener('cut', this.handleCutEvent)
      this.#element.addEventListener('paste', this.handlePasteEvent)
    }
  }

  /**
   * Removes all listeners
   */
  destroy () {
    if (this.#element && this.#element.removeEventListener) {
      this.#element.removeEventListener(keyboardEvents.keyDown, this.#handleKeyDownEvent)
      this.#element.removeEventListener(keyboardEvents.keyUp, this.#handleKeyUpEvent)
      this.#element.removeEventListener(keyboardEvents.keyDown, this.#handleKeyDownCaptureEvent, true)
      this.#element.removeEventListener(keyboardEvents.keyUp, this.#handleKeyUpCaptureEvent, true)
      this.#element.removeEventListener('copy', this.handleCopyEvent)
      this.#element.removeEventListener('cut', this.handleCutEvent)
      this.#element.removeEventListener('paste', this.handlePasteEvent)
    }
    this.#keyDownListeners = []
    this.#keyUpListeners = []

    this.#element = null
  }

  handleCopyEvent = (e) => {
    if (this.#enabled && this.canHandleCopyEvent(e)) {
      CopyPasteProvider.copyToClipboard(e)
    }
  }

  handleCutEvent = (e) => {
    if (this.#enabled && this.canHandleCopyEvent(e)) {
      CopyPasteProvider.cutToClipboard(e)
    }
  }

  handlePasteEvent = (e) => {
    if (this.#enabled && this.canHandleEvent(e)) {
      CopyPasteProvider.pasteFromClipboard(e)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  canHandleEvent (e) {
    const { tagName } = (e.target || e.srcElement)

    return !(tagName.isContentEditable || tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA')
  }

  // eslint-disable-next-line class-methods-use-this
  canHandleCopyEvent (e) {
    const { tagName } = (e.target || e.srcElement)

    return tagName === 'BODY'
  }

  #handleKeyDownEvent = (e) => {
    if (this.#enabled && this.canHandleEvent(e)) {
      this.#keyDownListeners.forEach((handler) => { handler(e) })
    }
  }

  #handleKeyUpEvent = (e) => {
    if (this.#enabled && this.canHandleEvent(e)) {
      this.#keyUpListeners.forEach((handler) => { handler(e) })
    }
  }

  #handleKeyDownCaptureEvent = (e) => {
    if (this.#enabled && this.canHandleEvent(e)) {
      this.#keyDownCaptureListeners.forEach((handler) => { handler(e) })
    }
  }

  #handleKeyUpCaptureEvent = (e) => {
    if (this.#enabled && this.canHandleEvent(e)) {
      this.#keyUpCaptureListeners.forEach((handler) => { handler(e) })
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
        this.#keyDownListeners.push(handler)
        break

      case keyboardEvents.keyUp:
        this.#keyUpListeners.push(handler)
        break

      case keyboardEvents.keyDownCapture:
        this.#keyDownCaptureListeners.push(handler)
        break

      case keyboardEvents.keyUpCapture:
        this.#keyUpCaptureListeners.push(handler)
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
        index = this.#keyDownListeners.findIndex(item => item === handler)
        if (index !== -1) {
          this.#keyDownListeners.splice(index, 1)
        }
        break

      case keyboardEvents.keyUp:
        index = this.#keyUpListeners.findIndex(item => item === handler)
        if (index !== -1) {
          this.#keyUpListeners.splice(index, 1)
        }
        break

      case keyboardEvents.keyDownCapture:
        index = this.#keyDownCaptureListeners.findIndex(item => item === handler)
        if (index !== -1) {
          this.#keyDownCaptureListeners.splice(index, 1)
        }
        break

      case keyboardEvents.keyUpCapture:
        index = this.#keyUpCaptureListeners.findIndex(item => item === handler)
        if (index !== -1) {
          this.#keyUpCaptureListeners.splice(index, 1)
        }
        break

      default:
        throw new TypeError('KeyboardListenerProvider error: event must be "keydown" or "keyup"!')
    }
  }
}

export const KeyboardListenerProvider = new CKeyboardListenerProvider()
