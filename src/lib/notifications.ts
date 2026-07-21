import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

// Request permissions for notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === "granted";
    } catch (err) {
      console.warn("Failed to request native notification permissions:", err);
      return false;
    }
  } else {
    // Browser Notifications API
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications.");
      return false;
    }
    
    if (Notification.permission === "granted") {
      return true;
    }
    
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    
    return false;
  }
}

// Trigger an immediate notification (used for real-time partner nudges/pokes)
export async function showImmediateNotification(title: string, body: string) {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 100000),
            extra: { type: "poke" },
            smallIcon: "res://ic_stat_drop", // falls back to default if missing
            sound: "res://plop.wav"
          }
        ]
      });
    } catch (err) {
      console.warn("Failed to send native notification:", err);
    }
  } else {
    try {
      new Notification(title, {
        body,
        icon: "/assets/logo.png" // fallback
      });
    } catch (err) {
      console.warn("Failed to send web notification:", err);
    }
  }
}

// Schedule recurring hydration reminders
// Skips Quiet Hours range (e.g. 22:00 to 08:00)
export async function scheduleHydrationReminders(
  intervalMinutes: number,
  quietStart: string,
  quietEnd: string,
  companionName: string
) {
  await cancelAllReminders();
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  if (Capacitor.isNativePlatform()) {
    try {
      const notifications = [];
      const [startHour] = quietStart.split(":").map(Number);
      const [endHour] = quietEnd.split(":").map(Number);
      
      // Schedule 10 reminders throughout the day outside Quiet Hours
      let scheduledCount = 0;
      let checkDate = new Date();

      for (let i = 1; i <= 24; i++) {
        checkDate = new Date(Date.now() + i * intervalMinutes * 60 * 1000);
        const hour = checkDate.getHours();
        
        // Skip quiet hours check
        let isQuiet = false;
        if (startHour <= endHour) {
          isQuiet = hour >= startHour && hour <= endHour;
        } else {
          isQuiet = hour >= startHour || hour <= endHour;
        }

        if (!isQuiet) {
          scheduledCount++;
          notifications.push({
            title: "💧 Time to Hydrate!",
            body: `${companionName} suggests taking a quick sip of water!`,
            id: i,
            schedule: { at: checkDate },
            smallIcon: "res://ic_stat_drop"
          });
        }
        
        if (scheduledCount >= 10) break; // Schedule max 10
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch (err) {
      console.warn("Failed to schedule native notifications:", err);
    }
  } else {
    // For web browsers, we use client-side timers if app is open
    console.log("Web browser active: scheduled hydration checks every", intervalMinutes, "mins.");
  }
}

// Clear all scheduled notifications
export async function cancelAllReminders() {
  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (err) {
      console.warn("Failed to clear native notifications:", err);
    }
  }
}
