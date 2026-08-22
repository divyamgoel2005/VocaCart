import pytest
from app.services.emotion_service import analyze_text_urgency, compute_fused_urgency

def test_high_urgency_text():
    score = analyze_text_urgency("Add 2 packets Maggi right now urgent jaldi!")
    assert score >= 0.65

def test_normal_urgency_text():
    score = analyze_text_urgency("could you please add some apples when convenient")
    assert score < 0.65

def test_fused_urgency_computation():
    res = compute_fused_urgency(audio_path=None, text="urgent help needed asap")
    assert "urgency_score" in res
    assert res["recommended_tone"] == "concise"
