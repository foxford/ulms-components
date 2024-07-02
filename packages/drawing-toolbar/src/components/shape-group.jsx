import React from 'react'
import cn from 'classnames-es'
import {
  shapeToolModeEnum,
  toolEnum,
  defaultToolSettings,
} from '@ulms/ui-drawing'

import IconRect from '../icons/rectangle-tool-icon.svg'
import IconCircle from '../icons/circle-tool-icon.svg'
import IconTriangle from '../icons/triangle-tool-icon.svg'
import IconRightTriangle from '../icons/right-triangle-tool-icon.svg'
import IconSolidRect from '../icons/solid-rectangle-tool-icon.svg'
import IconSolidCircle from '../icons/solid-circle-tool-icon.svg'
import IconSolidTriangle from '../icons/solid-triangle-tool-icon.svg'
import IconSolidRightTriangle from '../icons/solid-right-triangle-tool-icon.svg'

import { intlID } from '../../lang/constants'

import {
  compactSettingsGroupContainerStyles,
  settingsGroupContainerStyles,
} from '../constants'
import { HEXtoRGB, RGBtoHEX } from '../utils'

import { IconGroupSettings } from './icon-group-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'
import { Divider } from './divider'
import { ColorSettings } from './color-settings'

import css from './settings.module.css'

// eslint-disable-next-line import/prefer-default-export
export class ShapeGroup extends React.Component {
  constructor(props) {
    super(props)
    const { options } = props
    // const { intl } = props
    const isShapeToolSelected = props.tool === toolEnum.SHAPE

    this.buttonRef = React.createRef()

    this.state = {
      color: isShapeToolSelected
        ? RGBtoHEX(options.brushColor)
        : defaultToolSettings.color,
      brushMode: isShapeToolSelected
        ? options.brushMode
        : defaultToolSettings.shape,
    }

    this.iconsMap = {
      [shapeToolModeEnum.RECT]: <IconRect />,
      [shapeToolModeEnum.CIRCLE]: <IconCircle />,
      [shapeToolModeEnum.TRIANGLE]: <IconTriangle />,
      [shapeToolModeEnum.RIGHT_TRIANGLE]: <IconRightTriangle />,
    }

    this.iconsSolidMap = {
      [shapeToolModeEnum.RECT_SOLID]: <IconSolidRect />,
      [shapeToolModeEnum.CIRCLE_SOLID]: <IconSolidCircle />,
      [shapeToolModeEnum.TRIANGLE_SOLID]: <IconSolidTriangle />,
      [shapeToolModeEnum.RIGHT_TRIANGLE_SOLID]: <IconSolidRightTriangle />,
    }

    this.iconsSet = [
      {
        dataTestId: 'board-panel-popup-empty-square',
        key: shapeToolModeEnum.RECT,
        icon: this.iconsMap[shapeToolModeEnum.RECT],
        // title: intl.formatMessage({ id: intlID.RECT }),
      },
      {
        dataTestId: 'board-panel-popup-empty-circle',
        key: shapeToolModeEnum.CIRCLE,
        icon: this.iconsMap[shapeToolModeEnum.CIRCLE],
        // title: intl.formatMessage({ id: intlID.CIRCLE }),
      },
      {
        dataTestId: 'board-panel-popup-empty-triangle',
        key: shapeToolModeEnum.TRIANGLE,
        icon: this.iconsMap[shapeToolModeEnum.TRIANGLE],
        // title: intl.formatMessage({ id: intlID.TRIANGLE }),
      },
      {
        dataTestId: 'board-panel-popup-empty-right-triangle',
        key: shapeToolModeEnum.RIGHT_TRIANGLE,
        icon: this.iconsMap[shapeToolModeEnum.RIGHT_TRIANGLE],
        // title: intl.formatMessage({ id: intlID.RIGHT_TRIANGLE }),
      },
    ]

    this.solidIconsSet = [
      {
        dataTestId: 'board-panel-popup-square',
        key: shapeToolModeEnum.RECT_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.RECT_SOLID],
        // title: intl.formatMessage({ id: intlID.RECT_SOLID }),
      },
      {
        dataTestId: 'board-panel-popup-circle',
        key: shapeToolModeEnum.CIRCLE_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.CIRCLE_SOLID],
        // title: intl.formatMessage({ id: intlID.CIRCLE_SOLID }),
      },
      {
        dataTestId: 'board-panel-popup-triangle',
        key: shapeToolModeEnum.TRIANGLE_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.TRIANGLE_SOLID],
        // title: intl.formatMessage({ id: intlID.TRIANGLE_SOLID }),
      },
      {
        dataTestId: 'board-panel-popup-right-triangle',
        key: shapeToolModeEnum.RIGHT_TRIANGLE_SOLID,
        icon: this.iconsSolidMap[shapeToolModeEnum.RIGHT_TRIANGLE_SOLID],
        // title: intl.formatMessage({ id: intlID.RIGHT_TRIANGLE_SOLID }),
      },
    ]
  }

  componentDidUpdate(prevProps) {
    const { brushMode, tool } = this.props

    if (tool === toolEnum.SHAPE && brushMode !== prevProps.brushMode) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ brushMode })
    }
  }

  handleClick = (name, value) => {
    const { handleChange, sendEvent } = this.props
    const { brushMode, color } = { ...this.state, [name]: value }

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
    const { brushMode, color } = this.state

    return {
      brushMode,
      brushColor: { ...HEXtoRGB(color), a: 1 },
    }
  }

  render() {
    const { className, compact, handleClose, handleOpen, intl, opened, tool } =
      this.props
    const { brushMode, color } = this.state

    const solidToggleIconSet = [
      this.iconsSet.find(({ key }) => key.startsWith(brushMode.split('-')[0])),
      this.solidIconsSet.find(({ key }) => key.startsWith(brushMode)),
    ]

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
            {compact && (
              <>
                <IconGroupSettings
                  compact={compact}
                  currentSelection={brushMode}
                  gap={12}
                  handleClick={(value) => this.handleClick('brushMode', value)}
                  iconsSet={solidToggleIconSet}
                />
                <Divider className={css['divider-with-margin_l']} />
              </>
            )}
            <IconGroupSettings
              compact={compact}
              gap={compact ? 16 : 4}
              iconsSet={this.iconsSet}
              currentSelection={brushMode}
              handleClick={(value) => this.handleClick('brushMode', value)}
            />

            {!compact && (
              <>
                <Divider horizontal />
                <IconGroupSettings
                  iconsSet={this.solidIconsSet}
                  currentSelection={brushMode}
                  handleClick={(value) => this.handleClick('brushMode', value)}
                />
                <Divider horizontal />
                <ColorSettings
                  currentColor={color}
                  handleClick={(value) => this.handleClick('color', value)}
                />
              </>
            )}
          </div>
        }
      >
        <ToolbarButton
          active={tool === toolEnum.SHAPE}
          compact={compact}
          dataTestId="board-panel-group-shape-button"
          group={!compact}
          groupColor={color}
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
