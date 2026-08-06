import React from 'react';
import { StyleSheet, ScrollView, Pressable, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/theme';

interface PrivacyScreenProps {
  onBack: () => void;
}

export default function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6366F1" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Privacy & Offline-First Core
            </Text>
            <Text style={styles.bodyText}>
              NextOff is designed with an offline-first core. We value your privacy and only use cloud resources to deliver scheduled push notifications.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              1. Data Collection
            </Text>
            <Text style={styles.bodyText}>
              We do not collect, transmit, or share any personal information (such as names or emails), location details, or app usage analytics.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              2. Storage & Cloud Sync
            </Text>
            <Text style={styles.bodyText}>
              Your payday configurations, region settings, and notification states are stored locally on your device. If you enable reminders, these preferences and your anonymous push token are synced securely to a Cloud Firestore database. This anonymous configuration never leaves the Firebase environment.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              3. Notifications
            </Text>
            <Text style={styles.bodyText}>
              Reminders and notifications are triggered via Firebase Cloud Messaging (FCM) using `@react-native-firebase/messaging` and processed automatically in the cloud.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              4. Third-Party Integrations
            </Text>
            <Text style={styles.bodyText}>
              NextOff has no advertising networks, tracking cookies, or external analytics integrations. Your app experience remains private and focused.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              5. App Store & Play Store Compliance
            </Text>
            <Text style={styles.bodyText}>
              This policy is provided to comply with App Store and Google Play guidelines regarding user privacy transparent disclosure. By using NextOff, you agree to this hybrid data architecture.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Last Updated: July 2026
            </Text>
            <Text style={styles.footerText}>
              NextOff App (v1.0.0)
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2E3135',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: Spacing.three,
    zIndex: 10,
  },
  backText: {
    color: '#6366F1',
    marginLeft: Spacing.one,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  scrollContent: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  card: {
    backgroundColor: '#1E1E24',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: Spacing.two,
  },
  bodyText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  footer: {
    marginTop: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
});
