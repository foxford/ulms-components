export const ANIMATION_IDS = {
  cry: 'cry',
  explosion: 'explosion',
  hands: 'hands',
  like: 'like',
  love: 'love',
  try_again: 'try_again',
}

const defaultAnimationSizePortrait = {
  desktop: 'height: 40%; width: auto',
  tablet: 'height: 40%; width: auto',
  mobile: 'height: 35%; width: auto',
}

const defaultAnimationSizeLandscape = {
  desktop: 'height: 50%; width: auto',
  tablet: 'height: 45%; width: auto',
  mobile: 'height: 45%; width: auto',
}

export const ANIMATION_SIZES = {
  [ANIMATION_IDS.like]: defaultAnimationSizePortrait,
  [ANIMATION_IDS.love]: defaultAnimationSizePortrait,
  [ANIMATION_IDS.cry]: defaultAnimationSizePortrait,
  [ANIMATION_IDS.hands]: defaultAnimationSizePortrait,
  [ANIMATION_IDS.explosion]: {
    desktop: 'height: auto; width: 100%;',
    tablet: 'height: auto; width: 100%;',
    mobile: 'height: auto; width: 90%;',
  },
  [ANIMATION_IDS.try_again]: {
    desktop: 'height: auto; width: 70%;',
    tablet: 'height: auto; width: 70%;',
    mobile: 'height: auto; width: 70%;',
  },
}

export const ANIMATION_SIZES_LANDSCAPE = {
  [ANIMATION_IDS.like]: defaultAnimationSizeLandscape,
  [ANIMATION_IDS.love]: defaultAnimationSizeLandscape,
  [ANIMATION_IDS.cry]: defaultAnimationSizeLandscape,
  [ANIMATION_IDS.hands]: defaultAnimationSizeLandscape,
  [ANIMATION_IDS.explosion]: {
    desktop: 'height: auto; width: 70%;',
    tablet: 'height: 50%; max-width: 100%;',
    mobile: 'height: 50%; max-width: 100%;',
  },
  [ANIMATION_IDS.try_again]: {
    desktop: 'height: auto; width: 60%;',
    tablet: 'height: 35%; max-width: 100%;',
    mobile: 'height: 35%; max-width: 100%;',
  },
}
