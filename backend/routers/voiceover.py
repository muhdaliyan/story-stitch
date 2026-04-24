"""
Voiceover router — two responsibilities:
  1. OpenAI gpt-4o → generate voiceover script + ElevenLabs parameter suggestions
  2. ElevenLabs TTS → synthesize audio from the script, return base64 MP3

Endpoints:
  POST /api/voiceover/script      → script text + voice params
  POST /api/voiceover/synthesize  → base64 MP3 audio
"""

import json
import base64
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from config import OPENAI_API_KEY, ELEVENLABS_API_KEY

router = APIRouter()
client = OpenAI(api_key=OPENAI_API_KEY)

# ── ElevenLabs voice ID lookup (common names → IDs) ───────────────────────────
# These are the default multilingual v2 voices; extend as needed.
ELEVENLABS_VOICE_IDS: dict[str, str] = {
    "rachel":  "21m00Tcm4TlvDq8ikWAM",
    "adam":    "pNInz6obpgDQGcFmaJgB",
    "serena":  "EXAVITQu4vr4xnSDxMaL",
    "bella":   "EXAVITQu4vr4xnSDxMaL",
    "arnold":  "VR6AewLTigWG4xSOukaG",
    "domi":    "AZnzlk1XvdvUeBnXmlld",
    "elli":    "MF3mGyEYCl7XYWbV9V6O",
    "josh":    "TxGEqnHWrfWFTfGW9XjX",
    "sam":     "yoZ06aMxZJJ28mfd3POQ",
}
DEFAULT_VOICE_ID = ELEVENLABS_VOICE_IDS["rachel"]

ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1"


# ── Models ─────────────────────────────────────────────────────────────────────

class VoiceoverScriptRequest(BaseModel):
    scene_id: str
    narrative: str
    scene_frequency: int = 10   # seconds per scene


class VoiceoverScriptResponse(BaseModel):
    scene_id: str
    script: str
    voice: str
    stability: float
    similarity: float
    style: float
    speed: float


class VoiceSynthesizeRequest(BaseModel):
    scene_id: str
    script: str
    voice: str = "Rachel"
    stability: float = 0.5
    similarity: float = 0.75
    style: float = 0.0
    speed: float = 1.0


class VoiceSynthesizeResponse(BaseModel):
    scene_id: str
    audio_b64: str          # data:audio/mpeg;base64,...
    mime_type: str = "audio/mpeg"


# ── Helpers ────────────────────────────────────────────────────────────────────

SCRIPT_SCHEMA = {
    "type": "object",
    "properties": {
        "script":     {"type": "string"},
        "voice":      {"type": "string"},
        "stability":  {"type": "number"},
        "similarity": {"type": "number"},
        "style":      {"type": "number"},
        "speed":      {"type": "number"},
    },
    "required": ["script", "voice", "stability", "similarity", "style", "speed"],
    "additionalProperties": False,
}


def _voice_id_for(name: str) -> str:
    return ELEVENLABS_VOICE_IDS.get(name.lower(), DEFAULT_VOICE_ID)


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/script", response_model=VoiceoverScriptResponse)
def generate_voiceover_script(req: VoiceoverScriptRequest):
    freq = max(5, req.scene_frequency)  # Ensure at least 5s per scene
    min_words = int(freq * 2.2)  # Normal narration pace is ~2-2.5 words/sec
    max_words = int(freq * 2.8)

    prompt = (
        f"You are a master cinematic scriptwriter and voice director.\n"
        f"Based on this scene narrative, provide:\n"
        f"1. A polished voiceover script. It MUST be timed for {freq} seconds.\n"
        f"   - LANGUAGE: Use EXTREMELY SIMPLE English vocabulary (Class 2 level).\n"
        f"   - TONE: Maintain a cinematic, neutral, or professional tone. Do NOT use childish greetings like 'Hey kids' or 'Hi friends'.\n"
        f"   - VOCABULARY: Use common, easy-to-understand words for a global audience. Avoid jargon or complex metaphors.\n"
        f"   - SENTENCES: Use short, clear sentences. One idea per sentence.\n"
        f"   - Pacing: Use ellipses (...) and em-dashes (—) SPARINGLY for high-impact pauses. \n"
        f"   - Target length: {min_words} to {max_words} words to comfortably fill {freq} seconds.\n"
        f"2. A voice model recommendation (e.g. 'Rachel', 'Adam', 'Serena', 'Josh').\n"
        f"3. ElevenLabs settings: Stability (0.3–0.5), Similarity (0.75), Style (0.3), Speed (0.8–1.0).\n\n"
        f"Narrative: {req.narrative}\n\n"
        f"Respond in JSON."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "response",
                    "strict": True,
                    "schema": SCRIPT_SCHEMA,
                },
            },
        )
        data = json.loads(response.choices[0].message.content or "{}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return VoiceoverScriptResponse(
        scene_id=req.scene_id,
        script=data.get("script", ""),
        voice=data.get("voice", "Rachel"),
        stability=float(data.get("stability", 0.5)),
        similarity=float(data.get("similarity", 0.75)),
        style=float(data.get("style", 0.0)),
        speed=float(data.get("speed", 1.0)),
    )


@router.post("/synthesize", response_model=VoiceSynthesizeResponse)
def synthesize_voiceover(req: VoiceSynthesizeRequest):
    """Call ElevenLabs TTS and return base64-encoded MP3."""
    voice_id = _voice_id_for(req.voice)
    url = f"{ELEVENLABS_API_BASE}/text-to-speech/{voice_id}"

    payload = {
        "text": req.script,
        "model_id": "eleven_flash_v2_5",  # Faster, cheaper, and more reliable for free tiers
        "voice_settings": {
            "stability":         req.stability,
            "similarity_boost":  req.similarity,
            "style":             req.style,
            "use_speaker_boost": True,
            "speed":             req.speed,
        },
    }
    headers = {
        "xi-api-key":   ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept":       "audio/mpeg",
    }

    params = {"output_format": "mp3_44100_128"}

    try:
        with httpx.Client(timeout=60) as http:
            resp = http.post(url, json=payload, headers=headers, params=params)
        
        if resp.status_code != 200:
            error_detail = resp.text
            try:
                # Try to parse JSON error if available for better readability
                error_json = resp.json()
                if "detail" in error_json:
                    error_detail = error_json["detail"]
                elif "message" in error_json:
                    error_detail = error_json["message"]
            except:
                pass
                
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"ElevenLabs error ({resp.status_code}): {error_detail}",
            )
        audio_bytes = resp.content
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    b64 = base64.b64encode(audio_bytes).decode()
    return VoiceSynthesizeResponse(
        scene_id=req.scene_id,
        audio_b64=f"data:audio/mpeg;base64,{b64}",
    )
