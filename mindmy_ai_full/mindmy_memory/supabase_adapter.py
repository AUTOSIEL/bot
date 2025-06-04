import os
from typing import Any, Dict, Optional
from loguru import logger

class SupabaseAdapter:
    def __init__(self) -> None:
        # Lazy import to avoid heavy dependency during tests
        try:
            from supabase import create_client
            url = os.getenv("SUPABASE_URL", "")
            key = os.getenv("SUPABASE_SERVICE_KEY", "")
            self._conn = create_client(url, key).table("dna_profile")
        except ModuleNotFoundError:
            self._conn = None  # stub in tests

    async def fetch_user_dna(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self._conn is None:
            return None
        res = await self._conn.select("*").eq("user_id", user_id).single().execute()
        return res.data if res and res.data else None

    async def upsert_user_dna(self, row: Dict[str, Any]) -> None:
        if self._conn is None:
            return
        await self._conn.upsert(row, on_conflict="user_id").execute()
        logger.debug("Supabase upsert for {}", row["user_id"])
