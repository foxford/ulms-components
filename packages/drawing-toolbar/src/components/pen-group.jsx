import React from 'react'
import cn from 'classnames-es'
import { penToolModeEnum, toolEnum, defaultToolSettings } from '@ulms/ui-drawing'

import IconPen from '../icons/pen-tool-icon.svg'
import IconDashedPen from '../icons/dashed-pen-tool-icon.svg'
import IconMarker from '../icons/marker-tool-icon.svg'

import { intlID } from '../../lang/constants'

import { HEXtoRGB } from '../utils'

import { IconGroupSettings } from './icon-group-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { LineSettings } from './line-settings'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

const lineToMarkerMap = {
  1: 5,
  2: 10,
  4: 15,
  8: 20,
}

export class PenGroup extends React.Component {
  constructor (props) {
    super(props)
    const { intl } = props

    this.buttonRef = React.createRef()

    this.state = {
      color: defaultToolSettings.color,
      size: defaultToolSettings.size,
      brushMode: penToolModeEnum.PENCIL,
    }

    this.iconsMap = {
      [penToolModeEnum.PENCIL]: (<IconPen />),
      [penToolModeEnum.DASHED_PENCIL]: (<IconDashedPen />),
      [penToolModeEnum.MARKER]: (<IconMarker />),
    }

    this.iconsSet = [
      {
        key: penToolModeEnum.PENCIL,
        icon: this.iconsMap[penToolModeEnum.PENCIL],
        title: intl.formatMessage({ id: intlID.PENCIL }),
      },
      {
        key: penToolModeEnum.DASHED_PENCIL,
        icon: this.iconsMap[penToolModeEnum.DASHED_PENCIL],
        title: intl.formatMessage({ id: intlID.DASHED_PENCIL }),
      },
      {
        key: penToolModeEnum.MARKER,
        icon: this.iconsMap[penToolModeEnum.MARKER],
        title: intl.formatMessage({ id: intlID.HIGHLIGHTER }),
      },
    ]
  }

  componentDidUpdate (prevProps) {
    const { brushMode, tool } = this.props

    if (tool === toolEnum.PEN && brushMode !== prevProps.brushMode) {
      this.setState({ brushMode })
    }
  }

  handleClick = (name, value) => {
    const { handleChange } = this.props
    const {
      brushMode, color, size,
    } = { ...this.state, [name]: value }

    this.setState({ [name]: value })
    handleChange({
      tool: toolEnum.PEN,
      brushMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
      brushWidth: (brushMode === penToolModeEnum.MARKER) ? lineToMarkerMap[size] : size,
    })
  }

  getOptions = () => {
    const {
      brushMode,
      size,
      color,
    } = this.state

    return {
      brushMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
      brushWidth: (brushMode === penToolModeEnum.MARKER) ? lineToMarkerMap[size] : size,
    }
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
      brushMode,
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
              currentSelection={brushMode}
              handleClick={value => this.handleClick('brushMode', value)}
            />
            <Divider horizontal />
            <LineSettings
              currentSize={size}
              dashed={brushMode === penToolModeEnum.DASHED_PENCIL}
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
          active={tool === toolEnum.PEN}
          group
          onClick={() => handleOpen(this.getOptions())}
          innerRef={this.buttonRef}
        >
          {this.iconsMap[brushMode]}
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
