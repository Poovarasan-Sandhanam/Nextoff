import {
  isWeekend as fnsIsWeekend,
  differenceInCalendarDays,
  format,
  addMonths,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  getDay,
  addDays,
  subDays,
  isAfter,
  isSameDay
} from 'date-fns';
import bankHolidaysData from '../data/bankHolidays.json';
import { PaydayConfig, Region, BankHoliday } from '../types';

// Cast the imported JSON to the BankHoliday array type
const bankHolidays = bankHolidaysData as BankHoliday[];

export function isWeekend(date: Date): boolean {
  return fnsIsWeekend(date);
}

export function isBankHoliday(date: Date, region: Region): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return bankHolidays.some(
    (bh) => bh.date === dateStr && bh.regions.includes(region)
  );
}

export function getPreviousWorkingDay(date: Date, region: Region): Date {
  let tempDate = new Date(date);
  while (isWeekend(tempDate) || isBankHoliday(tempDate, region)) {
    tempDate = subDays(tempDate, 1);
  }
  return tempDate;
}

/**
 * Calculates the raw payday candidate in a given month and year
 */
function getRawPaydayCandidate(config: PaydayConfig, year: number, month: number): Date {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const baseDate = new Date(year, month, 1);

  if (config.type === 'fixed') {
    const fixedDay = config.fixedDay ?? 25;
    const maxDays = getDaysInMonth(baseDate);
    const targetDay = Math.min(fixedDay, maxDays);
    return new Date(year, month, targetDay);
  } else {
    const { occurrence, dayOfWeek } = config.nthWeekday ?? { occurrence: 'last', dayOfWeek: 5 };
    const monthStart = startOfMonth(baseDate);
    const monthEnd = endOfMonth(baseDate);

    if (occurrence === 'last') {
      let tempDate = monthEnd;
      while (getDay(tempDate) !== dayOfWeek) {
        tempDate = subDays(tempDate, 1);
      }
      return tempDate;
    } else {
      // occurrence is first, second, third, fourth
      let tempDate = monthStart;
      while (getDay(tempDate) !== dayOfWeek) {
        tempDate = addDays(tempDate, 1);
      }

      let weeksToAdd = 0;
      if (occurrence === 'second') weeksToAdd = 1;
      else if (occurrence === 'third') weeksToAdd = 2;
      else if (occurrence === 'fourth') weeksToAdd = 3;

      const candidate = addDays(tempDate, weeksToAdd * 7);
      // Fallback check to make sure it doesn't leak into next month
      if (candidate.getMonth() !== month) {
        return tempDate; // Fallback to first occurrence
      }
      return candidate;
    }
  }
}

/**
 * Calculates the next payday date based on configuration, region, and reference date
 */
export function calculateNextPayday(
  config: PaydayConfig,
  region: Region,
  referenceDate: Date = new Date()
): Date {
  // Clear times to make comparisons calendar-day based
  const refDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  let year = refDate.getFullYear();
  let month = refDate.getMonth();

  // 1. Calculate the adjusted payday for the current month
  const currentMonthRaw = getRawPaydayCandidate(config, year, month);
  const currentMonthAdjusted = getPreviousWorkingDay(currentMonthRaw, region);

  // If the adjusted payday for this month is today or in the future, it is the next payday!
  if (isSameDay(currentMonthAdjusted, refDate) || isAfter(currentMonthAdjusted, refDate)) {
    return currentMonthAdjusted;
  }

  // 2. If it is in the past, calculate for the next month
  const nextMonthDate = addMonths(refDate, 1);
  const nextMonthRaw = getRawPaydayCandidate(config, nextMonthDate.getFullYear(), nextMonthDate.getMonth());
  return getPreviousWorkingDay(nextMonthRaw, region);
}

/**
 * Check if a bank holiday creates a long weekend (falls on Friday or Monday)
 */
export function isLongWeekendHoliday(holidayDate: Date): boolean {
  const day = getDay(holidayDate);
  return day === 1 || day === 5; // Monday or Friday
}

/**
 * Returns the next upcoming bank holiday for the selected region
 */
export function calculateNextBankHoliday(
  region: Region,
  referenceDate: Date = new Date()
): { date: Date; name: string; isLongWeekend: boolean } | null {
  const refDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  // Filter and parse holidays for this region
  const regionalHolidays = bankHolidays
    .filter((bh) => bh.regions.includes(region))
    .map((bh) => {
      const parts = bh.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return {
        date: d,
        name: bh.name,
        isLongWeekend: isLongWeekendHoliday(d)
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Find the first one that is today or in the future
  const upcoming = regionalHolidays.find(
    (bh) => isSameDay(bh.date, refDate) || isAfter(bh.date, refDate)
  );

  return upcoming ?? null;
}

/**
 * Gets the number of calendar days remaining until target date
 */
export function getDaysRemaining(targetDate: Date, referenceDate: Date = new Date()): number {
  const refDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const tgtDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  return differenceInCalendarDays(tgtDate, refDate);
}

/**
 * Get all bank holidays for the current and next year for a region
 */
export function getBankHolidaysForRegion(
  region: Region,
  currentYear: number = new Date().getFullYear()
): { date: Date; name: string; isLongWeekend: boolean; dayOfWeek: string }[] {
  return bankHolidays
    .filter((bh) => bh.regions.includes(region))
    .map((bh) => {
      const parts = bh.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return {
        date: d,
        name: bh.name,
        isLongWeekend: isLongWeekendHoliday(d),
        dayOfWeek: format(d, 'EEEE')
      };
    })
    .filter((bh) => bh.date.getFullYear() >= currentYear && bh.date.getFullYear() <= currentYear + 1)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
