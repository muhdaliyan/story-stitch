"""
Image generation router — uses Gemini gemini-2.5-flash-image.

Endpoints:
  POST /api/image/generate  → returns base64-encoded PNG for a scene
"""

import base64
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)
router = APIRouter()
_client = genai.Client(api_key=GEMINI_API_KEY)


class ImageGenerateRequest(BaseModel):
    scene_id: str
    prompt: str
    format: str = "long"  # "short" (9:16) or "long" (16:9)


class ImageGenerateResponse(BaseModel):
    scene_id: str
    image_b64: str          # data:image/png;base64,...
    mime_type: str = "image/png"


@router.post("/generate", response_model=ImageGenerateResponse)
def generate_image(req: ImageGenerateRequest):
    try:
        ar_desc = "9:16 Vertical Portrait (Smartphone/TikTok style)" if req.format == "short" else "16:9 Widescreen Cinematic (Movie style)"
        prompt = (
            f"Generate an ultra-high-quality cinematic film scene in {ar_desc} aspect ratio. "
            f"Scene Content: {req.prompt}. "
            f"Details: Include a rich, detailed background, natural environment, and realistic people if the scene requires them. "
            f"Aesthetic: Use professional cinematic lighting (e.g., volumetric, soft bokeh), sharp focus, and vibrant colors. "
            f"The image must be clean, artistic, and visually stunning."
        )
        
        response = _client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
    except Exception as e:
        msg = str(e)
        logger.error("Gemini image generation failed: %s", msg)
        if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
            raise HTTPException(
                status_code=429,
                detail="Image generation quota exceeded. Please wait a moment and try again.",
            )
        raise HTTPException(status_code=500, detail=msg)

    # Extract inline image bytes from response parts
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.inline_data and part.inline_data.data:
                raw = part.inline_data.data
                # data may already be bytes or a base64 string depending on SDK version
                if isinstance(raw, (bytes, bytearray)):
                    b64 = base64.b64encode(raw).decode()
                else:
                    b64 = raw  # already base64
                mime = part.inline_data.mime_type or "image/png"
                return ImageGenerateResponse(
                    scene_id=req.scene_id,
                    image_b64=f"data:{mime};base64,{b64}",
                    mime_type=mime,
                )

    logger.error("Gemini returned no image. Candidates: %s", response.candidates)
    raise HTTPException(status_code=500, detail="Gemini returned no image data.")
