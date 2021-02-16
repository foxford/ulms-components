/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import css from './switcher.module.css'

function Switcher (props) {
  const { on, changeHandler } = props

  return (
    <div className={cx(css.root, { [css.active]: on })} onClick={changeHandler} />
  )
}

export { Switcher }
