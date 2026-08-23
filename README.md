<div align="center">

# VocaCart — AI-Powered Multilingual Voice Shopping Assistant

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-voca--cart.vercel.app-blue?style=for-the-badge&logo=vercel)](https://voca-cart.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-orange?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**An ultra-fast, production-grade bilingual voice shopping assistant designed for Indian and global e-commerce. Built with zero-latency client execution, intelligent FMCG brand mapping, recipe bundles, and natural human neural speech synthesis.**

---

### Live Application URL: [https://voca-cart.vercel.app](https://voca-cart.vercel.app)

</div>

---

## Highlights and Key Features

- **0ms Real-Time Voice Processing**: Instantaneous client-side parsing and optimistic UI updates with zero blocking network latency when speaking.
- **Fluent Bilingual Conversational AI**: Seamlessly understands and responds in **English**, **Hindi**, and **Hinglish**.
- **Smart FMCG Brand Attachment**: Automatically associates trusted Indian household brands for packaged goods (*Milk* -> *Amul Milk*, *Atta* -> *Aashirvaad Atta*, *Salt* -> *Tata Salt*) while keeping fresh produce (*Tomatoes*, *Apples*) clean.
- **Exact Brand Preservation**: Explicit brands like *Oreo Biscuits*, *Mother Dairy Milk*, or *Bourbon* are preserved exactly as spoken.
- **Dual-Persona Neural Speech Synthesis**: Authentic Hindi pronunciation via Devanagari transliteration and crisp, energetic female English voice playback.
- **One-Shot Recipe Bundles**: Add complete multi-item ingredient packages with a single natural phrase (such as *"Chai ka samaan"*).
- **Universal Cart Control**: Clear, empty, or delete the whole cart, or perform partial quantity reductions (*"delete 5 packets"*).
- **Interactive Chit-Chat and Jokes**: Supports conversational small talk, jokes, capability queries, and status checks.
- **Persistent Offline-First Cart**: State is synchronized to local storage and restored automatically across page refreshes.

---

## What to Try (Voice Commands Guide)

Try tapping the microphone button (or pressing Spacebar) and saying any of the following:

### 1. Adding and Modifying Groceries
| Language | Voice Command Example | What Happens |
| :--- | :--- | :--- |
| **English** | *"Add 2 packets of milk and 1 kg tomatoes"* | Adds 2 packs **Amul Milk** & 1 kg **Tomatoes** |
| **English** | *"Add 1 pack of Oreo biscuits and 2 bottles of oil"* | Adds **Oreo Biscuits** & **Fortune Sunflower Oil** |
| **Hindi** | *"1 packet doodh aur 2 kg aalu daal do"* | Adds 1 pack **Amul Milk** & 2 kg **Potatoes** |
| **Hinglish** | *"2 bread aur 1 makhan add karo"* | Adds **Britannia Bread** & **Amul Butter** |

### 2. Recipe Bundles (Multi-Item Instant Add)
| Voice Command | Items Added Automatically | Spoken Confirmation |
| :--- | :--- | :--- |
| *"Chai ka samaan"* / *"Make tea"* | Tata Tea Premium, Amul Milk, Madhur Sugar, Fresh Ginger | *"Chai banane ka saara samaan list mein jod diya hai"* |
| *"Maggi banani hai"* | Maggi 2-Minute Noodles, Amul Butter, Cheese | *"Maggi banane ke items jod diye"* |
| *"Breakfast items"* | Britannia Bread, Eggs, Amul Butter, Amul Milk | *"Added breakfast essentials to your cart"* |
| *"Dal chawal"* | Basmati Rice, Toor Dal, Amul Pure Ghee, Tata Salt | *"Dal chawal ka samaan jod diya hai"* |

### 3. Jokes and Small Talk (Chit-Chat)
| Voice Command | Assistant Response |
| :--- | :--- |
| *"Tell me a joke"* | *"Why did the tomato blush? Because it saw the salad dressing!"* |
| *"Ek joke sunao"* | *"Pati ne patni se pucha: Aaj khane mein kya bana rahi ho? Patni boli: Gussa! Pati bola: Theek hai, thoda kam namak daalna!"* |
| *"How are you?"* / *"Kaise ho"* | *"I'm doing wonderful! What would you like to add today?"* / *"Main bilkul badhiya hoon! Aapki madad ke liye tayar hoon."* |
| *"Who are you?"* / *"Tum kaun ho"* | *"I am VocaCart, your AI voice grocery shopping assistant!"* |

### 4. Quantity Adjustments and Removals
- **Partial Reduction**: Cart has 10 milk packets -> Say: *"Remove 5 packets of milk"* -> Cart updates to 5 remaining.
- **Single Item Delete**: *"Remove all the milk"* or *"Tamatar hata do"* -> Removes only that specific item.
- **Complete Cart Reset**: *"Empty the cart"*, *"Remove all cart"*, *"Cart khali karo"*, or *"Sab hata do"* -> Clears the entire cart with confirmation.

### 5. Inquiries, Totals and Undo
- **Read List**: *"What's in my cart?"* / *"List mein kya kya hai?"*
- **Total Bill**: *"What is my total bill?"* / *"Estimated total kitna hua?"*
- **Check-off**: *"Doodh le liya"* / *"Mark milk as done"* -> Checks off item in the list.
- **Undo**: *"Undo"* / *"Wapas lo"* -> Reverts the previous cart mutation.

---

## System Architecture

```
                                  +-----------------------------------------------------+
                                  |                 User Voice Input                    |
                                  |     (Web Speech API / Interim & Final Stream)       |
                                  +-----------------------------------------------------+
                                                             |
                                                             v
                                  +-----------------------------------------------------+
                                  |        Dynamic Language & Intent Classifier         |
                                  |    (English vs. Hindi/Hinglish NLP Pattern Engine)  |
                                  +-----------------------------------------------------+
                                                             |
                    +----------------------------------------+----------------------------------------+
                    |                                                                                 |
                    v                                                                                 v
   +---------------------------------+                                               +---------------------------------+
   |      Special Intent Handlers    |                                               |    Core Grocery NLP Pipeline    |
   | - Chit-Chat / Jokes / Greetings |                                               | - Number & Unit Normalizer      |
   | - Recipe Bundles ("Chai/Maggi") |                                               | - Brand Attachment Engine       |
   | - Clear All / Empty Cart        |                                               | - Conflict-Free Brand Matcher   |
   | - Undo & Check-Off Commands     |                                               | - Partial Quantity Reducer      |
   +---------------------------------+                                               +---------------------------------+
                    |                                                                                 |
                    +----------------------------------------+----------------------------------------+
                                                             |
                                                             v
                                  +-----------------------------------------------------+
                                  |               State Management & Storage            |
                                  |       (React 19 Context + LocalStorage Cache)       |
                                  +-----------------------------------------------------+
                                                             |
                                                             v
                                  +-----------------------------------------------------+
                                  |        Bilingual Neural TTS Voice Synthesizer       |
                                  | - Native Hindi Voice with Devanagari Transliteration|
                                  | - Crisp Female English Voice (1.18x Speed)          |
                                  +-----------------------------------------------------+
```

---

## Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | **Next.js 14** (App Router), **React 19**, **TypeScript** |
| **Styling and UI** | **Tailwind CSS**, Glassmorphic Design, **Lucide Icons** |
| **Voice and Speech** | **Web Speech Recognition API**, **SpeechSynthesis API** (Neural Voices) |
| **AI and NLP** | **Google Gemini 2.5 Flash**, Custom Deterministic Bilingual Slot Parser |
| **Transliteration** | Native Hinglish-to-Devanagari phonetic mapping engine |
| **Backend (Optional Microservice)** | **FastAPI**, **Uvicorn**, **SQLAlchemy**, **ChromaDB**, **Groq Llama 3.1** |
| **Deployment** | **Vercel** Edge/Serverless Infrastructure |

---

## Live Deployment and Local Setup

### Live Production Deployment
Experience the live application deployed on Vercel:
**[https://voca-cart.vercel.app](https://voca-cart.vercel.app)**

### Running Locally (Optional)

```bash
# 1. Clone the repository
git clone https://github.com/divyamgoel2005/VocaCart.git
cd VocaCart

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
```

After starting the dev server, navigate to **[https://voca-cart.vercel.app](https://voca-cart.vercel.app)** or your local instance to start shopping by voice.

---

## Repository Structure

```
VocaCart/
├── app/                  # Next.js App Router pages & serverless API routes
│   ├── api/              # /api/list, /api/voice/process, /api/products, /api/suggestions
│   ├── globals.css       # Design tokens, animations, and global styles
│   └── page.tsx          # Main VocaCart Command Center UI
├── components/           # Modular component hierarchy
│   ├── history/          # Activity timeline & voice log
│   ├── language/         # Bilingual switcher
│   ├── providers/        # Global VocaCart context provider & TTS synthesizer
│   ├── search/           # Voice search & product catalog cards
│   ├── shared/           # Header, Panel, CategoryMeta
│   ├── shopping-list/    # Shopping list & category item groups
│   ├── suggestions/      # Smart picks & suggestion cards
│   └── voice/            # Voice Hero, Orb, Waveform, Command transcript
├── backend/              # Python FastAPI microservice & ML models
├── lib/                  # Core domain logic
│   ├── api/              # Services, catalog data, types
│   ├── i18n/             # Translations dictionary (English, Hindi, Hinglish)
│   └── voice/            # Parser, Gemini NLP, Transliterate, Recipes, Recognition
├── data/                 # Product catalogs and synthetic order datasets
└── public/               # Static assets and Web App Manifest
```

---

<div align="center">

**Built for frictionless voice-assisted commerce.**

[Try Live Application](https://voca-cart.vercel.app) • [GitHub Repository](https://github.com/divyamgoel2005/VocaCart)

</div>
