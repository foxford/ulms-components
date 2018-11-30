/* eslint-disable react/prop-types */
import React from 'react'
import cn from 'classnames'

import css from './panel.css'

const Header = props => (
  <div
    className={cn(css.header, { [css.adjacent]: !props.noAdjacent })}
  >
    {props.title ? props.title : props.children}
  </div>
)

const Inner = props => !props.children
  ? null
  : (<div className={css.inner}>{props.children}</div>)

const panelStyle = (props) => {
  const style = {}

  if (typeof props.size !== 'undefined') style.flexGrow = props.size

  return {
    ...props.style,
    ...style,
  }
}

const Panel = props => (
  <div className={cn(css.root, { [css.debug]: props.debug })} style={panelStyle(props)}>
    <div
      className={css.interlayer}
      style={{ flexDirection: props.direction || 'column' }}
    >
      {props.children ? props.children : [<Header key='h' {...props} />, <Inner key='i'>{props.content}</Inner>]}
    </div>
  </div>
)

Panel.Header = Header
Panel.Inner = Inner

export { Panel }
