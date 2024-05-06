import React from 'react'

import css from './divider.module.css'

// eslint-disable-next-line import/prefer-default-export
export function Divider({ horizontal = false }) {
  return horizontal ? (
    <div className={css.horizontalDivider} />
  ) : (
    <div className={css.verticalDivider} />
  )
}
