export class LockProvider {
  constructor () {
    this.prev = null
    this.next = null
    this.listener = undefined
  }

  labels (labels) {
    this.prev = this.next ? [...this.next] : []
    this.next = labels

    this._updated(this.prev, this.next)
  }

  onUpdate (fn) {
    this.listener = fn
  }

  _updated (prev, next) {
    if (this.listener) {
      const changed = !prev.length
        || (next.length !== prev.length)
        || next.some((n, i) => n !== prev[i])

      this.listener(prev, changed, next)
    }
  }

  isLocked (label) {
    return this.next && this.next.includes(label)
  }
}

