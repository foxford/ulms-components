/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'

import { ToolbarButton } from './components/toolbar-button'
import { ColorItem, ColorSettings } from './components/color-settings'
import { FontSettings } from './components/font-settings'
import { LineSettings } from './components/line-settings'
import { SettingsGroup } from './components/settings-group'
import { Divider } from './components/divider'

import { RGBtoHEX, fromCSSColor, toCSSColor, HEXtoRGB } from './utils'
import {
  ObjectTypes,
  ShapeTypes,
  LineTypes,
  ColorTypes,
  contextMenuContainerStyles,
} from './constants'

import IconLineSettingsTool from './icons/line-settings-tool-icon.svg'
import IconTextSettingsTool from './icons/text-tool-alt-icon.svg'
import IconCopyPaste from './icons/copy-paste-tool-icon.svg'
import IconDelete from './icons/delete-tool-icon.svg'
import IconLockUnlocked from './icons/lock-tool-unlocked-icon.svg'
import IconLockLocked from './icons/lock-tool-locked-icon.svg'
import IconBringFront from './icons/bring-front-tool-icon.svg'
import IconBringBack from './icons/bring-back-tool-icon.svg'

import css from './context-toolbar.module.css'

const lineToMarkerMap = {
  1: 5,
  2: 10,
  4: 15,
  8: 20,
}
const markerToLineMap = {
  5: 1,
  10: 2,
  15: 4,
  20: 8,
}

// eslint-disable-next-line import/prefer-default-export
export class ContextToolbar extends React.Component {
  constructor(props) {
    super(props)

    this.lineSettingsRef = React.createRef()
    this.colorSettingsRef = React.createRef()
    this.fontSettingsRef = React.createRef()

    this.state = {
      showColorTool: false,
      currentColor: '',
      showFontTool: false,
      currentFontSize: 0,
      showLineTool: false,
      currentSize: 0,
      isMarker: false,

      colorSettingsOpened: false,
      fontSettingsOpened: false,
      lineSettingsOpened: false,
    }
  }

