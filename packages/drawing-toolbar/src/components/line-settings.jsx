import React from 'react'

import IconLine1 from '../icons/line1-tool-icon.svg'
import IconLine2 from '../icons/line2-tool-icon.svg'
import IconLine4 from '../icons/line4-tool-icon.svg'
import IconLine8 from '../icons/line8-tool-icon.svg'
import IconDashedLine1 from '../icons/dashed-line1-tool-icon.svg'
import IconDashedLine2 from '../icons/dashed-line2-tool-icon.svg'
import IconDashedLine4 from '../icons/dashed-line4-tool-icon.svg'
import IconDashedLine8 from '../icons/dashed-line8-tool-icon.svg'

import { IconGroupSettings } from './icon-group-settings'

const lineSizes = {
  ONE: 1,
  TWO: 2,
  FOUR: 4,
  EIGHT: 8,
}

export const LineSettings = ({
  currentSize, handleClick, dashed = false,
}) => {
  const iconsMap = {
    [lineSizes.ONE]: (<IconLine1 />),
    [lineSizes.TWO]: (<IconLine2 />),
    [lineSizes.FOUR]: (<IconLine4 />),
    [lineSizes.EIGHT]: (<IconLine8 />),
  }

  const dashedIconsMap = {
    [lineSizes.ONE]: (<IconDashedLine1 />),
    [lineSizes.TWO]: (<IconDashedLine2 />),
    [lineSizes.FOUR]: (<IconDashedLine4 />),
    [lineSizes.EIGHT]: (<IconDashedLine8 />),
  }

  const iconsSet = [
    {
      dataTestId: 'board-panel-popup-thickness1-button',
      key: lineSizes.ONE,
      icon: iconsMap[lineSizes.ONE],
    },
    {
      dataTestId: 'board-panel-popup-thickness2-button',
      key: lineSizes.TWO,
      icon: iconsMap[lineSizes.TWO],
    },
    {
      dataTestId: 'board-panel-popup-thickness3-button',
      key: lineSizes.FOUR,
      icon: iconsMap[lineSizes.FOUR],
    },
    {
      dataTestId: 'board-panel-popup-thickness4-button',
      key: lineSizes.EIGHT,
      icon: iconsMap[lineSizes.EIGHT],
    },
  ]

  const dashedIconsSet = [
    {
      dataTestId: 'board-panel-popup-thickness1-button',
      key: lineSizes.ONE,
      icon: dashedIconsMap[lineSizes.ONE],
    },
    {
      dataTestId: 'board-panel-popup-thickness2-button',
      key: lineSizes.TWO,
      icon: dashedIconsMap[lineSizes.TWO],
    },
    {
      dataTestId: 'board-panel-popup-thickness3-button',
      key: lineSizes.FOUR,
      icon: dashedIconsMap[lineSizes.FOUR],
    },
    {
      dataTestId: 'board-panel-popup-thickness4-button',
      key: lineSizes.EIGHT,
      icon: dashedIconsMap[lineSizes.EIGHT],
    },
  ]

  return (
    <IconGroupSettings
      iconsSet={dashed ? dashedIconsSet : iconsSet}
      currentSelection={currentSize}
      handleClick={handleClick}
    />
  )
}
