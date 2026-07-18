export interface PaydayConfig {
  type: 'fixed' | 'nth_weekday';
  fixedDay?: number; // 1-31
  nthWeekday?: {
    occurrence: 'first' | 'second' | 'third' | 'fourth' | 'last';
    dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  };
}

export type Region = 'ew' | 'sc' | 'ni';

export interface UserSettings {
  region: Region;
  paydayConfig: PaydayConfig;
  notificationsEnabled: boolean;
}

export interface BankHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  regions: Region[];
}
