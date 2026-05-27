<a name="security-top"></a>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF9933,50:FFFFFF,100:138808&height=220&section=header&text=Security%20Policy&fontSize=58&fontColor=1A202C&fontAlignY=38&desc=Guarding%20Farmer%20Data%20%E2%80%A2%20Securing%20Bharat%27s%20Fields&descAlignY=60&descSize=20&animation=fadeIn" width="100%" alt="Security Banner"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=3000&pause=800&color=FF9933&center=true&vCenter=true&width=760&lines=Farm+Intellect+65+Security;Zero-Exposure+Credentials;Local-First+AES-256-GCM+Biometrics;Protecting+our+country's+farmers.+🇮🇳" alt="Typing"/>

<br/><br/>

<p>
  <img src="https://img.shields.io/badge/Security-Strict-FF9933?style=for-the-badge&logo=shieldcheck&logoColor=white&labelColor=138808" alt="Security Level"/>
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-blue?style=for-the-badge&logo=lock&logoColor=white&labelColor=0d1117" alt="Encryption Standard"/>
  <img src="https://img.shields.io/badge/Scope-WebAuthn_|_Supabase-138808?style=for-the-badge&logo=supabase&logoColor=white&labelColor=0a4b1c" alt="Scope Coverage"/>
</p>

<br/>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" height="3" alt="divider"/>

</div>

<br/>

## 📑 Table of Contents

- [🛡️ Supported Versions](#-supported-versions)
- [🚨 Reporting Vulnerabilities](#-reporting-vulnerabilities)
- [🔒 Security Architecture & Baselines](#-security-architecture--baselines)
- [🔎 Scope Highlights](#-scope-highlights)
- [⏳ Disclosure Process](#-disclosure-process)

---

## 🛡️ Supported Versions

We continuously monitor and support the main branches of the repository:

| Version | Supported | Notes |
| :--- | :---: | :--- |
| Current `main` branch | ✅ | Active support, patches, and routine audits |
| Older snapshots | ❌ | Deprecated. Please update to current main |

---

## 🚨 Reporting Vulnerabilities

> [!IMPORTANT]
> **Do not open public GitHub issues for security vulnerabilities.**

If you discover a vulnerability, please report it privately:
1. **GitHub Advisories**: Submit a private draft advisory via our repository settings.
2. **Direct Security Desk**: Email details to `security@farmintellect.app`.

Please provide:
- Detailed description of the vulnerability and its potential impact.
- Clear steps to reproduce (or a proof-of-concept script).
- Suggested remediation if available.

We acknowledge receipt of reports within **48 hours** and keep you updated on progress.

---

## 🔒 Security Architecture & Baselines

We maintain strict security configurations to protect rural user populations:

### 1. Zero-Exposure Credentials
- **Public Sandbox**: All keys exposed in the React application (e.g. `VITE_SUPABASE_ANON_KEY`) represent zero-trust client credentials.
- **Protected Secrets**: Sensitive keys (Gemini API keys, Bhashini services, openWeather credits, and Supabase service role keys) are **backend-only** and never sent or loaded in front-end browser bundles.

### 2. Sandbox Biometrics
- **Local WebAuthn**: Enforces local-only platform authenticators (Fingerprint sensors, Face ID, Windows Hello).
- **AES-GCM-256 Storage**: Stored credentials are encrypted using AES-GCM-256 with symmetric keys stored inside browser sandboxed **IndexedDB** databases, isolated from localStorage and rotated dynamically every 30 days.

---

## 🔎 Scope Highlights

### 🎯 In Scope
- Authorization or role-guard bypasses (accessing merchant/admin centers as farmer)
- Plaintext API key leakages or RLS policy overrides
- Cross-Site Scripting (XSS) or Injection vulnerabilities in vernacular localization sheets

### 🚫 Out of Scope
- Social engineering attacks or physical access vectors
- Incidents originating in external APIs (e.g. OpenWeatherMap, Bhashini) where no integration bug exists in this application

---

## ⏳ Disclosure Process

```
Report Received ──→ Triage & Verification (48h) ──→ Patch Dev ──→ Auto-Deploy ──→ Public Release
```

1. **Acknowledgment**: Immediate confirmation within 48 hours.
2. **Triage**: Impact assessment and priority scheduling.
3. **Patching**: Development and validation testing.
4. **Disclosure**: Public announcements are released once mitigation updates are fully deployed.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:138808,50:FFFFFF,100:FF9933&height=140&section=footer&fontSize=0&animation=fadeIn" width="100%"/>

<br/>

[![Back to Top](https://img.shields.io/badge/⬆_BACK_TO_TOP-FF9933?style=for-the-badge&labelColor=138808)](#security-top)

<sub>© 2026 Farm Intellect 65 · Secure Bharat · MIT License</sub>

</div>
