class CTokenProvider {
  constructor() {
    this._provider = null
    this._rq = []
  }

  setProvider(provider) {
    this._provider = provider

    if (this._provider !== null) {
      this._provider()
        .then((token) => {
          for (const p of this._rq) {
            p.resolve(token)
          }

          this._rq = []

          return null
        })
        .catch((error) => console.log(error)) // eslint-disable-line no-console
    }
  }

  getToken() {
    return this._provider === null
      ? new Promise((resolve, reject) => {
          this._rq.push({ resolve, reject })
        })
      : this._provider()
  }
}

const TokenProvider = new CTokenProvider()

export default TokenProvider
