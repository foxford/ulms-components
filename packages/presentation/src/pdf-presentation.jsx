/* eslint-disable react/prop-types, react/jsx-props-no-spreading */
import React from 'react'
import debounce from 'lodash/debounce'

import { Presentation } from './presentation'
import { getDocument, getImage, keyFn, renderPage } from './utils/pdf-rendering'

const reportError = error => console.error(error) // eslint-disable-line no-console

export class PDFPresentation extends React.Component {
  static CANVAS_WIDTH = 2048

  static CANVAS_HEIGHT = 1536

  static CANVAS_PREVIEW_WIDTH = 120

  static CANVAS_PREVIEW_HEIGHT = 68

  constructor () {
    super()

    this.debouncedUpdateCollection = debounce(this.updateCollection, 100)

    this.mounted = false

    this.state = {
      pagesCollection: [],
    }
  }

  componentDidMount () {
    const { url } = this.props

    this.mounted = true

    if (url) {
      this.updateCollection()
    }
  }

  componentDidUpdate (prevProps) {
    const { url, onPagesUpdated } = this.props

    if (url !== prevProps.url) {
      this.setState({ pagesCollection: [] }) // eslint-disable-line
      onPagesUpdated && onPagesUpdated(0)
      this.updateCollection()
    }
  }

  componentWillUnmount () {
    this.mounted = false
  }

  createCollection = (count) => {
    const { tokenProvider, url } = this.props
    const {
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      CANVAS_PREVIEW_WIDTH,
      CANVAS_PREVIEW_HEIGHT,
    } = PDFPresentation
    const collection = []

    const getter = (documentUrl, documentPage, width, height) => () => {
      tokenProvider()
        .then(token => renderPage(documentUrl, documentPage, width, height, { httpHeaders: { authorization: `Bearer ${token}` } }))
        .then(() => {
          this.debouncedUpdateCollection()

          return null
        }).catch(reportError)

      return null
    }

    for (let i = 0; i < count; i++) {
      const page = i + 1
      const imageDataCached = getImage(keyFn(url, page, CANVAS_WIDTH, CANVAS_HEIGHT))
      const previewDataCached = getImage(keyFn(url, page, CANVAS_PREVIEW_WIDTH, CANVAS_PREVIEW_HEIGHT)) // eslint-disable-line max-len
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
          get: getter(url, page, CANVAS_WIDTH, CANVAS_HEIGHT),
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
    const {
      tokenProvider, url, onPagesUpdated,
    } = this.props

    tokenProvider()
      .then(token => getDocument(url, { httpHeaders: { authorization: `Bearer ${token}` } }))
      .then((document) => {
        onPagesUpdated && onPagesUpdated(document.numPages)
        if (this.mounted) {
          this.setState({
            pagesCollection: this.createCollection(document.numPages),
          })
        }

        return null
      })
      .catch(reportError)
  }

  render () {
    const { pagesCollection } = this.state
    const {
      // eslint-disable-next-line no-unused-vars
      url, innerRef, ...otherProps
    } = this.props

    // TODO: fix other props handling
    return (
      <Presentation
        {...otherProps}
        innerRef={innerRef}
        collection={pagesCollection}
      />
    )
  }
}
