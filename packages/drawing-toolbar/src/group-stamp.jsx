import React from 'react'
import Floater from 'react-floater'
import { stampToolModeEnum, toolEnum } from '@ulms/ui-drawing'

import cn from 'classnames-es'

import iconDislike from './icons/stamps/_app_stamp__dislike.svg'
import iconHeart from './icons/stamps/_app_stamp__heart.svg'
import iconLike from './icons/stamps/_app_stamp__like.svg'
import iconLove from './icons/stamps/_app_stamp__love.svg'
import iconPleased from './icons/stamps/_app_stamp__pleased.svg'
import iconQuestion from './icons/stamps/_app_stamp__question.svg'
import iconSad from './icons/stamps/_app_stamp__sad.svg'
import iconSmart from './icons/stamps/_app_stamp__smart.svg'
import iconStar from './icons/stamps/_app_stamp__star.svg'
import iconTryMore from './icons/stamps/_app_stamp__trymore.svg'
import iconWellDone from './icons/stamps/_app_stamp__welldone.svg'

import { groupTypes } from './constants'

const stampToolModeList = [
  {
    icon: iconPleased,
    mode: stampToolModeEnum.PLEASED,
  },
  {
    icon: iconSad,
    mode: stampToolModeEnum.SAD,
  },
  {
    icon: iconLove,
    mode: stampToolModeEnum.LOVE,
  },
  {
    icon: iconStar,
    mode: stampToolModeEnum.STAR,
  },
  {
    icon: iconHeart,
    mode: stampToolModeEnum.HEART,
  },
  {
    icon: iconLike,
    mode: stampToolModeEnum.LIKE,
  },
  {
    icon: iconDislike,
    mode: stampToolModeEnum.DISLIKE,
  },
  {
    icon: iconQuestion,
    mode: stampToolModeEnum.QUESTION,
  },
  {
    icon: iconWellDone,
    mode: stampToolModeEnum.WELLDONE,
  },
  {
    icon: iconSmart,
    mode: stampToolModeEnum.SMART,
  },

  {
    icon: iconTryMore,
    mode: stampToolModeEnum.TRYMORE,
  },
]

const stampToolRows = [stampToolModeList.slice(0, 5), stampToolModeList.slice(5, 9), stampToolModeList.slice(9)]

export const GroupStamp = ({
  css,
  handleChange,
  stampMode,
  tool,
  opened,
}) => (
  <Floater
    component={() => (
      <div className={cn(css.popover, css.floater)}>
        {stampToolRows.map((stampToolRow, index) => (
          <div className={css.row} key={`stampToolRow-${index}`}>
            {stampToolRow.map(({ icon, mode }) => {
              const Icon = icon

              return (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                  className={cn(css.button, css.fillWidth, {
                    [css.active]: stampMode === mode && tool === toolEnum.STAMP,
                  })}
                  key={`${mode}`}
                  onClick={() => handleChange({ stampMode: mode, tool: toolEnum.STAMP })}
                  role='button'
                  tabIndex='0'
                >
                  <Icon />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )}
    placement='right-start'
    hideArrow
    styles={{
      floater: {
        filter: 'none',
      },
    }}
    open={opened === groupTypes.GROUP_STAMP}
    target={`.${css.root} .${groupTypes.GROUP_STAMP}`}
  />
)
