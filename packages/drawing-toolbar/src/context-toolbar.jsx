/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react'
import cn from 'classnames-es'

import { ColorItem, ColorSettings } from './components/color-settings'
import { FontItem, FontSettings } from './components/font-settings'
import { LineSettings } from './components/line-settings'
import { SettingsGroup } from './components/settings-group'

import { RGBtoHEX, fromCSSColor, toCSSColor } from './utils'
import { ObjectTypes, ShapeTypes, LineTypes, ColorTypes } from './constants'

import IconLineTool from './icons-new/line-tool-icon.svg'
import IconCopyPaste from './icons-new/copy-paste-tool-icon.svg'
import IconDelete from './icons-new/delete-tool-icon.svg'
import IconLockUnlocked from './icons-new/lock-tool-unlocked-icon.svg'
import IconLockLocked from './icons-new/lock-tool-locked-icon.svg'
import IconBringFront from './icons-new/bring-front-tool-icon.svg'
import IconBringBack from './icons-new/bring-back-tool-icon.svg'

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

export class ContextToolbar extends React.Component {
  constructor (props) {
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

  componentDidMount () {
    const { selectedObject } = this.props

    if (selectedObject) {
      this.processSelectedObject(selectedObject)
    }
  }

  componentDidUpdate (prevProps) {
    const { selectedObject } = this.props

    if (selectedObject !== prevProps.selectedObject) {
      selectedObject && this.processSelectedObject(selectedObject)
      this.setState({
        colorSettingsOpened: false, fontSettingsOpened: false, lineSettingsOpened: false,
      })
    }
  }

  componentWillUnmount () {
    this.setState({
      colorSettingsOpened: false, fontSettingsOpened: false, lineSettingsOpened: false,
    })
  }

  handleAction = (actionFunc) => {
    this.setState({
      colorSettingsOpened: false, fontSettingsOpened: false, lineSettingsOpened: false,
    })
    actionFunc && actionFunc()
  }

  handleLineChanged = (newSize) => {
    const { selectedObject, onDrawUpdate } = this.props
    const { stroke } = selectedObject
    const { a } = fromCSSColor(stroke)
    const isMarker = a < 0.9

    selectedObject.set({ strokeWidth: isMarker ? lineToMarkerMap[newSize] : newSize })
    onDrawUpdate(selectedObject)
    this.setState({ currentSize: isMarker ? lineToMarkerMap[newSize] : newSize })
  }

  handleFontChanged = (newFontSize) => {
    const { selectedObject, onDrawUpdate } = this.props

    selectedObject.set({ fontSize: newFontSize })
    onDrawUpdate(selectedObject)
    this.setState({ currentFontSize: newFontSize })
  }

  handleColorChanged = (newColor) => {
    const { selectedObject, onDrawUpdate } = this.props
    const {
      type, fill, stroke,
    } = selectedObject

    if (type === ObjectTypes.TEXT) {
      selectedObject.set({ fill: toCSSColor({ ...newColor, a: 1 }) })
    } else if (LineTypes.includes(type)) {
      const { a } = fromCSSColor(stroke)

      selectedObject.set({ stroke: toCSSColor({ ...newColor, a }) })
    } else if (ShapeTypes.includes(type)) {
      const { a } = fromCSSColor(fill)

      selectedObject.set({
        stroke: toCSSColor({ ...newColor, a: 1 }),
        fill: a > 0.01 ? toCSSColor({ ...newColor, a: 1 }) : fill,
      })
    }
    onDrawUpdate(selectedObject)
    this.setState({ currentColor: RGBtoHEX(newColor) })
  }

  processSelectedObject (selectedObject) {
    const {
      type, fill, stroke, fontSize, strokeWidth,
    } = selectedObject

    const { a: fillA } = fill ? fromCSSColor(fill) : {}
    const showColorTool = ColorTypes.includes(type)
    const showFontTool = type === ObjectTypes.TEXT
    const showLineTool = LineTypes.includes(type) || (ShapeTypes.includes(type) && fillA < 0.01)

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
      showColorTool, currentColor, showFontTool, currentFontSize, showLineTool, currentSize, isMarker,
    })
  }

  render () {
    const {
      isLocked,
      onLock,
      onCopyPaste,
      onDelete,
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
    } = this.state

    return (
      <div className={css.contextMenuWrapper}>
        {!isLocked && (
          <>
            {showLineTool && (
            <SettingsGroup
              direction='top'
              isOpen={lineSettingsOpened}
              handleClose={() => this.setState({ lineSettingsOpened: false })}
              target={this.lineSettingsRef.current}
              content={(
                <LineSettings
                  currentSize={isMarker ? markerToLineMap[currentSize] : currentSize}
                  handleClick={this.handleLineChanged}
                />
              )}
            >
              <div
                className={cn(css.button, lineSettingsOpened && css.button_active)}
                onClick={() => this.setState({
                  lineSettingsOpened: !lineSettingsOpened,
                  colorSettingsOpened: false,
                  fontSettingsOpened: false,
                })}
                onKeyDown={() => this.setState({
                  lineSettingsOpened: !lineSettingsOpened,
                  colorSettingsOpened: false,
                  fontSettingsOpened: false,
                })}
                ref={this.lineSettingsRef}
              >
                <IconLineTool />
              </div>
            </SettingsGroup>
            )}
            {showFontTool && (
            <SettingsGroup
              direction='top'
              isOpen={fontSettingsOpened}
              handleClose={() => this.setState({ fontSettingsOpened: false })}
              target={this.fontSettingsRef.current}
              content={(
                <FontSettings
                  currentFontSize={currentFontSize}
                  handleClick={this.handleFontChanged}
                />
              )}
            >
              <FontItem
                fontSize={48}
                innerRef={this.fontSettingsRef}
                isActive={fontSettingsOpened}
                handleClick={() => this.setState({
                  fontSettingsOpened: !fontSettingsOpened,
                  lineSettingsOpened: false,
                  colorSettingsOpened: false,
                })}
              />
            </SettingsGroup>
            )}
            {showColorTool && (
            <SettingsGroup
              direction='top'
              isOpen={colorSettingsOpened}
              handleClose={() => this.setState({ colorSettingsOpened: false })}
              target={this.colorSettingsRef.current}
              content={(
                <ColorSettings
                  currentColor={currentColor}
                  handleClick={this.handleColorChanged}
                />
              )}
            >
              <ColorItem
                webColor={currentColor}
                innerRef={this.colorSettingsRef}
                isActive={colorSettingsOpened}
                handleClick={() => this.setState({
                  colorSettingsOpened: !colorSettingsOpened,
                  fontSettingsOpened: false,
                  lineSettingsOpened: false,
                })}
              />
            </SettingsGroup>
            )}
            {showColorTool && (
            <div className={css.divider} />
            )}
          </>
        )}
        <div
          className={cn(css.button)}
          onClick={() => this.handleAction(onLock)}
          onKeyDown={() => this.handleAction(onLock)}
        >
          {isLocked ? <IconLockLocked /> : <IconLockUnlocked />}
        </div>
        {!isLocked && (
          <>
            <div
              className={cn(css.button)}
              onClick={onCopyPaste}
              onKeyDown={onCopyPaste}
            >
              <IconCopyPaste />
            </div>
            <div
              className={cn(css.button)}
              onClick={onDelete}
              onKeyDown={onDelete}
            >
              <IconDelete />
            </div>
            <div className={css.divider} />
            <div
              className={cn(css.button)}
              onClick={() => this.handleAction(onBringToFront)}
              onKeyDown={() => this.handleAction(onBringToFront)}
            >
              <IconBringFront />
            </div>
            <div
              className={cn(css.button)}
              onClick={() => this.handleAction(onSendToBack)}
              onKeyDown={() => this.handleAction(onSendToBack)}
            >
              <IconBringBack />
            </div>
          </>
        )}
      </div>
    )
  }
}
