import React from 'react'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

const fontSizes = [32, 48, 64]
const testAttributes = ['board-panel-popup-font-size-s', 'board-panel-popup-font-size-m', 'board-panel-popup-font-size-l']

export const FontItem = ({
  active = false,
  dataTestId,
  fontSize,
  handleClick,
  innerRef,
}) => (
  <ToolbarButton
    active={active}
    dataTestId={dataTestId}
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
      {fontSizes.map((itemFontSize, index) => (
        <FontItem
          active={currentFontSize === itemFontSize}
          dataTestId={testAttributes[index]}
          fontSize={itemFontSize}
          handleClick={handleClick}
          key={itemFontSize}
        />
      ))}
    </div>
  </div>
)
