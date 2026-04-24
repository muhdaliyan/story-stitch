"""
Metadata router — uses OpenAI gpt-4o to generate a video title and description.

Endpoints:
  POST /api/metadata/generate
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from config import OPENAI_API_KEY

router = APIRouter()
client = OpenAI(api_key=OPENAI_API_KEY)

METADATA_SCHEMA = {
    "type": "object",
    "properties": {
        "title":       {"type": "string"},
        "description": {"type": "string"},
    },
    "required": ["title", "description"],
    "additionalProperties": False,
}


class MetadataRequest(BaseModel):
    concept: str
    scene_narratives: list[str]


class MetadataResponse(BaseModel):
    title: str
    description: str


@router.post("/generate", response_model=MetadataResponse)
def generate_metadata(req: MetadataRequest):
    scenes_text = " | ".join(req.scene_narratives)
    prompt = (
        "Based on these scenes and this concept, generate a cinematic movie title and a compelling "
        "YouTube-style description.\n\n"
        f"Concept: {req.concept}\n"
        f"Scenes: {scenes_text}\n\n"
        "Respond in JSON with 'title' and 'description'."
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
                    "schema": METADATA_SCHEMA,
                },
            },
        )
        data = json.loads(response.choices[0].message.content or "{}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return MetadataResponse(
        title=data.get("title", ""),
        description=data.get("description", ""),
    )
