import React from 'react'
import cn from 'classnames-es'

import css from './toolbar-button.module.css'

export const ToolbarButton = ({
  onClick,
  innerRef,
  children,
  title = '',
  fillWidth = false,
  padded = false,
  active = false,
  group = false,
  childrenStyle = false,
  round = false,
  size = 'md',
  noSpacing = false,
  rightText = '',
}) => (
  <div className={!noSpacing ? css.wrapper : ''}>
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
    <div
      ref={innerRef}
      className={cn(
        css.button,
        css[`button__size_${size}`],
        (fillWidth || rightText) && css.button_fillWidth,
        active && css.button_active,
        padded && css.button_padded,
        childrenStyle && css.children,
        round && css.round,
        group && css.group,
      )}
      onClick={onClick}
      role='button'
      tabIndex='0'
      title={title}
    >
      <span>{children}</span>
      {rightText && (<span>{rightText}</span>)}
    </div>
  </div>
)
