"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type AccessSource = "installed" | "qr" | "browser";

// iOS バージョンを取得
function getIOSVersion(): number | null {
  const match = navigator.userAgent.match(/OS (\d+)_/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [iOSVersion, setIOSVersion] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [source, setSource] = useState<AccessSource>("browser");
  const [showInstallSheet, setShowInstallSheet] = useState(false);
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

    // Check if iOS and get version
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(iOS);

    if (iOS) {
      setIOSVersion(getIOSVersion());
    }

    // Show install sheet for mobile users from QR who haven't installed
    if (!standalone && mobile && sourceParam === "qr") {
      setShowInstallSheet(true);
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
      setShowInstallSheet(false);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const dismissSheet = () => {
    setShowInstallSheet(false);
  };

  // iOS 26以上かどうか
  const isIOS26OrLater = iOSVersion !== null && iOSVersion >= 26;

  // iOS用のシェアアイコンとテキスト
  const getIOSInstallInstructions = () => {
    if (isIOS26OrLater) {
      return {
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="18" r="2" />
          </svg>
        ),
        text: "右下の",
        buttonText: "•••",
        instruction: "をタップ →「ホーム画面に追加」"
      };
    } else {
      return {
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12L8 8m4-4l4 4" />
          </svg>
        ),
        text: "画面下の",
        buttonText: "共有ボタン",
        instruction: "をタップ →「ホーム画面に追加」"
      };
    }
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

  // モバイル（QRアクセスまたは直接アクセス）→ アプリモード + シート
  if (isMobile) {
    const iosInstructions = getIOSInstallInstructions();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col relative">
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
        <main className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
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
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Installable on device
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Works offline
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Browser mode
              </li>
            </ul>
          </div>
        </main>

        {/* Bottom Sheet for Install */}
        {showInstallSheet && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={dismissSheet}
            />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 rounded-t-3xl z-50 p-6 pb-8 animate-slide-up">
              <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-6" />

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">P</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Sample PWA</h2>
                <p className="text-slate-400 text-sm">ホーム画面に追加してアプリとして使用</p>
              </div>

              {isIOS ? (
                <div className="bg-slate-700/50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center text-indigo-400">
                      {iosInstructions.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        {iosInstructions.text}
                        <span className="font-semibold text-indigo-400">{iosInstructions.buttonText}</span>
                        {iosInstructions.instruction}
                      </p>
                    </div>
                  </div>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={handleInstall}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all mb-4"
                >
                  インストール
                </button>
              ) : (
                <div className="bg-slate-700/50 rounded-2xl p-4 mb-4">
                  <p className="text-white text-sm text-center">
                    ブラウザメニューから「ホーム画面に追加」を選択
                  </p>
                </div>
              )}

              <button
                onClick={dismissSheet}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 rounded-2xl transition-all"
              >
                後で
              </button>
            </div>
          </>
        )}

        {/* Mini Install Button (when sheet is dismissed) */}
        {!showInstallSheet && (
          <button
            onClick={() => setShowInstallSheet(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all z-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // PC → ダウンロードページ風
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* App Icon */}
        <div className="w-28 h-28 bg-indigo-600 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
          <span className="text-white text-6xl font-bold">P</span>
        </div>

        {/* App Info */}
        <h1 className="text-4xl font-bold text-white mb-2">Sample PWA</h1>
        <p className="text-slate-400 mb-2">Progressive Web App Demo</p>
        <p className="text-slate-500 text-sm mb-8">Version 1.0.0 • Anthropic</p>

        {/* Install Button for PC */}
        {isInstallable ? (
          <button
            onClick={handleInstall}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 mb-6"
          >
            インストール
          </button>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-700/50">
            <p className="text-slate-400 text-sm">
              Chrome または Edge でインストール可能
            </p>
          </div>
        )}

        {/* QR Code Section */}
        <div className="bg-slate-800/50 rounded-3xl p-6 backdrop-blur-sm border border-slate-700/50">
          <p className="text-slate-300 text-sm mb-4">スマートフォンでインストール</p>
          <div className="bg-white p-3 rounded-2xl inline-block mb-4">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://haruk869.github.io/sample-pwa/?source=qr"
              alt="QR Code"
              className="rounded-lg"
              width={140}
              height={140}
            />
          </div>
          <p className="text-slate-500 text-xs">カメラでQRコードをスキャン</p>
        </div>

        {/* Features */}
        <div className="mt-8 text-left">
          <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-4">Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">📱</span>
              ホーム画面にインストール可能
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">📡</span>
              オフラインでも動作
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">🚀</span>
              ネイティブアプリのような体験
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
