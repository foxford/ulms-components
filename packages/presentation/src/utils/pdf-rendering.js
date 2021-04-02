const service = window.pdfjsLib

// TODO: do not use cache at module
const documentCache = {}
const imageCache = {}
const tasks = {}

export function keyFn (documentUrl, pageNumber, width, height) {
  return `${documentUrl}_${pageNumber}_${width}_${height}`
}

export function getDocument (url, { httpHeaders }) {
  if (!documentCache[url]) {
    documentCache[url] = service.getDocument({ url, httpHeaders })
  }

  return documentCache[url]
}

export function getImage (key) {
  return imageCache[key]
}

export function renderPage (documentUrl, pageNumber, width, height, { httpHeaders }) {
  const key = keyFn(documentUrl, pageNumber, width, height)
  let canvas
  let context
  let renderViewport

  if (!tasks[key]) {
    tasks[key] = new Promise((resolve, reject) => {
      getDocument(documentUrl, { httpHeaders })
        .then(document => document.getPage(pageNumber))
        .then((page) => {
          const initialViewport = page.getViewport(1)
          const scale = Math.min(width / initialViewport.width, height / initialViewport.height)

          renderViewport = page.getViewport(scale)

          canvas = window.document.createElement('canvas')
          context = canvas.getContext('2d')

          canvas.width = renderViewport.width
          canvas.height = renderViewport.height

          context.clearRect(0, 0, canvas.width, canvas.height)

          const renderContext = {
            canvasContext: context,
            viewport: renderViewport,
          }

          return page.render(renderContext)
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

              imageCache[`${documentUrl}_${pageNumber}_${width}_${height}`] = imageData

              resolve(imageData)
            }

            resolve({})
          })

          return null
        })
        .catch(error => reject(error))
    })
  }

  return tasks[key]
}
