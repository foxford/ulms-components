/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import Arrow from './images/arrow.svg'
import ArrowLeft from './images/arrow-left.svg'
import ArrowRight from './images/arrow-right.svg'
import Bullet from './images/bullet.svg'
import CommentOutline from './images/comment-outline.svg'
import Compress from './images/compress.svg'
import CopyOutline from './images/copy-outline.svg'
import CursorPointer from './images/cursor-pointer.svg'
import Edit from './images/edit.svg'
import Expand from './images/expand.svg'
import Feed from './images/feed.svg'
import Lines from './images/lines.svg'
import LockOutline from './images/lock-outline.svg'
import ShapeCircle from './images/shape-circle.svg'
import ShapeSquare from './images/shape-square.svg'
import ShapeTrinagle from './images/shape-triangle.svg'
import Slides from './images/slides.svg'
import TrashOutline from './images/trash-outline.svg'
import Video from './images/video.svg'

import css from './icons.module.css'

const icons = new Map([
  ['arrow-left', ArrowLeft],
  ['arrow-right', ArrowRight],
  ['arrow', Arrow],
  ['bullet', Bullet],
  ['comment-outline', CommentOutline],
  ['compress', Compress],
  ['copy-outline', CopyOutline],
  ['cursor-pointer', CursorPointer],
  ['edit', Edit],
  ['expand', Expand],
  ['feed', Feed],
  ['lines', Lines],
  ['lock-outline', LockOutline],
  ['shape-circle', ShapeCircle],
  ['shape-square', ShapeSquare],
  ['shape-triangle', ShapeTrinagle],
  ['slides', Slides],
  ['trash-outline', TrashOutline],
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
    <div className={cx(css.root, css[name])} style={style}>
      {children || (Icon === null ? Icon : <Icon />)}
    </div>
  )
}

Icons.Arrow = Arrow
Icons.ArrowLeft = ArrowLeft
Icons.ArrowRight = ArrowRight
Icons.Bullet = Bullet
Icons.CommentOutline = CommentOutline
Icons.Compress = Compress
Icons.CopyOutline = CopyOutline
Icons.CursorPointer = CursorPointer
Icons.Edit = Edit
Icons.Expand = Expand
Icons.Feed = Feed
Icons.Lines = Lines
Icons.LockOutline = LockOutline
Icons.ShapeCircle = ShapeCircle
Icons.ShapeSquare = ShapeSquare
Icons.ShapeTrinagle = ShapeTrinagle
Icons.Slides = Slides
Icons.TrashOutline = TrashOutline
Icons.Video = Video

export { Icons }
