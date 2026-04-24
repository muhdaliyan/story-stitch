"""
Script router — uses OpenAI gpt-4o for all text generation.

Endpoints:
  POST /api/script/generate     → generate full initial script
  POST /api/script/add-scenes   → append AI scenes to existing script
"""

import json
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from config import OPENAI_API_KEY

router = APIRouter()
client = OpenAI(api_key=OPENAI_API_KEY)


# ── Request / Response models ──────────────────────────────────────────────────

class GenerateScriptRequest(BaseModel):
    concept: str
    target_duration: int = 60       # total video seconds
    scene_frequency: int = 10       # seconds per scene
    format: str = "short"           # "short" | "long"


class SceneItem(BaseModel):
    narrative: str
    visual: str


class GenerateScriptResponse(BaseModel):
    scenes: list[SceneItem]


class AddScenesRequest(BaseModel):
    concept: str
    existing_scenes: list[SceneItem]
    count: int = 1


class AddScenesResponse(BaseModel):
    scenes: list[SceneItem]


# ── Helpers ────────────────────────────────────────────────────────────────────

SCENE_SCHEMA = {
    "type": "object",
    "properties": {
        "scenes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "narrative": {"type": "string"},
                    "visual":    {"type": "string"},
                },
                "required": ["narrative", "visual"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["scenes"],
    "additionalProperties": False,
}


def _chat_json(prompt: str, schema: dict, retries: int = 2) -> dict:
    """Call OpenAI with JSON schema output and retry on rate-limit."""
    for attempt in range(retries + 1):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "response",
                        "strict": True,
                        "schema": schema,
                    },
                },
            )
            return json.loads(response.choices[0].message.content or "{}")
        except Exception as e:
            if attempt < retries and "429" in str(e):
                time.sleep(5)
                continue
            raise HTTPException(status_code=500, detail=str(e))


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateScriptResponse)
def generate_script(req: GenerateScriptRequest):
    scene_count = max(1, req.target_duration // req.scene_frequency)
    fmt_label = "Vertical (Reel/TikTok)" if req.format == "short" else "Horizontal (YouTube)"
    min_words  = req.scene_frequency * 2
    max_words  = req.scene_frequency * 3

    prompt = (
        f'Create a {scene_count}-scene short film script based on this concept: "{req.concept}".\n'
        f"The video format is {fmt_label}.\n"
        f"Total length: {req.target_duration} seconds. Each scene lasts {req.scene_frequency} seconds.\n\n"
        f"IMPORTANT: The narrative for EACH scene must be ~{min_words}–{max_words} words so it can be "
        f"spoken naturally in {req.scene_frequency} seconds. Do not write overly long narratives.\n\n"
        f"For each scene provide:\n"
        f'1. "narrative": the voiceover/dialogue text.\n'
        f'2. "visual": a detailed cinematic image-generation prompt.'
    )

    data = _chat_json(prompt, SCENE_SCHEMA)
    scenes = [SceneItem(**s) for s in data.get("scenes", [])[:scene_count]]
    return GenerateScriptResponse(scenes=scenes)


@router.post("/add-scenes", response_model=AddScenesResponse)
def add_scenes(req: AddScenesRequest):
    existing = "\n".join(
        f"Scene {i+1}: {s.narrative}" for i, s in enumerate(req.existing_scenes)
    )
    prompt = (
        f'You are a film scriptwriter. Based on the concept: "{req.concept}", '
        f"continue the following script by adding {req.count} more scene(s).\n\n"
        f"Existing Script:\n{existing}\n\n"
        f"Return exactly {req.count} new scene(s)."
    )

    data = _chat_json(prompt, SCENE_SCHEMA)
    scenes = [SceneItem(**s) for s in data.get("scenes", [])[: req.count]]
    return AddScenesResponse(scenes=scenes)
