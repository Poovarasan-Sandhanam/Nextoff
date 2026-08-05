import messaging from "@react-native-firebase/messaging";
import firestore from "@react-native-firebase/firestore";
import { Platform } from "react-native";
import { PaydayConfig, Region } from "../types";
import { loadSettings } from "./storage";

if (Platform.OS !== "web") {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("Background message:", remoteMessage);
  });
}

export function setupNotifications() {
  if (Platform.OS === "web") return;

  messaging().onTokenRefresh(async (newToken) => {
    console.log("FCM Token refreshed:", newToken);
    try {
      const settings = await loadSettings();
      if (settings.notificationsEnabled) {
        await firestore()
          .collection("users")
          .doc(newToken)
          .set({
            paydayConfig: settings.paydayConfig,
            region: settings.region,
            notificationsEnabled: true,
            fcmToken: newToken,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        console.log("Refreshed FCM token and synced settings to Firestore.");
      }
    } catch (error) {
      console.error("Failed to sync settings on FCM token refresh:", error);
    }
  });

  return messaging().onMessage(async (remoteMessage) => {
    console.log("Foreground message:", remoteMessage);
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return false;
  }
}

export async function reschedulePaydayNotifications(
  config: PaydayConfig,
  region: Region,
  enabled: boolean
): Promise<void> {
  if (Platform.OS === "web") return;

  console.log("Rescheduling payday notifications configuration:", { config, region, enabled });

  try {
    const hasPermission = await messaging().hasPermission();
    const isAuthorized =
      hasPermission === messaging.AuthorizationStatus.AUTHORIZED ||
      hasPermission === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled && isAuthorized) {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log("FCM Device Token acquired successfully:", token);

      if (token) {
        // Sync configuration and token to Firestore
        await firestore()
          .collection("users")
          .doc(token)
          .set({
            paydayConfig: config,
            region: region,
            notificationsEnabled: true,
            fcmToken: token,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        console.log("User settings synced to Firestore successfully.");
      }
    } else {
      console.log("Notifications disabled or not authorized. Checking if token exists to disable in DB...");
      try {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        if (token) {
          await firestore()
            .collection("users")
            .doc(token)
            .set({
              notificationsEnabled: false,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
          console.log("User notifications disabled in Firestore.");
        }
      } catch (tokenErr) {
        console.log("Could not disable in Firestore (no token access):", tokenErr);
      }
    }
  } catch (error) {
    console.error("Failed to reschedule payday notifications in Firestore:", error);
  }
}


