import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * Mounts global push-notification listening for the signed-in user.
 * Headless component — renders nothing. Place inside <AuthProvider>.
 */
export const PushNotificationProvider = () => {
  usePushNotifications();
  return null;
};
