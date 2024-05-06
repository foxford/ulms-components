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

export function ColorItem({
  active = false,
  color,
  dataTestId,
  handleClick,
  innerRef,
}) {
  return (
    <ToolbarButton
      active={active}
      dataTestId={dataTestId}
      innerRef={innerRef}
      onClick={() => handleClick(color)}
      style={{ padding: '10px' }}
    >
      <div
        className={css.colorCircle}
        style={{
          backgroundColor: color,
          border:
            color.toLowerCase() === '#ffffff' ? '1px solid #B8B8B8' : 'none',
        }}
      />
    </ToolbarButton>
  )
}

export function ColorSettings({ currentColor, handleClick, rows = 3 }) {
  const splitColors = useMemo(() => {
    const chunkSize = Math.max(colors.length / rows, 1)
    const result = []

    for (let index = 0; index < colors.length; index += chunkSize) {
      result.push(colors.slice(index, index + chunkSize))
    }

    return result
  }, [rows])

  return (
    <div className={css.wrapper}>
      {splitColors.map((colorsRow, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className={cn(css.row, css.colorRow)} key={index}>
          {colorsRow.map((color) => (
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
