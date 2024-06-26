import dj from 'dayjs'
import dayjsEn from 'dayjs/locale/en'
import dayjsRu from 'dayjs/locale/ru'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'

const LOCALES = {
  en: dayjsEn,
  ru: dayjsRu,
}

// Create instance of dayjs with settings https://github.com/iamkun/dayjs/issues/1227
// eslint-disable-next-line import/prefer-default-export
export class DayjsAdapter {
  static LOCALES = LOCALES

  constructor() {
    this.dayjs = dj
    this.extend()
  }

  extend() {
    this.dayjs.extend(utc)
    this.dayjs.extend(timezone)
    this.dayjs.extend(customParseFormat)
    this.dayjs.extend(weekday)
    this.dayjs.extend(LocalizedFormat)
    this.dayjs.extend(isBetween)
    this.dayjs.extend(relativeTime)
  }

  initLocale(locale) {
    const browserLocale = navigator.language.split('-')[0]

    if (locale === undefined || locale === null) {
      this.dayjs.locale(browserLocale)

      return
    }
    if (!DayjsAdapter.LOCALES[locale]) {
      this.dayjs.locale('ru', DayjsAdapter.LOCALES.ru)

      return
    }
    this.dayjs.locale(locale, DayjsAdapter.LOCALES[locale])
  }

  // eslint-disable-next-line class-methods-use-this
  setDefaultLocale = () => {}

  setTimezone = (tz = 'Europe/Moscow') => {
    this.timezone = tz
    this.dayjs.tz.setDefault(tz)
  }

  getInstance = () => this.dayjs
}
