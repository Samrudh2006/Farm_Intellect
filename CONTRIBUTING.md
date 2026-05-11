<div align="center">

<!-- Animated Header -->
<img src="public/icons/icon-512.png" alt="Krishi AI Logo" width="120" />

# 🤝 Contributing to Krishi AI — Farm Intellect

<p>
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=3000&pause=1000&color=16A34A&center=true&vCenter=true&repeat=true&width=500&height=50&lines=Help+Us+Empower+Indian+Farmers+🌾;Every+Line+of+Code+Matters+💚;Join+Our+Open+Source+Mission+🇮🇳" alt="Typing SVG" />
</p>

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/PRs-Welcome-16a34a?style=for-the-badge&logo=github&logoColor=white" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/First_Timers-Friendly-FF9933?style=for-the-badge&logo=git&logoColor=white" alt="First Timers" />
  <img src="https://img.shields.io/badge/License-MIT-0066CC?style=for-the-badge" alt="License" />
</p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232a" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=20232a" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=20232a" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=flat-square&logo=supabase&logoColor=white&labelColor=20232a" />
</p>

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

</div>

## 🎉 Welcome!

**Thank you for wanting to help!** Whether you're a student, a professional developer, or someone who just loves farming — **everyone is welcome here!**

> 💡 **What is this project?** Krishi AI is a free app that helps Indian farmers get crop advice, detect plant diseases, check market prices, and more — **in 22 Indian languages!**

---

## 📋 Table of Contents

