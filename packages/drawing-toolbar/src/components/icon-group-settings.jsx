import React from 'react'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

// eslint-disable-next-line import/prefer-default-export
export function IconGroupSettings({
  iconsSet,
  currentSelection,
  handleClick,
  fillWidth,
}) {
  return (
    <div className={css.wrapper}>
      <div className={css.row}>
        {iconsSet.map(({ dataTestId, key, icon, title = '' }) => (
          <ToolbarButton
            active={currentSelection === key}
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
