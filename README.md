🌾 Krishi AI — Farm Intellect

AI-Powered Smart Agriculture Platform for Indian Farmers


📋 Quick Navigation

SectionDescription🎯 Problem & SolutionWhy this app exists✨ FeaturesWhat you can do📸 ScreenshotsSee the app in action🏗️ ArchitectureHow it's built👥 User RolesWho uses what🛠️ Tech StackTechnologies used🚀 Getting StartedRun it yourself📚 Knowledge HubLearning resources🗄️ DatabaseData structure🔒 SecurityHow we protect data📊 DatasetsData sources🗺️ RoadmapWhat's coming next

🎯 The Problem We Solve

┌─────────────────────────────────────────────────────────────────┐
│                    🧑‍🌾 INDIAN FARMER'S DAILY STRUGGLES          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ❌ Which crop to grow?      →  No soil + season guidance      │
│   ❌ Plant looks sick?        →  No instant diagnosis           │
│   ❌ What's the mandi price?  →  Scattered across portals       │
│   ❌ When to sow/harvest?     →  No personalized calendar       │
│   ❌ Which schemes apply?     →  100+ confusing options         │
│   ❌ Language barrier         →  Most apps are English-only     │
│   ❌ No internet in village   →  Apps don't work offline        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                    ✅ KRISHI AI SOLVES EVERYTHING               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🤖 AI Crop Recommender      →  Soil + season + region based   │
│   📸 Disease Scanner          →  Photo → instant diagnosis      │
│   💰 Live Mandi Prices        →  All prices in one place        │
│   📅 Smart Crop Calendar      →  Day-by-day guidance            │
│   🏛️ Scheme Matcher           →  Find what you qualify for      │
│   🌐 22 Languages             →  Use in your mother tongue      │
│   📶 Works Offline            →  No internet? No problem!       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘


✨ Features

🧑‍🌾 For Farmers

🤖 AI-Powered Tools

FeatureDescription💬 Smart ChatbotAsk any farming question in your language📸 Disease ScannerUpload leaf photo → get diagnosis + cure🌾 Crop RecommenderAI suggests best crops for your soil/season🎙️ Voice AssistantSpeak your questions — no typing needed📈 Yield PredictorEstimate harvest based on conditions

📊 Intelligence & Planning

FeatureDescription🌤️ Weather AlertsFarming-specific warnings (rain, frost, heat)💰 Mandi PricesLive market prices with trends📅 Crop CalendarICAR-based sowing/irrigation/harvest schedule🗺️ Field MapVisual field planning with NDVI data🏛️ Scheme WizardCheck eligibility for 100+ govt schemes

👨‍🔬 For Experts  |  🏪 For Merchants  |  🔧 For Admins

👨‍🔬 Agricultural Experts

📋 Consultation queue

📚 Publish articles & guides

🔬 Advanced AI analysis

💬 Direct farmer chat

🏪 Merchants & Traders

📦 Order management

👥 Farmer network

📈 Price analytics

📄 Document handling

🔧 Platform Admins

👥 User management (RBAC)

📊 Platform analytics

📋 Audit logs

⚙️ System settings

🌍 Platform-Wide Capabilities

🌐

22 Languages
Hindi, Punjabi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia, Assamese, Urdu & more

📶

Offline Mode
Works without internet using IndexedDB + Service Worker caching

🌙

Dark/Light Theme
Eye-friendly with Indian tricolor accents

📱

PWA + Mobile
Install like an app or build native APK/IPA

📸 Screenshots

Login ScreenFarmer Dashboard4-role authenticationPersonalized farming hub

🏗️ Architecture

👥 User Roles

RoleIconDashboardKey CapabilitiesFarmer🧑‍🌾Crop status, weather, AI chatFull farming toolkit, scheme matcher, field diaryExpert👨‍🔬Consultation queue, articlesPublish guides, resolve queries, AI analysisMerchant🏪Orders, farmer networkOrder CRUD, market analytics, documentsAdmin🔧Platform analytics, usersRole assignment, audit logs, settings

💡 Security Note: Roles stored in dedicated user_roles table with app_role enum — never on profiles (prevents privilege escalation).

🛠️ Tech Stack

Frontend


React 18
TypeScript 5
Vite 5
Tailwind CSS
shadcn/ui

Backend & Infrastructure


Supabase
PostgreSQL
Vercel
Gemini AI
Capacitor

🚀 Getting Started

