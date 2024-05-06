/* eslint-disable import/extensions, react/prop-types, react/no-array-index-key */
import React from 'react'
import cn from 'classnames-es'
import { Icons } from '@ulms/ui-icons'
import { Button } from '@ulms/ui-button'

import css from './action-button-group.module.css'

function ActionButtonGroup(props) {
  const { className, items } = props

  if (!items || items.length === 0) return

  return items.map((item, index) => (
    <div
      className={cn({
        [css.root]: true,
        [css.active]: item.active,
        [css.disabled]: item.disabled,
        [className]: className,
      })}
      key={`action-button-group-item-${index}`}
    >
      <Button
        active={item.active}
        dataTestId={item.dataTestId}
        disabled={item.disabled}
        className={cn({ [css.button]: true, [css.active]: item.active })}
        onClick={item.onClick}
        title={item.title}
      >
        <div className={css.content}>
          {item.children}
          <span
            className={cn(
              css.text,
              item.children === undefined ? undefined : css.textAfter,
            )}
          >
            {item.text}
          </span>
        </div>
        {item.showUnderline && <div className={css.underline} />}
      </Button>
      {item.showBullet && (
        <div className={css.bullet}>
          <Icons.Bullet />
        </div>
      )}
    </div>
  ))
}

// eslint-disable-next-line import/prefer-default-export
export { ActionButtonGroup }
