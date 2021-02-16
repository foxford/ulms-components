/* eslint-disable react/prop-types */
import React from 'react'
import { compose, withState, setDisplayName } from 'recompose'
import cx from 'classnames-es'

import { Debug } from '../../util/index'
import { Panel } from '../../../packages/panel/index'

import { Toggler } from './_toggler'
import css from './sidebar.css'

const debug = Debug('@ulms/ui-sidebar')

const Inner = ({ children }) => (<div className={css.sidebarInner}>{children}</div>)

const childrenEnlarged = props => [
  <Panel.Header key='header' className={css.panelHeader}>
    {props.freezed
      ? null
      : (
        <Toggler
          className={cx(css.toggler, css.togglerEnlarged)}
          handleClick={() => props.toggle(!props.minified)}
          toggled={props.minified}
        />
      )}
    {props.title}
  </Panel.Header>,
  <Panel.Inner key='inner'>{props.children}</Panel.Inner>,
]

const childrenMinified = props => [
  <Toggler
    key='toggler'
    className={cx(css.toggler, css.togglerMinified)}
    handleClick={() => props.toggle(!props.minified)}
    toggled={props.minified}
  />,
  <Inner key='inner'>{props.childrenMinified}</Inner>,
]

let sidebarComponent = props => debug(props) || (
  <Panel
    className={cx(css.root, {
      [css.minified]: props.minified,
      [css.pinned]: props.pinned,
    })}
    debug={props.debug}
  >
    {((!props.freezed && props.minified) ? childrenMinified : childrenEnlarged)(props)}
  </Panel>
)

sidebarComponent.Inner = Inner

sidebarComponent = setDisplayName('Sidebar')(sidebarComponent)

export const Sidebar = compose(withState('minified', 'toggle', _ => _.minified || false))(sidebarComponent)
