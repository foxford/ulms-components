/* eslint-disable react/prop-types, react/jsx-props-no-spreading */
import React from 'react'
import cx from 'classnames-es'

import { Grid as G } from './dist'
import './dist/index.css'

import css from './grid.module.css'

const rowProps = (props) => ({
  ...props,
  vAlignChildren: props.vAlignChildren || 'stretch',
  className: cx(props.className, css.row),
})

const gridProps = (props) => ({
  ...props,
  className: cx(props.className, css.root, { [css.debug]: props.debug }),
})

function Grid(props) {
  // eslint-disable-next-line react/destructuring-assignment
  return <G {...gridProps(props)}>{props.children}</G>
}

Grid.Row = function Row(props) {
  // eslint-disable-next-line react/destructuring-assignment
  return <G.Row {...rowProps(props)}>{props.children}</G.Row>
}

Grid.Col = function Col(props) {
  return (
    <G.Col {...props}>
      {/* eslint-disable-next-line react/destructuring-assignment */}
      <div className={css.col}>{props.children}</div>
    </G.Col>
  )
}

// eslint-disable-next-line import/prefer-default-export
export { Grid }
