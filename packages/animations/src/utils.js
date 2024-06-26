// eslint-disable-next-line import/no-extraneous-dependencies
import { Howl } from 'howler'

import { ANIMATION_IDS } from './constants'

const getAnimationPublicSource = (storage, fileName, extension) =>
  storage.getUrl(storage.types.ANIMATIONS, fileName, extension)

const sortedAnimationIds = [
  ANIMATION_IDS.LIKE,
  ANIMATION_IDS.LOVE,
  ANIMATION_IDS.EXPLOSION,
  ANIMATION_IDS.CRY,
  ANIMATION_IDS.HANDS,
  ANIMATION_IDS.TRY_AGAIN,
]

export const getAnimationsData = (storage) =>
  sortedAnimationIds.map((id) => ({
    id,
    previewSrc: getAnimationPublicSource(storage, id, 'svg'),
    src: getAnimationPublicSource(storage, id, 'tgs'),
    sound: new Howl({
      src: getAnimationPublicSource(storage, id, 'mp3'),
      preload: false,
    }),
    flip: id === ANIMATION_IDS.CRY || id === ANIMATION_IDS.LOVE,
  }))

export const touchDeviceDetect = () => {
  const check1 = window?.matchMedia('(pointer: coarse)')?.matches
  const check2 =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0

  return check1 === undefined ? check2 : check1
}
