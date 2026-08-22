import pytest
from app.services.fallback_parser import parse_fallback_intent

def test_unclear_input_confidence_threshold():
    res = parse_fallback_intent("asdfghjkl random noise")
    # Low confidence or unknown intent
    assert res["confidence"] < 0.65 or res["intent"] == "UNKNOWN"
