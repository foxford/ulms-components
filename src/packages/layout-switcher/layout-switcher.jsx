/* eslint-disable import/extensions, react/prop-types */
import React from 'react'
import cx from 'classnames'

import { Icons } from '../icons/icons'
import { Button } from '../button/button'

import css from './layout-switcher.css'

const Btn = ({
  active, children, className, disabled, onClick, showBullet, title,
}) => (
  <button
    className={cx(css.root, className, { [css.active]: active })}
    disabled={disabled}
    onClick={onClick}
    title={title}
    type='button'
  >
    {children}
    {showBullet && <div className={css.bullet}><Icons.Bullet /></div>}
  </button>
)

function LayoutSwitcher (props) {
  const { items } = props

  return (
    <div>
      {
        items && items.length > 0 && items.map((item, index) => (
          <Button
            active={item.active}
            disabled={item.disabled}
            className={css.root}
            key={index}
            onClick={item.onClick}
            showBullet={item.showBullet}
            title={item.title}
          >
            {item.children}
            {item.showBullet && <div className={css.bullet}><Icons.Bullet /></div>}
          </Button>
        ))
      }
    </div>
  )
}

export { LayoutSwitcher }
