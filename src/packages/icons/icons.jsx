/* eslint-disable react/prop-types */
import React from 'react'

import Arrow from './images/arrow.svg'
import ArrowLeft from './images/arrow-left.svg'
import ArrowRight from './images/arrow-right.svg'
import Bullet from './images/bullet.svg'
import Feed from './images/feed.svg'
import Slides from './images/slides.svg'
import Video from './images/video.svg'

import css from './icons.css'

const icons = new Map([
  ['arrow', Arrow],
  ['arrow-left', ArrowLeft],
  ['arrow-right', ArrowRight],
  ['bullet', Bullet],
  ['feed', Feed],
  ['slides', Slides],
  ['video', Video],
])

const sizeValue = size => css[`size${size.toUpperCase()}`]

const Icons = ({
  children,
  fn,
  height,
  name,
  size,
  width,
}) => {
  const IconFn = typeof fn === 'function'
    ? fn()
    : null

  const Icon = name
    ? icons.get(name)
    : IconFn

  const style = {}
  if (width || size) style.width = width || sizeValue(size)
  if (height || size) style.height = height || sizeValue(size)

  return (
    <div className={css.root} style={style}>
      {children || (Icon === null ? Icon : <Icon />)}
    </div>
  )
}

Icons.Arrow = Arrow
Icons.ArrowLeft = ArrowLeft
Icons.ArrowRight = ArrowRight
Icons.Bullet = Bullet
Icons.Feed = Feed
Icons.Slides = Slides
Icons.Video = Video

export { Icons }
