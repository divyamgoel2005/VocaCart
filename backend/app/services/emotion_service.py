import os
import re
import numpy as np
import librosa
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader_analyzer = SentimentIntensityAnalyzer()

URGENCY_KEYWORDS = [
    "urgent", "urgently", "asap", "now", "quick", "quickly", "fast", "hurry",
    "immediately", "right now", "jaldi", "turant", "abhee", "ab"
]

def analyze_audio_prosody(audio_path: str) -> dict:
    try:
        y, sr = librosa.load(audio_path, sr=None, duration=10.0)
        if len(y) == 0:
            return {"pitch_var": 0.0, "energy": 0.0, "speaking_rate": 0.0}

        # 1. Pitch (F0) variance
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_vals = pitches[magnitudes > np.median(magnitudes)]
        pitch_var = float(np.std(pitch_vals)) if len(pitch_vals) > 0 else 0.0
        norm_pitch_var = min(1.0, pitch_var / 150.0)

        # 2. RMS Energy
        rms = librosa.feature.rms(y=y)[0]
        mean_rms = float(np.mean(rms)) if len(rms) > 0 else 0.0
        norm_energy = min(1.0, mean_rms * 15.0)

        # 3. Speaking rate (onset envelope strength)
        onset_env = librosa.onnset.onset_strength(y=y, sr=sr) if hasattr(librosa, 'onnset') else librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.feature.tempo(onset_envelope=onset_env, sr=sr)
        bpm = float(tempo[0]) if len(tempo) > 0 else 120.0
        norm_rate = min(1.0, max(0.0, (bpm - 80.0) / 100.0))

        prosody_score = 0.4 * norm_pitch_var + 0.35 * norm_energy + 0.25 * norm_rate

        return {
            "pitch_var": round(norm_pitch_var, 3),
            "energy": round(norm_energy, 3),
            "speaking_rate": round(norm_rate, 3),
            "prosody_score": round(prosody_score, 3)
        }
    except Exception as e:
        print(f"Librosa prosody extraction fallback: {e}")
        return {"pitch_var": 0.3, "energy": 0.3, "speaking_rate": 0.3, "prosody_score": 0.3}

def analyze_text_urgency(text: str) -> float:
    if not text:
        return 0.2

    t_lower = text.lower()
    
    # Keyword density check
    kw_count = sum(1 for kw in URGENCY_KEYWORDS if re.search(r'\b' + kw + r'\b', t_lower))
    kw_score = min(1.0, kw_count * 0.4)

    # Exclamation mark check
    exclamation_score = 0.3 if "!" in text else 0.0

    # VADER sentiment score (negative sentiment / high intensity often correlates with high urgency)
    vs = vader_analyzer.polarity_scores(text)
    neg_score = vs["neg"]
    compound = abs(vs["compound"])

    text_urgency = max(kw_score, 0.4 * kw_score + 0.3 * exclamation_score + 0.3 * (neg_score + compound / 2))
    return round(min(1.0, text_urgency), 3)

def compute_fused_urgency(audio_path: str = None, text: str = "") -> dict:
    has_audio = audio_path and os.path.exists(audio_path)
    prosody_metrics = analyze_audio_prosody(audio_path) if has_audio else {"pitch_var": 0.3, "energy": 0.3, "speaking_rate": 0.3, "prosody_score": 0.3}
    text_urgency = analyze_text_urgency(text)

    # Fused Urgency Index = 0.5 * prosodic + 0.5 * text (or text_urgency if text-only input)
    if has_audio:
        fused_score = round((0.5 * prosody_metrics["prosody_score"]) + (0.5 * text_urgency), 3)
    else:
        fused_score = text_urgency

    tone = "concise" if fused_score >= 0.65 else "standard"

    return {
        "pitch_variance": prosody_metrics["pitch_var"],
        "energy": prosody_metrics["energy"],
        "speaking_rate": prosody_metrics["speaking_rate"],
        "text_urgency": text_urgency,
        "urgency_score": fused_score,
        "recommended_tone": tone
    }
