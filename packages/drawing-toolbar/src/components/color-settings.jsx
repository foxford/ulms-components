import React from 'react'
import cn from 'classnames-es'

import { ToolbarButton } from './toolbar-button'

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
const colorsHorizontal = [
  '#000000',
  '#ABB8C3',
  '#FFFFFF',
  '#A45C3D',
  '#FFCE03',
  '#F94B28',
  '#7FC92E',
  '#1A96F6',
  '#FF9900',
  '#FFADDA',
  '#A30BF8',
  '#9DF1F7',
]

export const ColorItem = ({
  color, active = false, handleClick, innerRef, extended = false, horizontal = false,
}) => (
  <ToolbarButton
    active={active}
    innerRef={innerRef}
    onClick={() => handleClick(color)}
    childrenStyle={horizontal}
    noSpacing={horizontal}
    round={horizontal}
  >
    <div
      className={cn(css.colorCircle, extended && css.colorCircle_extended)}
      style={{ backgroundColor: color, border: color.toLowerCase() === '#ffffff' ? '1px solid #B8B8B8' : 'none' }}
    />
  </ToolbarButton>
)

export const ColorSettings = ({
  currentColor, handleClick, horizontal = false, extended = false,
}) => (
  <div className={css.wrapper}>
    {horizontal
      ? (
        <div className={css.row}>
          {colorsHorizontal.map(color => (
            <ColorItem
              active={currentColor.toLowerCase() === color.toLowerCase()}
              color={color}
              handleClick={handleClick}
              key={color}
              extended={extended}
              horizontal={horizontal}
            />
          ))}
        </div>
      )
      : colors.map((colorsRow, i) => (
        <div className={css.row} key={i}>
          {colorsRow.map(color => (
            <ColorItem
              active={currentColor.toLowerCase() === color.toLowerCase()}
              color={color}
              handleClick={handleClick}
              key={color}
              extended={extended}
            />
          ))}
        </div>
      ))}
  </div>
)
