from typing import Dict
from pydantic import BaseModel, Field
from mindmy_memory.supabase_adapter import SupabaseAdapter

class DNAProfile(BaseModel):
    user_id: str
    system_prompt: str = Field(default="You are MindMy AI — a cognitive OS.")
    preferences: Dict[str, str] = Field(default_factory=dict)

class DNAEngine:
    def __init__(self, db: SupabaseAdapter):
        self._db = db

    async def load(self, user_id: str) -> DNAProfile:
        row = await self._db.fetch_user_dna(user_id)
        if row:
            return DNAProfile(**row)
        profile = DNAProfile(user_id=user_id)
        await self.save(profile)
        return profile

    async def save(self, profile: DNAProfile) -> None:
        await self._db.upsert_user_dna(profile.dict())
