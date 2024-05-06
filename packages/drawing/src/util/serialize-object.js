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

function maybeRemoveToken(object) {
  if (object.type === 'image' && object.src.includes('?access_token=')) {
    // eslint-disable-next-line no-param-reassign,prefer-destructuring
    object.src = object.src.split('?')[0]
  }

  return object
}

export function serializeObject(object) {
  return maybeRemoveToken(object.toObject(enhancedFields))
}

export function normalizeFields(object) {
  return {
    ...object,
    // eslint-disable-next-line unicorn/no-array-reduce,unicorn/prefer-object-from-entries
    ...enhancedFields.reduce((a, field) => {
      // eslint-disable-next-line no-param-reassign
      a[field] = object[field] === undefined ? undefined : object[field]

      return a
    }, {}),
  }
}
