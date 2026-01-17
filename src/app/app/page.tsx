"use client";

import { useState, useEffect } from "react";

export default function AppPage() {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
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
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 p-4">
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
      <main className="flex-1 flex flex-col items-center justify-center gap-8 pt-16">
        {/* Counter Card */}
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

        {/* Info Card */}
        <div className="bg-slate-800/30 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/30 w-full max-w-sm">
          <h3 className="text-slate-400 text-sm mb-4">PWA Features</h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Installable on device
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

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 p-4">
        <div className="max-w-lg mx-auto">
          <a
            href="/sample-pwa/"
            className="block text-center text-slate-400 hover:text-slate-300 transition-colors"
          >
            Back to Download Page
          </a>
        </div>
      </footer>
    </div>
  );
}
