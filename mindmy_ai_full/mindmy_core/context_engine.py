from typing import List, Literal, Sequence
from datetime import datetime
from loguru import logger
from .security_guard import SecurityGuard
from .dna_engine import DNAEngine

class Message:
    def __init__(self, role: Literal["user", "assistant", "system"], content: str, timestamp: datetime | None = None):
        self.role = role
        self.content = content
        self.timestamp = timestamp or datetime.utcnow()

    def model_dump(self):
        return {"role": self.role, "content": self.content}

class ContextEngine:
    def __init__(self, dna_engine: DNAEngine, *, max_tokens: int = 4096):
        self._dna_engine = dna_engine
        self._max_tokens = max_tokens

    async def build(self, dialog: Sequence[Message], user_id: str) -> List[dict]:
        dna = await self._dna_engine.load(user_id)
        messages: List[dict] = [{"role": "system", "content": dna.system_prompt}]
        for m in dialog[-20:]:
            messages.append({"role": m.role, "content": SecurityGuard.sanitize(m.content)})
        return self._truncate(messages)

    def _truncate(self, msgs: List[dict]) -> List[dict]:
        tokens = lambda m: len(m["content"].split())
        while sum(tokens(m) for m in msgs) > self._max_tokens and len(msgs) > 1:
            msgs.pop(1)
        return msgs
