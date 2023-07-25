/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import { fCalcIntermediateCoords, rangeBound, rotation } from './_utils'

import CursorIcon from './cursor.svg'

import css from './location-viewport.module.css'

const getPosition = a => typeof a === 'number' ? `${a}px` : a

const isOutOfRange = (a, high, low = 0) => a < low || a > high

const adjustTop = (top, height) => { if (!height) { throw new TypeError('Absent height') } else { return height - top } }

// eslint-disable-next-line react/prefer-stateless-function
export class LocationObjectCursor extends React.Component {
  constructor (props) {
    super(props)

    this.ref = React.createRef()
    this.cursorSize = 20
  }

  componentDidMount () {
    const style = getComputedStyle(this.ref.current)

    this.cursorSize = parseInt(style.getPropertyValue('--location-viewport-object-size'))
  }

  shouldComponentUpdate (nextProps) {
    const { top, left } = this.props

    if (nextProps.left !== left || nextProps.top !== top) return 1

    return 0
  }

  render () {
    const {
      boundLower,
      boundUpper,
      className,
      defaultCursorRotation,
      left,
      opts,
      style,
      text,
    } = this.props
    let { top } = this.props

    if (!opts.inverted) { top = adjustTop(top, opts.sizeX) }
    // adjust top coordinate for regular coordinate plane

    if (boundUpper.length !== 2 || boundLower.length !== 2) {
      // eslint-disable-next-line no-console
      console.error('Wrong bound format')

      return undefined
    }

    const [xLo, yLo] = boundLower
    const [xUp, yUp] = boundUpper
    const [xC, yC] = [xLo + (xUp - xLo) / 2, yLo + (yUp - yLo) / 2]

    const x = rangeBound(left, xUp, xLo)
    const y = rangeBound(top, yUp, yLo)
    // get coordinates according the bound

    const [xi, yi] = fCalcIntermediateCoords([x, y], [xC, yC])([xLo, yLo], [xUp, yUp])

    let rot = 0
    let transform
    let textPosition = 'auto auto -12px 12px'

    if (isOutOfRange(left, Math.max(xUp - this.cursorSize, 0), xLo)
      || isOutOfRange(top, Math.max(yUp - this.cursorSize, 0), yLo)
    ) {
      rot = rotation([xi, yi], [xC, yC], {
        defRotation: defaultCursorRotation,
        invert: !opts.inverted ? 1 : -1,
      })

      transform = `rotate(${Math.round(rot)}deg)`

      if (text) {
        if (rot > 225) {
          textPosition = '-30px auto auto 12px'
        } else if (rot > 135) {
          textPosition = '-26px 40px auto auto'
        } else if (rot > 46) {
          textPosition = 'auto 30px -12px auto'
        }
      }
    }

    const styles = {
      left: xi,
      top: !opts.inverted ? adjustTop(yi, opts.sizeX) : yi,
      // adjust top for CSS styles
    }

    return (
      <div
        className={cx(css.cursor, className)}
        style={{
          ...style,
          transform: `translate(${getPosition(styles.left)}, ${getPosition(styles.top)})`,
        }}
        ref={this.ref}
      >
        <div
          className={css.cursorItem}
          style={{ transform }}
        >
          <CursorIcon />
        </div>
        {text && (
          <div
            className={css.cursorText}
            style={{ inset: textPosition }}
          >
            {text}
          </div>
        )}
      </div>
    )
  }
}

LocationObjectCursor.defaultProps = {
  boundLower: [0, 0],
  boundUpper: [],
  defaultCursorRotation: 0, // deg
  opts: { inverted: true }, // or {{ inverted: false, sizeX: Number }}
  style: {},
}

