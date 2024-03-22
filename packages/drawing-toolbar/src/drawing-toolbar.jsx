// eslint-disable-next-line max-classes-per-file
import React from 'react'
import { injectIntl, IntlProvider } from 'react-intl'
import { toolEnum } from '@ulms/ui-drawing'

import cn from 'classnames-es'

import { messagesIntl } from '../lang/index'

import { PenGroup } from './components/pen-group'
import { LineGroup } from './components/line-group'
import { TextGroup } from './components/text-group'
import { ShapeGroup } from './components/shape-group'
import { ToolbarButton } from './components/toolbar-button'

import css from './drawing-toolbar.module.css'
import IconEraser from './icons/eraser-tool-icon.svg'
import IconImage from './icons/image-tool-icon.svg'
import IconPan from './icons/pan-toolbar-icon.svg'
import IconSelect from './icons/select-tool-icon.svg'
import IconLib from './icons/lib-tool-icon.svg'
import IconStamp from './icons/stamp-tool-icon.svg'
import { toCSSColor } from './utils'

function supportPointerEvent () {
  return 'PointerEvent' in window
}

const eventName = supportPointerEvent() ? 'pointerdown' : 'mousedown'

class _DrawingToolbarComponent extends React.Component {
  constructor (props) {
    super(props)

    this.lineGroupRef = React.createRef()
    this.penGroupRef = React.createRef()
    this.shapeGroupRef = React.createRef()
    this.stampGroupRef = React.createRef()
    this.textGroupRef = React.createRef()

    this.state = { opened: '' }
  }

  componentDidMount () {
    document.addEventListener(eventName, this.handleDocumentClickEvent)
  }

  componentDidUpdate (prevProps) {
    const {
      tool, brushMode, handleChange, sendEvent,
    } = this.props
    const { opened } = this.state

    if (tool !== prevProps.tool || brushMode !== prevProps.brushMode) {
      setTimeout(() => { // Чтобы успели примениться значения для getOptions
        let options = null

        if (tool === toolEnum.TEXT) options = this.textGroupRef.current.getOptions()
        if (tool === toolEnum.SHAPE) options = this.shapeGroupRef.current.getOptions()
        if (tool === toolEnum.PEN) options = this.penGroupRef.current.getOptions()
        if (tool === toolEnum.LINE) options = this.lineGroupRef.current.getOptions()
        if (tool === toolEnum.STAMP) return
        if (tool === toolEnum.LIB) {
          this.handleLibClick()
          sendEvent('Lib', 'Open', {})

          return
        }
        if (tool === toolEnum.IMAGE) {
          this.handleImageClick()

          return
        }

        if (options) {
          if (tool === toolEnum.STAMP || tool === toolEnum.SHAPE || tool === toolEnum.TEXT) {
            handleChange({
              ...options, tool,
            })
            sendEvent(tool === toolEnum.STAMP ? 'Stamp' : tool, options.brushMode ? options.brushMode : null, options)
          } else {
            handleChange({
              ...options, tool, brushMode,
            })
            sendEvent(tool, brushMode, options)
          }
        } else {
          sendEvent(tool, null, {})
        }

        if (tool !== opened) {
          this.setState({ opened: '' })
        }
      }, 0)
    }
  }

  componentWillUnmount () {
    document.removeEventListener(eventName, this.handleDocumentClickEvent)
  }

  handleOpen = (tool, options = {}) => {
    const { handleChange } = this.props
    const { opened } = this.state

    if (tool === opened) {
      this.setState({ opened: '' })

      return
    }

    this.setState({ opened: tool })

    handleChange({ tool, ...options })
  }

  handleImageClick = () => {
    const { handleChange, onImageToolClick } = this.props

    this.setState({ opened: toolEnum.SELECT })

    handleChange({ tool: toolEnum.SELECT })
    onImageToolClick()
  }

  handleLibClick = () => {
    const { handleChange, onLib } = this.props

    this.setState({ opened: toolEnum.LIB })

    handleChange({ tool: toolEnum.LIB })
    onLib()
  }

  handleStampClick = () => {
    const { handleChange, onStamp } = this.props

    this.setState({ opened: toolEnum.STAMP })

    handleChange({ tool: toolEnum.STAMP, stampSrc: '' })
    onStamp()
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
      handleChange,
      sendEvent,
      intl,
      mobile,
      penGroupContainerStyles,
      penGroupDirection,
      penGroupOrientation,
      tool,
      tools,
    } = this.props
    const { opened } = this.state

