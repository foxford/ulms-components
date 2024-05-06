const CRY = 'cry'
const EXPLOSION = 'explosion'
const HANDS = 'hands'
const LIKE = 'like'
const LOVE = 'love'
const TRY_AGAIN = 'try_again'

export const ANIMATION_IDS = {
  CRY,
  EXPLOSION,
  HANDS,
  LIKE,
  LOVE,
  TRY_AGAIN,
}

const defaultAnimationSizePortrait = {
  desktop: 'height: 40%; width: auto',
  tablet: 'height: 40%; width: auto',
  mobile: 'height: auto; width: 40%;',
}

const defaultAnimationSizeLandscape = {
  desktop: 'height: 50%; width: auto',
  tablet: 'height: 45%; width: auto',
  mobile: 'height: auto; width: 20%;',
}

export const ANIMATION_SIZES = {
  portrait: {
    like: defaultAnimationSizePortrait,
    love: defaultAnimationSizePortrait,
    cry: defaultAnimationSizePortrait,
    hands: defaultAnimationSizePortrait,
    explosion: {
      desktop: 'height: auto; width: 100%;',
      tablet: 'height: auto; width: 100%;',
      mobile: 'height: auto; width: 80%;',
    },
    try_again: {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      desktop: 'height: auto; width: 70%;',
      tablet: 'height: auto; width: 70%;',
      mobile: 'height: auto; width: 55%;',
    },
  },
  landscape: {
    like: defaultAnimationSizeLandscape,
    love: defaultAnimationSizeLandscape,
    cry: defaultAnimationSizeLandscape,
    hands: defaultAnimationSizeLandscape,
    explosion: {
      desktop: 'height: auto; width: 70%;',
      tablet: 'height: 50%; max-width: 100%;',
      mobile: 'height: auto; width: 35%;',
    },
    try_again: {
      desktop: 'height: auto; width: 60%;',
      tablet: 'height: 35%; max-width: 100%;',
      mobile: 'height: auto; width: 25%;',
    },
  },
}
