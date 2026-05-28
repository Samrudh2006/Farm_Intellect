<a name="contributing-top"></a>

<div align="center">

<img src="https://github.com/user-attachments/assets/cce3a328-9e85-483d-85d0-84d31328518b" width="100%" alt="Contributing Banner"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=2600&pause=800&color=60A5FA&center=true&vCenter=true&width=760&lines=Welcome%2C+contributor!+%F0%9F%99%8F;Fork+%E2%86%92+Branch+%E2%86%92+Code+%E2%86%92+PR+%E2%86%92+Impact;Your+code+reaches+600M%2B+farmers.+%F0%9F%8C%BE" alt="Typing"/>

<br/><br/>

<p>
  <img src="https://img.shields.io/badge/PRs-Welcome-22c55e?style=for-the-badge&logo=github&logoColor=white&labelColor=15803d" alt="PRs Welcome"/>
  <img src="https://img.shields.io/badge/First_Timers-Friendly-f97316?style=for-the-badge&logo=handshake&logoColor=white&labelColor=c2410c" alt="First Timers"/>
  <img src="https://img.shields.io/badge/Style-Conventional_Commits-8b5cf6?style=for-the-badge&logo=conventionalcommits&logoColor=white&labelColor=5b21b6" alt="Conventional Commits"/>
  <img src="https://img.shields.io/badge/Stack-React_%2B_TypeScript_%2B_Bun-3b82f6?style=for-the-badge&logo=react&logoColor=white&labelColor=1e40af" alt="Stack"/>
</p>

<br/>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" height="3" alt="divider"/>

</div>

<br/>

## 📑 Table of Contents

