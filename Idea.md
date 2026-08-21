# 📡 NoonTrop — Offline Chat App

## The Vision
> **A chat app that works with zero internet, zero SIM, zero data plan — using only WiFi radio waves every phone already has.**

---

## 💭 How We Got Here — The Brainstorming Journey

### The Problem
Billions of people face situations where internet isn't available:
- Rural areas with no data coverage
- Disaster zones where cell towers are down
- Countries with internet shutdowns
- Students in schools with restricted WiFi
- Travelers without local SIM cards
- People who simply can't afford a data plan

**Yet every one of these people has a phone with a powerful WiFi radio built in.**

### Ideas We Explored & Why We Moved On

| Idea | Why We Considered It | Why We Moved On |
|------|---------------------|-----------------|
| 🔊 Ultrasonic Sound Chat | Novel — encode messages in inaudible sound waves | Too short range (~3-10m) |
| 📷 QR Code Relay Chat | Works on any device, no wireless needed | Requires physically showing screens — not practical |
| 📶 Bluetooth Mesh | Every phone has Bluetooth | Short range (~30m per hop), user wanted beyond BT |
| 📱 SMS Tunneling | Works without internet, massive range | Requires a SIM card — user wants NO SIM |
| 🔗 Bluetooth + WiFi Direct Mesh | Combines both radios | User wanted something more creative than Bluetooth |
| 🧠 Delay-Tolerant Network (DTN) | Messages hop via people physically moving | Still relies on Bluetooth for short hops |

### The Breakthrough 💡
The user noticed something fundamental:

> *"Even when internet isn't accessible, we can still see WiFi network names. Is there a way to send messages like that?"*

**This is the core insight:** WiFi radios constantly broadcast signals (SSIDs/beacons) that ANY nearby device can read — **without connecting, without a password, without internet.** The message can BE the broadcast itself.

---

## 🚀 The Final Concept: WiFi Direct Service Discovery Chat

### How It Works (Simple Version)
```
┌──────────────┐         WiFi Radio Waves         ┌──────────────┐
│   Phone A    │  ════════════════════════════════► │   Phone B    │
│              │   Broadcasts: "Hey, how are you?" │              │
│  📡 Publish  │                                   │  📡 Discover │
│   message    │  ◄════════════════════════════════ │   message    │
│              │   Broadcasts: "I'm good! You?"    │              │
└──────────────┘         No internet needed         └──────────────┘
```

### How It Works (Technical Version)
1. **Phone A** uses WiFi Direct Service Discovery to **publish** a service
   - The service contains the encrypted message as data payload
   - This is broadcast via WiFi radio — no internet needed
2. **Phone B** runs service discovery and **finds** Phone A's broadcast
   - Reads the message from the service record
   - No connection established, no password needed
3. **Phone B** publishes its reply the same way
4. Both phones continuously scan & publish in the background

### What the User Experiences
1. Open the app → see nearby users broadcasting
2. Tap a user → start a chat
3. Type a message → it's automatically broadcast via WiFi radio
4. The other person's phone picks it up and displays it
5. **No setup. No accounts. No internet. No SIM. No passwords.**

---

## ✅ Requirements & Constraints

### Must Have
- [x] **No internet** — works completely offline
- [x] **No SIM card** — works on tablets, old phones, anything with WiFi
- [x] **No passwords** — no need to connect to any WiFi network
- [x] **No extra hardware** — uses only the phone's built-in WiFi radio
- [x] **No pairing** — no manual setup between devices
- [x] **1-on-1 private messaging** — encrypted, only recipient can read
- [x] **React Native** — cross-platform (Android & iOS)

### Nice to Have
- [ ] Group chats / broadcast channels
- [ ] Message delivery confirmations
- [ ] Media sharing (images via chunked transfer)
- [ ] Message history / persistence
- [ ] User profiles & avatars
- [ ] Disappearing messages

---

## 🔧 Technical Architecture

### Core Technology: WiFi P2P Service Discovery
- **Android API**: `WifiP2pManager` + `WifiP2pDnsSdServiceInfo`
- **iOS API**: `MultipeerConnectivity` framework
- **React Native**: Native modules wrapping platform APIs