  componentDidMount() {
    const { selectedObject } = this.props

    if (selectedObject) {
      this.processSelectedObject(selectedObject)
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedObject } = this.props

    if (selectedObject !== prevProps.selectedObject) {
      if (selectedObject) {
        this.processSelectedObject(selectedObject)
      }

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        colorSettingsOpened: false,
        fontSettingsOpened: false,
        lineSettingsOpened: false,
      })
    }
  }

  componentWillUnmount() {
    this.setState({
      colorSettingsOpened: false,
      fontSettingsOpened: false,
      lineSettingsOpened: false,
    })
  }

  handleAction = (actionFunction) => {
    this.setState({
      colorSettingsOpened: false,
      fontSettingsOpened: false,
      lineSettingsOpened: false,
    })

    if (actionFunction) actionFunction()
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  flipX = () => {
    const { selectedObject, onDrawUpdate } = this.props

    selectedObject.set({ flipX: !selectedObject.flipX })
    onDrawUpdate(selectedObject)
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  flipY = () => {
    const { selectedObject, onDrawUpdate } = this.props

    selectedObject.set({ flipY: !selectedObject.flipY })
    onDrawUpdate(selectedObject)
  }

  handleLineChanged = (newSize) => {
    const { selectedObject, onDrawUpdate, onSendEvent } = this.props
    const { stroke } = selectedObject
    const { a } = fromCSSColor(stroke)
    const isMarker = a < 0.9

    selectedObject.set({
      strokeWidth: isMarker ? lineToMarkerMap[newSize] : newSize,
    })
    onDrawUpdate(selectedObject)

    if (onSendEvent) {
      onSendEvent({
        object: selectedObject,
        diff: { strokeWidth: selectedObject.strokeWidth }, // eslint-disable-line unicorn/consistent-destructuring
      })
    }

    this.setState({
      currentSize: isMarker ? lineToMarkerMap[newSize] : newSize,
    })
  }

  handleFontChanged = (newFontSize) => {
    const { selectedObject, onDrawUpdate, onSendEvent } = this.props

    selectedObject.set({ fontSize: newFontSize })
    onDrawUpdate(selectedObject)

    if (onSendEvent) {
      onSendEvent({
        object: selectedObject,
        diff: { fontSize: selectedObject.fontSize },
      })
    }

    this.setState({ currentFontSize: newFontSize })
  }

  handleColorChanged = (color) => {
    const newColor = HEXtoRGB(color)
    const { selectedObject, onDrawUpdate, onSendEvent } = this.props
    const { type, fill, stroke } = selectedObject

    if (type === ObjectTypes.TEXT) {
      selectedObject.set({ fill: toCSSColor({ ...newColor, a: 1 }) })
    } else if (LineTypes.includes(type)) {
      const { a } = fromCSSColor(stroke)

      selectedObject.set({ stroke: toCSSColor({ ...newColor, a }) })
    } else if (ShapeTypes.includes(type)) {
      if (fill) {
        const { a } = fromCSSColor(fill)

        selectedObject.set({
          stroke: toCSSColor({ ...newColor, a: 1 }),
          fill: a > 0.01 ? toCSSColor({ ...newColor, a: 1 }) : fill,
        })
      } else {
        const { a } = fromCSSColor(stroke)

        selectedObject.set({
          stroke: toCSSColor({ ...newColor, a }),
        })
      }
    }
    onDrawUpdate(selectedObject)

    if (onSendEvent) {
      onSendEvent({
        object: selectedObject,
        diff: { fill: selectedObject.fill, stroke: selectedObject.stroke }, // eslint-disable-line unicorn/consistent-destructuring
      })
    }

    this.setState({ currentColor: color })
  }

  processSelectedObject(selectedObject) {
    const { type, fill, stroke, fontSize, strokeWidth, strokeDashArray } =
      selectedObject

    const { a: fillA } = fill ? fromCSSColor(fill) : { a: 0 }

    const dashed = !!strokeDashArray
    const showColorTool = ColorTypes.includes(type)
    const showFontTool = type === ObjectTypes.TEXT
    const showLineTool =
      LineTypes.includes(type) || (ShapeTypes.includes(type) && fillA < 0.01)

    let currentColor = ''
    let currentSize = 0
    let currentFontSize = 0
    let isMarker = false

    if (showFontTool) {
      currentFontSize = fontSize
    }
    if (showLineTool) {
      currentSize = strokeWidth
      const { a: strokeA } = fromCSSColor(stroke)

      isMarker = strokeA < 0.9
    }

    if (showColorTool) {
      if (LineTypes.includes(type)) {
        currentColor = RGBtoHEX(fromCSSColor(stroke))
      } else if (type === ObjectTypes.TEXT) {
        currentColor = RGBtoHEX(fromCSSColor(fill))
      } else {
        currentColor = RGBtoHEX(fromCSSColor(stroke))
      }
    }

    this.setState({
      showColorTool,
      currentColor,
      showFontTool,
      currentFontSize,
      showLineTool,
      currentSize,
      isMarker,
      dashed,
    })
  }

  render() {
    const {
      colorSettingsRows,
      isLocked,
      onLock,
      onCopyPaste,
      onDelete,
      direction = 'top',
      onBringToFront,
      onSendToBack,
    } = this.props
    const {
      showColorTool,
      currentColor,
      showFontTool,
      currentFontSize,
      colorSettingsOpened,
      fontSettingsOpened,
      lineSettingsOpened,
      currentSize,
      showLineTool,
      isMarker,
      dashed,
    } = this.state

    return (
      <div className={css.contextMenuWrapper}>
        {!isLocked && (
          <>
            {showLineTool && (
              <SettingsGroup
                direction={`${direction}-start`}
                containerStyles={contextMenuContainerStyles(direction)}
                isOpen={lineSettingsOpened}
                handleClose={() => this.setState({ lineSettingsOpened: false })}
                target={this.lineSettingsRef.current}
                content={
                  <LineSettings
                    dashed={dashed}
                    currentSize={
                      isMarker ? markerToLineMap[currentSize] : currentSize
                    }
                    handleClick={this.handleLineChanged}
                  />
                }
              >
                <ToolbarButton
                  active={lineSettingsOpened}
                  onClick={() =>
                    this.setState({
                      lineSettingsOpened: !lineSettingsOpened,
                      colorSettingsOpened: false,
                      fontSettingsOpened: false,
                    })
                  }
                  innerRef={this.lineSettingsRef}
                >
                  <IconLineSettingsTool />
                </ToolbarButton>
              </SettingsGroup>
            )}
            {showFontTool && (
              <SettingsGroup
                direction={`${direction}-start`}
                containerStyles={contextMenuContainerStyles(direction)}
                isOpen={fontSettingsOpened}
                handleClose={() => this.setState({ fontSettingsOpened: false })}
                target={this.fontSettingsRef.current}
                content={
                  <FontSettings
                    currentFontSize={currentFontSize}
                    handleClick={this.handleFontChanged}
                  />
                }
              >
                <ToolbarButton
                  active={fontSettingsOpened}
                  onClick={() => {
                    this.setState({
                      fontSettingsOpened: !fontSettingsOpened,
                      lineSettingsOpened: false,
                      colorSettingsOpened: false,
                    })
                  }}
                  innerRef={this.fontSettingsRef}
                >
                  <IconTextSettingsTool />
                </ToolbarButton>
              </SettingsGroup>
            )}
            {showColorTool && (
              <SettingsGroup
                direction={`${direction}-start`}
                containerStyles={contextMenuContainerStyles(direction)}
                isOpen={colorSettingsOpened}
                handleClose={() =>
                  this.setState({ colorSettingsOpened: false })
                }
                target={this.colorSettingsRef.current}
                content={
                  <ColorSettings
                    currentColor={currentColor}
                    handleClick={this.handleColorChanged}
                    rows={colorSettingsRows}
                  />
                }
              >
                <ColorItem
                  color={currentColor}
                  innerRef={this.colorSettingsRef}
                  active={colorSettingsOpened}
                  handleClick={() =>
                    this.setState({
                      colorSettingsOpened: !colorSettingsOpened,
                      fontSettingsOpened: false,
                      lineSettingsOpened: false,
                    })
                  }
                />
              </SettingsGroup>
            )}
            {showColorTool && <Divider />}
          </>
        )}
        <ToolbarButton onClick={() => this.handleAction(onLock)}>
          {isLocked ? <IconLockLocked /> : <IconLockUnlocked />}
        </ToolbarButton>
        {!isLocked && (
          <>
            <ToolbarButton onClick={() => this.handleAction(onCopyPaste)}>
              <IconCopyPaste />
            </ToolbarButton>
            <ToolbarButton onClick={() => this.handleAction(onDelete)}>
              <IconDelete />
            </ToolbarButton>
            <Divider />
            <ToolbarButton onClick={() => this.handleAction(onBringToFront)}>
              <IconBringFront />
            </ToolbarButton>
            <ToolbarButton onClick={() => this.handleAction(onSendToBack)}>
              <IconBringBack />
            </ToolbarButton>
          </>
        )}
      </div>
    )
  }
}
