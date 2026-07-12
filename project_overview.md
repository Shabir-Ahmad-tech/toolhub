# ToolHub Exhaustive Project Specification & Developer Guide

Welcome to the **ToolHub Specification Manual**. This document is a complete technical specification detailing the layout, wireframe, design patterns, mobile-native mechanics, local database structures, analytics schemas, and tool catalog of the **ToolHub** platform. It is formatted for seamless injection into other AI systems for review, suggestions, or optimization.

---

## 1. Project Overview & Architecture
ToolHub is a local-first, in-browser suite of online utilities and developer sandboxes. It prioritizes private, zero-upload processing, high-fidelity responsive layouts, and transparent pricing strategies.

### A. Directory Structure & Code Routing
The project is built on **Next.js 16.2 (App Router)** and **Tailwind CSS v4** using **TypeScript**. Pages are structured in a split-pattern:
* **Server Page (`src/app/[slug]/page.tsx`)**: Handles SEO, meta-data tags, and OpenGraph descriptors. This ensures search engines index each tool individually with clean titles.
* **Client Implementation (`src/app/[slug]/_client.tsx`)**: Contains state bindings, React hooks, local events, and file computations.
* **Wrapper Component (`src/components/tools/ToolLayout.tsx`)**: Packages the layout with dynamic navigation, breadcrumbs, JSON-LD search schema injection, and page wrappers.

### B. Styling Guidelines (mrfreetools-Inspired)
* **Glassmorphic Hero Section**: Modern search input with gradient glowing borders and blur filters.
* **Role Chooser Grid ("What's Your Skill?")**: Direct filters that restrict visible category boxes based on selected role (Developer, Designer, Writer, Student, Business, Utility).
* **Direct Grids**: Category groups display their tools directly inside a responsive grid on-page, avoiding accordion expansion delays.
* **Color System**: Curated color tags mapped in `constants.ts` (e.g. green for finance, blue for developer tools, purple for image tools).

### C. Mobile Native App Optimization
To make ToolHub feel like a native app on mobile:
* **Horizontal Swipe Tracks**: Mobile viewports display category navigation chips in a horizontally scrollable chip track.
* **Segment Controls**: Checkbox switches are replaced by segmented pill panels (`[ Option A ] [ Option B ]`) with slide-active selectors.
* **Minimal Padding**: Reduces margins on smaller viewports, pushing textareas and work canvasses full-screen.
* **Touch Targets**: Standardizes touch actions to a minimum `44px x 44px` height with a tactile `active:scale-95` scale animation.
* **Select-None Protection**: Disables text highlight triggers on interactive buttons (`select-none`).

---

## 2. Core Data Structures & Storage Schema

### A. Anonymous Analytics tracking (`POST /api/track`)
Fires when any tool component mounts.
* **Endpoint**: `/api/track`
* **Request Payload**: `{ tool: string }` (Slug identifier)
* **Server Output**: Logs usage tracking to standard output / database:
  `[Tool Usage] <slug> — <ISO-Timestamp>`

### B. Notepad Storage (`localStorage: toolhub-notepad-text`)
Simple string storage buffer updated on debounced keystrokes.
* Key: `toolhub-notepad-text`
* Value: `string`

### C. Habits Storage (`localStorage: toolhub-habits`)
Track checklist streaks.
* Key: `toolhub-habits`
* Format:
  ```typescript
  interface Habit {
    id: string
    name: string
    color: string // Preset color reference
    checks: Record<string, boolean> // Dates marked checked: {"2026-07-09": true}
  }
  type HabitStore = Habit[]
  ```

### D. Revision Flashcards (`localStorage: toolhub-flashcards`)
Saves study decks.
* Key: `toolhub-flashcards`
* Format:
  ```typescript
  interface Card {
    question: string
    answer: string
  }
  interface Deck {
    id: string
    name: string
    cards: Card[]
  }
  type DeckStore = Deck[]
  ```

---

## 3. Exhaustive Tool Catalog

Here is the complete catalog of **every single one of the 130 tools** defined in ToolHub:

