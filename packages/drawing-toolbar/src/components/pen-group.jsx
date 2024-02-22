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
      penColor: defaultToolSettings.color,
      penSize: defaultToolSettings.size,
      markerColor: defaultToolSettings.markerColor,
      markerSize: defaultToolSettings.markerSize,
      brushMode: penToolModeEnum.PENCIL,
    }

    this.iconsMap = {
      [penToolModeEnum.PENCIL]: (<IconPen />),
      [penToolModeEnum.DASHED_PENCIL]: (<IconDashedPen />),
      [penToolModeEnum.MARKER]: (<IconMarker />),
    }

    this.iconsSet = [
      {
        dataTestId: 'board-panel-paintbrush-button',
        key: penToolModeEnum.PENCIL,
        icon: this.iconsMap[penToolModeEnum.PENCIL],
        title: intl.formatMessage({ id: intlID.PENCIL }),
      },
      {
        dataTestId: 'board-panel-dotted-pencil-button',
        key: penToolModeEnum.DASHED_PENCIL,
        icon: this.iconsMap[penToolModeEnum.DASHED_PENCIL],
        title: intl.formatMessage({ id: intlID.DASHED_PENCIL }),
      },
      {
        dataTestId: 'board-panel-highlighter-button',
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

  _getTitle = key => this.iconsSet.find(item => item.key === key).title

  handleClick = (name, value) => {
    const { handleChange, sendEvent } = this.props
    const {
      brushMode, penColor, penSize, markerColor, markerSize,
    } = { ...this.state, [name]: value }

    this.setState({ [name]: value })

    handleChange({
      tool: toolEnum.PEN,
      brushMode,
      brushColor: (brushMode === penToolModeEnum.MARKER)
        ? { ...HEXtoRGB(markerColor), a: defaultToolSettings.markerAlpha }
        : { ...HEXtoRGB(penColor), a: 1 },
      brushWidth: (brushMode === penToolModeEnum.MARKER) ? lineToMarkerMap[markerSize] : penSize,
    })
    if (name !== 'brushMode') {
      sendEvent(toolEnum.PEN, brushMode, {
        brushColor: (brushMode === penToolModeEnum.MARKER)
          ? { ...HEXtoRGB(markerColor), a: defaultToolSettings.markerAlpha }
          : { ...HEXtoRGB(penColor), a: 1 },
        brushWidth: (brushMode === penToolModeEnum.MARKER) ? lineToMarkerMap[markerSize] : penSize,
      })
    }
  }

  getOptions = () => {
    const {
      brushMode,
      markerSize,
      markerColor,
      penSize,
      penColor,
    } = this.state

    return {
      brushMode,
      brushColor: (brushMode === penToolModeEnum.MARKER)
        ? { ...HEXtoRGB(markerColor), a: defaultToolSettings.markerAlpha }
        : { ...HEXtoRGB(penColor), a: 1 },
      brushWidth: (brushMode === penToolModeEnum.MARKER) ? lineToMarkerMap[markerSize] : penSize,
    }
  }

  render () {
    const {
      opened,
      tool,
      handleClose,
      handleOpen,
      className,
      containerStyles = { marginTop: '-12px', marginLeft: '4px' },
      direction = 'right-start',
      orientation = 'vertical',
    } = this.props
    const {
      brushMode,
      markerSize,
      penSize,
      markerColor,
      penColor,
    } = this.state

    return (
      <SettingsGroup
        direction={direction}
        containerStyles={containerStyles}
        isOpen={opened}
        handleClose={handleClose}
        target={this.buttonRef.current}
        content={(
          <div className={cn(css.column, css[orientation], className)}>
            <div className={css.column__group}>
              <IconGroupSettings
                iconsSet={this.iconsSet}
                currentSelection={brushMode}
                handleClick={value => this.handleClick('brushMode', value)}
              />
              <Divider horizontal={orientation === 'vertical'} />
              <LineSettings
                currentSize={brushMode === penToolModeEnum.MARKER ? markerSize : penSize}
                dashed={brushMode === penToolModeEnum.DASHED_PENCIL}
                handleClick={value => (brushMode === penToolModeEnum.MARKER)
                  ? this.handleClick('markerSize', value)
                  : this.handleClick('penSize', value)}
              />
            </div>
            <Divider horizontal />
            <ColorSettings
              currentColor={brushMode === penToolModeEnum.MARKER ? markerColor : penColor}
              handleClick={value => (brushMode === penToolModeEnum.MARKER)
                ? this.handleClick('markerColor', value)
                : this.handleClick('penColor', value)}
              rows={orientation === 'horizontal' ? 1 : 3}
            />
          </div>
        )}
      >
        <ToolbarButton
          active={tool === toolEnum.PEN}
          dataTestId='board-panel-group-pen-button'
          group
          title={this._getTitle(brushMode)}
          onClick={() => handleOpen(this.getOptions())}
          innerRef={this.buttonRef}
        >
          {this.iconsMap[brushMode]}
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
