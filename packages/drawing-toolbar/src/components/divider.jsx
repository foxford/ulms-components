import cn from 'classnames-es'
import React from 'react'

import css from './divider.module.css'

// eslint-disable-next-line import/prefer-default-export
export function Divider({ className, horizontal = false }) {
  return horizontal ? (
    <div className={cn(css.horizontalDivider, className)} />
  ) : (
    <div className={cn(css.verticalDivider, className)} />
  )
}