### Communication Flow
```
┌─────────────────────────────────────────────────────────┐
│                    App Layer (React Native)              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Chat UI    │  │  Message     │  │  Encryption   │  │
│  │  Component  │  │  Queue       │  │  Layer (E2E)  │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │          │
│  ┌──────▼────────────────▼───────────────────▼───────┐  │
│  │            Native Bridge Module                    │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                               │
├─────────────────────────┼───────────────────────────────┤
│         Platform Native │ Layer                         │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │  Android: WifiP2pManager Service Discovery        │  │
│  │  iOS: MultipeerConnectivity Framework             │  │
│  └──────────────────────┬────────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼────────────────────────────┐  │
│  │          WiFi Radio Hardware (Built-in)            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Message Protocol
```
┌────────────────────────────────────────┐
│          Message Packet Structure       │
├──────────┬─────────┬───────────────────┤
│ Header   │ Meta    │ Payload           │
│ (4 bytes)│(12 bytes)│ (variable)       │
├──────────┼─────────┼───────────────────┤
│ Version  │ From ID │ Encrypted message │
│ Type     │ To ID   │ content           │
│ Chunk #  │ Timestamp│                  │
│ Total    │ Msg ID  │                   │
└──────────┴─────────┴───────────────────┘
```

### Encryption Strategy
- **Key Exchange**: Diffie-Hellman key exchange during initial discovery
- **Message Encryption**: AES-256-GCM for all messages
- **Identity**: Each device generates a unique keypair on first launch
- **Forward Secrecy**: New session keys for each conversation

---

## 📊 Technical Specs

| Specification | Value |
|--------------|-------|
| Range | ~200 meters (WiFi Direct) |
| Message Size | Up to ~1KB per service record |
| Latency | 2-5 seconds per message cycle |
| Battery Impact | Moderate (WiFi radio active) |
| Supported OS | Android 4.1+ / iOS 7+ |
| Framework | React Native |
| Encryption | AES-256-GCM + ECDH key exchange |
| Max Concurrent Users | ~10-15 nearby peers |

---

## 🎨 App Design Vision

### Name Ideas
- **NoonTrop** — the project name
- **AirDrop Chat** — messages through the air
- **WaveChat** — communication via radio waves
- **EchoLink** — your message echoes through WiFi
- **SignalDrop** — signal without the internet

### UI Concept
- **Dark mode default** — sleek, modern, premium feel
- **Radar/sonar animation** — shows nearby users being discovered
- **Glowing message bubbles** — pulsing effect when sending/receiving
- **Signal strength indicator** — shows how strong the connection is
- **No login screen** — app generates an anonymous identity on first launch
- **Minimal & clean** — focus on the chat, no clutter

### User Flow
```
First Launch → Generate Identity → Show Radar (scanning)
                                        │
                              Discover nearby user
                                        │
                              Tap to start chat
                                        │
                              Exchange keys (automatic)
                                        │
                              Chat! (messages via WiFi radio)
```

---

## 🌍 Why This Matters

### Market Gap
- **WhatsApp, Telegram, Signal** — all require internet
- **Bridgefy, Briar** — exist but use Bluetooth (short range, clunky)
- **FireChat** — discontinued
- **Nobody** has built a polished WiFi Direct messaging app

### Use Cases
1. **Disaster Response** — communicate when cell towers are down
2. **Protests & Activism** — chat during internet shutdowns
3. **Schools & Campuses** — students chat without WiFi access
4. **Rural Communities** — areas with no cell coverage
5. **Travelers** — communicate abroad without a local SIM
6. **Events & Festivals** — when networks are overloaded
7. **Military/Field Operations** — secure offline communication
8. **Developing Countries** — where data plans are unaffordable

### The Pitch
> *"The first chat app that uses your phone's WiFi radio to send messages directly to nearby phones — no internet, no SIM, no setup. Just radio waves."*

---

## 📋 Next Steps
1. Set up React Native project with WiFi Direct native modules
2. Build the native Android module (WifiP2pManager)
3. Build the native iOS module (MultipeerConnectivity)
4. Implement the message protocol & encryption
5. Design & build the chat UI
6. Add user discovery (radar screen)
7. Testing on real devices (WiFi Direct requires physical devices)
8. Polish, optimize battery usage, and ship!

---

> **Note**: WiFi Direct Service Discovery cannot be tested on emulators — it requires real physical devices with WiFi hardware. Development will involve building the UI on emulators and testing the communication layer on real devices.
