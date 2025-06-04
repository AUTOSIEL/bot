from typing import List, Optional
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from loguru import logger

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
ALG = "HS256"

def verify_token(creds: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[str]:
    if not creds:
        return None
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[ALG])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

app = FastAPI(title="MindMy AI API", version="1.0.0")

@app.get("/api/healthz")
async def health():
    return {"status": "ok"}

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, user_id: Optional[str] = Depends(verify_token)):
    last_user = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    logger.info("Chat from %s: %s", user_id or "anon", last_user[:80])
    return ChatResponse(reply=last_user)
