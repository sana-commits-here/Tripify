```markdown
# Tripify ✈️ - Smart AI Travel Planning & Personalized Itinerary System

Tripify is an AI-powered travel assistant that creates day-wise itineraries, interactive maps, and budget estimates using a local Large Language Model (Llama 3.2 via Ollama) and OpenTripMap geospatial data.

---

## 📌 Features

* **Local LLM Inference**: Free, private, and offline-capable trip generation using `llama3.2` via Ollama.
* **Geospatial POI Grounding**: Real-time Points of Interest (POIs) fetched via the OpenTripMap API.
* **Interactive Map**: OpenStreetMap visual routing with custom Leaflet markers.
* **Dynamic Refinement**: Natural-language conversational edits to adjust existing itineraries.
* **Multi-Page Web Dashboard**: Smoothly animated pages for Planning, Analytics/Charts, and System Overviews.
* **Local Persistence**: Stores trip history and queries automatically using SQLite.

---

## 🛠️ Tech Stack & Dependencies

### Backend
* **Python 3.10+** (Tested on Python 3.11 / 3.13)
* **FastAPI**: Asynchronous web framework
* **Uvicorn**: ASGI web server
* **LangChain / LangChain-Ollama**: LLM orchestration and prompt pipelining
* **SQLAlchemy & SQLite**: Relational database storage
* **Requests / HTTPX**: Geospatial API client

### Frontend
* **Node.js 18+** & **NPM**
* **React 18** with **Vite**
* **React Router DOM**: Client-side multi-page routing
* **Leaflet & React-Leaflet**: Interactive map rendering
* **Chart.js & React-Chartjs-2**: Budget and analytics visualization
* **React-Markdown**: Markdown rendering for AI responses
* **Lucide React**: Modern icon set

---

## 🔑 External API Requirements

### OpenTripMap API Key
1. Visit [opentripmap.io](https://opentripmap.io/product).
2. Sign up for a free account.
3. Generate a free API key from your dashboard.
4. Keep this key handy to add to your backend environment configuration.

---

## 🚀 Step-by-Step Installation & Setup

### 1. Prerequisites Setup

#### Install & Configure Ollama
1. Download Ollama from [ollama.com](https://ollama.com).
2. Open PowerShell / Terminal and pull the Llama 3.2 model:
   ```powershell
   ollama pull llama3.2

```

3. Start the Ollama server:
```powershell
ollama run llama3.2

```



---

### 2. Backend Configuration

1. Navigate to the backend directory:
```powershell
cd C:\Users\sanab\Desktop\tripify\backend

```


2. Create and activate a Python virtual environment:
```powershell
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

```


3. Install required Python packages:
```powershell
pip install fastapi uvicorn requests sqlalchemy pydantic langchain langchain-community langchain-ollama

```


4. Create a `.env` file in `backend/` (or update `app/core/config.py`):
```env
OPENTRIPMAP_API_KEY=your_opentripmap_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
DATABASE_URL=sqlite:///./tripify.db

```


5. Start the FastAPI backend server:
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

```


* **API Root**: `http://127.0.0.1:8000/`
* **Swagger Interactive Docs**: `http://127.0.0.1:8000/docs`



---

### 3. Frontend Configuration

1. Open a new PowerShell terminal and navigate to the frontend directory:
```powershell
cd C:\Users\sanab\Desktop\tripify\frontend

```


2. Install Node dependencies:
```powershell
npm install

```


3. If missing specific modules, install them explicitly:
```powershell
npm install react-router-dom chart.js react-chartjs-2 leaflet react-leaflet lucide-react react-markdown axios

```


4. Start the Vite React development server:
```powershell
npm run dev

```


5. Open your browser at `http://127.0.0.1:5173` (or the port displayed in your terminal).

---

## 📂 Project Directory Structure

```text
tripify/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── config.py              # Environment and app settings
│   │   ├── db/
│   │   │   ├── database.py            # SQLite connection setup
│   │   │   └── models.py              # SQLAlchemy database models
│   │   ├── schemas/
│   │   │   └── itinerary.py           # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── places_service.py      # OpenTripMap API integration
│   │   │   ├── rag_engine.py          # POI vector/text context retrieval
│   │   │   └── itinerary_generator.py # Ollama LLM prompt pipeline
│   │   ├── api/
│   │   │   └── routes.py              # FastAPI endpoints (/generate, /modify, /history)
│   │   └── main.py                    # App entry point & CORS configuration
│   └── tripify.db                     # SQLite database file
│
└── frontend/
    ├── index.html                     # HTML entry point with Leaflet styles
    ├── package.json                   # NPM dependencies & scripts
    ├── vite.config.js                 # Vite host/port configuration
    └── src/
        ├── index.css                  # Global styles & keyframe animations
        ├── main.jsx                   # React root rendering
        ├── App.jsx                    # React Router configuration
        ├── services/
        │   └── api.js                 # Axios API connector
        ├── components/
        │   ├── Navbar.jsx             # Top navigation bar
        │   ├── TripForm.jsx           # Itinerary input form
        │   ├── MapView.jsx            # React-Leaflet map & POI pins
        │   ├── ItineraryCard.jsx      # Markdown itinerary viewer
        │   └── ChatBot.jsx            # Conversational modification prompt
        └── pages/
            ├── Home.jsx               # Landing page with hero section & graphics
            ├── Planner.jsx            # Main dashboard & generation engine
            ├── Analytics.jsx          # Cost & popularity charts (Chart.js)
            └── About.jsx              # System architecture details

```

---

## 🧪 Testing the API Endpoints

### 1. Generate Itinerary (`POST /api/generate`)

```powershell
curl -X 'POST' \
  '[http://127.0.0.1:8000/api/generate](http://127.0.0.1:8000/api/generate)' \
  -H 'Content-Type: application/json' \
  -d '{
    "destination": "Goa",
    "days": 3,
    "budget": "Moderate",
    "travel_style": "Relaxed",
    "interests": "beaches, seafood, historical forts"
  }'

```

### 2. Modify Itinerary (`POST /api/modify`)

```powershell
curl -X 'POST' \
  '[http://127.0.0.1:8000/api/modify](http://127.0.0.1:8000/api/modify)' \
  -H 'Content-Type: application/json' \
  -d '{
    "trip_id": 1,
    "user_feedback": "Replace Day 2 afternoon with local food markets and cultural walks"
  }'

```

---

## ⚡ Troubleshooting

* **`ERR_CONNECTION_REFUSED (-102)`**:
* Verify that Uvicorn is active in your backend terminal on `http://127.0.0.1:8000`.


* **`listen EACCES: permission denied ::1:3000`**:
* Update `vite.config.js` to use `host: '127.0.0.1'` and `port: 5173`.


* **`Ollama connection error`**:
* Run `ollama list` to verify `llama3.2` is installed and ensure the Ollama background daemon is running.



```

```
---

## 🌐 Deploying to Vercel

The repo deploys as one Vercel project: the React app is built from `frontend/` and the FastAPI backend runs as a Python function at `api/index.py` (all `/api/*` routes).

Set these environment variables in the Vercel project:

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Hosted Llama 3 via [Groq](https://console.groq.com) (required in production) |
| `OPENTRIPMAP_API_KEY` | Real attractions and map pins (optional, the planner still works without it) |
| `GROQ_MODEL` | Optional, defaults to `llama-3.3-70b-versatile` |

Without `GROQ_API_KEY` the backend falls back to a local Ollama server, so local development works as before. Trip history on Vercel is stored in temporary SQLite and resets when the function restarts.
