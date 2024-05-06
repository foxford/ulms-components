import React from 'react'
import ReactDom from 'react-dom'

// eslint-disable-next-line import/prefer-default-export
export class ObjectPortal extends React.Component {
  render() {
    // eslint-disable-next-line react/prop-types
    const { children, node } = this.props
    if (!node) return null

    return ReactDom.createPortal(children, node)
  }
}
