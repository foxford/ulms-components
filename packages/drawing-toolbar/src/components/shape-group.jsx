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

// import { intlID } from '../../lang/constants'

import { HEXtoRGB } from '../utils'

import { IconGroupSettings } from './icon-group-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

const iconsMap = {
  [shapeToolModeEnum.RECT]: (<IconRect />),
  [shapeToolModeEnum.CIRCLE]: (<IconCircle />),
  [shapeToolModeEnum.TRIANGLE]: (<IconTriangle />),
  [shapeToolModeEnum.RIGHT_TRIANGLE]: (<IconRightTriangle />),
}

const iconsSolidMap = {
  [shapeToolModeEnum.RECT_SOLID]: (<IconSolidRect />),
  [shapeToolModeEnum.CIRCLE_SOLID]: (<IconSolidCircle />),
  [shapeToolModeEnum.TRIANGLE_SOLID]: (<IconSolidTriangle />),
  [shapeToolModeEnum.RIGHT_TRIANGLE_SOLID]: (<IconSolidRightTriangle />),
}

export class ShapeGroup extends React.Component {
  constructor (props) {
    super(props)
    // const { intl } = props

    this.buttonRef = React.createRef()

    this.state = {
      color: defaultToolSettings.color,
      toolMode: defaultToolSettings.shape,
    }

    this.iconsSet = [
      {
        key: shapeToolModeEnum.RECT,
        icon: iconsMap[shapeToolModeEnum.RECT],
        // title: intl.formatMessage({ id: intlID.RECT }),
      },
      {
        key: shapeToolModeEnum.CIRCLE,
        icon: iconsMap[shapeToolModeEnum.CIRCLE],
        // title: intl.formatMessage({ id: intlID.CIRCLE }),
      },
      {
        key: shapeToolModeEnum.TRIANGLE,
        icon: iconsMap[shapeToolModeEnum.TRIANGLE],
        // title: intl.formatMessage({ id: intlID.TRIANGLE }),
      },
      // ToDo: Пока не реализовано!
      // {
      //   key: shapeToolModeEnum.RIGHT_TRIANGLE,
      //   icon: iconsMap[shapeToolModeEnum.RIGHT_TRIANGLE],
      //   title: intl.formatMessage({ id: intlID.RIGHT_TRIANGLE }),
      // },
    ]

    this.solidIconsSet = [
      {
        key: shapeToolModeEnum.RECT_SOLID,
        icon: iconsSolidMap[shapeToolModeEnum.RECT_SOLID],
        // title: intl.formatMessage({ id: intlID.RECT_SOLID }),
      },
      {
        key: shapeToolModeEnum.CIRCLE_SOLID,
        icon: iconsSolidMap[shapeToolModeEnum.CIRCLE_SOLID],
        // title: intl.formatMessage({ id: intlID.CIRCLE_SOLID }),
      },
      {
        key: shapeToolModeEnum.TRIANGLE_SOLID,
        icon: iconsSolidMap[shapeToolModeEnum.TRIANGLE_SOLID],
        // title: intl.formatMessage({ id: intlID.TRIANGLE_SOLID }),
      },
      // ToDo: Пока не реализовано!
      // {
      //   key: shapeToolModeEnum.RIGHT_TRIANGLE_SOLID,
      //   icon: iconsSolidMap[shapeToolModeEnum.RIGHT_TRIANGLE_SOLID],
      //   title: intl.formatMessage({ id: intlID.RIGHT_TRIANGLE_SOLID }),
      // },
    ]
  }

  handleClick = (name, value) => {
    const { handleChange } = this.props
    const {
      toolMode, color,
    } = { ...this.state, [name]: value }

    this.setState({ [name]: value })
    handleChange({
      tool: toolEnum.SHAPE,
      brushMode: toolMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
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
            <IconGroupSettings
              iconsSet={this.solidIconsSet}
              currentSelection={toolMode}
              handleClick={value => this.handleClick('toolMode', value)}
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
          onClick={() => handleOpen({
            brushMode: toolMode,
            brushColor: { ...HEXtoRGB(color), a: 1 },
          })}
          innerRef={this.buttonRef}
        >
          {iconsMap[toolMode] || iconsSolidMap[toolMode]}
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
