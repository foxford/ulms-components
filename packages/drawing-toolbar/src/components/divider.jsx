import React from 'react'
import cn from 'classnames-es'

import css from './divider.module.css'

export const Divider = ({ horizontal = false, noBorder = false }) => (
  horizontal
    ? <div className={cn(css.horizontalDivider, noBorder && css.noBorder)} />
    : <div className={cn(css.verticalDivider, noBorder && css.noBorder)} />
)
