// eslint-disable-next-line max-classes-per-file
import React from 'react'
import { injectIntl, IntlProvider } from 'react-intl'
import cn from 'classnames-es'
import { cond } from 'ramda'
import { Icons } from '@ulms/ui-icons'
import { penToolModeEnum, shapeToolModeEnum, toolEnum } from '@ulms/ui-drawing'

import { messagesIntl } from '../lang/index'

import { GroupColor } from './group-color'
import { GroupEraser } from './group-eraser'
import { GroupPen } from './group-pen'
import { GroupShape } from './group-shape'
import { GroupStamp } from './group-stamp'
import { Shapes } from './shapes'

import { groupTypes } from './constants'

import 'rc-slider/assets/index.css'
// TODO: move slider assets to css-module

import css from './drawing-toolbar.module.css'
import IconElementEraser from './icons/icon-tool-element-eraser.svg'
import IconGrid from './icons/icon-tool-grid.svg'
import IconImage from './icons/icon-tool-image.svg'
import IconLine from './icons/icon-tool-line.svg'
import IconMarker from './icons/icon-tool-marker.svg'
import IconPan from './icons/icon-tool-pan.svg'
import IconPencil from './icons/icon-tool-pencil.svg'
import IconSelect from './icons/icon-tool-select.svg'
import IconText from './icons/icon-tool-text.svg'
import IconStamp from './icons/icon-tool-stamp.svg'
import IconLib from './icons/icon-tool-lib.svg'
import { toCSSColor } from './utils'

function supportPointerEvent () {
  return 'PointerEvent' in window
}

const eventName = supportPointerEvent() ? 'pointerdown' : 'mousedown'

class _DrawingToolbarComponent extends React.Component {
  state = { opened: '' }

  componentDidMount () {
    document.addEventListener(eventName, this.handleDocumentClickEvent)
  }

  // FIXME: :point_down:
  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps (nextProps) {
    const { tool } = this.props

    const toolHasChanged = nextProps.tool !== tool
    const notEraser = nextProps.tool !== toolEnum.ERASER
    const notPen = nextProps.tool !== toolEnum.PEN
    const notShape = nextProps.tool !== toolEnum.SHAPE
    const notStamp = nextProps.tool !== toolEnum.STAMP

    if (toolHasChanged && notEraser && notPen && notShape && notStamp) {
      this.setState({ opened: '' })
    }
  }

  componentWillUnmount () {
    document.removeEventListener(eventName, this.handleDocumentClickEvent)
  }

  handleSelectClick = () => {
    const { handleChange } = this.props

    handleChange({ tool: toolEnum.SELECT })
  }

  handleEraserClick = () => {
    const { handleChange } = this.props

    handleChange({ tool: toolEnum.ERASER })
    this.toggleOpened(groupTypes.GROUP_ERASER)
  }

  handlePenClick = () => {
    const { handleChange, tool } = this.props

    if (tool !== toolEnum.PEN) {
      handleChange({ tool: toolEnum.PEN })
    }
    this.toggleOpened(groupTypes.GROUP_PEN)
  }

  handleColorClick = () => this.toggleOpened(groupTypes.GROUP_COLOR)

  handleImageClick = () => {
    const { handleChange, onImageToolClick } = this.props

    handleChange({ tool: toolEnum.SELECT })
    onImageToolClick()
  }

  handleShapeClick = () => {
    const { handleChange, tool } = this.props

    if (tool !== toolEnum.SHAPE) {
      handleChange({ tool: toolEnum.SHAPE })
    }
    this.toggleOpened(groupTypes.GROUP_SHAPE)
  }

  handleTextClick = () => {
    const { handleChange } = this.props

    handleChange({ tool: toolEnum.TEXT })
  }

  handleLockClick = () => {
    const { onLock, handleChange } = this.props

    handleChange({ tool: toolEnum.SELECT })
    onLock()
  }

  handlePanClick = () => {
    const { handleChange } = this.props

    handleChange({ tool: toolEnum.PAN })
  }

  handleLibClick = () => {
    const { handleChange, onLib } = this.props

    handleChange({ tool: toolEnum.LIB })
    onLib()
  }

  handleStampClick = () => {
    const { handleChange, tool } = this.props

    if (tool !== toolEnum.STAMP) {
      handleChange({ tool: toolEnum.STAMP })
    }
    this.toggleOpened(groupTypes.GROUP_STAMP)
  }

  handleGridClick = () => {
    const { handleChange, grid } = this.props

    handleChange({ grid: !grid })
  }

