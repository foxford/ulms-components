### LocationViewport

```js
  window.__locationViewportEmitter = LocationViewport.emitter()

  class LocationEmitter extends React.Component {
    constructor(props){
      super(props)

      this._emitter = props.emitter

      this.__emitterEl = undefined
      this.__isDispatching = undefined
      this.__targetEl = undefined
    }
    componentDidMount() {
      this.__emitterEl && this.__emitterEl.addEventListener('mousemove', (ev) => {
        if (this.__isDispatching) return
        else this.__isDispatching = true

        setTimeout(() => {
          const xy = { x: ev.layerX, y: ev.layerY }

          if(this.props.top) xy.x = xy.x + this.props.left
          if(this.props.left) xy.y = xy.y + this.props.top

          this._emitter.dispatchEvent(new CustomEvent('broadcast_message.create', {
            detail: {
              data:{
                id: Math.random(),
                aCoords: {tl: xy},
                text: 'Alan Mathison Turing'
              }
            }
          }))

          this.__isDispatching = false
        }, this.props.interval || 200)
      })
    }

    get _emitter(){
      return this.__eventTarget
    }
    set _emitter(eventTarget){
      let _et = eventTarget

      if(!_et) throw new TypeError('Emitter is absent')
      this.__eventTarget = _et
    }
    render(){
      return <div style={{width:'100%', height: '100%'}} ref={el => { this.__emitterEl = el }} />
    }
  };
  <div style={{ position:'relative'}}>
    <div style={{border: '1px solid rebeccapurple', boxSizing: 'border-box', width: '300px', height: '300px'}}>
      <LocationViewport
        boundUpper={[280, 280]}
        height={300}
        id='locationViewport'
        emitter={window.__locationViewportEmitter}
        // opts={{ inverted: false, sizeX: 300 }}
        width={300}
      />
    </div>
    <div style={{border: '1px solid orange', boxSizing: 'border-box', top: -15, left: -15, position:'absolute', width: '330px', height: '330px'}}>
      <LocationEmitter
        emitter={window.__locationViewportEmitter}
        interval={100}
        top={-15} // adjust position 4 the demo
        left={-15} // adjust position 4 the demo
      />
    </div>
  </div>
```
