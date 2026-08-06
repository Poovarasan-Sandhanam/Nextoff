import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { getBankHolidaysForRegion } from '@/utils/dateHelpers';
import { Region } from '@/types';
import { Spacing } from '@/constants/theme';

interface HolidaysScreenProps {
  defaultRegion: Region;
}

const REGION_OPTIONS = [
  { value: 'ew', label: 'England & Wales' },
  { value: 'sc', label: 'Scotland' },
  { value: 'ni', label: 'N. Ireland' },
] as const;

interface HolidayItem {
  date: Date;
  name: string;
  isLongWeekend: boolean;
  dayOfWeek: string;
}

export default function HolidaysScreen({ defaultRegion }: HolidaysScreenProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region>(defaultRegion);
  const currentYear = new Date().getFullYear();

  // Load holidays for the selected region
  const holidays = getBankHolidaysForRegion(selectedRegion, currentYear);

  // Group holidays by Year
  const holidaysByYear = holidays.reduce((groups, item) => {
    const year = item.date.getFullYear();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(item);
    return groups;
  }, {} as Record<number, HolidayItem[]>);

  const years = Object.keys(holidaysByYear).map(Number).sort();

  const renderHolidayRow = (item: HolidayItem, index: number) => {
    const formattedDate = format(item.date, 'dd MMM');
    const dayStr = item.dayOfWeek.slice(0, 3); // Mon, Tue, etc.

    return (
      <View key={item.date.toISOString() + index} style={[styles.row, item.isLongWeekend && styles.longWeekendRow]}>
        {/* Date block */}
        <View style={styles.dateBlock}>
          <Text style={[styles.dateText, item.isLongWeekend && styles.longWeekendDateText]}>
            {formattedDate}
          </Text>
          <Text style={styles.dayText}>
            {dayStr}
          </Text>
        </View>

        {/* Info Block */}
        <View style={styles.infoBlock}>
          <Text style={styles.holidayName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.holidayWeekday}>
            {item.dayOfWeek}
          </Text>
        </View>

        {/* Long Weekend Indicator */}
        {item.isLongWeekend && (
          <View style={styles.longWeekendIndicator}>
            <Text style={styles.indicatorText}>3d</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bank Holidays</Text>
      </View>

      {/* Region Switcher */}
      <View style={styles.switcherContainer}>
        <View style={styles.switcher}>
          {REGION_OPTIONS.map((opt) => {
            const isSelected = selectedRegion === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={[styles.switcherButton, isSelected && styles.switcherActive]}
                onPress={() => setSelectedRegion(opt.value)}
              >
                <Text style={[styles.switcherText, isSelected && styles.switcherTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Grouped List of Holidays */}
      <FlatList
        data={years}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: year }) => (
          <View style={styles.yearSection}>
            <View style={styles.yearHeader}>
              <Text style={styles.yearHeaderText}>{year}</Text>
              <Text style={styles.yearHeaderCount}>
                {holidaysByYear[year]?.length || 0} holidays
              </Text>
            </View>
            <View style={styles.rowsContainer}>
              {holidaysByYear[year]?.map((holiday, idx) => renderHolidayRow(holiday, idx))}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  switcherContainer: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#1E1E24',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  switcherButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  switcherActive: {
    backgroundColor: '#6366F1',
  },
  switcherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  switcherTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 100,
  },
  yearSection: {
    marginTop: Spacing.three,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  yearHeaderText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  yearHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  rowsContainer: {
    backgroundColor: '#111115',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E1E24',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E24',
  },
  longWeekendRow: {
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
  },
  dateBlock: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: Spacing.two,
    borderRightWidth: 1,
    borderRightColor: '#1E1E24',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  longWeekendDateText: {
    color: '#F59E0B',
  },
  dayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  infoBlock: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
  },
  holidayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  holidayWeekday: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  longWeekendIndicator: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F59E0B',
  },
});
