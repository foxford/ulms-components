/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import { Icons } from '../../../packages/icons/index'

import css from './_toggler.css'

export const Toggler = ({
  children,
  className,
  handleClick,
  toggled,
}) => (
  <div
    className={cx(css.root, className, { [css.active]: toggled })}
    onClick={handleClick}
  >
    {children || <Icons.Arrow />}
  </div>
)
