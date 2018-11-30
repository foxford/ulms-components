import React from 'react'
import cx from 'classnames'
import { Grid as G } from '@foxford/ui/packages/Grid/Grid'
import '@foxford/ui/packages/Grid/Grid.css'

import css from './grid.css'

const rowProps = props => ({
  ...props,
  vAlignChildren: props.vAlignChildren || 'stretch',
  className: cx(props.className, css.row),
})

const gridProps = props => ({
  ...props,
  className: cx(props.className, css.root, { [css.debug]: props.debug }),
})

const Grid = props => <G {...gridProps(props)}>{props.children}</G>

Grid.Row = props => <G.Row {...rowProps(props)}>{props.children}</G.Row>

Grid.Col = props => <G.Col {...props}><div className={css.col}>{props.children}</div></G.Col>

export { Grid }
