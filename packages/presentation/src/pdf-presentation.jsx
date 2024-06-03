/* eslint-disable react/prop-types, react/jsx-props-no-spreading */
import React from 'react'
import debounce from 'lodash/debounce'

import { Presentation } from './presentation'

function keyFunction(documentUrl, pageNumber, width, height) {
  return `${documentUrl}_${pageNumber}_${width}_${height}`
}
const reportError = (error) => console.error(error) // eslint-disable-line no-console

const documentCache = {}
const imageCache = {}
const tasks = {}

function getDocument(url, { httpHeaders }, trackEvent) {
  if (!documentCache[url]) {
    const t0 = window.performance.now()
    const documentPromise = window.pdfjsLib.getDocument({
      url,
      httpHeaders,
    }).promise

    // eslint-disable-next-line promise/catch-or-return
    documentPromise.then((document) => {
      const t1 = window.performance.now()

      if (trackEvent) {
        // eslint-disable-next-line promise/catch-or-return,promise/always-return
        document.getDownloadInfo().then((downloadInfo) => {
          const meta = {
            numPages: document.numPages,
            size: downloadInfo.length,
            url,
          }

          trackEvent(
            'Debug',
            'PDFJS.GetDocumentTime',
            'v1',
            (t1 - t0).toFixed(0),
            meta,
          )
        })
      }

      return null
    })

    documentCache[url] = documentPromise
  }

  return documentCache[url]
}

export function getImage(key) {
  return imageCache[key]
}

export function renderPage(
  documentUrl,
  pageNumber,
  width,
  height,
  { httpHeaders },
  trackEvent,
) {
  const key = keyFunction(documentUrl, pageNumber, width, height)
  let canvas
  let context
  let renderViewport

  if (!tasks[key]) {
    tasks[key] = new Promise((resolve, reject) => {
      let document
      let t0

      getDocument(documentUrl, { httpHeaders }, trackEvent)
        .then((_document) => {
          document = _document
          t0 = window.performance.now()

          return _document.getPage(pageNumber)
        })
        .then((page) => {
          const initialViewport = page.getViewport({ scale: 1 })
          const scale = Math.min(
            width / initialViewport.width,
            height / initialViewport.height,
          )

          renderViewport = page.getViewport({ scale })

          canvas = window.document.createElement('canvas')
          context = canvas.getContext('2d')

          canvas.width = renderViewport.width
          canvas.height = renderViewport.height

          context.clearRect(0, 0, canvas.width, canvas.height)

          const renderContext = {
            canvasContext: context,
            viewport: renderViewport,
          }

          return page.render(renderContext).promise
        })
        .then(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = window.URL.createObjectURL(blob)
              const imageData = {
                url,
                width: renderViewport.width,
                height: renderViewport.height,
              }

              context.clearRect(0, 0, canvas.width, canvas.height)
              canvas.width = 0
              canvas.height = 0
              canvas = null
              context = null
              renderViewport = null

              imageCache[`${documentUrl}_${pageNumber}_${width}_${height}`] =
                imageData

              const t1 = window.performance.now()

              if (trackEvent) {
                const meta = {
                  numPages: document.numPages,
                  pageNumber,
                  url: documentUrl,
                }

                trackEvent(
                  'Debug',
                  'PDFJS.PageRenderTime',
                  'v1',
                  (t1 - t0).toFixed(0),
                  meta,
                )
              }

              resolve(imageData)
            }

            resolve({})
          })

          return null
        })
        .catch((error) => reject(error))
    })
  }

  return tasks[key]
}

const MAX_NUMBER_ATTEMPTS_TO_REPEAT_REQUEST = 2
const REPEATED_REQUEST_TIMER_VALUE = 5

export class PDFPresentation extends React.Component {
  static CANVAS_WIDTH = 2048

  static CANVAS_HEIGHT = 1536

  static CANVAS_PREVIEW_WIDTH = 120

  static CANVAS_PREVIEW_HEIGHT = 68

  constructor() {
    super()

    this.debouncedUpdateCollection = debounce(this.updateCollection, 100)

    this.mounted = false

    this.attemptNumber = 0
    this.timerToRepeatedRequestId = null

    this.state = {
      hasError: false,
      pagesCollection: [],
      repeatedRequestTimer: REPEATED_REQUEST_TIMER_VALUE,
    }
  }

  componentDidMount() {
    const { url } = this.props

    this.mounted = true

    if (url) {
      this.updateCollection()
    }
  }

