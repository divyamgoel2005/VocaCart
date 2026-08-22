from app.api.products import router as products_router
from app.api.list import router as list_router
from app.api.voice import router as voice_router
from app.api.suggestions import router as suggestions_router
from app.api.emotion import router as emotion_router
from app.api.realtime import socket_app

__all__ = [
    "products_router",
    "list_router",
    "voice_router",
    "suggestions_router",
    "emotion_router",
    "socket_app"
]
