from mindmy_core.security_guard import SecurityGuard
def test_redact():
    assert "[REDACTED]" in SecurityGuard.sanitize("OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef")
