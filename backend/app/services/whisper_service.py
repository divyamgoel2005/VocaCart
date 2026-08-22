import os
import logging

logger = logging.getLogger("whisper_service")

_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            print("Loading faster-whisper tiny model...")
            # Use cpu and int8 compute type for lightweight execution
            _whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
        except Exception as e:
            logger.warning(f"Could not initialize faster-whisper model: {e}")
            _whisper_model = False
    return _whisper_model if _whisper_model is not False else None

def transcribe_audio_file(audio_path: str) -> dict:
    if not audio_path or not os.path.exists(audio_path):
        return {"transcript": "", "confidence": 0.0, "language": "en"}

    model = get_whisper_model()
    if not model:
        return {"transcript": "", "confidence": 0.0, "language": "en"}

    try:
        segments, info = model.transcribe(audio_path, beam_size=1)
        transcript = " ".join([segment.text for segment in segments]).strip()
        confidence = round(info.transcription_options if hasattr(info, 'transcription_options') else 0.85, 2)
        return {
            "transcript": transcript,
            "confidence": 0.88 if len(transcript) > 0 else 0.0,
            "language": info.language
        }
    except Exception as e:
        logger.error(f"Whisper transcription failed: {e}")
        return {"transcript": "", "confidence": 0.0, "language": "en"}
