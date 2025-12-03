# Visucan - Hardware-as-a-Service + AI Test/Dev Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-MVP-yellow.svg)]()

## Overview

Visucan is a cloud-based Hardware-as-a-Service platform that enables embedded software developers, hardware teams, startups, and universities to remotely access, program, test, and debug physical hardware devices integrated with AI-powered development tools.

## Key Features

### 🎯 Remote Hardware Access
- **Supported Hardware**: Raspberry Pi, Arduino, STM32, Intel/Altera FPGA dev kits
- **Real-time Console**: Web-based serial console, SWD/JTAG tunneling
- **Visual Monitoring**: Multi-angle industrial cameras for LED/indicator monitoring
- **Remote Control**: Power on/off/reset automation via PDU and relay cards

### 🤖 AI Integration
- **Multiple AI Providers**: ChatGPT, Claude, GitHub Copilot
- **IDE Extensions**: VS Code, JetBrains
- **Prompt-to-Project**: Automated requirement extraction, code generation, testing
- **Agent Orchestration**: Code generation, test scenario creation, error analysis

### 🔨 Build & Flash Automation
- **Container-based Toolchains**: ARM GCC, PlatformIO, Zephyr, Arduino CLI
- **Multi-language Support**: C/C++, Python, Rust, Zephyr/STM32Cube, Arduino
- **Automated Pipeline**: Build → Unit tests → Integration tests → Firmware signing → Flash
- **Artifact Repository**: HEX/ELF/BIN versioning with SBOM generation

### 🔍 Visual Testing Infrastructure
- **AI-powered Testing**: LED pattern detection, screen OCR, color/blink frequency analysis
- **Test Scenarios**: "Is LED blinking in this pattern?", "Is there an error code on screen?"
- **Test Fixtures**: Robot clickers, motor-driven knobs, power cycling relays, signal generators

### 🔐 Security & Network
- **Zero-Trust Access**: mTLS, short-lived tokens, bastion hosts
- **Network Segmentation**: Separate VLANs per customer/device class
- **Reverse Tunneling**: Agent-based access (gRPC/WebSocket, WireGuard)
- **Audit Logging**: Session recording (video + serial/JTAG logs)

### 🧪 Device Simulation & HIL
- **Programmable Signal Sources**: PWM, I2C/SPI/UART loopback, DAC/ADC emulators
- **HIL/DIL Testing**: Temperature/voltage variation tests, fault injection
- **Golden Reference**: Automatic capture and deviation reporting

## Quick Start

```bash
# Clone the repository
git clone https://github.com/umtkyck/visucan.git
cd visucan

# Install dependencies
npm install

# Start development environment
docker-compose up -d

# Access web interface
open http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Application                         │
│  (Dashboard, Device Canvas, Test Flow Editor)               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                     API Gateway                             │
│           (REST/gRPC, Authentication, Rate Limiting)        │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼────────┐ ┌─▼──────────────┐
│   Device     │ │   Build    │ │  AI Agent      │
│  Manager     │ │  Service   │ │ Orchestrator   │
└───────┬──────┘ └───┬────────┘ └─┬──────────────┘
        │            │              │
┌───────▼────────────▼──────────────▼──────────────┐
│          Hardware Infrastructure                 │
│  (Racks, USB Hubs, Programmers, Cameras, PDU)   │
└──────────────────────────────────────────────────┘
```

## Project Structure

```
visucan/
├── backend/                 # Backend services
│   ├── api/                # REST/gRPC API endpoints
│   ├── device-manager/     # Device allocation, health checks
│   ├── build-service/      # Compilation and flashing
│   ├── test-runner/        # Test execution engine
│   └── ai-orchestrator/    # AI agent coordination
├── frontend/               # Web application
│   ├── dashboard/          # Project dashboard
│   ├── device-canvas/      # Live device interaction
│   └── test-editor/        # No-code test flow builder
├── agents/                 # Device agents
│   ├── serial-agent/       # Serial console access
│   ├── debug-agent/        # SWD/JTAG debugging
│   └── camera-agent/       # Visual monitoring
├── infrastructure/         # Infrastructure as code
│   ├── docker/            # Container definitions
│   ├── kubernetes/        # K8s manifests
│   └── terraform/         # Cloud infrastructure
├── docs/                  # Documentation
│   ├── VISION.md         # Product vision
│   ├── ARCHITECTURE.md   # System architecture
│   ├── API.md           # API documentation
│   └── guides/          # Integration guides
└── scripts/             # Automation scripts
    ├── setup/          # Setup scripts
    └── deploy/         # Deployment scripts
```

## Technology Stack

### Backend
- **Runtime**: Node.js / Python
- **Framework**: Express.js / FastAPI
- **Database**: PostgreSQL, Redis
- **Message Queue**: RabbitMQ / Apache Kafka
- **Container**: Docker, Kubernetes

### Frontend
- **Framework**: React / Next.js
- **UI Library**: Material-UI / Tailwind CSS
- **State Management**: Redux / Zustand
- **Real-time**: WebSocket / Socket.io
- **Graphics**: Chart.js / D3.js

### Infrastructure
- **Cloud**: AWS / GCP / Azure
- **Networking**: WireGuard, Nginx
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack

### AI Integration
- **OpenAI API**: GPT-4 for code generation
- **Anthropic Claude**: Advanced reasoning
- **GitHub Copilot**: Real-time assistance

## MVP Roadmap

### Phase 1 (Current)
- ✅ Basic documentation
- 🔄 Raspberry Pi + Arduino + STM32 (1 rack, 50 slots)
- 🔄 Serial console + camera + basic flashing
- 🔄 Simple web interface

### Phase 2
- ⏳ FPGA dev kits
- ⏳ Visual LED testing
- ⏳ Basic HIL capabilities

### Phase 3
- ⏳ Advanced HIL
- ⏳ Multi-AI agents
- ⏳ Enterprise integrations

## Use Cases

### For Embedded Developers
- Test firmware on real hardware without physical access
- Debug remotely with full JTAG/SWD support
- Run automated regression tests on commit

### For Startups
- Access expensive dev kits without upfront investment
- Scale testing infrastructure on-demand
- Integrate hardware tests into CI/CD pipeline

### For Universities
- Provide students remote access to lab equipment
- Enable distance learning for embedded courses
- Reduce equipment maintenance overhead

### For Hardware Vendors
- Offer "try before you buy" experiences
- Provide reference designs with instant testing
- Reduce customer support burden

## Pricing

### Pay-as-you-go
- **Device Time**: $0.50 - $5.00 per hour (varies by device)
- **Test Runs**: $0.10 per test execution
- **AI Tokens**: Pass-through pricing + 10% markup

### Monthly Plans
- **Hobbyist**: $29/mo - 10 hours, 100 tests
- **Professional**: $199/mo - 100 hours, 1000 tests
- **Team**: $999/mo - 500 hours, 5000 tests
- **Enterprise**: Custom pricing with dedicated racks

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

For security concerns, please email security@visucan.io. See [SECURITY.md](SECURITY.md) for our security policy.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@visucan.io
- 💬 Discord: [Join our community](https://discord.gg/visucan)
- 📖 Docs: [docs.visucan.io](https://docs.visucan.io)
- 🐛 Issues: [GitHub Issues](https://github.com/umtkyck/visucan/issues)

## Acknowledgments

- Hardware partners: Digi-Key, Mouser, PiMoroni
- Open source tools: OpenOCD, PlatformIO, Arduino
- AI providers: OpenAI, Anthropic, GitHub

---

Made with ❤️ by the Visucan Team