⚡ Quick Start (2 minutes)

Clone the repository
git clone https://github.com/your-username/farm-intellect-65.git

Navigate to project
cd farm-intellect-65

Install dependencies
npm install

Start development server
npm run dev

🎉 Open http://localhost:8080 in your browser!

📱 Mobile App Build (Android/iOS)

Add platforms
npx cap add android
npx cap add ios

Build and sync
npm run build
npx cap sync

Open in IDE
npx cap open android    # → Android Studio
npx cap open ios        # → Xcode (Mac only)

📦 Build APK: Android Studio → Build → Build Bundle/APK → Build APK

🌐 PWA Installation

PlatformStepsAndroidChrome → Menu (⋮) → "Add to Home Screen"iOSSafari → Share (📤) → "Add to Home Screen"DesktopClick install icon in address bar

📚 Knowledge Hub

🎓 Your Learning Center — Podcasts, Videos, Infographics, and Slides

Content TypeDescriptionLocation🎧 PodcastsAI-generated audio episodes about farming/farmer/knowledge → Podcasts tab🖼️ InfographicsVisual guides and diagrams/farmer/knowledge → Infographics tab📄 SlidesDownloadable PDF presentations/farmer/knowledge → Slides tab🎬 VideosEducational farming videos/farmer/knowledge → Videos tab

Direct Access: farm-intellect-65.lovable.app/farmer/knowledge

🗄️ Database Schema

📋 Table Details

TablePurposeRLSprofilesUser profiles linked to auth✅user_rolesRBAC roles (farmer/expert/merchant/admin)✅crop_plansFarmer crop planning✅field_eventsField history timeline✅user_tasksTask/reminder management✅scheme_matchesGovernment scheme eligibility✅consultationsExpert-farmer consultations✅ordersMerchant-farmer orders✅knowledge_articlesExpert-published articles✅notificationsSystem notifications✅activity_logAudit trail✅admin_settingsPlatform configuration✅

🔒 Security

LayerImplementation🔐 AuthenticationSupabase Auth with email verification👥 Authorization4-role RBAC via user_roles + has_role() security definer🛡️ Data ProtectionRow-Level Security on all 12 tables🔑 API SecurityJWT verification on Edge Functions✅ Input ValidationZod schemas + server-side validation🚫 Password SafetyHIBP leaked password check (configurable)🔒 Cross-Role ProtectionFarmers can't access admin routes; merchants can't access expert data

📊 Datasets & Knowledge Base

📚 All data from verified Indian government and research sources

DatasetSourceRecords🦠 Crop DiseasesICAR, CABI50+ diseases🐛 Pest DatabaseNCIPM, IPM guides40+ pests📅 Crop CalendarICAR-CRIDA15+ crops💰 Mandi PricesAgmarknetReal-time📞 Kisan Call CentreKCC transcripts100+ FAQs🌱 Soil HealthSoil Health CardReference params🛰️ Satellite/NDVISentinel HubVegetation thresholds

🗺️ Roadmap

StatusFeature✅4-role RBAC with Supabase Auth✅AI Chatbot with Kisan Call Centre knowledge✅Crop Disease Scanner✅22-language support✅PWA with offline caching✅Native mobile via Capacitor✅Expert Knowledge Hub (CRUD)✅Knowledge Hub (Podcasts, Videos, Infographics, Slides)✅IndexedDB offline sync🔜Push notifications via FCM🔜Drone/IoT sensor integration🔜Blockchain crop traceability🔜WhatsApp bot integration🔜Regional weather SMS alerts

⭐ Support This Project

No money needed! Just give us a ⭐ star — it helps Indian farmers discover this free tool!

Why star?

🔍 Helps other farmers & developers find this project

📈 Shows the community believes in digital agriculture

💚 Motivates continued development — 100% free forever

🤝 Contributing

We welcome contributions! See our detailed CONTRIBUTING.md guide.

🍴 Fork the repository

🌿 Create feature branch (git checkout -b feature/amazing-feature)

💾 Commit changes (git commit -m 'Add amazing feature')

📤 Push to branch (git push origin feature/amazing-feature)

🔄 Open Pull Request

📄 License

© 2025 Samrudh. All Rights Reserved.

This project is created for educational and agricultural empowerment purposes.

Made with ❤️ for Indian Farmers 🌾🇮🇳

 Contributor Covenant Code of Conduct
Our Pledge
We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