### 📁 Category: Finance & Money (`category: 'finance'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Salary Calculator** | `salary-calculator` | **Active (Live)** 🟢 | Calculate your take-home pay after tax | Save history, compare multiple salaries |
| **Income Tax Calculator** | `income-tax-calculator` | **Active (Live)** 🟢 | Calculate your income tax liability | Year-round tracking, form export |
| **Profit Calculator** | `profit-calculator` | **Active (Live)** 🟢 | Calculate profit margin and markup | Multi-product, export CSV |
| **EMI Calculator** | `emi-calculator` | **Active (Live)** 🟢 | Calculate your monthly loan EMI | Compare 3 loans side-by-side |
| **Gold Price Calculator** | `gold-price-calculator` | **Active (Live)** 🟢 | Calculate gold price today | Live price alerts, purity calculator |
| **Zakat Calculator** | `zakat-calculator` | **Active (Live)** 🟢 | Calculate your Zakat obligation | Save annual zakat records |
| **Discount Calculator** | `discount-calculator` | **Active (Live)** 🟢 | Calculate savings from discounts | Bulk discount comparison |
| **Freelancer Rate Calculator** | `freelancer-rate-calculator` | **Active (Live)** 🟢 | Set your ideal freelance hourly rate | Client proposal generator |
| **Inflation Calculator** | `inflation-calculator` | **Active (Live)** 🟢 | See how inflation affects your money | Year-by-year breakdown |
| **Loan Calculator** | `loan-calculator` | **Active (Live)** 🟢 | Plan your loan payments | Amortization schedule export |
| **Savings Goal Calculator** | `savings-goal-calculator` | **Active (Live)** 🟢 | Plan your savings goals | Track progress, email reminders |
| **Sales Tax Calculator** | `sales-tax-calculator` | **Active (Live)** 🟢 | Calculate sales tax on purchases | Bulk calculation, export |
| **Tip Calculator** | `tip-calculator` | **Active (Live)** 🟢 | Calculate tip and split bills | Split bill, restaurant logging |
| **Compound Interest Calculator** | `compound-interest-calculator` | **Active (Live)** 🟢 | Calculate compound interest growth | Monthly deposit, chart, export |
| **Budget Calculator** | `budget-calculator` | **Active (Live)** 🟢 | Plan your monthly budget | Category tracking, export reports |
| **Retirement Calculator** | `retirement-calculator` | **Active (Live)** 🟢 | Plan your retirement savings | Social security, inflation adjusted |
| **SIP Calculator** | `sip-calculator` | **Active (Live)** 🟢 | Calculate SIP investment returns | Step-up SIP, comparison chart |
| **VAT Calculator** | `vat-calculator` | **Active (Live)** 🟢 | Calculate VAT on purchases | Multi-rate, bulk calculation |
| **Mortgage Affordability Calculator** | `mortgage-affordability-calculator` | **Active (Live)** 🟢 | See how much mortgage you can afford | Pre-qualification report, comparison |
| **Net Worth Calculator** | `net-worth-calculator` | **Active (Live)** 🟢 | Calculate your net worth | Asset tracking, trends, export |

### 📁 Category: Education & Academic (`category: 'education'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **CGPA Calculator** | `cgpa-calculator` | **Active (Live)** 🟢 | Calculate your university CGPA | Semester planning, what-if scenarios |
| **Marks Calculator** | `marks-calculator` | **Active (Live)** 🟢 | Calculate your exam marks and percentage | Grade predictor, percentage calc |
| **GPA Calculator** | `gpa-calculator` | **Active (Live)** 🟢 | Calculate your semester GPA | Course planning, degree tracking |
| **Grade Calculator** | `grade-calculator` | **Active (Live)** 🟢 | Find out what grade you need on your final | Final grade needed calculator |
| **Unit Converter** | `unit-converter` | **Active (Live)** 🟢 | Convert between measurement units | Custom units, batch convert |
| **Attendance Calculator** | `attendance-calculator` | **Active (Live)** 🟢 | Calculate your attendance percentage | Predict future attendance needed |
| **Exam Score Calculator** | `exam-score-calculator` | **Active (Live)** 🟢 | Calculate needed exam score | Multi-exam planning |
| **Flashcard Generator** | `flashcard-generator` | **Active (Live)** 🟢 | Create and study flashcards online | Unlimited cards per deck, spaced repetition, export |

