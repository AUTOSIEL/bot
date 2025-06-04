import re
from pathlib import Path

_PATH = Path(__file__).parent.parent / "knowledge_vault" / "security_block.txt"

_PATTERNS = [
    re.compile(r"OPENAI_API_KEY", re.I),
    re.compile(r"sk-[a-z0-9]{32,}", re.I),
]

class SecurityGuard:
    @staticmethod
    def sanitize(text: str) -> str:
        for p in _PATTERNS:
            text = p.sub("[REDACTED]", text)
        return text

    @staticmethod
    def check_policy(text: str) -> None:
        if not _PATH.exists():
            return
        blocked = {l.strip() for l in _PATH.read_text(encoding="utf-8").splitlines() if l}
        lowered = text.lower()
        if any(w in lowered for w in blocked):
            raise ValueError("Security violation detected")
