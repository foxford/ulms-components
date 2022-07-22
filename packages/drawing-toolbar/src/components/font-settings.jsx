import React from 'react'
import cn from 'classnames-es'

import css from './settings.module.css'

const fontSizes = [18, 24, 32]

export const FontItem = ({
  fontSize, isActive = false, handleClick, innerRef,
}) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
  <div
    ref={innerRef}
    className={cn(css.item, isActive && css.item_active)}
    onClick={() => handleClick(fontSize)}
  >
    <div
      className={css.fontItem}
      style={{ fontSize: `${fontSize}px` }}
    >
      a
    </div>
  </div>
)

export const FontSettings = ({ currentFontSize, handleClick }) => (
  <div className={css.wrapper}>
    <div className={css.row}>
      {fontSizes.map(itemFontSize => (
        <FontItem
          isActive={currentFontSize === itemFontSize}
          fontSize={itemFontSize}
          handleClick={handleClick}
          key={itemFontSize}
        />
      ))}
    </div>
  </div>
)
