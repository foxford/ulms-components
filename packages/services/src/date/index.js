import { DayjsAdapter } from './dayjs'

class DateService {
  constructor(adapter) {
    this.provider = adapter
  }

  initLocale(locale = navigator.language.split('-')[0]) {
    this.provider.initLocale(locale)
  }

  setDateTimezone(tz) {
    this.provider.setTimezone(tz)
  }

  getProvider() {
    return this.provider.getInstance()
  }

  _(...args) {
    return this.getProvider()(...args)
  }

  tz(date, timezone) {
    // Порядок вызова нельзя трогать, если надо лучше создать отдельный метод
    return this.getProvider()(date).tz(timezone)
  }

  utc(...args) {
    return this.getProvider().utc(...args)
  }

  unix(argument) {
    return this.getProvider().unix(argument)
  }
}

const adapter = new DayjsAdapter()

adapter.setTimezone()
const service = new DateService(adapter)

service.setDateTimezone(
  new Intl.DateTimeFormat()?.resolvedOptions?.()?.timeZone,
)

// eslint-disable-next-line import/prefer-default-export
export { service as DateService }
