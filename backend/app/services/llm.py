import requests
from app.core.config import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def complete(prompt: str) -> str:
    """Send a prompt to Groq if a key is configured, otherwise to a local Ollama server."""
    if settings.GROQ_API_KEY:
        res = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": settings.GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            },
            timeout=55,
        )
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

    res = requests.post(
        f"{settings.OLLAMA_BASE_URL}/api/generate",
        json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=300,
    )
    res.raise_for_status()
    return res.json()["response"]
