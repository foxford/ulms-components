import React from 'react'
import cn from 'classnames-es'
import { toolEnum, defaultToolSettings } from '@ulms/ui-drawing'

import IconText from '../icons/text-tool-icon.svg'

import { intlID } from '../../lang/constants'
import { HEXtoRGB } from '../utils'
import { settingsGroupContainerStyles } from '../constants'

import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { FontSettings } from './font-settings'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

export class TextGroup extends React.Component {
  constructor (props) {
    super(props)
    this.buttonRef = React.createRef()

    this.state = {
      color: defaultToolSettings.color,
      fontSize: defaultToolSettings.fontSize,
    }
  }

  handleClick = (name, value) => {
    const { handleChange, sendEvent } = this.props
    const {
      color, fontSize,
    } = { ...this.state, [name]: value }

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

  render () {
    const {
      opened,
      tool,
      intl,
      handleClose,
      handleOpen,
      className,
    } = this.props
    const {
      fontSize,
      color,
    } = this.state

    return (
      <SettingsGroup
        direction='right-start'
        containerStyles={settingsGroupContainerStyles}
        isOpen={opened}
        handleClose={handleClose}
        target={this.buttonRef.current}
        content={(
          <div className={cn(css.column, className)}>
            <FontSettings
              currentFontSize={fontSize}
              handleClick={value => this.handleClick('fontSize', value)}
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
          active={tool === toolEnum.TEXT}
          dataTestId='board-panel-text-button'
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
