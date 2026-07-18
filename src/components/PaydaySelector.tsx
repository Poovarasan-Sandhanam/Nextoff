import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { PaydayConfig } from '../types';
import { Spacing } from '../constants/theme';

interface PaydaySelectorProps {
  config: PaydayConfig;
  onChange: (newConfig: PaydayConfig) => void;
}

const OCCURRENCES = [
  { value: 'first', label: '1st' },
  { value: 'second', label: '2nd' },
  { value: 'third', label: '3rd' },
  { value: 'fourth', label: '4th' },
  { value: 'last', label: 'Last' },
] as const;

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
] as const;

export default function PaydaySelector({ config, onChange }: PaydaySelectorProps) {
  const isFixed = config.type === 'fixed';

  const handleTypeChange = (type: 'fixed' | 'nth_weekday') => {
    if (type === 'fixed') {
      onChange({
        type: 'fixed',
        fixedDay: config.fixedDay ?? 25,
      });
    } else {
      onChange({
        type: 'nth_weekday',
        nthWeekday: config.nthWeekday ?? {
          occurrence: 'last',
          dayOfWeek: 5, // Friday
        },
      });
    }
  };

  const handleFixedDaySelect = (day: number) => {
    onChange({
      type: 'fixed',
      fixedDay: day,
    });
  };

  const handleNthOccurrenceSelect = (occurrence: typeof OCCURRENCES[number]['value']) => {
    onChange({
      type: 'nth_weekday',
      nthWeekday: {
        occurrence,
        dayOfWeek: config.nthWeekday?.dayOfWeek ?? 5,
      },
    });
  };

  const handleNthDaySelect = (dayOfWeek: number) => {
    onChange({
      type: 'nth_weekday',
      nthWeekday: {
        occurrence: config.nthWeekday?.occurrence ?? 'last',
        dayOfWeek,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <Pressable
          style={[styles.segmentButton, isFixed && styles.segmentActive]}
          onPress={() => handleTypeChange('fixed')}
        >
          <Text style={[styles.segmentText, isFixed && styles.segmentTextActive]}>
            Fixed Date
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, !isFixed && styles.segmentActive]}
          onPress={() => handleTypeChange('nth_weekday')}
        >
          <Text style={[styles.segmentText, !isFixed && styles.segmentTextActive]}>
            Nth Weekday
          </Text>
        </Pressable>
      </View>

      {isFixed ? (
        <View style={styles.fixedContainer}>
          <Text style={styles.sectionLabel}>Select Day of the Month:</Text>
          <View style={styles.grid}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isSelected = config.fixedDay === day;
              return (
                <Pressable
                  key={day}
                  style={[styles.gridCell, isSelected && styles.gridCellActive]}
                  onPress={() => handleFixedDaySelect(day)}
                >
                  <Text style={[styles.gridCellText, isSelected && styles.gridCellTextActive]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.nthContainer}>
          <Text style={styles.sectionLabel}>Select Pattern:</Text>
          
          {/* Occurrence Selectors */}
          <View style={styles.patternSection}>
            <Text style={styles.patternLabel}>Occurrence</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {OCCURRENCES.map((occ) => {
                const isSelected = config.nthWeekday?.occurrence === occ.value;
                return (
                  <Pressable
                    key={occ.value}
                    style={[styles.pillButton, isSelected && styles.pillActive]}
                    onPress={() => handleNthOccurrenceSelect(occ.value)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {occ.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Weekday Selectors */}
          <View style={styles.patternSection}>
            <Text style={styles.patternLabel}>Day of the Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = config.nthWeekday?.dayOfWeek === day.value;
                return (
                  <Pressable
                    key={day.value}
                    style={[styles.pillButton, isSelected && styles.pillActive]}
                    onPress={() => handleNthDaySelect(day.value)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1E1E24',
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#111115',
    borderRadius: 14,
    padding: 3,
    marginBottom: Spacing.three,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  segmentActive: {
    backgroundColor: '#6366F1', // Indigo
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  fixedContainer: {
    paddingTop: Spacing.one,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  gridCell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2D2D35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gridCellActive: {
    backgroundColor: '#6366F1',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gridCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  gridCellTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  nthContainer: {
    gap: Spacing.three,
  },
  patternSection: {
    gap: Spacing.one,
  },
  patternLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
  },
  horizontalScroll: {
    gap: 8,
    paddingRight: Spacing.three,
  },
  pillButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2D2D35',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#6366F1',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
