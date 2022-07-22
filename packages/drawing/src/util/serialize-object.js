import { enhancedFields } from '../constants'

function maybeRemoveToken (object) {
  if (object.type === 'image' && object.src.indexOf('?access_token=') !== -1) {
    object.src = object.src.split('?')[0] // eslint-disable-line
  }

  return object
}

export function serializeObject (obj) {
  return maybeRemoveToken(obj.toObject(enhancedFields))
}
