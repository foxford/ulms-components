/* eslint-disable import/extensions, react/prop-types */
import React from 'react'
import cx from 'classnames'

import { Icons } from '../icons/icons'
import { Button } from '../button/button'

import css from './action-button-group.css'

function ActionButtonGroup (props) {
  const { items } = props

  if (!items || !items.length) return undefined

  return (
    items.map((item, index) => (
      <div
        className={cx({
          [css.root]: true,
          [css.active]: item.active,
          [css.disabled]: item.disabled,
          [props.className]: props.className,
        })}
        key={`action-button-group-item-${index}`}
      >
        <Button
          active={item.active}
          disabled={item.disabled}
          className={cx({ [css.button]: true, [css.active]: item.active })}
          onClick={item.onClick}
          title={item.title}
        >
          <div className={css.content}>
            {item.children}
            <span className={cx(css.text, typeof item.children !== 'undefined' ? css.textAfter : undefined)}>{item.text}</span>
          </div>
          {item.showUnderline && (<div className={css.underline} />)}
        </Button>
        {item.showBullet && (<div className={css.bullet}><Icons.Bullet /></div>)}
      </div>
    ))
  )
}

export { ActionButtonGroup }
