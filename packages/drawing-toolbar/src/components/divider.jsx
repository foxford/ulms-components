import React from 'react'

import css from './divider.module.css'

export const Divider = ({ horizontal = false }) => (
  horizontal
    ? <div className={css.horizontalDivider} />
    : <div className={css.verticalDivider} />
)
