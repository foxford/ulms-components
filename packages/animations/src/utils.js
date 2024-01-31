// eslint-disable-next-line import/no-extraneous-dependencies
import { Howl } from 'howler'

import { ANIMATION_IDS } from './constants'

const getAnimationPublicSrc = (storage, fileName, extension) => storage.getUrl(
  storage.types.ANIMATIONS,
  fileName,
  extension
)

export const getAnimationsData = storage => Object.keys(ANIMATION_IDS).map(key => ({
  id: ANIMATION_IDS[key],
  previewSrc: getAnimationPublicSrc(storage, ANIMATION_IDS[key], 'svg'),
  src: getAnimationPublicSrc(storage, ANIMATION_IDS[key], 'tgs'),
  sound: new Howl({
    src: getAnimationPublicSrc(storage, ANIMATION_IDS[key], 'mp3'),
    preload: false,
  }),
}))
