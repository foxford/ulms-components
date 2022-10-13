import React from 'react'
import cn from 'classnames-es'
import { stampToolModeEnum } from '@ulms/ui-drawing'

import IconDislike from '../icons/stamps/_app_stamp__dislike.svg'
import IconHeart from '../icons/stamps/_app_stamp__heart.svg'
import IconLike from '../icons/stamps/_app_stamp__like.svg'
import IconLove from '../icons/stamps/_app_stamp__love.svg'
import IconPleased from '../icons/stamps/_app_stamp__pleased.svg'
import IconQuestion from '../icons/stamps/_app_stamp__question.svg'
import IconSad from '../icons/stamps/_app_stamp__sad.svg'
import IconSmart from '../icons/stamps/_app_stamp__smart.svg'
import IconStar from '../icons/stamps/_app_stamp__star.svg'
import IconTryMore from '../icons/stamps/_app_stamp__trymore.svg'
import IconWellDone from '../icons/stamps/_app_stamp__welldone.svg'
import IconChildrenDislike from '../icons/stamps/_children_app_stamp__dislike.svg'
import IconChildrenHeart from '../icons/stamps/_children_app_stamp__heart.svg'
import IconChildrenLike from '../icons/stamps/_children_app_stamp__like.svg'
import IconChildrenLove from '../icons/stamps/_children_app_stamp__love.svg'
import IconChildrenPleased from '../icons/stamps/_children_app_stamp__pleased.svg'
import IconChildrenQuestion from '../icons/stamps/_children_app_stamp__question.svg'
import IconChildrenSad from '../icons/stamps/_children_app_stamp__sad.svg'
import IconChildrenSmart from '../icons/stamps/_children_app_stamp__smart.svg'
import IconChildrenStar from '../icons/stamps/_children_app_stamp__star.svg'
import IconChildrenTryMore from '../icons/stamps/_children_app_stamp__trymore.svg'
import IconChildrenWellDone from '../icons/stamps/_children_app_stamp__welldone.svg'

// import { intlID } from '../../lang/constants'

import { IconGroupSettings } from './icon-group-settings'

import css from './settings.module.css'

export class StampSettings extends React.Component {
  constructor (props) {
    super(props)
    // const { intl } = props
    const { childrenStyle } = props

    this.iconsMap = {
      [stampToolModeEnum.PLEASED]: (<IconPleased />),
      [stampToolModeEnum.SAD]: (<IconSad />),
      [stampToolModeEnum.LOVE]: (<IconLove />),
      [stampToolModeEnum.STAR]: (<IconStar />),
      [stampToolModeEnum.HEART]: (<IconHeart />),
      [stampToolModeEnum.LIKE]: (<IconLike />),
      [stampToolModeEnum.DISLIKE]: (<IconDislike />),
      [stampToolModeEnum.QUESTION]: (<IconQuestion />),
      [stampToolModeEnum.WELLDONE]: (<IconWellDone />),
      [stampToolModeEnum.SMART]: (<IconSmart />),
      [stampToolModeEnum.TRYMORE]: (<IconTryMore />),
    }

    this.childrenIconsMap = {
      [stampToolModeEnum.PLEASED]: (<IconChildrenPleased />),
      [stampToolModeEnum.SAD]: (<IconChildrenSad />),
      [stampToolModeEnum.LOVE]: (<IconChildrenLove />),
      [stampToolModeEnum.STAR]: (<IconChildrenStar />),
      [stampToolModeEnum.HEART]: (<IconChildrenHeart />),
      [stampToolModeEnum.LIKE]: (<IconChildrenLike />),
      [stampToolModeEnum.DISLIKE]: (<IconChildrenDislike />),
      [stampToolModeEnum.QUESTION]: (<IconChildrenQuestion />),
      [stampToolModeEnum.WELLDONE]: (<IconChildrenWellDone />),
      [stampToolModeEnum.SMART]: (<IconChildrenSmart />),
      [stampToolModeEnum.TRYMORE]: (<IconChildrenTryMore />),
    }

    const iconsMap = childrenStyle ? this.childrenIconsMap : this.iconsMap

    this.iconsSet = [
      {
        key: stampToolModeEnum.PLEASED,
        icon: iconsMap[stampToolModeEnum.PLEASED],
        // title: intl.formatMessage({ id: intlID.STAMP_PLEASED }),
      },
      {
        key: stampToolModeEnum.SAD,
        icon: iconsMap[stampToolModeEnum.SAD],
        // title: intl.formatMessage({ id: intlID.STAMP_SAD }),
      },
      {
        key: stampToolModeEnum.LOVE,
        icon: iconsMap[stampToolModeEnum.LOVE],
        // title: intl.formatMessage({ id: intlID.STAMP_LOVE }),
      },
      {
        key: stampToolModeEnum.STAR,
        icon: iconsMap[stampToolModeEnum.STAR],
        // title: intl.formatMessage({ id: intlID.STAMP_STAR }),
      },
      {
        key: stampToolModeEnum.HEART,
        icon: iconsMap[stampToolModeEnum.HEART],
        // title: intl.formatMessage({ id: intlID.STAMP_HEART }),
      },
      {
        key: stampToolModeEnum.LIKE,
        icon: iconsMap[stampToolModeEnum.LIKE],
        // title: intl.formatMessage({ id: intlID.STAMP_LIKE }),
      },
      {
        key: stampToolModeEnum.DISLIKE,
        icon: iconsMap[stampToolModeEnum.DISLIKE],
        // title: intl.formatMessage({ id: intlID.STAMP_DISLIKE }),
      },
      {
        key: stampToolModeEnum.QUESTION,
        icon: iconsMap[stampToolModeEnum.QUESTION],
        // title: intl.formatMessage({ id: intlID.STAMP_QUESTION }),
      },
      {
        key: stampToolModeEnum.WELLDONE,
        icon: iconsMap[stampToolModeEnum.WELLDONE],
        // title: intl.formatMessage({ id: intlID.STAMP_WELLDONE }),
      },
      {
        key: stampToolModeEnum.SMART,
        icon: iconsMap[stampToolModeEnum.SMART],
        // title: intl.formatMessage({ id: intlID.STAMP_SMART }),
      },
      {
        key: stampToolModeEnum.TRYMORE,
        icon: iconsMap[stampToolModeEnum.TRYMORE],
        // title: intl.formatMessage({ id: intlID.STAMP_TRYMORE }),
      },
    ]

    this.stampToolRows = [this.iconsSet.slice(0, 5), this.iconsSet.slice(5, 9), this.iconsSet.slice(9)]
  }

  render () {
    const {
      brushMode,
      handleClick,
      className,
      childrenStyle,
    } = this.props

    return (
      <div className={cn(css.column, className)}>
        {this.stampToolRows.map((iconsRow, i) => (
          <IconGroupSettings
            iconsSet={iconsRow}
            fillWidth
            size={childrenStyle ? 'xl' : 'md'}
            currentSelection={brushMode}
            handleClick={handleClick}
            key={i}
          />
        )) }
      </div>
    )
  }
}
