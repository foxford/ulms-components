/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames'

import css from './switcher.css'

function Switcher (props) {
  const { on, changeHandler } = props

  return (
    <div className={cx(css.root, { [css.active]: on })} onClick={changeHandler} />
  )
}

export { Switcher }