  componentDidUpdate(prevProps) {
    const { url, onPagesUpdated } = this.props

    if (url !== prevProps.url) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ pagesCollection: [] })

      if (onPagesUpdated) {
        onPagesUpdated(0)
      }

      this.updateCollection()
    }
  }

  componentWillUnmount() {
    this.mounted = false

    if (this.timerToRepeatedRequestId) {
      clearInterval(this.timerToRepeatedRequestId)
    }
  }

  createCollection = (count) => {
    const { tokenProvider, trackEvent, url } = this.props
    const {
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      CANVAS_PREVIEW_WIDTH,
      CANVAS_PREVIEW_HEIGHT,
    } = PDFPresentation
    const collection = []

    const getter =
      (documentUrl, documentPage, width, height, trackEventFunction) => () => {
        tokenProvider()
          .then((token) =>
            renderPage(
              documentUrl,
              documentPage,
              width,
              height,
              {
                httpHeaders: { authorization: `Bearer ${token}` },
              },
              trackEventFunction,
            ),
          )
          .then(() => {
            this.debouncedUpdateCollection()

            return null
          })
          .catch(reportError)

        return null
      }

    for (let index = 0; index < count; index++) {
      const page = index + 1
      const imageDataCached = getImage(
        keyFunction(url, page, CANVAS_WIDTH, CANVAS_HEIGHT),
      )
      const previewDataCached = getImage(
        keyFunction(url, page, CANVAS_PREVIEW_WIDTH, CANVAS_PREVIEW_HEIGHT),
      ) // eslint-disable-line max-len
      const item = {
        page,
        image: null,
        imageWidth: null,
        imageHeight: null,
        preview: null,
        previewWidth: null,
        previewHeight: null,
      }

      if (imageDataCached) {
        item.image = imageDataCached.url
        item.imageWidth = imageDataCached.width
        item.imageHeight = imageDataCached.height
      } else {
        Object.defineProperty(item, 'image', {
          get: getter(url, page, CANVAS_WIDTH, CANVAS_HEIGHT, trackEvent),
          enumerable: true,
          configurable: true,
        })
      }

      if (previewDataCached) {
        item.preview = previewDataCached.url
        item.previewWidth = previewDataCached.width
        item.previewHeight = previewDataCached.height
      } else {
        Object.defineProperty(item, 'preview', {
          get: getter(url, page, CANVAS_PREVIEW_WIDTH, CANVAS_PREVIEW_HEIGHT),
          enumerable: true,
          configurable: true,
        })
      }

      collection.push(item)
    }

    return collection
  }

  updateCollection = () => {
    const { tokenProvider, trackEvent, url, onPagesUpdated } = this.props

    tokenProvider()
      .then((token) =>
        getDocument(
          url,
          { httpHeaders: { authorization: `Bearer ${token}` } },
          trackEvent,
        ),
      )
      .then((document) => {
        if (onPagesUpdated) {
          onPagesUpdated(document.numPages)
        }

        if (this.mounted) {
          this.setState({
            pagesCollection: this.createCollection(document.numPages),
          })
        }

        return null
      })
      .catch((error) => {
        this.setState({ hasError: true })
        delete documentCache[url]
        reportError(error)
        this.startTimerToRepeatedRequest()
      })
  }

  startTimerToRepeatedRequest = () => {
    if (this.timerToRepeatedRequestId) return

    if (this.attemptNumber >= MAX_NUMBER_ATTEMPTS_TO_REPEAT_REQUEST) return

    this.timerToRepeatedRequestId = setInterval(() => {
      this.setState(
        (prevState) => ({
          repeatedRequestTimer: prevState.repeatedRequestTimer - 1,
        }),
        () => {
          const { repeatedRequestTimer } = this.state

          if (repeatedRequestTimer === 0) {
            clearInterval(this.timerToRepeatedRequestId)
            this.timerToRepeatedRequestId = null

            this.setState({
              hasError: false,
              repeatedRequestTimer: REPEATED_REQUEST_TIMER_VALUE,
            })

            this.updateCollection()

            this.attemptNumber += 1
          }
        },
      )
    }, 1000)
  }

  render() {
    const { hasError, pagesCollection, repeatedRequestTimer } = this.state
    const {
      // eslint-disable-next-line no-unused-vars
      url,
      innerRef,
      ...otherProps
    } = this.props

    const errorText = hasError
      ? `Произошла ошибка при загрузке презентации. ${
          this.attemptNumber === MAX_NUMBER_ATTEMPTS_TO_REPEAT_REQUEST
            ? 'Попробуйте перезагрузить страницу'
            : `Повторная попытка через ${repeatedRequestTimer}`
        }`
      : undefined

    // TODO: fix other props handling
    return (
      <Presentation
        {...otherProps}
        error={errorText}
        innerRef={innerRef}
        collection={pagesCollection}
        repeatRequest={this.repeatRequest}
      />
    )
  }
}