  handleDocumentClickEvent = (event) => {
    const { opened } = this.state

    if (opened === '') return

    // TODO: remove implicit functional based on classnames
    const closestToolbarElement = event.target.closest(`.${css.root}`)
    const closestFloaterElement = event.target.closest(`.${css.floater}`)

    if (closestToolbarElement === null && closestFloaterElement === null) {
      this.setState({ opened: '' })
    }
  }

  toggleOpened (val) {
    const { opened } = this.state

    this.setState({ opened: val !== opened ? val : '' })
  }

  render () {
    const {
      brushColor,
      brushMode,
      brushWidth,
      eraserWidth,
      grid,
      handleChange,
      hasLockSelection,
      intl,
      noSeparator,
      shapeMode,
      stampMode,
      tool,
      tools,
    } = this.props
    const { opened } = this.state

    const isColorEnabled = tools && tools.includes(toolEnum.COLOR)
    const isEraserEnabled = tools && tools.includes(toolEnum.ERASER)
    const isGridEnabled = tools && tools.includes(toolEnum.GRID)
    const isImageEnabled = tools && tools.includes(toolEnum.IMAGE)
    const isLockEnabled = tools && tools.includes(toolEnum.LOCK)
    const isPanEnabled = tools && tools.includes(toolEnum.PAN)
    const isPenEnabled = tools && tools.includes(toolEnum.PEN)
    const isSelectEnabled = tools && tools.includes(toolEnum.SELECT)
    const isShapeEnabled = tools && tools.includes(toolEnum.SHAPE)
    const isTextEnabled = tools && tools.includes(toolEnum.TEXT)
    const isStampEnabled = tools && tools.includes(toolEnum.STAMP)
    const isLibEnabled = tools && tools.includes(toolEnum.LIB)
    const showSeparator = !noSeparator && (isImageEnabled || isStampEnabled || isLibEnabled)

    return (
      <div className={css.root}>
        <div className={css.col} style={{ color: toCSSColor(brushColor) }}>
          { isSelectEnabled && (
            <div
              className={cn(css.button, { [css.active]: tool === toolEnum.SELECT })}
              onClick={this.handleSelectClick}
              onKeyDown={this.handleSelectClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'SELECT' })}
            >
              <IconSelect />
            </div>
          )}

          { isPenEnabled && (
            <div
              className={cn(
                css.button,
                css.group,
                groupTypes.GROUP_PEN,
                { [css.active]: tool === toolEnum.PEN || opened === groupTypes.GROUP_PEN }
              )}
              onClick={this.handlePenClick}
              onKeyDown={this.handlePenClick}
              role='button'
              tabIndex='0'
              title={brushMode === penToolModeEnum.MARKER
                ? intl.formatMessage({ id: 'HIGHLIGHTER' })
                : brushMode === penToolModeEnum.LINE
                  ? intl.formatMessage({ id: 'LINE' })
                  : intl.formatMessage({ id: 'PENCIL' })}
            >
              {
                    cond([
                      [_ => _ === penToolModeEnum.PENCIL, () => <IconPencil />],
                      [_ => _ === penToolModeEnum.MARKER, () => <IconMarker />],
                      [_ => _ === penToolModeEnum.LINE, () => <IconLine />],
                      [() => true, () => <IconPencil />],
                    ])(brushMode)
                  }
            </div>
          )}

