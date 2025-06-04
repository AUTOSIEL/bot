# MindMy AI

MindMy AI — cognitive operating system (second brain).  
Generated: 2025-06-03T16:01:35.538148 UTC

## Quick start (dev)

```bash
poetry install
cp .env.example .env
uvicorn mindmy_api.main:app --reload
python -m mindmy_tg.bot
```

Tests:

```bash
poetry run pytest
```
