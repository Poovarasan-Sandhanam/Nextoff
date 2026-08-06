import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { Spacing } from '@/constants/theme';

interface CountdownCardProps {
  title: string;
  daysRemaining: number;
  date: Date;
  subtitle: string;
  gradientColors: string[];
  isLongWeekendHighlight?: boolean;
}

export default function CountdownCard({
  title,
  daysRemaining,
  date,
  subtitle,
  gradientColors,
  isLongWeekendHighlight = false,
}: CountdownCardProps) {
  // Format the date nicely: e.g. "Friday, 24 Jul 2026"
  const formattedDate = format(date, 'EEEE, d MMM yyyy');

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        isLongWeekendHighlight && styles.highlightedCardBorder,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {isLongWeekendHighlight && (
          <View style={styles.longWeekendBadge}>
            <Text style={styles.longWeekendBadgeText}>⚡ Long Weekend</Text>
          </View>
        )}
      </View>

      <View style={styles.countdownContainer}>
        {daysRemaining === 0 ? (
          <Text style={styles.daysNumberText}>🎉 TODAY!</Text>
        ) : (
          <>
            <Text style={styles.daysNumber}>{daysRemaining}</Text>
            <Text style={styles.daysLabel}>
              {daysRemaining === 1 ? 'day remaining' : 'days remaining'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.subtitleText} numberOfLines={1}>
          {subtitle}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    // Android elevation
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...(Platform.select({
      web: {
        cursor: 'default',
        transition: 'transform 0.2s ease',
      },
    }) as any),
  },
  highlightedCardBorder: {
    borderColor: 'rgba(251, 191, 36, 0.6)', // Bright amber border
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  longWeekendBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  longWeekendBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FBBF24',
    textTransform: 'uppercase',
  },
  countdownContainer: {
    marginVertical: Spacing.three,
    alignItems: 'flex-start',
  },
  daysNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 70,
    letterSpacing: -1,
  },
  daysNumberText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 10,
    letterSpacing: -0.5,
  },
  daysLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -4,
  },
  cardFooter: {
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Spacing.three,
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
