# Contributing to NoonTrop

Thank you for your interest in contributing to **NoonTrop**! We welcome contributions from developers, security researchers, designers, and documentation writers.

By contributing to this repository, you help build a free, open-source, and decentralized communication future.

---

## 📜 Licensing of Contributions

All contributions submitted to NoonTrop will be licensed under the **[GNU General Public License v3.0 (GPL-3.0)](file:///d:/noontrop/LICENSE)**.

By submitting a pull request, you affirm that:
1. You have the legal right to submit the code under the GNU GPLv3.
2. Your contributions do not violate third-party copyrights or proprietary licenses.
3. You agree to the **Developer Certificate of Origin (DCO)** below.

### Developer Certificate of Origin (DCO)

```text
Developer Certificate of Origin
Version 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

---

## 🛠️ Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/noontrop.git
cd noontrop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Code Guidelines
- **TypeScript**: Strict typing across all components, hooks, and services.
- **Code Style**: Format with Prettier and follow ESLint rules (`npm run lint`).
- **Security First**: All cryptographic operations must use audited `tweetnacl` functions via `src/services/EncryptionService.ts`. Never implement custom unreviewed ciphers.
- **Offline Integrity**: Ensure features operate with zero internet connectivity.

### 5. Commit Your Changes
Use conventional commit messages:
```bash
git commit -m "feat(p2p): add multi-channel beacon support"
```

### 6. Submit a Pull Request
Push your branch and open a PR against the `main` branch. Provide a clear description of the changes, motivation, and any testing performed on physical Android/iOS devices.

---

## 🛡️ Security Disclosures

If you discover a security vulnerability, please **DO NOT** open a public issue. Follow our [Security Policy](file:///d:/noontrop/SECURITY.md) and email **[darsarwar060@gmail.com](mailto:darsarwar060@gmail.com)** directly.
