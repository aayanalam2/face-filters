# Interactive Storefront Face Filter Display System

> **Professional real-time face tracking and filter system for retail storefront LED displays**

A production-ready, interactive storefront experience where pedestrians see themselves on a large LED screen with real-time face filters. Built for continuous operation during store hours with automatic filter rotation, idle mode animations, and comprehensive configuration options.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)

## 🎯 Features

### Core Functionality
- ✅ **Real-time Face Detection** - 468 facial landmarks at 30+ FPS using MediaPipe
- ✅ **15 Professional Filters** - Superhero masks, animal faces, accessories, effects
- ✅ **Automatic Filter Rotation** - Configurable intervals (2-30 seconds)
- ✅ **Idle Mode** - Attractive animations when no face is detected
- ✅ **Fullscreen Display** - Optimized for large LED screens
- ✅ **Mirror Effect** - Natural viewing experience
- ✅ **Performance Monitoring** - Real-time FPS counter and face detection status

### Production Features
- 🔄 Auto-restart capability
- 📊 Live performance metrics
- ⚙️ Runtime configuration without restart
- 🎨 Adjustable brightness and filter intensity
- 👁️ Toggle UI visibility for clean display
- 🖥️ Optimized for Colorlight media players (external display mode)

## 🎭 Available Filters

| Category | Filters |
|----------|---------|
| **Accessories** | Cool Glasses 🕶️, Royal Crown 👑 |
| **Animals** | Cat Face 🐱, Puppy Dog 🐶, Bunny Ears 🐰 |
| **Characters** | Superhero Mask 🦸, Pirate 🏴‍☠️, Alien 👽, Vampire 🧛 |
| **Fun** | Party Hat 🎉, Gentleman Mustache 👨 |
| **Effects** | Love Hearts ❤️, Rainbow 🌈, Starry Eyes ✨ |

## 🏗️ System Architecture

```
┌─────────────────┐
│   USB Camera    │
└────────┬────────┘
         │
┌────────▼────────────────────────┐
│  Computer Running Next.js App   │
│  - Face Detection (MediaPipe)   │
│  - Filter Rendering (Canvas)    │
│  - Auto-rotation Logic          │
└────────┬────────────────────────┘
         │ HDMI/DisplayPort
┌────────▼────────────────────────┐
│  Colorlight Media Player        │
│  (Synchronous/External Mode)    │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│      LED Display Screen          │
│   (Storefront Window Display)   │
└─────────────────────────────────┘
```

## 📋 Hardware Requirements

### Recommended Setup
- **Computer**: 
  - CPU: Intel i5 8th gen or AMD Ryzen 5 2600 (or better)
  - RAM: 8GB minimum (16GB recommended)
  - GPU: Integrated graphics sufficient, dedicated GPU recommended for 4K
  - OS: Windows 10/11, Ubuntu 20.04+, or macOS 10.15+

- **Camera**:
  - USB webcam (1080p recommended)
  - Position: Mounted near or on the LED screen
  - Field of view: Wide angle (60-90°) preferred

- **Display**:
  - Colorlight media player in synchronous mode
  - LED screen resolution: Any (app adapts automatically)
  - Connection: HDMI or DisplayPort

### Performance Expectations
- **1080p Display**: 60 FPS
- **4K Display**: 30-45 FPS
- **Face Detection**: 30+ FPS (may vary by hardware)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
# Navigate to http://localhost:3000

# 4. Grant camera permissions

# 5. For production
npm run build && npm start
```

## ⚙️ Configuration

### Runtime Configuration (via UI)

Press **▲ Show Controls** at the bottom to access:

1. **Filter Selection** - Choose specific filters manually
2. **Auto-Rotate**: Enable/disable with 2-30s intervals
3. **Display**: Show/hide UI, fullscreen, brightness (50-150%)
4. **Filter Settings**: Idle timeout (1-10s), intensity (0-100%)

## 🖥️ Colorlight Media Player Setup

### Connection Steps

1. **Set Colorlight to Synchronous Mode**:
   - Use LedVision software
   - Set input to "External Video"
   - Configure as secondary display

2. **Display Settings**:
   - Extend displays (not mirror/clone)
   - Set LED as second monitor

3. **Browser**:
   - Open `http://localhost:3000`
   - Drag to LED display
   - Enter fullscreen (F11)
   - Hide controls

## 🔧 Production Deployment

### Systemd Service (Linux)

```bash
sudo nano /etc/systemd/system/face-filter.service
```

Add:
```ini
[Unit]
Description=Face Filter Display
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/filter-app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable face-filter
sudo systemctl start face-filter
```

## 🎬 Daily Operations

**Start System**:
```bash
npm start
# Open http://localhost:3000
# Grant camera permissions
# Enable fullscreen
# Hide controls
```

**Runs Automatically**:
- Auto-rotation every 5s (default)
- Idle mode after 3s without faces
- Continuous operation

**Monitor**: Check FPS counter and face detection status in UI

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not working | Check permissions, connections, and no other app is using it |
| Low FPS | Close other apps, check hardware, reduce brightness/intensity |
| Face not detected | Improve lighting, face camera directly, check camera angle |
| Display issues | Verify Colorlight sync mode, check HDMI connection, try fullscreen |

## 📊 Performance Tips

1. **Use Chrome** for best performance
2. **Close background apps** during operation
3. **Disable sleep mode** and screensavers
4. **Monitor FPS** - should stay above 30
5. **Adjust brightness** based on ambient lighting

## 📁 Project Structure

```
filter-app/
├── app/
│   ├── page.tsx              # Main fullscreen page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Styles
├── components/
│   ├── FaceFilterApp.tsx     # Main app logic
│   ├── ConfigPanel.tsx       # Settings UI
│   └── IdleMode.tsx          # Idle animation
├── package.json
├── next.config.js
└── README.md
```

## 🛠️ Customization

### Add Custom Filter

Edit `components/FaceFilterApp.tsx`:

```typescript
// 1. Add to FILTERS array
{ id: 'custom', name: 'Custom', emoji: '🎨', category: 'fun' }

// 2. Add case in drawFilter()
case 'custom': {
  // Your drawing code here
  break;
}
```

### Modify Idle Screen

Edit `components/IdleMode.tsx` to change messages, animations, and branding.

## 🔒 Privacy & Security

- All processing is local (no data sent to servers)
- No recording or storage of faces
- Real-time detection only
- Compliant with privacy regulations when used properly
- Display privacy notices in storefront if required by law

## 📈 Future Enhancements

- [ ] Video recording
- [ ] Social media integration  
- [ ] QR code photo downloads
- [ ] Analytics dashboard
- [ ] Multiple face support
- [ ] 3D filters (Three.js)
- [ ] Gesture controls

## 📄 License

MIT License - Free for commercial use

## 🙏 Credits

- **MediaPipe** (Google) - Face detection
- **TensorFlow.js** - ML infrastructure
- **Next.js** (Vercel) - React framework
- **Tailwind CSS** - Styling

---

**Built for professional retail displays** | **Production-ready** | **24/7 capable**
