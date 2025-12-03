# Visucan Virtual Processors - Quick Start Guide
## From Zero to Demo in 15 Minutes ⚡

---

## 🚀 Super Fast Setup

### 1. Clone & Install (3 minutes)

```bash
# Clone repository
git clone https://github.com/umtkyck/visucan.git
cd visucan

# Automated setup (installs deps, checks env, seeds data)
./scripts/demo-setup.sh
```

That's it! The script handles everything:
- ✅ Installs dependencies
- ✅ Checks environment
- ✅ Seeds demo data
- ✅ Verifies all files

---

### 2. Start Development Server (1 minute)

```bash
npm run dev
```

Open: **http://localhost:3000**

---

### 3. Test Demo Features (5 minutes)

Run automated tests:

```bash
node scripts/test-demo.js
```

Expected output:
```
✅ All tests passed! Demo is ready! 🚀
Total Tests: 52
Passed: 52
Failed: 0
Success Rate: 100.0%
```

---

### 4. Record Video (5 minutes)

```bash
./scripts/recording-helper.sh
```

This script will:
- ✅ Check if server is running
- ✅ Show recording setup checklist
- ✅ Display demo URLs
- ✅ Verify browser is ready
- ✅ Open demo in browser

Follow **demo/DEMO-SCRIPT.md** for step-by-step recording guide.

---

## 📂 File Structure

```
visucan/
├── demo/
│   ├── README.md                    ⭐ Demo overview
│   ├── DEMO-SCRIPT.md               🎬 Video recording script
│   ├── SOCIAL-MEDIA-CONTENT.md      📱 All social posts
│   ├── VISUAL-ASSETS-GUIDE.md       🎨 Screenshots & thumbnails
│   └── arduino-examples/            💻 Arduino code examples
├── scripts/
│   ├── demo-setup.sh                🔧 Automated setup
│   ├── test-demo.js                 🧪 Test suite
│   ├── recording-helper.sh          📹 Recording assistant
│   └── seed-virtual-processors.js   🌱 Seed demo data
├── app/
│   ├── virtual-processors/          🎮 Marketplace UI
│   ├── virtual-instances/           💾 Instance management
│   └── api/                         🔌 Backend APIs
└── VERCEL-DEPLOYMENT.md             🌐 Production deployment
```

---

## 🎯 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| **Marketplace** | `/virtual-processors` | Browse Arduino, STM32, RPi |
| **My Instances** | `/virtual-instances` | Manage virtual processors |
| **Instance Config** | `/virtual-instances/[id]` | Pin assignment, firmware |
| **Serial Console** | `/virtual-instances/[id]/console` | Real-time console |

---

## 🎬 Recording Checklist

**Before Recording**:
- [ ] Run `./scripts/recording-helper.sh`
- [ ] OBS/Loom ready (1920x1080, 30fps)
- [ ] Browser in incognito mode
- [ ] Zoom at 100%
- [ ] Microphone tested
- [ ] Quiet environment

**Recording Flow** (5 minutes):
1. **0:00-0:15** - Intro & hook
2. **0:15-1:00** - Browse marketplace
3. **1:00-2:15** - Create instance & configure pins
4. **2:15-3:00** - Start instance & open console
5. **3:00-4:30** - Run LED blink demo
6. **4:30-5:00** - Benefits & CTA

Full script: **demo/DEMO-SCRIPT.md**

---

## 📱 Social Media Campaign

All content ready in **demo/SOCIAL-MEDIA-CONTENT.md**:

### Week 1: Launch
- **Monday**: LinkedIn announcement
- **Tuesday**: Twitter 5-tweet thread
- **Wednesday**: Instagram carousel
- **Thursday**: YouTube full demo
- **Friday**: TikTok teaser

### Targets (First Month):
- 🎥 **YouTube**: 5,000 views
- 🐦 **Twitter**: 50+ followers
- 📸 **Instagram**: 200+ followers
- 💻 **Platform**: 100+ free trials

---

## 🌐 Deploy to Production

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

Or use **Vercel Dashboard**:
1. Import from GitHub
2. Add environment variables
3. Deploy!

Full guide: **VERCEL-DEPLOYMENT.md**

---

## 💡 Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run type-check            # Check TypeScript

# Database
npm run db:push               # Apply schema changes
npm run db:studio             # Open Drizzle Studio

# Demo
./scripts/demo-setup.sh       # Setup demo environment
node scripts/test-demo.js     # Run tests
./scripts/recording-helper.sh # Prepare for recording
node scripts/seed-virtual-processors.js # Seed data

# Deployment
vercel                        # Preview deployment
vercel --prod                 # Production deployment
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check port 3000 is free
lsof -ti:3000 | xargs kill -9

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
# Reset database
npm run db:push

# Reseed data
node scripts/seed-virtual-processors.js
```

### Tests failing
```bash
# Run specific test
node scripts/test-demo.js

# Check for missing files
ls -la demo/
ls -la app/api/virtual-processors/
```

---

## 📖 Documentation

| Guide | Purpose |
|-------|---------|
| **README.md** | Project overview |
| **QUICK-START.md** (this file) | Fast setup |
| **demo/README.md** | Demo materials overview |
| **demo/DEMO-SCRIPT.md** | Video recording |
| **demo/SOCIAL-MEDIA-CONTENT.md** | Social posts |
| **demo/VISUAL-ASSETS-GUIDE.md** | Design & recording |
| **VERCEL-DEPLOYMENT.md** | Production deployment |
| **VIRTUAL-PROCESSORS.md** | Feature documentation |
| **ARCHITECTURE.md** | Technical architecture |

---

## 🎓 Learning Path

### Beginner (1 hour)
1. ✅ Run `demo-setup.sh`
2. ✅ Browse marketplace
3. ✅ Read `demo/README.md`

### Intermediate (3 hours)
1. ✅ Record demo video
2. ✅ Edit and publish
3. ✅ Post on social media

### Advanced (1 day)
1. ✅ Deploy to Vercel
2. ✅ Launch full campaign
3. ✅ Track analytics

---

## ✅ Success Checklist

**Setup Complete When**:
- [ ] `npm run dev` works
- [ ] `/virtual-processors` shows 4 processors
- [ ] All tests pass (52/52)
- [ ] Demo files present (6 files)

**Ready to Record When**:
- [ ] Server running
- [ ] Browser in incognito
- [ ] OBS/Loom configured
- [ ] Demo script reviewed

**Ready to Launch When**:
- [ ] Video recorded & edited
- [ ] Social posts scheduled
- [ ] Deployed to Vercel
- [ ] Analytics tracking setup

---

## 🆘 Getting Help

- **Documentation**: Read all MD files in `demo/`
- **Tests**: Run `node scripts/test-demo.js`
- **GitHub Issues**: https://github.com/umtkyck/visucan/issues
- **Email**: support@visucan.com

---

## 🎉 You're Ready!

**Next Action**: Run this command and you're done!

```bash
./scripts/demo-setup.sh && npm run dev
```

Then open: **http://localhost:3000/virtual-processors**

**Happy building! 🚀✨**
