import React from 'react'
import cn from 'classnames-es'
import Floater from 'react-floater'
import Slider from 'rc-slider/lib/Slider'
import { penToolModeEnum, shapeToolModeEnum, toolEnum } from '@ulms/ui-drawing'

import { toCSSColor } from './utils'
import iconToolElementEraser from './icons/icon-tool-element-eraser.svg'
import iconToolGrid from './icons/icon-tool-grid.svg'
import iconToolImage from './icons/icon-tool-image.svg'
import iconToolFitIn from './icons/icon-tool-fit-in.svg'
import iconToolFitOut from './icons/icon-tool-fit-out.svg'
import iconToolMarker from './icons/icon-tool-marker.svg'
import iconToolPan from './icons/icon-tool-pan.svg'
import iconToolPencil from './icons/icon-tool-pencil.svg'
import iconToolLine from './icons/icon-tool-line.svg'
import iconToolSelect from './icons/icon-tool-select.svg'
import iconToolText from './icons/icon-tool-text.svg'
import iconToolZoomIn from './icons/icon-tool-zoom-in.svg'
import iconToolZoomOut from './icons/icon-tool-zoom-out.svg'
import { Shapes } from './shapes'

const shapeToolModeList = [
  {
    icon: 'square',
    mode: shapeToolModeEnum.RECT,
    solid: false,
  },
  {
    icon: 'square',
    mode: shapeToolModeEnum.RECT_SOLID,
    solid: true,
  },
  {
    icon: 'circle',
    mode: shapeToolModeEnum.CIRCLE,
    solid: false,
  },
  {
    icon: 'circle',
    mode: shapeToolModeEnum.CIRCLE_SOLID,
    solid: true,
  },
  {
    icon: 'triangle',
    mode: shapeToolModeEnum.TRIANGLE,
    solid: false,
  },
  {
    icon: 'triangle',
    mode: shapeToolModeEnum.TRIANGLE_SOLID,
    solid: true,
  },
]

export const GroupShape = ({
  brushColor,
  css,
  handleChange,
  opened,
  shapeMode,
  tool,
}) => (
  <Floater
    component={() => (
      <div
        className={css.popover}
        style={{ color: toCSSColor(brushColor) }}
      >
        <div className={css.row}>
          {
            shapeToolModeList.map(({
              icon, mode, solid,
            }, index) => (
              <div
                className={cn(css.button, { [css.active]: shapeMode === mode && tool === toolEnum.SHAPE })}
                key={index}
                onClick={() => handleChange({ shapeMode: mode, tool: toolEnum.SHAPE })}
              >
                <Shapes shape={icon} solid={solid} />
              </div>
            ))
          }
        </div>
      </div>
    )}
    placement='right-start'
    hideArrow
    styles={{
      floater: {
        filter: 'none',
      },
    }}
    open={opened === 'group-shape'}
    target={`.${css.root} .group-shape`}
  />
)
