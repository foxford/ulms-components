/* eslint-disable react/prop-types */
import React from 'react'
import cx from 'classnames-es'

import css from './panel.module.css'

function Header({ children, className, noAdjacent, title }) {
  return (
    <div className={cx(css.header, className, { [css.adjacent]: !noAdjacent })}>
      {title || children}
    </div>
  )
}

function Inner({ children }) {
  return children ? <div className={css.inner}>{children}</div> : null
}

const panelStyle = (props) => {
  const style = {}

  if (props.size !== undefined) style.flexGrow = props.size

  return {
    ...props.style,
    ...style,
  }
}

function Panel(props) {
  const { children, className, content, debug, direction } = props

  return (
    <div
      className={cx(css.root, className, { [css.debug]: debug })}
      style={panelStyle(props)}
    >
      <div
        className={css.interlayer}
        style={{ flexDirection: direction || 'column' }}
      >
        {children || [
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Header key="h" {...props} />,
          <Inner key="i">{content}</Inner>,
        ]}
      </div>
    </div>
  )
}

Panel.Header = Header
Panel.Inner = Inner

// eslint-disable-next-line import/prefer-default-export
export { Panel }
