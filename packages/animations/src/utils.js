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