### 📁 Category: Career & Freelance (`category: 'career'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Invoice Generator** | `invoice-generator` | **Active (Live)** 🟢 | Create professional invoices free | Unlimited, branded templates, auto-send |
| **CV Builder** | `cv-builder` | **Active (Live)** 🟢 | Build professional CV online | ATS optimization, multiple templates |
| **Notice Period Calculator** | `notice-period-calculator` | **Active (Live)** 🟢 | Calculate notice period end date | Reminder, email notification |
| **Resume Score Checker** | `resume-score-checker` | **Active (Live)** 🟢 | Check your resume quality score | Detailed analysis, keyword suggestions |
| **Freelance Tax Calculator** | `freelance-tax-calculator` | **Active (Live)** 🟢 | Calculate freelance income tax | FBR form generation, yearly tracking |
| **Salary Converter** | `salary-converter` | **Active (Live)** 🟢 | Convert hourly to annual salary | Multiple offers comparison |
| **Freelance Budget Calculator** | `freelance-budget-calculator` | **Active (Live)** 🟢 | Plan your freelance business budget | Tax set-aside, expense tracking |
| **Business Name Generator** | `business-name-generator` | **Active (Live)** 🟢 | Generate creative business name ideas | Domain availability check, 100+ names per query |

### 📁 Category: Health & Fitness (`category: 'health'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **BMI Calculator** | `bmi-calculator` | **Active (Live)** 🟢 | Calculate your BMI and health category | History tracking, goal setting |
| **BMR Calculator** | `bmr-calculator` | **Active (Live)** 🟢 | Calculate your daily calorie needs | Calorie planning, meal logging |
| **Calorie Calculator** | `calorie-calculator` | **Active (Live)** 🟢 | Calculate daily calorie needs | Daily log, weekly report |
| **Pregnancy Due Date Calculator** | `pregnancy-due-date` | **Active (Live)** 🟢 | Calculate pregnancy due date | Weekly tracking, milestones |
| **Water Intake Calculator** | `water-intake-calculator` | **Active (Live)** 🟢 | Calculate your daily water needs | Daily reminders, history |
| **Sleep Calculator** | `sleep-calculator` | **Active (Live)** 🟢 | Calculate optimal sleep schedule | Sleep schedule, alarm suggestion |
| **Ideal Weight Calculator** | `ideal-weight-calculator` | **Active (Live)** 🟢 | Find your ideal body weight | Progress tracking, goal setting |
| **Pace Calculator** | `pace-calculator` | **Active (Live)** 🟢 | Calculate running pace and speed | Training plans, pace history |
| **Body Fat Calculator** | `body-fat-calculator` | **Active (Live)** 🟢 | Estimate your body fat percentage | Progress tracking, body measurements |
| **Ovulation Calculator** | `ovulation-calculator` | **Active (Live)** 🟢 | Calculate ovulation and fertile days | Cycle tracking, reminders, export |
| **Marathon Pace Calculator** | `marathon-pace-calculator` | **Active (Live)** 🟢 | Calculate race pace for marathons | Training plans, splits, history |

### 📁 Category: Real Estate & Property (`category: 'real-estate'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Mortgage Calculator** | `mortgage-calculator` | **Active (Live)** 🟢 | Calculate home loan payments | Comparison, affordability check |
| **Construction Cost Calculator** | `construction-cost-calculator` | **Active (Live)** 🟢 | Estimate construction costs | Material listing, contractor quote |
| **Property Tax Calculator** | `property-tax-calculator` | **Active (Live)** 🟢 | Calculate property tax | FBR integration, payment reminder |
| **Rent vs Buy Calculator** | `rent-vs-buy-calculator` | **Active (Live)** 🟢 | Compare renting vs buying a home | Detailed reports, comparison charts |

### 📁 Category: Calculators (`category: 'calculators'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Percentage Calculator** | `percentage-calculator` | **Active (Live)** 🟢 | Calculate percentages instantly | All-in-one percentage suite |
| **Scientific Calculator** | `scientific-calculator` | **Active (Live)** 🟢 | Advanced scientific calculator online | History, equation storage |
| **Fraction Calculator** | `fraction-calculator` | **Active (Live)** 🟢 | Calculate fractions online | Step-by-step, mixed numbers, chart |
| **Ratio Calculator** | `ratio-calculator` | **Active (Live)** 🟢 | Calculate ratios and proportions | Aspect ratio, scaling, batch calc |
| **Split the Bill Calculator** | `split-the-bill` | **Active (Live)** 🟢 | Split bills and expenses between friends | Itemized split, unequal shares, save & share |

