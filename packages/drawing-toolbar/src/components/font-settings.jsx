import React from 'react'

import IconText32 from '../icons/text-settings-32-icon.svg'
import IconText48 from '../icons/text-settings-48-icon.svg'
import IconText64 from '../icons/text-settings-64-icon.svg'

import { IconGroupSettings } from './icon-group-settings'

const fontSizes = [32, 48, 64]
const testAttributes = {
  [fontSizes[0]]: 'board-panel-popup-font-size-s',
  [fontSizes[1]]: 'board-panel-popup-font-size-m',
  [fontSizes[2]]: 'board-panel-popup-font-size-l',
}

// eslint-disable-next-line import/prefer-default-export
export function FontSettings({ currentFontSize, handleClick }) {
  const fontIcons = {
    [fontSizes[0]]: <IconText32 />,
    [fontSizes[1]]: <IconText48 />,
    [fontSizes[2]]: <IconText64 />,
  }

  const iconsSet = fontSizes.map((size) => ({
    dataTestId: testAttributes[size],
    key: size,
    icon: fontIcons[size],
  }))

  return (
    <IconGroupSettings
      iconsSet={iconsSet}
      currentSelection={currentFontSize}
      handleClick={handleClick}
    />
  )
}
