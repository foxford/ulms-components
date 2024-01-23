import React from 'react'

import IconText32 from '../icons/text-settings-32-icon.svg'
import IconText48 from '../icons/text-settings-48-icon.svg'
import IconText64 from '../icons/text-settings-64-icon.svg'

import { ToolbarButton } from './toolbar-button'

import css from './settings.module.css'

const fontSizes = [32, 48, 64]
const fontIcons = {
  [fontSizes[0]]: <IconText32 />,
  [fontSizes[1]]: <IconText48 />,
  [fontSizes[2]]: <IconText64 />,
}

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
    {fontIcons[fontSize]}
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
