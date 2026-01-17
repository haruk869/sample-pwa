"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sample-pwa/sw.js");
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS (Safari)
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

    // Debug: iOS判定をコンソールに出力
    console.log("iOS detection:", {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
      isIOSDevice,
    });

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <span className="text-white text-5xl font-bold">P</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Sample PWA</h1>
          <p className="text-slate-400">Progressive Web App Demo</p>
        </div>

        {isInstalled ? (
          <div className="space-y-4">
            <p className="text-green-400 mb-4">Installed!</p>
            <Link
              href="/app"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-12 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
            >
              Open App
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {isInstallable ? (
              <button
                onClick={handleInstall}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-12 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              >
                Install App
              </button>
            ) : isIOS ? (
              <div className="bg-slate-800/50 rounded-2xl p-6 max-w-sm mx-auto">
                <p className="text-slate-300 mb-4">To install on iOS:</p>
                <ol className="text-slate-400 text-left space-y-2">
                  <li>1. Tap the Share button</li>
                  <li>2. Select &quot;Add to Home Screen&quot;</li>
                </ol>
              </div>
            ) : (
              <p className="text-slate-400 mb-4">
                Open in Chrome or Edge to install
              </p>
            )}
            <Link
              href="/app"
              className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-12 rounded-2xl text-lg transition-all duration-200"
            >
              Try Web Version
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
