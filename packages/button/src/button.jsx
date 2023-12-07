/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import css from './button.module.css'

function Button (props) {
  const {
    active, children, className, dataTestId, disabled, onClick, title,
  } = props

  return (
    <button
      className={cx(css.root, className, { [css.active]: active })}
      data-testid={dataTestId}
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
