import cn from 'classnames-es'
import React from 'react'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

// eslint-disable-next-line import/prefer-default-export
export function IconGroupSettings({
  iconsSet,
  compact,
  currentSelection,
  gap = 4,
  handleClick,
  fillWidth,
}) {
  return (
    <div className={css.wrapper}>
      <div className={cn(css.row, css[`gap-${gap}`], compact && css.compact)}>
        {iconsSet.map(({ dataTestId, key, icon, title = '' }) => (
          <ToolbarButton
            active={currentSelection === key}
            compact={compact}
            dataTestId={dataTestId}
            onClick={() => handleClick(key)}
            title={title}
            fillWidth={fillWidth}
            key={key}
          >
            {icon}
          </ToolbarButton>
        ))}
      </div>
    </div>
  )
}
