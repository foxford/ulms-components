import React, { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { Volume, VolumeRemove as VolumeOff } from '@foxford/icon-pack'
import { Spacer } from '@foxford/ui'
import { TGSPlayer } from '@ulms/tgs-player'

import { ANIMATION_IDS } from './constants'
import { getAnimationsData, touchDeviceDetect } from './utils'

import * as Styled from './animations-input.style'

const isTouch = touchDeviceDetect()

export const AnimationsInput = memo(({
  disableTooltipText,
  isAnimationSoundOn,
  isDisabled,
  isInputVisible,
  publicStorageProvider,
  onChangeSound,
  onSelectAnimation,
  theme,
}) => {
  const [items, setItems] = useState([])
  const [isShownDisableTooltip, setIsShownDisableTooltip] = useState(false)
  const playerRef = useRef(null)

  useLayoutEffect(() => {
    setItems(getAnimationsData(publicStorageProvider))
  }, [])

  useEffect(() => {
    if (isShownDisableTooltip && (!isDisabled || !isInputVisible)) {
      setIsShownDisableTooltip(false)
    }
  }, [isDisabled, isShownDisableTooltip, isInputVisible])

  const onClickAnimationHandler = (id) => {
    if (isDisabled) {
      !!disableTooltipText && setIsShownDisableTooltip(true)

      setTimeout(() => {
        setIsShownDisableTooltip(false)
      }, 3000)
    } else {
      onSelectAnimation(id)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Styled.Root isDisabled={isDisabled}>
        <Styled.Header>
          <Styled.Title>Анимации</Styled.Title>

          <Styled.VolumeTooltip
            content={isAnimationSoundOn ? 'Со звуком' : 'Без звука'}
            disabled={isDisabled}
            placement='top'
          >
            <Styled.VolumeControl
              isDisabled={isDisabled}
              data-testid={`animation-sound-${
                isAnimationSoundOn ? 'on' : 'off'
              }-button`}
              onClick={isDisabled ? undefined : onChangeSound}
            >
              {isAnimationSoundOn ? <Volume /> : <VolumeOff />}
            </Styled.VolumeControl>
          </Styled.VolumeTooltip>
        </Styled.Header>

        <Spacer bottom={16} />

        <Styled.AnimationsItems className='app-animation-items'>
          {items.map(({
            src, id, previewSrc,
          }) => (
            <Styled.AnimationItem
              data-testid={`animation-${id}`}
              key={id}
              isDisabled={isDisabled}
              isTouch={isTouch}
              onClick={() => onClickAnimationHandler(id)}
              previewSrc={previewSrc}
            >
              {!isTouch && (
                <TGSPlayer
                  hover
                  ref={playerRef}
                  flip={id === ANIMATION_IDS.CRY || id === ANIMATION_IDS.LOVE}
                  src={src}
                  style={isDisabled ? { pointerEvents: 'none' } : {}}
                  height={id === ANIMATION_IDS.TRY_AGAIN ? 'auto' : 44}
                  width={id === ANIMATION_IDS.TRY_AGAIN ? '100%' : 44}
                />
              )}
            </Styled.AnimationItem>
          ))}
        </Styled.AnimationsItems>

        {isShownDisableTooltip && (
          <Styled.DisableTooltip
            open
            content={(
              <Styled.DisableTooltipContent>
                {disableTooltipText}
              </Styled.DisableTooltipContent>
            )}
            placement='top'
            target='.app-animation-items'
          />
        )}
      </Styled.Root>
    </ThemeProvider>
  )
})
