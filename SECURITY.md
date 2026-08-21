# Security Policy for NoonTrop

## 1. Security Overview & Philosophy

**NoonTrop** is designed with security and privacy at its foundational core. Our goal is to provide authenticated, tamper-proof, end-to-end encrypted offline communication without relying on third-party trust anchors, central servers, or certification authorities.

---

## 2. Cryptographic Specifications

NoonTrop relies on **[TweetNaCl](https://tweetnacl.js.org/)**, a high-security, compact, and audited cryptographic library developed by Daniel J. Bernstein, Tanja Lange, and Peter Schwabe.

| Security Layer | Cryptographic Primitive | Key / Nonce Size | Purpose |
|---|---|---|---|
| **Key Agreement** | `X25519` (Diffie-Hellman over Curve25519) | 256-bit (32 bytes) | Ephemeral peer identity & key exchange |
| **Authenticated Encryption** | `XSalsa20-Poly1305` (`nacl.box`) | 256-bit Key / 192-bit Nonce | Symmetric payload encryption & MAC integrity |
| **Random Number Generation** | `nacl.randomBytes` (CSPRNG) | 24-byte nonces | Unique cryptographic nonce per packet |
| **Identity Fingerprint** | Truncated Hex Encoding of Public Key | 12 hex characters (`XXXX-XXXX-XXXX`) | Out-of-band visual key verification |

---

## 3. Threat Model & Guarantees

### ✅ What NoonTrop Protects Against:
- **Eavesdropping / Packet Sniffing**: Anyone monitoring or capturing 802.11 Wi-Fi Direct radio packets in transit receives only encrypted ciphertext. Without the recipient's private key, the plaintext cannot be recovered.
- **Payload Tampering / Forgery**: `Poly1305` Message Authentication Code (MAC) verifies that ciphertext has not been altered or injected by an attacker in transit.
- **Server Compromise**: Because there are **zero servers**, there is no central database to breach, subpoena, or leak metadata.
- **Replay Attacks**: Each message contains a unique 24-byte random nonce and message UUID timestamp.

### ⚠️ What NoonTrop Does NOT Protect Against:
- **Compromised Endpoints**: If the physical device running NoonTrop has malware, rootkit, or spyware installed with access to local storage/screen capture, security cannot be guaranteed.
- **Metadata Visibility (Traffic Analysis)**: Nearby Wi-Fi scanners can observe that two devices are transmitting radio packets on standard Wi-Fi Direct frequencies, their signal strength, and their public display names.
- **Physical Device Seizure**: If a device is seized while unlocked, local conversation history may be accessible unless cleared via settings.

---

## 4. Supported Versions

We release security updates and patches for the following versions:

| Version | Supported |
|---|---|
| `0.0.x` (Latest `main` branch) | :white_check_mark: |
| Older releases | :x: |

---

## 5. Reporting a Security Vulnerability

We take the security of our users and codebase very seriously. If you discover a security vulnerability or cryptographic flaw in NoonTrop, we ask you to report it responsibly.

### How to Report:
1. **DO NOT** open a public issue or discuss the vulnerability publicly on GitHub.
2. Email a detailed vulnerability report directly to:
   - **Lead Developer:** Sarwar (`techxsarwar`)
   - **Email:** [darsarwar060@gmail.com](mailto:darsarwar060@gmail.com)
   - **Subject:** `[SECURITY VULNERABILITY] NoonTrop - <Brief Description>`
3. Please include:
   - Type of vulnerability (e.g., cryptographic flaw, buffer overflow, state mismatch).
   - Step-by-step reproduction steps or proof-of-concept (PoC) code.
   - Affected components (`src/services/EncryptionService.ts`, `WifiP2P.ts`, etc.).
   - Proposed remediations (if known).

### Our Response Timeline:
- **Acknowledgment**: Within 48 hours of receipt.
- **Assessment & Triage**: Within 5 business days.
- **Patch & Public Advisory**: Coordinated release within 14–30 days depending on complexity.

We credit and thank all security researchers who practice responsible disclosure.
