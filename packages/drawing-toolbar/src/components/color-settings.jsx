import React, { useMemo } from 'react'
import cn from 'classnames-es'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

const colors = [
  { dataTestId: 'board-panel-popup-color-black-button', value: '#000000' },
  { dataTestId: 'board-panel-popup-color-gray-button', value: '#ABB8C3' },
  { dataTestId: 'board-panel-popup-color-white-button', value: '#FFFFFF' },
  { dataTestId: 'board-panel-popup-color-brown-button', value: '#A45C3D' },
  { dataTestId: 'board-panel-popup-color-yellow-button', value: '#FFCE03' },
  { dataTestId: 'board-panel-popup-color-red-button', value: '#F94B28' },
  { dataTestId: 'board-panel-popup-color-green-button', value: '#7FC92E' },
  { dataTestId: 'board-panel-popup-color-blue-button', value: '#1A96F6' },
  { dataTestId: 'board-panel-popup-color-orange-button', value: '#FF9900' },
  { dataTestId: 'board-panel-popup-color-pink-button', value: '#FFADDA' },
  { dataTestId: 'board-panel-popup-color-violet-button', value: '#A30BF8' },
  { dataTestId: 'board-panel-popup-color-aquamarine-button', value: '#9DF1F7' },
]

export const ColorItem = ({
  active = false,
  color,
  dataTestId,
  handleClick,
  innerRef,
}) => (
  <ToolbarButton
    active={active}
    dataTestId={dataTestId}
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
              active={currentColor.toLowerCase() === color.value.toLowerCase()}
              color={color.value}
              dataTestId={color.dataTestId}
              handleClick={handleClick}
              key={color.value}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
