/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useRef,
  forwardRef,
  memo,
  useEffect,
  useState,
  useImperativeHandle,
} from 'react'
import '@lottiefiles/lottie-player/dist/tgs-player'
import createInteractivity from '@lottiefiles/lottie-interactivity'

const _TGSPlayer = forwardRef((
  {
    src,
    width,
    height,
    className,
    interactivityConfig,
    onClick,
    flip = false,
    onComplete,
    onPlay,
    playOnHover = false,
    style = {},
    ...playerParams
  },
  ref
) => {
  const playerRef = useRef(null)
  const [player, setPlayer] = useState(null)
  const [showPlayer, setShowPlayer] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      if (playerRef.current) {
        setPlayer(playerRef.current.getLottie())
      }
    }, 500)

    return () => {
      setPlayer(null)
    }
  }, [playerRef.current])

  useEffect(() => {
    setShowPlayer(false)
    // Чтобы перезапустить плеер при смене src
    setTimeout(() => {
      setShowPlayer(true)
    }, 0)
  }, [src])

  useEffect(() => {
    if (playOnHover && player) {
      createInteractivity(interactivityConfig
        ? {
          player,
          ...interactivityConfig,
        }
        : {
          player,
          mode: 'cursor',
          actions: [
            {
              type: 'hover',
              forceFlag: false,
            },
          ],
        })
    }
  }, [playOnHover, player])

  useEffect(() => {
    onComplete && playerRef.current?.addEventListener('complete', onComplete)
    onPlay && playerRef.current?.addEventListener('play', onPlay)

    return () => {
      onComplete
          && playerRef.current?.removeEventListener('complete', onComplete)
      onPlay && playerRef.current?.removeEventListener('play', onPlay)
      setPlayer(null)
    }
  }, [playerRef.current])

  useImperativeHandle(ref, () => ({ player }))

  if (!showPlayer) return null

  return (
    <tgs-player
      ref={playerRef}
      src={src}
      style={{
        height: isNaN(height) ? height : `${height}px`,
        width: isNaN(width) ? width : `${width}px`,
        transform: flip ? 'scaleX(-1)' : 'none',
        ...style,
      }}
      className={className}
      onClick={() => onClick && onClick()}
      {...playerParams}
    />
  )
})

_TGSPlayer.displayName = 'TGSPlayer'

export const TGSPlayer = memo(_TGSPlayer)
