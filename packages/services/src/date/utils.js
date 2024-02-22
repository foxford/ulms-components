import { DateService } from './index'

import {
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from './constants'

/* eslint-disable */
/** Examples:
 * declensionOfNumber(1, ['минута', 'минуты', 'минут']) => 'минута'
 * declensionOfNumber(2, ['минута', 'минуты', 'минут']) => 'минуты'
 * declensionOfNumber(5, ['минута', 'минуты', 'минут']) => 'минут'
 */
export const declensionOfNumber = (number, words) =>
  words[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : [2, 0, 1, 1, 1, 2][number % 10 < 5 ? number % 10 : 5]
  ];
/* eslint-enable */

export const getTimeBeforeDeadline = (deadline) => {
  const deadlineDate = DateService.tz(deadline)
  const readableDeadline = deadlineDate.format('DD MMMM HH:mm')

  // Дедлайн вышел
  if (!deadline || deadlineDate.diff(Date.now()) < 0) {
    return {
      daysToDeadline: 0,
      hoursToDeadline: 0,
      minutesToDeadline: 0,
      readableDeadline,
      secondsToDeadline: 0,
    }
  }

  const secondsToDeadline = deadlineDate.diff(Date.now(), 'second')
  const minutesToDeadline = Math.floor(secondsToDeadline / SECONDS_IN_MINUTE)
  const hoursToDeadline = Math.floor(minutesToDeadline / MINUTES_IN_HOUR)
  const daysToDeadline = Math.floor(hoursToDeadline / HOURS_IN_DAY)

  return {
    daysToDeadline,
    hoursToDeadline: hoursToDeadline - daysToDeadline * HOURS_IN_DAY,
    minutesToDeadline: minutesToDeadline - hoursToDeadline * MINUTES_IN_HOUR,
    readableDeadline,
    secondsToDeadline:
      secondsToDeadline - minutesToDeadline * SECONDS_IN_MINUTE,
  }
}

export const getDoubleXpDeadlineText = (deadline) => {
  const {
    daysToDeadline,
    hoursToDeadline,
    minutesToDeadline,
    secondsToDeadline,
  } = getTimeBeforeDeadline(deadline)

  if (
    daysToDeadline === 0
    && hoursToDeadline === 0
    && minutesToDeadline === 0
    && secondsToDeadline === 0
  ) return ''

  const days =
    (daysToDeadline > 0
      && (hoursToDeadline > 0
        || minutesToDeadline > 0
        || secondsToDeadline > 0))
    || hoursToDeadline >= HOURS_IN_DAY - 1
      ? daysToDeadline + 1
      : daysToDeadline
  const hours =
    minutesToDeadline > 0 || secondsToDeadline > 0
      ? hoursToDeadline + 1
      : hoursToDeadline

  let doubleXpText

  if (days > 0) {
    const deadlineInDays = `${days} ${declensionOfNumber(days, ['день', 'дня', 'дней'])}`

    doubleXpText = `${declensionOfNumber(days, ['Остался', 'Осталось', 'Осталось'])} ${deadlineInDays}`
  } else {
    const deadlineInHours = `${hours} ${declensionOfNumber(hours, ['час', 'часа', 'часов'])}`

    doubleXpText = `${declensionOfNumber(hours, ['Остался', 'Осталось', 'Осталось'])} ${deadlineInHours}`
  }

  return doubleXpText
}
