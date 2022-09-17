class CTokenProvider {
  constructor () {
    this._provider = null
    this._rq = []
  }

  setProvider (provider) {
    this._provider = provider

    if (this._provider !== null) {
      this._provider()
        .then((token) => {
          this._rq.forEach((p) => {
            p.resolve(token)
          })

          this._rq = []

          return null
        })
        .catch(error => console.log(error)) // eslint-disable-line no-console
    }
  }

  getToken () {
    let p

    if (this._provider === null) {
      p = new Promise((resolve, reject) => {
        this._rq.push({ resolve, reject })
      })
    } else {
      p = this._provider()
    }

    return p
  }
}

const TokenProvider = new CTokenProvider()

export default TokenProvider
