"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWeekend = isWeekend;
exports.isBankHoliday = isBankHoliday;
exports.getPreviousWorkingDay = getPreviousWorkingDay;
exports.calculateNextPayday = calculateNextPayday;
exports.isLongWeekendHoliday = isLongWeekendHoliday;
exports.calculateNextBankHoliday = calculateNextBankHoliday;
exports.getDaysRemaining = getDaysRemaining;
exports.getBankHolidaysForRegion = getBankHolidaysForRegion;
const date_fns_1 = require("date-fns");
const bankHolidays_json_1 = __importDefault(require("../data/bankHolidays.json"));
// Cast the imported JSON to the BankHoliday array type
const bankHolidays = bankHolidays_json_1.default;
function isWeekend(date) {
    return (0, date_fns_1.isWeekend)(date);
}
function isBankHoliday(date, region) {
    const dateStr = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
    return bankHolidays.some((bh) => bh.date === dateStr && bh.regions.includes(region));
}
function getPreviousWorkingDay(date, region) {
    let tempDate = new Date(date);
    while (isWeekend(tempDate) || isBankHoliday(tempDate, region)) {
        tempDate = (0, date_fns_1.subDays)(tempDate, 1);
    }
    return tempDate;
}
/**
 * Calculates the raw payday candidate in a given month and year
 */
function getRawPaydayCandidate(config, year, month) {
    var _a, _b;
    // month is 0-indexed (0 = Jan, 11 = Dec)
    const baseDate = new Date(year, month, 1);
    if (config.type === 'fixed') {
        const fixedDay = (_a = config.fixedDay) !== null && _a !== void 0 ? _a : 25;
        const maxDays = (0, date_fns_1.getDaysInMonth)(baseDate);
        const targetDay = Math.min(fixedDay, maxDays);
        return new Date(year, month, targetDay);
    }
    else {
        const { occurrence, dayOfWeek } = (_b = config.nthWeekday) !== null && _b !== void 0 ? _b : { occurrence: 'last', dayOfWeek: 5 };
        const monthStart = (0, date_fns_1.startOfMonth)(baseDate);
        const monthEnd = (0, date_fns_1.endOfMonth)(baseDate);
        if (occurrence === 'last') {
            let tempDate = monthEnd;
            while ((0, date_fns_1.getDay)(tempDate) !== dayOfWeek) {
                tempDate = (0, date_fns_1.subDays)(tempDate, 1);
            }
            return tempDate;
        }
        else {
            // occurrence is first, second, third, fourth
            let tempDate = monthStart;
            while ((0, date_fns_1.getDay)(tempDate) !== dayOfWeek) {
                tempDate = (0, date_fns_1.addDays)(tempDate, 1);
            }
            let weeksToAdd = 0;
            if (occurrence === 'second')
                weeksToAdd = 1;
            else if (occurrence === 'third')
                weeksToAdd = 2;
            else if (occurrence === 'fourth')
                weeksToAdd = 3;
            const candidate = (0, date_fns_1.addDays)(tempDate, weeksToAdd * 7);
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
function calculateNextPayday(config, region, referenceDate = new Date()) {
    // Clear times to make comparisons calendar-day based
    const refDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    let year = refDate.getFullYear();
    let month = refDate.getMonth();
    // 1. Calculate the adjusted payday for the current month
    const currentMonthRaw = getRawPaydayCandidate(config, year, month);
    const currentMonthAdjusted = getPreviousWorkingDay(currentMonthRaw, region);
    // If the adjusted payday for this month is today or in the future, it is the next payday!
    if ((0, date_fns_1.isSameDay)(currentMonthAdjusted, refDate) || (0, date_fns_1.isAfter)(currentMonthAdjusted, refDate)) {
        return currentMonthAdjusted;
    }
    // 2. If it is in the past, calculate for the next month
    const nextMonthDate = (0, date_fns_1.addMonths)(refDate, 1);
    const nextMonthRaw = getRawPaydayCandidate(config, nextMonthDate.getFullYear(), nextMonthDate.getMonth());
    return getPreviousWorkingDay(nextMonthRaw, region);
}
/**
 * Check if a bank holiday creates a long weekend (falls on Friday or Monday)
 */
function isLongWeekendHoliday(holidayDate) {
    const day = (0, date_fns_1.getDay)(holidayDate);
    return day === 1 || day === 5; // Monday or Friday
}
/**
 * Returns the next upcoming bank holiday for the selected region
 */
function calculateNextBankHoliday(region, referenceDate = new Date()) {
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
    const upcoming = regionalHolidays.find((bh) => (0, date_fns_1.isSameDay)(bh.date, refDate) || (0, date_fns_1.isAfter)(bh.date, refDate));
    return upcoming !== null && upcoming !== void 0 ? upcoming : null;
}
/**
 * Gets the number of calendar days remaining until target date
 */
function getDaysRemaining(targetDate, referenceDate = new Date()) {
    const refDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    const tgtDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    return (0, date_fns_1.differenceInCalendarDays)(tgtDate, refDate);
}
/**
 * Get all bank holidays for the current and next year for a region
 */
function getBankHolidaysForRegion(region, currentYear = new Date().getFullYear()) {
    return bankHolidays
        .filter((bh) => bh.regions.includes(region))
        .map((bh) => {
        const parts = bh.date.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return {
            date: d,
            name: bh.name,
            isLongWeekend: isLongWeekendHoliday(d),
            dayOfWeek: (0, date_fns_1.format)(d, 'EEEE')
        };
    })
        .filter((bh) => bh.date.getFullYear() >= currentYear && bh.date.getFullYear() <= currentYear + 1)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
}