### 📁 Category: Image & Design Tools (`category: 'image-tools'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Color Picker** | `color-picker` | **Active (Live)** 🟢 | Pick colors and get color codes | Palette generator, export |
| **Image Resizer** | `image-resizer` | **Active (Live)** 🟢 | Resize images online free | Batch resize, format conversion |
| **Image Compressor** | `image-compressor` | **Active (Live)** 🟢 | Compress images for web | Batch compress, WebP output |
| **PNG to JPG Converter** | `png-to-jpg` | **Active (Live)** 🟢 | Convert PNG to JPG online | Batch convert, quality control |
| **Image Cropper** | `image-cropper` | **Active (Live)** 🟢 | Crop images for social media | Batch crop, preset sizes |
| **Color Contrast Checker** | `color-contrast-checker` | **Active (Live)** 🟢 | Check WCAG color contrast | Color suggestions, palette analysis |
| **Gradient Generator** | `gradient-generator` | **Active (Live)** 🟢 | Create CSS gradients online | Save gradients, export CSS/SVG |
| **Aspect Ratio Calculator** | `aspect-ratio-calculator` | **Active (Live)** 🟢 | Calculate image/video aspect ratios | Preset ratios, batch calc, export |
| **Image Vectorizer** | `image-vectorizer` | **Active (Live)** 🟢 | Convert images to SVG vectors | Batch convert, high resolution, color control |
| **Image Background Remover** | `image-background-remover` | **Active (Live)** 🟢 | Remove photo background for free | High-res export, batch removal, custom background color |
| **Color Palette Generator** | `color-palette-generator` | **Active (Live)** 🟢 | Generate harmonious color palettes | Extract palette from image, export to Figma/CSS |

### 📁 Category: Text Tools (`category: 'text-tools'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Word Counter** | `word-counter` | **Active (Live)** 🟢 | Count words and characters online | Plagiarism check, API access |
| **Lorem Ipsum Generator** | `lorem-ipsum-generator` | **Active (Live)** 🟢 | Generate placeholder text | Custom word count, HTML output |
| **Case Converter** | `case-converter` | **Active (Live)** 🟢 | Convert text case online | Save history, batch convert |
| **Character Counter** | `character-counter` | **Active (Live)** 🟢 | Count characters and words | Keyword density, readability score |
| **Reverse Text Generator** | `reverse-text` | **Active (Live)** 🟢 | Reverse text and words online | Multiple reverse modes, save history |
| **Fancy Text Generator** | `fancy-text-generator` | **Active (Live)** 🟢 | Generate fancy text styles | More fonts, save favorites |
| **Text Repeater** | `text-repeater` | **Active (Live)** 🟢 | Repeat text multiple times | Numbered repeats, save presets |
| **Upside Down Text Generator** | `upside-down-text` | **Active (Live)** 🟢 | Turn text upside down | More text styles, save favorites |
| **HTML Entity Encoder/Decoder** | `html-entity-encoder` | **Active (Live)** 🟢 | Encode/decode HTML entities | All entities, batch processing |
| **Text to Speech** | `text-to-speech` | **Active (Live)** 🟢 | Convert text to audio with browser TTS | Download audio, unlimited length, premium voices |
| **Emoji Picker** | `emoji-picker` | **Active (Live)** 🟢 | Browse and copy emojis by category | Favorites, emoji combos, copy as HTML entity |
| **Anagram Solver** | `anagram-solver` | **Active (Live)** 🟢 | Find all anagrams of any word | Extended dictionary, multi-word anagrams |
| **Reading Time Calculator** | `reading-time-calculator` | **Active (Live)** 🟢 | Estimate how long your content takes to read | Custom reading speed, blog post analyzer, export |

