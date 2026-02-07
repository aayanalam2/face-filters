// ─── Filter Definitions ───────────────────────────────────────────────

export interface FilterDef {
  id: string;
  name: string;
  emoji: string;
  category: 'none' | 'accessories' | 'cute' | 'funny' | 'animals' | 'character' | 'effects';
}

export const FILTERS: FilterDef[] = [
  { id: 'none', name: 'No Filter', emoji: '🚫', category: 'none' },
  { id: 'glasses', name: 'Cool Shades', emoji: '🕶️', category: 'accessories' },
  { id: 'hearts', name: 'Love Hearts', emoji: '❤️', category: 'cute' },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', category: 'accessories' },
  { id: 'mustache', name: 'Gentleman', emoji: '🥸', category: 'funny' },
  { id: 'cat', name: 'Cat Face', emoji: '🐱', category: 'animals' },
  { id: 'dog', name: 'Puppy Dog', emoji: '🐶', category: 'animals' },
  { id: 'bunny', name: 'Bunny Ears', emoji: '🐰', category: 'cute' },
  { id: 'superhero', name: 'Hero Mask', emoji: '🦸', category: 'character' },
  { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', category: 'character' },
  { id: 'party', name: 'Party Hat', emoji: '🎉', category: 'funny' },
  { id: 'alien', name: 'Alien', emoji: '👽', category: 'character' },
  { id: 'vampire', name: 'Vampire', emoji: '🧛', category: 'character' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'effects' },
  { id: 'stars', name: 'Star Eyes', emoji: '✨', category: 'effects' },
];

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'cute', label: 'Cute' },
  { id: 'funny', label: 'Funny' },
  { id: 'animals', label: 'Animals' },
  { id: 'character', label: 'Characters' },
  { id: 'effects', label: 'Effects' },
];

// ─── High-Quality Filter Renderer ────────────────────────────────────

interface Point { x: number; y: number; z: number; }

const px = (landmark: Point, w: number, h: number) => ({
  x: landmark.x * w,
  y: landmark.y * h,
});

