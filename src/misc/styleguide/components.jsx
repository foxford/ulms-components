/* eslint-disable react/prop-types  */
import React from 'react'
import cn from 'classnames'
import { withState, compose } from 'recompose'

import css from './components.css'

const handleEnlarge = (e, props) => props.setEnlarged(!props.enlarged)

const inner = props => !props.wrap
  ? props.children
  : <div className='inner'>{props.children}</div>

const MakeFullscreen = props => (
  <div className={cn(css.root, { [css.enlarged]: props.enlarged })}>
    {inner(props)}
    <button onClick={e => handleEnlarge(e, props)}>{!props.enlarged ? 'Enlarge' : 'Shrink'}</button>
  </div>
)

global.MakeFullscreen = compose(withState('enlarged', 'setEnlarged', false))(MakeFullscreen)
