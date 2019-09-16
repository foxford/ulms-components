/* eslint-disable react/no-multi-comp */
/* eslint-disable react/prop-types */
import React from 'react'
import ReactDom from 'react-dom'
import cx from 'classnames'

import { LocationObjectCursor } from './_location-object-cursor'
import css from './location-viewport.css'

class ObjectPortal extends React.Component {
  render () {
    const { children, node } = this.props
    if (!node) return null

    return ReactDom.createPortal(children, node)
  }
}

// eslint-disable-next-line react/prefer-stateless-function
export class LocationViewport extends React.Component {
  constructor (props) {
    super(props)

    this.__viewportEl = undefined

    this.state = { objects: [] }
  }

  componentDidMount () {
    window.__locationViewportEmitter.addEventListener('broadcast_message.create', (e) => {
      if (!e.detail || !e.detail.data) {
        console.warn('Can not parse broadcast event')

        return
      }

      const { data } = e.detail

      this.setState({ objects: Array.isArray(data) ? data : [data] })
    })
  }

  set viewportEl (el) {
    this.__viewportEl = el
  }

  render () {
    const {
      height,
      id,
      width,
      boundLower,
      boundUpper,
    } = this.props

    const { objects } = this.state

    return (
      <section
        className={cx({ [css.root]: true })}
        id={cx({ [id]: id })}
        style={{ width: width || boundUpper[0], height: height || boundUpper[1] }}
      >
        <div className={css.outer} ref={(el) => { this.viewportEl = el }}>
          <React.Fragment>

            {objects.map(obj => (
              <ObjectPortal key={`id_${obj.id}`} node={this.__viewportEl}>
                <LocationObjectCursor
                  boundLower={boundLower}
                  boundUpper={boundUpper}
                  className={css.object}
                  defaultCursorRotation={43}
                  id={obj.id}
                  key={`${obj.id}`}
                  left={obj.aCoords.tl.x}
                  text={obj.text}
                  top={obj.aCoords.tl.y}
                  viewport={this.__viewportEl}
                />
              </ObjectPortal>
            ))}

          </React.Fragment>
        </div>
      </section>
    )
  }
}
