import React from 'react';
import { StyleSheet, View, ScrollView, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calculateNextPayday, calculateNextBankHoliday, getDaysRemaining } from '@/utils/dateHelpers';
import { UserSettings } from '@/types';
import CountdownCard from '@/components/CountdownCard';
import { Spacing } from '@/constants/theme';

interface HomeScreenProps {
  settings: UserSettings;
}

export default function HomeScreen({ settings }: HomeScreenProps) {
  const today = new Date();
  
  // 1. Payday Countdown Calculation
  const nextPayday = calculateNextPayday(settings.paydayConfig, settings.region, today);
  const paydayDays = getDaysRemaining(nextPayday, today);

  // Determine Payday title text
  let paydaySubtitle = 'Your Monthly Salary Payday';
  if (settings.paydayConfig.type === 'fixed') {
    paydaySubtitle = `Day ${settings.paydayConfig.fixedDay} of the month`;
  } else if (settings.paydayConfig.nthWeekday) {
    const { occurrence, dayOfWeek } = settings.paydayConfig.nthWeekday;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const occLabel = occurrence.charAt(0).toUpperCase() + occurrence.slice(1);
    paydaySubtitle = `${occLabel} ${dayNames[dayOfWeek]} of the month`;
  }

  // 2. Bank Holiday Countdown Calculation
  const nextBH = calculateNextBankHoliday(settings.region, today);

  // Region text mapping
  const regionNames = {
    ew: 'England & Wales',
    sc: 'Scotland',
    ni: 'Northern Ireland',
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>NextOff</Text>
        <Text style={styles.brandSubtitle}>
          Tracking for {regionNames[settings.region]}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Next Payday Card */}
        <CountdownCard
          title="Next Payday"
          daysRemaining={paydayDays}
          date={nextPayday}
          subtitle={paydayDays === 0 ? 'Salary received! 🎉' : paydaySubtitle}
          gradientColors={['#6366F1', '#4F46E5']} // Indigo/Violet gradient
        />

        {/* Next Bank Holiday Card */}
        {nextBH ? (
          <CountdownCard
            title="Next Bank Holiday"
            daysRemaining={getDaysRemaining(nextBH.date, today)}
            date={nextBH.date}
            subtitle={nextBH.name}
            gradientColors={
              nextBH.isLongWeekend 
                ? ['#F59E0B', '#D97706'] // Warm Amber gradient for long weekends
                : ['#06B6D4', '#0891B2'] // Teal/Cyan gradient for normal bank holidays
            }
            isLongWeekendHighlight={nextBH.isLongWeekend}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming bank holidays found</Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: Spacing.two,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    paddingBottom: 100,
  },
  emptyCard: {
    width: '100%',
    height: 180,
    backgroundColor: '#1E1E24',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
});
