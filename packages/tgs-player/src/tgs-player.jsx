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

const _TGSPlayer = forwardRef(
  (
    {
      src,
      width,
      height,
      className,
      onClick,
      flip = false,
      onComplete,
      onPlay,
      playOnHover = false,
      style = {},
      ...playerParameters
    },
    ref,
  ) => {
    const playerRef = useRef(null)
    const [player, setPlayer] = useState(null)
    const setPlayerTimerId = useRef(null)
    const sourceRef = useRef(null)

    useEffect(() => {
      if (!playerRef.current) return

      const onCompleteModified = () => {
        if (sourceRef.current && onComplete) onComplete()
      }

      const onPlayModified = () => {
        if (sourceRef.current && onPlay) onPlay()
      }

      if (playerRef.current && onComplete) {
        playerRef.current.addEventListener('complete', onCompleteModified)
      }

      if (playerRef.current && onPlay) {
        playerRef.current.addEventListener('play', onPlayModified)
      }

      // eslint-disable-next-line consistent-return
      return () => {
        if (onComplete && playerRef.current) {
          playerRef.current.removeEventListener('complete', onCompleteModified)
        }

        if (onPlay && playerRef.current) {
          playerRef.current.removeEventListener('play', onPlayModified)
        }
      }
    }, [onComplete, onPlay])

    useEffect(() => {
      if (sourceRef.current && !src) {
        // если анимация запустилась в момент, когда пользователь находился на другой вкладке,
        // то после его возвращения lottie-player вновь проигрывает анимацию, хотя запуск
        // анимации уже не актуален, поэтому вручную останавливаем проигрывание
        playerRef.current?.stop?.()
      }

      sourceRef.current = src

      if (src) {
        playerRef.current.load(src)
      }
    }, [src])

    useEffect(() => {
      setPlayerTimerId.current = setTimeout(() => {
        if (playerRef.current) {
          setPlayer(playerRef.current.getLottie())
        }
      }, 500)

      return () => {
        setPlayer(null)
        if (setPlayerTimerId.current) {
          clearTimeout(setPlayerTimerId.current)
        }
      }
    }, [playerRef.current])

    useEffect(() => {
      if (playOnHover && player) {
        createInteractivity({
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

    useImperativeHandle(ref, () => ({ player }))

    return (
      <tgs-player
        ref={playerRef}
        src={src}
        style={{
          // eslint-disable-next-line no-restricted-globals, unicorn/prefer-number-properties
          height: isNaN(height) ? height : `${height}px`,
          // eslint-disable-next-line no-restricted-globals, unicorn/prefer-number-properties
          width: isNaN(width) ? width : `${width}px`,
          transform: flip ? 'scaleX(-1)' : 'none',
          ...style,
        }}
        className={className}
        onClick={() => onClick && onClick()}
        {...playerParameters}
      />
    )
  },
)

_TGSPlayer.displayName = 'TGSPlayer'

// eslint-disable-next-line import/prefer-default-export
export const TGSPlayer = memo(_TGSPlayer)
