# Voice Command Shopping Assistant

An end-to-end, production-ready **Voice Command Shopping Assistant** built with **FastAPI**, **Next.js 14**, **Groq Llama 3.1**, **sentence-transformers**, **librosa**, **ChromaDB**, **PostgreSQL**, **Redis**, and **Socket.IO**.

---

## Quickstart

### Option A: Docker Compose (If Docker Desktop is installed)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Launch full stack via Docker Compose
docker compose up --build
```

### Option B: Running Locally Without Docker (Recommended if Docker is not installed)

Since Python 3.11 and Node.js are installed on your machine, you can run the app directly in two terminal windows:

**Terminal 1 — FastAPI Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Next.js Frontend:**
```bash
cd frontend
npm run dev
```

Once running, access:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Architecture Diagram

```
+-------------------+             audio / transcript           +-----------------------+
|                   |----------------------------------------->|     FastAPI: voice    |
|                   |                                          +-----------------------+
|                   |                                                      |
|                   |                       +------------------------------+------------------------------+
|                   |                       |                              |                              |
|                   |                       v                              v                              v
|                   |             +-------------------+          +-------------------+          +-------------------+
| Next.js Frontend  |             | Groq Llama 3.1    |          | sentence-transf.  |          |   FastAPI: list   |
|                   |             | intent & slot     |          | & rapidfuzz item  |          +-------------------+
|                   |             +-------------------+          | resolution        |                    |
|                   |                                            +-------------------+          +---------+---------+
|                   |                                                                           |                   |
|                   |                                                                           v                   v
|                   |<--------------------+                                                 +-------+           +-------+
|                   |    live updates     |                                                 | Redis |           |  PG   |
|                   |                     |                                                 +-------+           +-------+
+-------------------+                     |                                                                         ^
          ^                               |                                                                         |
          |                               |                    +------------------+     librosa audio prosody       |
          |                               |                    | FastAPI: emotion |---------------------------------+
          |                               |                    +------------------+     + text urgency score        |
          |                               |                             |                                           |
          |                               |                             v                                           |
          +-------------------------------+--------------------->+---------------+                                  |
                                          |                      |    FastAPI:   |----------------------------------+
                                          +--------------------->|  suggestions  |
                                                                 +---------------+
                                                                         |
                                                                         v
                                                                   +-----------+
                                                                   | ChromaDB  |
                                                                   +-----------+
```

---

## ML & NLP Component Breakdown

### 1. Intent & Slot Extraction Engine (`Groq Llama 3.1 8B Instant` + `Fallback Parser`)
- **Purpose**: Extracts structured JSON intents (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_LIST`, `SEARCH`) and slots (`item_name`, `quantity`, `unit`).
- **Design Rationale**: Groq provides ultra-fast sub-100ms inference for Llama 3.1 8B. To guarantee 100% offline availability without API key dependency, a dual-layer regex/keyword parser is built-in supporting code-switched Hinglish/English phrases like *"do packet Maggi add karo"* or *"tin kg rice jodo"*.

### 2. Item Resolution & Catalog Search (`sentence-transformers` + `rapidfuzz`)
- **Purpose**: Maps messy spoken queries (with typos or mishearings like *"mangi"* or *"amul butter pack"*) to exact catalog product records.
- **Design Rationale**: Combines `rapidfuzz.fuzz.token_set_ratio` with `all-MiniLM-L6-v2` dense vector embeddings. Composite score: $0.4 \times Fuzzy + 0.6 \times Semantic$. If composite confidence $< 0.65$, the system triggers a clarifying question prompt (e.g. *"Did you mean Whole Wheat Bread or Garlic Bread?"*) rather than executing an erroneous edit.

### 3. Emotion Prosody & Text Urgency Fusion (`librosa` + `vaderSentiment`)
- **Purpose**: Dynamically measures user urgency from voice pitch, energy, speaking rate, and text sentiment.
- **Design Rationale**: `librosa` extracts $F0$ pitch variance, RMS energy, and onset tempo. `vaderSentiment` calculates text urgency density. The fused index ($0.5 \times Prosodic + 0.5 \times TextUrgency$) adjusts frontend TTS confirmations (concise vs. verbose) and prioritizes urgent suggestion pushes.

### 4. Local Audio Transcription Fallback (`faster-whisper`)
- **Purpose**: Transcribes raw uploaded audio clips locally when Web Speech API confidence is low or when audio files are posted.
- **Design Rationale**: `faster-whisper` (tiny model with int8 quantization) provides high-accuracy local multilingual transcription without cloud API dependencies.

### 5. Vector Database (`ChromaDB`)
- **Purpose**: Stores 2,500+ Indian grocery item embeddings for instant semantic search and smart substitute recommendations.

### 6. Recommendation Engine (Co-occurrence & Depletion Time-Decay)
- **Purpose**: Powers "Usually Bought Together", "Probably Running Low", and "Smart Substitutes".
- **Design Rationale**: Built from 1,200+ synthetic session order co-purchases (e.g. Milk + Cereal, Bread + Butter, Maggi + Ketchup).

---

## Approach Write-up (~200 words)

Building a seamless voice-assisted e-commerce interface requires balancing real-time conversational responsiveness with precision database operations. In this project, we designed a resilient, modular architecture where the Next.js 14 frontend communicates with FastAPI services over HTTP and ASGI Socket.IO for instant live synchronization.

Voice command understanding uses a dual-engine intent parser: online Groq Llama 3.1 8B Instant for high-accuracy slot extraction, backed by a deterministic regex parser capable of parsing code-switched Hinglish inputs (*"do packet Maggi add karo"*). Disambiguation is handled by combining `rapidfuzz` string token ratios with `sentence-transformers` (`all-MiniLM-L6-v2`) embeddings in ChromaDB. If confidence falls below 0.65, the API branches gracefully to ask a clarifying question.

For multimodal perception, a custom lightweight emotion engine fuses audio prosodic features (pitch variance, RMS energy, speaking rate extracted via `librosa`) with text urgency metrics. This fused score alters feedback verbosity and recommendation aggressiveness in real time. State persistence is managed through SQLAlchemy PostgreSQL models with Redis caching and single-click action log undo capability. Containerized via Docker Compose, the complete stack launches deterministically with zero manual setup.

---

## Verification & Test Execution

Run backend unit tests:
```bash
python -m pytest backend/tests
```

Run frontend unit tests:
```bash
cd frontend && npm test
```
