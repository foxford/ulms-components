import React from 'react'
import cn from 'classnames-es'

import css from './toolbar-button.module.css'

// eslint-disable-next-line import/prefer-default-export
export function ToolbarButton({
  active = false,
  children,
  dataTestId,
  fillWidth = false,
  group = false,
  groupColor = '#fff',
  innerRef,
  onClick,
  padded = false,
  title = '',
  style = {},
}) {
  return (
    <div
      ref={innerRef}
      className={cn(
        css.button,
        fillWidth && css.button_fillWidth,
        active && css.button_active,
        padded && css.button_padded,
      )}
      data-testid={dataTestId}
      onClick={onClick}
      role="button"
      tabIndex="0"
      title={title}
      style={style}
    >
      {group && (
        <div className={css.colorIndicatorWrapper}>
          <div
            className={css.colorIndicator}
            style={{
              backgroundColor: groupColor,
              borderColor:
                groupColor === '#FFFFFF'
                  ? 'rgba(37, 38, 44, 0.55)'
                  : groupColor,
            }}
          />
        </div>
      )}
      {children}
    </div>
  )
}
