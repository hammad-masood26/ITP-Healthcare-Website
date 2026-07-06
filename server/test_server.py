import pytest
import json
from unittest.mock import patch, MagicMock

@pytest.fixture
def client():
    # Mock firebase setup before importing server
    with patch('firebase_admin.initialize_app'), patch('firebase_admin.credentials.Certificate'), patch('firebase_admin.firestore.client'):
        from server import app
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

def test_health_check(client):
    """Test the /health endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert 'timestamp' in data
