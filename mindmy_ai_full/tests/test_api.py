from fastapi.testclient import TestClient
from mindmy_api.main import app

def test_echo():
    client = TestClient(app)
    res = client.post("/api/v1/chat", json={"messages":[{"role":"user","content":"ping"}]})
    assert res.status_code==200
    assert res.json()["reply"]=="ping"
