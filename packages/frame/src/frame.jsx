/* eslint react/prop-types: 0 */
import React from 'react'

import { enrichUrlWith } from './util/enrich-url-with'

// TODO: move static methods to the frame-controller

const isUndef = a => typeof a === 'undefined'

export class Frame extends React.PureComponent {
  static get actions () {
    return new Map([['getState', 'get_state'], ['updateState', 'update_state'], ['notify', 'notify']])
  }

  static get type () {
    return 'about:iframe#taskdigests'
  }

  static getAction (name) {
    const keys = [...Frame.actions.keys()]
    const names = [...Frame.actions.values()]

    const actionIndex = keys.findIndex(a => a === name)
    if (actionIndex === -1) throw new Error('Can not find action')

    return names[actionIndex]
  }

  static isComponent (data = {}) {
    return data.url && data.url.startsWith(Frame.type)
  }

  static wrapMessage (da, ta) {
    return Frame.data(da, ta)
  }

  static data ({
    id,
    page = 1,
    title,
  }, data) {
    // eslint-disable-next-line no-console
    console.warn('`Frame::data` is deprecated. Use Frame::wrapMessage instead')

    let _data = {
      page,
      title,
      // eslint-disable-next-line node/no-unsupported-features/node-builtins
      url: new URL(`${Frame.type}/${id}`).href,
    }

    if (data) {
      _data = {
        ..._data,
        data,
      }
    }

    return _data
  }

  constructor (props) {
    super(props)

    const { url } = props

    if (!url || typeof url !== 'string') throw new TypeError('Wrong url')

    this.iframeR = React.createRef()
  }

  componentDidMount () {
    this._currentCtx && this._currentCtx.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount () {
    this._currentCtx && this._currentCtx.removeEventListener('message', this.handleMessage)
  }

  get _childCtx () {
    return this.iframeR.current && this.iframeR.current.contentWindow
  }

  get _currentCtx () {
    return this.iframeR.current && this.iframeR.current.ownerDocument.defaultView
  }

  handleMessage = ({ source, data }) => {
    const {
      debug = false,
      onNotify,
      onGetState,
      onUpdateState,
      onIncoming,
    } = this.props

    if (source !== this._childCtx) {
      // bypass iframe' events only
      return
    }

    if (onIncoming && typeof data === 'string') {
      onIncoming(data)
      // handle generic message if fn is present

      return
    }

    if (!data || typeof data !== 'object') {
      // skip all non-object payload
      return
    }

    const { payload, type } = data

    if (!type || isUndef(type) || isUndef(payload)) {
      // skip non type+payload payloads
      return
    }

    if (onIncoming) {
      // eslint-disable-next-line no-console
      if (debug) console.warn('`onIncoming` would be deprecated for messages with type&payload data. Use specific handler insted.')

      onIncoming(data)
    }

    if (onGetState && type === Frame.getAction('getState')) {
      onGetState({ type, payload })
    }

    if (onUpdateState && type === Frame.getAction('updateState')) {
      onUpdateState({ type, payload })
    }

    if (onNotify && type === Frame.getAction('notify')) {
      onNotify({ type, payload })
    }
  }

  postMessage = (message) => {
    if (!message) throw new Error('Could not post message')

    if (this._childCtx) {
      const { targetOrigin } = this.props

      if (targetOrigin) {
        this._childCtx.postMessage(message, targetOrigin)
      } else {
        this._childCtx.postMessage(message)
      }
    }
  }

  postGetState = (message) => {
    this.postMessage({
      type: Frame.actions.get('getState'),
      payload: message,
    })
  }

  postUpdateState = (message) => {
    this.postMessage({
      type: Frame.actions.get('updateState'),
      payload: message,
    })
  }

  postNotify = (message) => {
    this.postMessage({
      type: Frame.actions.get('notify'),
      payload: message,
    })
  }

  render () {
    const {
      className,
      omitOriginParams,
      origin,
      params = {},
      title,
      url: _url,
    } = this.props

    const url = enrichUrlWith(_url, params, Frame.type, origin, omitOriginParams)

    return (
      <iframe
        className={className}
        style={{
          border: 0,
          display: 'flex',
          flex: 1,
          height: '100%',
          width: '100%',
        }}
        ref={this.iframeR}
        src={url}
        title={title}
      />
    )
  }
}