### 📁 Category: Developer Tools (`category: 'developer-tools'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Password Generator** | `password-generator` | **Active (Live)** 🟢 | Generate strong passwords instantly | Secure vault, breach check |
| **QR Code Generator** | `qr-code-generator` | **Active (Live)** 🟢 | Create QR codes for free | Custom colors, logo, analytics |
| **URL Shortener** | `url-shortener` | **Active (Live)** 🟢 | Shorten URLs for free | Custom slugs, click analytics |
| **JSON Formatter** | `json-formatter` | **Active (Live)** 🟢 | Format and validate JSON online | Minify, tree view, export |
| **Base64 Encoder/Decoder** | `base64-encoder` | **Active (Live)** 🟢 | Encode/decode Base64 online | File to Base64, batch encode |
| **MD5 Hash Generator** | `md5-hash-generator` | **Active (Live)** 🟢 | Generate MD5 hash online | SHA family, HMAC, batch hashing |
| **Regex Tester** | `regex-tester` | **Active (Live)** 🟢 | Test regular expressions online | Save patterns, cheat sheet |
| **URL Encoder/Decoder** | `url-encoder` | **Active (Live)** 🟢 | Encode/decode URLs online | Batch encode, form data encoder |
| **UUID Generator** | `uuid-generator` | **Active (Live)** 🟢 | Generate random UUIDs online | UUID v1/v3/v5, bulk generation |
| **Hex to RGB Converter** | `hex-to-rgb` | **Active (Live)** 🟢 | Convert hex to RGB color codes | Color palette, contrast checker |
| **Binary Converter** | `binary-converter` | **Active (Live)** 🟢 | Convert between number systems | ASCII/binary, bitwise operations |
| **Code Formatter** | `code-formatter` | **Active (Live)** 🟢 | Beautify HTML, CSS, and JavaScript code | Format TypeScript, JSON, Python; save snippets |
| **JSON to CSV Converter** | `json-csv-converter` | **Active (Live)** 🟢 | Convert JSON ↔ CSV instantly | Batch convert files, custom delimiters, save history |
| **Diff Checker** | `diff-checker` | **Active (Live)** 🟢 | Compare two texts and highlight differences | Download diff report, file upload, ignore whitespace |
| **Markdown Editor** | `markdown-editor` | **Active (Live)** 🟢 | Live-preview markdown editor online | Export to PDF/HTML, multiple files, custom themes |
| **HTML Playground** | `html-playground` | **Active (Live)** 🟢 | Live HTML/CSS/JS preview playground | Save & share snippets, embed on any page |
| **QR Code Decoder** | `qr-code-decoder` | **Active (Live)** 🟢 | Read and decode QR codes from images | Batch decode, history log, export results |

### 📁 Category: Converters & Units (`category: 'converters'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Currency Converter** | `currency-converter` | **Active (Live)** 🟢 | Convert PKR to USD and other currencies | Historical rates, rate alerts |
| **Time Zone Converter** | `time-zone-converter` | **Active (Live)** 🟢 | Convert time between time zones | Saved cities, meeting planner |
| **Roman Numeral Converter** | `roman-numeral-converter` | **Active (Live)** 🟢 | Convert Roman numerals to numbers | Date to Roman, history |
| **Temperature Converter** | `celsius-to-fahrenheit` | **Active (Live)** 🟢 | Convert temperature units | Conversion history, comparison chart |
| **Weight Converter** | `kg-to-pounds` | **Active (Live)** 🟢 | Convert weight units online | All units, bulk conversion |
| **Length Converter** | `miles-to-km` | **Active (Live)** 🟢 | Convert length and distance units | All units, comparison table |
| **Speed Converter** | `speed-converter` | **Active (Live)** 🟢 | Convert speed units online | All units, pace conversion |
| **Timezone Meeting Planner** | `timezone-meeting-planner` | **Active (Live)** 🟢 | Find overlapping hours across timezones | Save team timezones, calendar export (.ics) |

