import requests
from app.core.config import settings

GROQ_BASE = "https://api.groq.com/openai/v1"
_SKIP = ("whisper", "guard", "tts", "orpheus", "prompt", "compound", "embed")
_model_cache = {}


def _groq_headers():
    return {"Authorization": f"Bearer {settings.GROQ_API_KEY}"}


def _pick_available_model() -> str:
    """Choose a chat model from the account's live model list, preferring Llama."""
    if "model" in _model_cache:
        return _model_cache["model"]
    res = requests.get(f"{GROQ_BASE}/models", headers=_groq_headers(), timeout=15)
    res.raise_for_status()
    ids = [m["id"] for m in res.json().get("data", []) if m.get("active", True)]
    chat = [i for i in ids if not any(s in i.lower() for s in _SKIP)]
    llama = sorted((i for i in chat if "llama" in i.lower()), reverse=True)
    choice = (llama or chat or ids)[0]
    _model_cache["model"] = choice
    return choice


def _groq_chat(model: str, prompt: str):
    return requests.post(
        f"{GROQ_BASE}/chat/completions",
        headers=_groq_headers(),
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
        },
        timeout=55,
    )


def complete(prompt: str) -> str:
    """Send a prompt to Groq if a key is configured, otherwise to a local Ollama server."""
    if settings.GROQ_API_KEY:
        model = _model_cache.get("model", settings.GROQ_MODEL)
        res = _groq_chat(model, prompt)
        if res.status_code == 404:  # model retired or not available on this account
            res = _groq_chat(_pick_available_model(), prompt)
        if not res.ok:
            raise RuntimeError(f"Groq {res.status_code}: {res.text[:300]}")
        return res.json()["choices"][0]["message"]["content"]

    res = requests.post(
        f"{settings.OLLAMA_BASE_URL}/api/generate",
        json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=300,
    )
    res.raise_for_status()
    return res.json()["response"]
