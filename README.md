<div align="center">

# 💰 SmartKhata — AI-Powered Expense & Khata Manager

### India's Smartest Personal Finance Tracker with Telegram Integration

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smartkhata.me-00d68f?style=for-the-badge)](https://smartkhata.me)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-AWS_EC2-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-94%2B_Performance-green?style=for-the-badge)](https://pagespeed.web.dev)

<br />

<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
<img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js" />
<img src="https://img.shields.io/badge/MongoDB-9-47A248?style=flat-square&logo=mongodb" />
<img src="https://img.shields.io/badge/Redis-5-DC382D?style=flat-square&logo=redis" />
<img src="https://img.shields.io/badge/Google_Gemini-2.0-4285F4?style=flat-square&logo=google" />

</div>

---

## 🎯 Overview

**SmartKhata** is a full-stack AI-powered personal finance management application that revolutionizes expense tracking. Instead of tedious manual entries, users can simply send natural language messages in **any global language** — Hindi, English, Hinglish, Tamil, Japanese, and more — and the AI automatically extracts, categorizes, and saves transactions.

### Why SmartKhata?

| Problem | SmartKhata Solution |
|---------|-------------------|
| Manual expense logging is tedious | Chat-based input via Telegram or Web |
| Forgetting to track expenses | Instant Telegram notifications |
| Multiple languages/dialects | AI understands Hindi, Hinglish, English & more |
| Complex Khata management | Automated lending/borrowing tracking |
| No insights on spending | Interactive visual analytics dashboard |

---

## ✨ Key Features

### 🤖 AI-Powered Natural Language Processing
- Understands expenses written in **any language** (Hindi, Tamil, Japanese, etc.)
- Handles typos, slang, voice-to-text errors
- Auto-categorizes transactions into 10 predefined categories
- Processes multiple transactions in a single message
- Smart amount extraction from complex sentences

### 💬 Telegram Bot Integration
- Track expenses directly from Telegram chat
- Secure OTP-based account linking
- Real-time sync with web dashboard
- Interactive inline keyboards for confirmations
- Commands: `/today`, `/summary`, `/balance`, `/parties`

### 📒 Digital Khata Book
- Track money lent ("To Receive") and borrowed ("To Give")
- Person-wise balance management
- Partial payment tracking with history
- Smart party name matching with fuzzy search
- Settlement status tracking (Pending/Partial/Settled)

### 📊 Visual Analytics Dashboard
- Category-wise expense breakdown (Pie Charts)
- Daily/Weekly/Monthly trend analysis (Bar Charts)
- Credit vs Debit comparison
- Time-based filtering
- Interactive data visualization with Recharts

### 🔐 Enterprise-Grade Security
- CSRF Protection with Redis-stored tokens
- JWT Authentication with refresh token rotation
- OTP-based email verification
- NoSQL injection prevention
- Rate limiting & request deduplication
- Secure HTTP-only cookies

### 🔐 Google OAuth Integration
- One-click Google Sign-In via Firebase Auth
- Seamless account linking
- Profile photo sync

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 7 | Build Tool |
| Redux Toolkit | State Management |
| React Router DOM 7 | Client-side Routing |
| TailwindCSS 4 | Styling |
| Recharts | Data Visualization |
| Axios | HTTP Client |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 20+ | Runtime |
| Express 5 | Web Framework |
| MongoDB + Mongoose | Database |
| Redis | Caching & Sessions |
| JWT + Bcrypt | Authentication |
| Zod | Schema Validation |

### AI & Integrations
| Technology | Purpose |
|------------|---------|
| Google Gemini 2.0 | Natural Language Processing |
| OpenRouter API | AI Gateway |
| Telegram Bot API | Messenger Integration |
| Firebase | Google OAuth |
| Mailtrap | Email Services |

### Deployment
| Platform | Purpose |
|----------|---------|
| AWS EC2 | Backend Hosting |
| Vercel | Frontend Hosting |
| MongoDB Atlas | Database |
| Redis Cloud | Session Management |

---

## 🤖 Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Initialize bot, show welcome message |
| `/help` | Show all available commands |
| `/status` | Check account linking status |
| `/today` | Get today's expense summary |
| `/summary` | Get weekly/monthly summary |
| `/balance` | Check khata balance (to give/receive) |
| `/parties` | List all parties with pending amounts |
| `[6-digit OTP]` | Link Telegram account |
| `[Any message]` | AI parses as expense |

### AI Parsing Examples

| Input | Parsed Output |
|-------|---------------|
| "chai 50, auto 80" | 2 expenses: ₹50 Food, ₹80 Transport |
| "Rahul ko 5000 diye" | ₹5000 debit to Rahul |
| "私は400個の食べ物を食べました" | ₹400 Food & Dining |
| "நான் இளவரசருக்கு 600 கொடுத்திருந்தேன்" | ₹600 - Given to Ilavarasan |

---

## 📈 Performance

### Lighthouse Scores
| Metric | Score |
|--------|-------|
| Performance | 94+ |
| Accessibility | 96 |
| Best Practices | 96 |
| SEO | 100 |

---

## 🌐 Live Demo

**Website:** [https://smartkhata.me](https://smartkhata.me)

**Telegram Bot:** [@smart_khata_bot](https://t.me/smart_khata_bot)

---

## 👨‍💻 Author

**Arnav Prajapati**

- GitHub: [@arnavprajapati](https://github.com/arnavprajapati)
- LinkedIn: [Arnav Prajapati](https://www.linkedin.com/in/arnav-prajapati/)

---

<div align="center">

### ⭐ If you found this project useful, please consider giving it a star!

Made with ❤️ in India 🇮🇳

</div>