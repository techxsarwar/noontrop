# Privacy Policy for NoonTrop

**Effective Date:** August 21, 2026  
**Last Updated:** August 21, 2026  
**Developer / Maintainer:** Sarwar (`techxsarwar`) — Contact: [darsarwar060@gmail.com](mailto:darsarwar060@gmail.com)

---

## 1. Introduction

**NoonTrop** ("the App", "we", "us", or "our") is a fully decentralized, offline peer-to-peer (P2P) communication application built with React Native. NoonTrop is designed from the ground up with a **Zero-Knowledge, Zero-Server, Zero-Telemetry** architecture.

We believe that your privacy is a fundamental human right. This Privacy Policy explains our commitment to protecting your privacy and outlines how the App interacts with device hardware and data.

---

## 2. Core Privacy Principles

- 🚫 **No Central Servers**: NoonTrop does not operate, connect to, or communicate with any cloud server, backend database, or third-party infrastructure.
- 🚫 **No Account Registration**: You do not need to provide an email address, phone number, real name, username, or password to use the App.
- 🚫 **No Analytics or Telemetry**: NoonTrop does not integrate any third-party tracking SDKs, advertising networks, crash-reporting trackers, or behavioral analytics tools.
- 🔒 **End-to-End Encryption (E2EE)**: All communications between devices are cryptographically encrypted and authenticated on-device using TweetNaCl (Curve25519-XSalsa20-Poly1305). Only the intended recipient can decrypt the message payload.

---

## 3. Information We Collect and Process

### A. Information We Do NOT Collect
We do **not** collect, store, transmit, sell, or share:
- Personal Identifiable Information (PII) such as your legal name, physical address, email, or telephone number.
- Geolocation data (GPS coordinates, altitude, cell-tower IDs).
- Device identifiers (IMEI, MAC address, Advertising IDs, Android ID, IDFA).
- Message contents, contact lists, photos, or media files.

### B. Information Stored Locally On Your Device
The following data is generated and stored **strictly on your local device storage**:
1. **Cryptographic Keypair**: An ephemeral Curve25519 public key and private (secret) key generated on first launch. The private key never leaves your device under any circumstances.
2. **Local User Profile**: Your chosen display alias and avatar color token.
3. **Local Message History**: Chat conversations and timestamps stored in local sandboxed storage (`AsyncStorage`).
4. **Discovered Peer Cache**: Ephemeral list of nearby peer public keys and fingerprints detected during local Wi-Fi Direct scans.

> **Note:** All locally stored data can be permanently erased at any time by clearing the App's data in your device settings or via the in-app settings reset button.

---

## 4. Device Hardware & Permissions

To facilitate offline peer-to-peer communication over radio waves, NoonTrop requests certain hardware permissions. Below is the full disclosure of each permission and its exact purpose:

| Permission | Platform | Technical Purpose |
|---|---|---|
| `NEARBY_WIFI_DEVICES` | Android 13+ (API 33+) | Enables Wi-Fi Direct (`WifiP2pManager`) peer discovery and local service advertising without accessing device location. |
| `ACCESS_FINE_LOCATION` | Android 12 & Below | Required by older Android operating system APIs to scan for nearby Wi-Fi beacons and Wi-Fi Direct peers. **NoonTrop never accesses, tracks, or records your geographic GPS position.** |
| `ACCESS_WIFI_STATE` | Android | Required to verify if the device Wi-Fi hardware adapter is enabled. |
| `CHANGE_WIFI_STATE` | Android | Required to initiate Wi-Fi Direct peer-to-peer socket groups and DNS-SD discovery. |
| `INTERNET` | Android | Required internally by React Native's bridge to create local `localhost` P2P socket server channels between devices. It is **not** used to connect to the public internet. |

---

## 5. Peer-to-Peer Radio Broadcasting & Encryption

When you use NoonTrop:
1. **Local Discovery Broadcasts**: The App advertises your display name and public key over unencrypted local Wi-Fi Direct beacon packets (DNS-SD) so nearby peers within radio range (~100–200 meters) can detect your presence.
2. **Message Payload Security**: Every chat message is sealed using authenticated public-key box cryptography (`nacl.box`). Even if a third party captures the raw Wi-Fi Direct radio packet in transit, they cannot decipher the message contents without the recipient's private key.

---

## 6. Children's Privacy (COPPA Compliance)

NoonTrop does not knowingly collect, solicit, or store personal information from children under the age of 13 (or under 16 in the European Economic Area). Because the App does not collect any personal data from any user, it is fully compliant with the Children's Online Privacy Protection Act (COPPA) and General Data Protection Regulation (GDPR).

---

## 7. Compliance with International Privacy Laws

### A. General Data Protection Regulation (GDPR - EU/EEA)
Because NoonTrop does not process, store, or transmit personal data on central servers, we do not act as a Data Controller or Data Processor under the GDPR. All personal data resides entirely under the end-user's physical control on their own hardware.

### B. California Consumer Privacy Act (CCPA / CPRA - USA)
We do not collect personal information and do not "sell" or "share" personal information as defined by California privacy statutes.

---

## 8. Third-Party Libraries

NoonTrop is built using open-source libraries:
- **React Native** (MIT License)
- **TweetNaCl / TweetNaCl-Util** (Public Domain / BSD)
- **React Navigation** (MIT License)
- **AsyncStorage** (MIT License)

None of these runtime dependencies contain tracking beacons, analytics scripts, or telemetry exporters.

---

## 9. Changes to This Privacy Policy

We may update our Privacy Policy from time to time to reflect code updates or regulatory changes. Any changes will be published directly in the repository with a revised "Last Updated" date.

---

## 10. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy, please contact the maintainer:

- **Maintainer:** Sarwar (`techxsarwar`)
- **Email:** [darsarwar060@gmail.com](mailto:darsarwar060@gmail.com)
- **Repository:** [https://github.com/techxsarwar/noontrop](https://github.com/techxsarwar/noontrop)
