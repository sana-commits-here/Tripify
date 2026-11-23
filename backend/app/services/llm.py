import re
import time

import requests
from app.core.config import settings

GROQ_BASE = "https://api.groq.com/openai/v1"

# Best general-purpose chat models on Groq, in order of preference. The first one the
# account can use wins; anything else falls back to the largest-looking chat model.
_PREFERRED = (
    "openai/gpt-oss-120b",
    "moonshotai/kimi-k2-instruct-0905",
    "moonshotai/kimi-k2-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.3-70b-versatile",
    "qwen/qwen3-32b",
    "openai/gpt-oss-20b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
)
_SKIP = ("whisper", "guard", "tts", "orpheus", "prompt", "compound", "embed", "allam", "safeguard")
_model_cache = {}


def _groq_headers():
    return {"Authorization": f"Bearer {settings.GROQ_API_KEY}"}


def available_models():
    res = requests.get(f"{GROQ_BASE}/models", headers=_groq_headers(), timeout=15)
    res.raise_for_status()
    return [m["id"] for m in res.json().get("data", []) if m.get("active", True)]


def current_model() -> str:
    """The model in use: GROQ_MODEL if set and available, else the best available one."""
    if "model" in _model_cache:
        return _model_cache["model"]
    ids = available_models()
    if settings.GROQ_MODEL and settings.GROQ_MODEL in ids:
        choice = settings.GROQ_MODEL
    else:
        choice = next((m for m in _PREFERRED if m in ids), None)
        if not choice:
            chat = [i for i in ids if not any(s in i.lower() for s in _SKIP)]
            choice = (chat or ids)[0]
    _model_cache["model"] = choice
    return choice


def _groq_chat(model: str, prompt: str):
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.6,
        "max_tokens": 4000,
    }
    if "gpt-oss" in model:
        body["reasoning_effort"] = "low"  # itinerary writing doesn't need long hidden reasoning
    elif "qwen3" in model:
        body["reasoning_effort"] = "none"
    return requests.post(f"{GROQ_BASE}/chat/completions", headers=_groq_headers(), json=body, timeout=90)


def _retry_after(res) -> float:
    """Seconds Groq asks us to wait on a 429, from the header or the message text."""
    try:
        return float(res.headers.get("retry-after", ""))
    except ValueError:
        m = re.search(r"try again in ([\d.]+)s", res.text)
        return float(m.group(1)) if m else 0.0


def complete(prompt: str) -> str:
    """Send a prompt to Groq if a key is configured, otherwise to a local Ollama server."""
    if settings.GROQ_API_KEY:
        t0 = time.time()
        res = _groq_chat(current_model(), prompt)
        print(f"[llm] {current_model()} -> {res.status_code} in {time.time() - t0:.1f}s")
        if res.status_code == 429:
            wait = _retry_after(res)
            if 0 < wait <= 12:
                print(f"[llm] rate limited, waiting {wait:.1f}s")
                time.sleep(wait + 0.5)
                res = _groq_chat(current_model(), prompt)
        if not res.ok:
            if res.status_code == 429:
                raise RuntimeError("Groq rate limit reached, please try again in a minute.")
            raise RuntimeError(f"Groq {res.status_code}: {res.text[:300]}")
        return res.json()["choices"][0]["message"]["content"]

    res = requests.post(
        f"{settings.OLLAMA_BASE_URL}/api/generate",
        json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=300,
    )
    res.raise_for_status()
    return res.json()["response"]
