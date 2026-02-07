'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Monitor, SlidersHorizontal, RefreshCw, Maximize, Eye, EyeOff } from 'lucide-react';

interface AppConfig {
  autoRotate: boolean;
  rotationInterval: number;
  idleTimeout: number;
  showUI: boolean;
  fullscreen: boolean;
  brightness: number;
  filterIntensity: number;
}

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`toggle-switch ${checked ? 'active' : ''}`}
      role="switch"
      aria-checked={checked}
    />
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-white/80">{label}</span>
      {children}
    </div>
  );
}

function SliderSetting({ label, value, min, max, unit, onChange, disabled }: {
  label: string; value: number; min: number; max: number; unit: string;
  onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div className={`py-2.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-xs font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        disabled={disabled}
      />
    </div>
  );
}

export default function ConfigPanel({ isOpen, onClose, config, setConfig }: ConfigPanelProps) {
  const update = (key: keyof AppConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col"
          >
            <div className="flex-1 glass overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 glass border-b border-white/5 px-5 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2.5">
                  <SlidersHorizontal className="w-5 h-5 text-violet-400" />
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-6">
                {/* Auto-Rotate */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <RotateCw className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Auto-Rotate</h3>
                  </div>
                  <div className="glass-light rounded-xl px-4">
                    <SettingRow label="Enable rotation">
                      <Toggle checked={config.autoRotate} onChange={v => update('autoRotate', v)} />
                    </SettingRow>
                    <div className="border-t border-white/5" />
                    <SliderSetting
                      label="Interval"
                      value={config.rotationInterval}
                      min={2}
                      max={30}
                      unit="s"
                      onChange={v => update('rotationInterval', v)}
                      disabled={!config.autoRotate}
                    />
                  </div>
                </section>

                {/* Display */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Display</h3>
                  </div>
                  <div className="glass-light rounded-xl px-4">
                    <SettingRow label="Show overlay UI">
                      <Toggle checked={config.showUI} onChange={v => update('showUI', v)} />
                    </SettingRow>
                    <div className="border-t border-white/5" />
                    <SettingRow label="Fullscreen">
                      <Toggle checked={config.fullscreen} onChange={v => update('fullscreen', v)} />
                    </SettingRow>
                    <div className="border-t border-white/5" />
                    <SliderSetting
                      label="Brightness"
                      value={config.brightness}
                      min={50}
                      max={150}
                      unit="%"
                      onChange={v => update('brightness', v)}
                    />
                  </div>
                </section>

                {/* Filter Settings */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <SlidersHorizontal className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Filter</h3>
                  </div>
                  <div className="glass-light rounded-xl px-4">
                    <SliderSetting
                      label="Filter intensity"
                      value={config.filterIntensity}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={v => update('filterIntensity', v)}
                    />
                    <div className="border-t border-white/5" />
                    <SliderSetting
                      label="Idle timeout"
                      value={config.idleTimeout}
                      min={1}
                      max={10}
                      unit="s"
                      onChange={v => update('idleTimeout', v)}
                    />
                  </div>
                </section>

                {/* Actions */}
                <section className="pb-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restart System
                  </button>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
