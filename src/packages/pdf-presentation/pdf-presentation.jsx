/* eslint-disable react/prop-types */
import React from 'react'
import debounce from 'lodash/debounce'

import { Presentation } from '../presentation/presentation'

import { getDocument, getImage, keyFn, renderPage } from './pdf-rendering'

const reportError = error => console.log(error) // eslint-disable-line no-console

export const CANVAS_WIDTH = 2048

export const CANVAS_HEIGHT = 1536

export const CANVAS_PREVIEW_WIDTH = 120

export const CANVAS_PREVIEW_HEIGHT = 68

export class PDFPresentation extends React.Component {
  constructor () {
    super()

    this.state = {
      pagesCollection: [],
    }

    this.createCollection = this.createCollection.bind(this)
    this.updateCollection = this.updateCollection.bind(this)

    this.debouncedUpdateCollection = debounce(this.updateCollection, 100)

    this.mounted = false
  }

  componentDidMount () {
    const { url } = this.props

    this.mounted = true

    if (url) {
      this.updateCollection()
    }
  }

  componentDidUpdate (prevProps) {
    const { url } = this.props

    if (url !== prevProps.url) {
      this.setState({ pagesCollection: [] }) // eslint-disable-line
      this.updateCollection()
    }
  }

  componentWillUnmount () {
    this.mounted = false
  }

  createCollection (count) {
    const { tokenProvider, url } = this.props
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

  updateCollection () {
    const { tokenProvider, url } = this.props

    tokenProvider()
      .then(token => getDocument(url, { httpHeaders: { authorization: `Bearer ${token}` } }))
      .then((document) => {
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
    const { url, ...otherProps } = this.props // eslint-disable-line no-unused-vars

    return (
      <Presentation
        {...otherProps}
        collection={pagesCollection}
      />
    )
  }
}
