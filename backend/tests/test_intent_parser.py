import pytest
from app.services.fallback_parser import parse_fallback_intent

def test_english_add_intent():
    res = parse_fallback_intent("add 2 liters of milk to my list")
    assert res["intent"] == "ADD_ITEM"
    assert "Milk" in res["item_name"]
    assert res["quantity"] == 2.0
    assert res["unit"] == "liter" or res["unit"] == "liters"

def test_hinglish_code_switched_add_intent():
    res = parse_fallback_intent("do packet Maggi add karo")
    assert res["intent"] == "ADD_ITEM"
    assert "Maggi" in res["item_name"]
    assert res["quantity"] == 2.0
    assert res["unit"] == "packet" or res["unit"] == "packets"

def test_hinglish_remove_intent():
    res = parse_fallback_intent("milk 1 liter nikal do")
    assert res["intent"] == "REMOVE_ITEM"
    assert "Milk" in res["item_name"]
    assert res["quantity"] == 1.0

def test_clear_list_intent():
    res = parse_fallback_intent("saare item hatao")
    assert res["intent"] == "CLEAR_LIST"
