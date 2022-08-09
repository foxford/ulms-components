// eslint-disable-next-line max-classes-per-file
import React from 'react'
import { injectIntl, IntlProvider } from 'react-intl'
import { toolEnum } from '@ulms/ui-drawing'

import { messagesIntl } from '../lang/index'

import { PenGroup } from './components/pen-group'
import { LineGroup } from './components/line-group'
import { TextGroup } from './components/text-group'
import { StampGroup } from './components/stamp-group'
import { ShapeGroup } from './components/shape-group'
import { Divider } from './components/divider'
import { ToolbarButton } from './components/toolbar-button'

import { groupTypes } from './constants'

import css from './drawing-toolbar.module.css'
import IconEraser from './icons/eraser-tool-icon.svg'
import IconImage from './icons/image-tool-icon.svg'
import IconPan from './icons/pan-toolbar-icon.svg'
import IconSelect from './icons/select-tool-icon.svg'
import IconLib from './icons/lib-tool-icon.svg'
import { toCSSColor } from './utils'

function supportPointerEvent () {
  return 'PointerEvent' in window
}

const eventName = supportPointerEvent() ? 'pointerdown' : 'mousedown'

class _DrawingToolbarComponent extends React.Component {
  constructor (props) {
    super(props)

    this.state = { opened: '' }
  }

  componentDidMount () {
    document.addEventListener(eventName, this.handleDocumentClickEvent)
  }

  componentWillUnmount () {
    document.removeEventListener(eventName, this.handleDocumentClickEvent)
  }

  handleOpen = (tool, options = {}) => {
    const { handleChange } = this.props

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
    const { handleChange, tool } = this.props

    if (tool !== toolEnum.STAMP) {
      handleChange({ tool: toolEnum.STAMP })
    }
    this.toggleOpened(groupTypes.GROUP_STAMP)
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
      handleChange,
      intl,
      noSeparator,
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
    const showSeparator = !noSeparator && (isImageEnabled || isStampEnabled || isLibEnabled)

    return (
      <div className={css.root}>
        <div className={css.col} style={{ color: toCSSColor(brushColor) }}>
          { isSelectEnabled && (
            <ToolbarButton
              active={tool === toolEnum.SELECT}
              onClick={() => this.handleOpen(toolEnum.SELECT)}
              title={intl.formatMessage({ id: 'SELECT' })}
            >
              <IconSelect />
            </ToolbarButton>
          )}

          { isPanEnabled && (
            <ToolbarButton
              active={tool === toolEnum.PAN}
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
              handleOpen={options => this.handleOpen(toolEnum.PEN, options)}
              handleChange={handleChange}
            />
          )}

          { isShapeEnabled && (
            <ShapeGroup
              opened={opened === toolEnum.SHAPE}
              className={css.floater}
              intl={intl}
              tool={tool}
              handleOpen={options => this.handleOpen(toolEnum.SHAPE, options)}
              handleChange={handleChange}
            />
          )}

          { isLineEnabled && (
            <LineGroup
              opened={opened === toolEnum.LINE}
              className={css.floater}
              intl={intl}
              tool={tool}
              handleOpen={options => this.handleOpen(toolEnum.LINE, options)}
              handleChange={handleChange}
            />
          )}

          {isTextEnabled && (
            <TextGroup
              opened={opened === toolEnum.TEXT}
              className={css.floater}
              intl={intl}
              tool={tool}
              handleOpen={options => this.handleOpen(toolEnum.TEXT, options)}
              handleChange={handleChange}
            />
          )}

          { isEraserEnabled && (
            <ToolbarButton
              active={tool === toolEnum.ERASER}
              onClick={() => this.handleOpen(toolEnum.ERASER)}
              title={intl.formatMessage({ id: 'ERASER' })}
            >
              <IconEraser />
            </ToolbarButton>
          )}

          { showSeparator && <Divider horizontal /> }

          { isImageEnabled && (
            <ToolbarButton
              active={tool === toolEnum.IMAGE}
              onClick={this.handleImageClick}
              title={intl.formatMessage({ id: 'UPLOAD_IMAGE' })}
            >
              <IconImage />
            </ToolbarButton>
          )}

          { isStampEnabled && (
            <StampGroup
              opened={opened === toolEnum.STAMP}
              className={css.floater}
              intl={intl}
              tool={tool}
              handleOpen={options => this.handleOpen(toolEnum.STAMP, options)}
              handleChange={handleChange}
            />
          )}

          { isLibEnabled && (
            <ToolbarButton
              active={tool === toolEnum.LIB}
              group
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
