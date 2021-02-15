/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import css from './panel.module.css'

const Header = ({
  children,
  className,
  noAdjacent,
  title,
}) => (
  <div
    className={cx(css.header, className, { [css.adjacent]: !noAdjacent })}
  >
    {title || children}
  </div>
)

const Inner = ({ children }) => !children
  ? null
  : (<div className={css.inner}>{children}</div>)

const panelStyle = (props) => {
  const style = {}

  if (typeof props.size !== 'undefined') style.flexGrow = props.size

  return {
    ...props.style,
    ...style,
  }
}

const Panel = (props) => {
  const {
    children,
    className,
    content,
    debug,
    direction,
  } = props

  return (
    <div
      className={cx(css.root, className, { [css.debug]: debug })}
      style={panelStyle(props)}
    >
      <div
        className={css.interlayer}
        style={{ flexDirection: direction || 'column' }}
      >
        {children || [<Header key='h' {...props} />, <Inner key='i'>{content}</Inner>]}
      </div>
    </div>
  )
}

Panel.Header = Header
Panel.Inner = Inner

export { Panel }
