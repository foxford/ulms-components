/* eslint-disable */

import { Base } from './base'

const makeNotInteractive = _ => Object.assign(_, { selectable: false, evented: false, hoverCursor: 'crosshair' })

export class Line extends Base {
  constructor (canvas, /*objectFn,*/ options = {}) {
    super(canvas)
    this.__options = options
    // this.__objectFn = objectFn
    this.__object = undefined

    this.__hasStart = undefined

    this.__coords = []

    this.__status = 0
    // 0 - initialized
    // 1 - in progress
    // 2 - finished

    this._canvas.forEachObject(_ => makeNotInteractive(_))
  }

  configure(props){
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    // this._canvas.defaultCursor = 'crosshair'
    // this._canvas.setCursor('crosshair')
  }

  handleObjectAddedEvent (opts) {
    makeNotInteractive(opts.target)

    // this.__object.set('left', opts.target.x1)
    // this.__object.set('top', opts.target.y1)
  }

  handleMouseDownEvent(opts){
    // this.__object = this.__objectFn()
    console.log(0, opts.absolutePointer, this.__coords)

    // this.__object = new fabric.Line(coords, {...this.__options})

    // this.__object.set('fill', this.__options.stroke)
    // this.__object.set('stroke', this.__options.stroke)
    // this.__object.set('evented', this.__options.evented || false)
    // this.__object.set('selectable', this.__options.selectable || false)
    // this.__object.set('strokeWidth', this.__options.strokeWidth || 2)

    // const { width, height } = this.__object.getBoundingRect()

    // let [dx, dy] = (this.__options.adjustCenter || '0 0').split(' ')
    // dx = Number(dx)
    // dy = Number(dy)

    // this.__object.set('left', opts.absolutePointer.x + (!this.__options.adjustCenter ? 0 : width * dx))
    // this.__object.set('top', opts.absolutePointer.y + (!this.__options.adjustCenter ? 0 : height * dy))


    if(!this.__hasStart){
      this.__coords = this.__coords.concat([opts.absolutePointer.x, opts.absolutePointer.y])
      this.__hasStart = true

      console.log(1, opts.absolutePointer, this.__coords)
    }
else
    if (this.__hasStart){
      this.__coords = this.__coords.concat([opts.absolutePointer.x, opts.absolutePointer.y])

      // let [x2,y1,x1,y2] = this.__coords
      // if(x2 > x1) this.__coords = [x1,y1,x2,y2]
      // [x1,y2,x2,y1] = this.__coords
      // if(y2 < y1) this.__coords = [x1,y1,x2,y2]

      this.__object = new fabric.Line(this.__coords, {...this.__options})
      // this.__object = new fabric.Line([50, 50, 100, 100], {...this.__options})


      // this.__object.set('x1', this.__coords[0])
      // this.__object.set('y1', this.__coords[1])
      // this.__object.set('x2', this.__coords[2])
      // this.__object.set('y2', this.__coords[3])
      // this.__object.set('x1', 100)
      // this.__object.set('y1', 100)
      // this.__object.set('x2', 200)
      // this.__object.set('y2', 200)

      // this.__object.setCoords(true, true)

      console.log(9, this.__object.x1)
      console.log(9, this.__object.y1)
      console.log(9, this.__object.x2)
      console.log(9, this.__object.y2)



      this.__object.set('fill', this.__options.stroke)
      this.__object.set('stroke', this.__options.stroke)
      this.__object.set('evented', this.__options.evented || false)
      this.__object.set('selectable', this.__options.selectable || false)
      this.__object.set('strokeWidth', this.__options.strokeWidth || 2)

      console.log(2, opts.absolutePointer, this.__coords)

      this.__status = 2
      this._canvas.add(this.__object)
    }

    // this._canvas.add(this.__object)
  }

  handleMouseUpEvent () {
    // this._canvas.defaultCursor = 'crosshair'
    // this._canvas.setCursor('crosshair')

    if(this.__hasStart && this.__coords.length === 4 && this.__status == 2){
      this.__hasStart = undefined
      this.__coords = []
    }
  }
}
