```js
window.DrawingComponentHandler = {
  objects: [],
}
DrawingComponentHandler.self = React.createRef()
DrawingComponentHandler.parent = React.createRef()

class DrawingUpdaterComponent extends React.Component{
  constructor(){
    super()
    this.state = {
      objects: []
    }
  }
  render(){
    return (
      <div className='drawingupdater'>
        {this.props.children}
      </div>
    )
  }
}
;<div>
  <style dangerouslySetInnerHTML={{ __html: `
    .drawingupdater > * {
      border: 1px solid gray;
      margin: 0 auto;
    }
  ` }}></style>
  <DrawingUpdaterComponent ref={DrawingComponentHandler.parent}>
    <DrawingComponent
      brushColor={{
        r: 0, g: 0, b: 0, a: 1,
      }}
      ref={DrawingComponentHandler.self}
      width={300}
      height={300}
      objects={DrawingComponentHandler.parent.current ? DrawingComponentHandler.parent.current.state.objects : []}
      onDraw={(object) => {
        DrawingComponentHandler.parent.current.setState({
          objects: DrawingComponentHandler.parent.current.state.objects.concat(object)
        })
      }}
      canDraw
      uniqId={() => Math.random()}
      zoomToCenter
    >
    </DrawingComponent>
  </DrawingUpdaterComponent>
</div>
```
