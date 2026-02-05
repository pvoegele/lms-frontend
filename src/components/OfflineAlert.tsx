import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineAlert() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-3 flex items-center gap-3 z-50 shadow-lg">
      <WifiOff className="w-5 h-5" />
      <div className="flex-1">
        <p className="font-semibold">No Internet Connection</p>
        <p className="text-sm opacity-90">You're working offline. Changes will sync when reconnected.</p>
      </div>
    </div>
  );
}
