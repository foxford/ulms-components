import React from 'react'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

export const IconGroupSettings = ({
  iconsSet, currentSelection, handleClick, fillWidth,
}) => (
  <div className={css.wrapper}>
    <div className={css.row}>
      {iconsSet.map(({
        dataTestId, key, icon, title = '',
      }) => (
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
