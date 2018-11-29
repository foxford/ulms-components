/* eslint-disable react/prop-types  */
import React from 'react'
import cn from 'classnames'
import { withState, compose } from 'recompose'

import css from './components.css'

const handleEnlarge = (e, props) => props.setEnlarged(!props.enlarged)

const MakeFullscreen = props => (
  <div className={cn(css.root, { [css.enlarged]: props.enlarged })}>
    {props.children}
    <button onClick={e => handleEnlarge(e, props)}>{!props.enlarged ? 'Enlarge' : 'Shrink'}</button>
  </div>
)

global.MakeFullscreen = compose(withState('enlarged', 'setEnlarged', false))(MakeFullscreen)
