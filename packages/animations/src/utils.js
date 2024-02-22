// eslint-disable-next-line import/no-extraneous-dependencies
import { Howl } from 'howler'

import { ANIMATION_IDS } from './constants'

const getAnimationPublicSrc = (storage, fileName, extension) => storage.getUrl(
  storage.types.ANIMATIONS,
  fileName,
  extension
)

const sortedAnimationIds = [
  ANIMATION_IDS.LIKE,
  ANIMATION_IDS.LOVE,
  ANIMATION_IDS.EXPLOSION,
  ANIMATION_IDS.CRY,
  ANIMATION_IDS.HANDS,
  ANIMATION_IDS.TRY_AGAIN,
]

export const getAnimationsData = storage => sortedAnimationIds.map(id => ({
  id,
  previewSrc: getAnimationPublicSrc(storage, id, 'svg'),
  src: getAnimationPublicSrc(storage, id, 'tgs'),
  sound: new Howl({
    src: getAnimationPublicSrc(storage, id, 'mp3'),
    preload: false,
  }),
}))

export const touchDeviceDetect = () => {
  const check1 = window?.matchMedia('(pointer: coarse)')?.matches
  const check2 =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0

  return typeof check1 !== 'undefined' ? check1 : check2
}
