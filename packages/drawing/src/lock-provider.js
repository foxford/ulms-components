export class LockProvider {
  constructor () {
    this._label = null
    this.prev = null
    this.next = null
    this.listener = undefined
  }

  get label () {
    return this._label
  }

  set label (label) {
    if (!label) throw new TypeError('Absent label')
    this._label = label
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
      const changed = Boolean(!prev.length && next.length)
        || (next.length !== prev.length)
        || next.some((n, i) => n !== prev[i])

      this.listener(prev, changed, next)
    }
  }

  isLocked (label) {
    return label && this.next && this.next.includes(label)
  }

  isOwner (label) {
    return this.label === label
  }
}

