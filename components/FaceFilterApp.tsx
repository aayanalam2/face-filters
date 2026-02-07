'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import ConfigPanel from './ConfigPanel';
import IdleMode from './IdleMode';

const FILTERS = [
  { id: 'none', name: 'No Filter', emoji: '🚫', category: 'none' },
  { id: 'glasses', name: 'Cool Glasses', emoji: '🕶️', category: 'accessories' },
  { id: 'hearts', name: 'Love Hearts', emoji: '❤️', category: 'cute' },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', category: 'accessories' },
  { id: 'mustache', name: 'Gentleman', emoji: '👨', category: 'funny' },
  { id: 'cat', name: 'Cat Face', emoji: '🐱', category: 'animals' },
  { id: 'dog', name: 'Puppy Dog', emoji: '🐶', category: 'animals' },
  { id: 'bunny', name: 'Bunny Ears', emoji: '🐰', category: 'cute' },
  { id: 'superhero', name: 'Superhero Mask', emoji: '🦸', category: 'character' },
  { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', category: 'character' },
  { id: 'party', name: 'Party Hat', emoji: '🎉', category: 'fun' },
  { id: 'alien', name: 'Alien', emoji: '👽', category: 'character' },
  { id: 'vampire', name: 'Vampire', emoji: '🧛', category: 'character' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'effects' },
  { id: 'stars', name: 'Starry Eyes', emoji: '✨', category: 'effects' },
];

interface AppConfig {
  autoRotate: boolean;
  rotationInterval: number; // seconds
  idleTimeout: number; // seconds
  showUI: boolean;
  fullscreen: boolean;
  brightness: number;
  filterIntensity: number;
}

export default function FaceFilterApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('glasses');
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showIdleMode, setShowIdleMode] = useState(false);
  const [fps, setFps] = useState(0);
  const [config, setConfig] = useState<AppConfig>({
    autoRotate: true,
    rotationInterval: 5,
    idleTimeout: 3,
    showUI: true,
    fullscreen: false,
    brightness: 100,
    filterIntensity: 100,
  });
  
  const animationFrameRef = useRef<number>();
  const lastFaceTimeRef = useRef<number>(Date.now());
  const lastRotationTimeRef = useRef<number>(Date.now());
  const fpsCounterRef = useRef<{ frames: number; lastTime: number }>({ frames: 0, lastTime: Date.now() });
  const idleTimeoutRef = useRef<NodeJS.Timeout>();

  // Automatic filter rotation
  useEffect(() => {
    if (!config.autoRotate || !isDetecting) return;

    const rotateFilter = () => {
      const now = Date.now();
      if (now - lastRotationTimeRef.current >= config.rotationInterval * 1000) {
        const currentIndex = FILTERS.findIndex(f => f.id === selectedFilter);
        const nextIndex = (currentIndex + 1) % FILTERS.length;
        setSelectedFilter(FILTERS[nextIndex].id);
        lastRotationTimeRef.current = now;
      }
    };

    const interval = setInterval(rotateFilter, 1000);
    return () => clearInterval(interval);
  }, [config.autoRotate, config.rotationInterval, selectedFilter, isDetecting]);

  // Idle mode detection
  useEffect(() => {
    if (faceDetected) {
      lastFaceTimeRef.current = Date.now();
      setShowIdleMode(false);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    } else {
      idleTimeoutRef.current = setTimeout(() => {
        const timeSinceLastFace = (Date.now() - lastFaceTimeRef.current) / 1000;
        if (timeSinceLastFace >= config.idleTimeout) {
          setShowIdleMode(true);
        }
      }, config.idleTimeout * 1000);
    }

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [faceDetected, config.idleTimeout]);

  // Fullscreen toggle
  useEffect(() => {
    if (config.fullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    }
  }, [config.fullscreen]);

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          runningMode: 'VIDEO',
          numFaces: 1
        });

        setFaceLandmarker(landmarker);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing FaceLandmarker:', err);
        setError('Failed to initialize face detection. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializeFaceLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize webcam
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          const onLoadedMetadata = () => {
            if (videoRef.current && canvasRef.current) {
              // Set canvas size to match video
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          };

          const onCanPlay = async () => {
            if (videoRef.current) {
              try {
                await videoRef.current.play();
                // Wait a bit for the first frame
                setTimeout(() => {
                  setIsDetecting(true);
                }, 100);
              } catch (err) {
                console.error('Error playing video:', err);
              }
            }
          };

          videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
          videoRef.current.addEventListener('canplay', onCanPlay);
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Cannot access webcam. Please grant camera permissions and refresh.');
      }
    };

    if (!isLoading && faceLandmarker) {
      initWebcam();
    }

    return () => {
      // Cleanup webcam stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLoading, faceLandmarker]);

  // Face detection and rendering loop
  useEffect(() => {
    if (!isDetecting || !faceLandmarker || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let lastVideoTime = -1;

    const detectFace = async () => {
      if (!video || !canvas || !ctx) return;

      // Check if video is ready and has dimensions
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameRef.current = requestAnimationFrame(detectFace);
        return;
      }

      const currentTime = video.currentTime;
      
      // Only process new frames
      if (currentTime !== lastVideoTime) {
        lastVideoTime = currentTime;

        // Set canvas size to match video (if not already set)
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw video frame to canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        // Flip horizontally for mirror effect
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // Detect faces
        try {
          const results = await faceLandmarker.detectForVideo(video, Date.now());
          
          const hasFace = results.faceLandmarks && results.faceLandmarks.length > 0;
          setFaceDetected(hasFace);
          
          if (hasFace) {
            // Flip landmarks for mirror effect
            const flippedLandmarks = results.faceLandmarks[0].map(landmark => ({
              x: 1 - landmark.x,
              y: landmark.y,
              z: landmark.z
            }));
            drawFilter(ctx, flippedLandmarks, canvas.width, canvas.height);
          }
        } catch (err) {
          console.error('Detection error:', err);
        }

        // FPS counter
        fpsCounterRef.current.frames++;
        const now = Date.now();
        if (now - fpsCounterRef.current.lastTime >= 1000) {
          setFps(fpsCounterRef.current.frames);
          fpsCounterRef.current.frames = 0;
          fpsCounterRef.current.lastTime = now;
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, faceLandmarker, selectedFilter]);

  // Draw filters based on facial landmarks
  const drawFilter = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number
  ) => {
    if (selectedFilter === 'none') return;

    // Convert normalized coordinates to pixel coordinates
    const getPixelCoords = (landmark: any) => ({
      x: landmark.x * width,
      y: landmark.y * height
    });

    // Apply brightness adjustment
    if (config.brightness !== 100) {
      ctx.filter = `brightness(${config.brightness}%)`;
    }

    // Apply filter intensity via opacity
    ctx.globalAlpha = config.filterIntensity / 100;

    ctx.save();

    switch (selectedFilter) {
      case 'glasses': {
        // Draw glasses using eye landmarks
        const leftEye = getPixelCoords(landmarks[33]); // Left eye outer corner
        const rightEye = getPixelCoords(landmarks[263]); // Right eye outer corner
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        const glassesWidth = eyeDistance * 1.5;
        const glassesHeight = eyeDistance * 0.6;
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(50, 50, 50, 0.3)';

        // Left lens
        ctx.beginPath();
        ctx.ellipse(leftEye.x, leftEye.y, glassesWidth / 3, glassesHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right lens
        ctx.beginPath();
        ctx.ellipse(rightEye.x, rightEye.y, glassesWidth / 3, glassesHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bridge
        ctx.beginPath();
        ctx.moveTo(leftEye.x + glassesWidth / 3, leftEye.y);
        ctx.lineTo(rightEye.x - glassesWidth / 3, rightEye.y);
        ctx.stroke();
        break;
      }

      case 'hearts': {
        // Draw hearts above the head
        const forehead = getPixelCoords(landmarks[10]);
        const heartSize = 30;

        for (let i = 0; i < 3; i++) {
          const x = forehead.x - 60 + i * 60;
          const y = forehead.y - 40;
          
          ctx.fillStyle = '#ff69b4';
          ctx.beginPath();
          ctx.moveTo(x, y + heartSize / 4);
          ctx.bezierCurveTo(x, y, x - heartSize / 2, y - heartSize / 2, x - heartSize / 2, y + heartSize / 4);
          ctx.bezierCurveTo(x - heartSize / 2, y + heartSize / 2, x, y + heartSize * 0.75, x, y + heartSize);
          ctx.bezierCurveTo(x, y + heartSize * 0.75, x + heartSize / 2, y + heartSize / 2, x + heartSize / 2, y + heartSize / 4);
          ctx.bezierCurveTo(x + heartSize / 2, y - heartSize / 2, x, y, x, y + heartSize / 4);
          ctx.fill();
        }
        break;
      }

      case 'crown': {
        // Draw crown on top of head
        const forehead = getPixelCoords(landmarks[10]);
        const leftTemple = getPixelCoords(landmarks[54]);
        const rightTemple = getPixelCoords(landmarks[284]);
        const crownWidth = Math.abs(rightTemple.x - leftTemple.x) * 0.8;
        const crownHeight = 60;
        const centerX = forehead.x;
        const y = forehead.y - 50;

        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;

        // Crown base
        ctx.beginPath();
        ctx.moveTo(centerX - crownWidth / 2, y + crownHeight);
        ctx.lineTo(centerX - crownWidth / 3, y + crownHeight / 3);
        ctx.lineTo(centerX - crownWidth / 6, y + crownHeight / 2);
        ctx.lineTo(centerX, y);
        ctx.lineTo(centerX + crownWidth / 6, y + crownHeight / 2);
        ctx.lineTo(centerX + crownWidth / 3, y + crownHeight / 3);
        ctx.lineTo(centerX + crownWidth / 2, y + crownHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crown jewels
        ctx.fillStyle = '#FF0000';
        const jewelPositions = [-crownWidth / 3, 0, crownWidth / 3];
        jewelPositions.forEach(offset => {
          ctx.beginPath();
          ctx.arc(centerX + offset, y + crownHeight / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'mustache': {
        // Draw mustache using nose and mouth landmarks
        const noseBottom = getPixelCoords(landmarks[2]);
        const leftMouth = getPixelCoords(landmarks[61]);
        const rightMouth = getPixelCoords(landmarks[291]);
        const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
        const mustacheWidth = mouthWidth * 1.3;
        const mustacheHeight = 20;
        const y = noseBottom.y + 10;
        const centerX = noseBottom.x;

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        // Left side
        ctx.ellipse(
          centerX - mustacheWidth / 4,
          y,
          mustacheWidth / 3,
          mustacheHeight,
          -0.3,
          0,
          Math.PI * 2
        );
        // Right side
        ctx.ellipse(
          centerX + mustacheWidth / 4,
          y,
          mustacheWidth / 3,
          mustacheHeight,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
        break;
      }

      case 'cat': {
        // Cat ears and whiskers
        const leftEye = getPixelCoords(landmarks[33]);
        const rightEye = getPixelCoords(landmarks[263]);
        const nose = getPixelCoords(landmarks[1]);
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        
        // Cat ears
        const earSize = eyeDistance * 0.6;
        const forehead = getPixelCoords(landmarks[10]);
        
        ctx.fillStyle = '#FFB6C1';
        [-1, 1].forEach(side => {
          const earX = forehead.x + side * eyeDistance * 0.8;
          const earY = forehead.y - earSize * 0.8;
          
          // Outer ear
          ctx.beginPath();
          ctx.moveTo(earX, earY);
          ctx.lineTo(earX - side * earSize * 0.5, earY - earSize);
          ctx.lineTo(earX + side * earSize * 0.3, earY - earSize * 0.5);
          ctx.closePath();
          ctx.fillStyle = '#FFB6C1';
          ctx.fill();
          ctx.strokeStyle = '#FF69B4';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Inner ear
          ctx.beginPath();
          ctx.moveTo(earX, earY - earSize * 0.2);
          ctx.lineTo(earX - side * earSize * 0.3, earY - earSize * 0.7);
          ctx.lineTo(earX + side * earSize * 0.2, earY - earSize * 0.4);
          ctx.closePath();
          ctx.fillStyle = '#FF69B4';
          ctx.fill();
        });
        
        // Whiskers
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        [-1, 1].forEach(side => {
          for (let i = 0; i < 3; i++) {
            const startY = nose.y - 20 + i * 15;
            ctx.beginPath();
            ctx.moveTo(nose.x, startY);
            ctx.lineTo(nose.x + side * eyeDistance, startY - 10 + i * 5);
            ctx.stroke();
          }
        });
        
        // Pink nose
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(nose.x, nose.y);
        ctx.lineTo(nose.x - 10, nose.y - 8);
        ctx.lineTo(nose.x + 10, nose.y - 8);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'dog': {
        // Floppy dog ears and tongue
        const leftEye = getPixelCoords(landmarks[33]);
        const rightEye = getPixelCoords(landmarks[263]);
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        const forehead = getPixelCoords(landmarks[10]);
        
        // Floppy ears
        ctx.fillStyle = '#8B4513';
        [-1, 1].forEach(side => {
          const earX = forehead.x + side * eyeDistance * 1.2;
          const earY = forehead.y + 20;
          
          ctx.beginPath();
          ctx.ellipse(earX, earY, eyeDistance * 0.4, eyeDistance * 0.8, side * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 3;
          ctx.stroke();
        });
        
        // Tongue
        const mouth = getPixelCoords(landmarks[13]);
        ctx.fillStyle = '#FF6B9D';
        ctx.beginPath();
        ctx.ellipse(mouth.x, mouth.y + 30, 20, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Nose
        const nose = getPixelCoords(landmarks[1]);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(nose.x, nose.y, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'bunny': {
        // Bunny ears
        const forehead = getPixelCoords(landmarks[10]);
        const leftEye = getPixelCoords(landmarks[33]);
        const rightEye = getPixelCoords(landmarks[263]);
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFB6C1';
        ctx.lineWidth = 3;
        
        [-1, 1].forEach(side => {
          const earX = forehead.x + side * eyeDistance * 0.5;
          const earY = forehead.y - 40;
          
          // Outer ear
          ctx.beginPath();
          ctx.ellipse(earX, earY - 50, 25, 70, side * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Inner ear (pink)
          ctx.fillStyle = '#FFB6C1';
          ctx.beginPath();
          ctx.ellipse(earX, earY - 50, 15, 50, side * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
        });
        
        // Bunny nose
        const nose = getPixelCoords(landmarks[1]);
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(nose.x, nose.y, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'superhero': {
        // Superhero mask
        const leftEye = getPixelCoords(landmarks[33]);
        const rightEye = getPixelCoords(landmarks[263]);
        const nose = getPixelCoords(landmarks[1]);
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;
        
        // Gradient mask
        const gradient = ctx.createLinearGradient(centerX - eyeDistance, centerY, centerX + eyeDistance, centerY);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.5, '#8B0000');
        gradient.addColorStop(1, '#FF0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Left eye opening
        ctx.ellipse(leftEye.x, leftEye.y, eyeDistance * 0.25, eyeDistance * 0.2, 0, 0, Math.PI * 2);
        ctx.rect(leftEye.x + eyeDistance * 0.25, leftEye.y - eyeDistance * 0.25, eyeDistance * 0.75, eyeDistance * 0.5);
        // Right eye opening
        ctx.ellipse(rightEye.x, rightEye.y, eyeDistance * 0.25, eyeDistance * 0.2, 0, 0, Math.PI * 2);
        ctx.rect(rightEye.x - eyeDistance * 1, rightEye.y - eyeDistance * 0.25, eyeDistance * 0.75, eyeDistance * 0.5);
        
        // Mask shape
        ctx.moveTo(leftEye.x - eyeDistance * 0.8, centerY);
        ctx.quadraticCurveTo(centerX, centerY - eyeDistance * 0.5, rightEye.x + eyeDistance * 0.8, centerY);
        ctx.lineTo(rightEye.x + eyeDistance * 0.5, nose.y);
        ctx.quadraticCurveTo(centerX, nose.y - 10, leftEye.x - eyeDistance * 0.5, nose.y);
        ctx.closePath();
        ctx.fill();
        
        // Gold outline
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
        break;
      }

      case 'pirate': {
        // Eye patch and bandana
        const leftEye = getPixelCoords(landmarks[33]);
        const rightEye = getPixelCoords(landmarks[263]);
        const forehead = getPixelCoords(landmarks[10]);
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        
        // Bandana
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.ellipse(forehead.x, forehead.y - 30, eyeDistance * 1.2, eyeDistance * 0.4, 0, 0, Math.PI);
        ctx.fill();
        
        // Bandana pattern
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(forehead.x - eyeDistance + i * eyeDistance * 0.5, forehead.y - 30, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Eye patch
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(rightEye.x, rightEye.y, eyeDistance * 0.35, eyeDistance * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // String
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rightEye.x - eyeDistance * 0.35, rightEye.y);
        ctx.lineTo(forehead.x - eyeDistance * 1.2, forehead.y);
        ctx.stroke();
        break;
      }

      case 'party': {
        // Party hat
        const forehead = getPixelCoords(landmarks[10]);
        const leftTemple = getPixelCoords(landmarks[54]);
        const rightTemple = getPixelCoords(landmarks[284]);
        const width_hat = Math.abs(rightTemple.x - leftTemple.x) * 0.7;
        
        // Gradient for hat
        const gradient = ctx.createLinearGradient(forehead.x, forehead.y - 100, forehead.x, forehead.y);
        gradient.addColorStop(0, '#FF1493');
        gradient.addColorStop(0.5, '#FF69B4');
        gradient.addColorStop(1, '#FFB6C1');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(forehead.x, forehead.y - 120);
        ctx.lineTo(forehead.x - width_hat / 2, forehead.y - 10);
        ctx.lineTo(forehead.x + width_hat / 2, forehead.y - 10);
        ctx.closePath();
        ctx.fill();
        
        // Stripes
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
          const y = forehead.y - 100 + i * 30;
          const w = width_hat * (1 - i * 0.25);
          ctx.beginPath();
          ctx.moveTo(forehead.x - w / 2, y);
          ctx.lineTo(forehead.x + w / 2, y);
          ctx.stroke();
        }
        
        // Pom-pom
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(forehead.x, forehead.y - 125, 12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'alien': {
        // Alien antennae and big eyes
        const leftEye = getPixelCoords(landmarks[33]);
        const rightEye = getPixelCoords(landmarks[263]);
        const forehead = getPixelCoords(landmarks[10]);
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        
        // Green tint
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.beginPath();
        const faceWidth = eyeDistance * 2;
        ctx.ellipse(forehead.x, forehead.y + 50, faceWidth, faceWidth * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Antennae
        [-1, 1].forEach(side => {
          const antennaX = forehead.x + side * eyeDistance * 0.8;
          
          // Stalk
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(antennaX, forehead.y - 10);
          ctx.lineTo(antennaX + side * 20, forehead.y - 80);
          ctx.stroke();
          
          // Ball
          ctx.fillStyle = '#00FF00';
          ctx.beginPath();
          ctx.arc(antennaX + side * 20, forehead.y - 85, 12, 0, Math.PI * 2);
          ctx.fill();
          
          // Glow
          const gradient = ctx.createRadialGradient(antennaX + side * 20, forehead.y - 85, 0, antennaX + side * 20, forehead.y - 85, 20);
          gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
          gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(antennaX + side * 20, forehead.y - 85, 20, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Big alien eyes
        [leftEye, rightEye].forEach(eye => {
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.ellipse(eye.x, eye.y, eyeDistance * 0.4, eyeDistance * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Reflection
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(eye.x - 10, eye.y - 15, 8, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'vampire': {
        // Vampire fangs and pale skin
        const mouth = getPixelCoords(landmarks[13]);
        const leftMouth = getPixelCoords(landmarks[61]);
        const rightMouth = getPixelCoords(landmarks[291]);
        
        // Pale skin overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        const nose = getPixelCoords(landmarks[1]);
        const forehead = getPixelCoords(landmarks[10]);
        const eyeDistance = Math.abs(getPixelCoords(landmarks[33]).x - getPixelCoords(landmarks[263]).x);
        ctx.beginPath();
        ctx.ellipse(forehead.x, forehead.y + 80, eyeDistance * 1.3, eyeDistance * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Fangs
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        
        // Left fang
        ctx.beginPath();
        ctx.moveTo(leftMouth.x + 15, mouth.y + 10);
        ctx.lineTo(leftMouth.x + 10, mouth.y + 30);
        ctx.lineTo(leftMouth.x + 20, mouth.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Right fang
        ctx.beginPath();
        ctx.moveTo(rightMouth.x - 15, mouth.y + 10);
        ctx.lineTo(rightMouth.x - 10, mouth.y + 30);
        ctx.lineTo(rightMouth.x - 20, mouth.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Red lips
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(leftMouth.x, leftMouth.y);
        ctx.quadraticCurveTo(mouth.x, mouth.y + 10, rightMouth.x, rightMouth.y);
        ctx.stroke();
        break;
      }

      case 'rainbow': {
        // Rainbow arc over head
        const forehead = getPixelCoords(landmarks[10]);
        const leftTemple = getPixelCoords(landmarks[54]);
        const rightTemple = getPixelCoords(landmarks[284]);
        const width_rainbow = Math.abs(rightTemple.x - leftTemple.x) * 1.2;
        
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        const arcHeight = width_rainbow * 0.6;
        
        colors.forEach((color, i) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(
            forehead.x,
            forehead.y,
            width_rainbow / 2 - i * 10,
            Math.PI,
            0,
            false
          );
          ctx.stroke();
        });
        break;
      }

      case 'stars': {
        // Starry eyes effect
        const leftEye = getPixelCoords(landmarks[33]);
        const rightEye = getPixelCoords(landmarks[263]);
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        
        // Draw stars around eyes
        [leftEye, rightEye].forEach(eye => {
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6 + Date.now() / 1000;
            const distance = eyeDistance * 0.5;
            const starX = eye.x + Math.cos(angle) * distance;
            const starY = eye.y + Math.sin(angle) * distance;
            const size = 8 + Math.sin(Date.now() / 500 + i) * 3;
            
            // Star shape
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
              const angle2 = (j * Math.PI * 2) / 5 - Math.PI / 2;
              const radius = j % 2 === 0 ? size : size / 2;
              const x = starX + Math.cos(angle2) * radius;
              const y = starY + Math.sin(angle2) * radius;
              if (j === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Glow
            const gradient = ctx.createRadialGradient(starX, starY, 0, starX, starY, size * 2);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(starX, starY, size * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        break;
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
  };

  const capturePhoto = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `face-filter-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-full mx-auto h-screen flex flex-col bg-black">
      {isLoading && (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-white mx-auto mb-6"></div>
            <p className="text-white text-2xl font-bold">Loading Face Detection...</p>
            <p className="text-gray-300 mt-2">Initializing AI models</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Main Display Area */}
          <div className="relative flex-1 bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover hidden"
            />
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
            
            {/* Idle Mode Overlay */}
            {showIdleMode && <IdleMode />}

            {/* Status Indicators (top-left) */}
            {config.showUI && (
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span>{faceDetected ? 'Face Detected' : 'No Face'}</span>
                  </div>
                </div>
                <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-mono text-sm">
                  FPS: {fps}
                </div>
                <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-mono text-sm">
                  Filter: {FILTERS.find(f => f.id === selectedFilter)?.name}
                </div>
              </div>
            )}

            {/* Current Filter Display (top-center) */}
            {config.showUI && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg">
                  <span className="mr-2">{FILTERS.find(f => f.id === selectedFilter)?.emoji}</span>
                  {FILTERS.find(f => f.id === selectedFilter)?.name}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Panel */}
          {config.showUI && (
            <ConfigPanel 
              config={config} 
              setConfig={setConfig}
              filters={FILTERS}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
            />
          )}
        </>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="bg-red-900/80 border border-red-500 rounded-lg p-8 max-w-lg text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-white mb-2">System Error</h2>
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Reload System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