Our Standards
Examples of behavior that contributes to a positive environment:

Using welcoming and inclusive language
Being respectful of differing viewpoints and experiences
Gracefully accepting constructive criticism
Focusing on what is best for the community
Showing empathy towards other community members
Respecting the agricultural knowledge and practices of farmers from all regions
Examples of unacceptable behavior:

The use of sexualized language or imagery, and sexual attention or advances of any kind
Trolling, insulting or derogatory comments, and personal or political attacks
Public or private harassment
Publishing others' private information without explicit permission
Other conduct which could reasonably be considered inappropriate in a professional setting
Enforcement Responsibilities
Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

Scope
This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces.

Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at conduct@farmintellect.app.

All complaints will be reviewed and investigated promptly and fairly. All community leaders are obligated to respect the privacy and security of the reporter of any incident.

Attribution
This Code of Conduct is adapted from the Contributor Covenant, version 2.1.

Building technology for Indian agriculture — together. 🌾🤝Krishi AI Logo
🤝 Contributing to Krishi AI — Farm Intellect
Typing SVG

PRs Welcome First Timers License

   


🎉 Welcome!
Thank you for wanting to help! Whether you're a student, a professional developer, or someone who just loves farming — everyone is welcome here!

💡 What is this project? Krishi AI is a free app that helps Indian farmers get crop advice, detect plant diseases, check market prices, and more — in 22 Indian languages!

📋 Table of Contents
Section	What You'll Learn
🚀 Getting Started	How to set up the project on your computer
🐛 Report a Bug	How to tell us about problems
💡 Suggest a Feature	How to share your ideas
💻 Write Code	Step-by-step guide to contribute code
📝 Commit Rules	How to write good commit messages
🎨 Code Style	Our coding rules (simple!)
🌍 Translations	Help translate to Indian languages
🗄️ Database Rules	Rules for database changes
🔒 Security Rules	Keep the app safe
📚 Knowledge Hub	Where learning content lives
✅ PR Checklist	Final checks before submitting
🚀 Getting Started
📦 What You Need
├── 🟢 Node.js 18 or newer
├── 📦 npm or bun (package manager)  
└── 🔀 Git (version control)
Step-by-Step Setup
Step 1: Fork the repo on GitHub (click "Fork" button on top-right)

Step 2: Clone YOUR fork to your computer
git clone https://github.com/YOUR_USERNAME/farm-intellect-65.git

Step 3: Go into the project folder
cd farm-intellect-65

Step 4: Install all the packages
npm install

Step 5: Create your environment file
cp .env.example .env
📝 Open .env and fill in: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID

Step 6: Start the app!
npm run dev
🎉 Done! Open http://localhost:8080 in your browser and you'll see the app!

🐛 Found a Bug? Report It!
Step	What to Do
1️⃣	Go to Issues → New Issue → Choose Bug Report
2️⃣	Tell us: What happened? What did you expect?
3️⃣	Share: Your browser, OS, and steps to reproduce
4️⃣	Add screenshots if possible 📸
🔗 Use our Bug Report template — it guides you through it!

💡 Have an Idea? Suggest It!
Step	What to Do
1️⃣	Go to Issues → New Issue → Choose Feature Request
2️⃣	Explain: What's the feature? Who benefits?
3️⃣	Bonus: How does it help Indian farmers? 🧑‍🌾
🔗 Use our Feature Request template

💻 Writing Code
The 6-Step Process
🍴 Fork  →  🌿 Branch  →  ✏️ Code  →  🧪 Test  →  💾 Commit  →  🔄 PR
1. Make sure you're on the main branch
git checkout main
git pull origin main

2. Create a new branch for your work
git checkout -b feature/your-feature-name
Examples:
git checkout -b feature/hindi-voice-assistant
git checkout -b fix/crop-calendar-date-bug
git checkout -b docs/update-readme

3. Make your changes (write code, fix bugs, etc.)

4. Test your changes
npm run test        # Run tests
npm run lint        # Check code style

5. Commit your changes (see commit rules below)
git add .
git commit -m "feat: add wheat disease detection for Punjab region"

6. Push and create a Pull Request
git push origin feature/your-feature-name
Then go to GitHub and click "Create Pull Request"
📝 Commit Message Rules
We use Conventional Commits — it's a simple system:

