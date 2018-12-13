/* eslint-disable react/prop-types */
import React from 'react'

import Arrow from './images/arrow.svg'
import Bullet from './images/bullet.svg'
import Feed from './images/feed.svg'
import Slides from './images/slides.svg'
import Video from './images/video.svg'

import css from './icons.css'

const icons = new Map([
  ['arrow', Arrow],
  ['bullet', Bullet],
  ['feed', Feed],
  ['slides', Slides],
  ['video', Video],
])

const sizeValue = size => css[`size${size.toUpperCase()}`]

const Icons = (props) => {
  const IconFn = typeof props.fn === 'function'
    ? props.fn()
    : null

  const Icon = props.name
    ? icons.get(props.name)
    : IconFn

  const style = {}
  if (props.width || props.size) style.width = props.width || sizeValue(props.size)
  if (props.height || props.size) style.height = props.height || sizeValue(props.size)

  return (
    <div className={css.root} style={style}>
      {props.children || (Icon === null ? Icon : <Icon />)}
    </div>
  )
}

Icons.Arrow = Arrow
Icons.Bullet = Bullet
Icons.Feed = Feed
Icons.Slides = Slides
Icons.Video = Video

export { Icons }
