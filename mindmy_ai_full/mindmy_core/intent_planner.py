import json
from typing import List
from pydantic import BaseModel
from loguru import logger
from openai import AsyncOpenAI
from .context_engine import Message

class Intent(BaseModel):
    name: str
    arguments: dict

class IntentPlanner:
    def __init__(self, client: AsyncOpenAI, model: str = "gpt-4o"):
        self._client = client
        self._model = model

    async def plan(self, dialog: List[Message], user_id: str) -> Intent:
        sys_prompt = "Output JSON with keys name and arguments describing the user's next intent."
        logger.debug("IntentPlanner planning for {}", user_id)
        response = await self._client.chat.completions.create(
            model=self._model,
            temperature=0.0,
            messages=[m.model_dump() for m in dialog] + [{"role": "system", "content": sys_prompt}],
        )
        content = response.choices[0].message.content
        try:
            data = json.loads(content)
            return Intent(name=data.get("name", "unknown"), arguments=data.get("arguments", {}))
        except Exception:
            logger.warning("Failed to parse planner output: {}", content)
            return Intent(name="unknown", arguments={})