Prefix	When to Use	Example
feat:	✨ New feature	feat: add voice input for Tamil language
fix:	🐛 Bug fix	fix: crop calendar shows wrong dates
docs:	📖 Documentation	docs: add Hindi translation guide
style:	🎨 Formatting only	style: fix button alignment on mobile
refactor:	♻️ Code cleanup	refactor: simplify weather API calls
test:	🧪 Adding tests	test: add unit tests for login flow
chore:	🔧 Build/CI stuff	chore: update dependencies
✅ Good Commit Messages
feat: add crop rotation optimizer for Punjab region
fix: mandi price not loading for Gujarat markets  
docs: add screenshot of farmer dashboard
❌ Bad Commit Messages
fixed stuff
update
changes
asdfgh
🎨 Code Style Guide
Rule	Details
📘 Language	TypeScript (strict mode, no any types)
⚛️ Components	React functional components with hooks
🎨 Styling	Tailwind CSS with semantic design tokens from index.css
📁 Naming	PascalCase for components, camelCase for functions
📦 Imports	Use @/ path aliases (e.g., @/components/ui/button)
🧩 Size	Small, focused, reusable components
🚫 Colors	NEVER use raw colors like text-white — use tokens like text-foreground
Example: Good Component
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
    


      

{cropName}


      

{season}


      {t('common.view_details')}
    


  );
};
🌍 Adding Translations
We support 22 Indian languages! When you add text that users will see:

📁 src/i18n/translations.ts  ←  All translations live here
Steps:
Add English string to translations.ts
Add Hindi translation (minimum requirement)
Add Punjabi translation (recommended)
Use in component:
const { t } = useLanguage();
return 

{t('your.new.key')}

;
Supported Languages
🇮🇳 Hindi	🇮🇳 Punjabi	🇮🇳 Tamil	🇮🇳 Telugu
🇮🇳 Bengali	🇮🇳 Marathi	🇮🇳 Gujarati	🇮🇳 Kannada
🇮🇳 Malayalam	🇮🇳 Odia	🇮🇳 Assamese	🇮🇳 Urdu
🇮🇳 Maithili	🇮🇳 Santali	🇮🇳 Kashmiri	🇮🇳 Nepali
🇮🇳 Konkani	🇮🇳 Sindhi	🇮🇳 Dogri	🇮🇳 Manipuri
🇮🇳 Bodo	🇬🇧 English		
🗄️ Database Rules
Rule	Why
✅ Use migration files for schema changes	Keeps history clean
✅ Always add RLS (Row-Level Security) policies	Protects user data
✅ Reference profiles table for user data	Never use auth.users directly
✅ Keep roles in user_roles table	Prevents privilege escalation
❌ Never put roles on profiles table	Security risk!
🔒 Security Rules
🛡️ SECURITY IS #1 PRIORITY
✅ DO	❌ DON'T
Use environment variables for secrets	Hardcode API keys in code
Add RLS policies to ALL tables	Leave tables unprotected
Use has_role() function for auth checks	Check roles on the client side
Report vulnerabilities via SECURITY.md	Post vulnerabilities publicly
🔐 Found a security issue? See SECURITY.md for responsible disclosure.

📚 Knowledge Hub
🎓 Where is the Knowledge Hub?

Role	How to Access
🧑‍🌾 Farmers	Sidebar → 📚 Knowledge Hub → /farmer/knowledge
👨‍🔬 Experts	Sidebar → 📚 Knowledge Hub → /expert/knowledge
What's in the Knowledge Hub?
Tab	Content	File Location
🎧 Podcasts	AI-generated farming audio episodes	public/knowledge/podcasts/
🖼️ Infographics	Visual farming guides & diagrams	public/knowledge/infographics/
📄 Slides	Downloadable PDF presentations	public/knowledge/slides/
🎬 Videos	Educational farming videos	public/videos/
Adding New Content
Add a new podcast
cp your-podcast.m4a public/knowledge/podcasts/your-podcast-name.m4a

Add a new infographic  
cp your-infographic.png public/knowledge/infographics/your-infographic.png

Add a new slide deck
cp your-slides.pdf public/knowledge/slides/your-slides.pdf
Then update src/components/features/KnowledgeHub.tsx to include your new content in the arrays.

✅ Pull Request Checklist
Before you submit your PR, make sure:

Check	Description
☐	My code follows the project's code style
☐	I tested my changes locally (npm run dev)
☐	Lint passes (npm run lint)
☐	Tests pass (npm run test)
☐	I added translations for user-facing strings
☐	I added RLS policies for new database tables
☐	No API keys or secrets are hardcoded
☐	I updated docs if needed
☐	Screenshots added for UI changes
🔗 Use our PR Template — it has everything!

