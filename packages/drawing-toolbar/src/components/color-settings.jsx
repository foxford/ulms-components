import React from 'react'
import cn from 'classnames-es'

import { HEXtoRGB } from '../utils'

import css from './settings.module.css'

const colors = [
  [
    '#000000',
    '#ABB8C3',
    '#FFFFFF',
    '#A45C3D',
  ],
  [
    '#FFCE03',
    '#F94B28',
    '#7FC92E',
    '#1A96F6',
  ],
  [
    '#FF9900',
    '#FFADDA',
    '#A30BF8',
    '#9DF1F7',
  ],
]

export const ColorItem = ({
  webColor, isActive = false, handleClick, innerRef,
}) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
  <div
    ref={innerRef}
    className={cn(css.item, isActive && css.item_active)}
    onClick={() => handleClick(HEXtoRGB(webColor))}
  >
    <div
      className={css.colorCircle}
      style={{ backgroundColor: webColor, border: webColor.toLowerCase() === '#ffffff' ? '1px solid #B8B8B8' : 'none' }}
    />
  </div>
)

export const ColorSettings = ({
  currentColor, handleClick,
}) => (
  <div className={css.wrapper}>
    {colors.map((colorsRow, i) => (
      <div className={css.row} key={i}>
        {colorsRow.map(color => (
          <ColorItem
            isActive={currentColor === color.toLowerCase()}
            webColor={color}
            handleClick={handleClick}
            key={color}
          />
        ))}
      </div>
    ))}
  </div>
)
