import React from 'react'
import cn from 'classnames-es'
import {
  lineToolModeEnum,
  toolEnum,
  defaultToolSettings,
} from '@ulms/ui-drawing'

import IconLine from '../icons/line-tool-icon.svg'
import IconDashedLine from '../icons/dashed-line-tool-icon.svg'
import IconArrow from '../icons/arrow-tool-icon.svg'

import { intlID } from '../../lang/constants'
import { HEXtoRGB, RGBtoHEX } from '../utils'
import { settingsGroupContainerStyles } from '../constants'

import { IconGroupSettings } from './icon-group-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { LineSettings } from './line-settings'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

// eslint-disable-next-line import/prefer-default-export
export class LineGroup extends React.Component {
  constructor(props) {
    super(props)
    const { intl, options } = props
    const isLineToolSelected = props.tool === toolEnum.LINE

    this.iconsMap = {
      [lineToolModeEnum.LINE]: <IconLine />,
      [lineToolModeEnum.DASHED_LINE]: <IconDashedLine />,
      [lineToolModeEnum.ARROW]: <IconArrow />,
    }

    this.buttonRef = React.createRef()

    this.state = {
      color: isLineToolSelected
        ? RGBtoHEX(options.brushColor)
        : defaultToolSettings.color,
      size: isLineToolSelected ? options.brushWidth : defaultToolSettings.size,
      brushMode: isLineToolSelected
        ? options.brushMode
        : defaultToolSettings.line,
    }

    this.iconsSet = [
      {
        dataTestId: 'board-panel-line-button',
        key: lineToolModeEnum.LINE,
        icon: this.iconsMap[lineToolModeEnum.LINE],
        title: intl.formatMessage({ id: intlID.LINE }),
      },
      {
        dataTestId: 'board-panel-dotted-line-button',
        key: lineToolModeEnum.DASHED_LINE,
        icon: this.iconsMap[lineToolModeEnum.DASHED_LINE],
        title: intl.formatMessage({ id: intlID.DASHED_LINE }),
      },
      {
        dataTestId: 'board-panel-arrow-button',
        key: lineToolModeEnum.ARROW,
        icon: this.iconsMap[lineToolModeEnum.ARROW],
        title: intl.formatMessage({ id: intlID.ARROW }),
      },
    ]
  }

  componentDidUpdate(prevProps) {
    const { brushMode, tool } = this.props

    if (tool === toolEnum.LINE && brushMode !== prevProps.brushMode) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ brushMode })
    }
  }

  _getTitle = (key) => this.iconsSet.find((item) => item.key === key).title

  handleClick = (name, value) => {
    const { handleChange, sendEvent } = this.props
    const { brushMode, color, size } = { ...this.state, [name]: value }

    this.setState({ [name]: value })
    handleChange({
      tool: toolEnum.LINE,
      brushMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
      brushWidth: size,
    })

    if (name !== 'brushMode') {
      sendEvent(toolEnum.LINE, brushMode, {
        brushColor: { ...HEXtoRGB(color), a: 1 },
        brushWidth: size,
      })
    }
  }

  getOptions = () => {
    const { brushMode, size, color } = this.state

    return {
      brushMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
      brushWidth: size,
    }
  }

  render() {
    const { opened, tool, handleClose, handleOpen, className } = this.props
    const { brushMode, size, color } = this.state

    return (
      <SettingsGroup
        direction="right-start"
        containerStyles={settingsGroupContainerStyles}
        isOpen={opened}
        handleClose={handleClose}
        target={this.buttonRef.current}
        content={
          <div className={cn(css.column, className)}>
            <IconGroupSettings
              iconsSet={this.iconsSet}
              currentSelection={brushMode}
              handleClick={(value) => this.handleClick('brushMode', value)}
            />
            <Divider horizontal />
            <LineSettings
              currentSize={size}
              dashed={brushMode === lineToolModeEnum.DASHED_LINE}
              handleClick={(value) => this.handleClick('size', value)}
            />
            <Divider horizontal />
            <ColorSettings
              currentColor={color}
              handleClick={(value) => this.handleClick('color', value)}
            />
          </div>
        }
      >
        <ToolbarButton
          active={tool === toolEnum.LINE}
          dataTestId="board-panel-group-line-button"
          group
          groupColor={color}
          onClick={() => handleOpen(this.getOptions())}
          innerRef={this.buttonRef}
          title={this._getTitle(brushMode)}
        >
          {this.iconsMap[brushMode]}
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
