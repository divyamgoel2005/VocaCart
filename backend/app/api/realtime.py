import socketio
import logging

logger = logging.getLogger("realtime_socketio")

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    logger.info(f"Socket.IO Client connected: {sid}")
    await sio.emit("connection_ack", {"status": "connected", "sid": sid}, room=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Socket.IO Client disconnected: {sid}")

@sio.event
async def ping_server(sid, data):
    await sio.emit("pong_client", {"message": "pong"}, room=sid)

async def broadcast_list_update(action: str, item_data: dict):
    try:
        await sio.emit("list_updated", {"action": action, "item": item_data})
    except Exception as e:
        logger.error(f"Failed broadcasting Socket.IO list update: {e}")

async def broadcast_suggestion_push(suggestion_data: dict):
    try:
        await sio.emit("suggestion_pushed", suggestion_data)
    except Exception as e:
        logger.error(f"Failed broadcasting Socket.IO suggestion push: {e}")