### 📁 Category: Fun & Games (`category: 'fun-games'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Days Until Calculator** | `days-until-calculator` | **Active (Live)** 🟢 | Count days until a date | Countdown, calendar sync |
| **Random Number Generator** | `random-number-generator` | **Active (Live)** 🟢 | Generate random numbers | Range, history, export |
| **Love Calculator** | `love-calculator` | **Active (Live)** 🟢 | Calculate love compatibility (fun) | Ad-free, detailed analysis |
| **Countdown Timer** | `countdown-timer` | **Active (Live)** 🟢 | Set a countdown for any event | Multiple timers, notifications |
| **Online Stopwatch** | `online-stopwatch` | **Active (Live)** 🟢 | Free online stopwatch with laps | Multiple timers, alarms, save laps |
| **Flip a Coin** | `flip-a-coin` | **Active (Live)** 🟢 | Virtual coin flip for decisions | Stats history, streak tracking |
| **Dice Roller** | `dice-roller` | **Active (Live)** 🟢 | Roll virtual dice for games | Multiple dice, stats, roll history |
| **Random Name Picker** | `random-name-picker` | **Active (Live)** 🟢 | Pick random names from a list | Wheel animation, save lists |
| **Yes/No Oracle** | `yes-no-oracle` | **Active (Live)** 🟢 | Random yes/no answer generator | Custom answers, history |
| **Typing Speed Test** | `typing-speed-test` | **Active (Live)** 🟢 | Test your typing speed and accuracy in WPM | Unlimited passages, leaderboard & personal bests history |

### 📁 Category: Utilities (`category: 'utility'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Text to PDF Converter** | `text-to-pdf` | **Active (Live)** 🟢 | Convert text to PDF online | Cloud save, branding |
| **PDF Merger** | `pdf-merger` | **Active (Live)** 🟢 | Merge PDF files online free | Unlimited files, page reordering |
| **Age Calculator** | `age-calculator` | **Active (Live)** 🟢 | Calculate your exact age | Age milestone tracker |
| **Date Difference Calculator** | `date-difference-calculator` | **Active (Live)** 🟢 | Calculate days between two dates | Calendar export, reminders |
| **Fuel Cost Calculator** | `fuel-cost-calculator` | **Active (Live)** 🟢 | Estimate fuel cost for trips | Trip logging, fuel price alerts |
| **Electricity Bill Calculator** | `electricity-bill-calculator` | **Active (Live)** 🟢 | Estimate monthly electricity bill | Appliance comparison, usage tracking |
| **Dog Age Calculator** | `dog-age-calculator` | **Active (Live)** 🟢 | Convert dog years to human years | Breed-specific, health milestones |
| **Age Difference Calculator** | `age-difference-calculator` | **Active (Live)** 🟢 | Calculate age difference between people | Compatibility score, chart |
| **Time Duration Calculator** | `time-duration-calculator` | **Active (Live)** 🟢 | Calculate time between two moments | Multiple time zones, export |
| **Online Notepad** | `online-notepad` | **Active (Live)** 🟢 | Browser-based notepad with auto-save | Multiple named notes, no word limit, export to PDF |
| **PDF Compressor** | `pdf-compressor` | **Active (Live)** 🟢 | Reduce PDF file size in your browser | Files up to 50MB, batch compress, quality presets |
| **PDF Splitter** | `pdf-splitter` | **Active (Live)** 🟢 | Split PDF pages online for free | Files up to 50MB, custom page ranges, batch split |
| **Countdown to Date** | `countdown-to-date` | **Active (Live)** 🟢 | Animated countdown to any future date | Multiple countdowns, share link, embed widget |

### 📁 Category: Productivity (`category: 'productivity'`)

| Tool Name | Slug | Status | Short Description | Premium Pro Feature Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Pomodoro Timer** | `pomodoro-timer` | **Active (Live)** 🟢 | 25-min focus timer with session tracking | Session history, custom intervals, daily stats |
| **Habit Tracker** | `habit-tracker` | **Active (Live)** 🟢 | Track daily habits with streaks | Unlimited habits, weekly reports, reminders |

## 4. Areas for System Optimization (Suggestions Request)
Use this directory spec to query suggestions on:
1. **Offline PWA support**: Strategies to configure Service Workers to load React client files offline.
2. **Web Workers for Image Processing**: Offloading pixel threshold extraction to a worker thread.
3. **Database Integration**: Schema mapping in Supabase to sync client states.
4. **Stripe Middleware**: Handling webhook membership status checks before rendering pages.
