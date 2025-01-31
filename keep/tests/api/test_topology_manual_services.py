import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from keep.api.core.db import get_session
from keep.api.models.db.topology import TopologyService, TopologyServiceDependency
from keep.api.routes.topology import router
from keep.identitymanager.authenticatedentity import AuthenticatedEntity
from keep.identitymanager.identitymanagerfactory import IdentityManagerFactory

@pytest.fixture
def client(client_session, auth_verifier):
    """Create a test client with the necessary dependencies overridden."""
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router)

    # Override dependencies
    app.dependency_overrides[get_session] = client_session
    app.dependency_overrides[IdentityManagerFactory.get_auth_verifier] = auth_verifier

    return TestClient(app)

def test_create_manual_service(client, session, auth_entity):
    """Test creating a manual service"""
    service_data = {
        "service": "test-service",
        "display_name": "Test Service",
        "description": "A test service",
        "team": "Test Team",
        "email": "team@example.com",
        "slack": "#test-channel",
        "environment": "production"
    }

    response = client.post("/services", json=service_data)
    assert response.status_code == 200
    
    created_service = response.json()
    assert created_service["service"] == service_data["service"]
    assert created_service["display_name"] == service_data["display_name"]
    assert created_service["is_manual"] is True
    assert created_service["created_by"] == auth_entity.email
    assert created_service["is_editable"] is True

def test_update_manual_service(client, session):
    """Test updating a manual service"""
    # First create a service
    service = TopologyService(
        tenant_id="test-tenant",
        service="test-service",
        display_name="Test Service",
        is_manual=True,
        created_by="test@example.com",
        is_editable=True
    )
    session.add(service)
    session.commit()

    # Update the service
    update_data = {
        "display_name": "Updated Service",
        "description": "Updated description",
        "team": "New Team"
    }

    response = client.put(f"/services/{service.id}", json=update_data)
    assert response.status_code == 200
    
    updated_service = response.json()
    assert updated_service["display_name"] == update_data["display_name"]
    assert updated_service["description"] == update_data["description"]
    assert updated_service["team"] == update_data["team"]

def test_delete_manual_service(client, session):
    """Test deleting a manual service"""
    service = TopologyService(
        tenant_id="test-tenant",
        service="test-service",
        display_name="Test Service",
        is_manual=True,
        created_by="test@example.com",
        is_editable=True
    )
    session.add(service)
    session.commit()

    response = client.delete(f"/services/{service.id}")
    assert response.status_code == 200

    # Verify service is deleted
    deleted_service = session.get(TopologyService, service.id)
    assert deleted_service is None

def test_create_dependency(client, session):
    """Test creating a dependency between services"""
    # Create two services
    service1 = TopologyService(
        tenant_id="test-tenant",
        service="service-1",
        display_name="Service 1",
        is_manual=True,
        created_by="test@example.com",
        is_editable=True
    )
    service2 = TopologyService(
        tenant_id="test-tenant",
        service="service-2",
        display_name="Service 2",
        is_manual=True,
        created_by="test@example.com",
        is_editable=True
    )
    session.add_all([service1, service2])
    session.commit()

    response = client.post(
        f"/services/{service1.id}/dependencies/{service2.id}",
        params={"protocol": "http"}
    )
    assert response.status_code == 200

    # Verify dependency is created
    dependency = session.query(TopologyServiceDependency).first()
    assert dependency is not None
    assert dependency.service_id == service1.id
    assert dependency.depends_on_service_id == service2.id
    assert dependency.protocol == "http"

def test_delete_dependency(client, session):
    """Test deleting a dependency between services"""
    # Create two services and a dependency
    service1 = TopologyService(
        tenant_id="test-tenant",
        service="service-1",
        display_name="Service 1",
        is_manual=True,
        created_by="test@example.com",
        is_editable=True
    )
    service2 = TopologyService(
        tenant_id="test-tenant",
        service="service-2",
        display_name="Service 2",
        is_manual=True,
        created_by="test@example.com",
        is_editable=True
    )
    session.add_all([service1, service2])
    session.commit()

    dependency = TopologyServiceDependency(
        service_id=service1.id,
        depends_on_service_id=service2.id,
        protocol="http"
    )
    session.add(dependency)
    session.commit()

    response = client.delete(f"/services/{service1.id}/dependencies/{service2.id}")
    assert response.status_code == 200

    # Verify dependency is deleted
    deleted_dependency = session.get(TopologyServiceDependency, dependency.id)
    assert deleted_dependency is None

def test_cannot_edit_provider_service(client, session):
    """Test that provider-sourced services cannot be edited"""
    service = TopologyService(
        tenant_id="test-tenant",
        service="provider-service",
        display_name="Provider Service",
        is_manual=False,
        source_provider_id="test-provider",
        is_editable=False
    )
    session.add(service)
    session.commit()

    update_data = {
        "display_name": "Updated Service"
    }

    response = client.put(f"/services/{service.id}", json=update_data)
    assert response.status_code == 400  # Should fail with bad request

def test_cannot_delete_provider_service(client, session):
    """Test that provider-sourced services cannot be deleted"""
    service = TopologyService(
        tenant_id="test-tenant",
        service="provider-service",
        display_name="Provider Service",
        is_manual=False,
        source_provider_id="test-provider",
        is_editable=False
    )
    session.add(service)
    session.commit()

    response = client.delete(f"/services/{service.id}")
    assert response.status_code == 400  # Should fail with bad request 