| Section | What You'll Learn |
|:--------|:------------------|
| [🚀 Getting Started](#-getting-started) | How to set up the project on your computer |
| [🐛 Report a Bug](#-found-a-bug-report-it) | How to tell us about problems |
| [💡 Suggest a Feature](#-have-an-idea-suggest-it) | How to share your ideas |
| [💻 Write Code](#-writing-code) | Step-by-step guide to contribute code |
| [📝 Commit Rules](#-commit-message-rules) | How to write good commit messages |
| [🎨 Code Style](#-code-style-guide) | Our coding rules (simple!) |
| [🌍 Translations](#-adding-translations) | Help translate to Indian languages |
| [🗄️ Database Rules](#️-database-rules) | Rules for database changes |
| [🔒 Security Rules](#-security-rules) | Keep the app safe |
| [📚 Knowledge Hub](#-knowledge-hub) | Where learning content lives |
| [✅ PR Checklist](#-pull-request-checklist) | Final checks before submitting |

---

## 🚀 Getting Started

<div align="center">

```
📦 What You Need
├── 🟢 Node.js 18 or newer
├── 📦 npm or bun (package manager)  
└── 🔀 Git (version control)
```

</div>

### Step-by-Step Setup

```bash
# Step 1: Fork the repo on GitHub (click "Fork" button on top-right)

# Step 2: Clone YOUR fork to your computer
git clone https://github.com/YOUR_USERNAME/farm-intellect-65.git

# Step 3: Go into the project folder
cd farm-intellect-65

# Step 4: Install all the packages
npm install

# Step 5: Create your environment file
cp .env.example .env
# 📝 Open .env and fill in: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID

# Step 6: Start the app!
npm run dev
```

🎉 **Done!** Open `http://localhost:8080` in your browser and you'll see the app!

---

## 🐛 Found a Bug? Report It!

<div align="center">

| Step | What to Do |
|:----:|:-----------|
| 1️⃣ | Go to **Issues** → **New Issue** → Choose **Bug Report** |
| 2️⃣ | Tell us: What happened? What did you expect? |
| 3️⃣ | Share: Your browser, OS, and steps to reproduce |
| 4️⃣ | Add screenshots if possible 📸 |

</div>

> 🔗 Use our [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) — it guides you through it!

---

## 💡 Have an Idea? Suggest It!

<div align="center">

| Step | What to Do |
|:----:|:-----------|
| 1️⃣ | Go to **Issues** → **New Issue** → Choose **Feature Request** |
| 2️⃣ | Explain: What's the feature? Who benefits? |
| 3️⃣ | Bonus: How does it help Indian farmers? 🧑‍🌾 |

</div>

> 🔗 Use our [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)

---

## 💻 Writing Code

### The 6-Step Process

<div align="center">

```
🍴 Fork  →  🌿 Branch  →  ✏️ Code  →  🧪 Test  →  💾 Commit  →  🔄 PR
```

</div>

```bash
# 1. Make sure you're on the main branch
git checkout main
git pull origin main

# 2. Create a new branch for your work
git checkout -b feature/your-feature-name
# Examples:
#   git checkout -b feature/hindi-voice-assistant
#   git checkout -b fix/crop-calendar-date-bug
#   git checkout -b docs/update-readme

# 3. Make your changes (write code, fix bugs, etc.)

# 4. Test your changes
npm run test        # Run tests
npm run lint        # Check code style

# 5. Commit your changes (see commit rules below)
git add .
git commit -m "feat: add wheat disease detection for Punjab region"

# 6. Push and create a Pull Request
git push origin feature/your-feature-name
# Then go to GitHub and click "Create Pull Request"
```

---

## 📝 Commit Message Rules

We use **Conventional Commits** — it's a simple system:

<div align="center">

| Prefix | When to Use | Example |
|:------:|:------------|:--------|
| `feat:` | ✨ New feature | `feat: add voice input for Tamil language` |
| `fix:` | 🐛 Bug fix | `fix: crop calendar shows wrong dates` |
| `docs:` | 📖 Documentation | `docs: add Hindi translation guide` |
| `style:` | 🎨 Formatting only | `style: fix button alignment on mobile` |
| `refactor:` | ♻️ Code cleanup | `refactor: simplify weather API calls` |
| `test:` | 🧪 Adding tests | `test: add unit tests for login flow` |
| `chore:` | 🔧 Build/CI stuff | `chore: update dependencies` |

</div>

### ✅ Good Commit Messages
```
feat: add crop rotation optimizer for Punjab region
fix: mandi price not loading for Gujarat markets  
docs: add screenshot of farmer dashboard
```

### ❌ Bad Commit Messages
```
fixed stuff
update
changes
asdfgh
```

---

## 🎨 Code Style Guide

<div align="center">

| Rule | Details |
|:-----|:--------|
| 📘 **Language** | TypeScript (strict mode, no `any` types) |
| ⚛️ **Components** | React functional components with hooks |
| 🎨 **Styling** | Tailwind CSS with semantic design tokens from `index.css` |
| 📁 **Naming** | `PascalCase` for components, `camelCase` for functions |
| 📦 **Imports** | Use `@/` path aliases (e.g., `@/components/ui/button`) |
| 🧩 **Size** | Small, focused, reusable components |
| 🚫 **Colors** | NEVER use raw colors like `text-white` — use tokens like `text-foreground` |

</div>

### Example: Good Component

```tsx
// ✅ Good — uses design tokens, typed props, clean structure
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface CropCardProps {
  cropName: string;
  season: string;
}

export const CropCard = ({ cropName, season }: CropCardProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-lg font-semibold text-foreground">{cropName}</h3>
      <p className="text-sm text-muted-foreground">{season}</p>
      <Button className="mt-2">{t('common.view_details')}</Button>
    </div>
  );
};
```

---

## 🌍 Adding Translations

We support **22 Indian languages!** When you add text that users will see:

<div align="center">

```
📁 src/i18n/translations.ts  ←  All translations live here
```

</div>

### Steps:

1. **Add English string** to `translations.ts`
2. **Add Hindi translation** (minimum requirement)
3. **Add Punjabi translation** (recommended)
4. **Use in component:**

```tsx
const { t } = useLanguage();
return <p>{t('your.new.key')}</p>;
```

### Supported Languages

<div align="center">

| | | | |
|:--|:--|:--|:--|
| 🇮🇳 Hindi | 🇮🇳 Punjabi | 🇮🇳 Tamil | 🇮🇳 Telugu |
| 🇮🇳 Bengali | 🇮🇳 Marathi | 🇮🇳 Gujarati | 🇮🇳 Kannada |
| 🇮🇳 Malayalam | 🇮🇳 Odia | 🇮🇳 Assamese | 🇮🇳 Urdu |
| 🇮🇳 Maithili | 🇮🇳 Santali | 🇮🇳 Kashmiri | 🇮🇳 Nepali |
| 🇮🇳 Konkani | 🇮🇳 Sindhi | 🇮🇳 Dogri | 🇮🇳 Manipuri |
| 🇮🇳 Bodo | 🇬🇧 English | | |

</div>

---

## 🗄️ Database Rules

<div align="center">

| Rule | Why |
|:-----|:----|
| ✅ Use migration files for schema changes | Keeps history clean |
| ✅ Use separate local/staging/production DB credentials | Prevents accidental production data loss |
| ✅ Use soft deletes for critical records (`deletedAt`) | Allows safe recovery and audit trails |
| ✅ Always add RLS (Row-Level Security) policies | Protects user data |
| ✅ Reference `profiles` table for user data | Never use `auth.users` directly |
| ✅ Keep roles in `user_roles` table | Prevents privilege escalation |
| ❌ Never put roles on `profiles` table | Security risk! |
| ❌ Never use `db push` in production workflows | Can cause untracked schema drift |

</div>

---

## 🔒 Security Rules

<div align="center">

```
🛡️ SECURITY IS #1 PRIORITY
```

| ✅ DO | ❌ DON'T |
|:------|:---------|
| Use environment variables for secrets | Hardcode API keys in code |
| Add RLS policies to ALL tables | Leave tables unprotected |
| Use `has_role()` function for auth checks | Check roles on the client side |
| Report vulnerabilities via SECURITY.md | Post vulnerabilities publicly |

</div>

> 🔐 Found a security issue? See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## 📚 Knowledge Hub

<div align="center">

> 🎓 **Where is the Knowledge Hub?**

| Role | How to Access |
|:-----|:-------------|
| 🧑‍🌾 **Farmers** | Sidebar → **📚 Knowledge Hub** → `/farmer/knowledge` |
| 👨‍🔬 **Experts** | Sidebar → **📚 Knowledge Hub** → `/expert/knowledge` |

</div>

### What's in the Knowledge Hub?

<div align="center">

| Tab | Content | File Location |
|:----|:--------|:-------------|
| 🎧 **Podcasts** | AI-generated farming audio episodes | `public/knowledge/podcasts/` |
| 🖼️ **Infographics** | Visual farming guides & diagrams | `public/knowledge/infographics/` |
| 📄 **Slides** | Downloadable PDF presentations | `public/knowledge/slides/` |
| 🎬 **Videos** | Educational farming videos | `public/videos/` |

</div>

### Adding New Content

```bash
# Add a new podcast
cp your-podcast.m4a public/knowledge/podcasts/your-podcast-name.m4a

# Add a new infographic  
cp your-infographic.png public/knowledge/infographics/your-infographic.png

# Add a new slide deck
cp your-slides.pdf public/knowledge/slides/your-slides.pdf
```

Then update `src/components/features/KnowledgeHub.tsx` to include your new content in the arrays.

---

## ✅ Pull Request Checklist

Before you submit your PR, make sure:

<div align="center">

| Check | Description |
|:-----:|:------------|
| ☐ | My code follows the project's code style |
| ☐ | I tested my changes locally (`npm run dev`) |
| ☐ | Lint passes (`npm run lint`) |
| ☐ | Tests pass (`npm run test`) |
| ☐ | I added translations for user-facing strings |
| ☐ | I added RLS policies for new database tables |
| ☐ | No API keys or secrets are hardcoded |
| ☐ | I updated docs if needed |
| ☐ | Screenshots added for UI changes |

</div>

> 🔗 Use our [PR Template](.github/PULL_REQUEST_TEMPLATE.md) — it has everything!

---

## 🏗️ Project Structure

<div align="center">

```
farm-intellect-65/
├── 📁 public/                    # Static files (images, audio, videos)
│   ├── 📁 knowledge/             # Knowledge Hub content
│   │   ├── 📁 podcasts/          # 🎧 Audio episodes
│   │   ├── 📁 infographics/      # 🖼️ Visual guides  
│   │   └── 📁 slides/            # 📄 PDF presentations
│   └── 📁 icons/                 # App icons (PWA)
├── 📁 src/
│   ├── 📁 components/            # Reusable UI components
│   │   ├── 📁 ui/                # shadcn/ui base components
│   │   ├── 📁 layout/            # Header, Sidebar, etc.
│   │   ├── 📁 features/          # Feature components (KnowledgeHub, etc.)
│   │   └── 📁 ai/                # AI-powered components
│   ├── 📁 pages/                 # Route pages
│   │   ├── 📁 farmer/            # 🧑‍🌾 Farmer pages
│   │   ├── 📁 expert/            # 👨‍🔬 Expert pages
│   │   ├── 📁 merchant/          # 🏪 Merchant pages
│   │   └── 📁 admin/             # 🔧 Admin pages
│   ├── 📁 contexts/              # React contexts (Auth, Language)
│   ├── 📁 data/                  # Static data (crops, diseases, etc.)
│   ├── 📁 i18n/                  # Translations (22 languages)
│   └── 📁 hooks/                 # Custom React hooks
├── 📁 supabase/                  # Backend config & functions
└── 📁 docs/                      # Documentation
```

</div>

---

## ❓ Need Help?

<div align="center">

| Channel | Link |
|:--------|:-----|
| 💬 **Discussions** | [GitHub Discussions](https://github.com/YOUR_USERNAME/farm-intellect-65/discussions) |
| 🐛 **Bug Reports** | [Create Issue](https://github.com/YOUR_USERNAME/farm-intellect-65/issues/new?template=bug_report.md) |
| 💡 **Feature Ideas** | [Create Issue](https://github.com/YOUR_USERNAME/farm-intellect-65/issues/new?template=feature_request.md) |

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,3,12&height=100&section=footer" width="100%"/>

<p>
  <strong>Every contribution helps Indian farmers. Thank you! 🇮🇳🌾</strong>
</p>

<p>
  <img src="https://img.shields.io/badge/Made_With-❤️-FF9933?style=for-the-badge" />
  <img src="https://img.shields.io/badge/For-Indian_Farmers-138808?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Open-Source-0066CC?style=for-the-badge&logo=github" />
</p>

</div>
