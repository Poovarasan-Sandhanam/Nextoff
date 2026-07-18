"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dateHelpers_1 = require("./dateHelpers");
function runTests() {
    var _a, _b;
    console.log('--- STARTING NEXTOFF LOGIC VALIDATION TESTS ---');
    // Test Case 1: Fixed Payday on Weekend (July 25, 2026 - Saturday)
    // Current date set to July 12, 2026. Payday is fixed to the 25th.
    // July 25 is a Saturday, so it should adjust to Friday, July 24, 2026.
    const config1 = { type: 'fixed', fixedDay: 25 };
    const refDate1 = new Date(2026, 6, 12); // July 12, 2026 (Month is 0-indexed: 6 = July)
    const result1 = (0, dateHelpers_1.calculateNextPayday)(config1, 'ew', refDate1);
    console.log('Test 1 (Fixed Payday 25th in July 2026, on Saturday):');
    console.log(`  Reference Date: 2026-07-12`);
    console.log(`  Calculated Payday: ${result1.getFullYear()}-${result1.getMonth() + 1}-${result1.getDate()}`);
    console.log(`  Expected Payday: 2026-07-24 (Friday)`);
    const success1 = result1.getDate() === 24 && result1.getMonth() === 6;
    console.log(`  Status: ${success1 ? '✅ PASSED' : '❌ FAILED'}`);
    // Test Case 2: Fixed Payday on Holiday (December 25, 2026 - Christmas Day)
    // Dec 25 is a Friday (Christmas Day bank holiday).
    // Payday is fixed to the 25th. It should adjust to Thursday, December 24, 2026.
    const refDate2 = new Date(2026, 11, 1); // December 1, 2026
    const result2 = (0, dateHelpers_1.calculateNextPayday)(config1, 'ew', refDate2);
    console.log('\nTest 2 (Fixed Payday 25th in December 2026, on Christmas):');
    console.log(`  Reference Date: 2026-12-01`);
    console.log(`  Calculated Payday: ${result2.getFullYear()}-${result2.getMonth() + 1}-${result2.getDate()}`);
    console.log(`  Expected Payday: 2026-12-24 (Thursday)`);
    const success2 = result2.getDate() === 24 && result2.getMonth() === 11;
    console.log(`  Status: ${success2 ? '✅ PASSED' : '❌ FAILED'}`);
    // Test Case 3: Nth Weekday (Last Friday of March 2027)
    // March 31, 2027 is end of month. Last Friday of March 2027 is Friday, March 26, 2027.
    // BUT March 26, 2027 is Good Friday (bank holiday).
    // So it should adjust to Thursday, March 25, 2027.
    const config3 = {
        type: 'nth_weekday',
        nthWeekday: { occurrence: 'last', dayOfWeek: 5 } // Last Friday
    };
    const refDate3 = new Date(2027, 2, 1); // March 1, 2027
    const result3 = (0, dateHelpers_1.calculateNextPayday)(config3, 'ew', refDate3);
    console.log('\nTest 3 (Last Friday of March 2027, Good Friday overlap):');
    console.log(`  Reference Date: 2027-03-01`);
    console.log(`  Calculated Payday: ${result3.getFullYear()}-${result3.getMonth() + 1}-${result3.getDate()}`);
    console.log(`  Expected Payday: 2027-03-25 (Thursday)`);
    const success3 = result3.getDate() === 25 && result3.getMonth() === 2;
    console.log(`  Status: ${success3 ? '✅ PASSED' : '❌ FAILED'}`);
    // Test Case 4: Next Bank Holiday from July 12, 2026 (England & Wales)
    // Next observed bank holiday should be Summer Bank Holiday, Monday, August 31, 2026.
    const refDate4 = new Date(2026, 6, 12); // July 12, 2026
    const bhResult4 = (0, dateHelpers_1.calculateNextBankHoliday)('ew', refDate4);
    console.log('\nTest 4 (Next Bank Holiday for England & Wales from July 12, 2026):');
    console.log(`  Calculated: ${bhResult4 === null || bhResult4 === void 0 ? void 0 : bhResult4.name} on ${bhResult4 === null || bhResult4 === void 0 ? void 0 : bhResult4.date.getFullYear()}-${((_a = bhResult4 === null || bhResult4 === void 0 ? void 0 : bhResult4.date.getMonth()) !== null && _a !== void 0 ? _a : 0) + 1}-${bhResult4 === null || bhResult4 === void 0 ? void 0 : bhResult4.date.getDate()} (Long Weekend: ${bhResult4 === null || bhResult4 === void 0 ? void 0 : bhResult4.isLongWeekend})`);
    console.log(`  Expected: Summer bank holiday on 2026-08-31 (Long Weekend: true)`);
    const success4 = (bhResult4 === null || bhResult4 === void 0 ? void 0 : bhResult4.date.getDate()) === 31 && (bhResult4 === null || bhResult4 === void 0 ? void 0 : bhResult4.date.getMonth()) === 7 && bhResult4.isLongWeekend === true;
    console.log(`  Status: ${success4 ? '✅ PASSED' : '❌ FAILED'}`);
    // Test Case 5: Next Bank Holiday from July 12, 2026 (Scotland)
    // Scotland's Summer Bank Holiday is Monday, August 3, 2026 (first Monday of August, vs last Monday for EW).
    const bhResult5 = (0, dateHelpers_1.calculateNextBankHoliday)('sc', refDate4);
    console.log('\nTest 5 (Next Bank Holiday for Scotland from July 12, 2026):');
    console.log(`  Calculated: ${bhResult5 === null || bhResult5 === void 0 ? void 0 : bhResult5.name} on ${bhResult5 === null || bhResult5 === void 0 ? void 0 : bhResult5.date.getFullYear()}-${((_b = bhResult5 === null || bhResult5 === void 0 ? void 0 : bhResult5.date.getMonth()) !== null && _b !== void 0 ? _b : 0) + 1}-${bhResult5 === null || bhResult5 === void 0 ? void 0 : bhResult5.date.getDate()}`);
    console.log(`  Expected: Summer bank holiday on 2026-08-03`);
    const success5 = (bhResult5 === null || bhResult5 === void 0 ? void 0 : bhResult5.date.getDate()) === 3 && (bhResult5 === null || bhResult5 === void 0 ? void 0 : bhResult5.date.getMonth()) === 7;
    console.log(`  Status: ${success5 ? '✅ PASSED' : '❌ FAILED'}`);
    if (success1 && success2 && success3 && success4 && success5) {
        console.log('\n🎉 ALL LOGIC VALIDATION TESTS PASSED!');
    }
    else {
        console.log('\n❌ SOME LOGIC VALIDATION TESTS FAILED!');
    }
}
runTests();
