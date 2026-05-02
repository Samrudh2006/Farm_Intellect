import { useEffect, useState } from "react";
import { getQueuedCount, OFFLINE_SYNC_EVENT } from "@/lib/offlineSync";

export const useOfflineSyncStatus = () => {
  const [queuedCount, setQueuedCount] = useState(getQueuedCount());
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const handleUpdate = () => setQueuedCount(getQueuedCount());
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener(OFFLINE_SYNC_EVENT, handleUpdate);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener(OFFLINE_SYNC_EVENT, handleUpdate);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { queuedCount, isOnline };
};
