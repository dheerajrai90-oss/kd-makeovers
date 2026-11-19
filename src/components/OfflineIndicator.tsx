import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-5 left-4 z-[150] flex items-center gap-2 rounded-xl bg-kd-surface border border-kd-rosegold/50 px-3.5 py-2 text-xs font-medium text-kd-pink shadow-xl">
      <WifiOff className="w-3.5 h-3.5 text-kd-rosegold shrink-0" />
      <span>Offline mode — showing cached studio content</span>
    </div>
  );
};
