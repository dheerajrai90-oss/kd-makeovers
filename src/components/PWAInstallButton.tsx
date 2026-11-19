import React, { useState } from 'react';
import { Download, CheckCircle2, Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';
import { toast } from 'sonner';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'footer';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleClick = async () => {
    if (isInstalled) {
      toast.success('KD Makeovers is already installed on your device.');
      return;
    }
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        toast.success('KD Makeovers app installed!');
      }
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      {isInstalled ? (
        variant === 'compact' ? null : (
          <div
            className={`inline-flex items-center gap-2 text-xs text-kd-pink/80 ${className}`}
          >
            <CheckCircle2 className="w-4 h-4 text-kd-rosegold shrink-0" />
            <span>App Installed on Device</span>
          </div>
        )
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={
            variant === 'full'
              ? `w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-kd-rosegold/50 bg-kd-surface text-kd-pink hover:bg-kd-pink hover:text-kd-black font-semibold text-sm transition-colors whitespace-nowrap shrink-0 ${className}`
              : variant === 'footer'
                ? `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-sm transition-colors whitespace-nowrap shrink-0 ${className}`
                : `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-kd-rosegold/40 text-kd-pink hover:bg-kd-pink hover:text-kd-black text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${className}`
          }
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Install App</span>
        </button>
      )}

      {showGuideModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-kd-surface border border-kd-rosegold/40 p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-kd-black border border-kd-rosegold/50 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-kd-pink" />
                </div>
                <div>
                  <h3 id="pwa-install-title" className="font-serif text-xl font-semibold text-kd-pink">
                    Install KD Makeovers App
                  </h3>
                  <p className="text-xs text-kd-muted">Fast mobile access to services & bookings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-lg text-kd-muted hover:text-white hover:bg-white/5"
                aria-label="Close installation guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-sm text-kd-muted bg-kd-black/60 rounded-xl p-4 border border-kd-rosegold/20">
                <p className="text-white font-medium">For iPhone & iPad (Safari):</p>
                <ol className="space-y-2.5 list-decimal list-inside">
                  <li className="leading-relaxed">
                    Tap the <strong className="text-kd-pink inline-flex items-center gap-1">Share <Share className="w-3.5 h-3.5 inline" /></strong> button in the Safari toolbar.
                  </li>
                  <li className="leading-relaxed">
                    Scroll down and select <strong className="text-kd-pink inline-flex items-center gap-1">Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline" /></strong>.
                  </li>
                  <li className="leading-relaxed">
                    Tap <strong className="text-white">Add</strong> in the top-right corner to install KD Makeovers.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-kd-muted bg-kd-black/60 rounded-xl p-4 border border-kd-rosegold/20">
                <p className="text-white font-medium">Install from your browser:</p>
                <ol className="space-y-2.5 list-decimal list-inside">
                  <li className="leading-relaxed">
                    Open this website in <strong className="text-kd-pink">Google Chrome</strong> or <strong className="text-kd-pink">Microsoft Edge</strong>.
                  </li>
                  <li className="leading-relaxed">
                    Tap the browser menu (<strong className="text-white">⋮</strong>) or address-bar install icon.
                  </li>
                  <li className="leading-relaxed">
                    Select <strong className="text-kd-pink">Install app</strong> or <strong className="text-kd-pink">Add to Home screen</strong>.
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm hover:bg-kd-blush transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
