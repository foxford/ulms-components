/* eslint-disable react/jsx-props-no-spreading,max-classes-per-file,jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */
import React from 'react'
import { injectIntl, IntlProvider } from 'react-intl'
import { defaultToolSettings, toolEnum } from '@ulms/ui-drawing'
import cn from 'classnames-es'

import { messagesIntl } from '../lang'

import { ChildrenDrawingToolbar } from './children-drawing-toolbar'
import { AdultDrawingToolbar } from './adult-drawing-toolbar'
import { groupTypes } from './constants'
import css from './drawing-toolbar.module.css'
import { OptionsToolbar } from './options-toolbar'
import { StampSettings } from './components/stamp-settings'

import IconLib from './icons/children-lib-tool-icon.svg'
import IconAnimation from './icons/children-animation-tool-icon.svg'

function supportPointerEvent () {
  return 'PointerEvent' in window
}

const toolsWithOptions = [
  toolEnum.SHAPE,
  toolEnum.LINE,
  toolEnum.PEN,
  toolEnum.TEXT,
]

const eventName = supportPointerEvent() ? 'pointerdown' : 'mousedown'

export class CDrawingToolbarComponent extends React.Component {
  constructor (props) {
    super(props)

    this.toolbarRef = React.createRef()

    this.state = {
      opened: '',
      stampOpened: false,
      showMoreOpened: false,
      currentStamp: defaultToolSettings.stamp,
    }
  }

  componentDidMount () {
    document.addEventListener(eventName, this.handleDocumentClickEvent)
  }

  componentDidUpdate (prevProps) {
    const {
      tool, brushMode, handleChange, sendEvent,
    } = this.props
    const { opened } = this.state

    if (tool !== prevProps.tool && tool !== toolEnum.STAMP) {
      this.setState({ stampOpened: false, showMoreOpened: false })
    }

    if (tool !== prevProps.tool || brushMode !== prevProps.brushMode) {
      setTimeout(() => { // Чтобы успели примениться значения для getOptions
        const options = this.toolbarRef.current.getOptions(tool, brushMode)

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
    const { handleChange, horizontal } = this.props
    const { opened } = this.state

    if (!horizontal && tool === opened) {
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

  handleAnimationClick = () => {
    const { handleChange, onAnimation } = this.props

    this.setState({ opened: toolEnum.ANIMATION })

    handleChange({ tool: toolEnum.ANIMATION })
    onAnimation()
  }

  handleStampClick = () => {
    const { handleChange, tool } = this.props

    if (tool !== toolEnum.STAMP) {
      handleChange({ tool: toolEnum.STAMP })
    }
    this.toggleOpened(groupTypes.GROUP_STAMP)
  }

  handleChildrenStampOpen = () => {
    const { handleChange, tool } = this.props
    const { currentStamp } = this.state

    if (tool !== toolEnum.STAMP) {
      handleChange({ tool: toolEnum.STAMP, brushMode: currentStamp })
    }
    this.setState({ stampOpened: true, showMoreOpened: false })
  }

  handleShowMoreOpen = () => {
    const { showMoreOpened } = this.state

    this.setState({ stampOpened: false, showMoreOpened: !showMoreOpened })
  }

  handleChildrenStampClick = (param) => {
    const { handleChange } = this.props

    handleChange({ tool: toolEnum.STAMP, brushMode: param })
    this.setState({ currentStamp: param })
  }

  handleDocumentClickEvent = (event) => {
    const {
      opened, stampOpened, showMoreOpened,
    } = this.state

    if (opened === '' && !stampOpened && !showMoreOpened) return

    // TODO: remove implicit functional based on classnames
    const closestToolbarElement = event.target.closest(`.${css.root}`)
    const closestFloaterElement = event.target.closest(`.${css.floater}`)
    const closestFloaterMenuElement = event.target.closest(`.${css.floaterMenu}`)

    if (closestToolbarElement === null && closestFloaterElement === null && closestFloaterMenuElement === null) {
      this.setState({
        opened: '', stampOpened: false, showMoreOpened: false,
      })
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
      noSeparator,
      tool,
      tools,
      horizontal,
      selectedObject,
      onDrawUpdate,
    } = this.props
    const {
      opened, stampOpened, showMoreOpened,
    } = this.state

    const props = {
      brushColor,
      brushMode,
      handleChange,
      sendEvent,
      intl,
      noSeparator,
      tool,
      tools,
      handleOpen: this.handleOpen,
      handleImageClick: this.handleImageClick,
      handleLibClick: this.handleLibClick,
      opened,
      css,
    }

    return horizontal ? (
      <div className={css.wrapper}>
        <div className={cn(css.optionsWrapper, {
          [css.optionsWrapper_opened]: (selectedObject || toolsWithOptions.includes(tool)) && !showMoreOpened,
        })}
        >
          <OptionsToolbar
            tool={tool}
            brushMode={brushMode}
            handleChange={handleChange}
            ref={this.toolbarRef}
            selectedObject={selectedObject}
            onDrawUpdate={onDrawUpdate}
          />
        </div>
        <div className={css.toolbarWrapper}>
          <div className={cn(css.floaterMenu, stampOpened && css.floaterMenu_opened)}>
            <StampSettings
              handleClick={this.handleChildrenStampClick}
              brushMode={brushMode}
              intl={intl}
              childrenStyle
            />
          </div>
          <div className={cn(css.floaterMenu, showMoreOpened && css.floaterMenu_opened)}>
            <div className={css.floaterMenu__wrapper}>
              <div
                className={cn(css.floaterMenu__item, tool === toolEnum.LIB && css.floaterMenu__item_active)}
                onClick={this.handleLibClick}
              >
                <span className={css.floaterMenu__icon}><IconLib /></span>
                {intl.formatMessage({ id: 'LIB_MENU' })}
              </div>
              <div
                className={cn(css.floaterMenu__item, tool === toolEnum.ANIMATION && css.floaterMenu__item_active)}
                onClick={this.handleAnimationClick}
              >
                <span className={css.floaterMenu__icon}><IconAnimation /></span>
                {intl.formatMessage({ id: 'ANIMATION' })}
              </div>
            </div>
          </div>
          <ChildrenDrawingToolbar
            {...props}
            handleStampOpen={this.handleChildrenStampOpen}
            handleShowMoreOpen={this.handleShowMoreOpen}
            showMoreOpened={showMoreOpened}
          />
        </div>
      </div>
    ) : (
      <AdultDrawingToolbar {...props} ref={this.toolbarRef} />
    )
  }
}

const DrawingToolbarComponent = injectIntl(CDrawingToolbarComponent)

class DrawingToolbarIntl extends React.PureComponent {
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
