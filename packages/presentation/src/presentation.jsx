/* eslint-disable max-len, react/prop-types, jsx-a11y/no-static-element-interactions, react/jsx-one-expression-per-line,max-classes-per-file,react/jsx-props-no-spreading */
import React from 'react'
import { injectIntl, IntlProvider } from 'react-intl'
import VisibilitySensor from 'react-visibility-sensor'
import cx from 'classnames-es'
import PropTypes from 'prop-types'
import scrollIntoView from 'scroll-into-view-if-needed'
import { Icons } from '@ulms/ui-icons'
import { SizeMe } from 'react-sizeme'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

import { messagesIntl } from '../lang/index'

import Spinner from './spinner'

import css from './presentation.module.css'

function calculateSize(
  containerWidth,
  containerHeight,
  imageWidth,
  imageHeight,
) {
  const scale = Math.min(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  )

  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
  }
}

function calculateFitSize(
  containerWidth,
  containerHeight,
  imageWidth,
  imageHeight,
) {
  const scale = containerWidth / imageWidth

  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
  }
}

class PresentationComponent extends React.Component {
  prevImageWidth

  prevImageHeight

  componentDidMount() {
    this.maybeScrollToActive()
  }

  componentDidUpdate(prevProps) {
    const { index } = this.props

    if (prevProps.index !== index) {
      this.maybeScrollToActive()
    }
  }

  handlePrevious = () => {
    const { index, onChange } = this.props

    if (index > 0) {
      onChange(index - 1)
    }
  }

  handleNext = () => {
    const { index, collection, onChange } = this.props

    if (index < collection.length - 1) {
      onChange(index + 1)
    }
  }

  handleKeyDownEvent = (event) => {
    switch (event.keyCode) {
      case 33: // PageUp
      // falls through

      case 37: {
        // ArrowLeft
        this.handlePrevious()

        break
      }

      case 34: // PageDown
      // falls through

      case 39: {
        // ArrowRight
        this.handleNext()

        break
      }

      default:
      // Nothing to do here...
    }
  }

  handlePageResize = (width, height) => {
    const { onPageResize } = this.props

    if (
      onPageResize &&
      this.prevImageWidth !== width &&
      this.prevImageHeight !== height
    ) {
      this.prevImageWidth = width
      this.prevImageHeight = height

      onPageResize(width, height)
    }
  }

  maybeScrollToActive = () => {
    const { showPreviews } = this.props

    if (showPreviews) {
      this.scrollToActive()
    }
  }

  scrollToActive() {
    const element = this.container.querySelector(
      `.${css.preview}.${css.active}`,
    )

    if (element) {
      scrollIntoView(element, {
        behavior: 'smooth',
        block: 'nearest',
        scrollMode: 'if-needed',
      })
    }
  }

