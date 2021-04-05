/* eslint-disable react/prop-types, jsx-a11y/media-has-caption */
import React from 'react'
import cx from 'classnames-es'

import css from './vod-player.module.css'

export const VODPlayer = (props) => {
  const { src, type } = props

  return (
    <video className={cx(css.root)}>
      <source src={src} type={type} />
      Do not supported
    </video>
  )
}