🏗️ Project Structure
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
❓ Need Help?
Channel	Link
💬 Discussions	GitHub Discussions
🐛 Bug Reports	Create Issue
💡 Feature Ideas	Create Issue

Every contribution helps Indian farmers. Thank you! 🇮🇳🌾

  Proprietary Software License
============================

Copyright (c) 2025 Samrudh. All Rights Reserved.

Project: Krishi AI — Farm Intellect
      AI-Powered Smart Agriculture Platform for Indian Farmers

================================================================================
                          TERMS AND CONDITIONS
================================================================================

1. DEFINITIONS

   "Software" means the entirety of the Krishi AI — Farm Intellect project,
   including but not limited to all source code, object code, compiled binaries,
   documentation, images, icons, audio files, datasets, database schemas,
   configuration files, design assets, user interface designs, algorithms,
   AI models, prompts, training data, and any other materials contained within
   this repository or distributed alongside it.

   "Author" means Samrudh, the original creator and sole copyright holder of
   the Software.

   "You" (or "Your") means any individual or legal entity exercising
   permissions under this License.

2. COPYRIGHT OWNERSHIP

   The Software is the exclusive intellectual property of the Author. All
   rights, title, and interest in and to the Software, including all
   intellectual property rights therein, are and shall remain the exclusive
   property of the Author.

   No transfer of ownership is implied or granted by this License.

3. RESTRICTIONS

   Unless expressly authorized in writing by the Author, You may NOT:

   a) COPY — Reproduce, duplicate, or make copies of any part of the Software,
      whether in whole or in part, in any medium or format.

   b) MODIFY — Alter, adapt, translate, reverse engineer, decompile,
      disassemble, or create derivative works based on the Software or any
      part thereof.

   c) DISTRIBUTE — Publish, distribute, sublicense, sell, rent, lease, lend,
      or otherwise transfer the Software or any part thereof to any third
      party, whether for commercial or non-commercial purposes.

   d) PUBLIC DISPLAY — Publicly display, publicly perform, broadcast, or
      transmit the Software or any part thereof.

   e) COMMERCIAL USE — Use the Software, or any part thereof, for any
      commercial purpose, including but not limited to incorporating it into
      commercial products or services.

   f) CLAIM AUTHORSHIP — Represent, imply, or claim ownership, authorship,
      or co-authorship of the Software or any part thereof.

   g) REMOVE NOTICES — Remove, alter, or obscure any copyright notices,
      license information, attribution, or proprietary markings contained
      in or on the Software.

   h) DATA EXTRACTION — Extract, scrape, harvest, or mine any datasets,
      knowledge bases, agricultural data, or AI training data contained
      within the Software.

4. VIEWING PERMISSION

   This repository is made publicly visible for DEMONSTRATION AND PORTFOLIO
   PURPOSES ONLY. Public visibility does NOT constitute a grant of any rights
   to use, copy, modify, distribute, or create derivative works from the
   Software. Viewing the source code is permitted solely for the purpose of
   evaluating the Author's work.

5. PERMITTED USE (WITH WRITTEN AUTHORIZATION ONLY)

   Any use of the Software beyond viewing requires prior, explicit, written
   authorization from the Author. Requests for authorization may be directed
   to the Author through the contact information provided in this repository.

   Authorized use, if granted, will be subject to additional terms and
   conditions specified in a separate written agreement.

6. AGRICULTURAL DATASETS & KNOWLEDGE BASE

   The curated agricultural datasets included in this Software (crop disease
   data, pest databases, Kisan Call Centre knowledge, ICAR crop calendars,
   mandi price references, soil health parameters, satellite/NDVI data, and
   crop production statistics) are compiled and curated by the Author.

   While certain source data may originate from public government databases,
   the specific compilation, curation, formatting, and integration of these
   datasets within this Software is the intellectual property of the Author
   and is subject to the same restrictions as the rest of the Software.

7. AI MODELS & PROMPTS

   All AI prompts, model configurations, fine-tuning data, system messages,
   and AI-related intellectual property within this Software are proprietary
   and may not be extracted, reproduced, or used in any other project or
   product without written authorization.

