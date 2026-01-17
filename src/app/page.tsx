"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type AccessSource = "installed" | "qr" | "browser";

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [source, setSource] = useState<AccessSource>("browser");
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [count, setCount] = useState(0);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sample-pwa/sw.js");
    }

    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const sourceParam = params.get("source");
    if (sourceParam === "installed") {
      setSource("installed");
    } else if (sourceParam === "qr") {
      setSource("qr");
    }

    // Check if standalone (installed)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if mobile
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsMobile(mobile);

    // Check if iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(iOS);

    // Show install banner for mobile users from QR who haven't installed
    if (!standalone && mobile && sourceParam === "qr") {
      setShowInstallBanner(true);
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Time update
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      clearInterval(interval);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsStandalone(true);
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
  };

  // スタンドアロン（インストール済み）の場合はアプリのみ表示
  if (isStandalone || source === "installed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 p-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-white font-semibold">Sample PWA</span>
            </div>
            <span className="text-slate-400 font-mono">{time}</span>
          </div>
        </header>

        {/* App Content */}
        <main className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
          <div className="bg-slate-800/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700/50 w-full max-w-sm">
            <h2 className="text-slate-400 text-center mb-6 text-sm uppercase tracking-wider">
              Counter
            </h2>
            <div className="text-7xl font-bold text-white text-center mb-8 font-mono">
              {count}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCount((c) => c - 1)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl text-2xl transition-all duration-200 active:scale-95"
              >
                -
              </button>
              <button
                onClick={() => setCount(0)}
                className="px-6 bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 font-semibold py-4 rounded-xl transition-all duration-200 active:scale-95"
              >
                Reset
              </button>
              <button
                onClick={() => setCount((c) => c + 1)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl text-2xl transition-all duration-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30 w-full max-w-sm">
            <h3 className="text-slate-400 text-sm mb-4">PWA Features</h3>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Installed on device
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Works offline
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Standalone app experience
              </li>
            </ul>
          </div>
        </main>
      </div>
    );
  }

  // ブラウザからのアクセス → Welcome + インストール案内
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
      {/* iOS インストールバナー（QRからのモバイルアクセス時） */}
      {showInstallBanner && (
        <div className="bg-indigo-600 text-white p-4">
          <div className="max-w-lg mx-auto flex items-start gap-3">
            <div className="flex-1">
              {isIOS ? (
                <>
                  <p className="font-semibold mb-1">ホーム画面に追加</p>
                  <p className="text-sm text-indigo-100">
                    画面下の <span className="inline-block px-1">⬆</span> をタップ →「ホーム画面に追加」
                  </p>
                </>
              ) : isInstallable ? (
                <>
                  <p className="font-semibold mb-1">アプリをインストール</p>
                  <button
                    onClick={handleInstall}
                    className="mt-2 bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg text-sm"
                  >
                    インストール
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold mb-1">アプリをインストール</p>
                  <p className="text-sm text-indigo-100">
                    ブラウザメニューから「ホーム画面に追加」
                  </p>
                </>
              )}
            </div>
            <button
              onClick={dismissBanner}
              className="text-indigo-200 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-white font-semibold">Sample PWA</span>
          </div>
          <span className="text-slate-400 font-mono">{time}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
        {/* Welcome Section - PC向け */}
        {!isMobile && (
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <span className="text-white text-4xl font-bold">P</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Sample PWA</h1>
            <p className="text-slate-400 mb-4">Progressive Web App Demo</p>

            {/* PC: Install Button */}
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 mb-4"
              >
                Install App
              </button>
            )}

            {/* PC: QR Code for Mobile */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 max-w-xs mx-auto">
              <p className="text-slate-300 text-sm mb-3">スマホでインストール</p>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://haruk869.github.io/sample-pwa/?source=qr"
                alt="QR Code"
                className="mx-auto rounded-lg"
                width={120}
                height={120}
              />
              <p className="text-slate-500 text-xs mt-3">QRコードをスキャン</p>
            </div>
          </div>
        )}

        {/* App Section */}
        <div className="bg-slate-800/50 rounded-3xl p-8 backdrop-blur-sm border border-slate-700/50 w-full max-w-sm">
          <h2 className="text-slate-400 text-center mb-6 text-sm uppercase tracking-wider">
            Counter
          </h2>
          <div className="text-7xl font-bold text-white text-center mb-8 font-mono">
            {count}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setCount((c) => c - 1)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl text-2xl transition-all duration-200 active:scale-95"
            >
              -
            </button>
            <button
              onClick={() => setCount(0)}
              className="px-6 bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 font-semibold py-4 rounded-xl transition-all duration-200 active:scale-95"
            >
              Reset
            </button>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl text-2xl transition-all duration-200 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* PWA Features */}
        <div className="bg-slate-800/30 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30 w-full max-w-sm">
          <h3 className="text-slate-400 text-sm mb-4">PWA Features</h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isStandalone ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              {isStandalone ? "Installed on device" : "Installable on device"}
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Works offline
            </li>
            <li className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isStandalone ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              {isStandalone ? "Standalone app" : "Browser mode"}
            </li>
          </ul>
        </div>

        {/* Mobile: Install Guide (if not from QR banner) */}
        {isMobile && !showInstallBanner && !isStandalone && (
          <div className="bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm border border-slate-700/50 w-full max-w-sm">
            {isIOS ? (
              <div className="text-center">
                <p className="text-slate-300 text-sm mb-2">ホーム画面に追加するには</p>
                <p className="text-slate-400 text-xs">
                  <span className="inline-block px-1">⬆</span> → 「ホーム画面に追加」
                </p>
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstall}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                アプリをインストール
              </button>
            ) : (
              <p className="text-slate-400 text-sm text-center">
                メニューから「ホーム画面に追加」
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
