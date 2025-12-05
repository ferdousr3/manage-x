export class DateUtil {
   static date(): Date {
      return new Date()
   }

   static addSeconds(date: Date, seconds: number): Date {
      return new Date(date.getTime() + seconds * 1000)
   }

   static addMinutes(date: Date, minutes: number): Date {
      return new Date(date.getTime() + minutes * 60 * 1000)
   }

   static addHours(date: Date, hours: number): Date {
      return new Date(date.getTime() + hours * 60 * 60 * 1000)
   }

   static addDays(date: Date, days: number): Date {
      return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
   }
}

export type DateUnit = 'seconds' | 'minutes' | 'hours' | 'days'

export function addDuration(value: number, unit: DateUnit): Date {
   const now = new Date()
   switch (unit) {
      case 'seconds':
         return DateUtil.addSeconds(now, value)
      case 'minutes':
         return DateUtil.addMinutes(now, value)
      case 'hours':
         return DateUtil.addHours(now, value)
      case 'days':
         return DateUtil.addDays(now, value)
   }
}
