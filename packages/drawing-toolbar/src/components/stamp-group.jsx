import React from 'react'
import { toolEnum, defaultToolSettings } from '@ulms/ui-drawing'

import IconStamp from '../icons/stamp-tool-icon.svg'

import { intlID } from '../../lang/constants'

import { StampSettings } from './stamp-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'

export class StampGroup extends React.Component {
  constructor (props) {
    super(props)
    // const { intl } = props

    this.buttonRef = React.createRef()

    this.state = {
      brushMode: defaultToolSettings.stamp,
    }
  }

  handleClick = (brushMode) => {
    const { handleChange } = this.props

    this.setState({ brushMode })
    handleChange({
      tool: toolEnum.STAMP,
      brushMode,
    })
  }

  getOptions = () => {
    const { brushMode } = this.state

    return { brushMode }
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
      brushMode,
    } = this.state

    return (
      <SettingsGroup
        direction='right-start'
        containerStyles={{ marginTop: '-12px', marginLeft: '4px' }}
        isOpen={opened}
        handleClose={handleClose}
        target={this.buttonRef.current}
        content={(
          <StampSettings
            handleClick={this.handleClick}
            brushMode={brushMode}
            intl={intl}
            className={className}
          />
        )}
      >
        <ToolbarButton
          active={tool === toolEnum.STAMP}
          group
          title={intl.formatMessage({ id: intlID.STAMP })}
          onClick={() => handleOpen(this.getOptions())}
          innerRef={this.buttonRef}
        >
          <IconStamp />
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
