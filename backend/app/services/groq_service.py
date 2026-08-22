import json
import logging
from app.core.config import settings

logger = logging.getLogger("groq_service")

class GroqIntentParser:
    def __init__(self):
        self.client = None
        if settings.GROQ_API_KEY:
            try:
                from groq import Groq
                self.client = Groq(api_key=settings.GROQ_API_KEY)
            except Exception as e:
                logger.warning(f"Could not initialize Groq client: {e}")

    def parse_intent(self, text: str):
        if not self.client or not text:
            return None
        
        system_prompt = (
            "You are a voice shopping intent and slot parser. "
            "Examine the user's transcript (which may be in English or Hinglish/Hindi like 'do packet Maggi add karo') "
            "and extract structured JSON with keys:\n"
            "- intent: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_LIST, SEARCH, UNKNOWN\n"
            "- item_name: string (e.g. 'Maggi', 'milk', 'Aashirvaad Atta')\n"
            "- quantity: float (e.g. 2.0, default 1.0)\n"
            "- unit: string (e.g. 'packet', 'liter', 'kg', 'item')\n"
            "- confidence: float between 0.0 and 1.0\n"
            "Output ONLY valid raw JSON with no markdown block markers."
        )

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=200
            )

            raw_content = response.choices[0].message.content.strip()
            # Clean markdown code blocks if returned
            if raw_content.startswith("```"):
                raw_content = raw_content.split("\n", 1)[1]
                if raw_content.endswith("```"):
                    raw_content = raw_content.rsplit("```", 1)[0]
                raw_content = raw_content.strip()

            parsed = json.loads(raw_content)
            return parsed
        except Exception as e:
            logger.error(f"Groq API parsing failed: {e}")
            return None

groq_parser = GroqIntentParser()
