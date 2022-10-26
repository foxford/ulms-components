import React, { useMemo } from 'react'
import cn from 'classnames-es'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

const colors = [
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
  color, active = false, handleClick, innerRef,
}) => (
  <ToolbarButton
    active={active}
    innerRef={innerRef}
    onClick={() => handleClick(color)}
  >
    <div
      className={css.colorCircle}
      style={{ backgroundColor: color, border: color.toLowerCase() === '#ffffff' ? '1px solid #B8B8B8' : 'none' }}
    />
  </ToolbarButton>
)

export const ColorSettings = ({
  currentColor, handleClick, rows = 3,
}) => {
  const splitColors = useMemo(() => {
    const chunkSize = Math.max(colors.length / rows, 1)
    const result = []

    for (let i = 0; i < colors.length; i += chunkSize) {
      result.push(colors.slice(i, i + chunkSize))
    }

    return result
  }, [rows])

  return (
    <div className={css.wrapper}>
      {splitColors.map((colorsRow, i) => (
        <div className={cn(css.row, css.colorRow)} key={i}>
          {colorsRow.map(color => (
            <ColorItem
              active={currentColor.toLowerCase() === color.toLowerCase()}
              color={color}
              handleClick={handleClick}
              key={color}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
