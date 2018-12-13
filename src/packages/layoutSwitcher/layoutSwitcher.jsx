/* eslint-disable import/extensions, react/prop-types */
import React from 'react'
import cx from 'classnames'

import { Icons } from '../icons/icons'

import css from './layoutSwitcher.css'

const Btn = ({
  active, children, disabled, onClick, showBullet, title,
}) => (
  <button
    className={cx(css.control, { [css.active]: active })}
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
          <Btn
            active={item.active}
            disabled={item.disabled}
            key={index}
            onClick={item.onClick}
            showBullet={item.showBullet}
            title={item.title}
          >
            {item.children}
          </Btn>
        ))
      }
    </div>
  )
}

export { LayoutSwitcher }
