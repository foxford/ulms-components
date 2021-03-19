/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'
import Popper from 'popper.js'
import { Icons } from '@ulms/ui-icons'

import { fCalcIntermediateCoords, rangeBound, rotation } from './_utils'
import css from './location-viewport.module.css'

const getPosition = a => typeof a === 'number' ? `${a}px` : a

const isOutOfRange = (a, high, low = 0) => a < low || a > high

const adjustTop = (top, height) => { if (!height) { throw new TypeError('Absent height') } else { return height - top } }

// eslint-disable-next-line react/prefer-stateless-function
export class LocationObjectCursor extends React.Component {
  constructor (props) {
    super(props)

    this.__descEl = undefined
    this.__referenceEl = undefined
    this.__popper = undefined
  }

  componentDidMount () {
    const { viewport: boundariesElement } = this.props

    this.__popper = new Popper(
      this.__referenceEl,
      this.__descEl,
      {
        placement: 'right',
        modifiers: {
          preventOverflow: {
            boundariesElement,
          },
        },
      }
    )
  }

  shouldComponentUpdate (nextProps) {
    const { top, left } = this.props

    if (nextProps.left !== left || nextProps.top !== top) return 1

    return 0
  }

  set _element (element) {
    const { onAccessElement, id } = this.props

    this.__descEl = element
    onAccessElement && onAccessElement([id, element])
  }

  get _element () {
    return this.__descEl
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

    if (isOutOfRange(left, xUp, xLo) || isOutOfRange(top, yUp, yLo)) {
      rot = rotation([xi, yi], [xC, yC], {
        defRotation: defaultCursorRotation,
        invert: !opts.inverted ? 1 : -1,
      })

      transform = `rotate(${Math.round(rot)}deg)`
    }

    const styles = {
      left: xi,
      top: !opts.inverted ? adjustTop(yi, opts.sizeX) : yi,
      // adjust top for CSS styles
    }

    return (
      <div
        className={cx({
          [className]: className,
          [css.cursor]: true,
        })}
        style={{
          transform: `translate(${getPosition(styles.left)}, ${getPosition(styles.top)})`,
        }}
        ref={(el) => { this.__referenceEl = el }}
      >
        <span
          className={css.cursorItem}
          style={{ transform, color: style.background || '#000' }}
        >
          <Icons size='xs' name='cursor-pointer' />
        </span>
        <span
          ref={(el) => { this._element = el }}
          className={css.cursorText}
          style={style}
        >
          {text}
        </span>
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

