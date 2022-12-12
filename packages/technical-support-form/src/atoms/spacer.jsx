import React, { memo } from 'react'
import cn from 'classnames-es'

import css from './spacer.module.css'

const Spacer = memo(({ h }) => (
  <div className={cn(h && css[`h${h}`])} />
))

export default Spacer
