import React from 'react'

import { Frame } from './frame'

class EmitterComponent extends React.Component {
  constructor () {
    super()

    this.elRef = React.createRef()
  }

  componentDidMount () {
    this._currentCtx.addEventListener('message', this.recvInMessage)
  }

  componentWillUnmount () {
    this._currentCtx.removeEventListener('message', this.recvInMessage)
  }

  get _currentCtx () {
    return this.elRef.current.ownerDocument.defaultView
  }

  get _parentCtx () {
    return this._currentCtx.parent
  }

  getState = () => {
    this.postOutMessage({ type: Frame.getAction('getState'), payload: '' })
  }

  updateState = () => {
    this.postOutMessage({ type: Frame.getAction('updateState'), payload: '{"foo":"bar"}' })
  }

  notify = () => {
    this.postOutMessage({ type: Frame.getAction('notify'), payload: '{"foo":"bar"}' })
  }

  recvInMessage = ({ source, data }) => {
    console.info('Recv in:', data, 'sameorigin:', source === this._currentCtx) // eslint-disable-line no-console
  }

  postOutMessage (action) {
    console.info('Post out', action) // eslint-disable-line no-console
    this._parentCtx.postMessage(action, '*')
  }

  render () {
    return (
      <div ref={this.elRef}>
        <style>{'button + button { margin: 0 0 0 10px }'}</style>
        <button onClick={this.getState} type='button'>getstate</button>
        <button onClick={this.updateState} type='button'>updatestate</button>
        <button onClick={this.notify} type='button'>notify</button>
      </div>
    )
  }
}

export default {
  title: '_utils_',
  component: Frame,
}

export const messageEmitter = () => <EmitterComponent />

messageEmitter.storyName = 'message-emitter'
