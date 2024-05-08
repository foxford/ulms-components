import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { TGSPlayer } from '@ulms/tgs-player'

import { ANIMATION_SIZES } from './constants'
import { getAnimationsData } from './utils'

const getContainerSize = (
  id,
  animationSizes = ANIMATION_SIZES,
  desktopWidth = 1240,
  tabletWidth = 1024,
) => {
  if (!id) return null

  const screenWidth = document.documentElement.clientWidth
  const screenHeight = document.documentElement.clientHeight
  const isLandscape = screenWidth / screenHeight > 1

  const sizes = animationSizes[isLandscape ? 'landscape' : 'portrait']

  if (!sizes[id]) return null

  if (screenWidth >= desktopWidth) {
    return sizes[id].desktop
  }
  if (screenWidth >= tabletWidth) {
    return sizes[id].tablet
  }

  return sizes[id].mobile
}

const Root = styled.div`
  ${({ animationId, customSizes, desktopWidth, tabletWidth }) => `
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    z-index: ${animationId ? 5 : -1};
    ${getContainerSize(animationId, customSizes, desktopWidth, tabletWidth)}
  `}
`

const getSoundByAnimationId = (id, items) =>
  items?.find?.((_) => _.id === id)?.sound

// eslint-disable-next-line import/prefer-default-export
export const AnimationsView = memo(
  ({
    animation,
    className,
    customSizes,
    desktopWidth,
    onCompleteHandler,
    publicStorageProvider,
    tabletWidth,
    theme,
    volume = 1,
  }) => {
    const [items, setItems] = useState([])
    const itemsRef = useRef([])
    const [isSoundReadyMap, setIsSoundReadyMap] = useState({})
    const [source, setSource] = useState(null)
    const [flip, setFlip] = useState(false)
    const playerRef = useRef(null)
    const volumeRef = useRef(1)
    const currentAnimationId = useRef(null)

    const onPlay = () => {
      if (!animation) return

      const sound = getSoundByAnimationId(animation.id, items)

      setFlip(items.find((item) => item.id === animation.id).flip)

      // событие onPlay срабатывает не только при первом запуске, но и еще каждый раз,
      // когда пользователь возвращается на вкладку с вебинаром, поэтому делаем дополнительную проверку,
      // что анимация уже запущена, проверяя это тем, что уже проигрывается ее звук (sound.playing()),
      // если это так, то не воспроизводим звук повторно (не вызываем sound.play())
      // eslint-disable-next-line no-unused-expressions
      isSoundReadyMap[animation.id] && !sound?.playing?.() && sound?.play?.()
    }

    const onComplete = (animationId) => {
      if (currentAnimationId.current === animationId) {
        if (onCompleteHandler) {
          onCompleteHandler()
        }

        currentAnimationId.current = null
        setSource(null)
      }
    }

    // eslint-disable-next-line arrow-body-style
    useLayoutEffect(() => {
      setItems(getAnimationsData(publicStorageProvider))

      return () => {
        // останавливаем воспроизведение звука, в случае размонтирования компонента
        const sound = getSoundByAnimationId(
          currentAnimationId.current,
          itemsRef.current,
        )

        // eslint-disable-next-line no-unused-expressions
        sound?.playing?.() && sound?.stop?.()

        onComplete(currentAnimationId.current)
      }
    }, [])

    useEffect(() => {
      volumeRef.current = volume
    }, [volume])

    useEffect(() => {
      itemsRef.current = items
    }, [items])

    useEffect(() => {
      if (!animation) {
        currentAnimationId.current = null

        return
      }

      const loadHandler = () => {
        setIsSoundReadyMap((prevState) => ({
          ...prevState,
          [animation.id]: true,
        }))
        setSource(items.find((item) => item.id === animation.id).src)
      }

      const endHandler = () => {
        onComplete(animation.id)
      }

      currentAnimationId.current = animation.id
      const sound = getSoundByAnimationId(animation.id, items)

      if (!sound) return

      sound.volume(animation.soundOn ? volumeRef.current : 0)

      if (sound.state() === 'loaded') {
        setIsSoundReadyMap((prevState) => ({
          ...prevState,
          [animation.id]: true,
        }))
        setSource(items.find((item) => item.id === animation.id).src)
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

    return (
      <ThemeProvider theme={theme}>
        <Root
          animationId={animation?.id}
          className={className}
          customSizes={customSizes}
          data-testid={`animation-played-${animation?.id}`}
          desktopWidth={desktopWidth}
          tabletWidth={tabletWidth}
        >
          <TGSPlayer
            ref={playerRef}
            autoplay
            class="animations-view-tgs-player"
            flip={flip}
            src={source}
            onPlay={onPlay}
            height="100%"
            width="100%"
          />
        </Root>
      </ThemeProvider>
    )
  },
)
