import pytest
from mindmy_core.context_engine import ContextEngine, Message
from mindmy_core.dna_engine import DNAEngine, DNAProfile

class DummyDNA(DNAEngine):
    async def load(self, user_id):  # type: ignore[override]
        return DNAProfile(user_id=user_id, system_prompt="SYS")

@pytest.mark.asyncio
async def test_truncate():
    ce = ContextEngine(DummyDNA(None))  # type: ignore[arg-type]
    dialog=[Message("user","one two three four five six seven eight nine ten")]
    res = await ce.build(dialog,"u1")
    assert res[0]["role"]=="system"
    assert any(msg["role"]=="user" for msg in res)
