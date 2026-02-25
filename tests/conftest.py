import copy
import pytest
from fastapi.testclient import TestClient
from src import app


@pytest.fixture

def client():
    """Provide a TestClient pointing at the FastAPI app."""
    return TestClient(app.app)


@pytest.fixture(autouse=True)
def reset_activities():
    """Restore the activities dictionary before/after each test (AAA: Arrange)."""
    original = copy.deepcopy(app.activities)
    yield
    app.activities.clear()
    app.activities.update(original)
