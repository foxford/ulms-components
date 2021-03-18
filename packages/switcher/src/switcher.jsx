/* eslint-disable max-len, react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/control-has-associated-label */
import React from 'react'
import cx from 'classnames-es'

import css from './switcher.module.css'

function Switcher (props) {
  const { on, changeHandler } = props

  return (
    <div className={cx(css.root, { [css.active]: on })} onClick={changeHandler} role='button' tabIndex='0' />
  )
}

export { Switcher }
