import React from 'react'
import cn from 'classnames-es'
import { stampToolModeEnum, toolEnum, defaultToolSettings } from '@ulms/ui-drawing'

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
import IconStamp from '../icons/stamp-tool-icon.svg'

import { intlID } from '../../lang/constants'

import { IconGroupSettings } from './icon-group-settings'
import { ToolbarButton } from './toolbar-button'
import { SettingsGroup } from './settings-group'

import css from './settings.module.css'

export class StampGroup extends React.Component {
  constructor (props) {
    super(props)
    // const { intl } = props

    this.buttonRef = React.createRef()

    this.state = {
      toolMode: defaultToolSettings.stamp,
    }

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

    this.iconsSet = [
      {
        key: stampToolModeEnum.PLEASED,
        icon: this.iconsMap[stampToolModeEnum.PLEASED],
        // title: intl.formatMessage({ id: intlID.STAMP_PLEASED }),
      },
      {
        key: stampToolModeEnum.SAD,
        icon: this.iconsMap[stampToolModeEnum.SAD],
        // title: intl.formatMessage({ id: intlID.STAMP_SAD }),
      },
      {
        key: stampToolModeEnum.LOVE,
        icon: this.iconsMap[stampToolModeEnum.LOVE],
        // title: intl.formatMessage({ id: intlID.STAMP_LOVE }),
      },
      {
        key: stampToolModeEnum.STAR,
        icon: this.iconsMap[stampToolModeEnum.STAR],
        // title: intl.formatMessage({ id: intlID.STAMP_STAR }),
      },
      {
        key: stampToolModeEnum.HEART,
        icon: this.iconsMap[stampToolModeEnum.HEART],
        // title: intl.formatMessage({ id: intlID.STAMP_HEART }),
      },
      {
        key: stampToolModeEnum.LIKE,
        icon: this.iconsMap[stampToolModeEnum.LIKE],
        // title: intl.formatMessage({ id: intlID.STAMP_LIKE }),
      },
      {
        key: stampToolModeEnum.DISLIKE,
        icon: this.iconsMap[stampToolModeEnum.DISLIKE],
        // title: intl.formatMessage({ id: intlID.STAMP_DISLIKE }),
      },
      {
        key: stampToolModeEnum.QUESTION,
        icon: this.iconsMap[stampToolModeEnum.QUESTION],
        // title: intl.formatMessage({ id: intlID.STAMP_QUESTION }),
      },
      {
        key: stampToolModeEnum.WELLDONE,
        icon: this.iconsMap[stampToolModeEnum.WELLDONE],
        // title: intl.formatMessage({ id: intlID.STAMP_WELLDONE }),
      },
      {
        key: stampToolModeEnum.SMART,
        icon: this.iconsMap[stampToolModeEnum.SMART],
        // title: intl.formatMessage({ id: intlID.STAMP_SMART }),
      },
      {
        key: stampToolModeEnum.TRYMORE,
        icon: this.iconsMap[stampToolModeEnum.TRYMORE],
        // title: intl.formatMessage({ id: intlID.STAMP_TRYMORE }),
      },
    ]

    this.stampToolRows = [this.iconsSet.slice(0, 5), this.iconsSet.slice(5, 9), this.iconsSet.slice(9)]
  }

  handleClick = (toolMode) => {
    const { handleChange } = this.props

    this.setState({ toolMode })
    handleChange({
      tool: toolEnum.STAMP,
      brushMode: toolMode,
    })
  }

  render () {
    const {
      opened,
      tool,
      intl,
      handleClose,
      handleOpen,
      className,
    } = this.props
    const {
      toolMode,
    } = this.state

    return (
      <SettingsGroup
        direction='right-start'
        containerStyles={{ marginTop: '-12px' }}
        isOpen={opened}
        handleClose={handleClose}
        target={this.buttonRef.current}
        content={(
          <div className={cn(css.column, className)}>
            {this.stampToolRows.map((iconsRow, i) => (
              <IconGroupSettings
                iconsSet={iconsRow}
                fillWidth
                currentSelection={toolMode}
                handleClick={this.handleClick}
                key={i}
              />
            )) }
          </div>
        )}
      >
        <ToolbarButton
          active={tool === toolEnum.STAMP}
          group
          title={intl.formatMessage({ id: intlID.STAMP })}
          onClick={() => handleOpen({ brushMode: toolMode })}
          innerRef={this.buttonRef}
        >
          <IconStamp />
        </ToolbarButton>
      </SettingsGroup>
    )
  }
}
