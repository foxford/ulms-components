/* eslint react/prop-types: 0 */
import React from 'react'

export class FrameComponent extends React.PureComponent {
  static get actions () {
    return new Map([['getState', 'get_state'], ['updateState', 'update_state'], ['notify', 'notify']])
  }

  static getAction (name) {
    const keys = [...FrameComponent.actions.keys()]
    const names = [...FrameComponent.actions.values()]

    const actionIndex = keys.findIndex(a => a === name)
    if (actionIndex === -1) throw new Error('Can not find action')

    return names[actionIndex]
  }

  static get type () {
    return 'about:iframe#taskdigests'
  }

  static isEnabled (env) {
    return env.length > 0
  }

  static isComponent (data) {
    return data.url && data.url.startsWith(FrameComponent.type)
  }

  static data ({
    data = '""', page = 1, title, url,
  }) {
    return {
      data,
      page,
      title,
      url: new URL(`${FrameComponent.type}/${url}`).href,
    }
  }

  constructor (props) {
    super(props)
    this.iframeR = React.createRef()
  }

  componentDidMount () {
    this.iframeWindow.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount () {
    this.iframeWindow.removeEventListener('message', this.handleMessage)
  }

  get iframeWindow () {
    return this.iframeR.current && this.iframeR.current.ownerDocument.defaultView
  }

  handleMessage = (event) => {
    const { handleMessage } = this.props
    if (event.source !== this.iframeR.current.contentWindow) return
    // bypass iframe-only events

    const { payload, type } = event.data

    handleMessage(type, payload)
  }

  postMessage = (message) => {
    const el = this.iframeR.current

    if (!message) throw new Error('Could not post message')

    el && el.contentWindow.postMessage(message, '*')
  }

  postGetState = (message) => {
    this.postMessage({
      type: FrameComponent.actions.get('getState'),
      payload: message,
    })
  }

  postUpdateState = (message) => {
    this.postMessage({
      type: FrameComponent.actions.get('updateState'),
      payload: message,
    })
  }

  postNotify = (message) => {
    this.postMessage({
      type: FrameComponent.actions.get('notify'),
      payload: message,
    })
  }

  render () {
    const {
      scope,
      title,
      url,
    } = this.props

    return (
      <iframe
        style={{
          border: 0,
          display: 'flex',
          flex: 1,
          height: '100%',
          width: '100%',
        }}
        ref={this.iframeR}
        src={`${url}?scope=${scope}`}
        title={title}
      />
    )
  }
}
