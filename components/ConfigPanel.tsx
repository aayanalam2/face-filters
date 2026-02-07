'use client';

import { useState } from 'react';

interface AppConfig {
  autoRotate: boolean;
  rotationInterval: number;
  idleTimeout: number;
  showUI: boolean;
  fullscreen: boolean;
  brightness: number;
  filterIntensity: number;
}

interface Filter {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

interface ConfigPanelProps {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  filters: Filter[];
  selectedFilter: string;
  setSelectedFilter: (id: string) => void;
}

export default function ConfigPanel({ config, setConfig, filters, selectedFilter, setSelectedFilter }: ConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateConfig = (key: keyof AppConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="relative">
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-t-lg font-semibold shadow-lg transition-all z-10"
      >
        {isExpanded ? '▼ Hide Controls' : '▲ Show Controls'}
      </button>

      {/* Control Panel */}
      <div
        className={`bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-t-4 border-purple-600 transition-all duration-300 ${
          isExpanded ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Filter Selection Grid */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Select Filter</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setSelectedFilter(filter.id);
                    updateConfig('autoRotate', false);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedFilter === filter.id
                      ? 'border-purple-400 bg-purple-600/50 scale-110'
                      : 'border-gray-600 bg-gray-800/50 hover:border-purple-500'
                  }`}
                  title={filter.name}
                >
                  <div className="text-2xl">{filter.emoji}</div>
                  <div className="text-xs text-white mt-1 truncate">{filter.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Auto-Rotate Settings */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>🔄</span> Auto-Rotate
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between text-white">
                  <span>Enable Auto-Rotate</span>
                  <input
                    type="checkbox"
                    checked={config.autoRotate}
                    onChange={(e) => updateConfig('autoRotate', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </label>
                <div>
                  <label className="text-white text-sm block mb-1">
                    Interval: {config.rotationInterval}s
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={config.rotationInterval}
                    onChange={(e) => updateConfig('rotationInterval', Number(e.target.value))}
                    className="w-full"
                    disabled={!config.autoRotate}
                  />
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>🖥️</span> Display
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between text-white">
                  <span>Show UI</span>
                  <input
                    type="checkbox"
                    checked={config.showUI}
                    onChange={(e) => updateConfig('showUI', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-white">
                  <span>Fullscreen</span>
                  <input
                    type="checkbox"
                    checked={config.fullscreen}
                    onChange={(e) => updateConfig('fullscreen', e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                </label>
                <div>
                  <label className="text-white text-sm block mb-1">
                    Brightness: {config.brightness}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={config.brightness}
                    onChange={(e) => updateConfig('brightness', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Filter Settings */}
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>🎨</span> Filter Settings
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-white text-sm block mb-1">
                    Idle Timeout: {config.idleTimeout}s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.idleTimeout}
                    onChange={(e) => updateConfig('idleTimeout', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-white text-sm block mb-1">
                    Filter Intensity: {config.filterIntensity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.filterIntensity}
                    onChange={(e) => updateConfig('filterIntensity', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              🔄 Restart System
            </button>
            <button
              onClick={() => updateConfig('fullscreen', !config.fullscreen)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {config.fullscreen ? '⊡ Exit Fullscreen' : '⛶ Enter Fullscreen'}
            </button>
            <button
              onClick={() => updateConfig('showUI', !config.showUI)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {config.showUI ? '👁️ Hide UI' : '👁️ Show UI'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
