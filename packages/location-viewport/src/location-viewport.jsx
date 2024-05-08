/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'
import EventTarget from '@ungap/event-target'

import { LocationObjectCursor } from './_location-object-cursor'
import { ObjectPortal } from './_object-portal'
import css from './location-viewport.module.css'

const Emitter = (...argv) => new EventTarget(...argv)

// eslint-disable-next-line react/prefer-stateless-function, import/prefer-default-export
export class LocationViewport extends React.PureComponent {
  static emitter(...argv) {
    return Emitter(...argv)
  }

  constructor(props) {
    super(props)

    this.__viewportEl = undefined

    /* eslint-disable-next-line react/state-in-constructor */
    this.state = { objects: props.cursors || [] }
  }

  componentDidMount() {
    const { emitter } = this.props

    if (emitter) {
      emitter.addEventListener('broadcast_message.create', (event) => {
        if (!event.detail || !event.detail.data) {
          // eslint-disable-next-line no-console
          console.warn('Can not parse broadcast event')

          return
        }

        const { data } = event.detail

        const objects = Array.isArray(data) ? data : [data]

        this.setState({ objects })
      })
    }
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  set viewportEl(element) {
    this.__viewportEl = element
  }

  render() {
    const { boundLower, boundUpper, className, height, id, width } = this.props

    const { objects } = this.state

    const viewportWidth = width || boundUpper[0]
    const viewportHeight = height || boundUpper[1]

    return (
      <section
        className={cx({ [css.root]: true, [className]: className })}
        id={cx({ [id]: id })}
        style={{
          position: 'absolute',
          width: viewportWidth,
          height: viewportHeight,
        }}
      >
        <div
          className={css.outer}
          ref={(element) => {
            // eslint-disable-next-line react/no-unused-class-component-methods
            this.viewportEl = element
          }}
        >
          {objects.map((object) => {
            const { x, y } = object.aCoords.tl

            return (
              <ObjectPortal key={`id_${object.id}`} node={this.__viewportEl}>
                <LocationObjectCursor
                  boundLower={boundLower}
                  boundUpper={boundUpper}
                  className={css.object}
                  defaultCursorRotation={45}
                  id={object.id}
                  left={x}
                  style={object.style}
                  text={object.text}
                  top={y}
                  viewport={this.__viewportEl}
                />
              </ObjectPortal>
            )
          })}
        </div>
      </section>
    )
  }
}
