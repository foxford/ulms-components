import React from 'react'
import cn from 'classnames-es'
import { shapeToolModeEnum, toolEnum, defaultToolSettings } from '@ulms/ui-drawing'

import IconRect from '../icons/rectangle-tool-icon.svg'
import IconCircle from '../icons/circle-tool-icon.svg'
import IconTriangle from '../icons/triangle-tool-icon.svg'
import IconRightTriangle from '../icons/right-triangle-tool-icon.svg'
import IconSolidRect from '../icons/solid-rectangle-tool-icon.svg'
import IconSolidCircle from '../icons/solid-circle-tool-icon.svg'
import IconSolidTriangle from '../icons/solid-triangle-tool-icon.svg'
import IconSolidRightTriangle from '../icons/solid-right-triangle-tool-icon.svg'

import { intlID } from '../../lang/constants'

import { HEXtoRGB } from '../utils'

import { IconGroupSettings } from './icon-group-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

export class ShapeGroup extends React.Component {
  constructor (props) {
    super(props)
    const { intl } = props

    this.buttonRef = React.createRef()

    this.state = {
      color: defaultToolSettings.color,
      brushMode: defaultToolSettings.shape,
    }

    this.iconsMap = {
      [shapeToolModeEnum.RECT]: (<IconRect />),
      [shapeToolModeEnum.CIRCLE]: (<IconCircle />),
      [shapeToolModeEnum.TRIANGLE]: (<IconTriangle />),
      [shapeToolModeEnum.RIGHT_TRIANGLE]: (<IconRightTriangle />),
    }

    this.iconsSolidMap = {
      [shapeToolModeEnum.RECT_SOLID]: (<IconSolidRect />),
      [shapeToolModeEnum.CIRCLE_SOLID]: (<IconSolidCircle />),
      [shapeToolModeEnum.TRIANGLE_SOLID]: (<IconSolidTriangle />),
      [shapeToolModeEnum.RIGHT_TRIANGLE_SOLID]: (<IconSolidRightTriangle />),
    }

    this.iconsSet = [
      {
        key: shapeToolModeEnum.RECT,
        icon: this.iconsMap[shapeToolModeEnum.RECT],
        title: intl.formatMessage({ id: intlID.RECT }),
      },
      {
        key: shapeToolModeEnum.CIRCLE,
        icon: this.iconsMap[shapeToolModeEnum.CIRCLE],
        title: intl.formatMessage({ id: intlID.CIRCLE }),
      },
      {
        key: shapeToolModeEnum.TRIANGLE,
        icon: this.iconsMap[shapeToolModeEnum.TRIANGLE],
        title: intl.formatMessage({ id: intlID.TRIANGLE }),
      },
      {
        key: shapeToolModeEnum.RIGHT_TRIANGLE,
        icon: this.iconsMap[shapeToolModeEnum.RIGHT_TRIANGLE],
        title: intl.formatMessage({ id: intlID.RIGHT_TRIANGLE }),
      },
    ]

    this.solidIconsSet = [
      {
        key: shapeToolModeEnum.RECT_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.RECT_SOLID],
        title: intl.formatMessage({ id: intlID.RECT_SOLID }),
      },
      {
        key: shapeToolModeEnum.CIRCLE_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.CIRCLE_SOLID],
        title: intl.formatMessage({ id: intlID.CIRCLE_SOLID }),
      },
      {
        key: shapeToolModeEnum.TRIANGLE_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.TRIANGLE_SOLID],
        title: intl.formatMessage({ id: intlID.TRIANGLE_SOLID }),
      },
      {
        key: shapeToolModeEnum.RIGHT_TRIANGLE_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.RIGHT_TRIANGLE_SOLID],
        title: intl.formatMessage({ id: intlID.RIGHT_TRIANGLE_SOLID }),
      },
    ]
  }

  componentDidUpdate (prevProps) {
    const { brushMode, tool } = this.props

    if (tool === toolEnum.SHAPE && brushMode !== prevProps.brushMode) {
      this.setState({ brushMode })
    }
  }

  handleClick = (name, value) => {
    const { handleChange, sendEvent } = this.props
    const {
      brushMode, color,
    } = { ...this.state, [name]: value }

    this.setState({ [name]: value })
    handleChange({
      tool: toolEnum.SHAPE,
      brushMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
    })
    if (name !== 'brushMode') {
      sendEvent(toolEnum.SHAPE, brushMode, {
        brushColor: { ...HEXtoRGB(color), a: 1 },
      })
    }
  }

  getOptions = () => {
    const {
      brushMode,
      color,
    } = this.state

    return {
      brushMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
    }
  }

  render () {
    const {
      opened,
      tool,
      handleClose,
      handleOpen,
      className,
      intl,
    } = this.props
    const {
      brushMode,
      color,
    } = this.state

    return (
      <SettingsGroup
        direction='right-start'
        containerStyles={{ marginTop: '-12px', marginLeft: '4px' }}
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
            <IconGroupSettings
              iconsSet={this.solidIconsSet}
              currentSelection={brushMode}
              handleClick={value => this.handleClick('brushMode', value)}
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
          active={tool === toolEnum.SHAPE}
          group
          title={intl.formatMessage({ id: intlID.SHAPE })}
          onClick={() => handleOpen(this.getOptions())}
          innerRef={this.buttonRef}
        >
          {this.iconsMap[brushMode] || this.iconsSolidMap[brushMode]}
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
