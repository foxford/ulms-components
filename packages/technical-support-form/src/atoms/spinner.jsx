import React, { memo } from 'react'
import cn from 'classnames-es'

import css from './spinner.module.css'

function SpinnerComponent(props) {
  const { fullscreen = true } = props

  return <div className={cn(css.root, { [css.fullscreen]: fullscreen })} />
}

const Spinner = memo(SpinnerComponent)

export default Spinner
