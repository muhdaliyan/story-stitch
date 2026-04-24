from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import script, animation, image, voiceover, metadata

app = FastAPI(title="StoryStitch API", version="1.0.0")

# Allow the Vite dev server and any local frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(script.router,     prefix="/api/script",     tags=["Script"])
app.include_router(animation.router,  prefix="/api/animation",  tags=["Animation"])
app.include_router(image.router,      prefix="/api/image",      tags=["Image"])
app.include_router(voiceover.router,  prefix="/api/voiceover",  tags=["Voiceover"])
app.include_router(metadata.router,   prefix="/api/metadata",   tags=["Metadata"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
