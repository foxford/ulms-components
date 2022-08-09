import React from 'react'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

const fontSizes = [32, 48, 64]

export const FontItem = ({
  fontSize, active = false, handleClick, innerRef,
}) => (
  <ToolbarButton
    active={active}
    innerRef={innerRef}
    onClick={() => handleClick(fontSize)}
  >
    <div
      className={css.fontItem}
      style={{ fontSize: `${fontSize / 2}px` }}
    >
      a
    </div>
  </ToolbarButton>
)

export const FontSettings = ({ currentFontSize, handleClick }) => (
  <div className={css.wrapper}>
    <div className={css.row}>
      {fontSizes.map(itemFontSize => (
        <FontItem
          active={currentFontSize === itemFontSize}
          fontSize={itemFontSize}
          handleClick={handleClick}
          key={itemFontSize}
        />
      ))}
    </div>
  </div>
)
