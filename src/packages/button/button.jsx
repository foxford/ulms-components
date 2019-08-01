/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames'

import css from './button.css'

function Button (props) {
  const {
    active, children, className, disabled, onClick, title,
  } = props

  return (
    <button
      className={cx(css.root, className, { [css.active]: active })}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type='button'
    >
      {children}
    </button>
  )
}

export { Button }
