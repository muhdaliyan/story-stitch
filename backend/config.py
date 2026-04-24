import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")

if not OPENAI_API_KEY:
    print("[WARNING] OPENAI_API_KEY is not set.")
if not GEMINI_API_KEY:
    print("[WARNING] GEMINI_API_KEY is not set.")
if not ELEVENLABS_API_KEY:
    print("[WARNING] ELEVENLABS_API_KEY is not set.")
