import React from 'react'
import cn from 'classnames-es'
import { Icon } from '@foxford/ui/packages/Icon/Icon'

import Spacer from '../atoms/spacer'

import css from './card.module.css'

function Card (props) {
  const {
    description, buttonIcon, buttonText, image, onButtonClick, title,
  } = props

  return (
    <>
      <img src={image} alt='' />
      <Spacer h='20' />
      <div className={cn(css.title, css.textCentered)}>{title}</div>
      <Spacer h='8' />
      <div className={cn(css.description, css.textCentered)}>{description}</div>
      <Spacer h='18' />
      <div className={css.displayFlexCentered}>
        <div
          className={cn(css.actionButton, { [css.withIcon]: !!buttonIcon })}
          onClick={onButtonClick}
        >
          {buttonIcon && <Icon name={buttonIcon} size='xs' />}
          <div>{buttonText}</div>
        </div>
      </div>
    </>
  )
}

export default Card
