"""
Animation prompt router — uses OpenAI gpt-4o.

Endpoints:
  POST /api/animation/prompt      → one scene
  POST /api/animation/prompt-all  → all scenes (parallel)
"""

import asyncio
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
from config import OPENAI_API_KEY

router = APIRouter()
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

PROMPT_SCHEMA = {
    "type": "object",
    "properties": {
        "animation_prompt": {"type": "string"},
    },
    "required": ["animation_prompt"],
    "additionalProperties": False,
}


class AnimationPromptRequest(BaseModel):
    scene_id: str
    narrative: str
    visual: str


class AnimationPromptResponse(BaseModel):
    scene_id: str
    animation_prompt: str


class AnimationPromptAllRequest(BaseModel):
    scenes: list[AnimationPromptRequest]


class AnimationPromptAllResponse(BaseModel):
    results: list[AnimationPromptResponse]


async def _generate_one(req: AnimationPromptRequest) -> AnimationPromptResponse:
    prompt = (
        "You are a cinematic animation director. Given this scene description, write a concise "
        "animation prompt (camera movement, subject motion) for a video generation AI.\n\n"
        f"Narrative: {req.narrative}\nVisual: {req.visual}\n\n"
        "Write 1–2 powerful sentences describing the camera and subject movement."
    )
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "response",
                    "strict": True,
                    "schema": PROMPT_SCHEMA,
                },
            },
        )
        data = json.loads(response.choices[0].message.content or "{}")
        return AnimationPromptResponse(
            scene_id=req.scene_id,
            animation_prompt=data.get("animation_prompt", ""),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/prompt", response_model=AnimationPromptResponse)
async def generate_animation_prompt(req: AnimationPromptRequest):
    return await _generate_one(req)


@router.post("/prompt-all", response_model=AnimationPromptAllResponse)
async def generate_all_animation_prompts(req: AnimationPromptAllRequest):
    results = await asyncio.gather(*[_generate_one(s) for s in req.scenes])
    return AnimationPromptAllResponse(results=list(results))
