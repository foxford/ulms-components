/* eslint-disable import/extensions, react/prop-types */
import React from 'react'

import { Icons } from '../../../packages/icons/index'
import { Button } from '../../../packages/button/index'

import css from './layout-switcher.css'

function LayoutSwitcher (props) {
  const { items } = props

  return (
    <div className={css.root}>
      {
        items && items.length > 0 && items.map((item, index) => (
          <Button
            active={item.active}
            disabled={item.disabled}
            className={css.button}
            key={index}
            onClick={item.onClick}
            showBullet={item.showBullet}
            title={item.title}
          >
            {item.children}
            {item.showBullet && (<div className={css.bullet}><Icons.Bullet /></div>)}
          </Button>
        ))
      }
    </div>
  )
}

export { LayoutSwitcher }
