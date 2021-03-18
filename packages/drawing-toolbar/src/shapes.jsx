import React from 'react'
import cn from 'classnames-es'
import { Icons } from '@ulms/ui-icons'

import css from './shapes.module.css'

export const Shapes = (props) => {
  const {
    className, solid, shape = 'circle',
  } = props

  return (
    <div className={cn({
      [className]: true,
      [css.root]: true,
      [css.shape]: true,
      [css.shapeSolid]: solid,
    })}
    >
      <div className={css.inner}>
        <Icons name={`shape-${shape}`} />
      </div>
    </div>
  )
}
