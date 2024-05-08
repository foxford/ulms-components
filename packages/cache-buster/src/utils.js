/* eslint-disable max-classes-per-file */
function toSemver(versionString) {
  const [major, minor, patch] = versionString.split('.')

  return {
    major,
    minor,
    patch,
  }
}

export class FetchVersionResolver {
  constructor(url, key = 'version') {
    this._url = url
    this._key = key
  }

  resolve() {
    return fetch(this._url, { cache: 'no-cache' })
      .then((response) => response.json())
      .then((response) => response[this._key])
  }
}

export class VersionChecker {
  constructor(resolver, version) {
    this._resolver = resolver
    this._version = version

    this._checkPromise = null
  }

  static compare(local, remote) {
    const localVersion = toSemver(local)
    const remoteVersion = toSemver(remote)

    return {
      major: localVersion.major !== remoteVersion.major,
      minor: localVersion.minor !== remoteVersion.minor,
      patch: localVersion.patch !== remoteVersion.patch,
    }
  }

  check() {
    if (!this._checkPromise) {
      this._checkPromise = this._resolver
        .resolve()
        .then((version) => {
          this._checkPromise = null

          return { version, ...VersionChecker.compare(this._version, version) }
        })
        .catch((error) => {
          this._checkPromise = null

          return { error }
        })
    }

    return this._checkPromise
  }

  destroy() {
    this._resolver = null
    this._checkPromise = null
  }
}
