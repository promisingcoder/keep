import os
import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool

from keep.api.core.db import get_session
from keep.identitymanager.authenticatedentity import AuthenticatedEntity

# Test database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(name="engine")
def engine_fixture():
    """Create a new database engine for each test."""
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    return engine

@pytest.fixture(name="session")
def session_fixture(engine):
    """Create a new database session for each test."""
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client_session")
def client_session_fixture(session):
    """Override the get_session dependency for testing."""
    def get_session_override():
        return session
    return get_session_override

@pytest.fixture(name="auth_entity")
def auth_entity_fixture():
    """Create a test authenticated entity."""
    return AuthenticatedEntity(
        tenant_id="test-tenant",
        email="test@example.com",
        permissions=["read:topology", "write:topology"],
    )

@pytest.fixture(name="auth_verifier")
def auth_verifier_fixture(auth_entity):
    """Override the auth verifier for testing."""
    def get_auth_verifier_override():
        return lambda: auth_entity
    return get_auth_verifier_override 