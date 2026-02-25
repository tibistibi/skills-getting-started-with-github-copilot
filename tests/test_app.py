"""Tests for the FastAPI application using AAA (Arrange-Act-Assert).
"""


def test_get_activities(client):
    # Arrange: nothing special (client is ready with default activities)
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data


def test_signup_and_duplicate(client):
    # Arrange
    email = "new@mergington.edu"
    activity = "Chess Club"

    # Act - first signup
    r1 = client.post(f"/activities/{activity}/signup", params={"email": email})
    # Assert first signup succeeded
    assert r1.status_code == 200
    assert email in client.get("/activities").json()[activity]["participants"]

    # Act - duplicate signup
    r2 = client.post(f"/activities/{activity}/signup", params={"email": email})
    # Assert duplicate rejected
    assert r2.status_code == 400


def test_signup_nonexistent(client):
    # Arrange
    email = "foo@bar.com"

    # Act
    r = client.post("/activities/Nope/signup", params={"email": email})

    # Assert
    assert r.status_code == 404


def test_unregister_flow(client):
    # Arrange
    email = "john@mergington.edu"
    activity = "Gym Class"

    # Act - unregister existing
    r1 = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    # Assert removal succeeded
    assert r1.status_code == 200
    assert email not in client.get("/activities").json()[activity]["participants"]

    # Act - try again
    r2 = client.delete(f"/activities/{activity}/unregister", params={"email": email})
    # Assert second removal fails
    assert r2.status_code == 400


def test_unregister_nonexistent_activity(client):
    # Arrange
    email = "x@y.com"

    # Act
    r = client.delete("/activities/Nope/unregister", params={"email": email})

    # Assert
    assert r.status_code == 404
