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
}) => (
  <div className={css.wrapper}>
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
    <div
      ref={innerRef}
      className={cn(
        css.button,
        fillWidth && css.button_fillWidth,
        active && css.button_active,
        padded && css.button_padded,
        group && css.group,
      )}
      onClick={onClick}
      onKeyDown={onClick}
      role='button'
      tabIndex='0'
      title={title}
    >
      {children}
    </div>
  </div>
)