          { isEraserEnabled && (
            <div
              className={cn(
                css.button, css.group, groupTypes.GROUP_ERASER,
                { [css.active]: tool === toolEnum.ERASER || opened === groupTypes.GROUP_ERASER }
              )}
              onClick={this.handleEraserClick}
              onKeyDown={this.handleEraserClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'ERASER' })}
            >
              <IconElementEraser />
            </div>
          )}

          { isColorEnabled && (
            <div
              className={cn(
                css.button,
                css.group,
                groupTypes.GROUP_COLOR,
                { [css.active]: opened === groupTypes.GROUP_COLOR }
              )}
              onClick={this.handleColorClick}
              onKeyDown={this.handleColorClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'COLOUR' })}
            >
              <div
                className={css.colorButtonInner}
                style={{ background: brushColor ? toCSSColor(brushColor) : '#000' }}
              />
            </div>
          )}

          { isShapeEnabled && (
            <div
              className={cn(
                css.button,
                css.group,
                groupTypes.GROUP_SHAPE,
                { [css.active]: tool === toolEnum.SHAPE || opened === groupTypes.GROUP_SHAPE }
              )}
              onClick={this.handleShapeClick}
              onKeyDown={this.handleShapeClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'SHAPE' })}
            >
              {
                cond([
                  [_ => _ === shapeToolModeEnum.CIRCLE, () => <Shapes shape='circle' />],
                  [_ => _ === shapeToolModeEnum.CIRCLE_SOLID, () => <Shapes shape='circle' solid />],
                  [_ => _ === shapeToolModeEnum.RECT, () => <Shapes shape='square' />],
                  [_ => _ === shapeToolModeEnum.RECT_SOLID, () => <Shapes shape='square' solid />],
                  [_ => _ === shapeToolModeEnum.TRIANGLE, () => <Shapes shape='triangle' />],
                  [_ => _ === shapeToolModeEnum.TRIANGLE_SOLID, () => <Shapes shape='triangle' solid />],
                  [() => true, () => <Shapes shape='square' />],
                ])(shapeMode)
              }
            </div>
          )}

          { isTextEnabled && (
            <div
              className={cn(css.button, { [css.active]: tool === toolEnum.TEXT })}
              onClick={this.handleTextClick}
              onKeyDown={this.handleTextClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'TEXT' })}
            >
              <div className={css.buttonInner}>
                <IconText />
              </div>
            </div>
          )}

          { isLockEnabled && (
            <button
              className={css.button}
              disabled={!hasLockSelection}
              onClick={this.handleLockClick}
              type='button'
            >
              <div className={cn(css.buttonInner, css.svgStroke)} title={intl.formatMessage({ id: 'LOCK' })}>
                <Icons name='lock-outline' />
              </div>
            </button>
          )}

          { isPanEnabled && (
            <div
              className={cn(css.button, { [css.active]: tool === toolEnum.PAN })}
              onClick={this.handlePanClick}
              onKeyDown={this.handlePanClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'HAND' })}
            >
              <IconPan />
            </div>
          )}

          { isGridEnabled && (
            <div
              className={cn(css.button, { [css.active]: grid })}
              onClick={this.handleGridClick}
              onKeyDown={this.handleGridClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'GRID' })}
            >
              <IconGrid />
            </div>
          )}

          { showSeparator && <div className={css.separator} /> }

          { isImageEnabled && (
            <div
              className={css.button}
              onClick={this.handleImageClick}
              onKeyDown={this.handleImageClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'UPLOAD_IMAGE' })}
            >
              <IconImage />
            </div>
          )}

          { isStampEnabled && (
            <div
              className={cn(
                css.button,
                css.group,
                groupTypes.GROUP_STAMP,
                { [css.active]: tool === toolEnum.STAMP || opened === groupTypes.GROUP_STAMP }
              )}
              onClick={this.handleStampClick}
              onKeyDown={this.handleStampClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'STAMP' })}
            >
              <IconStamp />
            </div>
          )}

          { isLibEnabled && (
            <div
              className={cn(css.button, { [css.active]: tool === toolEnum.LIB })}
              onClick={this.handleLibClick}
              onKeyDown={this.handleLibClick}
              role='button'
              tabIndex='0'
              title={intl.formatMessage({ id: 'LIB' })}
            >
              <IconLib />
            </div>
          )}

          { isPenEnabled && (
            <GroupPen
              brushMode={brushMode}
              brushWidth={brushWidth}
              css={css}
              handleChange={handleChange}
              opened={opened}
              tool={tool}
            />
          )}

          { isEraserEnabled && (
            <GroupEraser
              css={css}
              eraserWidth={eraserWidth}
              handleChange={handleChange}
              opened={opened}
            />
          )}

          { isColorEnabled && (
            <GroupColor
              brushColor={brushColor}
              css={css}
              handleChange={handleChange}
              opened={opened}
            />
          )}

          { isShapeEnabled && (
            <GroupShape
              brushColor={brushColor}
              css={css}
              handleChange={handleChange}
              opened={opened}
              shapeMode={shapeMode}
              tool={tool}
            />
          )}

          { isStampEnabled && (
            <GroupStamp
              css={css}
              handleChange={handleChange}
              opened={opened}
              eraserWidth={eraserWidth}
              stampMode={stampMode}
              tool={tool}
            />
          )}
        </div>
      </div>
    )
  }
}

const DrawingToolbarComponent = injectIntl(_DrawingToolbarComponent)

export class DrawingToolbarIntl extends React.PureComponent {
  render () {
    const {
      defaultLocale = 'ru',
      locale = 'ru',
      ...props
    } = this.props

    return (
      <IntlProvider
        defaultLocale={defaultLocale}
        key={locale}
        locale={locale}
        messages={messagesIntl[locale]}
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <DrawingToolbarComponent {...props} />
      </IntlProvider>
    )
  }
}

export { DrawingToolbarIntl as DrawingToolbar }
