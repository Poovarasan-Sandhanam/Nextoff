import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadSettings, saveSettings } from '../utils/storage';
import { reschedulePaydayNotifications, setupNotifications } from '../utils/notifications';
import { UserSettings } from '../types';
import HomeScreen from '../screens/HomeScreen';
import HolidaysScreen from '../screens/HolidaysScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

export default function MainApp() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'holidays' | 'settings' | 'privacy'>('home');
  const [prevTab, setPrevTab] = useState<'home' | 'holidays' | 'settings'>('settings');

  // Load settings and setup notifications on startup
  useEffect(() => {
    async function init() {
      const saved = await loadSettings();
      setSettings(saved);
      // Initialize foreground/background notification handlers
      setupNotifications();
      // Proactively schedule notifications to ensure they are accurate
      reschedulePaydayNotifications(saved.paydayConfig, saved.region, saved.notificationsEnabled);
    }
    init();
  }, []);

  const handleUpdateSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
    // Instantly reschedule notification dates
    await reschedulePaydayNotifications(
      newSettings.paydayConfig,
      newSettings.region,
      newSettings.notificationsEnabled
    );
  };

  if (!settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen settings={settings} />;
      case 'holidays':
        return <HolidaysScreen defaultRegion={settings.region} />;
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onViewPrivacy={() => {
              setPrevTab('settings');
              setActiveTab('privacy');
            }}
          />
        );
      case 'privacy':
        return (
          <PrivacyScreen
            onBack={() => {
              setActiveTab(prevTab);
            }}
          />
        );
      default:
        return <HomeScreen settings={settings} />;
    }
  };

  const showTabBar = activeTab !== 'privacy';

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>{renderContent()}</View>

      {showTabBar && (
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            {/* Home Tab */}
            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('home')}
            >
              <Ionicons
                name={activeTab === 'home' ? 'calendar' : 'calendar-outline'}
                size={22}
                color={activeTab === 'home' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
                Countdown
              </Text>
            </Pressable>

            {/* Holidays Tab */}
            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('holidays')}
            >
              <Ionicons
                name={activeTab === 'holidays' ? 'list' : 'list-outline'}
                size={22}
                color={activeTab === 'holidays' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabLabel, activeTab === 'holidays' && styles.tabLabelActive]}>
                Holidays
              </Text>
            </Pressable>

            {/* Settings Tab */}
            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('settings')}
            >
              <Ionicons
                name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
                size={22}
                color={activeTab === 'settings' ? '#6366F1' : '#94A3B8'}
              />
              <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
                Settings
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16', // Sleek dark metallic theme background
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 36, 0.95)',
    borderRadius: 24,
    paddingVertical: 12,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
});
