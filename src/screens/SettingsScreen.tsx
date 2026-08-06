import React from 'react';
import { StyleSheet, View, Text, Switch, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserSettings, Region, PaydayConfig } from '@/types';
import PaydaySelector from '@/components/PaydaySelector';
import { Spacing } from '@/constants/theme';
import { requestNotificationPermissions } from '@/utils/notifications';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onViewPrivacy: () => void;
}

const REGION_OPTIONS = [
  { value: 'ew', label: 'England & Wales' },
  { value: 'sc', label: 'Scotland' },
  { value: 'ni', label: 'Northern Ireland' },
] as const;

export default function SettingsScreen({
  settings,
  onUpdateSettings,
  onViewPrivacy,
}: SettingsScreenProps) {
  
  const handleRegionSelect = (region: Region) => {
    onUpdateSettings({
      ...settings,
      region,
    });
  };

  const handlePaydayChange = (paydayConfig: PaydayConfig) => {
    onUpdateSettings({
      ...settings,
      paydayConfig,
    });
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // User is turning notifications ON: request permission
      const granted = await requestNotificationPermissions();
      if (granted) {
        onUpdateSettings({
          ...settings,
          notificationsEnabled: true,
        });
      } else {
        // Denied or not available
        Alert.alert(
          'Permissions Required',
          'Please enable notifications for NextOff in your device settings to receive payday reminders.',
          [{ text: 'OK' }]
        );
        onUpdateSettings({
          ...settings,
          notificationsEnabled: false,
        });
      }
    } else {
      // User is turning notifications OFF
      onUpdateSettings({
        ...settings,
        notificationsEnabled: false,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Region Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Observe Region</Text>
          <View style={styles.optionsCard}>
            {REGION_OPTIONS.map((opt, idx) => {
              const isSelected = settings.region === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.rowOption,
                    idx < REGION_OPTIONS.length - 1 && styles.borderBottom,
                  ]}
                  onPress={() => handleRegionSelect(opt.value)}
                >
                  <Text style={styles.rowLabel}>{opt.label}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={22} color="#6366F1" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Payday Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Salary Payday</Text>
          <PaydaySelector
            config={settings.paydayConfig}
            onChange={handlePaydayChange}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Reminders</Text>
          <View style={styles.optionsCard}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.rowLabel}>Payday Notifications</Text>
                <Text style={styles.rowDescription}>
                  Get alerts 3 days before, 1 day before, and on payday morning.
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#2D2D35', true: '#4F46E5' }}
                thumbColor={settings.notificationsEnabled ? '#6366F1' : '#B0B4BA'}
                ios_backgroundColor="#111115"
              />
            </View>
          </View>
        </View>

        {/* Privacy & Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>About & Legal</Text>
          <View style={styles.optionsCard}>
            <Pressable style={styles.rowOption} onPress={onViewPrivacy}>
              <View>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
                <Text style={styles.rowDescription}>
                  NextOff is completely offline; we collect no data.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </Pressable>
          </View>
        </View>

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>NextOff v1.0.0</Text>
          <Text style={styles.versionText}>100% Private & Offline</Text>
        </View>
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
    paddingBottom: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.four,
    paddingBottom: 100,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: Spacing.one,
  },
  optionsCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  rowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: Spacing.three,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D35',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  rowDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    maxWidth: '85%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: Spacing.three,
  },
  switchInfo: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  versionFooter: {
    marginTop: Spacing.two,
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
