# 📡 NoonTrop

<div align="center">

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)
[![React Native](https://img.shields.io/badge/React%20Native-0.87.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cryptography](https://img.shields.io/badge/Crypto-TweetNaCl%20(Curve25519)-00E5FF?style=for-the-badge&logo=lock&logoColor=black)](https://tweetnacl.js.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-white?style=for-the-badge&logo=android&logoColor=green)](https://reactnative.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](https://github.com/techxsarwar/noontrop/pulls)

<br />

**Zero Internet. Zero Cellular Data. Zero SIM Card. Zero Passwords.**  
*Pure Offline Peer-to-Peer Communication Powered Directly by Device Wi-Fi Radios.*

<br />

[Features](#-key-features) • [How It Works](#-how-it-works) • [Architecture](#-architecture) • [Project Structure](#-project-structure) • [Getting Started](#-getting-started) • [License & Attribution](#-license--attribution-terms-gplv3) • [Author](#-author)

</div>

---

## 💡 Overview

**NoonTrop** is a decentralized, off-grid communication application engineered to enable instant, encrypted peer-to-peer chat between smartphones without relying on cell towers, internet service providers, or central servers.

By utilizing **Wi-Fi Direct (P2P Service Discovery / DNS-SD)** and local radio frequency broadcasts, devices discover each other and transmit authenticated, end-to-end encrypted packets across the airwaves.

### 🌍 Why NoonTrop?

Traditional messaging apps (WhatsApp, Telegram, Signal) require centralized servers and constant internet access. When infrastructure collapses or is unavailable, connectivity is lost:
- 🚨 **Disaster Recovery & Outages**: Communicate during natural disasters when cellular grids and power fail.
- 🌾 **Remote & Rural Areas**: Zero cellular reception zones, mountains, and wilderness expeditions.
- 🛡️ **Internet Blackouts & Censorship**: Maintain local freedom of speech during telecommunication shutdowns.
- ✈️ **Travelers & Offline Venues**: Connect at concerts, festivals, flights, or abroad without needing foreign SIM cards or data roaming.
- 🎓 **Campuses & High-Density Venues**: Fast local peer communication without network congestion.

---

## ✨ Key Features

- 🛰️ **100% Offline & Serverless**  
  Zero dependency on external networks, mobile data, router gateways, or internet connections.
- 🔒 **Military-Grade End-to-End Encryption (E2EE)**  
  Built with **TweetNaCl** authenticated public-key cryptography (**Curve25519**, **XSalsa20**, and **Poly1305**). Only the intended recipient holding the private key can decrypt messages.
- 📡 **Zero-Pairing Wi-Fi Direct Discovery**  
  Discover nearby peers in seconds without manual Wi-Fi password entry, Bluetooth PIN handshakes, or common network routers.
- 🎯 **Real-Time Visual Radar View**  
  Interactive radar sonar interface displaying detected peer nodes, approximate distance estimates, and signal strength indicators.
- 🎭 **Ephemeral & Anonymous Identity**  
  No phone numbers, email registration, or accounts required. Generates cryptographically secure keypairs and unique peer fingerprints (`XXXX-XXXX-XXXX`) on-device.
- ⚡ **Multi-Mode Transmission Engine**  
  Supports **Direct Wi-Fi P2P**, **DNS-SD Service Discovery**, **Mesh Relay**, and **Simulation Mode** (for development & testing).
- 🌙 **Sleek Cyber-Dark UI**  
  Crafted with neon cyan accents, glow effects, smooth micro-animations, and fluid haptics.

---

## 🧠 How It Works

```
┌─────────────────┐                                  ┌─────────────────┐
│     Node A      │            WiFi Radio            │     Node B      │
│  (192.168.49.x) │  ══════════════════════════════► │  (192.168.49.y) │
│                 │   DNS-SD Service Advertising     │                 │
│  📡 Broadcaster │   & Encrypted P2P Socket Packet  │  📡 Receiver    │
│  (Curve25519)   │  ◄══════════════════════════════ │  (Curve25519)   │
└─────────────────┘         Zero Internet Needed     └─────────────────┘
```

1. **Identity Generation**:  
   On first launch, NoonTrop initializes a local Curve25519 cryptographic keypair:
   $$\text{KeyPair} = \{\text{PublicKey}, \text{SecretKey}\}$$
   A human-readable cryptographic fingerprint is computed from the public key.

2. **Service Discovery (Zero-Connection Broadcast)**:  
   Devices broadcast their presence via `WifiP2pManager` (Android DNS-SD) / Multipeer Connectivity (iOS). The advertisement packet carries node identity and public key without establishing a classical network connection.

3. **Key Agreement & Authenticated Encryption**:  
   Messages are encrypted using TweetNaCl authenticated box cryptography (`nacl.box`):
   $$\text{Ciphertext} = \text{Box}(\text{Plaintext}, \text{Nonce}, \text{RecipientPubKey}, \text{SenderPrivKey})$$

4. **Peer-to-Peer Delivery**:  
   Encrypted packets are transmitted directly over Wi-Fi Direct sockets or local service discovery records and decrypted locally by the recipient.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   App Layer (React Native)                  │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │ Discovery Screen │  │  Chat Screen   │  │  Settings   │  │
│  │ (Radar / List)   │  │ (E2EE Bubbles) │  │  (Identity) │  │
│  └────────┬─────────┘  └───────┬────────┘  └──────┬──────┘  │
├───────────┼────────────────────┼──────────────────┼─────────┤
│           ▼                    ▼                  ▼         │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │    P2PService    │  │ EncryptionServ │  │ StorageServ │  │
│  │ (Peer Management)│  │  (TweetNaCl)   │  │ (AsyncStor) │  │
│  └────────┬─────────┘  └───────┬────────┘  └─────────────┘  │
├───────────┼────────────────────┼────────────────────────────┤
│           ▼                    ▼                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Native Wi-Fi P2P Bridge                  │  │
│  │           (WifiP2PModule / Native Events)             │  │
│  └─────────────────────────────┬─────────────────────────┘  │
├────────────────────────────────┼────────────────────────────┤
│                                ▼                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Android: WifiP2pManager (DNS-SD / P2P Sockets)        │  │
│  │ iOS: MultipeerConnectivity Framework                  │  │
│  └─────────────────────────────┬─────────────────────────┘  │
├────────────────────────────────┼────────────────────────────┤
│                                ▼                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Device Wi-Fi Radio Hardware Transceiver      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
noontrop/
├── android/               # Native Android build & Wi-Fi P2P bridge
├── ios/                   # Native iOS build & Multipeer bridge
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── MessageBubble.tsx # Encrypted message bubble with status indicators
│   │   ├── PeerCard.tsx      # Peer list card with signal & distance
│   │   ├── RadarView.tsx     # Animated sonar radar sweep visualizer
│   │   └── SendBar.tsx       # Message input bar with send triggers
│   ├── native/            # Native TypeScript module bridges
│   │   └── WifiP2P.ts        # Wi-Fi Direct Manager event bridge
│   ├── screens/           # Application screens
│   │   ├── ChatScreen.tsx       # 1-on-1 encrypted chat interface
│   │   ├── DiscoveryScreen.tsx  # Radar & peer discovery interface
│   │   └── SettingsScreen.tsx   # Identity, fingerprint & engine controls
│   ├── services/          # Core services & utilities
│   │   ├── EncryptionService.ts # TweetNaCl (Curve25519 / XSalsa20 / Poly1305)
│   │   ├── P2PService.ts        # P2P lifecycle, peer state & packet dispatch
│   │   ├── PermissionService.ts # Android runtime Wi-Fi & location permissions
│   │   └── StorageService.ts    # Encrypted local persistence (AsyncStorage)
│   ├── theme/             # Design tokens, palette & typography
│   │   └── index.ts          # Cyber-dark neon color scheme
│   └── types/             # TypeScript interfaces & packet schemas
│       └── index.ts          # Peer, Packet, Message & Nav types
├── App.tsx                # App entry point & Stack Navigator
├── LICENSE                # GNU General Public License v3.0 (GPL-3.0)
└── package.json           # Project manifest & dependencies
```

---

## 📦 Packet Protocol Structure

All payloads exchanged across the airwaves use a structured JSON packet envelope:

| Field | Type | Description |
|---|---|---|
| `version` | `number` | Protocol version (currently `1`) |
| `type` | `enum` | `'MSG'` \| `'ACK'` \| `'HELLO'` \| `'KEY_EXCHANGE'` |
| `msgId` | `string` | Unique UUID per transmission |
| `from` | `string` | Sender peer fingerprint ID |
| `to` | `string` | Recipient peer fingerprint ID |
| `fromName` | `string` | Sender display alias |
| `publicKey`| `string` | Base64-encoded Curve25519 public key |
| `payload` | `string` | Base64 ciphertext or encrypted payload |
| `nonce` | `string` | Unique Base64 24-byte cryptographic nonce |
| `timestamp`| `number` | Unix timestamp in milliseconds |

---

## 🚀 Getting Started

### Prerequisites

Ensure your development environment meets the following requirements:
- **Node.js**: `>= 22.11.0`
- **npm** or **yarn**
- **Java Development Kit (JDK)**: `17+`
- **Android Studio** with Android SDK Platform `34+`
- **Physical Android / iOS Devices** *(Note: Wi-Fi Direct radio scanning requires physical hardware; emulators run in simulated transmission mode)*

### 1. Clone the Repository

```bash
git clone https://github.com/techxsarwar/noontrop.git
cd noontrop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Metro Bundler

```bash
npm start
```

### 4. Run on Device

#### Android
Connect your Android device via USB with USB Debugging enabled:

```bash
npm run android
```

#### iOS (macOS only)
Install CocoaPods dependencies and run:

```bash
bundle install
bundle exec pod install
npm run ios
```

---

## 📱 Required Permissions

NoonTrop requests only hardware permissions strictly needed for Wi-Fi Direct radio operations:

| Permission | Platform | Reason |
|---|---|---|
| `NEARBY_WIFI_DEVICES` | Android 13+ | Required for Wi-Fi Direct P2P peer scanning without location |
| `ACCESS_FINE_LOCATION` | Android 12 & below | Required by Android OS for Wi-Fi hardware beacon discovery |
| `CHANGE_WIFI_STATE` | Android | Required to initialize Wi-Fi Direct socket channels |
| `ACCESS_WIFI_STATE` | Android | Required to inspect current Wi-Fi adapter availability |

> 🔒 **Privacy Guarantee**: NoonTrop **NEVER** tracks your GPS location or uploads your data to any remote server. The location permission on older Android versions is a technical requirement of Android's Wi-Fi scanning APIs.

---

## ⚖️ License & Attribution Terms (GPLv3)

This project is licensed under the **[GNU General Public License v3.0 (GPL-3.0)](file:///d:/noontrop/LICENSE)**.

```
                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2026 Sarwar (techxsarwar <darsarwar060@gmail.com>)
```

### 📌 Summary of Terms:

When using, modifying, distributing, or building upon this codebase, you **must adhere to the following conditions**:

- 🔓 **Keep the Source Code Public (Copyleft)**:  
  Any software, fork, or derivative work that incorporates code from NoonTrop **must also be open-sourced under the GNU GPLv3**. You cannot relicense this code under a proprietary closed-source license.
- 🏷️ **Give Credit / Mandatory Attribution**:  
  You **must** prominently give credit to the original creator (**Sarwar / @techxsarwar**), preserve all original copyright notices, and include a copy of the [LICENSE](file:///d:/noontrop/LICENSE) file in any distribution.
- 📝 **State Changes**:  
  If you modify any files, you must add prominent notices stating that you changed the files and giving the date of modification.
- 🚫 **No Added Restrictions**:  
  You may not place additional restrictions or digital rights management (DRM) preventing users from exercising their GPL rights.

For the full legal text, please read the [LICENSE](file:///d:/noontrop/LICENSE) file.

---

## 👤 Author

**Sarwar (techxsarwar)**  
- 📧 Email: [darsarwar060@gmail.com](mailto:darsarwar060@gmail.com)  
- 🐙 GitHub: [@techxsarwar](https://github.com/techxsarwar)  
- 💼 Project: [NoonTrop](https://github.com/techxsarwar/noontrop)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <sub>Built with ❤️ for decentralization, privacy, and uninterrupted human connection.</sub>
</div>
