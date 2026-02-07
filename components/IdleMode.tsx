'use client';

import { useEffect, useState } from 'react';

export default function IdleMode() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-sm z-10">
      <div className="text-center space-y-8 animate-pulse">
        {/* Animated Icon */}
        <div className="text-9xl animate-bounce">
          👋
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white">
            Step Into View!
          </h1>
          <p className="text-3xl text-purple-200">
            Face the camera to try fun filters{dots}
          </p>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center gap-8 text-5xl mt-12">
          <div className="animate-bounce" style={{ animationDelay: '0s' }}>🕶️</div>
          <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>👑</div>
          <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>🐱</div>
          <div className="animate-bounce" style={{ animationDelay: '0.3s' }}>🦸</div>
          <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</div>
        </div>

        {/* Scanning Effect */}
        <div className="relative w-96 h-96 mx-auto">
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-ping opacity-50"></div>
          <div className="absolute inset-8 border-4 border-blue-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-16 border-4 border-indigo-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }}></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl">
              📷
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xl text-purple-300 space-y-2">
          <p>✨ Auto-rotating filters</p>
          <p>🎭 15+ fun effects to try</p>
          <p>🚀 Real-time face tracking</p>
        </div>
      </div>
    </div>
  );
}
