import React from 'react'
import cn from 'classnames-es'
import { toolEnum, defaultToolSettings } from '@ulms/ui-drawing'

import IconText from '../icons/text-tool-icon.svg'

import { intlID } from '../../lang/constants'

import {
  compactSettingsGroupContainerStyles,
  settingsGroupContainerStyles,
} from '../constants'
import { HEXtoRGB, RGBtoHEX } from '../utils'

import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { FontSettings } from './font-settings'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

// eslint-disable-next-line import/prefer-default-export
export class TextGroup extends React.Component {
  constructor(props) {
    super(props)
    const { options } = props
    const isTextToolSelected = props.tool === toolEnum.TEXT

    this.buttonRef = React.createRef()

    this.state = {
      color: isTextToolSelected
        ? RGBtoHEX(options.brushColor)
        : defaultToolSettings.color,
      fontSize: isTextToolSelected
        ? options.fontSize
        : defaultToolSettings.fontSize,
    }
  }

  handleClick = (name, value) => {
    const { handleChange, sendEvent } = this.props
    const { color, fontSize } = { ...this.state, [name]: value }

    this.setState({ [name]: value })
    handleChange({
      tool: toolEnum.TEXT,
      brushColor: { ...HEXtoRGB(color), a: 1 },
      fontSize,
    })
    if (name !== 'brushMode') {
      sendEvent(toolEnum.TEXT, null, {
        brushColor: { ...HEXtoRGB(color), a: 1 },
        fontSize,
      })
    }
  }

  getOptions = () => {
    const { fontSize, color } = this.state

    return { fontSize, brushColor: { ...HEXtoRGB(color), a: 1 } }
  }

  render() {
    const { compact, opened, tool, intl, handleClose, handleOpen, className } =
      this.props
    const { fontSize, color } = this.state

    return (
      <SettingsGroup
        direction={compact ? 'top' : 'right-start'}
        compact={compact}
        containerStyles={
          compact
            ? compactSettingsGroupContainerStyles
            : settingsGroupContainerStyles
        }
        isOpen={opened}
        handleClose={handleClose}
        offset={compact ? 4 : undefined}
        target={compact ? '.drawing-toolbar' : this.buttonRef.current}
        content={
          <div
            className={cn(
              css['settings-group'],
              {
                [css.column]: !compact,
                [css.compact]: compact,
                [css.row]: compact,
              },
              className,
            )}
          >
            <FontSettings
              compact={compact}
              currentFontSize={fontSize}
              gap={compact ? 12 : 4}
              handleClick={(value) => this.handleClick('fontSize', value)}
            />
            <Divider
              className={cn(compact && css['divider-with-margin'])}
              horizontal={!compact}
            />
            <ColorSettings
              compact={compact}
              currentColor={color}
              handleClick={(value) => this.handleClick('color', value)}
            />
          </div>
        }
      >
        <ToolbarButton
          active={tool === toolEnum.TEXT}
          compact={compact}
          dataTestId="board-panel-text-button"
          title={intl.formatMessage({ id: intlID.TEXT })}
          group
          groupColor={color}
          onClick={() => handleOpen(this.getOptions())}
          innerRef={this.buttonRef}
        >
          <IconText />
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
