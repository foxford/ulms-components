/* eslint-disable jsx-a11y/click-events-have-key-events */
// TODO: rewrite with useCallback
import React from 'react'
import cn from 'classnames-es'
import Floater from 'react-floater'
import Slider from 'rc-slider/lib/Slider'
import { FormattedMessage, injectIntl } from 'react-intl'
import { penToolModeEnum, toolEnum } from '@ulms/ui-drawing'

import IconLine from './icons/icon-tool-line.svg'
import IconMarker from './icons/icon-tool-marker.svg'
import IconPencil from './icons/icon-tool-pencil.svg'

const _GroupPen = ({
  brushMode,
  brushWidth,
  css,
  handleChange,
  intl,
  opened,
  tool,
}) => (
  <Floater
    component={() => (
      <div className={cn(css.popover, css.floater)}>
        <div className={css.row}>
          <div
            className={cn(css.button, {
              [css.active]: tool === toolEnum.PEN && brushMode === penToolModeEnum.PENCIL,
            })}
            onClick={() => handleChange({ brushMode: penToolModeEnum.PENCIL, tool: toolEnum.PEN })}
            role='button'
            tabIndex='0'
            title={intl.formatMessage({ id: 'PENCIL' })}
          >
            <IconPencil />
          </div>
          <div
            className={cn(css.button, {
              [css.active]: tool === toolEnum.PEN && brushMode === penToolModeEnum.MARKER,
            })}
            onClick={() => handleChange({ brushMode: penToolModeEnum.MARKER, tool: toolEnum.PEN })}
            role='button'
            tabIndex='0'
            title={intl.formatMessage({ id: 'HIGHLIGHTER' })}
          >
            <IconMarker />
          </div>
          <div
            className={cn(css.button, {
              [css.active]: tool === toolEnum.PEN && brushMode === penToolModeEnum.LINE,
            })}
            onClick={() => handleChange({ brushMode: penToolModeEnum.LINE, tool: toolEnum.PEN })}
            role='button'
            tabIndex='0'
            title={intl.formatMessage({ id: 'LINE' })}
          >
            <IconLine />
          </div>
        </div>
        <div className={css.separator} />
        <div>
          <div><FormattedMessage id='LINE_THICKNESS' /></div>
          <br />
          <Slider
            min={2}
            max={30}
            value={brushWidth}
            onChange={value => handleChange({ brushWidth: { [brushMode]: value } })}
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
    open={opened === 'group-pen'}
    target={`.${css.root} .group-pen`}
  />
)

export const GroupPen = injectIntl(_GroupPen)
