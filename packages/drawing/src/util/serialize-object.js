export const USER_LOCK_LABEL = '_lockedbyuser'

const enhancedFields = [
  '_id',
  USER_LOCK_LABEL,
  'noScaleCache',
  'strokeUniform',
  '_order',
  '_noHistory',
  '_drawByStretch',
]

function maybeRemoveToken (object) {
  if (object.type === 'image' && object.src.indexOf('?access_token=') !== -1) {
    object.src = object.src.split('?')[0] // eslint-disable-line
  }

  return object
}

export function serializeObject (obj) {
  return maybeRemoveToken(obj.toObject(enhancedFields))
}

export function normalizeFields (object) {
  return {
    ...object,
    ...enhancedFields.reduce((a, field) => {
      // eslint-disable-next-line no-param-reassign
      a[field] = (object[field] !== undefined) ? object[field] : undefined

      return a
    }, {}),
  }
}
