/* eslint-disable react/prop-types  */
import React from 'react'
import cx from 'classnames'
import { withState, compose } from 'recompose'

import css from './components.css'

const handleEnlarge = (e, props) => props.setEnlarged(!props.enlarged)

const inner = props => !props.wrap
  ? props.children
  : <div className='inner'>{props.children}</div>

class MakeFullscreen extends React.Component {
  componentDidMount () {
    this.rootElement.addEventListener('keydown', this.onKeydown)
  }

  componentWillUnmount () {
    this.rootElement.removeEventListener('keydown', this.onKeydown)
  }

  onKeydown = (e) => {
    if (e.keyCode === 27) handleEnlarge(e, this.props)
  }

  render () {
    const { props } = this

    return (
      <div
        className={cx(css.root, { [css.enlarged]: props.enlarged })}
        ref={(e) => { this.rootElement = e }}
      >
        {inner(props)}
        <button onClick={e => handleEnlarge(e, props)}>{!props.enlarged ? 'Enlarge' : 'Shrink'}</button>
      </div>
    )
  }
}

global.MakeFullscreen = compose(withState('enlarged', 'setEnlarged', false))(MakeFullscreen)
