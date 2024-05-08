import React from 'react'

import { LocationViewport } from './location-viewport'

window.__locationViewportEmitter = LocationViewport.emitter()

class LocationEmitter extends React.Component {
  constructor(props) {
    super(props)

    this._emitter = props.emitter

    this.__emitterEl = undefined
    this.__isDispatching = undefined
  }

  componentDidMount() {
    const { interval, opts } = this.props

    if (this.__emitterEl) {
      this.__emitterEl.addEventListener('mousemove', (event) => {
        if (this.__isDispatching) return

        this.__isDispatching = true

        const xy = { x: event.layerX, y: event.layerY }

        setTimeout(() => {
          if (opts) {
            xy.x -= opts.vptCoords.tl.x
            xy.y -= opts.vptCoords.tl.y
          }

          this._emitter.dispatchEvent(
            new CustomEvent('broadcast_message.create', {
              detail: {
                data: {
                  id: 1,
                  aCoords: { tl: xy },
                  text: 'Alan Mathison Turing',
                },
              },
            }),
          )

          this.__isDispatching = false
        }, interval || 200)
      })
    }
  }

  get _emitter() {
    return this.__eventTarget
  }

  set _emitter(eventTarget) {
    const _et = eventTarget

    if (!_et) throw new TypeError('Emitter is absent')
    this.__eventTarget = _et
  }

  render() {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <div
        style={{ width: '100%', height: '100%' }}
        ref={(element) => {
          this.__emitterEl = element
        }}
      />
    )
  }
}

export default {
  title: 'organisms/LocationViewport',
  component: LocationViewport,
}

export const withEmitter = function withEmitter() {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          border: '1px solid rebeccapurple',
          boxSizing: 'content-box',
          width: '300px',
          height: '300px',
        }}
      >
        <LocationViewport
          boundUpper={[300, 300]}
          id="locationViewport"
          emitter={window.__locationViewportEmitter}
          // opts={{ inverted: false, sizeX: 300 }}
        />
      </div>
      <div
        style={{
          border: '1px solid orange',
          boxSizing: 'content-box',
          top: -15,
          left: -15,
          position: 'absolute',
          width: '330px',
          height: '330px',
        }}
      >
        <LocationEmitter
          emitter={window.__locationViewportEmitter}
          interval={100}
          opts={{ vptCoords: { tl: { x: 15, y: 15 } } }}
        />
      </div>
    </div>
  )
}
withEmitter.storyName = 'with emitter'
