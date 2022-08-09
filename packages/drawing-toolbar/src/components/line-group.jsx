import React from 'react'
import cn from 'classnames-es'
import { lineToolModeEnum, toolEnum, defaultToolSettings } from '@ulms/ui-drawing'

import IconLine from '../icons/line-tool-icon.svg'
import IconDashedLine from '../icons/dashed-line-tool-icon.svg'
import IconArrow from '../icons/arrow-tool-icon.svg'

import { intlID } from '../../lang/constants'

import { HEXtoRGB } from '../utils'

import { IconGroupSettings } from './icon-group-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { LineSettings } from './line-settings'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

const iconsMap = {
  [lineToolModeEnum.LINE]: (<IconLine />),
  [lineToolModeEnum.DASHED_LINE]: (<IconDashedLine />),
  [lineToolModeEnum.ARROW]: (<IconArrow />),
}

export class LineGroup extends React.Component {
  constructor (props) {
    super(props)
    const { intl } = props

    this.buttonRef = React.createRef()

    this.state = {
      color: defaultToolSettings.color,
      size: defaultToolSettings.size,
      toolMode: defaultToolSettings.line,
    }

    this.iconsSet = [
      {
        key: lineToolModeEnum.LINE,
        icon: iconsMap[lineToolModeEnum.LINE],
        title: intl.formatMessage({ id: intlID.LINE }),
      },
      {
        key: lineToolModeEnum.DASHED_LINE,
        icon: iconsMap[lineToolModeEnum.DASHED_LINE],
        title: intl.formatMessage({ id: intlID.DASHED_LINE }),
      },
      // ToDo: Пока не реализовано
      // {
      //   key: lineToolModeEnum.ARROW,
      //   icon: iconsMap[lineToolModeEnum.ARROW],
      //   title: intl.formatMessage({ id: intlID.ARROW }),
      // },
    ]
  }

  handleClick = (name, value) => {
    const { handleChange } = this.props
    const {
      toolMode, color, size,
    } = { ...this.state, [name]: value }

    this.setState({ [name]: value })
    handleChange({
      tool: toolEnum.LINE,
      brushMode: toolMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
      brushWidth: size,
    })
  }

  render () {
    const {
      opened,
      tool,
      handleClose,
      handleOpen,
      className,
    } = this.props
    const {
      toolMode,
      size,
      color,
    } = this.state

    return (
      <SettingsGroup
        direction='right-start'
        containerStyles={{ marginTop: '-12px' }}
        isOpen={opened}
        handleClose={handleClose}
        target={this.buttonRef.current}
        content={(
          <div className={cn(css.column, className)}>
            <IconGroupSettings
              iconsSet={this.iconsSet}
              currentSelection={toolMode}
              handleClick={value => this.handleClick('toolMode', value)}
            />
            <Divider horizontal />
            <LineSettings
              currentSize={size}
              dashed={toolMode === lineToolModeEnum.DASHED_LINE}
              handleClick={value => this.handleClick('size', value)}
            />
            <Divider horizontal />
            <ColorSettings
              currentColor={color}
              handleClick={value => this.handleClick('color', value)}
            />
          </div>
        )}
      >
        <ToolbarButton
          active={tool === toolEnum.LINE}
          group
          onClick={() => handleOpen({
            brushMode: toolMode,
            brushColor: { ...HEXtoRGB(color), a: 1 },
            brushWidth: size,
          })}
          innerRef={this.buttonRef}
        >
          {iconsMap[toolMode]}
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