8. TRADEMARKS

   "Krishi AI", "Farm Intellect", "KrishiSarthi", and associated logos,
   icons, and branding materials are trademarks of the Author. No right to
   use these trademarks is granted by this License.

9. NO WARRANTY

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
   OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.

10. LIMITATION OF LIABILITY

    IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING
    FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.

11. INDEMNIFICATION

    You agree to indemnify, defend, and hold harmless the Author from and
    against any and all claims, damages, losses, liabilities, costs, and
    expenses (including reasonable attorneys' fees) arising from Your
    unauthorized use of the Software.

12. TERMINATION

    Any rights granted under this License (if any) will terminate
    automatically and without notice if You fail to comply with any term
    of this License. Upon termination, You must immediately cease all use
    of the Software and destroy all copies in Your possession.

13. GOVERNING LAW

    This License shall be governed by and construed in accordance with the
    laws of India. Any disputes arising under or in connection with this
    License shall be subject to the exclusive jurisdiction of the courts
    of India.

14. SEVERABILITY

    If any provision of this License is held to be unenforceable or invalid,
    such provision will be modified to the minimum extent necessary to make
    it enforceable, and the remaining provisions will continue in full force
    and effect.

15. ENTIRE AGREEMENT

    This License constitutes the entire agreement between You and the Author
    regarding the Software and supersedes all prior negotiations,
    representations, or agreements relating to the Software.

================================================================================
                           CONTACT INFORMATION
================================================================================

For licensing inquiries, permissions, or authorized use requests:

   Author:    Samrudh
   Project:   Krishi AI — Farm Intellect
   GitHub:    https://github.com/samrudh

================================================================================

© 2025 Samrudh. All Rights Reserved.
Unauthorized copying, modification, distribution, or use of this Software,
via any medium, is strictly prohibited.Security Policy
Supported Versions
Version	Supported
1.x (latest)	✅ Yes
< 1.0	❌ No
Reporting a Vulnerability
We take security seriously at Krishi AI — Farm Intellect. If you discover a security vulnerability, please report it responsibly.

🔒 How to Report
DO NOT open a public GitHub issue for security vulnerabilities.

Instead, please email: security@farmintellect.app (or open a private security advisory on GitHub)

What to Include
Description of the vulnerability
Steps to reproduce the issue
Impact assessment — what could an attacker do?
Suggested fix (if you have one)
Response Timeline
Action	Timeline
Acknowledgment	Within 48 hours
Initial assessment	Within 5 business days
Fix deployed	Within 14 business days (critical)
Public disclosure	After fix is deployed
Security Measures in Place
Authentication & Authorization
✅ Supabase Auth with email verification
✅ 4-role RBAC via dedicated user_roles table
✅ has_role() security definer function (prevents recursive RLS)
✅ Admin role assignment only via admin_assign_role() (server-side only)
✅ New users always default to farmer role — no self-promotion
✅ Cross-role login blocking (farmer can't access merchant routes)
Data Protection
✅ Row-Level Security (RLS) on all 12 database tables
✅ Users can only read/write their own data
✅ Admins have controlled read access via RLS policies
✅ No PII stored in localStorage
✅ JWT verification on all Edge Functions
API Security
✅ Private API keys stored as backend secrets (never in code)
✅ Edge Functions validate JWT tokens
✅ CORS configured for production domains
✅ Rate limiting on sensitive endpoints
Password Security
✅ Email verification required before sign-in
✅ HIBP (Have I Been Pwned) leaked password check (configurable)
✅ No anonymous sign-ups
Infrastructure
✅ HTTPS enforced on all deployments
✅ Immutable asset caching (1 year) via Vercel
✅ Service Worker excludes API/AI requests from caching
✅ Dependabot enabled for dependency vulnerability alerts
Scope
The following are in scope for vulnerability reports:

Authentication bypass
Privilege escalation (e.g., farmer → admin)
SQL injection or RLS bypass
Cross-site scripting (XSS)
Sensitive data exposure
API key leakage
CSRF attacks
The following are out of scope:

Social engineering
Denial of service (DoS)
Issues in third-party dependencies (report to upstream)
Issues requiring physical access to a user's device
Recognition
We gratefully acknowledge security researchers who report vulnerabilities responsibly. With your permission, we'll list you in our security hall of fame.

Thank you for helping keep Indian farmers' data safe. 🔒🇮🇳like.these.but.for.my.project.explore.repo,all.files,project.deeply.and.prepare.N.and.give.me.i,will.paste.each.
