import React from 'react'
import cn from 'classnames-es'
import Floater from 'react-floater'
import Slider from 'rc-slider/lib/Slider'

export const GroupEraser = ({
  css,
  eraserWidth,
  handleChange,
  opened,
}) => (
  <Floater
    component={() => (
      <div className={cn(css.popover, css.floater)}>
        <div>
          <div>Чувствительность</div>
          <br />
          <Slider
            min={1}
            max={12}
            value={eraserWidth}
            onChange={value => handleChange({ eraserWidth: value })}
          />
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
    open={opened === 'group-eraser'}
    target={`.${css.root} .group-eraser`}
  />
)
