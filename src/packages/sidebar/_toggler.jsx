/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames'

import { Icons } from '../icons/icons'
import css from '../sidebar/_toggler.css'

export const Toggler = props => (
  <div
    className={cx(css.root, props.className, { [css.active]: props.toggled })}
    onClick={props.handleClick}
  >
    {props.children || <Icons.Arrow />}
  </div>
)
