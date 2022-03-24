import React from 'react'

import { FetchVersionResolver, VersionChecker } from './utils'

const refresh = () => globalThis.location.reload()

class CacheBuster extends React.Component {
  state = {
    error: null,
    loading: true,
    versionMismatch: true,
  }

  constructor (props) {
    super(props)

    this.intervalId = null
    this._versionChecker = null
  }

  componentDidMount () {
    const {
      interval, url, version: localVersion,
    } = this.props

    const resolver = new FetchVersionResolver(url)

    this._versionChecker = new VersionChecker(resolver, localVersion)

    if (interval) {
      this.intervalId = setInterval(() => {
        this._versionChecker.check()
          .then(this.checkMajorVersion)
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.log('[CacheBuster] interval check error:', error)
          })
      }, interval * 1e3)
    }

    this._versionChecker.check()
      .then(this.checkVersion)
      .catch((error) => {
        this.setState({
          error,
          loading: false,
          versionMismatch: true,
        })
      })
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)

    this.intervalId = null

    if (this._versionChecker) {
      this._versionChecker.destroy()

      this._versionChecker = null
    }
  }

  checkMajorVersion = (result) => {
    const {
      error, major, version,
    } = result

    if (error) {
      // eslint-disable-next-line no-console
      console.log('[CacheBuster] interval check error:', error)
    } else if (major) {
      // eslint-disable-next-line no-console
      console.log(`[CacheBuster] app version ${version} - refresh needed (forced)`)

      refresh()
    }
  }

  checkVersion = (result) => {
    const {
      error, major, minor, patch, version,
    } = result

    if (error) {
      // eslint-disable-next-line no-console
      console.log('[CacheBuster] initial check error:', error)

      this.setState({
        error,
        loading: false,
        versionMismatch: true,
      })

      return
    }

    const versionMismatch = major || minor || patch

    // eslint-disable-next-line no-console
    console.log(`[CacheBuster] app version ${version} - ${versionMismatch ? 'refresh needed' : 'OK'}`)

    this.setState({
      error: null,
      loading: false,
      versionMismatch,
    })
  }

  render () {
    const { children } = this.props
    const {
      error,
      loading,
      versionMismatch,
    } = this.state

    return children({
      error,
      loading,
      refresh,
      versionMismatch,
    })
  }
}

CacheBuster.defaultProps = {
  interval: 30,
  url: './meta.json',
  version: '',
}

export { CacheBuster }