  render() {
    const {
      centered = 'Horizontal',
      collection,
      fitToWidth,
      error,
      index,
      innerRef,
      intl,
      onChange,
      showActions,
      showPagesCount,
      showPreviews,
      slotSlide,
      transformWrapperProps,
    } = this.props

    return (
      <div
        ref={(ref) => {
          this.container = ref
        }}
        className={css.root}
        onKeyDown={this.handleKeyDownEvent}
        tabIndex={-1}
        data-presentation-root
      >
        <div className={cx(css.listWrapper, showPreviews && css.isShown)}>
          <div className={css.list} data-testid="presentation-preview-panel">
            {collection.map((item, index_) => (
              <div
                className={cx(css.preview, index_ === index && css.active)}
                key={index_} // eslint-disable-line react/no-array-index-key
                onClick={() => {
                  onChange(index_)
                }}
                onKeyPress={() => {
                  onChange(index_)
                }}
                role="button"
                tabIndex={0}
              >
                <div className={css.number}>{item.page}</div>
                <div className={css.image}>
                  {showPreviews && (
                    <VisibilitySensor partialVisibility>
                      {({ isVisible }) =>
                        isVisible && item.preview ? (
                          <img alt="preview" src={item.preview} />
                        ) : (
                          <div className={css.placeholder} />
                        )
                      }
                    </VisibilitySensor>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={css.slideWrapper}>
          <SizeMe monitorHeight refreshRate={150}>
            {({ size: { height, width } }) => {
              let result

              if (
                collection[index] &&
                collection[index].image &&
                height > 0 &&
                width > 0
              ) {
                const imageSize = fitToWidth
                  ? calculateFitSize(
                      width,
                      height,
                      collection[index].imageWidth,
                      collection[index].imageHeight,
                    )
                  : calculateSize(
                      width,
                      height,
                      collection[index].imageWidth,
                      collection[index].imageHeight,
                    )

                this.handlePageResize(imageSize.width, imageSize.height)

                result = (
                  <div
                    className={cx(css.slide, { [css.fitToWidth]: fitToWidth })}
                    ref={innerRef}
                    data-id="presentation-slide"
                  >
                    <TransformWrapper disabled {...transformWrapperProps}>
                      <TransformComponent
                        contentClass={css.transformComponent}
                        wrapperClass={css.transformWrapper}
                      >
                        <img
                          alt="mainimage"
                          className={cx(css.mainImage, {
                            [css[`centered${centered}`]]: !fitToWidth,
                          })}
                          src={collection[index].image}
                          width={imageSize.width}
                          height={imageSize.height}
                        />
                        {slotSlide && (
                          <div
                            className={cx(css.slotSlide, {
                              [css[`centered${centered}`]]: !fitToWidth,
                            })}
                          >
                            {slotSlide(imageSize.width, imageSize.height)}
                          </div>
                        )}
                      </TransformComponent>
                    </TransformWrapper>
                  </div>
                )
              } else {
                result = (
                  <div
                    className={cx(
                      css.slide,
                      { [css.fitToWidth]: fitToWidth },
                      css.slide_centerContent,
                    )}
                    data-id="presentation-slide"
                    ref={innerRef}
                  >
                    {error ? <p>{error}</p> : <Spinner />}
                  </div>
                )
              }

              return result
            }}
          </SizeMe>
          {collection[index] &&
            (showPagesCount || (showActions && onChange)) && (
              <div className={css.controls}>
                {showActions && onChange && (
                  <div>
                    <button
                      type="button"
                      className={css.linkArrow}
                      onClick={this.handlePrevious}
                      disabled={index === 0}
                      data-presentation-previous
                    >
                      <span className={css.linkArrowIcon}>
                        <Icons name="arrow-left" size="xs" />
                      </span>
                      {intl.formatMessage({ id: 'PREVIOUS' })}
                    </button>
                  </div>
                )}
                {showPagesCount && (
                  <div className={css.text}>
                    {intl.formatMessage(
                      { id: 'PAGES' },
                      {
                        page: collection[index].page,
                        total: collection.length,
                      },
                    )}
                  </div>
                )}
                {showActions && onChange && (
                  <div>
                    <button
                      type="button"
                      className={css.linkArrow}
                      onClick={this.handleNext}
                      disabled={index === collection.length - 1}
                      data-presentation-next
                    >
                      {intl.formatMessage({ id: 'NEXT' })}
                      <span className={css.linkArrowIcon}>
                        <Icons name="arrow-right" size="xs" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    )
  }
}

PresentationComponent.defaultProps = {
  centered: 'Horizontal',
}

PresentationComponent.propTypes = {
  centered: PropTypes.oneOf(['Both', 'Horizontal', 'Vertical']),
}

const PresentationComponentIntl = injectIntl(PresentationComponent)

export class PresentationIntl extends React.PureComponent {
  render() {
    const {
      defaultLocale = 'ru',
      locale = 'ru',
      innerRef,
      ...props
    } = this.props

    return (
      <IntlProvider
        defaultLocale={defaultLocale}
        key={locale}
        locale={locale}
        messages={messagesIntl[locale]}
      >
        <PresentationComponentIntl {...props} innerRef={innerRef} />
      </IntlProvider>
    )
  }
}

export { PresentationIntl as Presentation }
