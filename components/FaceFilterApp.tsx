'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Settings, Download, Sparkles } from 'lucide-react';
import ConfigPanel from './ConfigPanel';
import IdleMode from './IdleMode';
import FilterCarousel from './FilterCarousel';
import { FILTERS, drawFilter } from '@/lib/filters';

// ─── Types ────────────────────────────────────────────────────────────

interface AppConfig {
  autoRotate: boolean;
  rotationInterval: number;
  idleTimeout: number;
  showUI: boolean;
  fullscreen: boolean;
  brightness: number;
  filterIntensity: number;
}

// ─── Component ────────────────────────────────────────────────────────

export default function FaceFilterApp() {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastFaceTimeRef = useRef<number>(Date.now());
  const lastRotationTimeRef = useRef<number>(Date.now());
  const idleTimeoutRef = useRef<NodeJS.Timeout>();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState('Initializing…');
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('glasses');
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showIdleMode, setShowIdleMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    autoRotate: true,
    rotationInterval: 5,
    idleTimeout: 3,
    showUI: true,
    fullscreen: false,
    brightness: 100,
    filterIntensity: 100,
  });

  // ─── Automatic filter rotation ───────────────────────────────────

  useEffect(() => {
    if (!config.autoRotate || !isDetecting || !faceDetected) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRotationTimeRef.current >= config.rotationInterval * 1000) {
        const activeFilters = FILTERS.filter(f => f.id !== 'none');
        const currentIndex = activeFilters.findIndex(f => f.id === selectedFilter);
        const nextIndex = (currentIndex + 1) % activeFilters.length;
        setSelectedFilter(activeFilters[nextIndex].id);
        lastRotationTimeRef.current = now;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [config.autoRotate, config.rotationInterval, selectedFilter, isDetecting, faceDetected]);

  // ─── Idle mode detection ─────────────────────────────────────────

  useEffect(() => {
    if (faceDetected) {
      lastFaceTimeRef.current = Date.now();
      setShowIdleMode(false);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    } else {
      idleTimeoutRef.current = setTimeout(() => {
        if ((Date.now() - lastFaceTimeRef.current) / 1000 >= config.idleTimeout) {
          setShowIdleMode(true);
        }
      }, config.idleTimeout * 1000);
    }
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [faceDetected, config.idleTimeout]);

  // ─── Fullscreen toggle ───────────────────────────────────────────

  useEffect(() => {
    if (config.fullscreen) {
      document.documentElement.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }, [config.fullscreen]);

  // ─── Initialize MediaPipe FaceLandmarker ─────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        setLoadingProgress('Loading AI models…');
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        setLoadingProgress('Configuring face detection…');
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        setFaceLandmarker(landmarker);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing FaceLandmarker:', err);
        setError('Failed to initialize face detection. Please refresh.');
        setIsLoading(false);
      }
    };

    init();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // ─── Initialize webcam ───────────────────────────────────────────

  useEffect(() => {
    if (isLoading || !faceLandmarker) return;

    const initWebcam = async () => {
      try {
        setLoadingProgress('Requesting camera access…');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.addEventListener('loadedmetadata', () => {
            if (videoRef.current && canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          });

          videoRef.current.addEventListener('canplay', async () => {
            if (videoRef.current) {
              try {
                await videoRef.current.play();
                setTimeout(() => setIsDetecting(true), 100);
              } catch (err) {
                console.error('Error playing video:', err);
              }
            }
          });
        }
      } catch {
        setError('Cannot access webcam. Please grant camera permissions and refresh.');
      }
    };

    initWebcam();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [isLoading, faceLandmarker]);

  // ─── Face detection & rendering loop ─────────────────────────────

  useEffect(() => {
    if (!isDetecting || !faceLandmarker || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastVideoTime = -1;

    const detect = () => {
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const currentTime = video.currentTime;
      if (currentTime !== lastVideoTime) {
        lastVideoTime = currentTime;

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw mirrored video
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply brightness
        if (config.brightness !== 100) {
          ctx.filter = `brightness(${config.brightness}%)`;
        }

        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.filter = 'none';

        // Detect faces
        try {
          const results = faceLandmarker.detectForVideo(video, Date.now());
          const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;
          setFaceDetected(hasFace);

          if (hasFace) {
            const flippedLandmarks = results.faceLandmarks[0].map(l => ({
              x: 1 - l.x,
              y: l.y,
              z: l.z,
            }));
            drawFilter(ctx, flippedLandmarks, canvas.width, canvas.height, selectedFilter, config.filterIntensity);
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isDetecting, faceLandmarker, selectedFilter, config.filterIntensity, config.brightness]);

  // ─── Photo capture ───────────────────────────────────────────────

  const capturePhoto = useCallback(() => {
    if (!canvasRef.current) return;

    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    const link = document.createElement('a');
    link.download = `face-filter-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }, []);

  // ─── Filter selection handler ────────────────────────────────────

  const handleFilterSelect = useCallback((id: string) => {
    setSelectedFilter(id);
    setConfig(prev => ({ ...prev, autoRotate: false }));
  }, []);

  // ─── Render ──────────────────────────────────────────────────────

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        <div className="text-center px-6">
          {/* Animated loader */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-violet-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border-t-2 border-violet-400"
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <p className="text-white text-lg font-medium mb-1">Loading Face Filters</p>
          <p className="text-violet-300/60 text-sm">{loadingProgress}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      {/* Hidden video element */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Main canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

      {/* Camera flash overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Idle Mode */}
      <AnimatePresence>
        {showIdleMode && <IdleMode />}
      </AnimatePresence>

      {/* ─── Top Bar ─── */}
      {config.showUI && !showIdleMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-20 safe-top"
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            {/* Face detection status */}
            <div className="glass rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-400 pulse-ring' : 'bg-white/30'}`} />
              <span className="text-xs sm:text-sm text-white/70 font-medium">
                {faceDetected ? 'Face Detected' : 'No Face'}
              </span>
            </div>

            {/* Auto-rotate badge */}
            {config.autoRotate && faceDetected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-3 h-3 text-violet-400" />
                </motion.div>
                <span className="text-xs text-white/60">Auto</span>
              </motion.div>
            )}

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="glass rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── Bottom Controls ─── */}
      {config.showUI && !showIdleMode && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 z-20 safe-bottom"
        >
          {/* Gradient fade background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          <div className="relative pb-4 sm:pb-6 pt-12">
            {/* Filter carousel */}
            <FilterCarousel
              filters={FILTERS}
              selectedFilter={selectedFilter}
              onSelect={handleFilterSelect}
            />

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-6 mt-4 px-4">
              {/* Capture button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={capturePhoto}
                disabled={!faceDetected}
                className={`
                  relative w-16 h-16 sm:w-18 sm:h-18 rounded-full
                  flex items-center justify-center
                  transition-all duration-200
                  ${faceDetected
                    ? 'bg-white hover:bg-white/90 shadow-lg shadow-white/20'
                    : 'bg-white/20 cursor-not-allowed'
                  }
                `}
                aria-label="Take photo"
              >
                {/* Outer ring */}
                <div className={`
                  absolute inset-0 rounded-full border-[3px]
                  ${faceDetected ? 'border-white/30' : 'border-white/10'}
                  scale-[1.15]
                `} />
                <Camera className={`w-6 h-6 sm:w-7 sm:h-7 ${faceDetected ? 'text-black' : 'text-white/40'}`} />
              </motion.button>

              {/* Download label */}
              <div className="absolute right-4 sm:right-6 bottom-5 sm:bottom-7">
                <button
                  onClick={capturePhoto}
                  disabled={!faceDetected}
                  className={`
                    glass rounded-full px-3 py-1.5 flex items-center gap-1.5
                    transition-colors text-xs
                    ${faceDetected ? 'text-white/70 hover:bg-white/10' : 'text-white/20 cursor-not-allowed'}
                  `}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings panel */}
      <ConfigPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        setConfig={setConfig}
      />

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 px-6"
          >
            <div className="glass rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
              <p className="text-white/60 text-sm mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
              >
                Reload Page
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
