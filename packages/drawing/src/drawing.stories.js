/* eslint-disable react/no-danger, react/self-closing-comp */
import React from 'react'

import { Drawing } from './drawing'

const handler = {
  objects: [],
  self: React.createRef(),
  parent: React.createRef(),
}

class Updater extends React.Component {
  state = { objects: [] } // eslint-disable-line react/no-unused-state

  render () {
    // eslint-disable-next-line react/prop-types
    const { children } = this.props

    return (
      <div className='drawingupdater'>
        {children}
      </div>
    )
  }
}

const styles = {
  dangerouslySetInnerHTML: {
    __html: `
      .drawingupdater > * {
        border: 1px solid gray;
        margin: 0 auto;
      }
    `,
  },
}

export default {
  title: 'organisms/Drawing',
  component: Drawing,
}

export const test = () => (
  <>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <style {...styles} />
    <Updater ref={handler.parent}>
      <Drawing
        brushColor={{
          r: 0, g: 0, b: 0, a: 1,
        }}
        ref={handler.self}
        width={300}
        height={300}
        objects={handler.parent.current ? handler.parent.current.state.objects : []}
        onDraw={(object) => {
          const { parent: { current: p } } = handler

          p.setState({ objects: p.state.objects.concat(object) })
        }}
        canDraw
        uniqId={() => Math.random()}
        zoomToCenter
        tokenProvider={() => Promise.resolve('access_token')}
      />
    </Updater>
  </>
)

test.storyName = 'default'
