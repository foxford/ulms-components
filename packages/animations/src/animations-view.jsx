import { Howler } from 'howler'
import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { TGSPlayer } from '@ulms/tgs-player'

import { ANIMATION_IDS, ANIMATION_SIZES } from './constants'
import { getAnimationsData } from './utils'

const getContainerSize = (id, animationSizes = ANIMATION_SIZES) => {
  if (!id) return null

  const screenWidth = document.documentElement.clientWidth
  const screenHeight = document.documentElement.clientHeight
  const isLandscape = screenWidth / screenHeight > 1

  const sizes = animationSizes[isLandscape ? 'landscape' : 'portrait']

  if (screenWidth >= 1240) {
    return sizes[id].desktop
  }
  if (screenWidth >= 1024) {
    return sizes[id].tablet
  }

  return sizes[id].mobile
}

const Root = styled.div`
  ${({ animationId, customSizes }) => `
    position: absolute;
    bottom: 0;
    display: flex;
    z-index: 5;
    ${getContainerSize(animationId, customSizes)}
  `}
`

const getSoundByAnimationId = (id, items) => items?.find?.(_ => _.id === id)?.sound

export const AnimationsView = memo(({
  animation,
  className,
  customSizes,
  onCompleteHandler,
  publicStorageProvider,
  theme,
  volume = 1,
}) => {
  const [items, setItems] = useState([])
  const [isSoundReady, setIsSoundReady] = useState(false)
  const playerRef = useRef(null)
  const volumeRef = useRef(1)
  const currentAnimationId = useRef(null)

  const onPlay = () => {
    const sound = getSoundByAnimationId(animation.id, items)

    // событие onPlay срабатывает не только при первом запуске, но и еще каждый раз,
    // когда пользователь возвращается на вкладку с вебинаром, поэтому делаем дополнительную проверку,
    // что анимация уже запущена, проверяя это тем, что уже проигрывается ее звук (sound.playing()),
    // если это так, то не воспроизводим звук повторно (не вызываем sound.play())
    animation && isSoundReady && !sound?.playing?.() && sound?.play?.()
  }

  const onComplete = (animationId) => {
    if (currentAnimationId.current === animationId) {
      setIsSoundReady(false)
      onCompleteHandler && onCompleteHandler()
      currentAnimationId.current = null
    }
  }

  // eslint-disable-next-line arrow-body-style
  useLayoutEffect(() => {
    setItems(getAnimationsData(publicStorageProvider))

    return () => {
      onComplete(currentAnimationId.current)
    }
  }, [])

  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  useEffect(() => {
    if (!animation) return

    const loadHandler = () => {
      setIsSoundReady(true)
    }

    const endHandler = () => {
      onComplete(animation.id)
    }

    currentAnimationId.current = animation.id
    const sound = getSoundByAnimationId(animation.id, items)

    if (!sound) return

    sound.volume(animation.soundOn ? volumeRef.current : 0)

    if (sound.state() === 'loaded') {
      setIsSoundReady(true)
    } else {
      sound.on('load', loadHandler)
      sound.load()
    }
    sound.on('end', endHandler)

    // eslint-disable-next-line consistent-return
    return () => {
      sound.off('load', loadHandler)
      sound.off('end', endHandler)
    }
  }, [animation])

  const src = isSoundReady
    ? items.find(item => item.id === animation?.id)?.src
    : undefined

  const flip =
    animation?.id === ANIMATION_IDS.CRY || animation?.id === ANIMATION_IDS.LOVE

  return (
    <ThemeProvider theme={theme}>
      <Root
        animationId={animation?.id}
        data-testid={`animation-played-${animation?.id}`}
        className={className}
        customSizes={customSizes}
      >
        <TGSPlayer
          ref={playerRef}
          autoplay
          flip={flip}
          src={src}
          onPlay={onPlay}
          height='100%'
          width='100%'
        />
      </Root>
    </ThemeProvider>
  )
})