| | |
|:--|:--|
| [🌟 Why Contribute?](#-why-contribute) | [🎨 Coding Standards](#-coding-standards) |
| [🚀 Getting Started](#-getting-started) | [🧪 Testing Requirements](#-testing-requirements) |
| [🔀 Branching Strategy](#-branching-strategy) | [📝 Commit Messages](#-commit-messages) |
| [🛠️ Development Setup](#-development-setup) | [🔄 Pull Request Process](#-pull-request-process) |
| [🌟 Areas to Contribute](#-areas-to-contribute) | [🐛 Bug Reports](#-bug-reports) |
| [💡 Feature Requests](#-feature-requests) | [🏅 Recognition](#-recognition) |

---

## 🌟 Why Contribute?

> *"When you fix a bug in Farm Intellect 65, you're not just closing an issue — you're helping a farmer in Telangana diagnose her tomato crop, or a smallholder in Punjab get his fair market price."*

Your contribution — however small — directly impacts:

- 🌾 **10,000+ active farmers** already using the platform
- 🏛️ **₹3 lakh crore** in unclaimed government scheme benefits we're helping unlock
- 🗣️ **22 languages** reaching communities mainstream tech ignores
- 📱 **47% of rural users on 2G** who depend on our offline-first architecture

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/farm-intellect-65.git
cd farm-intellect-65

# Add upstream remote
git remote add upstream https://github.com/Samrudh2006/farm-intellect-65.git
```

### 2. Install Dependencies

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install project dependencies (10× faster than npm)
bun install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Fill in the required API keys (see README for details)
```

### 4. Initialize Database (for backend changes)

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

### 5. Start Development Server

```bash
bun dev
# Opens at http://localhost:5173 with hot module replacement 🔥
```

---

## 🔀 Branching Strategy

We follow **GitHub Flow** — simple, effective, farmer-approved:

```
main                    ← production-ready, protected
  └── feat/your-feature ← your feature branch
  └── fix/bug-name      ← bug fix branch
  └── docs/update-name  ← documentation updates
  └── i18n/language     ← translation additions
  └── perf/optimization ← performance improvements
  └── test/coverage     ← test additions
```

**Rules:**
- ✅ Always branch off `main`
- ✅ Keep branches focused — one feature per PR
- ✅ Delete your branch after merging
- ❌ Never commit directly to `main`

```bash
# Create your branch
git checkout -b feat/livestock-health-tracker

# Keep it updated
git fetch upstream
git rebase upstream/main
```

---

## 📝 Commit Messages

We use **[Conventional Commits](https://www.conventionalcommits.org/)** — this powers our automated changelog and semantic versioning.

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Use For | Example |
|:--|:--|:--|
| `feat` | New feature | `feat(scanner): add pest identification model` |
| `fix` | Bug fix | `fix(mandi): correct price API pagination` |
| `docs` | Documentation | `docs(readme): update installation steps` |
| `i18n` | Translations | `i18n(tamil): add scheme matcher strings` |
| `perf` | Performance | `perf(pwa): reduce initial bundle by 20KB` |
| `test` | Tests | `test(weather): add forecast widget unit tests` |
| `refactor` | Code refactor | `refactor(ai): extract disease inference hook` |
| `style` | Formatting | `style: fix eslint warnings in scanner module` |
| `ci` | CI/CD | `ci: add playwright e2e to deploy pipeline` |
| `chore` | Maintenance | `chore(deps): upgrade vite to 7.1.0` |

### Examples

```bash
# Good ✅
git commit -m "feat(scanner): add 15 new vegetable disease models with Hindi voice output"
git commit -m "fix(mandi): handle missing price data gracefully for smaller mandis"
git commit -m "i18n(punjabi): complete scheme matcher translation (all 847 strings)"
git commit -m "perf(pwa): lazy-load community forum module — saves 34KB on initial load"

# Bad ❌
git commit -m "fix stuff"
git commit -m "update"
git commit -m "WIP"
```

---

## 🛠️ Development Setup

### Project Structure Overview

```
src/
├── features/          ← Add new features here (feature-sliced)
│   ├── crop-scanner/  ← AI disease detection
│   ├── weather/       ← Forecast widgets
│   ├── mandi/         ← Price tracker
│   └── schemes/       ← Govt scheme matcher
├── components/ui/     ← shadcn/ui primitives (don't modify)
├── i18n/              ← Translation JSON files (22 languages)
└── hooks/             ← Shared custom hooks
```

### Key Commands

```bash
bun dev              # Start dev server (http://localhost:5173)
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # ESLint check
bun run typecheck    # TypeScript check
bun test             # Run unit tests (Vitest)
bun test --coverage  # Tests with coverage report
bun run test:e2e     # Playwright E2E tests
bun run ci           # Full CI pipeline locally
```

### Environment Variables Reference

```env
# Required for AI features
VITE_GEMINI_API_KEY=         # Google AI Studio — free tier available

# Required for database
VITE_SUPABASE_URL=           # From Supabase project settings
VITE_SUPABASE_ANON_KEY=      # Public anon key (safe to expose)
SUPABASE_SERVICE_ROLE_KEY=   # Server-only secret — never expose to client

# Required for weather
VITE_OPENWEATHER_KEY=        # Free tier: 1,000 calls/day

# Optional (for language features)
VITE_BHASHINI_API_KEY=       # Free for public-good projects
VITE_BHASHINI_USER_ID=       # Your Bhashini user ID
```

---

## 🌟 Areas to Contribute

### 🔥 High Priority (Start Here!)

| Area | What to Do | Labels |
|:--|:--|:--|
| 🗣️ **Regional Translations** | Add/improve strings in `src/i18n/*.json` | `i18n` `good-first-issue` |
| 🔬 **Disease Dataset** | Add annotated leaf images for new crops | `ml-data` `help-wanted` |
| ♿ **Accessibility** | Improve screen reader support and WCAG compliance | `a11y` `good-first-issue` |
| 🐛 **Bug Fixes** | Check open issues labeled `bug` | `bug` |
| 📝 **Documentation** | Improve guides, API docs, code comments | `docs` `good-first-issue` |

### 🌱 Feature Contributions

| Feature | Description | Difficulty |
|:--|:--|:-:|
| 🐄 Livestock Module | Cattle/poultry/goat health tracking | Medium |
| 🛰️ NDVI Maps | Satellite vegetation health overlay | Hard |
| 🤝 Marketplace | Farmer-to-buyer direct selling | Hard |
| 🎓 Krishi Academy | Gamified agronomy learning | Medium |
| 🌡️ Pest Forecast | ML-based outbreak prediction (7-day) | Hard |
| 📺 Video Tutorials | Embed vernacular how-to content | Easy |
| 👥 Community Forum | Peer Q&A for farmers | Medium |

### 🗣️ Translation Contributions

Adding a new language or improving existing ones is **the highest-impact contribution** you can make.

```bash
# Translation files live in:
src/i18n/
├── en.json   ← Source of truth (English)
├── hi.json   ← Hindi
├── ta.json   ← Tamil
├── te.json   ← Telugu
# ... 19 more

# To add a new language:
# 1. Copy en.json to <lang_code>.json
# 2. Translate all values (keep keys unchanged)
# 3. Register in src/i18n/index.ts
# 4. Add to the language selector in the UI
```

**Translation style guide:**
- Use natural, conversational language — not formal/bureaucratic
- Prefer words a farmer would actually use in the field
- Keep technical terms (e.g. "NPK", "mandi") unchanged
- Test with a native speaker before submitting

---

## 🎨 Coding Standards

### TypeScript

```typescript
// ✅ Good — explicit types, descriptive names
interface DiseaseResult {
  name: string;
  confidence: number;          // 0–1
  severity: 'low' | 'moderate' | 'high';
  treatments: TreatmentPlan[];
}

async function scanLeaf(imageFile: File, crop: CropType): Promise<DiseaseResult> {
  // ...
}

// ❌ Bad — any types, vague names
async function scan(img: any): Promise<any> {
  // ...
}
```

### React Components

```tsx
// ✅ Good — typed props, descriptive component name
interface WeatherCardProps {
  location: GeoCoordinates;
  forecastDays?: number;        // defaults to 7
  language: SupportedLanguage;
}

export function WeatherForecastCard({
  location,
  forecastDays = 7,
  language,
}: WeatherCardProps) {
  // ...
}

// ✅ Use feature-sliced structure
// src/features/weather/WeatherForecastCard.tsx
```

### CSS / Tailwind

```tsx
// ✅ Use design tokens via Tailwind classes
<div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-900">

// ✅ Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ Avoid arbitrary values unless absolutely necessary
<div className="mt-[37px]">   // Bad
```

### File Naming

```
PascalCase   → React components:  WeatherCard.tsx, DiseaseScanner.tsx
camelCase    → Utilities/hooks:   useDiseaseScanner.ts, formatPrice.ts
kebab-case   → Route files:       crop-scanner.tsx, mandi-prices.tsx
UPPER_SNAKE  → Constants:         API_ENDPOINTS.ts, SUPPORTED_CROPS.ts
```

---

## 🧪 Testing Requirements

All PRs must include appropriate tests:

| Change Type | Required Tests |
|:--|:--|
| New feature | Unit tests + at least 1 E2E test for critical path |
| Bug fix | Regression test covering the fixed scenario |
| API changes | Integration tests with MSW mocks |
| UI components | Visual test via Chromatic (auto-runs on PR) |
| i18n additions | Key coverage test (all keys present) |

```bash
# Run tests before pushing
bun test                    # Unit tests must pass (87%+ coverage)
bun run test:e2e            # E2E must pass for critical paths
bun run typecheck           # Zero TypeScript errors
bun run lint                # Zero ESLint warnings
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Branch is up-to-date with `main` (`git rebase upstream/main`)
- [ ] All tests pass (`bun run ci`)
- [ ] TypeScript compiles without errors (`bun run typecheck`)
- [ ] No ESLint warnings (`bun run lint`)
- [ ] Self-reviewed your diff
- [ ] Added/updated tests for your changes
- [ ] Updated documentation if needed

### PR Template

When you open a PR, fill in the template:

```markdown
## What does this PR do?
<!-- One-sentence description -->

## Why is this needed?
<!-- Link to issue: Closes #123 -->

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Translation / i18n
- [ ] Documentation
- [ ] Performance improvement
- [ ] Refactor

## How to test
1. Step one
2. Step two
3. Expected result

## Screenshots (if UI changes)
<!-- Before / After -->

## Checklist
- [ ] Tests added/updated
- [ ] TypeScript clean
- [ ] Lint clean
- [ ] Docs updated
```

### Review Process

```
You open PR
    ↓
Automated CI runs (lint, typecheck, tests, Lighthouse)
    ↓
Maintainer review within 48–72 hours
    ↓
Feedback → You address comments
    ↓
Approval + Merge into main
    ↓
Auto-deploy to Cloudflare Pages 🚀
```

---

## 🐛 Bug Reports

Use the **Bug Report** issue template. Include:

```markdown
**Describe the bug**
A clear description of what's wrong.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should have happened.

**Device / Environment**
- Device: [e.g. Redmi 9, Samsung Galaxy A23]
- OS: [e.g. Android 12]
- Browser: [e.g. Chrome 120]
- Network: [e.g. 2G / 4G / WiFi]
- Language: [e.g. Telugu / Hindi]

**Screenshots / Screen recording**
Attach if available.

**Console errors**
Paste any JavaScript errors from DevTools.
```

**Severity Labels:**

| Label | Description |
|:--|:--|
| `critical` | Data loss, security issue, crashes for all users |
| `high` | Core feature broken (scanner, mandi, weather) |
| `medium` | Feature partially broken or degraded |
| `low` | Minor UI issue, cosmetic bug |

---

## 💡 Feature Requests

Use the **Feature Request** issue template:

```markdown
**Is this related to a problem farmers face?**
Describe the real-world farmer pain this addresses.

**Describe the solution**
What feature would solve it?

**Describe alternatives you've considered**
What else could work?

**Farmer impact**
How many farmers does this affect? Which regions/crops?

**Implementation notes** (optional)
Any technical suggestions?
```

---

## 🏅 Recognition

We believe in celebrating contributions of **all kinds**:

| Contribution | Recognition |
|:--|:--|
| Code PRs merged | Listed in CHANGELOG, GitHub contributors graph |
| Translations | Special `🗣️ Translator` badge in discussions |
| Bug reports (confirmed) | `🐛 Bug Hunter` label on your profile |
| Documentation | `📝 Doc Author` credit |
| First PR | Welcome message + `🌱 First Harvest` badge |

All contributors are featured in our **README contributors section** automatically via `contrib.rocks`.

---

## ❓ Getting Help

| Channel | Use For |
|:--|:--|
| 💬 [GitHub Discussions](https://github.com/Samrudh2006/farm-intellect-65/discussions) | Questions, ideas, general chat |
| 🐛 [GitHub Issues](https://github.com/Samrudh2006/farm-intellect-65/issues) | Bugs and feature requests |
| 📧 Direct message | [@Samrudh2006](https://github.com/Samrudh2006) on GitHub |

Don't hesitate to ask — **there are no stupid questions when you're helping farmers.**

---

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&duration=3000&pause=800&color=60A5FA&center=true&vCenter=true&width=700&lines=Thank+you+for+contributing+to+Farm+Intellect+65!+%F0%9F%8C%BE;Your+code+reaches+the+last-mile+farmer.+%F0%9F%99%8F" alt="Footer"/>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:dbeafe,25:93c5fd,50:60a5fa,75:3b82f6,100:1e40af&height=140&section=footer&fontSize=0&animation=fadeIn" width="100%"/>

<br/>

[![Back to Top](https://img.shields.io/badge/⬆_BACK_TO_TOP-3b82f6?style=for-the-badge&labelColor=1e40af)](#contributing-top)

<sub>© 2026 Farm Intellect 65 · MIT License · Built with ❤️ for Indian farmers</sub>

</div>
