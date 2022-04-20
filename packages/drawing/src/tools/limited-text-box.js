import { fabric } from 'fabric/dist/fabric.min'

fabric.LimitedTextbox = fabric.util.createClass(fabric.Textbox, {
  onInput (e) {
    if (this.maxTextLength) {
      if (this.hiddenTextarea.value.length > this.maxTextLength) {
        this.hiddenTextarea.value = this.hiddenTextarea.value.substring(0, this.maxTextLength)
      }
    }
    this.callSuper('onInput', e)
  },
})