    const isEraserEnabled = tools && tools.includes(toolEnum.ERASER)
    const isImageEnabled = tools && tools.includes(toolEnum.IMAGE)
    const isPanEnabled = tools && tools.includes(toolEnum.PAN)
    const isPenEnabled = tools && tools.includes(toolEnum.PEN)
    const isSelectEnabled = tools && tools.includes(toolEnum.SELECT)
    const isShapeEnabled = tools && tools.includes(toolEnum.SHAPE)
    const isLineEnabled = tools && tools.includes(toolEnum.LINE)
    const isTextEnabled = tools && tools.includes(toolEnum.TEXT)
    const isStampEnabled = tools && tools.includes(toolEnum.STAMP)
    const isLibEnabled = tools && tools.includes(toolEnum.LIB)

    return (
      <div className={css.root}>
        <div className={cn(mobile ? css.row : css.col)} style={{ color: toCSSColor(brushColor) }}>
          { isSelectEnabled && (
            <ToolbarButton
              active={tool === toolEnum.SELECT}
              dataTestId='board-panel-choose-button'
              onClick={() => this.handleOpen(toolEnum.SELECT)}
              title={intl.formatMessage({ id: 'SELECT' })}
            >
              <IconSelect />
            </ToolbarButton>
          )}

          { isPanEnabled && (
            <ToolbarButton
              active={tool === toolEnum.PAN}
              dataTestId='board-panel-move-button'
              onClick={() => this.handleOpen(toolEnum.PAN)}
              title={intl.formatMessage({ id: 'HAND' })}
            >
              <IconPan />
            </ToolbarButton>
          )}

          { isPenEnabled && (
            <PenGroup
              opened={opened === toolEnum.PEN}
              className={css.floater}
              intl={intl}
              tool={tool}
              brushMode={brushMode}
              ref={this.penGroupRef}
              handleOpen={options => this.handleOpen(toolEnum.PEN, options)}
              handleChange={handleChange}
              containerStyles={penGroupContainerStyles}
              direction={penGroupDirection}
              orientation={penGroupOrientation}
              sendEvent={sendEvent}
            />
          )}

          { isShapeEnabled && (
            <ShapeGroup
              dataTestId='board-panel-group-shape-button'
              opened={opened === toolEnum.SHAPE}
              className={css.floater}
              intl={intl}
              tool={tool}
              brushMode={brushMode}
              ref={this.shapeGroupRef}
              handleOpen={options => this.handleOpen(toolEnum.SHAPE, options)}
              handleChange={handleChange}
              sendEvent={sendEvent}
            />
          )}

          { isLineEnabled && (
            <LineGroup
              opened={opened === toolEnum.LINE}
              className={css.floater}
              intl={intl}
              tool={tool}
              brushMode={brushMode}
              ref={this.lineGroupRef}
              handleOpen={options => this.handleOpen(toolEnum.LINE, options)}
              handleChange={handleChange}
              sendEvent={sendEvent}
            />
          )}

          {isTextEnabled && (
            <TextGroup
              opened={opened === toolEnum.TEXT}
              className={css.floater}
              intl={intl}
              tool={tool}
              ref={this.textGroupRef}
              handleOpen={options => this.handleOpen(toolEnum.TEXT, options)}
              handleChange={handleChange}
              sendEvent={sendEvent}
            />
          )}

          { isEraserEnabled && (
            <ToolbarButton
              active={tool === toolEnum.ERASER}
              dataTestId='board-panel-eraser-button'
              onClick={() => this.handleOpen(toolEnum.ERASER)}
              title={intl.formatMessage({ id: 'ERASER' })}
            >
              <IconEraser />
            </ToolbarButton>
          )}

          { isImageEnabled && (
            <ToolbarButton
              active={tool === toolEnum.IMAGE}
              dataTestId='board-panel-image-button'
              onClick={this.handleImageClick}
              title={intl.formatMessage({ id: 'UPLOAD_IMAGE' })}
            >
              <IconImage />
            </ToolbarButton>
          )}

          { isStampEnabled && (
            <ToolbarButton
              active={tool === toolEnum.STAMP}
              dataTestId='board-panel-stamps-button'
              onClick={this.handleStampClick}
              title={intl.formatMessage({ id: 'STAMP' })}
            >
              <IconStamp />
            </ToolbarButton>
          )}

          { isLibEnabled && (
            <ToolbarButton
              active={tool === toolEnum.LIB}
              dataTestId='board-panel-library-button'
              onClick={this.handleLibClick}
              title={intl.formatMessage({ id: 'LIB' })}
            >
              <IconLib />
            </ToolbarButton>
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
