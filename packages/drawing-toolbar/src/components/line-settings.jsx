import React from 'react'
import cn from 'classnames-es'

import css from './settings.module.css'

const lineSizes = [
  1,
  2,
  4,
  8,
]

export const LineItem = ({
  size, isActive = false, handleClick, innerRef,
}) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
  <div
    ref={innerRef}
    className={cn(css.item, isActive && css.item_active)}
    onClick={() => handleClick(size)}
  >
    <div
      className={css.lineItem}
      style={{ borderBottom: `${size}px solid #4A4A4A` }}
    />
  </div>
)

export const LineSettings = ({ currentSize, handleClick }) => (
  <div className={css.wrapper}>
    <div className={css.row}>
      {lineSizes.map(itemSize => (
        <LineItem
          isActive={currentSize === itemSize}
          size={itemSize}
          handleClick={handleClick}
          key={itemSize}
        />
      ))}
    </div>
  </div>
)
