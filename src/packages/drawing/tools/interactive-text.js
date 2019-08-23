import { fabric } from 'fabric'

const isRaw = fig => fig._ulms_raw

const clear = (fig) => {
  // eslint-disable-next-line no-param-reassign
  delete fig._ulms_raw
  // eslint-disable-next-line no-param-reassign
  delete fig.fillNext

  return fig
}

export function InteractiveText (ctx, text, options) {
  const defaultText = 'Add text...'
  const { fillNext } = options

  const itext = new fabric.IText(String(text || defaultText), {
    ...options,
    fill: options.fill || '#a6a6a6',
  })

  itext.fillNext = fillNext
  // memo next fill color

  itext._ulms_raw = true
  // mark figure as a new one

  ctx.on('text:editing:entered', ({ target }) => {
    if (!isRaw(target)) return

    target.set('fill', target.fillNext)
    // set fill color from figure defineProperty

    target.removeChars(0, target.text.length)
    target.hiddenTextarea.value = '' // eslint-disable-line no-param-reassign

    clear(target)
    // cleanup utility properties
  })

  return {
    itext,
    focus () {
      ctx.setActiveObject(itext)
      itext.enterEditing()
      itext.hiddenTextarea.focus()
    },
  }
}