/** Draw a smooth heart shape */
function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, glow = true) {
  ctx.save();
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.6;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  const topY = cy - size * 0.4;
  ctx.moveTo(cx, cy + size * 0.55);
  ctx.bezierCurveTo(cx - size * 0.65, cy + size * 0.1, cx - size * 0.65, topY - size * 0.15, cx - size * 0.325, topY - size * 0.15);
  ctx.bezierCurveTo(cx - size * 0.1, topY - size * 0.15, cx, topY + size * 0.05, cx, topY + size * 0.2);
  ctx.bezierCurveTo(cx, topY + size * 0.05, cx + size * 0.1, topY - size * 0.15, cx + size * 0.325, topY - size * 0.15);
  ctx.bezierCurveTo(cx + size * 0.65, topY - size * 0.15, cx + size * 0.65, cy + size * 0.1, cx, cy + size * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Draw a 5-point star */
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, color: string, rotation = 0) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = outerR * 0.8;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 5 - Math.PI / 2 + rotation;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Rounded rect helper */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawFilter(
  ctx: CanvasRenderingContext2D,
  landmarks: Point[],
  width: number,
  height: number,
  filterId: string,
  intensity: number
) {
  if (filterId === 'none') return;

  const p = (i: number) => px(landmarks[i], width, height);

  ctx.save();
  ctx.globalAlpha = intensity / 100;

  switch (filterId) {
    // ─── COOL SHADES ──────────────────────────────────────────────
    case 'glasses': {
      const le = p(33);
      const re = p(263);
      const leInner = p(133);
      const reInner = p(362);
      const noseBridge = p(6);
      const eyeDist = Math.abs(re.x - le.x);
      const angle = Math.atan2(re.y - le.y, re.x - le.x);
      const cx = (le.x + re.x) / 2;
      const cy = (le.y + re.y) / 2;
      const lensW = eyeDist * 0.38;
      const lensH = eyeDist * 0.28;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      // Frame
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = Math.max(3, eyeDist * 0.03);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Left lens
      const leftCx = -(eyeDist * 0.26);
      const rightCx = eyeDist * 0.26;

      // Lens gradient
      const lGrad = ctx.createLinearGradient(leftCx - lensW, -lensH, leftCx + lensW, lensH);
      lGrad.addColorStop(0, 'rgba(20, 20, 40, 0.7)');
      lGrad.addColorStop(0.4, 'rgba(40, 30, 80, 0.55)');
      lGrad.addColorStop(1, 'rgba(20, 20, 40, 0.75)');

      const rGrad = ctx.createLinearGradient(rightCx - lensW, -lensH, rightCx + lensW, lensH);
      rGrad.addColorStop(0, 'rgba(20, 20, 40, 0.75)');
      rGrad.addColorStop(0.6, 'rgba(40, 30, 80, 0.55)');
      rGrad.addColorStop(1, 'rgba(20, 20, 40, 0.7)');

      // Draw lenses
      [{ cx: leftCx, grad: lGrad }, { cx: rightCx, grad: rGrad }].forEach(({ cx: lcx, grad }) => {
        roundRect(ctx, lcx - lensW, -lensH, lensW * 2, lensH * 2, lensH * 0.35);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = Math.max(4, eyeDist * 0.035);
        ctx.stroke();

        // Lens reflection
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(lcx - lensW * 0.25, -lensH * 0.4, lensW * 0.45, lensH * 0.25, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Bridge
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = Math.max(3, eyeDist * 0.03);
      ctx.beginPath();
      ctx.moveTo(leftCx + lensW, 0);
      ctx.quadraticCurveTo(0, -lensH * 0.3, rightCx - lensW, 0);
      ctx.stroke();

      // Temple arms
      ctx.lineWidth = Math.max(3, eyeDist * 0.025);
      ctx.beginPath();
      ctx.moveTo(leftCx - lensW, -lensH * 0.1);
      ctx.lineTo(leftCx - lensW - eyeDist * 0.3, lensH * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightCx + lensW, -lensH * 0.1);
      ctx.lineTo(rightCx + lensW + eyeDist * 0.3, lensH * 0.2);
      ctx.stroke();

      ctx.restore(); // shadow
      ctx.restore(); // translate
      break;
    }

    // ─── LOVE HEARTS ──────────────────────────────────────────────
    case 'hearts': {
      const forehead = p(10);
      const le = p(33);
      const re = p(263);
      const eyeDist = Math.abs(re.x - le.x);
      const t = Date.now() / 1000;

      // Floating hearts above the head
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2 + t * 0.5;
        const radiusX = eyeDist * (0.6 + Math.sin(t + i) * 0.15);
        const radiusY = eyeDist * 0.35;
        const hx = forehead.x + Math.cos(angle) * radiusX;
        const hy = forehead.y - eyeDist * 0.5 + Math.sin(angle) * radiusY - Math.sin(t * 1.5 + i) * 8;
        const size = eyeDist * (0.12 + Math.sin(t * 2 + i * 1.3) * 0.03);
        const colors = ['#ff3b7f', '#ff6b9d', '#ff1493', '#ff69b4', '#e91e63', '#f06292', '#ff4081'];
        drawHeart(ctx, hx, hy, size, colors[i % colors.length]);
      }

      // Cheek blush
      const leftCheek = p(50);
      const rightCheek = p(280);
      [leftCheek, rightCheek].forEach(cheek => {
        const blushGrad = ctx.createRadialGradient(cheek.x, cheek.y, 0, cheek.x, cheek.y, eyeDist * 0.25);
        blushGrad.addColorStop(0, 'rgba(255, 105, 180, 0.25)');
        blushGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
        ctx.fillStyle = blushGrad;
        ctx.beginPath();
        ctx.arc(cheek.x, cheek.y, eyeDist * 0.25, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // ─── ROYAL CROWN ──────────────────────────────────────────────
    case 'crown': {
      const forehead = p(10);
      const le = p(54);
      const re = p(284);
      const crownW = Math.abs(re.x - le.x) * 1.0;
      const crownH = crownW * 0.55;
      const cx = forehead.x;
      const baseY = forehead.y - crownH * 0.15;
      const topY = baseY - crownH;

      ctx.save();
      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.shadowBlur = 20;

      // Crown body gradient
      const grad = ctx.createLinearGradient(cx, topY, cx, baseY);
      grad.addColorStop(0, '#FFD700');
      grad.addColorStop(0.3, '#FFC107');
      grad.addColorStop(0.7, '#FFB300');
      grad.addColorStop(1, '#FF8F00');

      ctx.fillStyle = grad;
      ctx.beginPath();
      const hw = crownW / 2;
      ctx.moveTo(cx - hw, baseY);
      ctx.lineTo(cx - hw * 0.9, topY + crownH * 0.45);
      ctx.lineTo(cx - hw * 0.55, topY + crownH * 0.6);
      ctx.lineTo(cx - hw * 0.35, topY + crownH * 0.15);
      ctx.lineTo(cx, topY);
      ctx.lineTo(cx + hw * 0.35, topY + crownH * 0.15);
      ctx.lineTo(cx + hw * 0.55, topY + crownH * 0.6);
      ctx.lineTo(cx + hw * 0.9, topY + crownH * 0.45);
      ctx.lineTo(cx + hw, baseY);
      ctx.closePath();
      ctx.fill();

      // Gold outline
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Crown band
      const bandGrad = ctx.createLinearGradient(cx - hw, baseY - crownH * 0.15, cx + hw, baseY);
      bandGrad.addColorStop(0, '#B8860B');
      bandGrad.addColorStop(0.5, '#DAA520');
      bandGrad.addColorStop(1, '#B8860B');
      ctx.fillStyle = bandGrad;
      ctx.fillRect(cx - hw, baseY - crownH * 0.12, crownW, crownH * 0.12);

      // Jewels
      const jewelPositions = [
        { x: cx, y: topY + crownH * 0.35, color: '#E53935', size: crownH * 0.07 },
        { x: cx - hw * 0.5, y: topY + crownH * 0.5, color: '#1E88E5', size: crownH * 0.055 },
        { x: cx + hw * 0.5, y: topY + crownH * 0.5, color: '#1E88E5', size: crownH * 0.055 },
        { x: cx - hw * 0.25, y: baseY - crownH * 0.06, color: '#43A047', size: crownH * 0.04 },
        { x: cx + hw * 0.25, y: baseY - crownH * 0.06, color: '#43A047', size: crownH * 0.04 },
        { x: cx, y: baseY - crownH * 0.06, color: '#E53935', size: crownH * 0.045 },
      ];

      jewelPositions.forEach(({ x, y, color, size }) => {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
      break;
    }

    // ─── GENTLEMAN MUSTACHE ───────────────────────────────────────
    case 'mustache': {
      const noseBottom = p(2);
      const leftMouth = p(61);
      const rightMouth = p(291);
      const upperLip = p(0);
      const mouthW = Math.abs(rightMouth.x - leftMouth.x);
      const mustW = mouthW * 0.7;
      const mustH = mouthW * 0.18;
      const cy = noseBottom.y + (upperLip.y - noseBottom.y) * 0.55;
      const cx = noseBottom.x;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;

      // Handlebar mustache
      const mGrad = ctx.createLinearGradient(cx - mustW, cy, cx + mustW, cy);
      mGrad.addColorStop(0, '#1a0a00');
      mGrad.addColorStop(0.3, '#3d1f00');
      mGrad.addColorStop(0.5, '#4a2600');
      mGrad.addColorStop(0.7, '#3d1f00');
      mGrad.addColorStop(1, '#1a0a00');

      ctx.fillStyle = mGrad;

      // Left side
      ctx.beginPath();
      ctx.moveTo(cx, cy - mustH * 0.3);
      ctx.bezierCurveTo(
        cx - mustW * 0.3, cy - mustH * 0.8,
        cx - mustW * 0.8, cy - mustH * 0.6,
        cx - mustW, cy + mustH * 0.2
      );
      ctx.bezierCurveTo(
        cx - mustW * 1.05, cy + mustH * 0.8,
        cx - mustW * 0.7, cy + mustH * 1.1,
        cx - mustW * 0.5, cy + mustH * 0.5
      );
      ctx.bezierCurveTo(
        cx - mustW * 0.3, cy + mustH * 0.1,
        cx - mustW * 0.1, cy + mustH * 0.4,
        cx, cy + mustH * 0.2
      );
      ctx.closePath();
      ctx.fill();

      // Right side (mirror)
      ctx.beginPath();
      ctx.moveTo(cx, cy - mustH * 0.3);
      ctx.bezierCurveTo(
        cx + mustW * 0.3, cy - mustH * 0.8,
        cx + mustW * 0.8, cy - mustH * 0.6,
        cx + mustW, cy + mustH * 0.2
      );
      ctx.bezierCurveTo(
        cx + mustW * 1.05, cy + mustH * 0.8,
        cx + mustW * 0.7, cy + mustH * 1.1,
        cx + mustW * 0.5, cy + mustH * 0.5
      );
      ctx.bezierCurveTo(
        cx + mustW * 0.3, cy + mustH * 0.1,
        cx + mustW * 0.1, cy + mustH * 0.4,
        cx, cy + mustH * 0.2
      );
      ctx.closePath();
      ctx.fill();

      // Optional: monocle
      const reOuter = p(263);
      const reTop = p(257);
      const reBottom = p(374);
      const monocleR = Math.abs(reBottom.y - reTop.y) * 0.65;
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = Math.max(2.5, monocleR * 0.08);
      ctx.beginPath();
      ctx.arc(reOuter.x, (reTop.y + reBottom.y) / 2, monocleR, 0, Math.PI * 2);
      ctx.stroke();

      // Chain
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = Math.max(1.5, monocleR * 0.04);
      ctx.beginPath();
      ctx.moveTo(reOuter.x, (reTop.y + reBottom.y) / 2 + monocleR);
      ctx.quadraticCurveTo(reOuter.x + monocleR, cy + mustH * 3, reOuter.x + monocleR * 2, cy + mustH * 5);
      ctx.stroke();

      // Lens glare
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(reOuter.x - monocleR * 0.2, (reTop.y + reBottom.y) / 2 - monocleR * 0.15, monocleR * 0.4, monocleR * 0.2, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
      break;
    }

    // ─── CAT FACE ─────────────────────────────────────────────────
    case 'cat': {
      const le = p(33);
      const re = p(263);
      const nose = p(1);
      const forehead = p(10);
      const eyeDist = Math.abs(re.x - le.x);
      const earSize = eyeDist * 0.55;

      // Cat ears
      [-1, 1].forEach(side => {
        const earX = forehead.x + side * eyeDist * 0.65;
        const earY = forehead.y - earSize * 0.3;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;

        // Outer ear
        const earGrad = ctx.createLinearGradient(earX, earY - earSize, earX, earY);
        earGrad.addColorStop(0, '#f5e6d3');
        earGrad.addColorStop(1, '#e8d5c0');
        ctx.fillStyle = earGrad;
        ctx.beginPath();
        ctx.moveTo(earX - side * earSize * 0.45, earY + earSize * 0.1);
        ctx.quadraticCurveTo(earX - side * earSize * 0.15, earY - earSize, earX + side * earSize * 0.05, earY - earSize * 0.85);
        ctx.quadraticCurveTo(earX + side * earSize * 0.5, earY - earSize * 0.3, earX + side * earSize * 0.35, earY + earSize * 0.1);
        ctx.closePath();
        ctx.fill();

        // Inner ear (pink)
        const innerGrad = ctx.createLinearGradient(earX, earY - earSize * 0.7, earX, earY);
        innerGrad.addColorStop(0, '#ffb3c6');
        innerGrad.addColorStop(1, '#ff8fab');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.moveTo(earX - side * earSize * 0.25, earY + earSize * 0.0);
        ctx.quadraticCurveTo(earX - side * earSize * 0.05, earY - earSize * 0.65, earX + side * earSize * 0.05, earY - earSize * 0.55);
        ctx.quadraticCurveTo(earX + side * earSize * 0.3, earY - earSize * 0.15, earX + side * earSize * 0.2, earY + earSize * 0.0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // Whiskers
      ctx.strokeStyle = 'rgba(100, 80, 60, 0.7)';
      ctx.lineWidth = Math.max(1.5, eyeDist * 0.012);
      ctx.lineCap = 'round';
      [-1, 1].forEach(side => {
        for (let i = 0; i < 3; i++) {
          const startY = nose.y + 5 + i * eyeDist * 0.08;
          const endX = nose.x + side * eyeDist * 0.9;
          const endY = startY + (i - 1) * eyeDist * 0.06;
          ctx.beginPath();
          ctx.moveTo(nose.x + side * eyeDist * 0.12, startY);
          ctx.quadraticCurveTo(nose.x + side * eyeDist * 0.5, (startY + endY) / 2 - 3, endX, endY);
          ctx.stroke();
        }
      });

      // Nose
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 4;
      const noseGrad = ctx.createRadialGradient(nose.x, nose.y - 2, 0, nose.x, nose.y, eyeDist * 0.08);
      noseGrad.addColorStop(0, '#ff8fab');
      noseGrad.addColorStop(1, '#e75480');
      ctx.fillStyle = noseGrad;
      ctx.beginPath();
      const noseSize = eyeDist * 0.07;
      ctx.moveTo(nose.x, nose.y + noseSize * 0.3);
      ctx.lineTo(nose.x - noseSize, nose.y - noseSize * 0.5);
      ctx.quadraticCurveTo(nose.x, nose.y - noseSize, nose.x + noseSize, nose.y - noseSize * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    // ─── PUPPY DOG ────────────────────────────────────────────────
    case 'dog': {
      const le = p(33);
      const re = p(263);
      const nose = p(1);
      const mouth = p(13);
      const forehead = p(10);
      const eyeDist = Math.abs(re.x - le.x);

      // Floppy ears
      [-1, 1].forEach(side => {
        const earX = forehead.x + side * eyeDist * 0.95;
        const earY = forehead.y + eyeDist * 0.15;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;

        const earGrad = ctx.createLinearGradient(earX, earY - eyeDist * 0.2, earX, earY + eyeDist * 0.7);
        earGrad.addColorStop(0, '#a0704a');
        earGrad.addColorStop(0.5, '#8b5e3c');
        earGrad.addColorStop(1, '#6d4528');
        ctx.fillStyle = earGrad;

        ctx.beginPath();
        ctx.moveTo(earX - side * eyeDist * 0.15, earY - eyeDist * 0.15);
        ctx.bezierCurveTo(
          earX + side * eyeDist * 0.15, earY - eyeDist * 0.1,
          earX + side * eyeDist * 0.3, earY + eyeDist * 0.3,
          earX + side * eyeDist * 0.12, earY + eyeDist * 0.65
        );
        ctx.bezierCurveTo(
          earX, earY + eyeDist * 0.72,
          earX - side * eyeDist * 0.2, earY + eyeDist * 0.55,
          earX - side * eyeDist * 0.3, earY + eyeDist * 0.2
        );
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // Tongue
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 5;
      const tongueGrad = ctx.createLinearGradient(mouth.x, mouth.y, mouth.x, mouth.y + eyeDist * 0.35);
      tongueGrad.addColorStop(0, '#ff7eb3');
      tongueGrad.addColorStop(1, '#ff4081');
      ctx.fillStyle = tongueGrad;
      ctx.beginPath();
      ctx.ellipse(mouth.x, mouth.y + eyeDist * 0.18, eyeDist * 0.1, eyeDist * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tongue line
      ctx.strokeStyle = 'rgba(200, 50, 100, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mouth.x, mouth.y + eyeDist * 0.05);
      ctx.lineTo(mouth.x, mouth.y + eyeDist * 0.3);
      ctx.stroke();
      ctx.restore();

      // Nose
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      const dogNoseGrad = ctx.createRadialGradient(nose.x - 3, nose.y - 3, 0, nose.x, nose.y, eyeDist * 0.1);
      dogNoseGrad.addColorStop(0, '#333');
      dogNoseGrad.addColorStop(1, '#111');
      ctx.fillStyle = dogNoseGrad;
      ctx.beginPath();
      ctx.ellipse(nose.x, nose.y, eyeDist * 0.09, eyeDist * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      // Nose highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.ellipse(nose.x - eyeDist * 0.02, nose.y - eyeDist * 0.02, eyeDist * 0.03, eyeDist * 0.02, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    // ─── BUNNY EARS ───────────────────────────────────────────────
    case 'bunny': {
      const forehead = p(10);
      const le = p(33);
      const re = p(263);
      const nose = p(1);
      const eyeDist = Math.abs(re.x - le.x);
      const earW = eyeDist * 0.18;
      const earH = eyeDist * 0.75;

      [-1, 1].forEach(side => {
        const earX = forehead.x + side * eyeDist * 0.35;
        const earCenterY = forehead.y - earH * 0.65;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;

        // Outer ear
        const outerGrad = ctx.createLinearGradient(earX, earCenterY - earH, earX, earCenterY + earH);
        outerGrad.addColorStop(0, '#f5f0eb');
        outerGrad.addColorStop(1, '#e8ddd3');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.ellipse(earX, earCenterY, earW, earH, side * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Inner ear (pink)
        const innerGrad = ctx.createLinearGradient(earX, earCenterY - earH * 0.7, earX, earCenterY + earH * 0.5);
        innerGrad.addColorStop(0, '#ffc1cc');
        innerGrad.addColorStop(1, '#ffb3c6');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.ellipse(earX, earCenterY, earW * 0.6, earH * 0.7, side * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Bunny nose
      ctx.save();
      const bnGrad = ctx.createRadialGradient(nose.x, nose.y, 0, nose.x, nose.y, eyeDist * 0.06);
      bnGrad.addColorStop(0, '#ffb3c6');
      bnGrad.addColorStop(1, '#ff8fab');
      ctx.fillStyle = bnGrad;
      ctx.beginPath();
      ctx.ellipse(nose.x, nose.y, eyeDist * 0.055, eyeDist * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Cheek blush
      const leftCheek = p(50);
      const rightCheek = p(280);
      [leftCheek, rightCheek].forEach(cheek => {
        const blush = ctx.createRadialGradient(cheek.x, cheek.y, 0, cheek.x, cheek.y, eyeDist * 0.18);
        blush.addColorStop(0, 'rgba(255, 182, 193, 0.3)');
        blush.addColorStop(1, 'rgba(255, 182, 193, 0)');
        ctx.fillStyle = blush;
        ctx.beginPath();
        ctx.arc(cheek.x, cheek.y, eyeDist * 0.18, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // ─── SUPERHERO MASK ───────────────────────────────────────────
    case 'superhero': {
      const le = p(33);
      const re = p(263);
      const nose = p(1);
      const leTop = p(159);
      const reTop = p(386);
      const leBot = p(145);
      const reBot = p(374);
      const forehead = p(10);
      const eyeDist = Math.abs(re.x - le.x);
      const cx = (le.x + re.x) / 2;
      const cy = (le.y + re.y) / 2;

      ctx.save();
      ctx.shadowColor = 'rgba(180, 0, 0, 0.4)';
      ctx.shadowBlur = 15;

      // Mask gradient
      const maskGrad = ctx.createLinearGradient(cx - eyeDist, cy - eyeDist * 0.4, cx + eyeDist, cy + eyeDist * 0.3);
      maskGrad.addColorStop(0, '#c62828');
      maskGrad.addColorStop(0.3, '#e53935');
      maskGrad.addColorStop(0.5, '#b71c1c');
      maskGrad.addColorStop(0.7, '#e53935');
      maskGrad.addColorStop(1, '#c62828');

      // Main mask shape
      ctx.fillStyle = maskGrad;
      ctx.beginPath();
      ctx.moveTo(cx, forehead.y - eyeDist * 0.05);
      ctx.bezierCurveTo(cx - eyeDist * 0.35, forehead.y - eyeDist * 0.1, cx - eyeDist * 0.7, cy - eyeDist * 0.15, cx - eyeDist * 0.85, cy);
      ctx.bezierCurveTo(cx - eyeDist * 0.9, cy + eyeDist * 0.15, cx - eyeDist * 0.55, nose.y + eyeDist * 0.05, cx, nose.y + eyeDist * 0.05);
      ctx.bezierCurveTo(cx + eyeDist * 0.55, nose.y + eyeDist * 0.05, cx + eyeDist * 0.9, cy + eyeDist * 0.15, cx + eyeDist * 0.85, cy);
      ctx.bezierCurveTo(cx + eyeDist * 0.7, cy - eyeDist * 0.15, cx + eyeDist * 0.35, forehead.y - eyeDist * 0.1, cx, forehead.y - eyeDist * 0.05);
      ctx.closePath();

      // Cut out eye holes
      const eyeHoleW = eyeDist * 0.23;
      const eyeHoleH = eyeDist * 0.14;

      // Left eye
      ctx.moveTo(le.x + eyeHoleW, le.y);
      ctx.ellipse(le.x, le.y, eyeHoleW, eyeHoleH, 0, 0, Math.PI * 2, true);
      // Right eye
      ctx.moveTo(re.x + eyeHoleW, re.y);
      ctx.ellipse(re.x, re.y, eyeHoleW, eyeHoleH, 0, 0, Math.PI * 2, true);

      ctx.fill('evenodd');

      // Gold trim
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = Math.max(2, eyeDist * 0.02);
      ctx.beginPath();
      ctx.ellipse(le.x, le.y, eyeHoleW + 2, eyeHoleH + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(re.x, re.y, eyeHoleW + 2, eyeHoleH + 2, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
      break;
    }

    // ─── PIRATE ───────────────────────────────────────────────────
    case 'pirate': {
      const le = p(33);
      const re = p(263);
      const forehead = p(10);
      const eyeDist = Math.abs(re.x - le.x);
      const cx = forehead.x;

      // Bandana
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;

      const bandanaGrad = ctx.createLinearGradient(cx - eyeDist, forehead.y - eyeDist * 0.35, cx + eyeDist, forehead.y);
      bandanaGrad.addColorStop(0, '#8B0000');
      bandanaGrad.addColorStop(0.5, '#B22222');
      bandanaGrad.addColorStop(1, '#8B0000');

      ctx.fillStyle = bandanaGrad;
      ctx.beginPath();
      ctx.moveTo(cx - eyeDist * 1.1, forehead.y - eyeDist * 0.05);
      ctx.quadraticCurveTo(cx, forehead.y - eyeDist * 0.45, cx + eyeDist * 1.1, forehead.y - eyeDist * 0.05);
      ctx.lineTo(cx + eyeDist * 1.05, forehead.y + eyeDist * 0.05);
      ctx.quadraticCurveTo(cx, forehead.y - eyeDist * 0.25, cx - eyeDist * 1.05, forehead.y + eyeDist * 0.05);
      ctx.closePath();
      ctx.fill();

      // Knot
      ctx.fillStyle = '#660000';
      ctx.beginPath();
      ctx.ellipse(cx + eyeDist * 1.05, forehead.y, eyeDist * 0.08, eyeDist * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tails
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = Math.max(3, eyeDist * 0.03);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + eyeDist * 1.1, forehead.y);
      ctx.quadraticCurveTo(cx + eyeDist * 1.25, forehead.y + eyeDist * 0.2, cx + eyeDist * 1.15, forehead.y + eyeDist * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + eyeDist * 1.1, forehead.y + eyeDist * 0.02);
      ctx.quadraticCurveTo(cx + eyeDist * 1.3, forehead.y + eyeDist * 0.15, cx + eyeDist * 1.25, forehead.y + eyeDist * 0.35);
      ctx.stroke();

      // Eye patch
      const patchGrad = ctx.createRadialGradient(re.x, re.y, 0, re.x, re.y, eyeDist * 0.25);
      patchGrad.addColorStop(0, '#2a2a2a');
      patchGrad.addColorStop(1, '#111');
      ctx.fillStyle = patchGrad;
      ctx.beginPath();
      ctx.ellipse(re.x, re.y, eyeDist * 0.22, eyeDist * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();

      // Patch strap
      ctx.strokeStyle = '#333';
      ctx.lineWidth = Math.max(2.5, eyeDist * 0.02);
      ctx.beginPath();
      ctx.moveTo(re.x - eyeDist * 0.2, re.y - eyeDist * 0.08);
      ctx.lineTo(cx - eyeDist * 1.05, forehead.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(re.x + eyeDist * 0.2, re.y - eyeDist * 0.08);
      ctx.lineTo(cx + eyeDist * 1.05, forehead.y - eyeDist * 0.02);
      ctx.stroke();

      ctx.restore();
      break;
    }

    // ─── PARTY HAT ────────────────────────────────────────────────
    case 'party': {
      const forehead = p(10);
      const le = p(54);
      const re = p(284);
      const baseW = Math.abs(re.x - le.x) * 0.75;
      const hatH = baseW * 1.4;
      const cx = forehead.x;
      const baseY = forehead.y - baseW * 0.05;
      const tipY = baseY - hatH;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;

      // Hat body with stripes
      ctx.beginPath();
      ctx.moveTo(cx, tipY);
      ctx.lineTo(cx - baseW / 2, baseY);
      ctx.lineTo(cx + baseW / 2, baseY);
      ctx.closePath();
      ctx.clip();

      // Gradient background
      const hatGrad = ctx.createLinearGradient(cx - baseW / 2, baseY, cx + baseW / 2, tipY);
      hatGrad.addColorStop(0, '#e91e63');
      hatGrad.addColorStop(0.5, '#9c27b0');
      hatGrad.addColorStop(1, '#673ab7');
      ctx.fillStyle = hatGrad;
      ctx.fillRect(cx - baseW / 2, tipY, baseW, hatH);

      // Diagonal stripes
      ctx.globalAlpha = (intensity / 100) * 0.2;
      ctx.fillStyle = '#ffffff';
      for (let i = -5; i < 10; i++) {
        ctx.save();
        ctx.translate(cx - baseW + i * baseW * 0.2, tipY);
        ctx.rotate(0.3);
        ctx.fillRect(0, 0, baseW * 0.08, hatH * 1.5);
        ctx.restore();
      }
      ctx.globalAlpha = intensity / 100;

      // Polka dots
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      for (let i = 0; i < 8; i++) {
        const dy = tipY + hatH * 0.15 + (i % 4) * (hatH * 0.22);
        const wAtY = baseW * ((dy - tipY) / hatH);
        const dx = cx - wAtY * 0.35 + (i > 3 ? wAtY * 0.35 : 0);
        ctx.beginPath();
        ctx.arc(dx, dy, baseW * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Pom-pom
      ctx.save();
      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.shadowBlur = 15;
      const pomGrad = ctx.createRadialGradient(cx, tipY, 0, cx, tipY, baseW * 0.1);
      pomGrad.addColorStop(0, '#FFD700');
      pomGrad.addColorStop(0.7, '#FFC107');
      pomGrad.addColorStop(1, '#FF9800');
      ctx.fillStyle = pomGrad;
      ctx.beginPath();
      ctx.arc(cx, tipY, baseW * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Elastic band
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - baseW / 2, baseY);
      ctx.quadraticCurveTo(cx - baseW, baseY + baseW * 0.25, cx - baseW * 0.8, baseY + baseW * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + baseW / 2, baseY);
      ctx.quadraticCurveTo(cx + baseW, baseY + baseW * 0.25, cx + baseW * 0.8, baseY + baseW * 0.4);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    // ─── ALIEN ────────────────────────────────────────────────────
    case 'alien': {
      const le = p(33);
      const re = p(263);
      const forehead = p(10);
      const eyeDist = Math.abs(re.x - le.x);
      const t = Date.now() / 1000;

      // Green tint on face
      const greenGrad = ctx.createRadialGradient(forehead.x, forehead.y + eyeDist * 0.3, 0, forehead.x, forehead.y + eyeDist * 0.3, eyeDist * 1.3);
      greenGrad.addColorStop(0, 'rgba(76, 175, 80, 0.12)');
      greenGrad.addColorStop(1, 'rgba(76, 175, 80, 0)');
      ctx.fillStyle = greenGrad;
      ctx.beginPath();
      ctx.arc(forehead.x, forehead.y + eyeDist * 0.3, eyeDist * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Antennae
      [-1, 1].forEach(side => {
        const baseX = forehead.x + side * eyeDist * 0.35;
        const baseY = forehead.y - eyeDist * 0.1;
        const tipX = baseX + side * eyeDist * 0.25;
        const tipY = baseY - eyeDist * 0.65 + Math.sin(t * 3 + side) * 5;

        // Stalk
        ctx.save();
        ctx.strokeStyle = '#66BB6A';
        ctx.lineWidth = Math.max(3, eyeDist * 0.03);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(baseX + side * eyeDist * 0.05, baseY - eyeDist * 0.35, tipX, tipY);
        ctx.stroke();

        // Ball
        const ballGrad = ctx.createRadialGradient(tipX - 3, tipY - 3, 0, tipX, tipY, eyeDist * 0.08);
        ballGrad.addColorStop(0, '#a5d6a7');
        ballGrad.addColorStop(0.6, '#66BB6A');
        ballGrad.addColorStop(1, '#388E3C');
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(tipX, tipY, eyeDist * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const glowGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, eyeDist * 0.15);
        glowGrad.addColorStop(0, `rgba(76, 175, 80, ${0.3 + Math.sin(t * 4 + side) * 0.15})`);
        glowGrad.addColorStop(1, 'rgba(76, 175, 80, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(tipX, tipY, eyeDist * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Big alien eyes
      [le, re].forEach(eye => {
        ctx.save();
        // Outer eye
        const eyeGrad = ctx.createRadialGradient(eye.x, eye.y, eyeDist * 0.05, eye.x, eye.y, eyeDist * 0.22);
        eyeGrad.addColorStop(0, '#111');
        eyeGrad.addColorStop(0.7, '#1a1a1a');
        eyeGrad.addColorStop(1, '#000');
        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.ellipse(eye.x, eye.y, eyeDist * 0.2, eyeDist * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Reflection
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.ellipse(eye.x - eyeDist * 0.06, eye.y - eyeDist * 0.08, eyeDist * 0.05, eyeDist * 0.06, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(eye.x + eyeDist * 0.05, eye.y + eyeDist * 0.05, eyeDist * 0.025, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }

    // ─── VAMPIRE ──────────────────────────────────────────────────
    case 'vampire': {
      const mouth = p(13);
      const leftMouth = p(61);
      const rightMouth = p(291);
      const nose = p(1);
      const forehead = p(10);
      const le = p(33);
      const re = p(263);
      const eyeDist = Math.abs(le.x - re.x);

      // Pale skin overlay
      const paleGrad = ctx.createRadialGradient(forehead.x, forehead.y + eyeDist * 0.5, 0, forehead.x, forehead.y + eyeDist * 0.5, eyeDist * 1.3);
      paleGrad.addColorStop(0, 'rgba(220, 210, 230, 0.15)');
      paleGrad.addColorStop(1, 'rgba(220, 210, 230, 0)');
      ctx.fillStyle = paleGrad;
      ctx.beginPath();
      ctx.arc(forehead.x, forehead.y + eyeDist * 0.5, eyeDist * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Dark circles under eyes
      [le, re].forEach(eye => {
        const underGrad = ctx.createRadialGradient(eye.x, eye.y + eyeDist * 0.12, 0, eye.x, eye.y + eyeDist * 0.12, eyeDist * 0.18);
        underGrad.addColorStop(0, 'rgba(80, 0, 80, 0.2)');
        underGrad.addColorStop(1, 'rgba(80, 0, 80, 0)');
        ctx.fillStyle = underGrad;
        ctx.beginPath();
        ctx.ellipse(eye.x, eye.y + eyeDist * 0.12, eyeDist * 0.18, eyeDist * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Fangs
      const fangW = eyeDist * 0.04;
      const fangH = eyeDist * 0.15;
      const fangY = mouth.y + eyeDist * 0.02;

      [leftMouth.x + eyeDist * 0.12, rightMouth.x - eyeDist * 0.12].forEach(fx => {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;

        const fangGrad = ctx.createLinearGradient(fx, fangY, fx, fangY + fangH);
        fangGrad.addColorStop(0, '#ffffff');
        fangGrad.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = fangGrad;
        ctx.beginPath();
        ctx.moveTo(fx - fangW, fangY);
        ctx.lineTo(fx, fangY + fangH);
        ctx.lineTo(fx + fangW, fangY);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // Blood red lips
      ctx.save();
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = Math.max(2.5, eyeDist * 0.02);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(leftMouth.x, leftMouth.y);
      ctx.quadraticCurveTo(mouth.x, mouth.y + eyeDist * 0.04, rightMouth.x, rightMouth.y);
      ctx.stroke();
      ctx.restore();
      break;
    }

    // ─── RAINBOW ──────────────────────────────────────────────────
    case 'rainbow': {
      const forehead = p(10);
      const le = p(54);
      const re = p(284);
      const arcW = Math.abs(re.x - le.x) * 0.7;
      const cx = forehead.x;
      const cy = forehead.y;

      const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
      const bandWidth = Math.max(4, arcW * 0.04);

      ctx.save();
      ctx.lineCap = 'round';

      colors.forEach((color, i) => {
        const r = arcW * 0.85 - i * bandWidth * 1.3;
        if (r <= 0) return;

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = bandWidth;
        ctx.strokeStyle = color;
        ctx.lineWidth = bandWidth;
        ctx.globalAlpha = (intensity / 100) * 0.85;
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, 0, false);
        ctx.stroke();
        ctx.restore();
      });

      // Sparkles at ends
      const t = Date.now() / 1000;
      [-1, 1].forEach(side => {
        for (let i = 0; i < 3; i++) {
          const sparkleX = cx + side * arcW * 0.85 + Math.sin(t * 2 + i) * 10;
          const sparkleY = cy + Math.cos(t * 3 + i * 2) * 8;
          const sparkleSize = 4 + Math.sin(t * 4 + i) * 2;
          drawStar(ctx, sparkleX, sparkleY, sparkleSize, sparkleSize * 0.4, '#FFD700', t);
        }
      });

      ctx.restore();
      break;
    }

    // ─── STAR EYES ────────────────────────────────────────────────
    case 'stars': {
      const le = p(33);
      const re = p(263);
      const eyeDist = Math.abs(re.x - le.x);
      const t = Date.now() / 1000;

      // Star eyes overlay
      [le, re].forEach((eye, eyeIdx) => {
        const starSize = eyeDist * 0.18;
        // Main star
        drawStar(ctx, eye.x, eye.y, starSize, starSize * 0.45, '#FFD700', t * 0.5);

        // Smaller orbiting stars
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 + t * (1.5 + eyeIdx * 0.3);
          const dist = eyeDist * 0.35;
          const sx = eye.x + Math.cos(angle) * dist;
          const sy = eye.y + Math.sin(angle) * dist;
          const ss = eyeDist * (0.04 + Math.sin(t * 3 + i * 1.7) * 0.015);
          const colors = ['#FFD700', '#FFF176', '#FFE082', '#FFECB3', '#FFC107'];
          drawStar(ctx, sx, sy, ss, ss * 0.4, colors[i], t * 2 + i);
        }
      });

      // Sparkle particles floating up
      for (let i = 0; i < 8; i++) {
        const sparkleX = (le.x + re.x) / 2 + Math.sin(t * 1.5 + i * 2.5) * eyeDist * 0.8;
        const sparkleY = le.y - eyeDist * 0.3 - ((t * 30 + i * 40) % (eyeDist * 1.5));
        const sparkleSize = 3 + Math.sin(t * 3 + i) * 1.5;
        const alpha = Math.max(0, 1 - ((t * 30 + i * 40) % (eyeDist * 1.5)) / (eyeDist * 1.5));
        ctx.save();
        ctx.globalAlpha = alpha * (intensity / 100) * 0.7;
        drawStar(ctx, sparkleX, sparkleY, sparkleSize, sparkleSize * 0.4, '#FFD700', t + i);
        ctx.restore();
      }
      break;
    }
  }

  ctx.restore();
}
